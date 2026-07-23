import { motion } from 'framer-motion'

function normalizeUrl(url) {
  if (!url) return null
  return /^https?:\/\//i.test(url) ? url : `https://${url}`
}

export function ReportList({ items }) {
  if (!items?.length) return null
  return (
    <ul className="mt-3 space-y-2">
      {items.map((item, i) => (
        <motion.li
          key={i}
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: Math.min(i, 8) * 0.04 }}
          className="flex items-start gap-2.5"
        >
          <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-landing-accent/70" />
          <span className="text-sm text-landing-text">
            {typeof item === 'string' ? item : item.name || item.risk || JSON.stringify(item)}
          </span>
        </motion.li>
      ))}
    </ul>
  )
}

const SEVERITY_STYLES = {
  High: 'border-rose-200 bg-rose-50 text-rose-600',
  Medium: 'border-amber-200 bg-amber-50 text-amber-600',
  Low: 'border-emerald-200 bg-emerald-50 text-emerald-600',
}

/** Cards for legal/financial risk items: { risk, severity, mitigation } */
export function RiskGrid({ items }) {
  if (!items?.length) return null
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((r, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: Math.min(i, 8) * 0.05 }}
          whileHover={{ y: -2 }}
          className="rounded-xl border border-landing-border bg-landing-card p-3.5 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium text-landing-text">{r.risk}</p>
            <span
              className={`flex-shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                SEVERITY_STYLES[r.severity] || SEVERITY_STYLES.Medium
              }`}
            >
              {r.severity}
            </span>
          </div>
          {r.mitigation && (
            <p className="mt-2 text-xs leading-relaxed text-landing-muted">
              <span className="font-medium text-landing-text">Mitigation: </span>{r.mitigation}
            </p>
          )}
        </motion.div>
      ))}
    </div>
  )
}

/** Polished competitor cards: { name, description, website, whyRelevant, strengths, weaknesses } */
export function CompetitorGrid({ items }) {
  if (!items?.length) return null
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map((c, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: Math.min(i, 8) * 0.05 }}
          whileHover={{ y: -2 }}
          className="rounded-2xl border border-landing-border bg-landing-card p-4 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex items-start justify-between gap-2">
            <h5 className="text-sm font-semibold text-landing-text">{c.name}</h5>
            {c.website && (
              <a
                href={normalizeUrl(c.website)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 rounded-full bg-landing-bg px-2.5 py-1 text-[10px] font-medium text-landing-accent transition-colors hover:bg-landing-accent/10"
              >
                Visit ↗
              </a>
            )}
          </div>
          {c.description && <p className="mt-2 text-xs leading-relaxed text-landing-muted">{c.description}</p>}
          {c.whyRelevant && (
            <p className="mt-2 text-xs leading-relaxed text-landing-muted">
              <span className="font-medium text-landing-text">Why it matters: </span>{c.whyRelevant}
            </p>
          )}
          {(c.strengths?.length > 0 || c.weaknesses?.length > 0) && (
            <div className="mt-3 grid grid-cols-2 gap-3 border-t border-landing-border pt-3">
              {c.strengths?.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600">Strengths</p>
                  <ul className="mt-1.5 space-y-1">
                    {c.strengths.map((s, si) => (
                      <li key={si} className="text-[11px] leading-relaxed text-landing-muted">+ {s}</li>
                    ))}
                  </ul>
                </div>
              )}
              {c.weaknesses?.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-rose-600">Weaknesses</p>
                  <ul className="mt-1.5 space-y-1">
                    {c.weaknesses.map((w, wi) => (
                      <li key={wi} className="text-[11px] leading-relaxed text-landing-muted">− {w}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  )
}

/** Cost breakdown as a real table: { category, amount, notes } */
export function CostBreakdownTable({ items }) {
  if (!items?.length) return null
  return (
    <div className="overflow-hidden rounded-xl border border-landing-border">
      <table className="w-full text-left text-sm">
        <thead className="bg-landing-bg">
          <tr>
            <th className="px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-landing-muted">Category</th>
            <th className="px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-landing-muted">Amount</th>
            <th className="px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-landing-muted">Notes</th>
          </tr>
        </thead>
        <tbody>
          {items.map((c, i) => (
            <tr key={i} className="border-t border-landing-border bg-landing-card transition-colors hover:bg-landing-bg">
              <td className="px-3 py-2 text-landing-text">{c.category}</td>
              <td className="px-3 py-2 font-medium text-landing-text">{c.amount}</td>
              <td className="px-3 py-2 text-xs text-landing-muted">{c.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** Real, clickable source links: { title, url, type } */
export function SourceList({ sources }) {
  if (!sources?.length) return null
  return (
    <div className="flex flex-col gap-2">
      {sources.map((source, i) => {
        const url = typeof source === 'string' ? source : source.url
        const label = typeof source === 'string' ? source : source.title || source.url
        const type = typeof source === 'string' ? null : source.type

        return (
          <a
            key={i}
            href={normalizeUrl(url)}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between gap-3 rounded-xl border border-landing-border bg-landing-card px-3 py-2 transition-colors hover:border-landing-accent/30 hover:bg-landing-bg"
          >
            <span className="flex min-w-0 items-center gap-2">
              <span className="flex-shrink-0 text-xs text-landing-muted">🔗</span>
              <span className="truncate text-sm text-landing-text underline decoration-landing-border underline-offset-2 group-hover:decoration-landing-accent">
                {label}
              </span>
            </span>
            {type && (
              <span className="flex-shrink-0 rounded-full bg-landing-accent/10 px-2 py-0.5 text-[10px] font-medium text-landing-accent">
                {type}
              </span>
            )}
          </a>
        )
      })}
    </div>
  )
}
