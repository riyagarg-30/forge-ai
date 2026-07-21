import { motion } from 'framer-motion'

const bars = [40, 65, 35, 80, 55, 90, 60, 75, 50, 85, 45, 70]

export default function ChartPlaceholder({ title, subtitle, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="glass-panel p-6"
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="text-sm text-slate-400">{subtitle}</p>
        </div>
        <div className="flex gap-2">
          {['1W', '1M', '1Y'].map((range, i) => (
            <button
              key={range}
              className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                i === 1
                  ? 'bg-forge-gradient text-white'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>
      <div className="flex h-48 items-end gap-2">
        {bars.map((height, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${height}%` }}
            transition={{ duration: 0.6, delay: delay + i * 0.03 }}
            className="flex-1 rounded-t-md bg-forge-gradient opacity-80"
          />
        ))}
      </div>
    </motion.div>
  )
}
