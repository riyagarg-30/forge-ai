function normalizeUrl(url) {
  if (!url) return null
  return /^https?:\/\//i.test(url) ? url : `https://${url}`
}

export function ReportList({ items }) {
  if (!items?.length) return null
  return (
    <ul className="mt-3 space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5">
          <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-forge-purple/60" />
          <span className="text-sm text-slate-300">
            {typeof item === 'string' ? item : item.name || item.risk || JSON.stringify(item)}
          </span>
        </li>
      ))}
    </ul>
  )
}

const SEVERITY_STYLES = {
  High: 'border-rose-500/30 bg-rose-500/15 text-rose-400',
  Medium: 'border-amber-500/30 bg-amber-500/15 text-amber-400',
  Low: 'border-emerald-500/30 bg-emerald-500/15 text-emerald-400',
}

/** Cards for legal/financial risk items: { risk, severity, mitigation } */
export function RiskGrid({ items }) {
  if (!items?.length) return null
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((r, i) => (
        <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium text-slate-200">{r.risk}</p>
            <span
              className={`flex-shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                SEVERITY_STYLES[r.severity] || SEVERITY_STYLES.Medium
              }`}
            >
              {r.severity}
            </span>
          </div>
          {r.mitigation && (
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              <span className="text-slate-400">Mitigation: </span>{r.mitigation}
            </p>
          )}
        </div>
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
        <div
          key={i}
          className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 transition-colors hover:border-white/15 hover:bg-white/[0.05]"
        >
          <div className="flex items-start justify-between gap-2">
            <h5 className="text-sm font-semibold text-white">{c.name}</h5>
            {c.website && (
              <a
                href={normalizeUrl(c.website)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 rounded-full bg-white/[0.06] px-2.5 py-1 text-[10px] font-medium text-forge-purple transition-colors hover:bg-forge-purple/20 hover:text-white"
              >
                Visit ↗
              </a>
            )}
          </div>
          {c.description && <p className="mt-2 text-xs leading-relaxed text-slate-400">{c.description}</p>}
          {c.whyRelevant && (
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              <span className="text-slate-400">Why it matters: </span>{c.whyRelevant}
            </p>
          )}
          {(c.strengths?.length > 0 || c.weaknesses?.length > 0) && (
            <div className="mt-3 grid grid-cols-2 gap-3 border-t border-white/[0.06] pt-3">
              {c.strengths?.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">Strengths</p>
                  <ul className="mt-1.5 space-y-1">
                    {c.strengths.map((s, si) => (
                      <li key={si} className="text-[11px] leading-relaxed text-slate-400">+ {s}</li>
                    ))}
                  </ul>
                </div>
              )}
              {c.weaknesses?.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-rose-400">Weaknesses</p>
                  <ul className="mt-1.5 space-y-1">
                    {c.weaknesses.map((w, wi) => (
                      <li key={wi} className="text-[11px] leading-relaxed text-slate-400">− {w}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

/** Cost breakdown as a real table: { category, amount, notes } */
export function CostBreakdownTable({ items }) {
  if (!items?.length) return null
  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.06]">
      <table className="w-full text-left text-sm">
        <thead className="bg-white/[0.03]">
          <tr>
            <th className="px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-slate-500">Category</th>
            <th className="px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-slate-500">Amount</th>
            <th className="px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-slate-500">Notes</th>
          </tr>
        </thead>
        <tbody>
          {items.map((c, i) => (
            <tr key={i} className="border-t border-white/[0.06]">
              <td className="px-3 py-2 text-slate-200">{c.category}</td>
              <td className="px-3 py-2 font-medium text-white">{c.amount}</td>
              <td className="px-3 py-2 text-xs text-slate-500">{c.notes}</td>
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
            className="group flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 transition-colors hover:border-forge-purple/30 hover:bg-white/[0.04]"
          >
            <span className="flex min-w-0 items-center gap-2">
              <span className="flex-shrink-0 text-xs text-slate-500">🔗</span>
              <span className="truncate text-sm text-slate-300 underline decoration-white/20 underline-offset-2 group-hover:text-white group-hover:decoration-forge-purple">
                {label}
              </span>
            </span>
            {type && (
              <span className="flex-shrink-0 rounded-full bg-forge-purple/10 px-2 py-0.5 text-[10px] font-medium text-forge-purple">
                {type}
              </span>
            )}
          </a>
        )
      })}
    </div>
  )
}
