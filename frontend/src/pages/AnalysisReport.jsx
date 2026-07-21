import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import WorkspaceLayout from '../components/WorkspaceLayout'
import ScoreRing from '../components/ScoreRing'
import ReadinessScores from '../components/ReadinessScores'
import LiveDebate from '../components/LiveDebate'
import PrototypePreview from '../components/PrototypePreview'
import ExecutionRoadmap from '../components/ExecutionRoadmap'
import { ReportList, ReportGrid } from '../components/ReportSection'
import { api } from '../lib/api'

const TABS = [
  { id: 'summary', label: 'Executive Summary', icon: '✦' },
  { id: 'research', label: 'Research', icon: '🔍' },
  { id: 'market', label: 'Market', icon: '📈' },
  { id: 'finance', label: 'Finance', icon: '💰' },
  { id: 'product', label: 'Product', icon: '🛠️' },
  { id: 'legal', label: 'Legal', icon: '⚖️' },
  { id: 'prototype', label: 'Prototype', icon: '🎨' },
  { id: 'debate', label: 'Debate', icon: '🤝' },
  { id: 'ceo', label: 'CEO Decision', icon: '👨‍💼' },
  { id: 'roadmap', label: 'Execution Roadmap', icon: '📅' },
]

const DECISION_STYLES = {
  Build: { bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', text: 'text-emerald-400' },
  Pivot: { bg: 'bg-amber-500/15', border: 'border-amber-500/30', text: 'text-amber-400' },
  "Don't Build": { bg: 'bg-rose-500/15', border: 'border-rose-500/30', text: 'text-rose-400' },
}

function getResult(agentResults, key) {
  return agentResults.find((r) => r.agent_key === key)?.result || null
}

export default function AnalysisReport() {
  const { sessionId } = useParams()
  const [session, setSession] = useState(null)
  const [agentResults, setAgentResults] = useState([])
  const [report, setReport] = useState(null)
  const [activeTab, setActiveTab] = useState('summary')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getReport(sessionId)
        setSession(data.session)
        setAgentResults(data.agentResults)
        setReport(data.report)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [sessionId])

  if (loading) {
    return (
      <WorkspaceLayout title="Intelligence Report">
        <div className="flex min-h-[60vh] items-center justify-center">
          <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-sm text-slate-400">
            Loading intelligence report…
          </motion.div>
        </div>
      </WorkspaceLayout>
    )
  }

  if (error) {
    return (
      <WorkspaceLayout title="Report">
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
          <p className="text-rose-400">{error}</p>
          <Link to="/dashboard" className="text-sm text-forge-purple hover:underline">← Back to workspace</Link>
        </div>
      </WorkspaceLayout>
    )
  }

  const research = getResult(agentResults, 'research')
  const market = getResult(agentResults, 'market')
  const finance = getResult(agentResults, 'finance')
  const product = getResult(agentResults, 'product')
  const legal = getResult(agentResults, 'legal')
  const prototype = getResult(agentResults, 'prototype')
  const debate = getResult(agentResults, 'debate')
  const ceo = getResult(agentResults, 'ceo')
  const decisionStyle = DECISION_STYLES[ceo?.decision] || DECISION_STYLES.Pivot

  return (
    <WorkspaceLayout title="Intelligence Report">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <Link to="/dashboard" className="mb-3 inline-flex items-center gap-1 text-xs text-slate-500 hover:text-white">
            ← New analysis
          </Link>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white sm:text-3xl">
                {session?.startup_name || 'Startup Intelligence Report'}
              </h1>
              <p className="mt-2 max-w-2xl text-sm italic text-slate-400">&ldquo;{session?.idea_text}&rdquo;</p>
            </div>
            {ceo && (
              <div className={`rounded-xl border px-4 py-2 text-center ${decisionStyle.bg} ${decisionStyle.border}`}>
                <p className="text-[10px] uppercase tracking-wider text-slate-400">CEO Decision</p>
                <p className={`text-xl font-bold ${decisionStyle.text}`}>{ceo.decision}</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Tab navigation */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex min-w-max gap-1 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-forge-gradient text-white shadow-lg shadow-purple-900/20'
                    : 'text-slate-400 hover:bg-white/[0.05] hover:text-white'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 sm:p-8"
          >
            {activeTab === 'summary' && (
              <SummaryTab ceo={ceo} report={report} session={session} />
            )}
            {activeTab === 'research' && research && (
              <SectionContent title="Research" icon="🔍">
                <p className="text-sm leading-relaxed text-slate-300">{research.summary}</p>
                <SubSection title="Key Findings"><ReportList items={research.keyFindings} /></SubSection>
                <SubSection title="Industry Trends"><ReportList items={research.industryTrends} /></SubSection>
                <p className="text-xs text-slate-500"><span className="text-slate-400">Target Audience:</span> {research.targetAudience}</p>
              </SectionContent>
            )}
            {activeTab === 'market' && market && (
              <SectionContent title="Market Analysis" icon="📈">
                <div className="grid gap-3 sm:grid-cols-2">
                  <StatCard label="Market Size" value={market.marketSize} />
                  <StatCard label="Growth Rate" value={market.growthRate} />
                </div>
                <p className="mt-4 text-sm text-slate-300">{market.marketAnalysis}</p>
                <SubSection title="Competitors"><ReportGrid items={market.competitors} /></SubSection>
              </SectionContent>
            )}
            {activeTab === 'finance' && finance && (
              <SectionContent title="Financial Feasibility" icon="💰">
                <p className="text-sm text-slate-300">{finance.financialFeasibility}</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <StatCard label="Startup Cost" value={finance.estimatedStartupCost} />
                  <StatCard label="Break-even" value={finance.breakEvenTimeline} />
                </div>
                <p className="mt-4 text-xs text-slate-500"><span className="text-slate-400">Revenue Model:</span> {finance.revenueModel}</p>
                <SubSection title="Cost Breakdown"><ReportGrid items={finance.costBreakdown} /></SubSection>
              </SectionContent>
            )}
            {activeTab === 'product' && product && (
              <SectionContent title="Product & MVP" icon="🛠️">
                <p className="text-sm text-slate-300">{product.productStrategy}</p>
                <SubSection title="MVP Strategy"><p className="text-sm text-slate-400">{product.mvpStrategy}</p></SubSection>
                <SubSection title="Core Features"><ReportList items={product.coreFeatures} /></SubSection>
                <SubSection title="Tech Stack"><ReportList items={product.techStack} /></SubSection>
              </SectionContent>
            )}
            {activeTab === 'legal' && legal && (
              <SectionContent title="Legal & Risk" icon="⚖️">
                <p className="text-sm text-slate-300">{legal.legalRiskAssessment}</p>
                <SubSection title="Regulatory Considerations"><ReportList items={legal.regulatoryConsiderations} /></SubSection>
                <SubSection title="Legal Risks"><ReportGrid items={legal.legalRisks} /></SubSection>
              </SectionContent>
            )}
            {activeTab === 'prototype' && (
              <SectionContent title="Prototype" icon="🎨">
                <PrototypePreview prototype={prototype} />
              </SectionContent>
            )}
            {activeTab === 'debate' && (
              <SectionContent title="Live Debate" icon="🤝">
                <LiveDebate debateResult={debate} isLive={false} />
              </SectionContent>
            )}
            {activeTab === 'ceo' && ceo && (
              <SectionContent title="CEO Decision" icon="👨‍💼">
                <CeoTab ceo={ceo} decisionStyle={decisionStyle} />
              </SectionContent>
            )}
            {activeTab === 'roadmap' && (
              <SectionContent title="30-Day Execution Roadmap" icon="📅">
                <ExecutionRoadmap roadmap={ceo?.executionRoadmap} />
              </SectionContent>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </WorkspaceLayout>
  )
}

function SummaryTab({ ceo, report, session }) {
  return (
    <div className="space-y-8">
      {ceo && (
        <>
          <p className="text-sm leading-relaxed text-slate-300">{ceo.executiveSummary}</p>
          <ReadinessScores
            domainScores={ceo.domainScores || report?.domainScores}
            overallScore={ceo.overallReadinessScore || report?.overallScore}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Key Strengths</h4>
              <ReportList items={ceo.keyStrengths} />
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-rose-400">Key Risks</h4>
              <ReportList items={ceo.keyRisks || ceo.majorRisks} />
            </div>
          </div>
          <SubSection title="Recommended Next Steps"><ReportList items={ceo.recommendedNextSteps} /></SubSection>
        </>
      )}
    </div>
  )
}

function CeoTab({ ceo, decisionStyle }) {
  return (
    <div className="space-y-6">
      <div className={`rounded-2xl border p-6 ${decisionStyle.bg} ${decisionStyle.border}`}>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400">Final Recommendation</p>
            <p className={`mt-2 text-4xl font-bold ${decisionStyle.text}`}>{ceo.decision}</p>
            <p className="mt-3 max-w-lg text-sm text-slate-300">{ceo.executiveSummary}</p>
          </div>
          <div className="flex gap-4">
            <ScoreRing score={ceo.overallReadinessScore || ceo.startupReadinessScore} label="Readiness" />
            <ScoreRing score={ceo.confidenceScore} label="Confidence" color="#3b82f6" />
          </div>
        </div>
      </div>
      <SubSection title="Recommended Strategy"><p className="text-sm text-slate-300">{ceo.recommendedStrategy}</p></SubSection>
      <SubSection title="Investment Recommendation"><p className="text-sm text-slate-300">{ceo.investmentRecommendation}</p></SubSection>
      <SubSection title="Opportunities"><ReportList items={ceo.opportunities} /></SubSection>
      <SubSection title="Weaknesses"><ReportList items={ceo.weaknesses} /></SubSection>
      <SubSection title="Next Steps"><ReportList items={ceo.nextSteps || ceo.recommendedNextSteps} /></SubSection>
    </div>
  )
}

function SectionContent({ title, icon, children }) {
  return (
    <div>
      <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold text-white">
        <span>{icon}</span> {title}
      </h2>
      {children}
    </div>
  )
}

function SubSection({ title, children }) {
  return (
    <div className="mt-6">
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</h4>
      {children}
    </div>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
      <p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-white">{value}</p>
    </div>
  )
}
