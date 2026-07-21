import { parseContext } from './context.js'

export async function runFinanceAgent(context) {
  const { businessDetails, startupName } = parseContext(context)
  const budget = businessDetails.budget || '$100,000'
  const teamSize = businessDetails.teamSize || '2-3'

  return {
    financialFeasibility:
      `${startupName} demonstrates viable unit economics with a path to profitability within 18–24 months. Budget of ${budget} with a team of ${teamSize} is ${parseBudget(budget) >= 50000 ? 'adequate' : 'tight but achievable'} for an MVP launch in ${businessDetails.timeline || '6 months'}.`,
    estimatedStartupCost: `${budget} (${businessDetails.timeline || '6-month'} runway to MVP + initial GTM)`,
    revenueModel: businessDetails.revenueModel || 'Freemium SaaS with tiered pricing: Free → Pro ($29/mo) → Team ($79/mo) → Enterprise (custom)',
    unitEconomics: {
      cac: '$45–$120 (blended across channels)',
      ltv: '$840 (24-month avg. retention)',
      ltvCacRatio: '7:1 at scale',
      grossMargin: '82–88%',
    },
    breakEvenTimeline: 'Month 14–18 at 800 paying customers',
    fundingRecommendation:
      `Recommend aligning raise with ${budget} budget. ${businessDetails.startupStage === 'Idea' ? 'Bootstrap to validate before raising.' : 'Consider seed raise to accelerate GTM.'}`,
    costBreakdown: [
      { category: `Engineering (${teamSize} FTE)`, amount: estimateEngineering(budget) },
      { category: 'Infrastructure & Tools', amount: '$8,000' },
      { category: 'Marketing & GTM', amount: '$25,000' },
      { category: 'Legal & Compliance', amount: '$7,000' },
      { category: 'Operations & Buffer', amount: '$15,000' },
    ],
    readinessSignals: {
      unitEconomics: 72,
      budgetAlignment: parseBudget(budget) >= 75000 ? 78 : 58,
      revenueModelViability: 76,
    },
  }
}

function parseBudget(budget) {
  const match = String(budget).replace(/,/g, '').match(/(\d+)/)
  return match ? parseInt(match[1], 10) : 100000
}

function estimateEngineering(budget) {
  const amount = parseBudget(budget)
  const eng = Math.round(amount * 0.45)
  return `$${eng.toLocaleString()}`
}
