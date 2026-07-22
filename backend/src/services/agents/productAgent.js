import { parseContext } from './context.js'
import { generateStructured } from './lib/llmJson.js'
import { MODELS } from './lib/groqClient.js'
import { collectSources, filterToKnownSources } from './lib/sourceUtils.js'
import { buildProductPrompt } from './prompts/productPrompt.js'
import { productSchema } from './schemas/productSchema.js'

export async function runProductAgent(context) {
  const { businessDetails, startupName, ideaText, priorResults } = parseContext(context)

  const prompt = buildProductPrompt({
    startupName,
    ideaText,
    businessDetails,
    market: priorResults?.market,
    research: priorResults?.research,
  })

  const result = await generateStructured({
    agentName: 'Product Agent',
    prompt,
    schema: productSchema,
    model: MODELS.fast,
  })

  const allowedSources = collectSources(priorResults?.market, priorResults?.research)
  result.sources = filterToKnownSources(result.sources, allowedSources)

  return result
}
