import { z } from 'zod'
import { ReadinessSignal, RiskItem, SourceLink } from './common.js'

const CostLine = z.object({
  category: z.string().min(1),
  amount: z.string().min(1),
  notes: z.string().min(1),
})

export const financeSchema = z.object({
  financialFeasibility: z.string().min(1),

  // Scalar summary fields — rendered directly by the report UI.
  estimatedStartupCost: z.string().min(1),
  breakEvenTimeline: z.string().min(1),
  revenueModel: z.string().min(1),

  // Structured detail — richer data for the CEO/debate synthesis and future UI.
  costBreakdown: z.array(CostLine).min(3),
  revenueModelDetail: z.object({
    type: z.string().min(1),
    reason: z.string().min(1),
  }),
  pricingRecommendation: z
    .array(
      z.object({
        plan: z.string().min(1),
        price: z.string().min(1),
        features: z.array(z.string().min(1)).min(1),
      })
    )
    .min(1),
  unitEconomics: z.object({
    cac: z.string().min(1),
    ltv: z.string().min(1),
    arpu: z.string().min(1),
    grossMargin: z.string().min(1),
    ltvCacRatio: z.string().min(1),
    monthlyBurn: z.string().min(1),
  }),
  breakEvenDetail: z.object({
    timeline: z.string().min(1),
    monthlyRevenueNeeded: z.string().min(1),
    customersNeeded: z.string().min(1),
    assumptions: z.string().min(1),
  }),
  fundingRecommendation: z.object({
    stage: z.string().min(1),
    amount: z.string().min(1),
    reason: z.string().min(1),
  }),
  financialRisks: z.array(RiskItem).min(1),
  assumptions: z.array(z.string()).default([]),
  confidence: z.number().min(0).max(100),
  sources: z.array(SourceLink).default([]),

  readinessSignals: z.object({
    unitEconomics: ReadinessSignal,
    budgetAlignment: ReadinessSignal,
    revenueModelViability: ReadinessSignal,
  }),
})
