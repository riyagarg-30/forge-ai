import { getJson } from 'serpapi'

/**
 * Runs a live web search and returns both a prompt-ready text block and
 * structured {title, url} sources. Agents must ground claims in `formatted`
 * and cite from `sources` — never invent URLs.
 */
export async function webSearch(query, num = 8) {
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

  return { formatted: formatted || 'No search results found.', sources }
}
