import { supabaseAdmin } from '../config/supabaseAdmin.js'
import {
  AGENT_KEYS,
  PARALLEL_AGENT_KEYS,
  AGENT_META,
} from '../constants/agents.js'
import { executeAgent } from '../services/agents/index.js'
import { runWithProgress } from '../services/agents/agentProgress.js'

async function getSessionForUser(sessionId, userId) {
  const { data, error } = await supabaseAdmin
    .from('analysis_sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('user_id', userId)
    .single()

  if (error || !data) return null
  return data
}

async function getAgentResults(sessionId) {
  const { data, error } = await supabaseAdmin
    .from('agent_results')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data || []
}

async function getPriorResultsMap(sessionId) {
  const results = await getAgentResults(sessionId)
  const map = {}
  for (const row of results) {
    if (row.status === 'completed' && row.result) {
      map[row.agent_key] = row.result
    }
  }
  return map
}

function buildAgentContext(session, priorResults = {}) {
  return {
    ideaText: session.idea_text,
    businessDetails: session.business_details || {},
    startupName: session.startup_name || session.business_details?.startupName || 'Your Startup',
    priorResults,
  }
}

async function executeAndStoreAgent(session, agentKey, existingResult) {
  const priorResults = await getPriorResultsMap(session.id)
  const context = buildAgentContext(session, priorResults)

  await supabaseAdmin
    .from('analysis_sessions')
    .update({ status: 'running' })
    .eq('id', session.id)

  const startedAt = new Date().toISOString()

  await supabaseAdmin
    .from('agent_results')
    .update({
      status: 'running',
      started_at: startedAt,
      error_message: null,
      progress_phase: 'thinking',
      progress_message: `${AGENT_META[agentKey]?.name || agentKey} is starting…`,
    })
    .eq('id', existingResult.id)

  const result = await runWithProgress(existingResult.id, agentKey, () =>
    executeAgent(agentKey, context)
  )

  const completedAt = new Date().toISOString()

  const { data: updatedResult, error: updateError } = await supabaseAdmin
    .from('agent_results')
    .update({
      status: 'completed',
      result,
      completed_at: completedAt,
      progress_phase: 'completed',
      progress_message: `${AGENT_META[agentKey]?.name || agentKey} completed analysis.`,
    })
    .eq('id', existingResult.id)
    .select()
    .single()

  if (updateError) throw updateError
  return updatedResult
}

function validateBusinessDetails(details) {
  const required = [
    'startupName',
    'industry',
    'country',
    'targetRegion',
    'businessModel',
    'targetAudience',
    'startupStage',
    'budget',
    'teamSize',
    'timeline',
    'revenueModel',
  ]

  for (const field of required) {
    if (!details[field] || String(details[field]).trim().length === 0) {
      return { valid: false, field }
    }
  }

  return { valid: true }
}

/** POST /api/analyze */
export async function analyze(req, res) {
  try {
    const { ideaText, businessDetails } = req.body || {}

    if (typeof ideaText !== 'string' || ideaText.trim().length < 10) {
      return res.status(400).json({ message: 'ideaText is required and must be at least 10 characters.' })
    }

    if (!businessDetails || typeof businessDetails !== 'object') {
      return res.status(400).json({ message: 'businessDetails is required.' })
    }

    const validation = validateBusinessDetails(businessDetails)
    if (!validation.valid) {
      return res.status(400).json({ message: `Missing required field: ${validation.field}` })
    }

    const { data: session, error: sessionError } = await supabaseAdmin
      .from('analysis_sessions')
      .insert({
        user_id: req.user.id,
        idea_text: ideaText.trim(),
        startup_name: businessDetails.startupName.trim(),
        business_details: businessDetails,
        status: 'pending',
      })
      .select()
      .single()

    if (sessionError) {
      console.error('analyze session error:', sessionError)
      return res.status(500).json({ message: 'Failed to create analysis session.' })
    }

    const agentRows = AGENT_KEYS.map((agentKey) => ({
      session_id: session.id,
      agent_key: agentKey,
      status: 'pending',
    }))

    const { error: agentsError } = await supabaseAdmin.from('agent_results').insert(agentRows)

    if (agentsError) {
      console.error('analyze agents error:', agentsError)
      await supabaseAdmin.from('analysis_sessions').delete().eq('id', session.id)
      return res.status(500).json({ message: 'Failed to initialize agent pipeline.' })
    }

    return res.status(201).json({ session })
  } catch (err) {
    console.error('analyze error:', err)
    return res.status(500).json({ message: 'Failed to start analysis.' })
  }
}

/** POST /api/agents/:agentKey */
export async function runAgentByKey(req, res) {
  try {
    const { agentKey } = req.params
    const { sessionId } = req.body || {}

    if (!AGENT_KEYS.includes(agentKey)) {
      return res.status(400).json({ message: `Invalid agent key. Must be one of: ${AGENT_KEYS.join(', ')}` })
    }

    if (!sessionId) {
      return res.status(400).json({ message: 'sessionId is required in request body.' })
    }

    const session = await getSessionForUser(sessionId, req.user.id)
    if (!session) {
      return res.status(404).json({ message: 'Analysis session not found.' })
    }

    const { data: existingResult, error: fetchError } = await supabaseAdmin
      .from('agent_results')
      .select('*')
      .eq('session_id', sessionId)
      .eq('agent_key', agentKey)
      .single()

    if (fetchError || !existingResult) {
      return res.status(404).json({ message: 'Agent result record not found.' })
    }

    if (existingResult.status === 'completed') {
      return res.status(200).json({ agentResult: existingResult })
    }

    if (existingResult.status === 'running') {
      return res.status(200).json({ agentResult: existingResult })
    }

    // Parallel agents can run without dependencies
    if (!PARALLEL_AGENT_KEYS.includes(agentKey)) {
      const priorResults = await getAgentResults(sessionId)
      const priorMap = Object.fromEntries(priorResults.map((r) => [r.agent_key, r]))

      if (agentKey === 'debate') {
        const incomplete = PARALLEL_AGENT_KEYS.filter((k) => priorMap[k]?.status !== 'completed')
        if (incomplete.length > 0) {
          return res.status(400).json({
            message: `All parallel agents must complete before debate. Waiting on: ${incomplete.join(', ')}`,
          })
        }
      }

      if (agentKey === 'ceo') {
        if (priorMap.debate?.status !== 'completed') {
          return res.status(400).json({ message: 'Debate must complete before CEO review.' })
        }
      }
    }

    try {
      const updatedResult = await executeAndStoreAgent(session, agentKey, existingResult)

      if (agentKey === 'ceo') {
        await supabaseAdmin
          .from('analysis_sessions')
          .update({ status: 'completed' })
          .eq('id', sessionId)
      }

      return res.status(200).json({ agentResult: updatedResult })
    } catch (agentErr) {
      console.error(`Agent ${agentKey} execution error:`, agentErr)

      await supabaseAdmin
        .from('agent_results')
        .update({
          status: 'failed',
          error_message: agentErr.message || 'Agent execution failed.',
          completed_at: new Date().toISOString(),
        })
        .eq('id', existingResult.id)

      await supabaseAdmin
        .from('analysis_sessions')
        .update({ status: 'failed' })
        .eq('id', sessionId)

      return res.status(500).json({ message: `Agent "${agentKey}" failed to execute.` })
    }
  } catch (err) {
    console.error('runAgentByKey error:', err)
    return res.status(500).json({ message: 'Failed to run agent.' })
  }
}

/** GET /api/report/:id */
export async function getReport(req, res) {
  try {
    const { id } = req.params
    const session = await getSessionForUser(id, req.user.id)

    if (!session) {
      return res.status(404).json({ message: 'Analysis session not found.' })
    }

    const agentResults = await getAgentResults(id)
    const resultsMap = {}
    for (const row of agentResults) {
      resultsMap[row.agent_key] = row
    }

    const ceoResult = resultsMap.ceo?.result
    const domainScores = ceoResult?.domainScores || null
    const overallScore = ceoResult?.overallReadinessScore || ceoResult?.startupReadinessScore || null

    return res.status(200).json({
      session,
      agentResults,
      report: {
        domainScores,
        overallScore,
        decision: ceoResult?.decision || null,
        executiveSummary: ceoResult?.executiveSummary || null,
        executionRoadmap: ceoResult?.executionRoadmap || null,
      },
    })
  } catch (err) {
    console.error('getReport error:', err)
    return res.status(500).json({ message: 'Failed to fetch report.' })
  }
}

export async function listSessions(req, res) {
  try {
    const { data, error } = await supabaseAdmin
      .from('analysis_sessions')
      .select('id, idea_text, startup_name, status, created_at, updated_at')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('listSessions error:', error)
      return res.status(500).json({ message: 'Failed to fetch sessions.' })
    }

    return res.status(200).json({ sessions: data || [] })
  } catch (err) {
    console.error('listSessions error:', err)
    return res.status(500).json({ message: 'Failed to fetch sessions.' })
  }
}

export async function getSession(req, res) {
  try {
    const { sessionId } = req.params
    const session = await getSessionForUser(sessionId, req.user.id)

    if (!session) {
      return res.status(404).json({ message: 'Analysis session not found.' })
    }

    const agentResults = await getAgentResults(sessionId)

    return res.status(200).json({ session, agentResults })
  } catch (err) {
    console.error('getSession error:', err)
    return res.status(500).json({ message: 'Failed to fetch session.' })
  }
}

export async function getAgentStatus(req, res) {
  try {
    const { sessionId, agentKey } = req.params

    const session = await getSessionForUser(sessionId, req.user.id)
    if (!session) {
      return res.status(404).json({ message: 'Analysis session not found.' })
    }

    const { data, error } = await supabaseAdmin
      .from('agent_results')
      .select('*')
      .eq('session_id', sessionId)
      .eq('agent_key', agentKey)
      .single()

    if (error || !data) {
      return res.status(404).json({ message: 'Agent result not found.' })
    }

    return res.status(200).json({ agentResult: data })
  } catch (err) {
    console.error('getAgentStatus error:', err)
    return res.status(500).json({ message: 'Failed to fetch agent status.' })
  }
}

// Legacy compatibility
export async function createSession(req, res) {
  const { ideaText, businessDetails } = req.body || {}
  if (businessDetails) {
    return analyze(req, res)
  }
  req.body = { ideaText, businessDetails: { startupName: 'Untitled', industry: 'Technology', country: 'Global', targetRegion: 'Global', businessModel: 'SaaS', targetAudience: 'General', startupStage: 'Idea', budget: 'TBD', teamSize: '1', timeline: '6 months', revenueModel: 'Subscription', existingCompetitors: '', additionalRequirements: '' } }
  return analyze(req, res)
}

export async function runAgent(req, res) {
  req.body = { ...(req.body || {}), sessionId: req.params.sessionId }
  req.params.agentKey = req.params.agentKey
  return runAgentByKey(req, res)
}
