import { generateWithGemini } from './providers/geminiProvider.js'

// Every provider implements the same signature: ({ prompt, temperature,
// maxTokens }) => Promise<string>. Add new entries (groq, openai, ...) here
// without touching any caller — the AI_PROVIDER env var picks which one
// runs, and callers never talk to a provider module directly.
const PROVIDERS = {
  gemini: generateWithGemini,
}

export async function generateCode({ prompt, temperature, maxTokens, responseSchema }) {
  const providerName = process.env.AI_PROVIDER || 'gemini'
  const provider = PROVIDERS[providerName]

  if (!provider) {
    throw new Error(`Unknown AI provider "${providerName}". Available providers: ${Object.keys(PROVIDERS).join(', ')}`)
  }

  return provider({ prompt, temperature, maxTokens, responseSchema })
}
