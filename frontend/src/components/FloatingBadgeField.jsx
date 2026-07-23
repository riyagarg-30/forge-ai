import { useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'

const COLOR_STYLES = {
  purple: {
    bg: 'bg-violet-500/10 dark:bg-violet-400/15',
    border: 'border-violet-400/40 dark:border-violet-400/30',
    text: 'text-violet-700 dark:text-violet-200',
    dot: 'bg-violet-500',
    glow: 'shadow-[0_10px_30px_-8px_rgba(139,92,246,0.5)]',
    line: '#8b5cf6',
  },
  green: {
    bg: 'bg-emerald-500/10 dark:bg-emerald-400/15',
    border: 'border-emerald-400/40 dark:border-emerald-400/30',
    text: 'text-emerald-700 dark:text-emerald-200',
    dot: 'bg-emerald-500',
    glow: 'shadow-[0_10px_30px_-8px_rgba(16,185,129,0.5)]',
    line: '#10b981',
  },
  coral: {
    bg: 'bg-rose-500/10 dark:bg-rose-400/15',
    border: 'border-rose-400/40 dark:border-rose-400/30',
    text: 'text-rose-700 dark:text-rose-200',
    dot: 'bg-rose-500',
    glow: 'shadow-[0_10px_30px_-8px_rgba(244,63,94,0.5)]',
    line: '#f43f5e',
  },
  amber: {
    bg: 'bg-amber-500/10 dark:bg-amber-400/15',
    border: 'border-amber-400/40 dark:border-amber-400/30',
    text: 'text-amber-700 dark:text-amber-200',
    dot: 'bg-amber-500',
    glow: 'shadow-[0_10px_30px_-8px_rgba(245,158,11,0.5)]',
    line: '#f59e0b',
  },
  pink: {
    bg: 'bg-pink-500/10 dark:bg-pink-400/15',
    border: 'border-pink-400/40 dark:border-pink-400/30',
    text: 'text-pink-700 dark:text-pink-200',
    dot: 'bg-pink-500',
    glow: 'shadow-[0_10px_30px_-8px_rgba(236,72,153,0.5)]',
    line: '#ec4899',
  },
  cyan: {
    bg: 'bg-cyan-500/10 dark:bg-cyan-400/15',
    border: 'border-cyan-400/40 dark:border-cyan-400/30',
    text: 'text-cyan-700 dark:text-cyan-200',
    dot: 'bg-cyan-500',
    glow: 'shadow-[0_10px_30px_-8px_rgba(6,182,212,0.5)]',
    line: '#06b6d4',
  },
  indigo: {
    bg: 'bg-indigo-500/10 dark:bg-indigo-400/15',
    border: 'border-indigo-400/40 dark:border-indigo-400/30',
    text: 'text-indigo-700 dark:text-indigo-200',
    dot: 'bg-indigo-500',
    glow: 'shadow-[0_10px_30px_-8px_rgba(99,102,241,0.5)]',
    line: '#6366f1',
  },
}

export const DEFAULT_BADGES = [
  { label: 'Research', icon: '🔍', x: 10, y: 20, delay: 0, color: 'purple', duration: 7, driftX: 6, driftY: 14, rotate: 2 },
  { label: 'Market Sizing', icon: '📈', x: 88, y: 12, delay: 0.4, color: 'green', duration: 8.5, driftX: -8, driftY: 12, rotate: -2 },
  { label: 'Unit Economics', icon: '💰', x: 92, y: 50, delay: 0.8, color: 'pink', duration: 6.5, driftX: 7, driftY: 10, rotate: 2 },
  { label: 'MVP Strategy', icon: '🛠️', x: 8, y: 55, delay: 1.2, color: 'coral', duration: 9, driftX: -6, driftY: 16, rotate: -1.5 },
  { label: 'Compliance', icon: '⚖️', x: 20, y: 88, delay: 1.6, color: 'amber', duration: 7.5, driftX: 8, driftY: 11, rotate: 1.5 },
  { label: 'CEO Verdict', icon: '👨‍💼', x: 80, y: 90, delay: 2, color: 'cyan', duration: 8, driftX: -7, driftY: 13, rotate: -2 },
  { label: 'AI Co-founders', icon: '🤖', x: 50, y: 8, delay: 2.4, color: 'indigo', duration: 9.5, driftX: 5, driftY: 9, rotate: 2 },
]

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

/**
 * Absolutely-positioned field of floating badges connected by a subtle,
 * glowing network of lines, with a light parallax response to the cursor.
 */
export default function FloatingBadgeField({ badges = DEFAULT_BADGES, className = '', linkDistance = 55 }) {
  const containerRef = useRef(null)
  const [mouse, setMouse] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    setMouse({
      x: ((e.clientX - rect.left) / rect.width - 0.5) * 2,
      y: ((e.clientY - rect.top) / rect.height - 0.5) * 2,
    })
  }

  const handleMouseLeave = () => setMouse({ x: 0, y: 0 })

  const lines = useMemo(() => {
    const pairs = []
    for (let i = 0; i < badges.length; i++) {
      for (let j = i + 1; j < badges.length; j++) {
        if (distance(badges[i], badges[j]) <= linkDistance) pairs.push([badges[i], badges[j]])
      }
    }
    return pairs
  }, [badges, linkDistance])

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`absolute inset-0 ${className}`}
    >
      <svg className="absolute inset-0 h-full w-full overflow-visible">
        <defs>
          <filter id="badge-node-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="1.6" />
          </filter>
        </defs>

        {lines.map(([a, b], i) => {
          const style = COLOR_STYLES[a.color] || COLOR_STYLES.indigo
          const x1 = `${a.x + mouse.x * 2}%`
          const y1 = `${a.y + mouse.y * 2}%`
          const x2 = `${b.x + mouse.x * 2}%`
          const y2 = `${b.y + mouse.y * 2}%`
          return (
            <g key={`${a.label}-${b.label}`}>
              <motion.line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={style.line}
                strokeWidth="1"
                initial={{ opacity: 0.12 }}
                animate={{ opacity: [0.12, 0.18, 0.12] }}
                transition={{ duration: 4 + i * 0.3, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.circle
                r="3"
                fill={style.line}
                filter="url(#badge-node-glow)"
                initial={{ cx: x1, cy: y1, opacity: 0 }}
                animate={{ cx: [x1, x2, x1], cy: [y1, y2, y1], opacity: [0, 0.9, 0] }}
                transition={{ duration: 5 + i * 0.4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.6 }}
              />
            </g>
          )
        })}
      </svg>

      {badges.map((badge, i) => {
        const style = COLOR_STYLES[badge.color] || COLOR_STYLES.indigo
        const strength = 12 + (i % 3) * 6
        return (
          <motion.div
            key={badge.label}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${badge.x}%`, top: `${badge.y}%` }}
            animate={{ x: mouse.x * strength, y: mouse.y * strength }}
            transition={{ type: 'spring', stiffness: 50, damping: 14, mass: 0.7 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: 1,
                scale: 1,
                x: [0, badge.driftX, 0, -badge.driftX * 0.6, 0],
                y: [0, -badge.driftY, 0, badge.driftY * 0.5, 0],
                rotate: [0, badge.rotate, 0, -badge.rotate, 0],
              }}
              transition={{
                opacity: { duration: 0.5, delay: badge.delay },
                scale: { duration: 0.5, delay: badge.delay },
                x: { duration: badge.duration, repeat: Infinity, ease: 'easeInOut', delay: badge.delay },
                y: { duration: badge.duration * 0.85, repeat: Infinity, ease: 'easeInOut', delay: badge.delay + 0.3 },
                rotate: { duration: badge.duration * 1.15, repeat: Infinity, ease: 'easeInOut', delay: badge.delay + 0.15 },
              }}
            >
              <span
                className={`flex items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-xs font-medium backdrop-blur-md ${style.bg} ${style.border} ${style.text} ${style.glow}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                <span>{badge.icon}</span> {badge.label}
              </span>
            </motion.div>
          </motion.div>
        )
      })}
    </div>
  )
}
