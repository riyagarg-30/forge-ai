import { getJson } from 'serpapi'

const NO_RESULTS = { formatted: 'No search results found.', sources: [] }

/**
 * Runs a live web search and returns both a prompt-ready text block and
 * structured {title, url} sources. Agents must ground claims in `formatted`
 * and cite from `sources` — never invent URLs.
 *
 * SerpApi is optional infrastructure, not a hard dependency: a missing
 * SERPAPI_KEY, rate limit, or transient outage degrades to "no results"
 * instead of failing the research/market/legal agents that call this.
 */
export async function webSearch(query, num = 8) {
  if (!process.env.SERPAPI_KEY) return NO_RESULTS

  try {
    const response = await getJson({
      engine: 'google',
      q: query,
      api_key: process.env.SERPAPI_KEY,
      num,
    })

    const organic = response.organic_results || []

    const formatted = organic
      .slice(0, num)
      .map((r) => `- ${r.title}: ${(r.snippet || '').slice(0, 300)} (${r.link})`)
      .join('\n')

    const sources = organic.slice(0, 6).map((r) => ({
      title: r.title,
      url: r.link,
    }))

    return { formatted: formatted || NO_RESULTS.formatted, sources }
  } catch (err) {
    console.error(`[webSearch] SerpApi request failed, degrading to no results: ${err.message}`)
    return NO_RESULTS
  }
}
