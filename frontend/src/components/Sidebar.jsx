import { NavLink } from 'react-router-dom'
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
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
        />
      )}
      <motion.aside
        initial={false}
        animate={{ x: 0 }}
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-white/10 bg-forge-surface/80 backdrop-blur-xl transition-transform duration-300 lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center gap-2 border-b border-white/10 px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-forge-gradient font-bold text-white">
            F
          </div>
          <span className="text-lg font-bold tracking-tight text-white">Forge</span>
        </div>

        <nav className="flex flex-col gap-1 p-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? 'bg-forge-gradient text-white shadow-lg shadow-purple-900/30'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4">
          <div className="glass-panel p-4 text-center">
            <p className="text-xs text-slate-400">Powered by</p>
            <p className="gradient-text text-sm font-bold">Forge Auth</p>
          </div>
        </div>
      </motion.aside>
    </>
  )
}
