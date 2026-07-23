import { useEffect, useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import Card from '../components/Card'
import FormAlert from '../components/FormAlert'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { api } from '../lib/api'

export default function Profile() {
  const { user } = useAuth()

  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [serverProfile, setServerProfile] = useState(null)

  useEffect(() => {
    api
      .getMe()
      .then((res) => setServerProfile(res?.user || null))
      .catch(() => setServerProfile(null))
  }, [])

  const initials = (user?.user_metadata?.full_name || user?.email || 'U')
    .split(' ')
    .map((s) => s[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const handleSave = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    const { error } = await supabase.auth.updateUser({ data: { full_name: fullName } })

    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    setSuccess('Profile updated successfully.')
  }

  return (
    <DashboardLayout>
      <h2 className="mb-6 text-2xl font-bold text-landing-text sm:text-3xl">Your Profile</h2>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="flex flex-col items-center text-center lg:col-span-1">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-landing-accent text-3xl font-bold text-white shadow-md shadow-landing-accent/20">
            {initials}
          </div>
          <h3 className="mt-4 text-lg font-semibold text-landing-text">
            {user?.user_metadata?.full_name || 'Forge User'}
          </h3>
          <p className="text-sm text-landing-muted">{user?.email}</p>
          <div className="mt-4 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
            Account Active
          </div>
          <div className="mt-6 w-full space-y-2 border-t border-landing-border pt-4 text-left text-sm">
            <div className="flex justify-between">
              <span className="text-landing-muted">User ID</span>
              <span className="max-w-[140px] truncate text-landing-text" title={user?.id}>
                {user?.id}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-landing-muted">Provider</span>
              <span className="text-landing-text capitalize">
                {user?.app_metadata?.provider || 'email'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-landing-muted">Joined</span>
              <span className="text-landing-text">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
              </span>
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2" delay={0.1}>
          <h3 className="mb-4 text-lg font-semibold text-landing-text">Personal Information</h3>
          <FormAlert type="error" message={error} theme="light" />
          <FormAlert type="success" message={success} theme="light" />

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="label-text-light" htmlFor="fullName">
                Full name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input-field-light"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label className="label-text-light" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={user?.email || ''}
                disabled
                className="input-field-light opacity-60"
              />
              <p className="mt-1 text-xs text-landing-muted">
                Email changes are not supported in this demo.
              </p>
            </div>

            <button type="submit" disabled={loading} className="btn-primary-light w-full sm:w-auto sm:px-8">
              {loading ? 'Saving…' : 'Save changes'}
            </button>
          </form>

          {serverProfile && (
            <div className="mt-6 rounded-xl border border-landing-border bg-landing-bg p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-landing-muted">
                Verified by backend
              </p>
              <p className="mt-1 text-sm text-landing-text">
                Server confirmed identity for{' '}
                <span className="font-medium text-landing-text">{serverProfile.email}</span>
              </p>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  )
}
