import { parseContext } from './context.js'

export async function runProductAgent(context) {
  const { businessDetails, startupName } = parseContext(context)
  const stage = businessDetails.startupStage || 'Idea'
  const timeline = businessDetails.timeline || '8 weeks'

  return {
    productStrategy:
      `${startupName} should launch with a focused MVP that solves the core job-to-be-done in under 5 minutes. At ${stage} stage, prioritize speed-to-value over feature breadth. Use AI as the primary interaction layer.`,
    mvpStrategy:
      `Phase 1 (${timeline}): Core workflow + AI assistant + basic analytics. Phase 2: Team collaboration and integrations. Phase 3: Enterprise tier with SSO and custom workflows. Budget of ${businessDetails.budget || 'TBD'} constrains scope — cut non-essential features.`,
    coreFeatures: [
      'AI-powered onboarding wizard (60-second setup)',
      'Core workflow automation engine',
      'Real-time dashboard with key metrics',
      'Smart notifications and alerts',
      'Export & sharing capabilities',
    ],
    techStack: [
      'Frontend: React + TypeScript + Tailwind CSS',
      'Backend: Node.js with REST + WebSocket APIs',
      'Database: PostgreSQL + Redis cache',
      'AI: OpenAI / Anthropic API with RAG pipeline',
      'Infrastructure: Vercel + Supabase + AWS S3',
    ],
    timeline: `${timeline} to MVP · ${businessDetails.timeline || '16 weeks'} to public beta`,
    successMetrics: [
      'Time-to-first-value < 3 minutes',
      'Week-1 retention > 40%',
      'NPS > 45 at beta launch',
      '100 beta users within 30 days of launch',
    ],
    readinessSignals: {
      mvpClarity: stage === 'Idea' ? 65 : 78,
      featureScope: 70,
      technicalFeasibility: 82,
    },
  }
}
