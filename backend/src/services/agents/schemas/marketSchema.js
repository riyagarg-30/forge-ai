import { z } from 'zod'
import { ReadinessSignal } from './common.js'

const SizedMetric = z.object({
  value: z.string().min(1),
  year: z.string().min(1),
  source: z.string().min(1),
})

const Competitor = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  website: z.string().min(1),
  whyRelevant: z.string().min(1),
  strengths: z.array(z.string().min(1)).min(1),
  weaknesses: z.array(z.string().min(1)).min(1),
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
