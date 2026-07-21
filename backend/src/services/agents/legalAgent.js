import { parseContext } from './context.js'
import { webSearch } from './lib/webSearch.js'
import { generateStructured } from './lib/llmJson.js'
import { tagSources } from './lib/sourceUtils.js'
import { buildLegalPrompt } from './prompts/legalPrompt.js'
import { legalSchema } from './schemas/legalSchema.js'

export async function runLegalAgent(context) {
  const { businessDetails, startupName, ideaText } = parseContext(context)

  const searchQuery = `${businessDetails.industry || ideaText} startup regulatory compliance requirements ${businessDetails.country || ''}`
  const { formatted: searchResults, sources } = await webSearch(searchQuery)

  const prompt = buildLegalPrompt({
    startupName,
    ideaText,
    businessDetails,
    searchResults,
  })

  const result = await generateStructured({
    agentName: 'Legal Agent',
    prompt,
    schema: legalSchema,
  })

  result.sources = tagSources(sources)

  return result
}
