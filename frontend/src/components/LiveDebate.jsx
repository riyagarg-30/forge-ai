import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const TYPE_STYLES = {
  statement: { border: 'border-white/10', badge: null },
  agreement: { border: 'border-emerald-500/20', badge: { text: 'Agrees', color: 'text-emerald-400 bg-emerald-500/10' } },
  challenge: { border: 'border-rose-500/20', badge: { text: 'Challenges', color: 'text-rose-400 bg-rose-500/10' } },
  counter: { border: 'border-amber-500/20', badge: { text: 'Counter', color: 'text-amber-400 bg-amber-500/10' } },
  evidence: { border: 'border-blue-500/20', badge: { text: 'Evidence', color: 'text-blue-400 bg-blue-500/10' } },
  consensus: { border: 'border-forge-purple/30', badge: { text: 'Consensus', color: 'text-forge-purple bg-forge-purple/10' } },
}

function TypingIndicator({ agentName, icon }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-3"
    >
      <span className="text-lg">{icon}</span>
      <div>
        <p className="text-xs font-medium text-slate-400">{agentName} is typing</p>
        <div className="mt-1 flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-forge-purple"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default function LiveDebate({ debateResult, isLive = false }) {
  const [visibleCount, setVisibleCount] = useState(0)
  const [typingAgent, setTypingAgent] = useState(null)
  const messages = debateResult?.messages || []
  const scrollRef = useRef(null)

  useEffect(() => {
    if (!isLive || messages.length === 0) {
      setVisibleCount(messages.length)
      return
    }

    setVisibleCount(0)
    let i = 0

    const showNext = () => {
      if (i >= messages.length) {
        setTypingAgent(null)
        return
      }

      const msg = messages[i]
      setTypingAgent(msg)
      const typingDuration = 1200 + Math.random() * 800

      setTimeout(() => {
        setTypingAgent(null)
        setVisibleCount(i + 1)
        i += 1
        setTimeout(showNext, 400)
      }, typingDuration)
    }

    const timer = setTimeout(showNext, 600)
    return () => clearTimeout(timer)
  }, [isLive, messages])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [visibleCount, typingAgent])

  const visibleMessages = messages.slice(0, visibleCount)
  const summary = debateResult

  return (
    <div className="flex flex-col gap-6">
      <div
        ref={scrollRef}
        className="max-h-[480px] space-y-3 overflow-y-auto rounded-2xl border border-white/[0.06] bg-black/20 p-4"
      >
        <AnimatePresence mode="popLayout">
          {visibleMessages.map((msg, index) => {
            const style = TYPE_STYLES[msg.type] || TYPE_STYLES.statement
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.35 }}
                className={`rounded-2xl border p-4 ${style.border} bg-white/[0.03]`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-lg">
                    {msg.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-white">{msg.agentName}</span>
                      {style.badge && (
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${style.badge.color}`}>
                          {style.badge.text}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-slate-300">{msg.content}</p>
                  </div>
                </div>
                {index < visibleMessages.length - 1 && (
                  <div className="ml-12 mt-3 flex justify-center">
                    <span className="text-slate-600">↓</span>
                  </div>
                )}
              </motion.div>
            )
          })}

          {typingAgent && (
            <TypingIndicator agentName={typingAgent.agentName} icon={typingAgent.icon} />
          )}
        </AnimatePresence>
      </div>

      {summary && visibleCount >= messages.length && !typingAgent && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-4 sm:grid-cols-2"
        >
          <DebateSummaryCard title="Agreements" items={summary.agreements} color="emerald" />
          <DebateSummaryCard title="Disagreements" items={summary.disagreements} color="amber" />
          <DebateSummaryCard title="Remaining Risks" items={summary.remainingRisks} color="rose" />
          <div className="rounded-2xl border border-forge-purple/20 bg-forge-purple/5 p-4 sm:col-span-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-forge-purple">Consensus</h4>
            <p className="mt-2 text-sm text-slate-300">{summary.consensus}</p>
            {summary.influentialArguments?.length > 0 && (
              <div className="mt-4">
                <h5 className="text-[10px] uppercase tracking-wider text-slate-500">Most Influential Arguments</h5>
                <ul className="mt-2 space-y-2">
                  {summary.influentialArguments.map((arg, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                      <span className="font-medium text-white">{arg.agent}:</span>
                      {arg.argument}
                      <span className={`ml-auto rounded px-1.5 py-0.5 text-[9px] uppercase ${arg.impact === 'high' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
                        {arg.impact}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  )
}

function DebateSummaryCard({ title, items, color }) {
  const colors = {
    emerald: 'border-emerald-500/20 text-emerald-400',
    amber: 'border-amber-500/20 text-amber-400',
    rose: 'border-rose-500/20 text-rose-400',
  }

  return (
    <div className={`rounded-2xl border bg-white/[0.02] p-4 ${colors[color]?.split(' ')[0] || ''}`}>
      <h4 className={`text-xs font-semibold uppercase tracking-wider ${colors[color]?.split(' ')[1] || 'text-slate-400'}`}>
        {title}
      </h4>
      <ul className="mt-3 space-y-2">
        {(items || []).map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
            <span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-current opacity-50" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
