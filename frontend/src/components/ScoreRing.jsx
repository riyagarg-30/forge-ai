import { motion } from 'framer-motion'

export default function ScoreRing({ score, label, size = 120, color = '#8b5cf6' }) {
  const safeScore = Number.isFinite(score) ? Math.max(0, Math.min(100, score)) : null
  const radius = (size - 12) / 2
  const circumference = 2 * Math.PI * radius
  const offset = safeScore === null ? circumference : circumference - (safeScore / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="6"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-2xl font-bold text-white"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            {safeScore === null ? '—' : safeScore}
          </motion.span>
          <span className="text-[10px] text-slate-500">/ 100</span>
        </div>
      </div>
      {label && <span className="text-xs font-medium text-slate-400">{label}</span>}
    </div>
  )
}
