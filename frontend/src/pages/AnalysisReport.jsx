import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import WorkspaceLayout from '../components/WorkspaceLayout'
import ScoreRing from '../components/ScoreRing'
import LiveDebate from '../components/LiveDebate'
import ExecutionRoadmap from '../components/ExecutionRoadmap'
import { ReportList, RiskGrid, CompetitorGrid, CostBreakdownTable, SourceList } from '../components/ReportSection'
import { api } from '../lib/api'

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
]

const DECISION_STYLES = {
  Build: { bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', text: 'text-emerald-400' },
  Pivot: { bg: 'bg-amber-500/15', border: 'border-amber-500/30', text: 'text-amber-400' },
  Delay: { bg: 'bg-blue-500/15', border: 'border-blue-500/30', text: 'text-blue-400' },
  Reject: { bg: 'bg-rose-500/15', border: 'border-rose-500/30', text: 'text-rose-400' },
}

function getResult(agentResults, key) {
  return agentResults.find((r) => r.agent_key === key)?.result || null
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
  const debate = getResult(agentResults, 'debate')
  const ceo = getResult(agentResults, 'ceo')
  const decisionStyle = DECISION_STYLES[ceo?.verdict] || DECISION_STYLES.Pivot

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
            <div className="flex items-center gap-3">
              {ceo && (
                <div className={`rounded-xl border px-4 py-2 text-center ${decisionStyle.bg} ${decisionStyle.border}`}>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400">CEO Verdict</p>
                  <p className={`text-xl font-bold ${decisionStyle.text}`}>{ceo.verdict}</p>
                </div>
              )}
              {session?.build_studio_status && session.build_studio_status !== 'locked' && (
                <Link
                  to={`/analysis/${sessionId}/build-studio`}
                  className="flex items-center gap-2 rounded-xl bg-forge-gradient px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-900/30 transition-transform hover:scale-[1.02]"
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
            {activeTab === 'summary' && <SummaryTab ceo={ceo} />}

            {activeTab === 'research' && research && (
              <SectionContent title="Research" icon="🔍" confidence={research.confidence}>
                <p className="text-sm leading-relaxed text-slate-300">{research.summary}</p>
                <SubSection title="Problem Validation">
                  <p className="text-sm text-slate-400">{research.problemValidation}</p>
                </SubSection>
                <SubSection title="Key Findings"><ReportList items={research.keyFindings} /></SubSection>
                <SubSection title="Industry Trends"><ReportList items={research.industryTrends} /></SubSection>
                <SubSection title="Demand Signals"><ReportList items={research.demandSignals} /></SubSection>
                <SubSection title={`Competitive Landscape${research.competitorCount ? ` (~${research.competitorCount} comparable products)` : ''}`}>
                  <p className="text-sm text-slate-400">{research.competitiveLandscapeSummary}</p>
                </SubSection>
                <p className="mt-4 text-xs text-slate-500"><span className="text-slate-400">Target Audience:</span> {research.targetAudience}</p>
                <SubSection title="Risks"><ReportList items={research.risks} /></SubSection>
                <AssumptionsNote items={research.assumptions} />
                <SubSection title="Sources"><SourceList sources={research.sources} /></SubSection>
              </SectionContent>
            )}

            {activeTab === 'market' && market && (
              <SectionContent title="Market Analysis" icon="📈" confidence={market.confidence}>
                <StatCard label="Industry" value={market.industry} />
                <p className="mt-4 text-sm text-slate-300">{market.marketOverview}</p>
                <p className="mt-3 text-sm text-slate-400"><span className="text-slate-500">Problem Solved: </span>{market.problemSolved}</p>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <StatCard label={`TAM (${market.tam?.year || ''})`} value={market.tam?.value} sub={market.tam?.source} />
                  <StatCard label={`SAM (${market.sam?.year || ''})`} value={market.sam?.value} sub={market.sam?.source} />
                  <StatCard label={`SOM (${market.som?.year || ''})`} value={market.som?.value} sub={market.som?.source} />
                </div>

                <div className="mt-3">
                  <StatCard label="CAGR" value={market.cagr} />
                </div>

                <SubSection title="Target Customers"><ReportList items={market.targetCustomers} /></SubSection>
                <SubSection title="Market Drivers"><ReportList items={market.marketDrivers} /></SubSection>
                <SubSection title="Market Trends"><ReportList items={market.marketTrends} /></SubSection>
                <SubSection title="Competitors"><CompetitorGrid items={market.competitors} /></SubSection>
                <SubSection title="Opportunities"><ReportList items={market.opportunities} /></SubSection>
                <SubSection title="Risks"><ReportList items={market.risks} /></SubSection>
                <AssumptionsNote items={market.assumptions} />
                <SubSection title="Sources"><SourceList sources={market.sources} /></SubSection>
              </SectionContent>
            )}

            {activeTab === 'finance' && finance && (
              <SectionContent title="Financial Feasibility" icon="💰" confidence={finance.confidence}>
                <p className="text-sm text-slate-300">{finance.financialFeasibility}</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <StatCard label="Startup Cost" value={finance.estimatedStartupCost} />
                  <StatCard label="Break-even" value={finance.breakEvenTimeline} />
                </div>
                <p className="mt-4 text-xs text-slate-500"><span className="text-slate-400">Revenue Model:</span> {finance.revenueModel}</p>

                <SubSection title="Cost Breakdown"><CostBreakdownTable items={finance.costBreakdown} /></SubSection>

                <SubSection title="Unit Economics">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <StatCard label="CAC" value={finance.unitEconomics?.cac} />
                    <StatCard label="LTV" value={finance.unitEconomics?.ltv} />
                    <StatCard label="LTV:CAC" value={finance.unitEconomics?.ltvCacRatio} />
                    <StatCard label="ARPU" value={finance.unitEconomics?.arpu} />
                    <StatCard label="Gross Margin" value={finance.unitEconomics?.grossMargin} />
                    <StatCard label="Monthly Burn" value={finance.unitEconomics?.monthlyBurn} />
                  </div>
                </SubSection>

                {finance.pricingRecommendation?.length > 0 && (
                  <SubSection title="Pricing Recommendation">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {finance.pricingRecommendation.map((tier, i) => (
                        <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                          <div className="flex items-baseline justify-between">
                            <p className="text-sm font-semibold text-white">{tier.plan}</p>
                            <p className="text-sm font-medium text-forge-purple">{tier.price}</p>
                          </div>
                          <ReportList items={tier.features} />
                        </div>
                      ))}
                    </div>
                  </SubSection>
                )}

                <SubSection title="Funding Recommendation">
                  <p className="text-sm text-slate-300">
                    <span className="font-medium text-white">{finance.fundingRecommendation?.stage}</span>
                    {finance.fundingRecommendation?.amount && ` — ${finance.fundingRecommendation.amount}`}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{finance.fundingRecommendation?.reason}</p>
                </SubSection>

                <SubSection title="Financial Risks"><RiskGrid items={finance.financialRisks} /></SubSection>
                <AssumptionsNote items={finance.assumptions} />
                <SubSection title="Sources"><SourceList sources={finance.sources} /></SubSection>
              </SectionContent>
            )}

            {activeTab === 'product' && product && (
              <SectionContent title="Product & MVP" icon="🛠️" confidence={product.confidence}>
                <p className="text-sm text-slate-300">{product.productStrategy}</p>
                <SubSection title="MVP Strategy"><p className="text-sm text-slate-400">{product.mvpStrategy}</p></SubSection>
                <SubSection title="Core Features"><ReportList items={product.coreFeatures} /></SubSection>
                <SubSection title="Tech Stack"><ReportList items={product.techStack} /></SubSection>
                <p className="mt-4 text-xs text-slate-500"><span className="text-slate-400">Timeline:</span> {product.timeline}</p>
                <SubSection title="Success Metrics"><ReportList items={product.successMetrics} /></SubSection>
                <SubSection title="Execution Risks"><ReportList items={product.risks} /></SubSection>
                <AssumptionsNote items={product.assumptions} />
                <SubSection title="Sources"><SourceList sources={product.sources} /></SubSection>
              </SectionContent>
            )}

            {activeTab === 'legal' && legal && (
              <SectionContent title="Legal & Risk" icon="⚖️" confidence={legal.confidence}>
                <p className="text-sm text-slate-300">{legal.legalRiskAssessment}</p>
                <SubSection title="Regulatory Considerations"><ReportList items={legal.regulatoryConsiderations} /></SubSection>
                <SubSection title="IP Considerations"><p className="text-sm text-slate-400">{legal.ipConsiderations}</p></SubSection>
                <SubSection title="Compliance Requirements"><ReportList items={legal.complianceRequirements} /></SubSection>
                <SubSection title="Legal Risks"><RiskGrid items={legal.legalRisks} /></SubSection>
                <AssumptionsNote items={legal.assumptions} />
                <SubSection title="Sources"><SourceList sources={legal.sources} /></SubSection>
              </SectionContent>
            )}

            {activeTab === 'debate' && (
              <SectionContent title="Investment Committee Debate" icon="🤝">
                <LiveDebate debateResult={debate} isLive={false} />
                {debate?.sources?.length > 0 && (
                  <SubSection title="Sources Referenced"><SourceList sources={debate.sources} /></SubSection>
                )}
              </SectionContent>
            )}

            {activeTab === 'ceo' && ceo && (
              <SectionContent title="CEO Decision" icon="👨‍💼">
                <CeoTab ceo={ceo} decisionStyle={decisionStyle} />
              </SectionContent>
            )}

            {activeTab === 'roadmap' && ceo && (
              <SectionContent title="30/60/90 Day Plan" icon="📅">
                <ExecutionRoadmap
                  thirtyDayPlan={ceo.thirtyDayPlan}
                  sixtyDayPlan={ceo.sixtyDayPlan}
                  ninetyDayPlan={ceo.ninetyDayPlan}
                />
              </SectionContent>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </WorkspaceLayout>
  )
}

function SummaryTab({ ceo }) {
  if (!ceo) return null

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
        <ScoreRing score={ceo.confidence} label="CEO Confidence" size={140} color="#8b5cf6" />
      </div>
      <p className="text-sm leading-relaxed text-slate-300">{ceo.executiveSummary}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-rose-400">Top Risks</h4>
          <ReportList items={ceo.topRisks} />
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Top Opportunities</h4>
          <ReportList items={ceo.topOpportunities} />
        </div>
      </div>
      <SubSection title="Validation Strategy"><ReportList items={ceo.validationStrategy} /></SubSection>
      <SubSection title="Immediate Next Steps"><ReportList items={ceo.nextSteps} /></SubSection>
    </div>
  )
}

function CeoTab({ ceo, decisionStyle }) {
  return (
    <div className="space-y-6">
      <div className={`rounded-2xl border p-6 ${decisionStyle.bg} ${decisionStyle.border}`}>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400">Final Verdict</p>
            <p className={`mt-2 text-4xl font-bold ${decisionStyle.text}`}>{ceo.verdict}</p>
          </div>
          <ScoreRing score={ceo.confidence} label="Confidence" color="#3b82f6" />
        </div>
      </div>

      <SubSection title="Executive Summary">
        <p className="text-sm leading-relaxed text-slate-300">{ceo.executiveSummary}</p>
      </SubSection>

      {ceo.keyEvidence?.length > 0 && (
        <SubSection title="Key Evidence by Agent">
          <div className="grid gap-3 sm:grid-cols-2">
            {ceo.keyEvidence.map((e, i) => (
              <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-forge-purple">{e.agent}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-300">{e.evidence}</p>
              </div>
            ))}
          </div>
        </SubSection>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Top Opportunities</h4>
          <ReportList items={ceo.topOpportunities} />
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-rose-400">Top Risks</h4>
          <ReportList items={ceo.topRisks} />
        </div>
      </div>

      <SubSection title="Investment Recommendation">
        <p className="text-sm text-slate-300">{ceo.investmentRecommendation}</p>
      </SubSection>
      <SubSection title="Validation Strategy"><ReportList items={ceo.validationStrategy} /></SubSection>
      <SubSection title="Success Metrics"><ReportList items={ceo.successMetrics} /></SubSection>
      <SubSection title="Immediate Next Steps"><ReportList items={ceo.nextSteps} /></SubSection>
      <SubSection title="Sources"><SourceList sources={ceo.sources} /></SubSection>
    </div>
  )
}

function SectionContent({ title, icon, children, confidence }) {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
          <span>{icon}</span> {title}
        </h2>
        <ConfidenceTag value={confidence} />
      </div>
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

function StatCard({ label, value, sub }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
      <p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-white">{value}</p>
      {sub && <p className="mt-0.5 text-[10px] text-slate-500">{sub}</p>}
    </div>
  )
}

function ConfidenceTag({ value }) {
  if (!Number.isFinite(value)) return null
  return (
    <span className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-slate-300">
      <span className="h-1.5 w-1.5 rounded-full bg-forge-purple" />
      {value}% confidence
    </span>
  )
}

function AssumptionsNote({ items }) {
  if (!items?.length) return null
  return (
    <div className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3.5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-400">Assumptions</p>
      <ul className="mt-2 space-y-1">
        {items.map((a, i) => (
          <li key={i} className="text-xs leading-relaxed text-slate-400">• {a}</li>
        ))}
      </ul>
    </div>
  )
}
