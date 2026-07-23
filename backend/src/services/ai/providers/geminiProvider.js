import { GoogleGenAI, Type } from '@google/genai'

// Structured-output schema for codeGenerator.js's two-file template shape
// ({ files: { "App.jsx": ..., "index.css": ... }, entryFile }). Passing this
// as responseSchema makes the SDK use grammar-constrained decoding instead
// of free-form text generation, so multi-line file content is emitted as a
// properly escaped JSON string (no raw newlines/tabs/quotes inside the
// string) rather than relying on prompt wording to ask nicely for that.
export const CODE_PROJECT_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    files: {
      type: Type.OBJECT,
      properties: {
        'App.jsx': { type: Type.STRING },
        'index.css': { type: Type.STRING },
      },
      required: ['App.jsx', 'index.css'],
    },
    entryFile: { type: Type.STRING, enum: ['App.jsx'] },
  },
  required: ['files', 'entryFile'],
}

// Models to try, in order. The configured GEMINI_MODEL (or this default) is
// tried first; if it 404s (retired/unavailable), we fall back to the next
// entry instead of failing the whole request.
const GEMINI_MODEL_FALLBACKS = [
  process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  'gemini-flash-latest',
  'gemini-2.0-flash',
  'gemini-2.5-pro',
].filter((model, index, all) => all.indexOf(model) === index)

const GEMINI_TIMEOUT_MS = Number(process.env.GEMINI_TIMEOUT_MS) || 60 * 1000
const GEMINI_MAX_ATTEMPTS = 2
const GEMINI_MAX_OUTPUT_TOKENS_CAP = 32000

// Prepended as a systemInstruction on every call so the model never wraps
// its JSON in prose or markdown fences, regardless of what the per-call
// prompt asks for.
const JSON_ONLY_SYSTEM_INSTRUCTION =
  'You must respond with strictly valid, complete JSON only. Do not include markdown code ' +
  'fences (```), explanations, or any text outside the JSON object. Never truncate a string, ' +
  'array, or object — every value must be fully written out and every brace/bracket closed.'

let client = null

function getClient() {
  if (client) return client

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set. Add it to backend/.env to use the gemini provider.')
  }

  client = new GoogleGenAI({ apiKey })
  return client
}

function isRateLimited(error) {
  const status = error?.status || error?.response?.status
  return status === 429
}

function isModelUnavailable(error) {
  const status = error?.status || error?.response?.status
  return status === 404 || /NOT_FOUND/i.test(error?.message || '')
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Calls the Gemini Flash API. responseMimeType: 'application/json' constrains
 * the model to emit valid JSON, which the caller (codeGenerator.js) then
 * parses against a schema. Streaming stays disabled — callers need the full
 * JSON body, not partial chunks.
 */
export async function generateWithGemini({ prompt, temperature = 0.3, maxTokens = 4000, responseSchema }) {
  const ai = getClient()

  // Truncated JSON (finishReason === 'MAX_TOKENS') escalates the token
  // budget and retries rather than burning a normal retry attempt on an
  // unchanged request that would just truncate again.
  let currentMaxTokens = maxTokens

  let lastError
  for (let modelIndex = 0; modelIndex < GEMINI_MODEL_FALLBACKS.length; modelIndex++) {
    const model = GEMINI_MODEL_FALLBACKS[modelIndex]

    for (let attempt = 1; attempt <= GEMINI_MAX_ATTEMPTS; attempt++) {
      const startedAt = Date.now()
      console.log(
        `[gemini] Sending request (model: ${model}, attempt ${attempt}/${GEMINI_MAX_ATTEMPTS}, maxOutputTokens: ${currentMaxTokens})`
      )

      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            temperature,
            maxOutputTokens: currentMaxTokens,
            responseMimeType: 'application/json',
            ...(responseSchema ? { responseSchema } : {}),
            systemInstruction: JSON_ONLY_SYSTEM_INSTRUCTION,
          },
          // AbortSignal enforces the request timeout; Gemini's SDK has no
          // native per-call timeout option.
          httpOptions: { signal: AbortSignal.timeout(GEMINI_TIMEOUT_MS) },
        })

        const text = response.text
        const elapsedMs = Date.now() - startedAt
        const finishReason = response.candidates?.[0]?.finishReason

        if (!text) {
          throw new Error('Gemini returned an empty response.')
        }

        if (finishReason === 'MAX_TOKENS') {
          console.warn(
            `[gemini] Response from model "${model}" was truncated (finishReason: MAX_TOKENS, ` +
              `maxOutputTokens: ${currentMaxTokens}, ${text.length} chars received). Raw response:\n${text}`
          )

          const hasBudget = currentMaxTokens < GEMINI_MAX_OUTPUT_TOKENS_CAP
          const isLastAttempt = attempt === GEMINI_MAX_ATTEMPTS && modelIndex === GEMINI_MODEL_FALLBACKS.length - 1
          if (hasBudget && !isLastAttempt) {
            currentMaxTokens = Math.min(currentMaxTokens * 2, GEMINI_MAX_OUTPUT_TOKENS_CAP)
            console.warn(`[gemini] Retrying with maxOutputTokens raised to ${currentMaxTokens}`)
            continue
          }

          throw new Error(
            `Gemini response was truncated at ${currentMaxTokens} output tokens (finishReason: MAX_TOKENS). ` +
              'The JSON output is incomplete.'
          )
        }

        console.log(`[gemini] Response received from model "${model}" in ${elapsedMs}ms (${text.length} chars)`)
        return text
      } catch (error) {
        const elapsedMs = Date.now() - startedAt
        lastError = error

        const rateLimited = isRateLimited(error)
        const timedOut = error?.name === 'TimeoutError' || error?.name === 'AbortError'
        const modelUnavailable = isModelUnavailable(error)

        console.error(
          `[gemini] Request to model "${model}" failed after ${elapsedMs}ms (attempt ${attempt}/${GEMINI_MAX_ATTEMPTS}): ${error.message}`
        )

        // Model is retired/unavailable — no point retrying it; move straight
        // to the next fallback model instead of burning attempts.
        if (modelUnavailable) {
          const hasNextModel = modelIndex < GEMINI_MODEL_FALLBACKS.length - 1
          if (hasNextModel) {
            console.warn(`[gemini] Model "${model}" is unavailable, falling back to "${GEMINI_MODEL_FALLBACKS[modelIndex + 1]}"`)
            break
          }
          throw new Error(`Gemini API request failed: no configured model is available (${error.message})`)
        }

        const isLastAttempt = attempt === GEMINI_MAX_ATTEMPTS
        if (isLastAttempt) {
          if (rateLimited) {
            throw new Error('Gemini API rate limit exceeded. Please try again shortly.')
          }
          if (timedOut) {
            throw new Error(`Gemini API request timed out after ${GEMINI_TIMEOUT_MS}ms.`)
          }
          throw new Error(`Gemini API request failed: ${error.message}`)
        }

        // Brief backoff before retrying, longer if we were rate-limited.
        await sleep(rateLimited ? 2000 : 500)
      }
    }
  }

  throw lastError
}
