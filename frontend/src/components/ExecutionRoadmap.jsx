import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ExecutionRoadmap({ roadmap }) {
  const [expandedWeek, setExpandedWeek] = useState(0)

  if (!roadmap?.length) return null

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-6 top-8 bottom-8 w-px bg-gradient-to-b from-forge-purple/60 via-blue-500/40 to-transparent hidden sm:block" />

      <div className="space-y-3">
        {roadmap.map((week, index) => {
          const isExpanded = expandedWeek === index
          const completed = false

          return (
            <motion.div
              key={week.week || index}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08 }}
              className="relative"
            >
              <button
                onClick={() => setExpandedWeek(isExpanded ? -1 : index)}
                className={`flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition-all ${
                  isExpanded
                    ? 'border-forge-purple/30 bg-forge-purple/5'
                    : 'border-white/[0.06] bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]'
                }`}
              >
                <div className={`relative z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border text-sm font-bold ${
                  isExpanded ? 'border-forge-purple/40 bg-forge-purple/20 text-forge-purple' : 'border-white/10 bg-white/[0.04] text-slate-400'
                }`}>
                  W{week.week || index + 1}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-semibold text-white">{week.title}</h4>
                    <motion.span
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      className="text-slate-500"
                    >
                      ▾
                    </motion.span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">{week.focus}</p>
                  {!isExpanded && week.tasks?.length > 0 && (
                    <p className="mt-2 text-[11px] text-slate-600">
                      {week.tasks.length} tasks · {week.tasks.map((t) => t.name || t).slice(0, 2).join(', ')}…
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
                      {week.tasks?.map((task, ti) => {
                        const taskObj = typeof task === 'string' ? { name: task } : task
                        return (
                          <div
                            key={ti}
                            className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3"
                          >
                            <div className="flex items-start gap-3">
                              <div className={`mt-0.5 h-4 w-4 flex-shrink-0 rounded border ${completed ? 'border-emerald-500 bg-emerald-500/20' : 'border-white/20'}`} />
                              <div>
                                <p className="text-sm font-medium text-slate-200">{taskObj.name}</p>
                                {taskObj.description && (
                                  <p className="mt-1 text-xs text-slate-500">{taskObj.description}</p>
                                )}
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {taskObj.deliverable && (
                                    <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] text-blue-400">
                                      📄 {taskObj.deliverable}
                                    </span>
                                  )}
                                  {taskObj.milestone && (
                                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400">
                                      🎯 {taskObj.milestone}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
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
