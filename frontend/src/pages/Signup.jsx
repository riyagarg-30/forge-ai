import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import GoogleButton from '../components/GoogleButton'
import FormAlert from '../components/FormAlert'
import { useAuth } from '../context/AuthContext'

export default function Signup() {
  const { signUp, signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    setLoading(true)
    const { data, error } = await signUp({ email, password, fullName })
    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    if (data?.session) {
      navigate('/dashboard', { replace: true })
    }
  }

  const handleGoogle = async () => {
    setError('')
    setGoogleLoading(true)
    const { error } = await signInWithGoogle()
    if (error) {
      setError(error.message)
      setGoogleLoading(false)
    }
  }

  return (
    <AuthLayout title="Create your account" subtitle="Start building with Forge in seconds">
      <FormAlert type="error" message={error} />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label-text" htmlFor="fullName">
            Full name
          </label>
          <input
            id="fullName"
            type="text"
            required
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Jane Doe"
            className="input-field"
          />
        </div>

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

        <div>
          <label className="label-text" htmlFor="password">
            Password
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
          />
        </div>

        <div>
          <label className="label-text" htmlFor="confirmPassword">
            Confirm password
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
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-xs text-slate-500">OR</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <GoogleButton onClick={handleGoogle} disabled={googleLoading} label="Sign up with Google" />

      <p className="mt-6 text-center text-sm text-slate-400">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-forge-purple hover:text-violet-300">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
