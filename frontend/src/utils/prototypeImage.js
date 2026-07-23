import { HARDWARE_CATEGORIES, detectHardwareCategory, mergeHardwareParts } from './hardwareCategories'

// Concrete, unambiguous physical-product tells. Deliberately excludes generic
// words like "app"/"software" on their own — almost every modern hardware
// product description mentions a companion app, so that alone must never
// outweigh real hardware signals (this was the root cause of hybrid ideas
// like a "hardware-software" rescue backpack misclassifying as software).
const HARDWARE_SIGNALS = [
  'manufactur', 'factory', 'packaging', 'ship', 'warehouse',
  'hardware', 'device', 'gadget', 'wearable', 'physical product', 'inventory',
  'molding', 'injection mold', 'supply chain', 'retail shelf', 'apparel',
  'textile', 'assembly line', 'raw material', 'circuit', 'sensor', 'enclosure',
  'firmware', 'embedded', 'arduino', 'esp32', 'raspberry pi', 'pcb',
  'cad', '3d printing', 'industrial design', 'chassis', 'battery compartment',
  'solar panel', 'outdoor gear', 'iot device',
]
// Only genuinely pure-software tells — no ambiguous words that regularly
// co-occur with hardware ideas (a companion "app" doesn't make a physical
// product a software product).
const SOFTWARE_SIGNALS = [
  'saas', 'web platform', 'web app', 'website', 'dashboard software',
  'algorithm', 'cloud platform', 'database', 'subscription software',
  'ai model', 'machine learning model', 'backend service', 'frontend framework',
]

const HYBRID_HARDWARE_SOFTWARE = /hardware[\s/-]*(and|\+|\/)?\s*software|software[\s/-]*(and|\+|\/)?\s*hardware/

/**
 * Cheap keyword heuristic — mirrors the backend Build Studio classifier's
 * signal lists, but runs client-side since this feature doesn't need an
 * LLM call to pick between the two schematic layouts. Explicitly hybrid
 * ideas ("hardware-software product") always resolve to hardware, since
 * the point of this classification is whether a physical blueprint is
 * warranted — a hybrid product's physical side needs one regardless of
 * how much software/app language also appears in the description.
 */
export function classifyIdeaType({ ideaText, businessDetails, product, startupName }) {
  const haystack = [
    startupName,
    ideaText,
    businessDetails?.industry,
    businessDetails?.businessModel,
    product?.productStrategy,
    product?.mvpStrategy,
    ...(product?.coreFeatures || []),
    ...(product?.techStack || []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  if (HYBRID_HARDWARE_SOFTWARE.test(haystack)) return 'hardware'

  const hardwareScore = HARDWARE_SIGNALS.reduce((n, kw) => n + (haystack.includes(kw) ? 1 : 0), 0)
  const softwareScore = SOFTWARE_SIGNALS.reduce((n, kw) => n + (haystack.includes(kw) ? 1 : 0), 0)

  return hardwareScore > softwareScore ? 'hardware' : 'software'
}

/**
 * Builds a small, purely-derived layout spec from data already loaded on
 * the report page (Product Agent output, business details) — no LLM call,
 * no image API. Used to render a deterministic engineering-style preview
 * instead of an AI-generated picture. For hardware ideas this also detects
 * the closest product category (backpack, bottle, helmet, wearable, drone,
 * or a generic device) so the blueprint actually resembles the product
 * type instead of one generic shape for every hardware idea.
 */
export function buildPrototypeSketch({ startupName, ideaText, product, ideaType }) {
  const coreFeatures = product?.coreFeatures || []
  const base = {
    productName: startupName || 'Your Startup',
    ideaType,
    components: coreFeatures.slice(0, 6),
    techStack: (product?.techStack || []).slice(0, 6),
    summary: product?.productStrategy || '',
  }

  if (ideaType !== 'hardware') return base

  const category = detectHardwareCategory({ ideaText, productStrategy: product?.productStrategy, coreFeatures })
  const categoryData = HARDWARE_CATEGORIES[category]

  return {
    ...base,
    category,
    components: mergeHardwareParts(coreFeatures, categoryData.defaultParts),
    materials: categoryData.materials,
    dimensions: categoryData.dimensions,
    weight: categoryData.weight,
    batteryLife: categoryData.batteryLife,
    wearable: categoryData.wearable,
  }
}
