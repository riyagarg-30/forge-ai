import { groq, GROQ_MODEL } from './groqClient.js'
import { profileAsync, profileSync } from './profiler.js'

function extractJson(raw) {
  return profileSync('parse', 'extract-json', () => {
    const trimmed = raw.trim()
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)
    const candidate = fenced ? fenced[1] : trimmed
    return JSON.parse(candidate)
  })
}

async function callGroqJson(prompt, { temperature, maxTokens, model }) {
  return profileAsync('llm', model, async () => {
    const response = await groq.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature,
      max_tokens: maxTokens,
    })

    return response.choices[0].message.content
  })
}

function buildRepairPrompt(originalPrompt, badOutput, issues) {
  return `You previously produced JSON that failed schema validation.

ORIGINAL TASK:
${originalPrompt}

YOUR PREVIOUS OUTPUT:
${badOutput}

VALIDATION ERRORS:
${issues}

Fix the output so it is valid JSON that satisfies the required schema exactly.
Keep every value that was already correct. Only fix the fields flagged above.
Return ONLY the corrected JSON object — no markdown, no explanation.`
}

/**
 * Calls the LLM, parses JSON, and validates against a Zod schema.
 * On failure (bad JSON or schema mismatch), retries exactly once with a
 * repair prompt that includes the validation errors. Throws if the retry
 * also fails — agents must never persist malformed data.
 */
export async function generateStructured({
  agentName,
  prompt,
  schema,
  temperature = 0.35,
  maxTokens = 4000,
  model = GROQ_MODEL,
}) {
  let rawOutput = ''

  try {
    rawOutput = await callGroqJson(prompt, { temperature, maxTokens, model })
    const parsed = extractJson(rawOutput)
    const result = schema.safeParse(parsed)
    if (result.success) return result.data

    const issues = result.error.issues
      .map((i) => `- ${i.path.join('.') || '(root)'}: ${i.message}`)
      .join('\n')

    const repairPrompt = buildRepairPrompt(prompt, rawOutput, issues)
    const repairedRaw = await callGroqJson(repairPrompt, { temperature: 0.1, maxTokens, model })
    const repairedParsed = extractJson(repairedRaw)
    const repairedResult = schema.safeParse(repairedParsed)

    if (repairedResult.success) return repairedResult.data

    throw new Error(
      `${agentName} output failed schema validation after repair attempt: ${repairedResult.error.issues
        .map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`)
        .join('; ')}`
    )
  } catch (err) {
    if (err instanceof SyntaxError) {
      throw new Error(`${agentName} returned invalid JSON and could not be repaired: ${err.message}`)
    }
    throw err
  }
}
