import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import AuthLayout from '../components/AuthLayout'
import GoogleButton from '../components/GoogleButton'
import FormAlert from '../components/FormAlert'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { signIn, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await signIn({ email, password })
    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }
    navigate(from, { replace: true })
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
    <AuthLayout title="Welcome back" subtitle="Sign in to your Forge account to continue">
      <AnimatePresence>
        <FormAlert type="error" message={error} />
      </AnimatePresence>

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

        <div>
          <div className="flex items-center justify-between">
            <label className="label-text" htmlFor="password">
              Password
            </label>
            <Link to="/forgot-password" className="mb-1.5 text-xs font-medium text-forge-purple hover:text-violet-300">
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="input-field"
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-xs text-slate-500">OR</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <GoogleButton onClick={handleGoogle} disabled={googleLoading} />

      <p className="mt-6 text-center text-sm text-slate-400">
        Don&apos;t have an account?{' '}
        <Link to="/signup" className="font-semibold text-forge-purple hover:text-violet-300">
          Sign up
        </Link>
      </p>
    </AuthLayout>
  )
}
