import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import WorkspaceLayout from '../components/WorkspaceLayout'
import AnalysisSidebar from '../components/AnalysisSidebar'
import FollowUpModal from '../components/FollowUpModal'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'

const suggestions = [
  'An AI-powered platform that helps freelancers manage contracts and invoices',
  'A B2B SaaS tool for automating compliance reporting in fintech',
  'A mobile app connecting local farmers directly with restaurants in India',
  'A D2C marketplace for verified carbon offset credits for SMBs',
  'An AI healthcare assistant for patient triage and appointment scheduling',
]

export default function Workspace() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [idea, setIdea] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [error, setError] = useState('')

  const firstName = (user?.user_metadata?.full_name || user?.email || '').split(' ')[0] || 'founder'

  const handleSubmit = (e) => {
    e.preventDefault()
    if (idea.trim().length < 10) {
      setError('Please describe your idea in at least 10 characters.')
      return
    }
    setError('')
    setModalOpen(true)
  }

  const handleConfirm = async (businessDetails) => {
    setConfirmLoading(true)
    setError('')
    try {
      const { session } = await api.analyze(idea.trim(), businessDetails)
      setModalOpen(false)
      navigate(`/analysis/${session.id}`)
    } catch (err) {
      setError(err.message || 'Failed to start analysis.')
      setConfirmLoading(false)
    }
  }

  const handleNewAnalysis = () => {
    setIdea('')
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <WorkspaceLayout showSidebar sidebar={<AnalysisSidebar onNewAnalysis={handleNewAnalysis} />}>
      <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-3xl"
        >
          <div className="mb-10 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs text-slate-400 backdrop-blur-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              7 AI co-founders ready to analyze your idea
            </motion.div>

            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
              Hey {firstName},{' '}
              <span className="gradient-text">validate your startup</span>
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-slate-400 sm:text-base">
              Describe your idea and watch our AI co-founder team research, debate, and deliver
              a build recommendation — transparently, in real time.
            </p>
          </div>

          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-1 backdrop-blur-xl shadow-[0_0_60px_rgba(139,92,246,0.08)]">
              <textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="Describe your startup idea…"
                rows={4}
                className="w-full resize-none rounded-xl bg-transparent px-5 py-4 text-sm text-slate-100 placeholder-slate-500 outline-none sm:text-base"
              />
              <div className="flex items-center justify-between border-t border-white/[0.06] px-4 py-3">
                <span className="text-[11px] text-slate-500">
                  {idea.length > 0 ? `${idea.length} characters` : 'Be specific — the more detail, the better the analysis'}
                </span>
                <button
                  type="submit"
                  disabled={idea.trim().length < 10}
                  className="inline-flex items-center gap-2 rounded-xl bg-forge-gradient px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-900/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                >
                  Analyze Idea
                  <span className="text-base">→</span>
                </button>
              </div>
            </div>

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-center text-sm text-rose-400">
                {error}
              </motion.p>
            )}
          </motion.form>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-8">
            <p className="mb-3 text-center text-xs text-slate-500">Try an example</p>
            <div className="flex flex-wrap justify-center gap-2">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setIdea(s)}
                  className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[11px] text-slate-400 transition-colors hover:border-white/15 hover:bg-white/[0.06] hover:text-slate-200"
                >
                  {s.length > 55 ? s.slice(0, 55) + '…' : s}
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-3"
          >
            {['🔍 Research', '📈 Market', '💰 Finance', '🛠️ Product', '⚖️ Legal', '🤝 Debate', '👨‍💼 CEO'].map(
              (label) => (
                <span key={label} className="rounded-lg border border-white/[0.05] bg-white/[0.02] px-2.5 py-1 text-[10px] text-slate-500">
                  {label}
                </span>
              )
            )}
          </motion.div>
        </motion.div>
      </div>

      <FollowUpModal
        open={modalOpen}
        ideaText={idea}
        onClose={() => !confirmLoading && setModalOpen(false)}
        onConfirm={handleConfirm}
        loading={confirmLoading}
      />
    </WorkspaceLayout>
  )
}
