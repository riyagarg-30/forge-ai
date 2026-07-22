/**
 * Lightweight per-pipeline profiler.
 * ----------------------------------
 * One profiler is created per pipeline run and carried through the whole
 * async call tree via AsyncLocalStorage, so leaf operations (DB calls, web
 * searches, LLM requests, JSON parsing) can record their own timings without
 * every function having to accept a `profiler` argument. If no profiler is on
 * the async context (e.g. a unit call outside a pipeline), every helper here
 * is a transparent no-op that just runs the wrapped function.
 *
 * Timings for concurrent work overlap in wall-clock, so the printed summary
 * reports BOTH the aggregated time-in-category (useful to see where work goes)
 * and the true wall-clock total for the pipeline.
 */
import { AsyncLocalStorage } from 'node:async_hooks'
import { performance } from 'node:perf_hooks'

const storage = new AsyncLocalStorage()

export function createProfiler(label = 'pipeline') {
  return { label, startedAt: performance.now(), entries: [] }
}

export function runWithProfiler(profiler, fn) {
  return storage.run(profiler, fn)
}

export function getProfiler() {
  return storage.getStore() || null
}

function record(category, name, ms, meta) {
  const p = getProfiler()
  if (p) p.entries.push({ category, name, ms: Math.round(ms * 100) / 100, meta })
}

/** Times an async operation, records it under (category, name), returns its result. */
export async function profileAsync(category, name, fn, meta) {
  const p = getProfiler()
  if (!p) return fn()
  const t0 = performance.now()
  try {
    return await fn()
  } finally {
    record(category, name, performance.now() - t0, meta)
  }
}

/** Times a synchronous operation (e.g. JSON parsing). */
export function profileSync(category, name, fn, meta) {
  const p = getProfiler()
  if (!p) return fn()
  const t0 = performance.now()
  try {
    return fn()
  } finally {
    record(category, name, performance.now() - t0, meta)
  }
}

const fmt = (ms) => `${(ms / 1000).toFixed(2)}s`

/**
 * Builds the human-readable execution summary printed after the pipeline
 * completes. Groups entries by category, then lists the per-agent breakdown.
 */
export function summarize(profiler) {
  const wall = performance.now() - profiler.startedAt
  const byCategory = {}
  const byAgent = {}

  for (const e of profiler.entries) {
    const c = (byCategory[e.category] ||= { count: 0, total: 0 })
    c.count += 1
    c.total += e.ms
    if (e.category === 'agent') {
      byAgent[e.name] = (byAgent[e.name] || 0) + e.ms
    }
  }

  const lines = []
  lines.push('')
  lines.push('══════════════════════════════════════════════════')
  lines.push(`  PIPELINE EXECUTION SUMMARY — ${profiler.label}`)
  lines.push('══════════════════════════════════════════════════')
  lines.push('  Category           Calls    Aggregate (overlaps)')
  lines.push('  ────────────────────────────────────────────────')

  const order = ['orchestration', 'db', 'search', 'llm', 'parse', 'agent']
  const categories = Object.keys(byCategory).sort(
    (a, b) => (order.indexOf(a) + 1 || 99) - (order.indexOf(b) + 1 || 99)
  )
  for (const cat of categories) {
    const { count, total } = byCategory[cat]
    lines.push(`  ${cat.padEnd(18)} ${String(count).padStart(4)}    ${fmt(total).padStart(10)}`)
  }

  if (Object.keys(byAgent).length) {
    lines.push('  ────────────────────────────────────────────────')
    lines.push('  Per-agent wall time (search + LLM + parse + DB):')
    for (const [agent, ms] of Object.entries(byAgent)) {
      lines.push(`    • ${agent.padEnd(12)} ${fmt(ms).padStart(10)}`)
    }
  }

  lines.push('  ────────────────────────────────────────────────')
  lines.push(`  TOTAL WALL-CLOCK TIME: ${fmt(wall)}`)
  lines.push('══════════════════════════════════════════════════')
  lines.push('')
  return lines.join('\n')
}
