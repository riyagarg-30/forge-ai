import { supabaseAdmin } from '../config/supabaseAdmin.js'

export async function signUp(req, res) {
  try {
    const { email, password, fullName } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' })
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' })
    }

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName || '' },
    })

    if (error) {
      return res.status(400).json({ message: error.message })
    }

    return res.status(201).json({
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    })
  } catch (err) {
    console.error('signUp error:', err)
    return res.status(500).json({ message: 'Failed to create account.' })
  }
}

export async function verifySession(req, res) {
  return res.status(200).json({
    valid: true,
    user: {
      id: req.user.id,
      email: req.user.email,
    },
  })
}

export async function revokeAllSessions(req, res) {
  try {
    const { error } = await supabaseAdmin.auth.admin.signOut(req.user.id, 'global')

    if (error) {
      return res.status(400).json({ message: error.message })
    }

    return res.status(200).json({ message: 'All sessions revoked successfully.' })
  } catch (err) {
    console.error('revokeAllSessions error:', err)
    return res.status(500).json({ message: 'Failed to revoke sessions.' })
  }
}
