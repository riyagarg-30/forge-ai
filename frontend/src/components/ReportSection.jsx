import { motion } from 'framer-motion'

export default function ReportSection({ title, icon, children, delay = 0 }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay }}
      className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-xl"
    >
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.06] text-lg">
          {icon}
        </span>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </div>
      <div className="text-sm leading-relaxed text-slate-300">{children}</div>
    </motion.section>
  )
}

export function ReportList({ items }) {
  if (!items?.length) return null
  return (
    <ul className="mt-3 space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5">
          <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-forge-purple/60" />
          <span>{typeof item === 'string' ? item : item.name || item.risk || JSON.stringify(item)}</span>
        </li>
      ))}
    </ul>
  )
}

export function ReportGrid({ items }) {
  if (!items?.length) return null
  return (
    <div className="mt-3 grid gap-3 sm:grid-cols-2">
      {items.map((item, i) => (
        <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
          {typeof item === 'object' ? (
            <>
              {item.name && <p className="font-medium text-white">{item.name}</p>}
              {item.description && <p className="mt-1 text-xs text-slate-400">{item.description}</p>}
              {item.amount && (
                <p className="mt-1 text-xs text-slate-400">
                  {item.category}: <span className="text-white">{item.amount}</span>
                </p>
              )}
              {item.severity && (
                <p className="mt-1 text-xs">
                  <span className="text-slate-400">{item.risk}</span>
                  <span className={`ml-2 rounded px-1.5 py-0.5 text-[10px] font-medium ${
                    item.severity === 'High' ? 'bg-rose-500/20 text-rose-400' :
                    item.severity === 'Medium' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {item.severity}
                  </span>
                </p>
              )}
            </>
          ) : (
            <p>{item}</p>
          )}
        </div>
      ))}
    </div>
  )
}
