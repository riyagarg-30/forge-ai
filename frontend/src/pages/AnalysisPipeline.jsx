import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import WorkspaceLayout from '../components/WorkspaceLayout'
import AgentStatusGrid from '../components/AgentStatusGrid'
import LiveDebate from '../components/LiveDebate'
import AgentPipelineCard from '../components/AgentPipelineCard'
import {
  PARALLEL_AGENTS,
  PARALLEL_AGENT_KEYS,
  PHASES,
  getAgentMeta,
} from '../constants/agents'
import { api } from '../lib/api'

const CEO_AGENT = getAgentMeta('ceo')
const DEBATE_AGENT = getAgentMeta('debate')

export default function AnalysisPipeline() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const [session, setSession] = useState(null)
  const [agentResults, setAgentResults] = useState({})
  const [phase, setPhase] = useState(PHASES.PARALLEL)
  const [error, setError] = useState('')
  const [debateLive, setDebateLive] = useState(false)
  const runningRef = useRef(false)
  const pollRef = useRef(null)

  const loadSession = useCallback(async () => {
    const data = await api.getSession(sessionId)
    setSession(data.session)
    const map = {}
    for (const ar of data.agentResults) {
      map[ar.agent_key] = ar
    }
    setAgentResults(map)
    return map
  }, [sessionId])

  const startPolling = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current)
    pollRef.current = setInterval(async () => {
      try {
        const map = await loadSession()
        const allParallelDone = PARALLEL_AGENT_KEYS.every((k) =>
          ['completed', 'failed'].includes(map[k]?.status)
        )
        if (allParallelDone && pollRef.current) {
          clearInterval(pollRef.current)
          pollRef.current = null
        }
      } catch {
        /* ignore poll errors */
      }
    }, 800)
  }, [loadSession])

  useEffect(() => {
    let cancelled = false

    async function runPipeline() {
      try {
        const map = await loadSession()
        if (cancelled) return

        if (map.ceo?.status === 'completed') {
          navigate(`/analysis/${sessionId}/report`, { replace: true })
          return
        }

        if (runningRef.current) return
        runningRef.current = true

        // Phase 1: Parallel agents
        const parallelIncomplete = PARALLEL_AGENT_KEYS.filter((k) => map[k]?.status !== 'completed')
        if (parallelIncomplete.length > 0) {
          setPhase(PHASES.PARALLEL)
          startPolling()

          await Promise.all(
            parallelIncomplete.map((key) =>
              api.runAgent(sessionId, key).catch((err) => {
                if (!cancelled) setError(`Agent ${key} failed: ${err.message}`)
              })
            )
          )

          if (pollRef.current) {
            clearInterval(pollRef.current)
            pollRef.current = null
          }
          await loadSession()
          if (cancelled) return
        }

        // Phase 2: Debate
        setPhase(PHASES.DEBATE)
        const freshMap = await loadSession()
        let debateResult = freshMap.debate

        if (debateResult?.status !== 'completed') {
          const { agentResult } = await api.runAgent(sessionId, 'debate')
          if (cancelled) return
          debateResult = agentResult
          setAgentResults((prev) => ({ ...prev, debate: agentResult }))
        } else {
          setAgentResults((prev) => ({ ...prev, debate: freshMap.debate }))
        }

        // Animate live debate messages before CEO review
        setDebateLive(true)
        const messageCount = debateResult?.result?.messages?.length || 9
        await new Promise((r) => setTimeout(r, messageCount * 1600 + 2500))
        if (cancelled) return
        setDebateLive(false)

        // Phase 3: CEO
        const preCeoMap = await loadSession()
        if (preCeoMap.ceo?.status !== 'completed') {
          setPhase(PHASES.CEO)
          setDebateLive(false)

          const { agentResult } = await api.runAgent(sessionId, 'ceo')
          if (cancelled) return
          setAgentResults((prev) => ({ ...prev, ceo: agentResult }))
        }

        if (!cancelled) {
          setPhase(PHASES.COMPLETE)
          runningRef.current = false
          setTimeout(() => {
            navigate(`/analysis/${sessionId}/report`, { replace: true })
          }, 1500)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message)
          runningRef.current = false
        }
      }
    }

    runPipeline()

    return () => {
      cancelled = true
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [sessionId, loadSession, navigate, startPolling])

  const parallelComplete = PARALLEL_AGENT_KEYS.filter((k) => agentResults[k]?.status === 'completed').length
  const parallelProgress = Math.round((parallelComplete / PARALLEL_AGENT_KEYS.length) * 100)

  return (
    <WorkspaceLayout title="Live Analysis">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="mb-2 flex items-center gap-3">
            <PhaseIndicator phase={phase} />
          </div>
          <h1 className="text-xl font-bold text-white sm:text-2xl">
            {phase === PHASES.PARALLEL && 'AI co-founders analyzing in parallel'}
            {phase === PHASES.DEBATE && 'Live Debate Engine'}
            {phase === PHASES.CEO && 'CEO Agent final review'}
            {phase === PHASES.COMPLETE && 'Analysis complete'}
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

        <AnimatePresence mode="wait">
          {phase === PHASES.PARALLEL && (
            <motion.div
              key="parallel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="mb-6">
                <div className="mb-2 flex justify-between text-xs">
                  <span className="text-slate-500">{parallelComplete} of {PARALLEL_AGENT_KEYS.length} agents complete</span>
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
                activeKeys={PARALLEL_AGENT_KEYS.filter((k) => agentResults[k]?.status === 'running')}
              />
            </motion.div>
          )}

          {phase === PHASES.DEBATE && (
            <motion.div
              key="debate"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <LiveDebate
                debateResult={agentResults.debate?.result}
                isLive={debateLive}
              />
              {!agentResults.debate?.result && (
                <p className="mt-4 text-center text-xs text-slate-500">Agents are debating in real time…</p>
              )}
            </motion.div>
          )}

          {phase === PHASES.CEO && CEO_AGENT && (
            <motion.div
              key="ceo"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="max-w-md mx-auto"
            >
              <AgentPipelineCard
                agent={CEO_AGENT}
                status={agentResults.ceo?.status || 'running'}
                index={0}
                isActive
                preview={agentResults.ceo?.progress_message || 'CEO Agent is synthesizing all findings…'}
              />
            </motion.div>
          )}

          {phase === PHASES.COMPLETE && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-5xl"
              >
                ✓
              </motion.div>
              <p className="mt-4 text-lg font-semibold text-white">Analysis complete</p>
              <p className="mt-2 text-sm text-slate-400">Opening your intelligence report…</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </WorkspaceLayout>
  )
}

function PhaseIndicator({ phase }) {
  const phases = [
    { key: PHASES.PARALLEL, label: 'Parallel Analysis' },
    { key: PHASES.DEBATE, label: 'Live Debate' },
    { key: PHASES.CEO, label: 'CEO Review' },
  ]

  return (
    <div className="flex items-center gap-2">
      {phases.map((p, i) => {
        const isActive = p.key === phase
        const isPast = phases.findIndex((x) => x.key === phase) > i
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
