import { motion } from 'framer-motion'

export default function GlassCard({ children, className = '', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`glass-panel p-6 ${className}`}
    >
      {children}
    </motion.div>
  )
}
