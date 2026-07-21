import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

export default function WorkspaceLayout({ children, title, showSidebar = false, sidebar }) {
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
    <div className="relative flex min-h-screen flex-col bg-forge-bg">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-violet-600/10 blur-3xl" />
        <div className="absolute -right-32 top-1/4 h-80 w-80 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-purple-600/8 blur-3xl" />
      </div>

      <header className="relative z-20 flex h-14 items-center justify-between border-b border-white/[0.06] bg-forge-bg/60 px-4 backdrop-blur-2xl sm:px-6">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-forge-gradient text-xs font-bold text-white shadow-lg shadow-purple-900/40">
              F
            </div>
            <span className="text-sm font-semibold tracking-tight text-white">
              Forge <span className="text-slate-500">AI</span>
            </span>
          </Link>
          {title && (
            <>
              <span className="hidden text-slate-600 sm:inline">/</span>
              <span className="hidden text-sm text-slate-400 sm:inline">{title}</span>
            </>
          )}
        </div>

        <div className="relative flex items-center gap-2">
          <Link
            to="/dashboard"
            className="hidden rounded-lg px-3 py-1.5 text-xs text-slate-400 transition-colors hover:bg-white/5 hover:text-white sm:block"
          >
            Workspace
          </Link>
          <Link
            to="/profile"
            className="hidden rounded-lg px-3 py-1.5 text-xs text-slate-400 transition-colors hover:bg-white/5 hover:text-white sm:block"
          >
            Profile
          </Link>

          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 py-1 pl-1 pr-2.5 transition-colors hover:bg-white/10"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-forge-gradient text-xs font-bold text-white">
              {initials}
            </div>
            <span className="hidden max-w-[120px] truncate text-xs text-slate-300 sm:block">
              {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
            </span>
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="glass-panel absolute right-0 top-11 z-50 w-44 overflow-hidden p-1"
              >
                <button
                  onClick={() => { setMenuOpen(false); navigate('/dashboard') }}
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-200 hover:bg-white/10"
                >
                  Workspace
                </button>
                <button
                  onClick={() => { setMenuOpen(false); navigate('/profile') }}
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-200 hover:bg-white/10"
                >
                  Profile
                </button>
                <button
                  onClick={() => { setMenuOpen(false); navigate('/settings') }}
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

      <div className="relative z-10 flex flex-1">
        {showSidebar && sidebar}
        <main className="flex-1 overflow-x-hidden">{children}</main>
      </div>
    </div>
  )
}
