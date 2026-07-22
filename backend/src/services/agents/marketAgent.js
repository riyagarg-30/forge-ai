import { parseContext } from './context.js'
import { webSearch } from './lib/webSearch.js'
import { generateStructured } from './lib/llmJson.js'
import { MODELS } from './lib/groqClient.js'
import { tagSources } from './lib/sourceUtils.js'
import {
  verifyCompetitorLinks,
  normalizeCompetitor,
  dedupeCompetitors,
  attachVerifiedSourceUrl,
} from './lib/marketVerification.js'
import { buildMarketPrompt } from './prompts/marketPrompt.js'
import { marketSchema } from './schemas/marketSchema.js'

export async function runMarketAgent(context) {
  const { businessDetails, startupName, ideaText } = parseContext(context)

  // Live web research — the single source of truth. `organic` (raw hits) is
  // used to verify market-size citations; `sources` becomes the report's
  // real, typed citation list.
  const searchQuery = `${ideaText || businessDetails.industry} market size competitors`
  const { formatted: searchResults, sources, organic } = await webSearch(searchQuery)

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
    model: MODELS.fast,
  })

  // --- Competitor verification -------------------------------------------
  // The model's job was analysis, not URLs. Verify each competitor's official
  // website + LinkedIn against live search results, in parallel, then scrub
  // and de-duplicate. Any URL the model may have produced is discarded here.
  const rawCompetitors = Array.isArray(result.competitors) ? result.competitors : []
  const verifiedCompetitors = await Promise.all(
    rawCompetitors.map(async (c) => {
      const verified = await verifyCompetitorLinks(c.name)
      return normalizeCompetitor(c, verified)
    })
  )
  result.competitors = dedupeCompetitors(verifiedCompetitors)

  // --- Market-size citation verification ---------------------------------
  // Attach a source URL to TAM/SAM/SOM only when the cited source name can be
  // matched to a real organic result — never a fabricated link.
  attachVerifiedSourceUrl(result.tam, organic)
  attachVerifiedSourceUrl(result.sam, organic)
  attachVerifiedSourceUrl(result.som, organic)

  // Real, typed sources for the frontend, built from actual search results —
  // never trust the model to generate its own links.
  return { ...result, sources: tagSources(sources) }
}
