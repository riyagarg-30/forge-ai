import { supabaseAdmin } from '../../config/supabaseAdmin.js'
import { AGENT_META } from '../../constants/agents.js'
import { executeAgent } from '../agents/index.js'
import { AGENT_DEPENDENCIES } from './dependencyGraph.js'
import { createProfiler, runWithProfiler, profileAsync, summarize } from '../agents/lib/profiler.js'

const MAX_ATTEMPTS = 2 // 1 initial attempt + 1 retry on failure

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
 *
 * On success/failure it returns an in-memory row (spread from the row it was
 * given, with the new fields applied) rather than re-selecting the row it
 * just wrote — the completed row is persisted for the frontend, but the
 * pipeline never needs to read it back to feed downstream agents.
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
    await profileAsync('db', `mark-running:${agentKey}`, () =>
      supabaseAdmin
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
    )

    try {
      const result = await profileAsync('agent', agentKey, () => executeAgent(agentKey, context))

      const { error: updateError } = await profileAsync('db', `mark-completed:${agentKey}`, () =>
        supabaseAdmin
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
      )

      if (updateError) throw updateError

      // Synthesize the updated row locally instead of reading it back — the
      // only fields downstream agents consume are `status` and `result`.
      return {
        ...resultRow,
        status: 'completed',
        result,
        progress_phase: 'completed',
        progress_message: `${meta?.name || agentKey} completed.`,
        error_message: null,
      }
    } catch (err) {
      lastError = err
      console.error(`[pipeline] ${agentKey} attempt ${attempt}/${MAX_ATTEMPTS} failed:`, err.message)
    }
  }

  await profileAsync('db', `mark-failed:${agentKey}`, () =>
    supabaseAdmin
      .from('agent_results')
      .update({
        status: 'failed',
        error_message: lastError?.message || 'Agent execution failed.',
        completed_at: new Date().toISOString(),
        progress_phase: 'failed',
        progress_message: `${meta?.name || agentKey} failed after ${MAX_ATTEMPTS} attempts.`,
      })
      .eq('id', resultRow.id)
  )

  return {
    ...resultRow,
    status: 'failed',
    error_message: lastError?.message || 'Agent execution failed.',
    progress_phase: 'failed',
  }
}

/**
 * Runs the full agent pipeline for a session using a dependency-driven
 * scheduler: each agent starts the instant ITS OWN declared dependencies
 * finish, rather than waiting for a whole "stage" to complete. This removes
 * the stage barrier that previously made finance/product wait on legal even
 * though they don't depend on it.
 *
 * Each completed agent is persisted immediately (so the polling frontend sees
 * per-agent progress in real time). A failed agent is retried once, then
 * marked failed without blocking the rest of the pipeline — downstream agents
 * simply reason with whatever completed.
 *
 * `preloaded` (optional): `{ session, agentRows }` handed in by the controller
 * that just created them, so the pipeline can skip re-fetching both. Falls
 * back to loading them if not provided.
 */
export async function runPipeline(sessionId, preloaded = null) {
  const profiler = createProfiler(`session:${sessionId}`)

  return runWithProfiler(profiler, async () => {
    let session = preloaded?.session
    if (!session) {
      const { data, error } = await profileAsync('db', 'load-session', () =>
        supabaseAdmin.from('analysis_sessions').select('*').eq('id', sessionId).single()
      )
      if (error || !data) {
        throw new Error(`Session ${sessionId} not found for pipeline execution.`)
      }
      session = data
    }

    await profileAsync('db', 'status-running', () =>
      supabaseAdmin.from('analysis_sessions').update({ status: 'running' }).eq('id', sessionId)
    )

    const resultsMap = {}
    let rows = preloaded?.agentRows
    if (!rows) {
      const { data, error } = await profileAsync('db', 'load-agent-rows', () =>
        supabaseAdmin.from('agent_results').select('*').eq('session_id', sessionId)
      )
      if (error) throw error
      rows = data || []
    }
    for (const row of rows) resultsMap[row.agent_key] = row

    // Dependency-driven scheduling. `launch(agentKey)` is memoized so shared
    // dependencies (e.g. research/market) run exactly once; each agent awaits
    // only its own dependencies before executing. The dependency graph is a
    // static, acyclic constant, so no cycle guard is needed here.
    const launched = {}
    const launch = (agentKey) => {
      if (launched[agentKey]) return launched[agentKey]
      const deps = AGENT_DEPENDENCIES[agentKey] || []
      launched[agentKey] = (async () => {
        await Promise.all(deps.map((dep) => launch(dep)))
        const row = resultsMap[agentKey]
        if (!row) return null
        const updated = await runSingleAgent(session, agentKey, row, resultsMap)
        if (updated) resultsMap[agentKey] = updated
        return updated
      })()
      return launched[agentKey]
    }

    await Promise.allSettled(Object.keys(AGENT_DEPENDENCIES).map((key) => launch(key)))

    const finalStatus = resultsMap.ceo?.status === 'completed' ? 'completed' : 'failed'
    await profileAsync('db', 'status-final', () =>
      supabaseAdmin.from('analysis_sessions').update({ status: finalStatus }).eq('id', sessionId)
    )

    console.log(summarize(profiler))

    return resultsMap
  })
}
