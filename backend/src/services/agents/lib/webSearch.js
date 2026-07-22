import { getJson } from 'serpapi'
import { profileAsync } from './profiler.js'

/**
 * Runs a live web search and returns:
 *  - `formatted`: a prompt-ready text block,
 *  - `sources`  : structured {title, url} for the top results,
 *  - `organic`  : the raw {title, url, snippet} result list, used by callers
 *                 that need to verify facts (e.g. competitor website
 *                 verification) against actual search hits.
 *
 * Agents must ground claims in `formatted` and cite from `sources` — never
 * invent URLs.
 */
export async function webSearch(query, num = 8) {
  const response = await profileAsync('search', query.slice(0, 48), () =>
    getJson({
      engine: 'google',
      q: query,
      api_key: process.env.SERPAPI_KEY,
      num,
    })
  )

  const results = response.organic_results || []

  const organic = results.slice(0, num).map((r) => ({
    title: r.title || '',
    url: r.link || '',
    snippet: (r.snippet || '').slice(0, 300),
  }))

  const formatted = organic.map((r) => `- ${r.title}: ${r.snippet} (${r.url})`).join('\n')

  const sources = results.slice(0, 6).map((r) => ({
    title: r.title,
    url: r.link,
  }))

  return { formatted: formatted || 'No search results found.', sources, organic }
}
