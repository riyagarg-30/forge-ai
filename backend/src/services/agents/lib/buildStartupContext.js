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
  return `${label}:\n${JSON.stringify(result, null, 2)}`
}

/**
 * Shared instruction for agents that don't search the web themselves but
 * receive upstream reports that already carry real, typed sources (each
 * has a "sources": [{ title, url, type }] array). These agents may only
 * cite from what's already visible above — never invent a new URL.
 */
export const SOURCE_CITATION_RULE = `SOURCE CITATION RULE
You do not have web search access. Every report embedded above that has a "sources" array contains real, verified citations. When a claim you make is materially supported by one of those sources, copy its "title", "url", and "type" EXACTLY as given into your own "sources" array. Do not alter URLs, do not invent new sources, and do not fabricate a source for a claim that has none available above. If none of the available sources are directly relevant to your analysis, return an empty "sources" array rather than guessing.`
