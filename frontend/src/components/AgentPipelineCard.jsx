import { motion } from 'framer-motion'

const STATUS_CONFIG = {
  pending: {
    dot: 'bg-slate-600',
    ring: 'border-white/[0.06]',
    glow: '',
    label: 'Waiting',
    labelColor: 'text-slate-500',
  },
  running: {
    dot: 'bg-amber-400 animate-pulse',
    ring: 'border-amber-500/30',
    glow: 'shadow-[0_0_24px_rgba(251,191,36,0.15)]',
    label: 'Running',
    labelColor: 'text-amber-400',
  },
  completed: {
    dot: 'bg-emerald-400',
    ring: 'border-emerald-500/20',
    glow: 'shadow-[0_0_24px_rgba(52,211,153,0.1)]',
    label: 'Complete',
    labelColor: 'text-emerald-400',
  },
  failed: {
    dot: 'bg-rose-400',
    ring: 'border-rose-500/20',
    glow: '',
    label: 'Failed',
    labelColor: 'text-rose-400',
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
            isActive ? 'scale-110 bg-white/[0.08]' : 'bg-white/[0.03]'
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
            <div className="absolute inset-0 bg-white/[0.06]" />
            {status === 'completed' && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-b from-emerald-500/60 to-emerald-500/20 origin-top"
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
            ? 'border-white/15 bg-white/[0.06] backdrop-blur-xl'
            : 'border-white/[0.06] bg-white/[0.02]'
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-white">{agent.name}</h3>
            <span className={`text-[10px] font-medium uppercase tracking-wider ${config.labelColor}`}>
              {config.label}
            </span>
          </div>
          <span className={`h-2 w-2 rounded-full ${config.dot}`} />
        </div>
        <p className="mt-1 text-xs text-slate-500">{agent.description}</p>

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
                  className="h-1 flex-1 rounded-full bg-white/10"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              {preview || 'Processing analysis...'}
            </p>
          </motion.div>
        )}

        {status === 'completed' && preview && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-2 text-[11px] leading-relaxed text-slate-400 line-clamp-2"
          >
            {preview}
          </motion.p>
        )}
      </div>
    </motion.div>
  )
}
