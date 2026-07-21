import { motion } from 'framer-motion'

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-forge-bg px-4 py-12">
      <div className="pointer-events-none absolute inset-0 bg-forge-radial" />

      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-forge-purple/20 blur-3xl"
      />
      <motion.div
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -right-24 bottom-1/4 h-72 w-72 rounded-full bg-forge-blue/20 blur-3xl"
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="glass-panel relative w-full max-w-md p-8 sm:p-10"
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-forge-gradient text-xl font-bold text-white shadow-glow">
            F
          </div>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-slate-400">{subtitle}</p>}
        </div>
        {children}
      </motion.div>
    </div>
  )
}
