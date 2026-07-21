// Generic scoring utilities shared across all agents.
// Must stay free of any agent-specific logic — only numeric/label helpers.

/**
 * Clamps a raw score into the 0-100 range used throughout agent results.
 */
export function normalizeScore(value, min = 0, max = 100) {
  const num = Number(value)
  if (Number.isNaN(num)) return min
  return Math.min(max, Math.max(min, num))
}

/**
 * Maps a 0-100 readiness score to a coarse label used in reports.
 */
export function readinessLevel(score) {
  const normalized = normalizeScore(score)
  if (normalized >= 80) return 'Strong'
  if (normalized >= 60) return 'Promising'
  if (normalized >= 40) return 'Developing'
  return 'Early'
}

/**
 * Classifies a 0-100 risk score into a severity label.
 * Higher score = higher risk.
 */
export function classifyRisk(score) {
  const normalized = normalizeScore(score)
  if (normalized >= 70) return 'High'
  if (normalized >= 40) return 'Medium'
  return 'Low'
}
