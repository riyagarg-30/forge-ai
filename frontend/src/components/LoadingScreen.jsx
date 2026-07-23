import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import FloatingBadgeField from './FloatingBadgeField'

const DEFAULT_MESSAGES = [
  'Researching…',
  'Validating…',
  'Running AI Agents…',
  'Building Report…',
  'Finalizing…',
]

/**
 * Full-screen branded loader shown while a slow API response is pending.
 * Meant to be rendered inside an <AnimatePresence> by the caller so it can
 * fade out into the dashboard once the underlying data has loaded.
 */
export default function LoadingScreen({ messages = DEFAULT_MESSAGES, cycleMs = 1800 }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % messages.length), cycleMs)
    return () => clearInterval(id)
  }, [messages, cycleMs])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-landing-bg text-landing-text dark:bg-slate-950 dark:text-slate-50"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,theme(colors.landing.border)_1px,transparent_0)] bg-[length:28px_28px] opacity-40 dark:opacity-20" />
      <FloatingBadgeField className="hidden opacity-70 sm:block" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="relative z-10 flex flex-col items-center px-6 text-center"
      >
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-landing-accent text-base font-bold text-white shadow-lg shadow-landing-accent/30">
            F
          </span>
          <span className="text-xl font-semibold tracking-tight">Forge AI</span>
        </div>

        <div className="mt-10 h-1.5 w-56 overflow-hidden rounded-full bg-landing-border dark:bg-slate-800">
          <motion.div
            className="h-full w-1/3 rounded-full bg-landing-accent"
            animate={{ x: ['-100%', '220%'] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <div className="mt-6 h-5">
          <AnimatePresence mode="wait">
            <motion.p
              key={messages[index]}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35 }}
              className="text-sm font-medium text-landing-muted dark:text-slate-400"
            >
              {messages[index]}
            </motion.p>
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}
