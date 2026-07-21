import { motion } from 'framer-motion'

export default function AnalyticsCard({ title, value, change, positive = true, icon, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4 }}
      className="glass-panel relative overflow-hidden p-5"
    >
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-forge-gradient opacity-20 blur-2xl" />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400">{title}</p>
          <h3 className="mt-2 text-2xl font-bold text-white">{value}</h3>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-forge-gradient text-lg shadow-lg shadow-purple-900/40">
          {icon}
        </div>
      </div>
      <div className="relative mt-4 flex items-center gap-1.5 text-sm">
        <span className={positive ? 'text-emerald-400' : 'text-rose-400'}>
          {positive ? '▲' : '▼'} {change}
        </span>
        <span className="text-slate-500">vs last month</span>
      </div>
    </motion.div>
  )
}
