import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import WorkspaceLayout from '../components/WorkspaceLayout'
import AgentStatusGrid from '../components/AgentStatusGrid'
import AgentPipelineCard from '../components/AgentPipelineCard'
import LiveDebate from '../components/LiveDebate'
import { PARALLEL_AGENTS, getAgentMeta } from '../constants/agents'
import { api } from '../lib/api'

const POLL_INTERVAL_MS = 1500

const DEBATE_AGENT = getAgentMeta('debate')
const CEO_AGENT = getAgentMeta('ceo')

/**
 * Pure observer of backend-driven pipeline state. This page starts nothing
 * and executes nothing — it polls session/agent status and displays
 * whatever the orchestrator has actually done so far.
 */
export default function AnalysisPipeline() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const [session, setSession] = useState(null)
  const [agentResults, setAgentResults] = useState({})
  const [error, setError] = useState('')
  const pollRef = useRef(null)

  useEffect(() => {
    let cancelled = false

    async function poll() {
      try {
        const data = await api.getSession(sessionId)
        if (cancelled) return

        setSession(data.session)
        const map = {}
        for (const row of data.agentResults) map[row.agent_key] = row
        setAgentResults(map)

        if (data.session.status === 'completed') {
          if (pollRef.current) clearInterval(pollRef.current)
          setTimeout(() => {
            if (!cancelled) navigate(`/analysis/${sessionId}/report`, { replace: true })
          }, 900)
        } else if (data.session.status === 'failed') {
          if (pollRef.current) clearInterval(pollRef.current)
        }
      } catch (err) {
        if (!cancelled) setError(err.message)
      }
    }

    poll()
    pollRef.current = setInterval(poll, POLL_INTERVAL_MS)

    return () => {
      cancelled = true
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [sessionId, navigate])

  const debateResult = agentResults.debate
  const ceoResult = agentResults.ceo

  const parallelComplete = PARALLEL_AGENTS.filter(
    (a) => ['completed', 'failed'].includes(agentResults[a.key]?.status)
  ).length
  const parallelProgress = Math.round((parallelComplete / PARALLEL_AGENTS.length) * 100)
  const parallelDone = parallelComplete === PARALLEL_AGENTS.length

  const stage = ceoResult && ceoResult.status !== 'pending'
    ? 'ceo'
    : debateResult && debateResult.status !== 'pending'
      ? 'debate'
      : 'parallel'

  const sessionFailed = session?.status === 'failed'

  return (
    <WorkspaceLayout title="Live Analysis">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="mb-2 flex items-center gap-3">
            <PhaseIndicator stage={stage} />
          </div>
          <h1 className="text-xl font-bold text-white sm:text-2xl">
            {stage === 'parallel' && 'AI co-founders analyzing in parallel'}
            {stage === 'debate' && 'Investment Committee Debate'}
            {stage === 'ceo' && 'CEO Agent final review'}
          </h1>
          {session && (
            <p className="mt-2 text-sm text-slate-400 line-clamp-2">
              {session.startup_name && <span className="text-forge-purple">{session.startup_name}</span>}
              {session.startup_name && ' — '}
              &ldquo;{session.idea_text}&rdquo;
            </p>
          )}
        </motion.div>

        {error && (
          <div className="mb-6 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
            {error}
          </div>
        )}

        {sessionFailed && (
          <div className="mb-6 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
            The analysis pipeline failed to complete.{' '}
            <Link to={`/analysis/${sessionId}/report`} className="underline hover:text-rose-300">
              View partial results
            </Link>
            {' · '}
            <Link to="/dashboard" className="underline hover:text-rose-300">
              Back to workspace
            </Link>
          </div>
        )}

        <AnimatePresence mode="wait">
          {stage === 'parallel' && (
            <motion.div key="parallel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="mb-6">
                <div className="mb-2 flex justify-between text-xs">
                  <span className="text-slate-500">{parallelComplete} of {PARALLEL_AGENTS.length} agents done</span>
                  <span className="font-mono text-slate-400">{parallelProgress}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                  <motion.div
                    className="h-full rounded-full bg-forge-gradient"
                    animate={{ width: `${parallelProgress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
              <AgentStatusGrid
                agents={PARALLEL_AGENTS}
                agentResults={agentResults}
                activeKeys={PARALLEL_AGENTS.filter((a) => agentResults[a.key]?.status === 'running').map((a) => a.key)}
              />
              {parallelDone && !debateResult && (
                <p className="mt-4 text-center text-xs text-slate-500">Preparing the investment committee debate…</p>
              )}
            </motion.div>
          )}

          {stage === 'debate' && DEBATE_AGENT && (
            <motion.div key="debate" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {debateResult?.status === 'completed' ? (
                <LiveDebate debateResult={debateResult.result} isLive={false} />
              ) : (
                <div className="max-w-md mx-auto">
                  <AgentPipelineCard
                    agent={DEBATE_AGENT}
                    status={debateResult?.status || 'running'}
                    index={0}
                    isActive
                    preview={debateResult?.progress_message || 'The investment committee is debating the findings…'}
                  />
                </div>
              )}
            </motion.div>
          )}

          {stage === 'ceo' && CEO_AGENT && (
            <motion.div
              key="ceo"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="max-w-md mx-auto"
            >
              <AgentPipelineCard
                agent={CEO_AGENT}
                status={ceoResult?.status || 'running'}
                index={0}
                isActive
                preview={ceoResult?.progress_message || 'CEO Agent is independently evaluating the venture…'}
              />
              {ceoResult?.status === 'completed' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 text-center">
                  <p className="text-lg font-semibold text-white">Analysis complete</p>
                  <p className="mt-2 text-sm text-slate-400">Opening your intelligence report…</p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </WorkspaceLayout>
  )
}

function PhaseIndicator({ stage }) {
  const phases = [
    { key: 'parallel', label: 'Parallel Analysis' },
    { key: 'debate', label: 'Committee Debate' },
    { key: 'ceo', label: 'CEO Review' },
  ]

  return (
    <div className="flex items-center gap-2">
      {phases.map((p, i) => {
        const isActive = p.key === stage
        const isPast = phases.findIndex((x) => x.key === stage) > i
        return (
          <div key={p.key} className="flex items-center gap-2">
            {i > 0 && <span className="text-slate-700">→</span>}
            <span
              className={`rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-wider ${
                isActive
                  ? 'bg-forge-purple/20 text-forge-purple'
                  : isPast
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-white/[0.04] text-slate-600'
              }`}
            >
              {p.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
