import { motion } from 'framer-motion'

const STATUS_CONFIG = {
  pending: {
    dot: 'bg-slate-300',
    ring: 'border-landing-border',
    glow: '',
    label: 'Waiting',
    labelColor: 'text-landing-muted',
  },
  running: {
    dot: 'bg-amber-500 animate-pulse',
    ring: 'border-amber-300',
    glow: 'shadow-[0_0_24px_rgba(251,191,36,0.18)]',
    label: 'Running',
    labelColor: 'text-amber-600',
  },
  completed: {
    dot: 'bg-emerald-500',
    ring: 'border-emerald-200',
    glow: 'shadow-[0_0_24px_rgba(16,185,129,0.12)]',
    label: 'Complete',
    labelColor: 'text-emerald-600',
  },
  failed: {
    dot: 'bg-rose-500',
    ring: 'border-rose-200',
    glow: '',
    label: 'Failed',
    labelColor: 'text-rose-600',
  },
}

export default function AgentPipelineCard({ agent, status, index, isActive, preview }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      className={`relative flex gap-4 ${isActive ? 'z-10' : ''}`}
    >
      {/* Timeline connector */}
      <div className="flex flex-col items-center">
        <div
          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border text-lg transition-all duration-500 ${config.ring} ${config.glow} ${
            isActive ? 'scale-110 bg-landing-accent/5' : 'bg-landing-card'
          }`}
        >
          {status === 'running' ? (
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="text-base"
            >
              ⚡
            </motion.span>
          ) : status === 'completed' ? (
            <span className="text-base">✓</span>
          ) : (
            <span>{agent.icon}</span>
          )}
        </div>
        {index < 7 && (
          <div className="relative my-1 w-px flex-1 min-h-[24px]">
            <div className="absolute inset-0 bg-landing-border" />
            {status === 'completed' && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-b from-emerald-400/70 to-emerald-400/20 origin-top"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              />
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div
        className={`mb-4 flex-1 rounded-2xl border p-4 transition-all duration-500 ${
          isActive
            ? 'border-landing-accent/30 bg-landing-accent/5'
            : 'border-landing-border bg-landing-card'
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-landing-text">{agent.name}</h3>
            <span className={`text-[10px] font-medium uppercase tracking-wider ${config.labelColor}`}>
              {config.label}
            </span>
          </div>
          <span className={`h-2 w-2 rounded-full ${config.dot}`} />
        </div>
        <p className="mt-1 text-xs text-landing-muted">{agent.description}</p>

        {status === 'running' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 space-y-2"
          >
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="h-1 flex-1 rounded-full bg-landing-border"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
            <p className="text-[11px] text-landing-muted font-mono">
              {preview || 'Processing analysis...'}
            </p>
          </motion.div>
        )}

        {status === 'completed' && preview && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-2 text-[11px] leading-relaxed text-landing-muted line-clamp-2"
          >
            {preview}
          </motion.p>
        )}
      </div>
    </motion.div>
  )
}
