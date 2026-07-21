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
      <div className="absolute left-6 top-8 bottom-8 w-px bg-gradient-to-b from-forge-purple/60 via-blue-500/40 to-transparent hidden sm:block" />

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
                    ? 'border-forge-purple/30 bg-forge-purple/5'
                    : 'border-white/[0.06] bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]'
                }`}
              >
                <div
                  className={`relative z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border text-sm font-bold ${
                    isExpanded ? 'border-forge-purple/40 bg-forge-purple/20 text-forge-purple' : 'border-white/10 bg-white/[0.04] text-slate-400'
                  }`}
                >
                  {section.key}d
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-semibold text-white">{section.label}</h4>
                    <motion.span animate={{ rotate: isExpanded ? 180 : 0 }} className="text-slate-500">
                      ▾
                    </motion.span>
                  </div>
                  {!isExpanded && (
                    <p className="mt-2 text-[11px] text-slate-600">
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
                        <div key={ti} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                          <p className="text-sm font-medium text-slate-200">{item.title}</p>
                          {item.description && <p className="mt-1 text-xs text-slate-500">{item.description}</p>}
                        </div>
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
