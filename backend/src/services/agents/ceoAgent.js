import { parseContext } from './context.js'
import { generateStructured } from './lib/llmJson.js'
import { MODELS } from './lib/groqClient.js'
import { collectSources, filterToKnownSources } from './lib/sourceUtils.js'
import { buildCeoPrompt } from './prompts/ceoPrompt.js'
import { ceoSchema } from './schemas/ceoSchema.js'

export async function runCeoAgent(context) {
  const { businessDetails, startupName, ideaText, priorResults } = parseContext(context)

  const prompt = buildCeoPrompt({
    startupName,
    ideaText,
    businessDetails,
    research: priorResults?.research,
    market: priorResults?.market,
    finance: priorResults?.finance,
    product: priorResults?.product,
    legal: priorResults?.legal,
    debate: priorResults?.debate,
  })

  const result = await generateStructured({
    agentName: 'CEO Agent',
    prompt,
    schema: ceoSchema,
    temperature: 0.4,
    maxTokens: 6000,
    model: MODELS.reasoning,
  })

  const allowedSources = collectSources(
    priorResults?.research,
    priorResults?.market,
    priorResults?.finance,
    priorResults?.product,
    priorResults?.legal,
    priorResults?.debate
  )
  result.sources = filterToKnownSources(result.sources, allowedSources)

  return result
}
