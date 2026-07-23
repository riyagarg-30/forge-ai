/**
 * Pulls the fields Build Studio's generators actually need out of the
 * session + prior agent results, so every prompt builder below works off
 * one small, consistent object instead of re-reaching into raw reports.
 */
export function buildAssetContext({ session, priorResults, ceoResult }) {
  const businessDetails = session.business_details || {}
  return {
    startupName: session.startup_name || businessDetails.startupName || 'Your Startup',
    ideaText: session.idea_text,
    industry: businessDetails.industry || '',
    targetAudience: businessDetails.targetAudience || '',
    businessModel: businessDetails.businessModel || '',
    productStrategy: priorResults?.product?.productStrategy || '',
    mvpStrategy: priorResults?.product?.mvpStrategy || '',
    coreFeatures: priorResults?.product?.coreFeatures || [],
    existingTechStack: priorResults?.product?.techStack || [],
    executiveSummary: ceoResult?.executiveSummary || '',
    investmentRecommendation: ceoResult?.investmentRecommendation || '',
  }
}

const brandLine = (ctx) =>
  `Startup: "${ctx.startupName}". Idea: ${ctx.ideaText}. Industry: ${ctx.industry || 'unspecified'}. ` +
  `Target audience: ${ctx.targetAudience || 'unspecified'}.`

/* ---------------------------------- Software: content prompts --------------------------------- */

export function techStackPrompt(ctx) {
  return `${brandLine(ctx)}

Product strategy: ${ctx.productStrategy}
MVP strategy: ${ctx.mvpStrategy}
Core features: ${ctx.coreFeatures.join(', ')}
Product agent's high-level tech stack notes: ${ctx.existingTechStack.join(', ') || 'none provided'}

Design a concrete, production-grade tech stack for this software startup's MVP. Be specific
(name actual frameworks/services, not generic categories).

Every list field (frontend, backend, database, infrastructure, thirdPartyServices) MUST be a
flat JSON array of plain strings — NOT objects, NOT nested fields. Example of the exact shape
required:
{
  "frontend": ["React", "Tailwind CSS", "Vite"],
  "backend": ["Node.js", "Express"],
  "database": ["PostgreSQL"],
  "infrastructure": ["AWS", "Docker"],
  "thirdPartyServices": ["Stripe", "SendGrid"],
  "rationale": "one paragraph explaining the key choices"
}

Return strict JSON only, matching that shape exactly.`
}

export function apiStructurePrompt(ctx) {
  return `${brandLine(ctx)}

Core features: ${ctx.coreFeatures.join(', ')}

Design a REST API structure for this product's MVP backend: a base URL convention, an auth
strategy, and at least 6 realistic endpoints covering its core features (auth, the primary
domain objects, and any core-feature-specific actions). Return strict JSON only matching the
required schema.`
}

export function databaseSchemaPrompt(ctx) {
  return `${brandLine(ctx)}

Core features: ${ctx.coreFeatures.join(', ')}

Design a relational database schema for this product's MVP: at least 4 tables covering users,
the core domain entities, and any join/relationship tables needed for its core features. Return
strict JSON only matching the required schema.`
}

export function developmentRoadmapPrompt(ctx) {
  return `${brandLine(ctx)}

MVP strategy: ${ctx.mvpStrategy}
Core features: ${ctx.coreFeatures.join(', ')}
CEO recommendation: ${ctx.investmentRecommendation}

Design a technical development roadmap (distinct from the business 30/60/90 plan) with at least
4 phases from initial setup through MVP launch, each with a duration, goals, and concrete
engineering deliverables. Return strict JSON only matching the required schema.`
}

/* ---------------------------------- Physical: content prompt ---------------------------------- */

export function manufacturingPlanPrompt(ctx) {
  return `${brandLine(ctx)}

Product strategy: ${ctx.productStrategy}
Core features / product attributes: ${ctx.coreFeatures.join(', ')}

Design a realistic manufacturing plan for producing this physical product at small-batch scale
suitable for an initial production run: materials, production steps, supplier/partner types,
an estimated per-unit cost range, an estimated timeline, quality control checks, and key risks.
Return strict JSON only matching the required schema.`
}

/* -------------------------------------- Image prompts ------------------------------------------ */

const IMAGE_STYLE_SUFFIX =
  'Clean, modern, professional style. High production value. No text artifacts or watermarks. ' +
  'No real brand logos or copyrighted characters.'

export function softwareImagePrompts(ctx) {
  const featureLine = ctx.coreFeatures.slice(0, 4).join(', ')
  return {
    ui_mockups: `A single UI mockup screen for a software product called "${ctx.startupName}", showing its ` +
      `primary in-app feature (${featureLine || 'its core workflow'}). Modern SaaS web app interface, ` +
      `sidebar navigation, clean typography, a cohesive color palette. ${IMAGE_STYLE_SUFFIX}`,
    landing_page: `A marketing landing page design for a software product called "${ctx.startupName}" targeting ` +
      `${ctx.targetAudience || 'its target users'}. Hero section with a headline and call-to-action button, ` +
      `feature highlights below. Modern web design, realistic browser framing. ${IMAGE_STYLE_SUFFIX}`,
    dashboard: `An analytics dashboard UI for a software product called "${ctx.startupName}", with charts, ` +
      `KPI cards, and a data table. Dark or light modern SaaS dashboard aesthetic. ${IMAGE_STYLE_SUFFIX}`,
    mobile_screens: `Three mobile app screens shown side by side inside phone frames, for a mobile app called ` +
      `"${ctx.startupName}" (${featureLine || 'its core feature'}). Modern mobile UI design. ${IMAGE_STYLE_SUFFIX}`,
  }
}

export function physicalImagePrompts(ctx) {
  const desc = ctx.productStrategy || ctx.ideaText
  return {
    product_concept: `A polished product concept render of a physical product for a startup called ` +
      `"${ctx.startupName}": ${desc}. Studio lighting, neutral background, photorealistic industrial design ` +
      `render. ${IMAGE_STYLE_SUFFIX}`,
    product_views: [
      `Front view of a physical product concept for "${ctx.startupName}": ${desc}. Studio product photography, ` +
        `neutral background. ${IMAGE_STYLE_SUFFIX}`,
      `Side view of the same physical product concept for "${ctx.startupName}": ${desc}. Studio product ` +
        `photography, neutral background, consistent design with the front view. ${IMAGE_STYLE_SUFFIX}`,
      `Back/rear view of the same physical product concept for "${ctx.startupName}": ${desc}. Studio product ` +
        `photography, neutral background, consistent design. ${IMAGE_STYLE_SUFFIX}`,
    ],
    internal_components: `An exploded-view or cutaway technical illustration showing the internal components ` +
      `and assembly of a physical product for "${ctx.startupName}": ${desc}. Technical/engineering diagram style, ` +
      `labeled parts, clean background. ${IMAGE_STYLE_SUFFIX}`,
    packaging_design: `Retail packaging design concept for a physical product called "${ctx.startupName}": ${desc}. ` +
      `Box or container design with modern branding layout, shown at an angle on a neutral background. ` +
      `${IMAGE_STYLE_SUFFIX}`,
  }
}