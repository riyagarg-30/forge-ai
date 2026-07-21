import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import FormAlert from '../components/FormAlert'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'

export default function ResetPassword() {
  const { updatePassword } = useAuth()
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [readyForReset, setReadyForReset] = useState(false)

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReadyForReset(true)
      }
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReadyForReset(true)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    setLoading(true)
    const { error } = await updatePassword(password)
    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    setSuccess('Password updated successfully! Redirecting to sign in…')
    setTimeout(() => navigate('/login', { replace: true }), 2000)
  }

  return (
    <AuthLayout title="Reset your password" subtitle="Choose a new password for your account">
      <FormAlert type="error" message={error} />
      <FormAlert type="success" message={success} />

      {!readyForReset && !success && (
        <p className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-sm text-amber-300">
          Open this page using the reset link from your email to continue.
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label-text" htmlFor="password">
            New password
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="input-field"
            disabled={!readyForReset}
          />
        </div>

        <div>
          <label className="label-text" htmlFor="confirmPassword">
            Confirm new password
          </label>
          <input
            id="confirmPassword"
            type="password"
            required
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="input-field"
            disabled={!readyForReset}
          />
        </div>

        <button type="submit" disabled={loading || !readyForReset} className="btn-primary">
          {loading ? 'Updating…' : 'Update password'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        <Link to="/login" className="font-semibold text-forge-purple hover:text-violet-300">
          Back to sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
