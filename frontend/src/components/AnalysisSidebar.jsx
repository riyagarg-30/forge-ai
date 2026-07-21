import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { api } from '../lib/api'

export default function AnalysisSidebar({ onNewAnalysis }) {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api.listSessions()
      .then(({ sessions: data }) => setSessions(data || []))
      .catch(() => setSessions([]))
      .finally(() => setLoading(false))
  }, [])

  const statusColor = {
    pending: 'bg-slate-500',
    running: 'bg-amber-400 animate-pulse',
    completed: 'bg-emerald-400',
    failed: 'bg-rose-400',
  }

  return (
    <aside className="hidden w-72 flex-shrink-0 flex-col border-r border-white/[0.06] bg-forge-surface/40 backdrop-blur-xl lg:flex">
      <div className="border-b border-white/[0.06] p-4">
        <button
          onClick={onNewAnalysis}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-forge-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-900/20 transition-all hover:scale-[1.02]"
        >
          <span>+</span> New Analysis
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <p className="mb-3 px-2 text-[10px] font-medium uppercase tracking-widest text-slate-500">
          Recent Analyses
        </p>

        {loading ? (
          <div className="space-y-2 px-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-white/[0.03] shimmer" />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <p className="px-2 text-xs text-slate-500">No analyses yet. Start your first one!</p>
        ) : (
          <div className="space-y-1">
            {sessions.map((session, i) => (
              <motion.button
                key={session.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => {
                  if (session.status === 'completed') {
                    navigate(`/analysis/${session.id}/report`)
                  } else {
                    navigate(`/analysis/${session.id}`)
                  }
                }}
                className="group w-full rounded-xl border border-transparent p-3 text-left transition-all hover:border-white/10 hover:bg-white/[0.04]"
              >
                <div className="flex items-start gap-2">
                  <span className={`mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full ${statusColor[session.status] || statusColor.pending}`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-200 group-hover:text-white">
                      {session.startup_name || 'Untitled'}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-[11px] text-slate-500">
                      {session.idea_text}
                    </p>
                    <p className="mt-1 text-[10px] text-slate-600">
                      {new Date(session.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-white/[0.06] p-4">
        <Link to="/settings" className="block text-xs text-slate-500 hover:text-slate-300">
          Settings
        </Link>
      </div>
    </aside>
  )
}
