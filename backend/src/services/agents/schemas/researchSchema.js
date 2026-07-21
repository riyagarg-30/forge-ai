import { z } from 'zod'
import { ReadinessSignal } from './common.js'

export const researchSchema = z.object({
  summary: z.string().min(1),
  problemValidation: z.string().min(1),
  keyFindings: z.array(z.string().min(1)).min(3),
  industryTrends: z.array(z.string().min(1)).min(2),
  targetAudience: z.string().min(1),
  competitiveLandscapeSummary: z.string().min(1),
  competitorCount: z.number().int().min(0),
  demandSignals: z.array(z.string().min(1)).min(1),
  risks: z.array(z.string().min(1)).min(1),
  assumptions: z.array(z.string()).default([]),
  confidence: z.number().min(0).max(100),
  // sources is attached by the agent from real search results, not the
  // model's own JSON — deliberately not part of this schema.
  readinessSignals: z.object({
    marketDemand: ReadinessSignal,
    problemValidation: ReadinessSignal,
    timing: ReadinessSignal,
  }),
})
