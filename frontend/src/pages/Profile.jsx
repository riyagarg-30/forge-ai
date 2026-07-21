import { useEffect, useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import GlassCard from '../components/GlassCard'
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
      <h2 className="mb-6 text-2xl font-bold text-white sm:text-3xl">Your Profile</h2>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <GlassCard className="flex flex-col items-center text-center lg:col-span-1">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-forge-gradient text-3xl font-bold text-white shadow-glow">
            {initials}
          </div>
          <h3 className="mt-4 text-lg font-semibold text-white">
            {user?.user_metadata?.full_name || 'Forge User'}
          </h3>
          <p className="text-sm text-slate-400">{user?.email}</p>
          <div className="mt-4 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
            Account Active
          </div>
          <div className="mt-6 w-full space-y-2 border-t border-white/10 pt-4 text-left text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">User ID</span>
              <span className="max-w-[140px] truncate text-slate-300" title={user?.id}>
                {user?.id}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Provider</span>
              <span className="text-slate-300 capitalize">
                {user?.app_metadata?.provider || 'email'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Joined</span>
              <span className="text-slate-300">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
              </span>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="lg:col-span-2" delay={0.1}>
          <h3 className="mb-4 text-lg font-semibold text-white">Personal Information</h3>
          <FormAlert type="error" message={error} />
          <FormAlert type="success" message={success} />

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="label-text" htmlFor="fullName">
                Full name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input-field"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label className="label-text" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={user?.email || ''}
                disabled
                className="input-field opacity-60"
              />
              <p className="mt-1 text-xs text-slate-500">
                Email changes are not supported in this demo.
              </p>
            </div>

            <button type="submit" disabled={loading} className="btn-primary sm:w-auto sm:px-8">
              {loading ? 'Saving…' : 'Save changes'}
            </button>
          </form>

          {serverProfile && (
            <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Verified by backend
              </p>
              <p className="mt-1 text-sm text-slate-300">
                Server confirmed identity for{' '}
                <span className="font-medium text-white">{serverProfile.email}</span>
              </p>
            </div>
          )}
        </GlassCard>
      </div>
    </DashboardLayout>
  )
}
