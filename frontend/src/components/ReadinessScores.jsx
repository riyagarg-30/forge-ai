import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ScoreRing from './ScoreRing'

const SCORE_COLORS = {
  marketReadiness: '#3b82f6',
  productReadiness: '#8b5cf6',
  financialReadiness: '#10b981',
  technicalReadiness: '#06b6d4',
  legalReadiness: '#f59e0b',
  scalability: '#ec4899',
  competitiveAdvantage: '#6366f1',
  investmentReadiness: '#14b8a6',
}

export default function ReadinessScores({ domainScores, overallScore, compact = false }) {
  const [selected, setSelected] = useState(null)

  if (!domainScores?.length) return null

  return (
    <div className={compact ? '' : 'space-y-6'}>
      {!compact && (
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <ScoreRing score={overallScore} label="Overall Startup Readiness" size={140} color="#8b5cf6" />
          <p className="max-w-xs text-center text-sm text-slate-400 sm:text-left">
            Calculated from {domainScores.length} independent domain scores. Click any score for details.
          </p>
        </div>
      )}

      <div className={`grid gap-3 ${compact ? 'grid-cols-2 sm:grid-cols-4' : 'sm:grid-cols-2 lg:grid-cols-4'}`}>
        {domainScores.map((domain, i) => (
          <motion.button
            key={domain.key}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => setSelected(selected?.key === domain.key ? null : domain)}
            className={`rounded-2xl border p-4 text-left transition-all hover:border-white/20 hover:bg-white/[0.04] ${
              selected?.key === domain.key ? 'border-forge-purple/40 bg-forge-purple/5' : 'border-white/[0.06] bg-white/[0.02]'
            }`}
          >
            <ScoreRing
              score={domain.score}
              label={domain.label}
              size={compact ? 80 : 100}
              color={SCORE_COLORS[domain.key] || '#8b5cf6'}
            />
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden rounded-2xl border border-forge-purple/20 bg-forge-purple/5 p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="text-lg font-semibold text-white">{selected.label}</h4>
                <p className="mt-1 text-3xl font-bold text-forge-purple">{selected.score}<span className="text-lg text-slate-500">/100</span></p>
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-white">✕</button>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-300">{selected.explanation}</p>
            {selected.improvements?.length > 0 && (
              <div className="mt-4">
                <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Suggested Improvements</h5>
                <ul className="mt-2 space-y-1.5">
                  {selected.improvements.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                      <span className="text-forge-purple">→</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
