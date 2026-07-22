import { parseContext } from './context.js'
import { generateStructured } from './lib/llmJson.js'
import { MODELS } from './lib/groqClient.js'
import { collectSources, filterToKnownSources } from './lib/sourceUtils.js'
import { buildDebatePrompt } from './prompts/debatePrompt.js'
import { debateSchema } from './schemas/debateSchema.js'

export async function runDebateAgent(context) {
  const { businessDetails, startupName, ideaText, priorResults } = parseContext(context)

  const prompt = buildDebatePrompt({
    startupName,
    ideaText,
    businessDetails,
    research: priorResults?.research,
    market: priorResults?.market,
    finance: priorResults?.finance,
    product: priorResults?.product,
    legal: priorResults?.legal,
  })

  const result = await generateStructured({
    agentName: 'Debate Agent',
    prompt,
    schema: debateSchema,
    temperature: 0.55,
    maxTokens: 5000,
    model: MODELS.reasoning,
  })

  const allowedSources = collectSources(
    priorResults?.research,
    priorResults?.market,
    priorResults?.finance,
    priorResults?.product,
    priorResults?.legal
  )
  result.sources = filterToKnownSources(result.sources, allowedSources)

  return result
}
