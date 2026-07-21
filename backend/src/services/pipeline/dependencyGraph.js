/**
 * Which agents must complete (or at least be attempted) before each agent
 * runs. Agents with no listed dependency run as soon as the pipeline starts.
 * finance/product depend on market+research so they reason over real
 * findings instead of "not yet available" placeholders.
 */
export const AGENT_DEPENDENCIES = {
  research: [],
  market: [],
  legal: [],
  finance: ['market', 'research'],
  product: ['market', 'research'],
  debate: ['research', 'market', 'finance', 'product', 'legal'],
  ceo: ['debate'],
}

/**
 * Resolves the dependency graph into sequential stages. Every agent in a
 * stage has all its dependencies satisfied by earlier stages, so agents
 * within a stage can run concurrently.
 */
export function getExecutionStages() {
  const keys = Object.keys(AGENT_DEPENDENCIES)
  const resolved = new Set()
  const stages = []

  while (resolved.size < keys.length) {
    const stage = keys.filter(
      (key) => !resolved.has(key) && AGENT_DEPENDENCIES[key].every((dep) => resolved.has(dep))
    )

    if (stage.length === 0) {
      throw new Error('Circular dependency detected in agent dependency graph.')
    }

    stages.push(stage)
    stage.forEach((key) => resolved.add(key))
  }

  return stages
}
