import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import GlassCard from '../components/GlassCard'
import FormAlert from '../components/FormAlert'
import { useAuth } from '../context/AuthContext'

export default function Settings() {
  const { updatePassword, signOut } = useAuth()
  const navigate = useNavigate()

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const [emailNotifs, setEmailNotifs] = useState(true)
  const [productUpdates, setProductUpdates] = useState(true)
  const [securityAlerts, setSecurityAlerts] = useState(true)

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    setLoading(true)
    const { error } = await updatePassword(newPassword)
    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }
    setSuccess('Password changed successfully.')
    setNewPassword('')
    setConfirmPassword('')
  }

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  const Toggle = ({ checked, onChange }) => (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors duration-200 ${
        checked ? 'bg-forge-gradient' : 'bg-white/10'
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  )

  return (
    <DashboardLayout>
      <h2 className="mb-6 text-2xl font-bold text-white sm:text-3xl">Settings</h2>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <GlassCard>
          <h3 className="mb-4 text-lg font-semibold text-white">Change Password</h3>
          <FormAlert type="error" message={error} />
          <FormAlert type="success" message={success} />

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="label-text" htmlFor="newPassword">
                New password
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="label-text" htmlFor="confirmPassword">
                Confirm new password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary sm:w-auto sm:px-8">
              {loading ? 'Updating…' : 'Update password'}
            </button>
          </form>
        </GlassCard>

        <GlassCard delay={0.1}>
          <h3 className="mb-4 text-lg font-semibold text-white">Notification Preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-200">Email notifications</p>
                <p className="text-xs text-slate-500">Receive updates via email</p>
              </div>
              <Toggle checked={emailNotifs} onChange={setEmailNotifs} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-200">Product updates</p>
                <p className="text-xs text-slate-500">New features and improvements</p>
              </div>
              <Toggle checked={productUpdates} onChange={setProductUpdates} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-200">Security alerts</p>
                <p className="text-xs text-slate-500">Important account activity</p>
              </div>
              <Toggle checked={securityAlerts} onChange={setSecurityAlerts} />
            </div>
          </div>
        </GlassCard>

        <GlassCard delay={0.15} className="border-rose-500/20 lg:col-span-2">
          <h3 className="mb-2 text-lg font-semibold text-white">Danger Zone</h3>
          <p className="mb-4 text-sm text-slate-400">
            Signing out will end your session on this device. You&apos;ll need to log in again to
            access your dashboard.
          </p>
          <button
            onClick={handleLogout}
            className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-5 py-2.5 text-sm font-semibold text-rose-300 transition-colors hover:bg-rose-500/20"
          >
            Log out of Forge
          </button>
        </GlassCard>
      </div>
    </DashboardLayout>
  )
}
