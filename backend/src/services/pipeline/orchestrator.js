import { supabaseAdmin } from '../../config/supabaseAdmin.js'
import { AGENT_META } from '../../constants/agents.js'
import { executeAgent } from '../agents/index.js'
import { getExecutionStages } from './dependencyGraph.js'
import { classifyStartupType } from '../buildStudio/classifyStartupType.js'

const MAX_ATTEMPTS = 2 // 1 initial attempt + 1 retry on failure

async function loadResultRows(sessionId) {
  const { data, error } = await supabaseAdmin
    .from('agent_results')
    .select('*')
    .eq('session_id', sessionId)

  if (error) throw error

  const map = {}
  for (const row of data || []) map[row.agent_key] = row
  return map
}

function buildPriorResults(resultsMap) {
  const priorResults = {}
  for (const [agentKey, row] of Object.entries(resultsMap)) {
    if (row?.status === 'completed' && row.result) {
      priorResults[agentKey] = row.result
    }
  }
  return priorResults
}

/**
 * Executes one agent, persisting real status/progress transitions as it
 * goes. Never throws — on repeated failure it marks the row 'failed' and
 * returns it, so the pipeline can continue with whatever succeeded.
 */
async function runSingleAgent(session, agentKey, resultRow, resultsMap) {
  const meta = AGENT_META[agentKey]
  const context = {
    ideaText: session.idea_text,
    businessDetails: session.business_details || {},
    startupName: session.startup_name || session.business_details?.startupName || 'Your Startup',
    priorResults: buildPriorResults(resultsMap),
  }

  let lastError = null

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    await supabaseAdmin
      .from('agent_results')
      .update({
        status: 'running',
        started_at: new Date().toISOString(),
        error_message: null,
        progress_phase: 'running',
        progress_message:
          attempt === 1
            ? `${meta?.name || agentKey} is running…`
            : `${meta?.name || agentKey} is retrying (attempt ${attempt} of ${MAX_ATTEMPTS})…`,
      })
      .eq('id', resultRow.id)

    try {
      const result = await executeAgent(agentKey, context)

      const { data: updated, error: updateError } = await supabaseAdmin
        .from('agent_results')
        .update({
          status: 'completed',
          result,
          completed_at: new Date().toISOString(),
          progress_phase: 'completed',
          progress_message: `${meta?.name || agentKey} completed.`,
          error_message: null,
        })
        .eq('id', resultRow.id)
        .select()
        .single()

      if (updateError) throw updateError
      return updated
    } catch (err) {
      lastError = err
      console.error(`[pipeline] ${agentKey} attempt ${attempt}/${MAX_ATTEMPTS} failed:`, err.message)
    }
  }

  const { data: failed } = await supabaseAdmin
    .from('agent_results')
    .update({
      status: 'failed',
      error_message: lastError?.message || 'Agent execution failed.',
      completed_at: new Date().toISOString(),
      progress_phase: 'failed',
      progress_message: `${meta?.name || agentKey} failed after ${MAX_ATTEMPTS} attempts.`,
    })
    .eq('id', resultRow.id)
    .select()
    .single()

  return failed || resultRow
}

/**
 * Runs the full agent pipeline for a session, stage by stage, entirely on
 * the backend. Each stage's agents run concurrently; a failed agent is
 * retried once, then marked failed without blocking the rest of the
 * pipeline — downstream agents simply reason with whatever completed.
 */
export async function runPipeline(sessionId) {
  const { data: session, error: sessionError } = await supabaseAdmin
    .from('analysis_sessions')
    .select('*')
    .eq('id', sessionId)
    .single()

  if (sessionError || !session) {
    throw new Error(`Session ${sessionId} not found for pipeline execution.`)
  }

  await supabaseAdmin.from('analysis_sessions').update({ status: 'running' }).eq('id', sessionId)

  const resultsMap = await loadResultRows(sessionId)
  const stages = getExecutionStages()

  for (const stage of stages) {
    const runnable = stage.filter((agentKey) => resultsMap[agentKey])
    const outcomes = await Promise.allSettled(
      runnable.map((agentKey) => runSingleAgent(session, agentKey, resultsMap[agentKey], resultsMap))
    )

    outcomes.forEach((outcome, index) => {
      const agentKey = runnable[index]
      if (outcome.status === 'fulfilled' && outcome.value) {
        resultsMap[agentKey] = outcome.value
      }
    })
  }

  const finalStatus = resultsMap.ceo?.status === 'completed' ? 'completed' : 'failed'
  await supabaseAdmin.from('analysis_sessions').update({ status: finalStatus }).eq('id', sessionId)

  await maybeUnlockBuildStudio(session, resultsMap)

  return resultsMap
}

/**
 * Once the CEO Agent issues its verdict, decide — automatically, with no
 * user input — whether Build Studio should unlock, and if so, whether this
 * is a software or physical-product startup. Runs only on a "Build"
 * verdict; any other verdict leaves Build Studio locked.
 */
async function maybeUnlockBuildStudio(session, resultsMap) {
  const ceoResult = resultsMap.ceo?.status === 'completed' ? resultsMap.ceo.result : null
  if (!ceoResult || ceoResult.verdict !== 'Build') return

  try {
    const priorResults = buildPriorResults(resultsMap)
    const { startupType, reasoning } = await classifyStartupType({
      startupName: session.startup_name || session.business_details?.startupName || 'Your Startup',
      ideaText: session.idea_text,
      businessDetails: session.business_details || {},
      priorResults,
      ceoResult,
    })

    await supabaseAdmin
      .from('analysis_sessions')
      .update({
        startup_type: startupType,
        startup_type_reasoning: reasoning,
        build_studio_status: 'available',
      })
      .eq('id', session.id)
  } catch (err) {
    console.error(`[buildStudio] classification failed for session ${session.id}:`, err.message)
    // Leave build_studio_status as 'locked' — the user can still see the
    // report; Build Studio simply won't appear until this is resolved.
  }
}
