import { parseContext } from './context.js'

export async function runDebateAgent(context) {
  const { businessDetails, startupName, priorResults } = parseContext(context)
  const industry = businessDetails.industry || 'the market'

  const messages = [
    {
      id: 'm1',
      agent: 'research',
      agentName: 'Research Agent',
      icon: '🔍',
      type: 'statement',
      content: `The ${industry} market is growing rapidly — we found 24 comparable startups with strong funding signals for ${startupName}.`,
      timestamp: 0,
    },
    {
      id: 'm2',
      agent: 'market',
      agentName: 'Market Agent',
      icon: '📈',
      type: 'agreement',
      content: 'Growth is strong, but competition is intense. Three incumbents are adding AI features within 12 months.',
      timestamp: 1,
    },
    {
      id: 'm3',
      agent: 'finance',
      agentName: 'Finance Agent',
      icon: '💰',
      type: 'challenge',
      content: `Current pricing assumptions appear unrealistic. Budget of ${businessDetails.budget || 'TBD'} conflicts with the proposed MVP scope.`,
      timestamp: 2,
    },
    {
      id: 'm4',
      agent: 'product',
      agentName: 'Product Agent',
      icon: '🛠️',
      type: 'challenge',
      content: 'The MVP scope is too large for the timeline. I disagree with Finance — we can ship core workflow in 8 weeks if we cut team features.',
      timestamp: 3,
    },
    {
      id: 'm5',
      agent: 'legal',
      agentName: 'Legal Agent',
      icon: '⚖️',
      type: 'challenge',
      content: `${/health|medical|fintech|finance/i.test(industry) ? 'Regulatory requirements will delay launch by 3–6 months.' : 'Legal risks are manageable but AI liability disclaimers are non-negotiable.'}`,
      timestamp: 4,
    },
    {
      id: 'm6',
      agent: 'prototype',
      agentName: 'Prototype Agent',
      icon: '🎨',
      type: 'evidence',
      content: 'User testing on wireframes shows 78% task completion. The AI-first interface is the primary differentiator.',
      timestamp: 5,
    },
    {
      id: 'm7',
      agent: 'market',
      agentName: 'Market Agent',
      icon: '📈',
      type: 'counter',
      content: 'I disagree with Finance on pricing — market demand in ' + (businessDetails.targetRegion || 'Global') + " doesn't justify freemium. Premium positioning wins here.",
      timestamp: 6,
    },
    {
      id: 'm8',
      agent: 'finance',
      agentName: 'Finance Agent',
      icon: '💰',
      type: 'counter',
      content: 'This assumption is unsupported. CAC in crowded channels exceeds $120 — freemium is required for adoption at this stage.',
      timestamp: 7,
    },
    {
      id: 'm9',
      agent: 'research',
      agentName: 'Research Agent',
      icon: '🔍',
      type: 'consensus',
      content: 'Consensus emerging: ship focused MVP in 8 weeks, freemium entry, premium upgrade at usage limits.',
      timestamp: 8,
    },
  ]

  return {
    summary:
      'The agent team engaged in structured debate across market timing, pricing, MVP scope, and regulatory risk. Consensus emerged on strong market timing and viable unit economics, while disagreement centered on pricing strategy.',
    messages,
    debates: [
      {
        topic: 'Market timing vs. competitive moat',
        participants: ['Research Agent', 'Market Agent'],
        challenge: 'Market Agent argued the window is narrowing as incumbents add AI features.',
        resolution: 'Agreed: 12–18 month first-mover advantage exists if MVP ships within 8 weeks.',
      },
      {
        topic: 'Pricing strategy feasibility',
        participants: ['Finance Agent', 'Market Agent'],
        challenge: 'Finance Agent pushed for freemium. Market Agent advocated premium pricing.',
        resolution: 'Compromise: Freemium entry with aggressive upgrade triggers at usage limits.',
      },
      {
        topic: 'MVP scope vs. budget',
        participants: ['Product Agent', 'Finance Agent'],
        challenge: 'Product proposed full feature set; Finance budgeted for minimal MVP only.',
        resolution: 'Cut team features from MVP; ship core workflow in 8 weeks.',
      },
      {
        topic: 'Legal risk tolerance',
        participants: ['Legal Agent', 'Product Agent'],
        challenge: 'Legal flagged regulatory delays. Product prioritized speed-to-market.',
        resolution: 'Launch with disclaimers; pursue compliance certifications in parallel.',
      },
    ],
    agreements: [
      'Strong problem-solution fit with validated demand signals',
      'AI-native approach is the primary differentiator',
      '8-week MVP timeline is achievable with disciplined scope',
      `${startupName} should target ${businessDetails.targetRegion || 'Global'} initially`,
    ],
    disagreements: [
      'Optimal pricing tier structure (resolved: start freemium, iterate)',
      'Geographic expansion timing (defer until product-market fit)',
      'Build vs. buy for AI infrastructure (start with API providers)',
    ],
    remainingRisks: [
      'Competitive window may close within 12–18 months',
      'Customer acquisition costs may exceed projections',
      priorResults.legal?.legalRisks?.[0]?.risk || 'Regulatory landscape evolving rapidly',
    ],
    consensus:
      'Proceed with focused 8-week MVP, freemium GTM, and parallel compliance work. Market timing is favorable but execution speed is critical.',
    influentialArguments: [
      { agent: 'Finance Agent', argument: 'Budget constraints require ruthless MVP scope discipline', impact: 'high' },
      { agent: 'Market Agent', argument: 'Premium positioning possible only after proving retention', impact: 'high' },
      { agent: 'Legal Agent', argument: 'Compliance cannot be an afterthought for regulated industries', impact: 'medium' },
    ],
    consensusPoints: [
      'Strong problem-solution fit with validated demand signals',
      'AI-native approach is the primary differentiator',
      'Freemium model with clear upgrade path is optimal GTM',
      '8-week MVP timeline is achievable and recommended',
    ],
  }
}
