import { supabaseAdmin } from '../config/supabaseAdmin.js'
import { AGENT_KEYS } from '../constants/agents.js'
import { runPipeline } from '../services/pipeline/orchestrator.js'

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

/**
 * POST /api/analyze
 * Creates the session and its agent rows, then hands the whole pipeline
 * to the backend orchestrator. The request returns immediately — the
 * frontend tracks progress by polling getSession/getReport.
 */
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

    // Insert AND return the created rows in one round trip, so the pipeline
    // can start without a separate read of session + agent rows.
    const { data: createdAgentRows, error: agentsError } = await supabaseAdmin
      .from('agent_results')
      .insert(agentRows)
      .select()

    if (agentsError) {
      console.error('analyze agents error:', agentsError)
      await supabaseAdmin.from('analysis_sessions').delete().eq('id', session.id)
      return res.status(500).json({ message: 'Failed to initialize agent pipeline.' })
    }

    runPipeline(session.id, { session, agentRows: createdAgentRows }).catch(async (err) => {
      console.error(`Pipeline execution error for session ${session.id}:`, err)
      await supabaseAdmin.from('analysis_sessions').update({ status: 'failed' }).eq('id', session.id)
    })

    return res.status(201).json({ session })
  } catch (err) {
    console.error('analyze error:', err)
    return res.status(500).json({ message: 'Failed to start analysis.' })
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

    return res.status(200).json({
      session,
      agentResults,
      report: {
        verdict: ceoResult?.verdict || null,
        confidence: ceoResult?.confidence ?? null,
        executiveSummary: ceoResult?.executiveSummary || null,
        investmentRecommendation: ceoResult?.investmentRecommendation || null,
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
