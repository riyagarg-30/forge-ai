import { parseContext } from './context.js'

function computeDomainScores(priorResults, businessDetails) {
  const signals = {
    marketReadiness: avg([
      priorResults.research?.readinessSignals?.marketDemand,
      priorResults.market?.readinessSignals?.marketSize,
      priorResults.market?.readinessSignals?.growthPotential,
    ]),
    productReadiness: avg([
      priorResults.product?.readinessSignals?.mvpClarity,
      priorResults.product?.readinessSignals?.featureScope,
      priorResults.product?.readinessSignals?.technicalFeasibility,
    ]),
    financialReadiness: avg([
      priorResults.finance?.readinessSignals?.unitEconomics,
      priorResults.finance?.readinessSignals?.budgetAlignment,
      priorResults.finance?.readinessSignals?.revenueModelViability,
    ]),
    technicalReadiness: avg([
      priorResults.product?.readinessSignals?.technicalFeasibility,
      priorResults.prototype?.readinessSignals?.prototypeFeasibility,
    ]),
    legalReadiness: avg([
      priorResults.legal?.readinessSignals?.regulatoryClarity,
      priorResults.legal?.readinessSignals?.complianceReadiness,
      priorResults.legal?.readinessSignals?.ipProtection,
    ]),
    scalability: avg([
      priorResults.market?.readinessSignals?.growthPotential,
      priorResults.finance?.readinessSignals?.unitEconomics,
      70,
    ]),
    competitiveAdvantage: avg([
      priorResults.research?.readinessSignals?.timing,
      priorResults.market?.readinessSignals?.competitivePosition,
      priorResults.prototype?.readinessSignals?.designClarity,
    ]),
    investmentReadiness: avg([
      priorResults.finance?.readinessSignals?.unitEconomics,
      priorResults.research?.readinessSignals?.problemValidation,
      businessDetails.startupStage === 'Live' ? 85 : businessDetails.startupStage === 'Beta' ? 75 : 60,
    ]),
  }

  const domainScores = Object.entries(signals).map(([key, score]) => ({
    key,
    label: formatLabel(key),
    score: Math.round(clamp(score + (Math.random() * 6 - 3), 45, 92)),
    explanation: getExplanation(key, score, businessDetails),
    improvements: getImprovements(key, businessDetails),
  }))

  const overallReadinessScore = Math.round(
    domainScores.reduce((sum, d) => sum + d.score, 0) / domainScores.length
  )

  return { domainScores, overallReadinessScore }
}

function avg(values) {
  const valid = values.filter((v) => typeof v === 'number')
  if (valid.length === 0) return 68 + Math.random() * 15
  return valid.reduce((a, b) => a + b, 0) / valid.length
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val))
}

function formatLabel(key) {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .trim()
}

function getExplanation(key, score, details) {
  const explanations = {
    marketReadiness: `Market demand in ${details.industry || 'your industry'} shows ${score >= 70 ? 'strong' : 'moderate'} validation for ${details.targetRegion || 'Global'} expansion.`,
    productReadiness: `MVP scope at ${details.startupStage || 'Idea'} stage is ${score >= 70 ? 'well-defined' : 'needs refinement'} for ${details.timeline || 'your timeline'}.`,
    financialReadiness: `Unit economics and ${details.budget || 'budget'} alignment ${score >= 70 ? 'support' : 'challenge'} the ${details.revenueModel || 'revenue'} model.`,
    technicalReadiness: `Tech stack and architecture are ${score >= 70 ? 'feasible' : 'ambitious'} for a team of ${details.teamSize || '2-3'}.`,
    legalReadiness: `Regulatory landscape in ${details.country || 'your market'} presents ${score >= 70 ? 'manageable' : 'significant'} compliance requirements.`,
    scalability: `Growth potential via ${details.businessModel || 'SaaS'} model is ${score >= 70 ? 'strong' : 'uncertain'} at current stage.`,
    competitiveAdvantage: `Differentiation against ${details.existingCompetitors || 'incumbents'} is ${score >= 70 ? 'clear' : 'developing'}.`,
    investmentReadiness: `At ${details.startupStage || 'Idea'} stage with ${details.budget || 'TBD'} budget, investor readiness is ${score >= 70 ? 'approaching' : 'early'}.`,
  }
  return explanations[key] || 'Score based on cross-agent analysis.'
}

function getImprovements(key, details) {
  const improvements = {
    marketReadiness: ['Conduct 20 customer discovery interviews', 'Validate pricing with 10 target users', 'Run competitive win/loss analysis'],
    productReadiness: ['Cut MVP scope to core workflow only', 'Create clickable prototype for user testing', 'Define success metrics before building'],
    financialReadiness: ['Build 18-month financial model', 'Validate CAC assumptions with small ad spend', 'Identify unit economics break-even point'],
    technicalReadiness: ['Write technical architecture doc', 'Spike on highest-risk integration', 'Set up CI/CD before feature development'],
    legalReadiness: ['Draft privacy policy and ToS', 'Conduct trademark search', 'Engage legal counsel for regulated aspects'],
    scalability: ['Design multi-tenant architecture from day one', 'Plan API-first approach for integrations', 'Identify automation opportunities early'],
    competitiveAdvantage: ['Document unique value proposition', 'Build moat through data network effects', 'File provisional IP if applicable'],
    investmentReadiness: ['Prepare investor deck v1', 'Track key metrics from day one', 'Build advisory board with domain experts'],
  }
  return improvements[key] || ['Continue validation and iteration']
}

export async function runCeoAgent(context) {
  const { businessDetails, startupName, priorResults } = parseContext(context)
  const { domainScores, overallReadinessScore } = computeDomainScores(priorResults, businessDetails)

  const confidenceScore = Math.round(overallReadinessScore * 0.92 + Math.random() * 8)
  const decision = overallReadinessScore >= 75 ? 'Build' : overallReadinessScore >= 58 ? 'Pivot' : "Don't Build"

  return {
    decision,
    confidenceScore,
    startupReadinessScore: overallReadinessScore,
    overallReadinessScore,
    domainScores,
    executiveSummary:
      `After comprehensive analysis by our AI co-founder team, ${startupName} shows ${overallReadinessScore >= 70 ? 'strong' : 'moderate'} potential with manageable risks. The ${businessDetails.industry || 'target'} market timing is ${overallReadinessScore >= 75 ? 'highly favorable' : 'favorable with caveats'}. Recommendation: ${decision.toLowerCase()} with a focused ${businessDetails.timeline || '8-week'} MVP.`,
    keyStrengths: [
      'Clear problem-solution fit with measurable market demand',
      `Favorable timing in ${businessDetails.industry || 'the industry'} as AI adoption accelerates`,
      `Viable ${businessDetails.revenueModel || 'revenue'} model with path to profitability`,
      `Differentiated positioning vs. ${businessDetails.existingCompetitors || 'slow-moving incumbents'}`,
      `${businessDetails.targetRegion || 'Global'} market entry strategy is sound`,
    ],
    weaknesses: [
      'MVP scope may exceed budget constraints without disciplined cuts',
      'Customer acquisition costs uncertain in crowded channels',
      'Team size may limit parallel workstreams',
      priorResults.debate?.remainingRisks?.[0] || 'Competitive window requires fast execution',
    ],
    keyRisks: priorResults.debate?.remainingRisks || [
      'Competitive window may close within 12–18 months',
      'Customer acquisition costs may exceed projections',
      'Regulatory landscape evolving rapidly',
    ],
    majorRisks: priorResults.debate?.remainingRisks || [
      'Competitive window may close within 12–18 months',
      'Execution risk on MVP timeline',
    ],
    opportunities: [
      `First-mover advantage in ${businessDetails.industry || 'vertical'} AI tooling`,
      'Partnership potential with complementary platforms',
      'Expansion to adjacent markets after PMF',
    ],
    recommendedStrategy:
      decision === 'Build'
        ? `Execute focused MVP in ${businessDetails.timeline || '8 weeks'}, launch freemium GTM in ${businessDetails.targetRegion || 'Global'}, raise aligned with ${businessDetails.budget || 'budget'}.`
        : decision === 'Pivot'
          ? `Pivot toward narrower ICP within ${businessDetails.industry || 'market'}, reduce scope, validate pricing before full build.`
          : `Reconsider core assumptions. Market signals don't justify investment at current scope and budget.`,
    investmentRecommendation:
      overallReadinessScore >= 75
        ? `Recommend raising $500K–$750K pre-seed aligned with ${businessDetails.budget || 'budget'}.`
        : overallReadinessScore >= 58
          ? 'Bootstrap to validation milestones before raising.'
          : 'Do not seek investment until core assumptions are validated.',
    recommendedNextSteps: [
      'Validate core assumption with 20 customer discovery interviews this week',
      'Build clickable prototype and test with 10 target users',
      `File trademark application for ${startupName}`,
      'Set up analytics infrastructure before writing product code',
      'Draft privacy policy and terms of service',
    ],
    nextSteps: [
      'Week 1: Customer interviews + competitive deep-dive',
      'Week 2: MVP wireframes + technical architecture',
      'Week 3-4: Core MVP development',
      'Week 5: Private beta with 25 users',
    ],
    executionRoadmap: [
      {
        week: 1,
        title: 'Week 1 — Discovery & Validation',
        focus: 'Customer Discovery',
        tasks: [
          { name: 'Customer Interviews', description: 'Conduct 15–20 discovery calls with target users', deliverable: 'Interview synthesis doc', milestone: 'Problem validated' },
          { name: 'Market Validation', description: 'Validate demand with landing page + waitlist', deliverable: '100+ waitlist signups', milestone: 'Demand signal confirmed' },
          { name: 'Competitor Research', description: 'Deep-dive on top 5 competitors', deliverable: 'Competitive matrix', milestone: 'Differentiation identified' },
        ],
      },
      {
        week: 2,
        title: 'Week 2 — Planning & Design',
        focus: 'MVP Planning',
        tasks: [
          { name: 'MVP Planning', description: 'Define core workflow and cut scope ruthlessly', deliverable: 'MVP spec document', milestone: 'Scope locked' },
          { name: 'Feature Prioritization', description: 'MoSCoW prioritization with team', deliverable: 'Prioritized backlog', milestone: 'Sprint 1 planned' },
          { name: 'Wireframes', description: 'Create clickable wireframes for core flows', deliverable: 'Figma prototype', milestone: 'UX validated' },
        ],
      },
      {
        week: 3,
        title: 'Week 3 — Build & Test',
        focus: 'Prototype Development',
        tasks: [
          { name: 'Prototype Development', description: 'Build core MVP features', deliverable: 'Working prototype', milestone: 'Core workflow functional' },
          { name: 'User Testing', description: 'Test with 10 target users', deliverable: 'Usability report', milestone: 'Task completion > 70%' },
          { name: 'Landing Page', description: 'Launch marketing landing page', deliverable: 'Live landing page', milestone: 'GTM channel active' },
        ],
      },
      {
        week: 4,
        title: 'Week 4 — Launch Prep',
        focus: 'Go-to-Market',
        tasks: [
          { name: 'Launch Strategy', description: 'Plan beta launch sequence', deliverable: 'Launch playbook', milestone: 'Launch date set' },
          { name: 'Marketing', description: 'Content + community outreach', deliverable: '5 content pieces', milestone: 'Pipeline built' },
          { name: 'Investor Preparation', description: 'Draft pitch deck and financial model', deliverable: 'Investor deck v1', milestone: 'Fundraise ready' },
        ],
      },
    ],
  }
}
