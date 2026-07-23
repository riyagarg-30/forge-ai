import { motion } from 'framer-motion'

/**
 * `theme="dark"` (default) preserves the exact original look for the
 * public auth pages (Login/Signup/ForgotPassword/ResetPassword).
 * `theme="light"` is used inside the light-themed authenticated app
 * (Profile/Settings).
 */
export default function FormAlert({ type = 'error', message, theme = 'dark' }) {
  if (!message) return null

  const styles =
    theme === 'light'
      ? type === 'error'
        ? 'border-rose-200 bg-rose-50 text-rose-700'
        : 'border-emerald-200 bg-emerald-50 text-emerald-700'
      : type === 'error'
        ? 'border-rose-500/30 bg-rose-500/10 text-rose-300'
        : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className={`mb-4 rounded-xl border px-4 py-2.5 text-sm ${styles}`}
    >
      {message}
    </motion.div>
  )
}
