import { parseContext } from './context.js'

export async function runMarketAgent(context) {
  const { businessDetails, startupName } = parseContext(context)
  const region = businessDetails.targetRegion || 'Global'
  const competitors = businessDetails.existingCompetitors
    ? businessDetails.existingCompetitors.split(',').map((c) => c.trim()).filter(Boolean)
    : []

  return {
    marketSize: `$4.2B TAM · $680M SAM · $42M SOM (Year 3 target in ${region})`,
    growthRate: '18.4% CAGR (2024–2029)',
    marketAnalysis:
      `The ${businessDetails.industry || 'target'} market in ${region} is expanding rapidly. ${startupName} enters at a favorable inflection point as incumbents struggle to adapt to AI-native workflows. Market demand validates the ${businessDetails.revenueModel || 'subscription'} revenue approach.`,
    competitorAnalysis:
      competitors.length > 0
        ? `Identified ${competitors.length} named competitors (${competitors.slice(0, 3).join(', ')}). Differentiation opportunity exists through superior UX, AI-native workflows, and focused vertical positioning.`
        : 'The competitive landscape includes 3–5 established players with broad feature sets but poor UX and high pricing. Differentiation opportunity exists through superior onboarding and AI-native workflows.',
    competitors: [
      {
        name: competitors[0] || 'Incumbent Alpha',
        description: 'Legacy platform with significant market share but dated interface',
        strengths: ['Brand recognition', 'Enterprise sales team', 'Deep integrations'],
        weaknesses: ['Slow innovation cycle', 'High pricing', 'Poor mobile experience'],
      },
      {
        name: competitors[1] || 'Startup Beta',
        description: 'Well-funded competitor focused on mid-market',
        strengths: ['Modern UI', 'Strong VC backing', 'Active community'],
        weaknesses: ['Limited customization', 'No API', 'Regional limitations'],
      },
      {
        name: competitors[2] || 'Open Source Gamma',
        description: 'Developer-favorite tool with growing adoption',
        strengths: ['Free tier', 'Extensible', 'Strong developer community'],
        weaknesses: ['No enterprise features', 'Self-hosted complexity', 'Limited support'],
      },
    ],
    marketOpportunities: [
      `Underserved segment in ${region} priced out by enterprise tools`,
      'AI-powered automation as core differentiator vs. bolt-on features',
      `${businessDetails.businessModel || 'B2B'} integration marketplace as moat`,
    ],
    readinessSignals: {
      marketSize: 74,
      competitivePosition: 68,
      growthPotential: 81,
    },
  }
}
