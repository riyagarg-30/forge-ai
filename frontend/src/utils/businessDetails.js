const INDUSTRIES = [
  'Technology', 'Healthcare', 'Fintech', 'E-commerce', 'Education',
  'Real Estate', 'Food & Beverage', 'Transportation', 'Media', 'SaaS',
]

const BUSINESS_MODELS = ['B2B', 'B2C', 'D2C', 'Marketplace', 'SaaS']
const STAGES = ['Idea', 'MVP', 'Beta', 'Live']
const REGIONS = ['India', 'Global', 'Custom']

export const BUSINESS_FIELDS = [
  { key: 'startupName', label: 'Startup Name', type: 'text', required: true },
  { key: 'industry', label: 'Industry', type: 'select', options: INDUSTRIES, required: true },
  { key: 'country', label: 'Country', type: 'text', required: true },
  { key: 'targetRegion', label: 'Target Region', type: 'select', options: REGIONS, required: true },
  { key: 'businessModel', label: 'Business Model', type: 'select', options: BUSINESS_MODELS, required: true },
  { key: 'targetAudience', label: 'Target Audience', type: 'text', required: true },
  { key: 'startupStage', label: 'Startup Stage', type: 'select', options: STAGES, required: true },
  { key: 'budget', label: 'Budget', type: 'text', placeholder: 'e.g. $100,000', required: true },
  { key: 'teamSize', label: 'Team Size', type: 'text', placeholder: 'e.g. 2-3', required: true },
  { key: 'timeline', label: 'Timeline', type: 'text', placeholder: 'e.g. 6 months', required: true },
  { key: 'existingCompetitors', label: 'Existing Competitors', type: 'text', required: false },
  { key: 'revenueModel', label: 'Revenue Model', type: 'text', placeholder: 'e.g. Subscription, Freemium', required: true },
  { key: 'additionalRequirements', label: 'Additional Requirements', type: 'textarea', required: false },
]

export function extractBusinessDetails(ideaText) {
  const text = ideaText.toLowerCase()
  const details = {}

  // Startup name — quoted or "called/named X"
  const quoted = ideaText.match(/["']([^"']{2,40})["']/)
  const named = ideaText.match(/(?:called|named|brand(?:ed)?)\s+([A-Z][a-zA-Z0-9\s]{1,30})/i)
  if (quoted) details.startupName = quoted[1].trim()
  else if (named) details.startupName = named[1].trim()

  // Industry
  for (const ind of INDUSTRIES) {
    if (text.includes(ind.toLowerCase())) {
      details.industry = ind
      break
    }
  }
  if (/health|medical|clinical|patient/.test(text)) details.industry = 'Healthcare'
  if (/fintech|payment|bank|crypto|lending/.test(text)) details.industry = 'Fintech'
  if (/saas|software|platform|app/.test(text) && !details.industry) details.industry = 'SaaS'

  // Business model
  if (/\bb2b\b/.test(text)) details.businessModel = 'B2B'
  else if (/\bb2c\b/.test(text)) details.businessModel = 'B2C'
  else if (/\bd2c\b/.test(text)) details.businessModel = 'D2C'
  else if (/marketplace/.test(text)) details.businessModel = 'Marketplace'
  else if (/saas|subscription/.test(text)) details.businessModel = 'SaaS'

  // Region
  if (/india|indian|bharat/.test(text)) details.targetRegion = 'India'
  else if (/global|worldwide|international/.test(text)) details.targetRegion = 'Global'

  // Country
  if (/india/.test(text)) details.country = 'India'
  else if (/united states|usa|u\.s\./.test(text)) details.country = 'United States'
  else if (/united kingdom|uk|britain/.test(text)) details.country = 'United Kingdom'

  // Stage
  if (/\blive\b|launched|production/.test(text)) details.startupStage = 'Live'
  else if (/\bbeta\b/.test(text)) details.startupStage = 'Beta'
  else if (/\bmvp\b|prototype/.test(text)) details.startupStage = 'MVP'
  else details.startupStage = 'Idea'

  // Budget
  const budgetMatch = ideaText.match(/\$[\d,]+(?:k|m)?|\d+k\b|\d+\s*(?:thousand|million)/i)
  if (budgetMatch) details.budget = budgetMatch[0]

  // Team size
  const teamMatch = ideaText.match(/(\d+)\s*(?:person|people|member|co-founder|founder|employee)/i)
  if (teamMatch) details.teamSize = teamMatch[1]

  // Timeline
  const timelineMatch = ideaText.match(/(\d+)\s*(?:week|month|year)s?/i)
  if (timelineMatch) details.timeline = timelineMatch[0]

  // Revenue model
  if (/subscription|saas|monthly/.test(text)) details.revenueModel = 'Subscription SaaS'
  else if (/freemium/.test(text)) details.revenueModel = 'Freemium'
  else if (/marketplace|commission/.test(text)) details.revenueModel = 'Transaction / Commission'
  else if (/advertising|ads/.test(text)) details.revenueModel = 'Advertising'

  // Target audience
  const audienceMatch = ideaText.match(/(?:for|targeting|helping)\s+([a-z][a-z\s,]{5,60}?)(?:\.|,|$|\s+(?:with|who|that|in|to))/i)
  if (audienceMatch) details.targetAudience = audienceMatch[1].trim()

  // Competitors
  const vsMatch = ideaText.match(/(?:competitors?|competing with|vs\.?|like)\s+([A-Za-z0-9,\s&]{3,80})/i)
  if (vsMatch) details.existingCompetitors = vsMatch[1].trim()

  return details
}

export function getMissingFields(details) {
  return BUSINESS_FIELDS.filter((f) => f.required && !details[f.key]?.toString().trim())
}

export function getDefaultDetails(extracted = {}) {
  return {
    startupName: '',
    industry: '',
    country: '',
    targetRegion: '',
    businessModel: '',
    targetAudience: '',
    startupStage: '',
    budget: '',
    teamSize: '',
    timeline: '',
    existingCompetitors: '',
    revenueModel: '',
    additionalRequirements: '',
    ...extracted,
  }
}
