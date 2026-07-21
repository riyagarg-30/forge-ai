import { Router } from 'express'
import { requireAuth } from '../middleware/authMiddleware.js'
import {
  analyze,
  getReport,
  listSessions,
  getSession,
  getAgentStatus,
} from '../controllers/analysisController.js'
import { AGENT_META, AGENT_KEYS } from '../constants/agents.js'

const router = Router()

router.get('/agents', requireAuth, (req, res) => {
  res.status(200).json({
    agents: AGENT_KEYS.map((key) => AGENT_META[key]),
  })
})

router.post('/analyze', requireAuth, analyze)
router.get('/report/:id', requireAuth, getReport)

// Session management — the frontend polls these to observe backend-driven
// pipeline progress. No route here triggers agent execution directly.
router.get('/sessions', requireAuth, listSessions)
router.get('/sessions/:sessionId', requireAuth, getSession)
router.get('/sessions/:sessionId/agents/:agentKey', requireAuth, getAgentStatus)

export default router
