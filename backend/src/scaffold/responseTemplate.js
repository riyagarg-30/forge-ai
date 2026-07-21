// Consistent response shape helper for future agents. Existing agents keep
// returning their own hand-shaped objects — this is opt-in for new/migrated
// agents so every result shares a predictable base structure.

/**
 * Builds a consistent base agent response, merging in agent-specific fields.
 * `extraFields` wins on key collisions, so agents can add or override fields
 * (e.g. researchAgent's `competitorCount`) without changing this shape.
 */
export function createAgentResponse({
  summary = '',
  analysis = {},
  findings = [],
  recommendations = [],
  risks = [],
  readinessSignals = {},
} = {}, extraFields = {}) {
  return {
    summary,
    analysis,
    findings,
    recommendations,
    risks,
    readinessSignals,
    ...extraFields,
  }
}
