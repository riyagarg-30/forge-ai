import { motion } from 'framer-motion'

export default function FormAlert({ type = 'error', message }) {
  if (!message) return null

  const styles =
    type === 'error'
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
