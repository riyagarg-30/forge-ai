import { supabaseAdmin } from '../config/supabaseAdmin.js'

export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

    if (!token) {
      return res.status(401).json({ message: 'Missing or invalid authorization header.' })
    }

    const { data, error } = await supabaseAdmin.auth.getUser(token)

    if (error || !data?.user) {
      return res.status(401).json({ message: 'Invalid or expired session token.' })
    }

    req.user = data.user
    next()
  } catch (err) {
    console.error('Auth middleware error:', err)
    return res.status(500).json({ message: 'Internal authentication error.' })
  }
}
