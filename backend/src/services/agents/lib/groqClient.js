import Groq from 'groq-sdk'

// Single shared Groq client for the whole process — never re-instantiate per
// request (reuses the underlying HTTP keep-alive connection pool).
export const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export const GROQ_MODEL = 'llama-3.3-70b-versatile'

/**
 * Per-tier model selection.
 *
 * - `fast`      : the five parallel worker agents (research, market, finance,
 *                 product, legal).
 * - `reasoning` : the heavy synthesis agents (debate, ceo) — always the
 *                 strongest model available.
 *
 * BOTH default to the current model, so behavior/output is unchanged out of
 * the box. To trade a bit of the workers' depth for a large latency win,
 * set GROQ_FAST_MODEL (e.g. `llama-3.1-8b-instant`) in the environment; the
 * Debate and CEO agents keep using GROQ_REASONING_MODEL (defaults to the
 * strongest model) and are never downgraded.
 */
export const MODELS = {
  fast: process.env.GROQ_FAST_MODEL || GROQ_MODEL,
  reasoning: process.env.GROQ_REASONING_MODEL || GROQ_MODEL,
}
