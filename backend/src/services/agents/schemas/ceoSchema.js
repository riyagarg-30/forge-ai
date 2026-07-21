import { z } from 'zod'
import { SourceLink } from './common.js'

const Verdict = z.enum(['Build', 'Pivot', 'Delay', 'Reject'])

const PlanItem = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
})

const EvidenceItem = z.object({
  agent: z.enum(['Research', 'Market', 'Finance', 'Product', 'Legal', 'Debate']),
  evidence: z.string().min(1),
})

export const ceoSchema = z.object({
  verdict: Verdict,
  confidence: z.number().min(0).max(100),
  executiveSummary: z.string().min(1),
  keyEvidence: z.array(EvidenceItem).min(5),
  investmentRecommendation: z.string().min(1),
  topRisks: z.array(z.string().min(1)).min(3),
  topOpportunities: z.array(z.string().min(1)).min(3),
  validationStrategy: z.array(z.string().min(1)).min(2),
  nextSteps: z.array(z.string().min(1)).min(3),
  thirtyDayPlan: z.array(PlanItem).min(2),
  sixtyDayPlan: z.array(PlanItem).min(2),
  ninetyDayPlan: z.array(PlanItem).min(2),
  successMetrics: z.array(z.string().min(1)).min(3),
  sources: z.array(SourceLink).default([]),
})
