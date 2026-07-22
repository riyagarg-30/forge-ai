/**
 * Market verification helpers.
 * ----------------------------
 * The Market Agent must never trust a URL invented by the LLM. Everything in
 * this module is deterministic, code-side verification against REAL search
 * results:
 *
 *  - Competitor official websites and LinkedIn pages are only ever taken from
 *    live search hits whose domain/title actually matches the company name;
 *    otherwise the value is `null`.
 *  - Market-size (TAM/SAM/SOM) source URLs are only attached when the source
 *    name the model cited can be matched to a real organic search result.
 *  - Competitors and URLs are de-duplicated, placeholders are scrubbed, and
 *    every returned URL is a valid http(s) URL.
 *
 * Nothing here calls the LLM — it only shapes and validates data.
 */
import { webSearch } from './webSearch.js'

// Domains that are never a company's *own* official website — aggregators,
// social networks, press, app stores, review sites, etc.
const NON_OFFICIAL_HOSTS = new Set([
  'wikipedia', 'crunchbase', 'linkedin', 'facebook', 'twitter', 'x', 'youtube',
  'instagram', 'tiktok', 'g2', 'capterra', 'getapp', 'trustpilot', 'glassdoor',
  'bloomberg', 'reddit', 'medium', 'producthunt', 'indeed', 'pitchbook',
  'forbes', 'techcrunch', 'yahoo', 'google', 'bing', 'apple', 'amazon',
  'play', 'apps', 'wellfound', 'angellist', 'owler', 'zoominfo', 'similarweb',
])

// Generic tokens that don't help identify a company by name.
const GENERIC_TOKENS = new Set([
  'the', 'app', 'ai', 'inc', 'llc', 'ltd', 'co', 'corp', 'company', 'technologies',
  'technology', 'labs', 'io', 'group', 'global', 'solutions', 'systems', 'software',
  'platform', 'online', 'digital', 'the', 'and', 'services',
])

const PLACEHOLDER_RE =
  /^(tbd|n\/?a|none|null|undefined|unknown|xx+|\$?x+|example|placeholder|company\s*name|website|your\s|lorem)/i

function tokenize(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
}

/** All name tokens collapsed into one alphanumeric string (e.g. "Acme Labs" -> "acmelabs"). */
function compactName(name) {
  return tokenize(name).join('')
}

/** The most distinctive (longest non-generic) token of a name. */
function primaryToken(name) {
  const meaningful = tokenize(name).filter((t) => !GENERIC_TOKENS.has(t))
  meaningful.sort((a, b) => b.length - a.length)
  return meaningful[0] || tokenize(name)[0] || ''
}

function parseUrl(url) {
  if (!url) return null
  try {
    return new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`)
  } catch {
    return null
  }
}

/**
 * True only for a syntactically valid http(s) URL with a real (dotted) host.
 * The dot requirement rejects bare strings like "not-a-url" that would
 * otherwise parse into a dotless hostname once a scheme is prepended.
 */
export function isValidHttpUrl(url) {
  const parsed = parseUrl(url)
  if (!parsed) return false
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false
  return parsed.hostname.includes('.') && parsed.hostname.length > 3
}

function hostname(url) {
  const parsed = parseUrl(url)
  if (!parsed) return null
  return parsed.hostname.toLowerCase().replace(/^www\./, '')
}

/** The registrable label of a host: "stripe" from "app.stripe.com" or "stripe.co.uk". */
function hostCore(host) {
  if (!host) return ''
  const parts = host.split('.')
  if (parts.length <= 1) return host.replace(/[^a-z0-9]/g, '')
  parts.pop() // drop TLD
  const SECOND_LEVEL = new Set(['co', 'com', 'org', 'net', 'gov', 'ac', 'edu'])
  if (parts.length >= 2 && SECOND_LEVEL.has(parts[parts.length - 1])) parts.pop()
  return (parts[parts.length - 1] || '').replace(/[^a-z0-9]/g, '')
}

/**
 * Scrubs a string field: returns `fallback` for empty/placeholder values.
 * Honest sentinels like "Insufficient public information." are preserved.
 */
export function cleanString(value, fallback = 'Unknown') {
  if (value == null) return fallback
  const s = String(value).trim()
  if (!s || PLACEHOLDER_RE.test(s)) return fallback
  return s
}

function cleanStringArray(arr, fallback = 'Unknown') {
  const cleaned = (Array.isArray(arr) ? arr : [])
    .map((v) => cleanString(v, ''))
    .filter((v) => v && v !== '')
  return cleaned.length ? cleaned : [fallback]
}

/**
 * Picks a verified official website for `name` from live `organic` results.
 * Returns the domain root (e.g. https://stripe.com) only when a result's
 * domain or title genuinely matches the company name; otherwise null.
 */
export function pickOfficialWebsite(name, organic = []) {
  const core = compactName(name)
  const primary = primaryToken(name)
  if (!core) return null
  const fullName = tokenize(name).join(' ')

  for (const r of organic) {
    const host = hostname(r.url)
    if (!host) continue
    const hc = hostCore(host)
    if (!hc || NON_OFFICIAL_HOSTS.has(hc)) continue

    const titleMatch = fullName.length > 2 && String(r.title || '').toLowerCase().includes(fullName)
    const domainMatch =
      hc === core ||
      hc.includes(core) ||
      core.includes(hc) ||
      (primary.length >= 4 && hc.includes(primary))

    if (domainMatch || titleMatch) return `https://${host}`
  }
  return null
}

/** Picks a verified LinkedIn *company* page for `name` from live results, else null. */
export function pickLinkedIn(name, organic = []) {
  const core = compactName(name)
  for (const r of organic) {
    if (!/^https?:\/\/([a-z]+\.)?linkedin\.com\/company\//i.test(r.url || '')) continue
    const hay = `${r.title || ''} ${r.url || ''}`.toLowerCase().replace(/[^a-z0-9]/g, '')
    if (!core || hay.includes(core) || core.includes(primaryToken(name))) {
      return String(r.url).split('?')[0]
    }
  }
  return null
}

/**
 * Runs a targeted search for one competitor and returns only verified links.
 * Resilient by design: any search failure yields nulls rather than throwing,
 * so one bad lookup never fails the whole market analysis.
 */
export async function verifyCompetitorLinks(name) {
  try {
    const { organic } = await webSearch(`${name} official website`, 6)
    return {
      website: pickOfficialWebsite(name, organic),
      linkedin: pickLinkedIn(name, organic),
    }
  } catch {
    return { website: null, linkedin: null }
  }
}

/**
 * De-duplicates competitors by normalized name AND by website URL, drops
 * invalid URLs, and guarantees every competitor ends with a verified website
 * string or an explicit null.
 */
export function dedupeCompetitors(list = []) {
  const seenName = new Set()
  const seenUrl = new Set()
  const out = []

  for (const c of list) {
    const key = compactName(c?.name)
    if (!key || seenName.has(key)) continue
    seenName.add(key)

    let website = c.website || null
    if (website && (!isValidHttpUrl(website) || seenUrl.has(website))) website = null
    if (website) seenUrl.add(website)

    let linkedin = c.linkedin || null
    if (linkedin && !isValidHttpUrl(linkedin)) linkedin = null

    out.push({ ...c, website, linkedin })
  }
  return out
}

/**
 * Normalizes one competitor: scrubs text fields (Unknown fallback), keeps
 * strengths/weaknesses non-empty, and attaches ONLY the verified links.
 */
export function normalizeCompetitor(raw, verified) {
  return {
    name: cleanString(raw.name),
    country: cleanString(raw.country),
    description: cleanString(raw.description),
    positioning: cleanString(raw.positioning),
    whyRelevant: cleanString(raw.whyRelevant),
    strengths: cleanStringArray(raw.strengths),
    weaknesses: cleanStringArray(raw.weaknesses),
    website: verified.website, // verified or null — never the model's own URL
    linkedin: verified.linkedin,
  }
}

/**
 * Attaches a verified source URL to a market-size metric (TAM/SAM/SOM) ONLY
 * when the source name the model cited can be matched to a real organic
 * result. Never fabricates a citation; leaves sourceUrl null otherwise.
 */
export function attachVerifiedSourceUrl(metric, organic = []) {
  if (!metric || typeof metric !== 'object') return metric
  const srcTokens = tokenize(metric.source).filter((t) => t.length >= 4 && !GENERIC_TOKENS.has(t))

  if (srcTokens.length) {
    for (const r of organic) {
      const hay = `${r.title || ''} ${r.url || ''}`.toLowerCase()
      if (srcTokens.some((t) => hay.includes(t)) && isValidHttpUrl(r.url)) {
        metric.sourceUrl = r.url
        metric.sourceTitle = r.title || null
        return metric
      }
    }
  }

  // No verifiable match against a real search result — never keep an
  // unverified/model-supplied URL as a citation.
  metric.sourceUrl = null
  metric.sourceTitle = null
  return metric
}
