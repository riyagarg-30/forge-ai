/**
 * Renders the founder-provided startup form into a consistent text block
 * every agent prompt embeds — so every agent reasons over the same facts.
 */
export function buildStartupContext({ startupName, ideaText, businessDetails }) {
  const d = businessDetails || {}
  return `STARTUP NAME: ${startupName || 'N/A'}
IDEA / PRODUCT DESCRIPTION: ${ideaText || 'N/A'}

FOUNDER-PROVIDED BUSINESS DETAILS:
- Industry: ${d.industry || 'N/A'}
- Country: ${d.country || 'N/A'}
- Target Region: ${d.targetRegion || 'N/A'}
- Business Model: ${d.businessModel || 'N/A'}
- Target Audience: ${d.targetAudience || 'N/A'}
- Startup Stage: ${d.startupStage || 'N/A'}
- Budget: ${d.budget || 'N/A'}
- Team Size: ${d.teamSize || 'N/A'}
- Timeline: ${d.timeline || 'N/A'}
- Revenue Model: ${d.revenueModel || 'N/A'}
- Existing Competitors (founder-named): ${d.existingCompetitors || 'None specified'}
- Additional Requirements: ${d.additionalRequirements || 'None'}`
}

/**
 * Formats a prior agent's result for embedding in a downstream prompt.
 * Parallel agents may run before their siblings finish, so callers must
 * degrade gracefully rather than assume the dependency is present.
 */
export function formatPriorResult(label, result) {
  if (!result) {
    return `${label}: Not yet available. Proceed with independent analysis and note this dependency was unavailable rather than guessing at its content.`
  }
  // Compact (non-pretty) JSON: same information, but no indentation whitespace
  // — meaningfully fewer prompt tokens per embedded report, which lowers LLM
  // latency for finance/product/debate without dropping any field.
  return `${label}:\n${JSON.stringify(result)}`
}

/**
 * Shared instruction for agents that don't search the web themselves but
 * receive upstream reports that already carry real, typed sources (each
 * has a "sources": [{ title, url, type }] array). These agents may only
 * cite from what's already visible above — never invent a new URL.
 */
export const SOURCE_CITATION_RULE = `SOURCE CITATION RULE
You do not have web search access. Every report embedded above that has a "sources" array contains real, verified citations. When a claim you make is materially supported by one of those sources, copy its "title", "url", and "type" EXACTLY as given into your own "sources" array. Do not alter URLs, do not invent new sources, and do not fabricate a source for a claim that has none available above. If none of the available sources are directly relevant to your analysis, return an empty "sources" array rather than guessing.`

/**
 * Shared "founder's constraints are hard limits" rule. Embedded in every agent
 * prompt so no agent silently assumes more money, time, people, or infrastructure
 * than the founder actually stated.
 */
export const HARD_CONSTRAINTS_RULE = `HARD CONSTRAINTS (non-negotiable)
Treat EVERY founder-provided constraint — budget, timeline, team size, team skills, available resources, manufacturing/production capability, and any other stated limitation — as a HARD limit you may not relax. Do not assume extra funding, more time, additional hires, outsourced help, partnerships, or infrastructure the founder did not state. Reason strictly within what the founder actually has.
- If the idea cannot realistically be built, launched, or sustained inside these constraints, SAY SO plainly and name exactly what breaks (e.g. "a hardware MVP cannot be manufactured on a $2,000 budget with a solo non-technical founder in 3 months"). Do not paper over the gap with an optimistic verdict or by quietly assuming more resources.
- Where a constraint is missing or "N/A", state the assumption you are forced to make rather than assuming abundance.`

/**
 * Shared money-formatting rule. Every monetary figure across every agent must
 * carry an explicit currency symbol/code, defaulting to USD when unknown.
 */
export const CURRENCY_RULE = `MONEY FORMATTING
Always write monetary amounts with an explicit currency symbol or ISO code (e.g. $10, ₹50,000, €120/month, £2k, USD 1.2M). NEVER output a bare number for money. Infer the currency from the founder's stated country / target region; if it cannot be determined, default to USD ($) and note that you assumed USD.`

/**
 * Shared plain-English rule. Outputs are read by first-time founders, so every
 * jargon term gets a short inline gloss the first time it appears.
 */
export const PLAIN_ENGLISH_RULE = `PLAIN-ENGLISH RULE (write for a first-time founder)
This report is read by beginners. Whenever a business or financial term of art appears — e.g. TAM, SAM, SOM, CAC, LTV, ARPU, CAGR, burn rate, runway, gross margin, break-even, churn, MRR/ARR, moat — add a short plain-English explanation in the SAME sentence the first time you use it (e.g. "a CAGR (compound annual growth rate — the average growth per year) of 18%", "CAC (customer acquisition cost — what you spend to win one customer) of $40", "runway (how many months the cash lasts) of 8 months"). Keep the rest of the language clear and jargon-light.`
