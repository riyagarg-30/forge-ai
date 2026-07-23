import { generateStructured } from '../agents/lib/llmJson.js'
import { buildCeoContext } from '../agents/lib/ceoContextBuilder.js'
import { startupTypeSchema } from './schemas.js'

/**
 * Determines, without ever asking the user, whether a venture is a
 * "software" startup (an app/platform/SaaS whose product IS code) or a
 * "physical" startup (a tangible good that has to be manufactured and
 * shipped). Runs automatically once the CEO Agent returns a "Build"
 * verdict, using only the existing agent outputs already on file.
 *
 * A cheap keyword heuristic is used as a safety net if the LLM call fails
 * or returns something unparseable — Build Studio must never be blocked
 * on this single classification step.
 */
function heuristicClassify({ ideaText, businessDetails, product, research, market }) {
  const haystack = [
    ideaText,
    businessDetails?.industry,
    businessDetails?.businessModel,
    businessDetails?.revenueModel,
    product?.productStrategy,
    product?.mvpStrategy,
    ...(product?.coreFeatures || []),
    ...(product?.techStack || []),
    research?.summary,
    market?.marketOverview,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  const physicalSignals = [
    'manufactur', 'factory', 'material', 'packaging', 'ship', 'warehouse',
    'hardware', 'device', 'gadget', 'wearable', 'physical product', 'inventory',
    'molding', 'injection mold', 'prototype (physical)', 'supply chain', 'retail shelf',
    'apparel', 'textile', 'assembly line', 'raw material', 'sku',
  ]
  const softwareSignals = [
    'app', 'saas', 'platform', 'api', 'software', 'dashboard', 'website',
    'web app', 'mobile app', 'algorithm', 'cloud', 'database', 'subscription software',
    'code', 'ai model', 'machine learning', 'backend', 'frontend',
  ]

  const physicalScore = physicalSignals.reduce((n, kw) => n + (haystack.includes(kw) ? 1 : 0), 0)
  const softwareScore = softwareSignals.reduce((n, kw) => n + (haystack.includes(kw) ? 1 : 0), 0)

  const startupType = physicalScore > softwareScore ? 'physical' : 'software'
  return {
    startupType,
    reasoning:
      'Determined via keyword-based fallback classifier (LLM classification was unavailable): ' +
      `matched ${physicalScore} physical-product signal(s) vs ${softwareScore} software signal(s) ` +
      'across the idea description and prior agent findings.',
  }
}

function buildClassificationPrompt({ startupName, ideaText, businessDetails, ceoContext, ceoResult }) {
  return `You are classifying a startup so the correct "Build Studio" asset pipeline can run.

Decide whether this venture is a SOFTWARE startup (its core deliverable is an app, platform,
website, SaaS product, or other pure-software product) or a PHYSICAL startup (its core
deliverable is a tangible, manufactured good that must be produced and shipped).

If the startup combines both (e.g. a hardware device with a companion app), classify based on
what the core, revenue-generating deliverable actually is — the thing the CEO verdict is about.

STARTUP: ${startupName}
IDEA: ${ideaText}
BUSINESS DETAILS: ${JSON.stringify(businessDetails)}

CEO VERDICT: ${ceoResult?.verdict}
CEO EXECUTIVE SUMMARY: ${ceoResult?.executiveSummary || ''}

CONDENSED PRIOR AGENT FINDINGS:
${JSON.stringify(ceoContext, null, 2)}

Respond with strict JSON only:
{
  "startupType": "software" | "physical",
  "reasoning": "1-2 sentence justification citing specific evidence from the findings above"
}`
}

export async function classifyStartupType({ startupName, ideaText, businessDetails, priorResults, ceoResult }) {
  const ceoContext = buildCeoContext(priorResults)

  try {
    const prompt = buildClassificationPrompt({ startupName, ideaText, businessDetails, ceoContext, ceoResult })
    const result = await generateStructured({
      agentName: 'Build Studio Classifier',
      prompt,
      schema: startupTypeSchema,
      temperature: 0.1,
      maxTokens: 400,
    })
    return result
  } catch (err) {
    console.error('[buildStudio] classification LLM call failed, falling back to heuristic:', err.message)
    return heuristicClassify({
      ideaText,
      businessDetails,
      product: priorResults?.product,
      research: priorResults?.research,
      market: priorResults?.market,
    })
  }
}
