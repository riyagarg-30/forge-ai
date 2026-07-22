import { parseContext } from './context.js'
import { generateStructured } from './lib/llmJson.js'
import { MODELS } from './lib/groqClient.js'
import { collectSources, filterToKnownSources } from './lib/sourceUtils.js'
import { buildFinancePrompt } from './prompts/financePrompt.js'
import { financeSchema } from './schemas/financeSchema.js'

export async function runFinanceAgent(context) {
  const { businessDetails, startupName, ideaText, priorResults } = parseContext(context)

  const prompt = buildFinancePrompt({
    startupName,
    ideaText,
    businessDetails,
    market: priorResults?.market,
    research: priorResults?.research,
  })

  const result = await generateStructured({
    agentName: 'Finance Agent',
    prompt,
    schema: financeSchema,
    model: MODELS.fast,
  })

  // The model can only cite sources that genuinely exist in the upstream
  // reports it was shown — any URL it invents is dropped here.
  const allowedSources = collectSources(priorResults?.market, priorResults?.research)
  result.sources = filterToKnownSources(result.sources, allowedSources)

  return result
}
