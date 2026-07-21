import { z } from 'zod'

export const ReadinessSignal = z.number().min(0).max(100)

export const SourceLink = z.object({
  title: z.string().min(1),
  url: z.string().min(1),
  type: z.string().min(1),
})

export const RiskItem = z.object({
  risk: z.string().min(1),
  severity: z.enum(['Low', 'Medium', 'High']),
  mitigation: z.string().min(1),
})
