/**
 * CEO Context Builder
 * --------------------
 * The CEO Agent is the only agent that reads all five prior reports plus
 * the full debate transcript. Passing every complete JSON object (as
 * `formatPriorResult` does for every other agent) makes the CEO prompt
 * balloon past small-model token limits (e.g. Groq's 12k TPM cap) once the
 * debate transcript alone can carry 8+ full messages with prose content.
 *
 * This module extracts only the fields the CEO prompt's instructions
 * actually ask for (see ceoPrompt.js steps 1-13) from each report, so the
 * CEO still gets a faithful, evidence-grounded basis for its verdict —
 * just without the verbose fields (full competitor bios, full cost
 * breakdowns, full pricing tables, full debate message-by-message
 * transcript, etc.) that the CEO never references.
 *
 * IMPORTANT: `sources` arrays are always passed through in full (they're
 * already small — just {title, url, type}) so the CEO's source citation
 * behavior and `filterToKnownSources` safety net keep working exactly as
 * before. Nothing here touches the database, the frontend, or any other
 * agent's inputs — this is CEO-prompt-input only.
 */

const take = (arr, n) => (Array.isArray(arr) ? arr.slice(0, n) : [])

function condenseResearch(research) {
  if (!research) return null
  return {
    summary: research.summary,
    problemValidation: research.problemValidation,
    targetAudience: research.targetAudience,
    competitiveLandscapeSummary: research.competitiveLandscapeSummary,
    competitorCount: research.competitorCount,
    topKeyFindings: take(research.keyFindings, 4),
    topIndustryTrends: take(research.industryTrends, 3),
    topDemandSignals: take(research.demandSignals, 2),
    topRisks: take(research.risks, 3),
    confidence: research.confidence,
    readinessSignals: research.readinessSignals,
    sources: research.sources || [],
  }
}

function condenseMarket(market) {
  if (!market) return null
  return {
    marketOverview: market.marketOverview,
    tam: market.tam,
    sam: market.sam,
    som: market.som,
    cagr: market.cagr,
    topOpportunities: take(market.opportunities, 3),
    topRisks: take(market.risks, 3),
    topCompetitors: take(market.competitors, 3).map((c) => ({
      name: c.name,
      whyRelevant: c.whyRelevant,
      strengths: take(c.strengths, 2),
      weaknesses: take(c.weaknesses, 2),
    })),
    confidence: market.confidence,
    readinessSignals: market.readinessSignals,
    sources: market.sources || [],
  }
}

function condenseFinance(finance) {
  if (!finance) return null
  return {
    financialFeasibility: finance.financialFeasibility,
    estimatedStartupCost: finance.estimatedStartupCost,
    breakEvenTimeline: finance.breakEvenTimeline,
    revenueModel: finance.revenueModel,
    unitEconomics: finance.unitEconomics,
    fundingRecommendation: finance.fundingRecommendation,
    topFinancialRisks: take(finance.financialRisks, 3),
    confidence: finance.confidence,
    readinessSignals: finance.readinessSignals,
    sources: finance.sources || [],
  }
}

function condenseProduct(product) {
  if (!product) return null
  return {
    productStrategy: product.productStrategy,
    mvpStrategy: product.mvpStrategy,
    topCoreFeatures: take(product.coreFeatures, 5),
    timeline: product.timeline,
    topRisks: take(product.risks, 3),
    confidence: product.confidence,
    readinessSignals: product.readinessSignals,
    sources: product.sources || [],
  }
}

function condenseLegal(legal) {
  if (!legal) return null
  return {
    legalRiskAssessment: legal.legalRiskAssessment,
    ipConsiderations: legal.ipConsiderations,
    topComplianceRequirements: take(legal.complianceRequirements, 3),
    topLegalRisks: take(legal.legalRisks, 3),
    confidence: legal.confidence,
    readinessSignals: legal.readinessSignals,
    sources: legal.sources || [],
  }
}

/**
 * Debate is the largest single contributor to prompt size (full
 * message-by-message transcript). The CEO prompt never references
 * individual messages — only agreements, conflicts, unresolved risks and
 * overall consensus — so the raw `messages` array is intentionally
 * dropped here. The frontend continues to read the full transcript from
 * the debate_transcripts row / debate agent result directly; this
 * condensed view is only ever passed into the CEO prompt.
 */
function condenseDebate(debate) {
  if (!debate) return null
  return {
    consensus: debate.consensus,
    summary: debate.summary,
    agreements: take(debate.agreements, 5),
    keyConflicts: take(debate.keyDisagreements, 4).map((d) => ({
      topic: d.topic,
      resolution: d.resolution,
    })),
    unresolvedRisks: take(debate.openRisks, 4),
    strengthsIdentified: take(debate.strengthsIdentified, 3),
    weaknessesIdentified: take(debate.weaknessesIdentified, 3),
    confidence: debate.confidence,
    sources: debate.sources || [],
  }
}

/**
 * Builds the condensed set of summaries to embed in the CEO prompt.
 * Returns the same shape as `priorResults` (research/market/finance/
 * product/legal/debate) so it can be dropped straight into
 * `buildCeoPrompt` in place of the raw reports.
 */
export function buildCeoContext(priorResults = {}) {
  return {
    research: condenseResearch(priorResults.research),
    market: condenseMarket(priorResults.market),
    finance: condenseFinance(priorResults.finance),
    product: condenseProduct(priorResults.product),
    legal: condenseLegal(priorResults.legal),
    debate: condenseDebate(priorResults.debate),
  }
}