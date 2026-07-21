export const PARALLEL_AGENTS = [
  { key: 'research', name: 'Research Agent', icon: '🔍', description: 'Analyzing market landscape and industry trends' },
  { key: 'market', name: 'Market Agent', icon: '📈', description: 'Evaluating market size, growth, and competition' },
  { key: 'finance', name: 'Finance Agent', icon: '💰', description: 'Assessing financial feasibility and unit economics' },
  { key: 'product', name: 'Product Agent', icon: '🛠️', description: 'Designing MVP strategy and product roadmap' },
  { key: 'legal', name: 'Legal Agent', icon: '⚖️', description: 'Reviewing regulatory risks and compliance' },
]

export const AGENT_PIPELINE = [
  ...PARALLEL_AGENTS,
  { key: 'debate', name: 'Debate Engine', icon: '🤝', description: 'Investment committee debating the findings' },
  { key: 'ceo', name: 'CEO Agent', icon: '👨‍💼', description: 'Independently evaluating the venture and issuing a verdict' },
]

export const AGENT_KEYS = AGENT_PIPELINE.map((a) => a.key)
export const PARALLEL_AGENT_KEYS = PARALLEL_AGENTS.map((a) => a.key)

export const PHASES = {
  PARALLEL: 'parallel',
  DEBATE: 'debate',
  CEO: 'ceo',
  COMPLETE: 'complete',
}

export function getAgentMeta(key) {
  return AGENT_PIPELINE.find((a) => a.key === key)
}
