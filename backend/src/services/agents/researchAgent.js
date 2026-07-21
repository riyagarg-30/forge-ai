import { parseContext } from './context.js'
import { webSearch } from './lib/webSearch.js'
import { generateStructured } from './lib/llmJson.js'
import { tagSources } from './lib/sourceUtils.js'
import { buildResearchPrompt } from './prompts/researchPrompt.js'
import { researchSchema } from './schemas/researchSchema.js'

export async function runResearchAgent(context) {
  const { ideaText, businessDetails, startupName } = parseContext(context)

  const searchQuery = `${ideaText || businessDetails.industry} startup problem validation demand market trends`
  const { formatted: searchResults, sources } = await webSearch(searchQuery)

  const prompt = buildResearchPrompt({
    startupName,
    ideaText,
    businessDetails,
    searchResults,
  })

  const result = await generateStructured({
    agentName: 'Research Agent',
    prompt,
    schema: researchSchema,
  })

  // Sources are always the real, typed search results — never the model's
  // own claims about links, which risk being fabricated.
  result.sources = tagSources(sources)

  return result
}
