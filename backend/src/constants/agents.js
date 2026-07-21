export const PARALLEL_AGENT_KEYS = [
  'research',
  'market',
  'finance',
  'product',
  'legal',
  'prototype',
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
  prototype: {
    key: 'prototype',
    name: 'Prototype Agent',
    icon: '🎨',
    description: 'Generating prototype concepts and UI direction',
  },
  debate: {
    key: 'debate',
    name: 'Debate Engine',
    icon: '🤝',
    description: 'Agents challenging and refining conclusions',
  },
  ceo: {
    key: 'ceo',
    name: 'CEO Agent',
    icon: '👨‍💼',
    description: 'Synthesizing insights and making final recommendation',
  },
}

export const AGENT_PROGRESS_STEPS = {
  research: [
    { phase: 'thinking', message: 'Research Agent is analyzing your idea…', duration: 800 },
    { phase: 'searching', message: 'Searching industry reports and trend databases…', duration: 1200 },
    { phase: 'reading', message: 'Reading sources and competitor filings…', duration: 1000 },
    { phase: 'building', message: 'Research Agent found 24 competitors in your space…', duration: 900 },
  ],
  market: [
    { phase: 'thinking', message: 'Market Agent is sizing your opportunity…', duration: 700 },
    { phase: 'searching', message: 'Validating market demand signals…', duration: 1100 },
    { phase: 'reading', message: 'Analyzing TAM, SAM, and growth projections…', duration: 1000 },
    { phase: 'building', message: 'Market Agent is mapping competitive landscape…', duration: 900 },
  ],
  finance: [
    { phase: 'thinking', message: 'Finance Agent is modeling unit economics…', duration: 800 },
    { phase: 'searching', message: 'Benchmarking pricing in your category…', duration: 1000 },
    { phase: 'building', message: 'Finance Agent is estimating operational costs…', duration: 1200 },
    { phase: 'reading', message: 'Building financial projections…', duration: 800 },
  ],
  product: [
    { phase: 'thinking', message: 'Product Agent is scoping MVP features…', duration: 700 },
    { phase: 'building', message: 'Product Agent is designing MVP architecture…', duration: 1300 },
    { phase: 'reading', message: 'Prioritizing features against budget constraints…', duration: 900 },
    { phase: 'searching', message: 'Evaluating tech stack options…', duration: 800 },
  ],
  legal: [
    { phase: 'thinking', message: 'Legal Agent is reviewing compliance requirements…', duration: 800 },
    { phase: 'searching', message: 'Legal Agent is checking regulatory landscape…', duration: 1100 },
    { phase: 'reading', message: 'Analyzing IP and liability risks…', duration: 1000 },
    { phase: 'building', message: 'Building compliance checklist…', duration: 700 },
  ],
  prototype: [
    { phase: 'thinking', message: 'Prototype Agent is interpreting product vision…', duration: 700 },
    { phase: 'building', message: 'Prototype Agent is generating interface concepts…', duration: 1400 },
    { phase: 'searching', message: 'Selecting design patterns and layout systems…', duration: 900 },
    { phase: 'reading', message: 'Finalizing wireframe architecture…', duration: 800 },
  ],
  debate: [
    { phase: 'thinking', message: 'Agents are preparing opening positions…', duration: 900 },
    { phase: 'building', message: 'Cross-examining findings across domains…', duration: 1200 },
    { phase: 'reading', message: 'Agents are challenging each other\'s assumptions…', duration: 1100 },
  ],
  ceo: [
    { phase: 'thinking', message: 'CEO Agent is reviewing all agent outputs…', duration: 1000 },
    { phase: 'reading', message: 'Weighing debate consensus against risks…', duration: 1200 },
    { phase: 'building', message: 'Synthesizing final recommendation…', duration: 1100 },
  ],
}

/** @deprecated use PARALLEL_AGENT_KEYS for sequential checks */
export const AGENT_EXECUTION_ORDER = AGENT_KEYS
