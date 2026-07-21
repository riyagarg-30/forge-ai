import { Router } from 'express'
import { requireAuth } from '../middleware/authMiddleware.js'
import {
  analyze,
  runAgentByKey,
  getReport,
  listSessions,
  getSession,
  getAgentStatus,
  createSession,
  runAgent,
} from '../controllers/analysisController.js'
import { AGENT_META, AGENT_KEYS } from '../constants/agents.js'

const router = Router()

router.get('/agents', requireAuth, (req, res) => {
  res.status(200).json({
    agents: AGENT_KEYS.map((key) => AGENT_META[key]),
  })
})

// New modular API
router.post('/analyze', requireAuth, analyze)
router.post('/agents/:agentKey', requireAuth, runAgentByKey)
router.get('/report/:id', requireAuth, getReport)

// Session management
router.get('/sessions', requireAuth, listSessions)
router.get('/sessions/:sessionId', requireAuth, getSession)
router.get('/sessions/:sessionId/agents/:agentKey', requireAuth, getAgentStatus)

// Legacy routes (backward compatible)
router.post('/sessions', requireAuth, createSession)
router.post('/sessions/:sessionId/agents/:agentKey/run', requireAuth, runAgent)

export default router
