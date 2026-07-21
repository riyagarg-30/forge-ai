import { z } from 'zod'
import { ReadinessSignal, SourceLink } from './common.js'

export const productSchema = z.object({
  productStrategy: z.string().min(1),
  mvpStrategy: z.string().min(1),
  coreFeatures: z.array(z.string().min(1)).min(3),
  techStack: z.array(z.string().min(1)).min(3),
  timeline: z.string().min(1),
  successMetrics: z.array(z.string().min(1)).min(2),
  risks: z.array(z.string().min(1)).min(1),
  assumptions: z.array(z.string()).default([]),
  confidence: z.number().min(0).max(100),
  sources: z.array(SourceLink).default([]),

  readinessSignals: z.object({
    mvpClarity: ReadinessSignal,
    featureScope: ReadinessSignal,
    technicalFeasibility: ReadinessSignal,
  }),
})
