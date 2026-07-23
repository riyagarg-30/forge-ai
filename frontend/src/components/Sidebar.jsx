import { NavLink, Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '⬡' },
  { to: '/profile', label: 'Profile', icon: '◈' },
  { to: '/settings', label: 'Settings', icon: '⚙' },
]

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm lg:hidden"
        />
      )}
      <motion.aside
        initial={false}
        animate={{ x: 0 }}
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-landing-border bg-landing-card transition-transform duration-300 lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Link to="/" className="flex h-16 items-center gap-2 border-b border-landing-border px-6" aria-label="Forge AI — back to home">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-landing-accent font-bold text-white">
            F
          </div>
          <span className="text-lg font-bold tracking-tight text-landing-text">Forge</span>
        </Link>

        <nav className="flex flex-col gap-1 p-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? 'bg-landing-accent text-white shadow-md shadow-landing-accent/20'
                    : 'text-landing-muted hover:bg-landing-bg hover:text-landing-text'
                }`
              }
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4">
          <div className="rounded-2xl border border-landing-border bg-landing-bg p-4 text-center">
            <p className="text-xs text-landing-muted">Powered by</p>
            <p className="text-sm font-bold text-landing-accent">Forge Auth</p>
          </div>
        </div>
      </motion.aside>
    </>
  )
}
