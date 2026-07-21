// Reusable extraction helpers for the `businessDetails` object carried on
// every agent context (see src/services/agents/context.js -> parseContext).
// Generic across all agents — no agent-specific logic belongs here.

export function getIndustry(businessDetails = {}) {
  return businessDetails.industry || 'Technology'
}

export function getTargetRegion(businessDetails = {}) {
  return businessDetails.targetRegion || 'Global'
}

export function getBusinessModel(businessDetails = {}) {
  return businessDetails.businessModel || 'SaaS'
}

export function getRevenueModel(businessDetails = {}) {
  return businessDetails.revenueModel || 'Subscription'
}

export function getStartupStage(businessDetails = {}) {
  return businessDetails.startupStage || 'Idea'
}

export function getTargetAudience(businessDetails = {}) {
  return businessDetails.targetAudience || 'Early-adopter professionals'
}

export function getCountry(businessDetails = {}) {
  return businessDetails.country || 'United States'
}

export function getBudget(businessDetails = {}) {
  return businessDetails.budget || 'TBD'
}

export function getTeamSize(businessDetails = {}) {
  return businessDetails.teamSize || '1'
}

export function getTimeline(businessDetails = {}) {
  return businessDetails.timeline || '6 months'
}
