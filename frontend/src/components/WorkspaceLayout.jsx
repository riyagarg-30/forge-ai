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
    <div className="font-landing relative flex min-h-screen flex-col bg-landing-bg text-landing-text">
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-landing-border bg-landing-card/90 px-4 backdrop-blur-md sm:px-6">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2.5" aria-label="Forge AI — back to home">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-landing-accent text-xs font-bold text-white">
              F
            </div>
            <span className="text-sm font-semibold tracking-tight text-landing-text">
              Forge <span className="text-landing-muted">AI</span>
            </span>
          </Link>
          {title && (
            <>
              <span className="hidden text-landing-border sm:inline">/</span>
              <span className="hidden text-sm text-landing-muted sm:inline">{title}</span>
            </>
          )}
        </div>

        <div className="relative flex items-center gap-2">
          <Link
            to="/dashboard"
            className="hidden rounded-lg px-3 py-1.5 text-xs font-medium text-landing-muted transition-colors hover:bg-landing-bg hover:text-landing-text sm:block"
          >
            Workspace
          </Link>
          <Link
            to="/profile"
            className="hidden rounded-lg px-3 py-1.5 text-xs font-medium text-landing-muted transition-colors hover:bg-landing-bg hover:text-landing-text sm:block"
          >
            Profile
          </Link>

          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 rounded-xl border border-landing-border bg-white py-1 pl-1 pr-2.5 transition-colors hover:bg-landing-bg"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-landing-accent text-xs font-bold text-white">
              {initials}
            </div>
            <span className="hidden max-w-[120px] truncate text-xs font-medium text-landing-text sm:block">
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
                className="absolute right-0 top-11 z-50 w-44 overflow-hidden rounded-2xl border border-landing-border bg-landing-card p-1 shadow-lg"
              >
                <button
                  onClick={() => { setMenuOpen(false); navigate('/dashboard') }}
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm text-landing-text hover:bg-landing-bg"
                >
                  Workspace
                </button>
                <button
                  onClick={() => { setMenuOpen(false); navigate('/profile') }}
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm text-landing-text hover:bg-landing-bg"
                >
                  Profile
                </button>
                <button
                  onClick={() => { setMenuOpen(false); navigate('/settings') }}
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm text-landing-text hover:bg-landing-bg"
                >
                  Settings
                </button>
                <div className="my-1 h-px bg-landing-border" />
                <button
                  onClick={handleLogout}
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50"
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
