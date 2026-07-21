const TYPE_RULES = [
  [/statista|ibisworld|marketsandmarkets|grandviewresearch|mordorintelligence|precedenceresearch|globenewswire.*research/, 'Market Research'],
  [/mckinsey|gartner|bcg\.com|deloitte|pwc\.com|forrester|bain\.com|accenture/, 'Industry Report'],
  [/crunchbase|pitchbook|cbinsights/, 'Startup Database'],
  [/\.gov\b|europa\.eu|oecd\.org|worldbank\.org|sec\.gov|ftc\.gov|who\.int/, 'Government/Regulatory'],
  [/arxiv\.org|ncbi\.nlm\.nih\.gov|researchgate|springer|sciencedirect|jstor/, 'Academic/Research Paper'],
  [/wikipedia\.org/, 'Reference'],
  [/techcrunch|forbes|bloomberg|reuters|wsj\.com|businessinsider|theverge/, 'News/Press'],
]

/** Best-effort classification of a source by domain — used because live
 * search results don't carry a category, and we never let the model
 * fabricate this metadata for sources it didn't originate. */
export function inferSourceType(url = '', title = '') {
  const text = `${url} ${title}`.toLowerCase()
  for (const [pattern, type] of TYPE_RULES) {
    if (pattern.test(text)) return type
  }
  return 'Web Source'
}

/** Attaches a `type` to each source, inferring one if the source doesn't
 * already carry it (e.g. raw SerpAPI results). */
export function tagSources(sources = []) {
  return sources
    .filter((s) => s?.url && s?.title)
    .map((s) => ({ title: s.title, url: s.url, type: s.type || inferSourceType(s.url, s.title) }))
}

/** Deduplicates sources (by URL) across any number of prior agent results. */
export function collectSources(...resultObjects) {
  const seen = new Map()
  for (const obj of resultObjects) {
    for (const s of obj?.sources || []) {
      if (s?.url && !seen.has(s.url)) seen.set(s.url, s)
    }
  }
  return Array.from(seen.values())
}

/**
 * Keeps only sources whose URL exists in `allowedSources` — the safety net
 * for agents that don't search themselves but may still hallucinate a URL
 * when asked to cite from context. Never trust a model-invented link.
 */
export function filterToKnownSources(candidateSources = [], allowedSources = []) {
  const allowedByUrl = new Map(allowedSources.map((s) => [s.url, s]))
  return (candidateSources || [])
    .filter((s) => s?.url && allowedByUrl.has(s.url))
    .map((s) => allowedByUrl.get(s.url))
}
