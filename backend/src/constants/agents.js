export const PARALLEL_AGENT_KEYS = [
  'research',
  'market',
  'finance',
  'product',
  'legal',
]

export const AGENT_KEYS = [
  ...PARALLEL_AGENT_KEYS,
  'debate',
  'ceo',
]

export const AGENT_META = {
  research: {
    key: 'research',
    name: 'Research Agent',
    icon: '🔍',
    description: 'Analyzing market landscape and industry trends',
  },
  market: {
    key: 'market',
    name: 'Market Agent',
    icon: '📈',
    description: 'Evaluating market size, growth, and competition',
  },
  finance: {
    key: 'finance',
    name: 'Finance Agent',
    icon: '💰',
    description: 'Assessing financial feasibility and unit economics',
  },
  product: {
    key: 'product',
    name: 'Product Agent',
    icon: '🛠️',
    description: 'Designing MVP strategy and product roadmap',
  },
  legal: {
    key: 'legal',
    name: 'Legal Agent',
    icon: '⚖️',
    description: 'Reviewing regulatory risks and compliance',
  },
  debate: {
    key: 'debate',
    name: 'Debate Engine',
    icon: '🤝',
    description: 'Investment committee debating the findings',
  },
  ceo: {
    key: 'ceo',
    name: 'CEO Agent',
    icon: '👨‍💼',
    description: 'Independently evaluating the venture and issuing a verdict',
  },
}
