import { parseContext } from './context.js'
import { webSearch } from './lib/webSearch.js'
import { generateStructured } from './lib/llmJson.js'
import { tagSources } from './lib/sourceUtils.js'
import { buildMarketPrompt } from './prompts/marketPrompt.js'
import { marketSchema } from './schemas/marketSchema.js'

export async function runMarketAgent(context) {
  const { businessDetails, startupName, ideaText } = parseContext(context)

  const searchQuery = `${ideaText || businessDetails.industry} market size competitors`
  const { formatted: searchResults, sources } = await webSearch(searchQuery)

  const prompt = buildMarketPrompt({
    startupName,
    ideaText,
    businessDetails,
    searchResults,
  })

  const result = await generateStructured({
    agentName: 'Market Agent',
    prompt,
    schema: marketSchema,
    maxTokens: 2000,
  })

  // Real, typed sources for the frontend, built from actual search results —
  // never trust the model to generate its own links.
  return { ...result, sources: tagSources(sources) }
}
