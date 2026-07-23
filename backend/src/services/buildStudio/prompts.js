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

/* --------------------------------- Concept sheet prompt ----------------------------------------- */

/**
 * Replaces Pollinations image generation entirely. The LLM only supplies
 * factual/creative CONTENT (dimensions, materials, components, specs) —
 * never layout, pixels, or drawing instructions. The frontend deterministically
 * renders that content as an HTML/CSS/SVG engineering concept sheet, so the
 * same input always renders the same way instead of a one-off AI image.
 */
export function conceptSheetPrompt(ctx, type) {
  const isHardware = type === 'hardware'
  const desc = ctx.productStrategy || ctx.ideaText
  const featureLine = ctx.coreFeatures.slice(0, 6).join(', ') || 'not specified'

  return `${brandLine(ctx)}

Product strategy: ${desc}
Core features: ${featureLine}
${isHardware ? '' : `Tech stack notes: ${ctx.existingTechStack.join(', ') || 'none provided'}`}

Produce the CONTENT for an engineering concept sheet for this ${isHardware ? 'physical/hardware' : 'software'}
product — a professional industrial-design blueprint / patent-concept-sheet style document. You are
supplying facts and specifications only; a separate renderer draws the actual diagram, so do not
describe layout, colors-as-pixels, or drawing style — just the real content that belongs on the sheet.

${
  isHardware
    ? `Since this is a physical product: infer realistic, plausible physical dimensions (in cm or inches,
whichever fits the product category), the real-world materials it would be made from, and its major
physical components (the parts a labeled diagram would point to — e.g. housing, battery compartment,
sensor array, strap, lid, buttons). If the founder's input doesn't specify these, intelligently infer
them from the product category and core features so they are realistic and internally consistent —
never leave them generic or contradictory.`
    : `Since this is a software product: leave "dimensions" and "materials" out (dimensions null, materials
empty) and instead let "components" describe the product's major modules/screens (e.g. dashboard, auth,
core workflow view, settings) — the things a screen-layout diagram would label.`
}

Also identify: which of the core features are AI-powered (if any) and a one-line callout explaining what
each does; a small, cohesive color palette (name + hex) matching the brand/industry; key technical
specifications (battery life, connectivity, materials/tech-stack, compliance, etc. — whichever are
genuinely relevant to this product); and the 3-5 key functions a user/investor should understand at a
glance. Set "hasExplodedView" to true only if a component/exploded breakdown is genuinely meaningful for
this product (most hardware; rarely software).

CONSTRAINTS
- Every fact must be plausible and consistent with the product description and core features above —
  never generic filler unrelated to this specific product.
- Return ONLY valid JSON, no markdown, no preamble.

EXPECTED JSON SCHEMA
{
  "productName": "${ctx.startupName}",
  "tagline": "",
  "type": "${type}",
  "dimensions": ${isHardware ? '{ "length": "", "width": "", "height": "", "unit": "cm" }' : 'null'},
  "materials": [${isHardware ? '""' : ''}],
  "colorPalette": [{ "name": "", "hex": "#000000" }],
  "components": [{ "label": "", "description": "" }],
  "aiFeatures": [{ "feature": "", "callout": "" }],
  "technicalSpecs": [{ "label": "", "value": "" }],
  "keyFunctions": ["", "", ""],
  "hasExplodedView": ${isHardware}
}`
}