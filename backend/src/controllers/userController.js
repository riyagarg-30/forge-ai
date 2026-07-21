import { supabaseAdmin } from '../config/supabaseAdmin.js'

export async function getMe(req, res) {
  return res.status(200).json({
    user: {
      id: req.user.id,
      email: req.user.email,
      fullName: req.user.user_metadata?.full_name || null,
      provider: req.user.app_metadata?.provider || 'email',
      createdAt: req.user.created_at,
    },
  })
}

export async function updateMe(req, res) {
  try {
    const { fullName } = req.body || {}

    if (typeof fullName !== 'string' || fullName.trim().length === 0) {
      return res.status(400).json({ message: 'fullName is required and must be a non-empty string.' })
    }

    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(req.user.id, {
      user_metadata: { ...req.user.user_metadata, full_name: fullName.trim() },
    })

    if (error) {
      return res.status(400).json({ message: error.message })
    }

    return res.status(200).json({
      user: {
        id: data.user.id,
        email: data.user.email,
        fullName: data.user.user_metadata?.full_name || null,
      },
    })
  } catch (err) {
    console.error('updateMe error:', err)
    return res.status(500).json({ message: 'Failed to update profile.' })
  }
}
