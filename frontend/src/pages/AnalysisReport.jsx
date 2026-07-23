import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import WorkspaceLayout from '../components/WorkspaceLayout'
import LoadingScreen from '../components/LoadingScreen'
import ScoreRing from '../components/ScoreRing'
import LiveDebate from '../components/LiveDebate'
import ExecutionRoadmap from '../components/ExecutionRoadmap'
import { ReportList, RiskGrid, CompetitorGrid, CostBreakdownTable, SourceList } from '../components/ReportSection'
import PrototypeGenerator from '../components/PrototypeGenerator'
import { getAgentMeta } from '../constants/agents'
import { api } from '../lib/api'

const AGENT_THEMES = {
  summary: {
    name: 'Executive Summary', icon: '✦',
    chip: 'border-indigo-200 bg-indigo-50 text-indigo-700 hover:border-indigo-300',
    chipActive: 'border-indigo-500 bg-indigo-600 text-white shadow-lg shadow-indigo-500/30',
    iconBg: 'bg-indigo-100 text-indigo-600', cardBg: 'bg-gradient-to-br from-indigo-50/60 to-white',
    border: 'border-indigo-100', accent: 'text-indigo-600', dot: 'bg-indigo-500', ring: '#4f46e5',
    badge: 'border-indigo-200 bg-indigo-50 text-indigo-700',
  },
  research: {
    name: 'Research', icon: '🔍',
    chip: 'border-indigo-200 bg-indigo-50 text-indigo-700 hover:border-indigo-300',
    chipActive: 'border-indigo-500 bg-indigo-600 text-white shadow-lg shadow-indigo-500/30',
    iconBg: 'bg-indigo-100 text-indigo-600', cardBg: 'bg-gradient-to-br from-indigo-50/60 to-white',
    border: 'border-indigo-100', accent: 'text-indigo-600', dot: 'bg-indigo-500', ring: '#4f46e5',
    badge: 'border-indigo-200 bg-indigo-50 text-indigo-700',
  },
  market: {
    name: 'Market', icon: '📈',
    chip: 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300',
    chipActive: 'border-emerald-500 bg-emerald-600 text-white shadow-lg shadow-emerald-500/30',
    iconBg: 'bg-emerald-100 text-emerald-600', cardBg: 'bg-gradient-to-br from-emerald-50/60 to-white',
    border: 'border-emerald-100', accent: 'text-emerald-600', dot: 'bg-emerald-500', ring: '#059669',
    badge: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  },
  finance: {
    name: 'Finance', icon: '💰',
    chip: 'border-amber-200 bg-amber-50 text-amber-700 hover:border-amber-300',
    chipActive: 'border-amber-500 bg-amber-600 text-white shadow-lg shadow-amber-500/30',
    iconBg: 'bg-amber-100 text-amber-600', cardBg: 'bg-gradient-to-br from-amber-50/60 to-white',
    border: 'border-amber-100', accent: 'text-amber-600', dot: 'bg-amber-500', ring: '#d97706',
    badge: 'border-amber-200 bg-amber-50 text-amber-700',
  },
  product: {
    name: 'Product', icon: '🛠️',
    chip: 'border-violet-200 bg-violet-50 text-violet-700 hover:border-violet-300',
    chipActive: 'border-violet-500 bg-violet-600 text-white shadow-lg shadow-violet-500/30',
    iconBg: 'bg-violet-100 text-violet-600', cardBg: 'bg-gradient-to-br from-violet-50/60 to-white',
    border: 'border-violet-100', accent: 'text-violet-600', dot: 'bg-violet-500', ring: '#7c3aed',
    badge: 'border-violet-200 bg-violet-50 text-violet-700',
  },
  legal: {
    name: 'Legal', icon: '⚖️',
    chip: 'border-orange-200 bg-orange-50 text-orange-700 hover:border-orange-300',
    chipActive: 'border-orange-500 bg-orange-600 text-white shadow-lg shadow-orange-500/30',
    iconBg: 'bg-orange-100 text-orange-600', cardBg: 'bg-gradient-to-br from-orange-50/60 to-white',
    border: 'border-orange-100', accent: 'text-orange-600', dot: 'bg-orange-500', ring: '#ea580c',
    badge: 'border-orange-200 bg-orange-50 text-orange-700',
  },
  debate: {
    name: 'Debate', icon: '🤝',
    chip: 'border-rose-200 bg-rose-50 text-rose-700 hover:border-rose-300',
    chipActive: 'border-rose-500 bg-rose-600 text-white shadow-lg shadow-rose-500/30',
    iconBg: 'bg-rose-100 text-rose-600', cardBg: 'bg-gradient-to-br from-rose-50/60 to-white',
    border: 'border-rose-100', accent: 'text-rose-600', dot: 'bg-rose-500', ring: '#e11d48',
    badge: 'border-rose-200 bg-rose-50 text-rose-700',
  },
  ceo: {
    name: 'CEO Decision', icon: '👨‍💼',
    chip: 'border-blue-200 bg-blue-50 text-blue-700 hover:border-blue-300',
    chipActive: 'border-blue-500 bg-blue-600 text-white shadow-lg shadow-blue-500/30',
    iconBg: 'bg-blue-100 text-blue-600', cardBg: 'bg-gradient-to-br from-blue-50/60 to-white',
    border: 'border-blue-100', accent: 'text-blue-600', dot: 'bg-blue-500', ring: '#2563eb',
    badge: 'border-blue-200 bg-blue-50 text-blue-700',
  },
  roadmap: {
    name: '30/60/90 Plan', icon: '📅',
    chip: 'border-blue-200 bg-blue-50 text-blue-700 hover:border-blue-300',
    chipActive: 'border-blue-500 bg-blue-600 text-white shadow-lg shadow-blue-500/30',
    iconBg: 'bg-blue-100 text-blue-600', cardBg: 'bg-gradient-to-br from-blue-50/60 to-white',
    border: 'border-blue-100', accent: 'text-blue-600', dot: 'bg-blue-500', ring: '#2563eb',
    badge: 'border-blue-200 bg-blue-50 text-blue-700',
  },
  prototype: {
    name: 'Prototype', icon: '🖼️',
    chip: 'border-teal-200 bg-teal-50 text-teal-700 hover:border-teal-300',
    chipActive: 'border-teal-500 bg-teal-600 text-white shadow-lg shadow-teal-500/30',
    iconBg: 'bg-teal-100 text-teal-600', cardBg: 'bg-gradient-to-br from-teal-50/60 to-white',
    border: 'border-teal-100', accent: 'text-teal-600', dot: 'bg-teal-500', ring: '#0d9488',
    badge: 'border-teal-200 bg-teal-50 text-teal-700',
  },
}

const TABS = [
  { id: 'summary', label: 'Executive Summary', icon: '✦' },
  { id: 'research', label: 'Research', icon: '🔍' },
  { id: 'market', label: 'Market', icon: '📈' },
  { id: 'finance', label: 'Finance', icon: '💰' },
  { id: 'product', label: 'Product', icon: '🛠️' },
  { id: 'legal', label: 'Legal', icon: '⚖️' },
  { id: 'debate', label: 'Debate', icon: '🤝' },
  { id: 'ceo', label: 'CEO Decision', icon: '👨‍💼' },
  { id: 'roadmap', label: '30/60/90 Plan', icon: '📅' },
  { id: 'prototype', label: 'Prototype', icon: '🖼️' },
]

const VERDICT_META = {
  Build: { icon: '🚀', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', ring: '#10b981' },
  Pivot: { icon: '🔄', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', ring: '#f59e0b' },
  Delay: { icon: '⏳', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', ring: '#3b82f6' },
  Reject: { icon: '🛑', bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', ring: '#ef4444' },
}

function getResult(agentResults, key) {
  return agentResults.find((r) => r.agent_key === key)?.result || null
}

function hasContent(v) {
  if (v == null) return false
  if (Array.isArray(v)) return v.length > 0
  if (typeof v === 'string') return v.trim().length > 0
  return true
}

export default function AnalysisReport() {
  const { sessionId } = useParams()
  const [session, setSession] = useState(null)
  const [agentResults, setAgentResults] = useState([])
  const [activeTab, setActiveTab] = useState('summary')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getReport(sessionId)
        setSession(data.session)
        setAgentResults(data.agentResults)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [sessionId])

  const research = getResult(agentResults, 'research')
  const market = getResult(agentResults, 'market')
  const finance = getResult(agentResults, 'finance')
  const product = getResult(agentResults, 'product')
  const legal = getResult(agentResults, 'legal')
  const debate = getResult(agentResults, 'debate')
  const ceo = getResult(agentResults, 'ceo')
  const verdict = VERDICT_META[ceo?.verdict] || VERDICT_META.Pivot

  return (
    <>
      <AnimatePresence>{loading && <LoadingScreen key="report-loading" />}</AnimatePresence>

      {!loading && error && (
        <WorkspaceLayout title="Report">
          <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
            <p className="text-rose-600">{error}</p>
            <Link to="/dashboard" className="text-sm font-medium text-landing-accent hover:underline">← Back to workspace</Link>
          </div>
        </WorkspaceLayout>
      )}

      {!loading && !error && (
    <WorkspaceLayout title="Intelligence Report">
      <div className="relative mx-auto max-w-6xl overflow-hidden px-4 py-6 sm:py-10">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-landing-accent/[0.06] blur-3xl animate-float" />
        <div className="pointer-events-none absolute -left-24 top-40 h-56 w-56 rounded-full bg-emerald-400/[0.05] blur-3xl animate-float" style={{ animationDelay: '2s' }} />

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 mb-6">
          <Link to="/dashboard" className="mb-3 inline-flex items-center gap-1 text-xs font-medium text-landing-muted hover:text-landing-text">
            ← New analysis
          </Link>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-landing-text sm:text-3xl">
                {session?.startup_name || 'Startup Intelligence Report'}
              </h1>
              <p className="mt-2 max-w-2xl text-sm italic text-landing-muted">&ldquo;{session?.idea_text}&rdquo;</p>
            </div>
            <div className="flex items-center gap-3">
              {ceo && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 20 }}
                  className={`flex items-center gap-2 rounded-xl border px-4 py-2 ${verdict.bg} ${verdict.border}`}
                >
                  <span className="text-xl">{verdict.icon}</span>
                  <div className="text-left">
                    <p className="text-[10px] uppercase tracking-wider text-landing-muted">CEO Verdict</p>
                    <p className={`text-lg font-bold leading-tight ${verdict.text}`}>{ceo.verdict}</p>
                  </div>
                </motion.div>
              )}
              {session?.build_studio_status && session.build_studio_status !== 'locked' && (
                <Link
                  to={`/analysis/${sessionId}/build-studio`}
                  className="flex items-center gap-2 rounded-xl bg-landing-accent px-4 py-2 text-sm font-semibold text-white shadow-md shadow-landing-accent/20 transition-transform hover:scale-[1.02]"
                >
                  🏗️ Build Studio
                  {session.build_studio_status === 'generating' && (
                    <span className="text-[10px] font-normal text-white/80">generating…</span>
                  )}
                </Link>
              )}
            </div>
          </div>
        </motion.div>

        {/* Agent chip navigation */}
        <div className="relative z-10 mb-8 -mx-1 overflow-x-auto pb-1">
          <div className="flex min-w-max gap-2.5 px-1">
            {TABS.map((tab) => {
              const theme = AGENT_THEMES[tab.id]
              const active = activeTab === tab.id
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className={`flex items-center gap-2.5 rounded-2xl border px-4 py-3 text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                    active ? theme.chipActive : `${theme.chip}`
                  }`}
                >
                  <span className={`flex h-7 w-7 items-center justify-center rounded-lg text-base ${active ? 'bg-white/20' : theme.iconBg}`}>
                    {tab.icon}
                  </span>
                  {tab.label}
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 14, scale: 0.995 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -14, scale: 0.995 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative z-10"
          >
            {activeTab === 'summary' && <SummaryTab ceo={ceo} verdict={verdict} />}

            {activeTab === 'research' && research && (
              <SectionContent title="Research" icon="🔍" confidence={research.confidence} theme={AGENT_THEMES.research}>
                <InfoCard title="Overview" icon="📝" theme={AGENT_THEMES.research} span>
                  <p className="text-sm leading-relaxed text-landing-text">{research.summary}</p>
                </InfoCard>

                <InfoCard title="Problem Validation" icon="✅" theme={AGENT_THEMES.research}>
                  <p className="text-sm leading-relaxed text-landing-muted">{research.problemValidation}</p>
                </InfoCard>
                <InfoCard title="Target Audience" icon="🎯" theme={AGENT_THEMES.research}>
                  <p className="text-sm leading-relaxed text-landing-muted">{research.targetAudience}</p>
                </InfoCard>

                {hasContent(research.keyFindings) && (
                  <InfoCard title="Key Findings" icon="💡" theme={AGENT_THEMES.research}>
                    <ReportList items={research.keyFindings} />
                  </InfoCard>
                )}
                {hasContent(research.industryTrends) && (
                  <InfoCard title="Industry Trends" icon="📊" theme={AGENT_THEMES.research}>
                    <ReportList items={research.industryTrends} />
                  </InfoCard>
                )}
                {hasContent(research.demandSignals) && (
                  <InfoCard title="Demand Signals" icon="📶" theme={AGENT_THEMES.research}>
                    <ReportList items={research.demandSignals} />
                  </InfoCard>
                )}

                <InfoCard
                  title={`Competitive Landscape${research.competitorCount ? ` · ~${research.competitorCount} comparable products` : ''}`}
                  icon="🏁"
                  theme={AGENT_THEMES.research}
                  span
                >
                  <p className="text-sm leading-relaxed text-landing-muted">{research.competitiveLandscapeSummary}</p>
                </InfoCard>

                {hasContent(research.risks) && (
                  <WarningCard title="Risks" items={research.risks} span />
                )}
                <AssumptionsNote items={research.assumptions} />
                {hasContent(research.sources) && (
                  <InfoCard title="Sources" icon="🔗" theme={AGENT_THEMES.research} span>
                    <SourceList sources={research.sources} />
                  </InfoCard>
                )}
              </SectionContent>
            )}

            {activeTab === 'market' && market && (
              <SectionContent title="Market Analysis" icon="📈" confidence={market.confidence} theme={AGENT_THEMES.market}>
                {market.industry && (
                  <div className="sm:col-span-2 -mb-1">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${AGENT_THEMES.market.badge}`}>
                      🏢 {market.industry}
                    </span>
                  </div>
                )}

                <div className="grid gap-4 grid-cols-2 sm:col-span-2 lg:grid-cols-4">
                  <StatCard label={`TAM${market.tam?.year ? ` (${market.tam.year})` : ''}`} icon="🌍" value={market.tam?.value} sub={market.tam?.source} theme={AGENT_THEMES.market} />
                  <StatCard label={`SAM${market.sam?.year ? ` (${market.sam.year})` : ''}`} icon="🎯" value={market.sam?.value} sub={market.sam?.source} theme={AGENT_THEMES.market} />
                  <StatCard label={`SOM${market.som?.year ? ` (${market.som.year})` : ''}`} icon="📍" value={market.som?.value} sub={market.som?.source} theme={AGENT_THEMES.market} />
                  <StatCard label="CAGR" icon="📈" value={market.cagr} theme={AGENT_THEMES.market} percent />
                </div>

                <InfoCard title="Market Overview" icon="🗺️" theme={AGENT_THEMES.market} span>
                  <p className="text-sm leading-relaxed text-landing-text">{market.marketOverview}</p>
                  {market.problemSolved && (
                    <p className="mt-3 text-sm leading-relaxed text-landing-muted">
                      <span className="font-medium text-landing-text">Problem Solved: </span>{market.problemSolved}
                    </p>
                  )}
                </InfoCard>

                {hasContent(market.targetCustomers) && (
                  <InfoCard title="Target Customers" icon="👥" theme={AGENT_THEMES.market}>
                    <ReportList items={market.targetCustomers} />
                  </InfoCard>
                )}
                {hasContent(market.marketDrivers) && (
                  <InfoCard title="Market Drivers" icon="⚡" theme={AGENT_THEMES.market}>
                    <ReportList items={market.marketDrivers} />
                  </InfoCard>
                )}
                {hasContent(market.marketTrends) && (
                  <InfoCard title="Market Trends" icon="📉" theme={AGENT_THEMES.market}>
                    <ReportList items={market.marketTrends} />
                  </InfoCard>
                )}
                {hasContent(market.opportunities) && (
                  <OpportunityCard title="Opportunities" items={market.opportunities} />
                )}

                {hasContent(market.competitors) && (
                  <div className="sm:col-span-2">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-landing-muted">Competitors</p>
                    <CompetitorGrid items={market.competitors} />
                  </div>
                )}

                {hasContent(market.risks) && <WarningCard title="Risks" items={market.risks} span />}
                <AssumptionsNote items={market.assumptions} />
                {hasContent(market.sources) && (
                  <InfoCard title="Sources" icon="🔗" theme={AGENT_THEMES.market} span>
                    <SourceList sources={market.sources} />
                  </InfoCard>
                )}
              </SectionContent>
            )}

            {activeTab === 'finance' && finance && (
              <SectionContent title="Financial Feasibility" icon="💰" confidence={finance.confidence} theme={AGENT_THEMES.finance}>
                <div className="grid gap-4 grid-cols-2 sm:col-span-2">
                  <StatCard label="Startup Cost" icon="💵" value={finance.estimatedStartupCost} theme={AGENT_THEMES.finance} />
                  <StatCard label="Break-even" icon="⏱️" value={finance.breakEvenTimeline} theme={AGENT_THEMES.finance} />
                </div>

                <InfoCard title="Financial Feasibility" icon="📋" theme={AGENT_THEMES.finance} span>
                  <p className="text-sm leading-relaxed text-landing-text">{finance.financialFeasibility}</p>
                  {finance.revenueModel && (
                    <p className="mt-3 text-sm leading-relaxed text-landing-muted">
                      <span className="font-medium text-landing-text">Revenue Model: </span>{finance.revenueModel}
                    </p>
                  )}
                </InfoCard>

                {hasContent(finance.costBreakdown) && (
                  <div className="sm:col-span-2">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-landing-muted">Cost Breakdown</p>
                    <CostBreakdownTable items={finance.costBreakdown} />
                  </div>
                )}

                {finance.unitEconomics && (
                  <div className="grid gap-4 grid-cols-2 sm:col-span-2 lg:grid-cols-3">
                    <StatCard label="CAC" icon="🎯" value={finance.unitEconomics?.cac} theme={AGENT_THEMES.finance} />
                    <StatCard label="LTV" icon="💎" value={finance.unitEconomics?.ltv} theme={AGENT_THEMES.finance} />
                    <StatCard label="LTV:CAC" icon="⚖️" value={finance.unitEconomics?.ltvCacRatio} theme={AGENT_THEMES.finance} />
                    <StatCard label="ARPU" icon="👤" value={finance.unitEconomics?.arpu} theme={AGENT_THEMES.finance} />
                    <StatCard label="Gross Margin" icon="📐" value={finance.unitEconomics?.grossMargin} theme={AGENT_THEMES.finance} percent />
                    <StatCard label="Monthly Burn" icon="🔥" value={finance.unitEconomics?.monthlyBurn} theme={AGENT_THEMES.finance} />
                  </div>
                )}

                {finance.pricingRecommendation?.length > 0 && (
                  <div className="sm:col-span-2">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-landing-muted">Pricing Recommendation</p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {finance.pricingRecommendation.map((tier, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 8 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          whileHover={{ y: -3 }}
                          className={`rounded-2xl border p-4 shadow-sm transition-shadow hover:shadow-md ${AGENT_THEMES.finance.border} ${AGENT_THEMES.finance.cardBg}`}
                        >
                          <div className="flex items-baseline justify-between">
                            <p className="text-sm font-semibold text-landing-text">{tier.plan}</p>
                            <p className={`text-sm font-bold ${AGENT_THEMES.finance.accent}`}>{tier.price}</p>
                          </div>
                          <ReportList items={tier.features} />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                <InfoCallout title="Funding Recommendation" icon="💡" theme={AGENT_THEMES.finance} span>
                  <p className="text-sm text-landing-text">
                    <span className="font-semibold">{finance.fundingRecommendation?.stage}</span>
                    {finance.fundingRecommendation?.amount && ` — ${finance.fundingRecommendation.amount}`}
                  </p>
                  {finance.fundingRecommendation?.reason && (
                    <p className="mt-1.5 text-xs leading-relaxed text-landing-muted">{finance.fundingRecommendation.reason}</p>
                  )}
                </InfoCallout>

                {hasContent(finance.financialRisks) && (
                  <div className="sm:col-span-2">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-landing-muted">Financial Risks</p>
                    <RiskGrid items={finance.financialRisks} />
                  </div>
                )}
                <AssumptionsNote items={finance.assumptions} />
                {hasContent(finance.sources) && (
                  <InfoCard title="Sources" icon="🔗" theme={AGENT_THEMES.finance} span>
                    <SourceList sources={finance.sources} />
                  </InfoCard>
                )}
              </SectionContent>
            )}

            {activeTab === 'product' && product && (
              <SectionContent title="Product & MVP" icon="🛠️" confidence={product.confidence} theme={AGENT_THEMES.product}>
                <InfoCard title="Product Strategy" icon="🧭" theme={AGENT_THEMES.product} span>
                  <p className="text-sm leading-relaxed text-landing-text">{product.productStrategy}</p>
                </InfoCard>

                <InfoCard title="MVP Strategy" icon="🚀" theme={AGENT_THEMES.product}>
                  <p className="text-sm leading-relaxed text-landing-muted">{product.mvpStrategy}</p>
                </InfoCard>
                <StatCard label="Timeline" icon="🗓️" value={product.timeline} theme={AGENT_THEMES.product} />

                {hasContent(product.coreFeatures) && (
                  <InfoCard title="Core Features" icon="⭐" theme={AGENT_THEMES.product}>
                    <ReportList items={product.coreFeatures} />
                  </InfoCard>
                )}
                {hasContent(product.techStack) && (
                  <InfoCard title="Tech Stack" icon="🧩" theme={AGENT_THEMES.product}>
                    <div className="flex flex-wrap gap-2">
                      {product.techStack.map((t, i) => (
                        <span key={i} className={`rounded-full border px-3 py-1 text-xs font-medium ${AGENT_THEMES.product.badge}`}>
                          {typeof t === 'string' ? t : JSON.stringify(t)}
                        </span>
                      ))}
                    </div>
                  </InfoCard>
                )}
                {hasContent(product.successMetrics) && (
                  <InfoCard title="Success Metrics" icon="📏" theme={AGENT_THEMES.product} span>
                    <ReportList items={product.successMetrics} />
                  </InfoCard>
                )}

                {hasContent(product.risks) && <WarningCard title="Execution Risks" items={product.risks} span />}
                <AssumptionsNote items={product.assumptions} />
                {hasContent(product.sources) && (
                  <InfoCard title="Sources" icon="🔗" theme={AGENT_THEMES.product} span>
                    <SourceList sources={product.sources} />
                  </InfoCard>
                )}
              </SectionContent>
            )}

            {activeTab === 'legal' && legal && (
              <SectionContent title="Legal & Risk" icon="⚖️" confidence={legal.confidence} theme={AGENT_THEMES.legal}>
                <InfoCard title="Legal Risk Assessment" icon="📜" theme={AGENT_THEMES.legal} span>
                  <p className="text-sm leading-relaxed text-landing-text">{legal.legalRiskAssessment}</p>
                </InfoCard>

                {hasContent(legal.regulatoryConsiderations) && (
                  <InfoCard title="Regulatory Considerations" icon="🏛️" theme={AGENT_THEMES.legal}>
                    <ReportList items={legal.regulatoryConsiderations} />
                  </InfoCard>
                )}
                {legal.ipConsiderations && (
                  <InfoCard title="IP Considerations" icon="©️" theme={AGENT_THEMES.legal}>
                    <p className="text-sm leading-relaxed text-landing-muted">{legal.ipConsiderations}</p>
                  </InfoCard>
                )}
                {hasContent(legal.complianceRequirements) && (
                  <InfoCard title="Compliance Requirements" icon="✔️" theme={AGENT_THEMES.legal} span>
                    <ReportList items={legal.complianceRequirements} />
                  </InfoCard>
                )}

                {hasContent(legal.legalRisks) && (
                  <div className="sm:col-span-2">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-landing-muted">Legal Risks</p>
                    <RiskGrid items={legal.legalRisks} />
                  </div>
                )}
                <AssumptionsNote items={legal.assumptions} />
                {hasContent(legal.sources) && (
                  <InfoCard title="Sources" icon="🔗" theme={AGENT_THEMES.legal} span>
                    <SourceList sources={legal.sources} />
                  </InfoCard>
                )}
              </SectionContent>
            )}

            {activeTab === 'debate' && (
              <SectionContent title="Investment Committee Debate" icon="🤝" theme={AGENT_THEMES.debate} noGrid>
                <LiveDebate debateResult={debate} isLive={false} theme="light" />
                {debate?.sources?.length > 0 && (
                  <div className="mt-6">
                    <InfoCard title="Sources Referenced" icon="🔗" theme={AGENT_THEMES.debate}>
                      <SourceList sources={debate.sources} />
                    </InfoCard>
                  </div>
                )}
              </SectionContent>
            )}

            {activeTab === 'ceo' && ceo && (
              <SectionContent title="CEO Decision" icon="👨‍💼" theme={AGENT_THEMES.ceo} noGrid>
                <CeoTab ceo={ceo} verdict={verdict} />
              </SectionContent>
            )}

            {activeTab === 'roadmap' && ceo && (
              <SectionContent title="30/60/90 Day Plan" icon="📅" theme={AGENT_THEMES.roadmap} noGrid>
                <ExecutionRoadmap
                  thirtyDayPlan={ceo.thirtyDayPlan}
                  sixtyDayPlan={ceo.sixtyDayPlan}
                  ninetyDayPlan={ceo.ninetyDayPlan}
                />
              </SectionContent>
            )}

            {activeTab === 'prototype' && (
              <SectionContent title="Prototype Preview" icon="🖼️" theme={AGENT_THEMES.prototype} noGrid>
                {ceo && (ceo.verdict === 'Build' || ceo.verdict === 'Pivot') ? (
                  <PrototypeGenerator ceo={ceo} product={product} session={session} />
                ) : (
                  <InfoCallout title="Not available yet" icon="🔒" theme={AGENT_THEMES.prototype}>
                    <p className="text-sm text-landing-muted">
                      A prototype preview becomes available once the CEO Agent issues a &ldquo;Build&rdquo; or
                      &ldquo;Pivot&rdquo; verdict.
                    </p>
                  </InfoCallout>
                )}
              </SectionContent>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </WorkspaceLayout>
      )}
    </>
  )
}

function SummaryTab({ ceo, verdict }) {
  if (!ceo) return null
  const theme = AGENT_THEMES.summary

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Card theme={theme} className="flex flex-col items-center justify-center gap-4 sm:col-span-2 sm:flex-row sm:justify-around">
        <ScoreRing score={ceo.confidence} label="CEO Confidence" size={140} color={verdict.ring} />
        <div className="max-w-md text-center sm:text-left">
          <p className={`text-[10px] font-semibold uppercase tracking-wider ${theme.accent}`}>Executive Summary</p>
          <p className="mt-2 text-sm leading-relaxed text-landing-text">{ceo.executiveSummary}</p>
        </div>
      </Card>

      <WarningCard title="Top Risks" items={ceo.topRisks} />
      <OpportunityCard title="Top Opportunities" items={ceo.topOpportunities} />

      {hasContent(ceo.validationStrategy) && (
        <InfoCard title="Validation Strategy" icon="🧪" theme={theme} span>
          <ReportList items={ceo.validationStrategy} />
        </InfoCard>
      )}
      {hasContent(ceo.nextSteps) && (
        <InfoCard title="Immediate Next Steps" icon="🪜" theme={theme} span>
          <NumberedList items={ceo.nextSteps} theme={theme} />
        </InfoCard>
      )}
    </div>
  )
}

function CeoTab({ ceo, verdict }) {
  const theme = AGENT_THEMES.ceo
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative overflow-hidden rounded-2xl border p-6 sm:col-span-2 ${verdict.bg} ${verdict.border}`}
      >
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <motion.span
              initial={{ scale: 0.6, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 15, delay: 0.1 }}
              className="text-5xl"
            >
              {verdict.icon}
            </motion.span>
            <div>
              <p className="text-xs uppercase tracking-wider text-landing-muted">Final Verdict</p>
              <p className={`mt-1 text-4xl font-bold ${verdict.text}`}>{ceo.verdict}</p>
            </div>
          </div>
          <ScoreRing score={ceo.confidence} label="Confidence" color={verdict.ring} />
        </div>
      </motion.div>

      <InfoCard title="Executive Summary" icon="📄" theme={theme} span>
        <p className="text-sm leading-relaxed text-landing-text">{ceo.executiveSummary}</p>
      </InfoCard>

      {ceo.keyEvidence?.length > 0 && (
        <div className="sm:col-span-2">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-landing-muted">Key Evidence by Agent</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {ceo.keyEvidence.map((e, i) => {
              const meta = getAgentMeta(e.agent?.toLowerCase())
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: Math.min(i, 8) * 0.05 }}
                  whileHover={{ y: -2 }}
                  className={`rounded-xl border p-3 shadow-sm transition-shadow hover:shadow-md ${theme.border} ${theme.cardBg}`}
                >
                  <p className={`flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider ${theme.accent}`}>
                    {meta?.icon && <span>{meta.icon}</span>} {e.agent}
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-landing-text">{e.evidence}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      <OpportunityCard title="Top Opportunities" items={ceo.topOpportunities} />
      <WarningCard title="Top Risks" items={ceo.topRisks} />

      <InfoCallout title="Investment Recommendation" icon="💡" theme={theme} span>
        <p className="text-sm text-landing-text">{ceo.investmentRecommendation}</p>
      </InfoCallout>

      {hasContent(ceo.validationStrategy) && (
        <InfoCard title="Validation Strategy" icon="🧪" theme={theme}>
          <ReportList items={ceo.validationStrategy} />
        </InfoCard>
      )}
      {hasContent(ceo.successMetrics) && (
        <InfoCard title="Success Metrics" icon="📏" theme={theme}>
          <ReportList items={ceo.successMetrics} />
        </InfoCard>
      )}
      {hasContent(ceo.nextSteps) && (
        <InfoCard title="Immediate Next Steps" icon="🪜" theme={theme} span>
          <NumberedList items={ceo.nextSteps} theme={theme} />
        </InfoCard>
      )}
      {hasContent(ceo.sources) && (
        <InfoCard title="Sources" icon="🔗" theme={theme} span>
          <SourceList sources={ceo.sources} />
        </InfoCard>
      )}
    </div>
  )
}

function SectionContent({ title, icon, children, confidence, theme, noGrid }) {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2.5 text-lg font-semibold text-landing-text">
          <span className={`flex h-9 w-9 items-center justify-center rounded-xl text-lg ${theme?.iconBg || 'bg-landing-accent/10'}`}>{icon}</span>
          {title}
        </h2>
        <ConfidenceBadge value={confidence} theme={theme} />
      </div>
      {noGrid ? children : <div className="grid gap-5 sm:grid-cols-2">{children}</div>}
    </div>
  )
}

function Card({ theme, className = '', children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.35, delay }}
      whileHover={{ y: -3 }}
      className={`rounded-2xl border p-5 shadow-sm transition-all duration-200 hover:shadow-lg ${theme?.border || 'border-landing-border'} ${theme?.cardBg || 'bg-landing-card'} ${className}`}
    >
      {children}
    </motion.div>
  )
}

function InfoCard({ title, icon, theme, span, children }) {
  return (
    <Card theme={theme} className={span ? 'sm:col-span-2' : ''}>
      <div className="mb-3 flex items-center gap-2.5">
        {icon && <span className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-sm ${theme?.iconBg || 'bg-landing-accent/10 text-landing-accent'}`}>{icon}</span>}
        <h4 className="text-sm font-semibold text-landing-text">{title}</h4>
      </div>
      {children}
    </Card>
  )
}

function InfoCallout({ title, icon, theme, span, children }) {
  return (
    <div className={`rounded-2xl border p-4 ${theme?.border || 'border-landing-border'} ${theme?.cardBg || 'bg-landing-bg'} ${span ? 'sm:col-span-2' : ''}`}>
      <p className={`flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider ${theme?.accent || 'text-landing-muted'}`}>
        {icon && <span>{icon}</span>} {title}
      </p>
      <div className="mt-2">{children}</div>
    </div>
  )
}

function WarningCard({ title, items, span }) {
  if (!hasContent(items)) return null
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -3 }}
      className={`rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50/70 to-white p-5 shadow-sm transition-shadow hover:shadow-md ${span ? 'sm:col-span-2' : ''}`}
    >
      <h4 className="flex items-center gap-1.5 text-sm font-semibold text-rose-700">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-100 text-sm">⚠️</span>
        {title}
      </h4>
      <ReportList items={items} />
    </motion.div>
  )
}

function OpportunityCard({ title, items, span }) {
  if (!hasContent(items)) return null
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -3 }}
      className={`rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/70 to-white p-5 shadow-sm transition-shadow hover:shadow-md ${span ? 'sm:col-span-2' : ''}`}
    >
      <h4 className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-sm">✨</span>
        {title}
      </h4>
      <ReportList items={items} />
    </motion.div>
  )
}

function NumberedList({ items, theme }) {
  if (!items?.length) return null
  return (
    <ol className="mt-1 space-y-2">
      {items.map((item, i) => (
        <motion.li
          key={i}
          initial={{ opacity: 0, x: -6 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: Math.min(i, 8) * 0.05 }}
          className="flex items-start gap-3"
        >
          <span className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${theme?.iconBg || 'bg-landing-accent/15 text-landing-accent'}`}>
            {i + 1}
          </span>
          <span className="text-sm text-landing-text">{typeof item === 'string' ? item : JSON.stringify(item)}</span>
        </motion.li>
      ))}
    </ol>
  )
}

function parsePercent(value) {
  if (typeof value === 'number') return Math.max(0, Math.min(100, value))
  if (typeof value === 'string') {
    const match = value.match(/-?\d+(\.\d+)?/)
    if (match) return Math.max(0, Math.min(100, parseFloat(match[0])))
  }
  return null
}

function StatCard({ label, value, sub, theme, icon, percent }) {
  if (!hasContent(value)) return null
  const pct = percent ? parsePercent(value) : null
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -3 }}
      className={`rounded-xl border p-4 shadow-sm transition-shadow hover:shadow-md ${theme?.border || 'border-landing-border'} ${theme?.cardBg || 'bg-landing-bg'}`}
    >
      <div className="flex items-center gap-2">
        {icon && <span className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md text-xs ${theme?.iconBg || 'bg-landing-accent/10'}`}>{icon}</span>}
        <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-landing-muted">{label}</p>
      </div>
      <p className={`mt-2 text-xl font-bold tracking-tight ${theme?.accent || 'text-landing-text'}`}>{value}</p>
      {sub && <p className="mt-0.5 truncate text-[11px] text-landing-muted">{sub}</p>}
      {pct !== null && (
        <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-landing-border/70">
          <motion.div
            className={`h-full rounded-full ${theme?.dot || 'bg-landing-accent'}`}
            initial={{ width: 0 }}
            whileInView={{ width: `${pct}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
          />
        </div>
      )}
    </motion.div>
  )
}

function ConfidenceBadge({ value, theme }) {
  if (!Number.isFinite(value)) return null
  return (
    <div className="flex flex-shrink-0 flex-col items-end gap-1.5">
      <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold ${theme?.badge || 'border-landing-border bg-landing-bg text-landing-text'}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${theme?.dot || 'bg-landing-accent'}`} />
        {value}% confidence
      </span>
      <div className="h-1 w-24 overflow-hidden rounded-full bg-landing-border/70">
        <motion.div
          className={`h-full rounded-full ${theme?.dot || 'bg-landing-accent'}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
        />
      </div>
    </div>
  )
}

function AssumptionsNote({ items }) {
  if (!items?.length) return null
  return (
    <div className="sm:col-span-2 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50/70 to-white p-4">
      <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-amber-700">
        <span>📌</span> Assumptions
      </p>
      <ul className="mt-2 space-y-1">
        {items.map((a, i) => (
          <li key={i} className="text-xs leading-relaxed text-amber-900/80">• {a}</li>
        ))}
      </ul>
    </div>
  )
}
