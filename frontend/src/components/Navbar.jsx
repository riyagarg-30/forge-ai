import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

export default function Navbar({ onMenuClick }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const initials = (user?.user_metadata?.full_name || user?.email || 'U')
    .split(' ')
    .map((s) => s[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/10 bg-forge-bg/70 px-4 backdrop-blur-xl sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-300 hover:bg-white/5 lg:hidden"
          aria-label="Toggle menu"
        >
          ☰
        </button>
        <h1 className="text-base font-semibold text-white sm:text-lg">Welcome back 👋</h1>
      </div>

      <div className="relative flex items-center gap-3">
        <button className="hidden rounded-lg p-2 text-slate-300 hover:bg-white/5 sm:block" aria-label="Notifications">
          🔔
        </button>

        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 py-1.5 pl-1.5 pr-3 transition-colors hover:bg-white/10"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-forge-gradient text-sm font-bold text-white">
            {initials}
          </div>
          <span className="hidden max-w-[140px] truncate text-sm text-slate-200 sm:block">
            {user?.user_metadata?.full_name || user?.email}
          </span>
        </button>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="glass-panel absolute right-0 top-12 w-48 overflow-hidden p-1"
            >
              <button
                onClick={() => {
                  setMenuOpen(false)
                  navigate('/profile')
                }}
                className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-200 hover:bg-white/10"
              >
                Profile
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false)
                  navigate('/settings')
                }}
                className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-200 hover:bg-white/10"
              >
                Settings
              </button>
              <div className="my-1 h-px bg-white/10" />
              <button
                onClick={handleLogout}
                className="block w-full rounded-lg px-3 py-2 text-left text-sm text-rose-400 hover:bg-rose-500/10"
              >
                Log out
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
