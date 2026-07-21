import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import FormAlert from '../components/FormAlert'
import { useAuth } from '../context/AuthContext'

export default function ForgotPassword() {
  const { sendPasswordResetEmail } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    const { error } = await sendPasswordResetEmail(email)
    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }
    setSuccess('Password reset link sent! Please check your inbox.')
  }

  return (
    <AuthLayout
      title="Forgot password?"
      subtitle="Enter your email and we'll send you a reset link"
    >
      <FormAlert type="error" message={error} />
      <FormAlert type="success" message={success} />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label-text" htmlFor="email">
            Email address
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="input-field"
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Sending link…' : 'Send reset link'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        Remembered your password?{' '}
        <Link to="/login" className="font-semibold text-forge-purple hover:text-violet-300">
          Back to sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
