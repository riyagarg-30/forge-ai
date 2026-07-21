import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import authRoutes from './src/routes/authRoutes.js'
import userRoutes from './src/routes/userRoutes.js'
import analysisRoutes from './src/routes/analysisRoutes.js'
import { requireAuth } from './src/middleware/authMiddleware.js'
import { analyze, getReport } from './src/controllers/analysisController.js'

const app = express()
const PORT = process.env.PORT || 5000
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173'

app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
  })
)
app.use(express.json())

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'forge-ai-backend' })
})

app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/analysis', analysisRoutes)

// Top-level modular agent API (spec-compliant aliases)
app.post('/api/analyze', requireAuth, analyze)
app.get('/api/report/:id', requireAuth, getReport)

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' })
})

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ message: 'Internal server error.' })
})

app.listen(PORT, () => {
  console.log(`Forge AI backend running on http://localhost:${PORT}`)
})
