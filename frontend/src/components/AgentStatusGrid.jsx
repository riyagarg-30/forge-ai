import { motion } from 'framer-motion'

const PHASE_LABELS = {
  thinking: 'Thinking',
  searching: 'Searching',
  reading: 'Reading Sources',
  building: 'Building Model',
  completed: 'Completed',
}

const STATUS_CONFIG = {
  pending: { ring: 'border-landing-border', glow: '', label: 'Waiting', labelColor: 'text-landing-muted', dot: 'bg-slate-300' },
  running: { ring: 'border-amber-300', glow: 'shadow-[0_0_24px_rgba(251,191,36,0.15)]', label: 'Active', labelColor: 'text-amber-600', dot: 'bg-amber-500 animate-pulse' },
  completed: { ring: 'border-emerald-200', glow: 'shadow-[0_0_24px_rgba(16,185,129,0.12)]', label: 'Done', labelColor: 'text-emerald-600', dot: 'bg-emerald-500' },
  failed: { ring: 'border-rose-200', glow: '', label: 'Failed', labelColor: 'text-rose-600', dot: 'bg-rose-500' },
}

export default function AgentStatusGrid({ agents, agentResults, activeKeys = [] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {agents.map((agent, index) => {
        const result = agentResults[agent.key]
        const status = result?.status || 'pending'
        const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending
        const isActive = activeKeys.includes(agent.key) || status === 'running'
        const phase = result?.progress_phase
        const message = result?.progress_message

        return (
          <motion.div
            key={agent.key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`relative overflow-hidden rounded-2xl border p-4 transition-all duration-500 ${config.ring} ${config.glow} ${
              isActive ? 'border-landing-accent/30 bg-landing-accent/5' : 'border-landing-border bg-landing-card'
            }`}
          >
            {status === 'running' && (
              <div className="absolute inset-x-0 top-0 h-0.5 overflow-hidden">
                <motion.div
                  className="h-full w-1/3 bg-landing-accent"
                  animate={{ x: ['-100%', '400%'] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                />
              </div>
            )}

            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-landing-bg text-lg ${isActive ? 'scale-110' : ''} transition-transform`}>
                  {status === 'running' ? (
                    <motion.span animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>⚡</motion.span>
                  ) : status === 'completed' ? '✓' : agent.icon}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-landing-text">{agent.name}</h3>
                  <span className={`text-[10px] font-medium uppercase tracking-wider ${config.labelColor}`}>
                    {phase && status === 'running' ? PHASE_LABELS[phase] || config.label : config.label}
                  </span>
                </div>
              </div>
              <span className={`h-2 w-2 rounded-full ${config.dot}`} />
            </div>

            {status === 'running' && message && (
              <motion.p
                key={message}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-3 text-[11px] font-mono leading-relaxed text-landing-muted"
              >
                {message}
              </motion.p>
            )}

            {status === 'running' && (
              <div className="mt-3 flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="h-1 flex-1 rounded-full bg-landing-border"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            )}

            {status === 'completed' && result?.result?.summary && (
              <p className="mt-2 line-clamp-2 text-[11px] text-landing-muted">
                {typeof result.result.summary === 'string' ? result.result.summary.slice(0, 100) : 'Analysis complete'}
              </p>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}
