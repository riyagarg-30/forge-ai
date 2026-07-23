import { motion } from 'framer-motion'

/**
 * Light design-system card for the authenticated app — the counterpart to
 * GlassCard, which stays on the dark theme for the public auth pages.
 */
export default function Card({ children, className = '', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`card-light ${className}`}
    >
      {children}
    </motion.div>
  )
}
