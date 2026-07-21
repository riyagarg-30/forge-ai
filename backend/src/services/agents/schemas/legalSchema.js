import { z } from 'zod'
import { ReadinessSignal, RiskItem } from './common.js'

export const legalSchema = z.object({
  legalRiskAssessment: z.string().min(1),
  regulatoryConsiderations: z.array(z.string().min(1)).min(2),
  ipConsiderations: z.string().min(1),
  complianceRequirements: z.array(z.string().min(1)).min(2),
  legalRisks: z.array(RiskItem).min(2),
  assumptions: z.array(z.string()).default([]),
  confidence: z.number().min(0).max(100),
  // sources is attached by the agent from real search results, not the
  // model's own JSON — deliberately not part of this schema.

  readinessSignals: z.object({
    regulatoryClarity: ReadinessSignal,
    complianceReadiness: ReadinessSignal,
    ipProtection: ReadinessSignal,
  }),
})
