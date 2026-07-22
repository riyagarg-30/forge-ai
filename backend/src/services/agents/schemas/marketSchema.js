import { z } from 'zod'
import { ReadinessSignal } from './common.js'

const ConfidenceLevel = z.enum(['High', 'Medium', 'Low'])

// Existing value/year/source are preserved (the frontend StatCard reads them);
// the remaining fields are additive and optional, so pre-existing consumers
// are unaffected. sourceUrl/sourceTitle are only ever populated in code from
// a verified search result — never by the model.
const SizedMetric = z.object({
  value: z.string().min(1),
  year: z.string().min(1),
  source: z.string().min(1),
  fullName: z.string().optional().default(''),
  definition: z.string().optional().default(''),
  methodology: z.string().optional().default(''),
  assumptions: z.string().optional().default(''),
  reasoning: z.string().optional().default(''),
  confidenceLevel: ConfidenceLevel.optional().default('Low'),
  sourceUrl: z.string().nullable().optional().default(null),
  sourceTitle: z.string().nullable().optional().default(null),
})

// `website`/`linkedin` are nullable+optional: the model is instructed NOT to
// emit them at all (URLs are verified in code), so validation must accept
// their absence. `country`/`positioning` are additive optional fields.
const Competitor = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  country: z.string().optional().default('Unknown'),
  positioning: z.string().optional().default('Unknown'),
  whyRelevant: z.string().min(1),
  strengths: z.array(z.string().min(1)).min(1),
  weaknesses: z.array(z.string().min(1)).min(1),
  website: z.string().nullable().optional().default(null),
  linkedin: z.string().nullable().optional().default(null),
})

export const marketSchema = z.object({
  marketOverview: z.string().min(1),
  industry: z.string().min(1),
  problemSolved: z.string().min(1),
  targetCustomers: z.array(z.string().min(1)).min(1),
  tam: SizedMetric,
  sam: SizedMetric,
  som: SizedMetric,
  cagr: z.string().min(1),
  marketDrivers: z.array(z.string().min(1)).min(1),
  marketTrends: z.array(z.string().min(1)).min(1),
  opportunities: z.array(z.string().min(1)).min(1),
  risks: z.array(z.string().min(1)).min(1),
  competitors: z.array(Competitor).min(1),
  assumptions: z.array(z.string()).default([]),
  confidence: z.number().min(0).max(100),
  // sources is attached by the agent from real search results, not the
  // model's own JSON — deliberately not part of this schema.
  readinessSignals: z.object({
    marketSize: ReadinessSignal,
    growthPotential: ReadinessSignal,
    competitivePosition: ReadinessSignal,
  }),
})
