import { z } from 'zod'

/**
 * Small local models occasionally return list items as objects
 * (e.g. { name: "React", reason: "..." }) instead of the plain strings the
 * schema asks for, or a single object instead of a one-item array. Rather
 * than failing validation over a shape mismatch that doesn't lose any real
 * information, this coerces those into plain strings before validating.
 */
function flexibleStringArray(minItems = 1) {
  return z.preprocess((val) => {
    if (val == null) return val
    const arr = Array.isArray(val) ? val : [val]
    return arr.map((item) => {
      if (typeof item === 'string') return item
      if (item && typeof item === 'object') {
        const name = item.name || item.tech || item.technology || item.label || item.title || item.value
        const reason = item.reason || item.description || item.purpose || item.notes
        if (typeof name === 'string') return reason ? `${name} — ${reason}` : name
        return JSON.stringify(item)
      }
      return String(item)
    })
  }, z.array(z.string().min(1)).min(minItems))
}

/**
 * Automatic Software-vs-Physical classification. The CEO Agent's own
 * output plus the Product/Research/Market condensed context is enough
 * signal for this — no user input is ever requested.
 */
export const startupTypeSchema = z.object({
  startupType: z.enum(['software', 'physical']),
  reasoning: z.string().min(1),
})

export const techStackSchema = z.object({
  frontend: flexibleStringArray(2),
  backend: flexibleStringArray(2),
  database: flexibleStringArray(1),
  infrastructure: flexibleStringArray(1),
  thirdPartyServices: flexibleStringArray(0).default([]),
  rationale: z.string().min(1),
})

export const apiStructureSchema = z.object({
  baseUrl: z.string().min(1),
  authStrategy: z.string().min(1),
  endpoints: z
    .array(
      z.object({
        method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']),
        path: z.string().min(1),
        description: z.string().min(1),
        requestBody: z.string().optional(),
        responseShape: z.string().optional(),
      })
    )
    .min(5),
})

export const databaseSchemaSchema = z.object({
  engine: z.string().min(1),
  tables: z
    .array(
      z.object({
        name: z.string().min(1),
        description: z.string().min(1),
        columns: z
          .array(
            z.object({
              name: z.string().min(1),
              type: z.string().min(1),
              notes: z.string().optional(),
            })
          )
          .min(2),
        relationships: flexibleStringArray(0).default([]),
      })
    )
    .min(3),
})

export const developmentRoadmapSchema = z.object({
  phases: z
    .array(
      z.object({
        name: z.string().min(1),
        duration: z.string().min(1),
        goals: flexibleStringArray(2),
        deliverables: flexibleStringArray(2),
      })
    )
    .min(3),
})

export const manufacturingPlanSchema = z.object({
  materials: flexibleStringArray(2),
  productionSteps: flexibleStringArray(3),
  suppliersOrPartners: flexibleStringArray(1),
  estimatedUnitCost: z.string().min(1),
  estimatedTimeline: z.string().min(1),
  qualityControl: flexibleStringArray(1),
  risks: flexibleStringArray(1),
})

/**
 * Content for the deterministic engineering concept sheet that replaced
 * Pollinations image generation. This is the only thing the LLM produces —
 * factual/creative content (dimensions, materials, specs), never layout or
 * pixels. The frontend renders it as HTML/CSS/SVG, so the same output is
 * reproducible and responsive instead of a one-off AI image.
 */
export const conceptSheetSchema = z.object({
  productName: z.string().min(1),
  tagline: z.string().min(1),
  type: z.enum(['hardware', 'software']),
  dimensions: z
    .object({
      length: z.string().min(1),
      width: z.string().min(1),
      height: z.string().min(1),
      unit: z.string().min(1),
    })
    .nullable(),
  materials: flexibleStringArray(0).default([]),
  colorPalette: z
    .array(z.object({ name: z.string().min(1), hex: z.string().min(1) }))
    .min(2),
  components: z
    .array(z.object({ label: z.string().min(1), description: z.string().min(1) }))
    .min(3),
  aiFeatures: z
    .array(z.object({ feature: z.string().min(1), callout: z.string().min(1) }))
    .min(1),
  technicalSpecs: z
    .array(z.object({ label: z.string().min(1), value: z.string().min(1) }))
    .min(3),
  keyFunctions: flexibleStringArray(3),
  hasExplodedView: z.boolean().default(false),
})

/**
 * Shape returned by the code generation provider for a template project:
 * a flat map of filename -> full file contents, plus which one is the
 * entry point. Template prompts currently ask for a single "App.jsx".
 */
export const codeProjectSchema = z.object({
  files: z
    .record(z.string(), z.string().min(1))
    .refine((files) => Object.keys(files).length > 0, 'At least one file is required'),
  entryFile: z.string().min(1),
})