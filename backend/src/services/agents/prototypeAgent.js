import { parseContext } from './context.js'

const SOFTWARE_KEYWORDS = /app|software|saas|platform|web|mobile|api|dashboard|tool|ai|marketplace|b2b|b2c|d2c/i
const HARDWARE_KEYWORDS = /hardware|device|iot|sensor|robot|drone|wearable|physical|manufacturing|chip|embedded/i

export async function runPrototypeAgent(context) {
  const { ideaText, businessDetails, startupName } = parseContext(context)
  const isHardware = HARDWARE_KEYWORDS.test(ideaText) || HARDWARE_KEYWORDS.test(businessDetails.industry || '')
  const prototypeType = isHardware ? 'hardware' : 'software'

  const screens = isHardware
    ? null
    : [
        {
          id: 'home',
          name: 'Home Dashboard',
          description: 'Central command with AI prompt input and quick actions',
          elements: ['Hero prompt bar', 'Recent analyses sidebar', 'Agent status strip', 'Quick-start suggestions'],
        },
        {
          id: 'analysis',
          name: 'Live Analysis',
          description: 'Parallel agent cards with real-time progress',
          elements: ['Agent grid', 'Progress indicators', 'Live status messages', 'Phase timeline'],
        },
        {
          id: 'report',
          name: 'Intelligence Report',
          description: 'Tabbed interactive report with domain scores',
          elements: ['Section tabs', 'Readiness score cards', 'CEO verdict', 'Execution roadmap'],
        },
      ]

  return {
    prototypeType,
    prototypeDescription: isHardware
      ? `Concept render architecture for ${startupName}: industrial design with premium materials, modular components, and LED status indicators. Designed for ${businessDetails.targetAudience || 'professional users'} in ${businessDetails.industry || 'the target market'}.`
      : `Interactive web prototype for ${startupName}: AI-first interface with central command bar, dark glassmorphism theme, real-time agent collaboration view, and tabbed intelligence report. Optimized for ${businessDetails.businessModel || 'SaaS'} workflows.`,
    wireframeNotes: isHardware
      ? 'Render 1: Hero product shot with dimension callouts. Render 2: Exploded view showing internal components. Render 3: In-context usage scenario with target user.'
      : 'Screen 1: Landing with hero prompt. Screen 2: Live analysis with agent grid. Screen 3: Debate timeline. Screen 4: Interactive report with tabs.',
    screens,
    conceptRenders: isHardware
      ? [
          { id: 'hero', title: 'Hero Concept', description: 'Primary product angle with branding', placeholderGradient: 'from-slate-700 to-slate-900' },
          { id: 'exploded', title: 'Exploded View', description: 'Internal architecture visualization', placeholderGradient: 'from-blue-900 to-slate-800' },
          { id: 'context', title: 'Usage Context', description: 'Product in real-world environment', placeholderGradient: 'from-purple-900 to-slate-800' },
        ]
      : null,
    uiRecommendations: [
      'Use monospace accent font for AI-generated content',
      'Skeleton loaders with shimmer during agent execution',
      'Micro-animations for pending → running → complete transitions',
      'CEO verdict as visual anchor — large, color-coded',
      'Mobile-first with collapsible agent grid on small screens',
    ],
    designSystem: {
      theme: 'Dark mode with purple/blue gradient accents',
      typography: 'Inter for UI, JetBrains Mono for AI output',
      components: 'Glass panels, gradient buttons, animated progress rings',
      inspiration: 'Cursor, Linear, Vercel, Perplexity',
    },
    integrationReady: {
      type: prototypeType,
      slotForLivePreview: true,
      apiEndpoint: '/api/agents/prototype/render',
    },
    readinessSignals: {
      designClarity: 76,
      userFlowCompleteness: 72,
      prototypeFeasibility: isHardware ? 65 : 84,
    },
  }
}
