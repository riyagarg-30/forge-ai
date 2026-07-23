import { parseContext } from './context.js'
import { generateStructured } from './lib/llmJson.js'
import { collectSources, filterToKnownSources } from './lib/sourceUtils.js'
import { buildCeoContext } from './lib/ceoContextBuilder.js'
import { buildCeoPrompt } from './prompts/ceoPrompt.js'
import { ceoSchema } from './schemas/ceoSchema.js'

export async function runCeoAgent(context) {
  const { businessDetails, startupName, ideaText, priorResults } = parseContext(context)

  // Condensed, decision-relevant summaries only — keeps the CEO prompt
  // well within the LLM's token limit. Full reports/transcript remain
  // untouched in the database and are still what the frontend renders;
  // this condensed view is only ever used to build the CEO's own prompt.
  const ceoContext = buildCeoContext(priorResults)

  const prompt = buildCeoPrompt({
    startupName,
    ideaText,
    businessDetails,
    research: ceoContext.research,
    market: ceoContext.market,
    finance: ceoContext.finance,
    product: ceoContext.product,
    legal: ceoContext.legal,
    debate: ceoContext.debate,
  })

  const result = await generateStructured({
    agentName: 'CEO Agent',
    prompt,
    schema: ceoSchema,
    temperature: 0.35,
    maxTokens: 2000,
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