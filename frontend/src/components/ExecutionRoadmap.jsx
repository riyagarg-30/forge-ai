import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ExecutionRoadmap({ thirtyDayPlan, sixtyDayPlan, ninetyDayPlan }) {
  const sections = [
    { key: '30', label: '30 Days', items: thirtyDayPlan },
    { key: '60', label: '60 Days', items: sixtyDayPlan },
    { key: '90', label: '90 Days', items: ninetyDayPlan },
  ].filter((s) => s.items?.length)

  const [expanded, setExpanded] = useState(sections[0]?.key ?? null)

  if (!sections.length) return null

  return (
    <div className="relative">
      <div className="absolute left-6 top-8 bottom-8 w-px bg-gradient-to-b from-landing-accent/50 via-landing-accent/20 to-transparent hidden sm:block" />

      <div className="space-y-3">
        {sections.map((section, index) => {
          const isExpanded = expanded === section.key

          return (
            <motion.div
              key={section.key}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08 }}
              className="relative"
            >
              <button
                onClick={() => setExpanded(isExpanded ? null : section.key)}
                className={`flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition-all ${
                  isExpanded
                    ? 'border-landing-accent/30 bg-landing-accent/5'
                    : 'border-landing-border bg-landing-card hover:border-landing-accent/20 hover:bg-white'
                }`}
              >
                <div
                  className={`relative z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border text-sm font-bold transition-transform ${
                    isExpanded ? 'scale-105 border-landing-accent/40 bg-landing-accent/15 text-landing-accent' : 'border-landing-border bg-landing-bg text-landing-muted'
                  }`}
                >
                  {section.key}d
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-semibold text-landing-text">{section.label}</h4>
                    <motion.span animate={{ rotate: isExpanded ? 180 : 0 }} className="text-landing-muted">
                      ▾
                    </motion.span>
                  </div>
                  {!isExpanded && (
                    <p className="mt-2 text-[11px] text-landing-muted">
                      {section.items.length} action{section.items.length > 1 ? 's' : ''} · {section.items.map((t) => t.title).slice(0, 2).join(', ')}…
                    </p>
                  )}
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="ml-16 mt-2 space-y-2 pb-2">
                      {section.items.map((item, ti) => (
                        <motion.div
                          key={ti}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: ti * 0.05 }}
                          className="rounded-xl border border-landing-border bg-landing-card p-3 transition-colors hover:bg-white"
                        >
                          <p className="text-sm font-medium text-landing-text">{item.title}</p>
                          {item.description && <p className="mt-1 text-xs text-landing-muted">{item.description}</p>}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
