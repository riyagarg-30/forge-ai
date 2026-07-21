import { Router } from 'express'
import { requireAuth } from '../middleware/authMiddleware.js'
import { signUp, verifySession, revokeAllSessions } from '../controllers/authController.js'

const router = Router()

router.post('/signup', signUp)
router.get('/session', requireAuth, verifySession)
router.post('/revoke-all', requireAuth, revokeAllSessions)

export default router
