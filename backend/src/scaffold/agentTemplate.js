// Starting point for future AI agents. Copy this file into
// src/services/agents/<name>Agent.js, rename `runTemplateAgent`, and fill in
// the placeholders. Not wired into AGENT_RUNNERS — template only.

import { parseContext } from '../services/agents/context.js'
import { getIndustry, getTargetRegion, getBusinessModel } from './contextHelpers.js'
import { createAgentResponse } from './responseTemplate.js'
import { normalizeScore, readinessLevel, classifyRisk } from './scoring.js'

export async function runTemplateAgent(context) {
  const { ideaText, businessDetails, startupName, priorResults } = parseContext(context)

  const industry = getIndustry(businessDetails)
  const targetRegion = getTargetRegion(businessDetails)
  const businessModel = getBusinessModel(businessDetails)

  // TODO: replace with a real LLM call (e.g. src/agents/llmClient.js) once
  // available. `ideaText`, `businessDetails`, `startupName`, and
  // `priorResults` (other agents' completed results) are the inputs a real
  // model call would use as prompt context.

  const summary = '' // TODO: one-paragraph overview of this agent's analysis

  const analysis = {} // TODO: agent-specific structured analysis object

  const findings = [] // TODO: array of key findings (strings or objects)

  const recommendations = [] // TODO: array of actionable recommendations

  const risks = [] // TODO: array of { risk, severity, mitigation } objects

  const readinessSignals = {} // TODO: named 0-100 scores, e.g. { marketDemand: normalizeScore(0) }

  return createAgentResponse({
    summary,
    analysis,
    findings,
    recommendations,
    risks,
    readinessSignals,
  })

  // Scoring helpers available for readinessSignals / risk labeling:
  // normalizeScore(rawValue), readinessLevel(score), classifyRisk(score)
}
