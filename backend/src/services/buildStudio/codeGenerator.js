import { generateCode } from '../ai/aiProvider.js'
import { CODE_PROJECT_RESPONSE_SCHEMA } from '../ai/providers/geminiProvider.js'
import { codeProjectSchema } from './schemas.js'
import { BASE_DEPENDENCIES, extractImportedPackages, resolveDependencyVersion } from './dependencies.js'
import { buildScaffoldFiles } from './projectScaffold.js'

const GENERATION_MAX_TOKENS = 16000
const MAX_ATTEMPTS = 2

/**
 * Merges the model's { App.jsx, index.css } into a complete, always-runnable
 * Vite React project: a fixed scaffold (package.json, vite.config.js,
 * index.html, index.jsx) plus the model's files, with dependencies
 * auto-resolved from whatever the model actually imported so package.json
 * never omits a package the code relies on.
 *
 * Files stay at the project root (no src/ directory) to match Sandpack's
 * built-in `vite-react` template exactly — see the comment in
 * projectScaffold.js for why that matters.
 */
function assembleProject({ files, entryFile }) {
  const entryContent = files[entryFile] ?? Object.values(files)[0] ?? ''
  const generatedFiles = { 'App.jsx': entryContent }

  for (const [name, content] of Object.entries(files)) {
    if (name === entryFile) continue
    const baseName = name.replace(/^\/+/, '').split('/').pop()
    generatedFiles[baseName] = content
  }

  const combinedSource = Object.values(generatedFiles).join('\n')
  const dependencies = { ...BASE_DEPENDENCIES }
  for (const packageName of extractImportedPackages(combinedSource)) {
    if (packageName in dependencies) continue
    dependencies[packageName] = resolveDependencyVersion(packageName)
  }

  const scaffoldFiles = buildScaffoldFiles(dependencies)

  return {
    files: { ...scaffoldFiles, ...generatedFiles },
    entryFile: 'App.jsx',
    dependencies,
  }
}

function stripCodeFences(raw) {
  const trimmed = raw.trim()
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)
  return (fenced ? fenced[1] : trimmed).trim()
}

const JSON_ESCAPES = { '\b': '\\b', '\f': '\\f', '\n': '\\n', '\r': '\\r', '\t': '\\t' }

/**
 * The JSON spec forbids raw control characters (U+0000-U+001F) inside string
 * literals — they must be escaped (\n, \t, etc). Gemini's JSON mode
 * constrains the overall document shape but has still been observed to emit
 * literal newlines/tabs/carriage-returns inside multi-line file-content
 * strings, which is exactly what throws "Bad control character in string
 * literal" from JSON.parse. This walks the text respecting escape sequences
 * and string boundaries, and escapes any raw control character it finds
 * *inside* a string (structural whitespace between tokens is left alone).
 */
function escapeControlCharsInStrings(text) {
  let out = ''
  let inString = false
  let escaped = false

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i]

    if (inString) {
      if (escaped) {
        out += ch
        escaped = false
        continue
      }
      if (ch === '\\') {
        out += ch
        escaped = true
        continue
      }
      if (ch === '"') {
        inString = false
        out += ch
        continue
      }
      const code = ch.charCodeAt(0)
      if (code <= 0x1f) {
        out += JSON_ESCAPES[ch] || `\\u${code.toString(16).padStart(4, '0')}`
        continue
      }
      out += ch
      continue
    }

    if (ch === '"') inString = true
    out += ch
  }

  return out
}

/** Builds a "line N, col M" pointer plus surrounding text for a JSON.parse SyntaxError. */
function describeJsonError(text, err) {
  const match = /position (\d+)/i.exec(err.message)
  if (!match) return err.message

  const position = Number(match[1])
  const before = text.slice(0, position)
  const line = before.split('\n').length
  const col = position - before.lastIndexOf('\n')
  const contextStart = Math.max(0, position - 40)
  const contextEnd = Math.min(text.length, position + 40)
  const snippet = JSON.stringify(text.slice(contextStart, position) + '<<<HERE>>>' + text.slice(position, contextEnd))

  return `${err.message} (line ${line}, col ${col})\n  near: ${snippet}`
}

function extractJson(raw) {
  const candidate = stripCodeFences(raw)

  if (!candidate) {
    throw new Error('empty response after stripping code fences')
  }
  if (!(candidate.startsWith('{') || candidate.startsWith('['))) {
    throw new Error('response does not start with a JSON object or array')
  }

  try {
    return JSON.parse(candidate)
  } catch (firstErr) {
    // Retry once against a sanitized copy in case the model emitted raw
    // control characters inside a string value instead of escaping them.
    try {
      return JSON.parse(escapeControlCharsInStrings(candidate))
    } catch {
      throw new Error(describeJsonError(candidate, firstErr))
    }
  }
}

/**
 * Sends a template prompt to the configured AI provider and validates the
 * result into a { files, entryFile } project. Provider-agnostic — swapping
 * AI_PROVIDER in aiProvider.js changes nothing here.
 *
 * Retries once on a parse/validation failure — a fresh generation attempt
 * is often enough to recover from an occasional malformed or truncated
 * response, on top of the provider's own truncation-retry handling.
 */
export async function generateProjectFiles({ prompt }) {
  let lastError

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const raw = await generateCode({
      prompt,
      temperature: 0.3,
      maxTokens: GENERATION_MAX_TOKENS,
      responseSchema: CODE_PROJECT_RESPONSE_SCHEMA,
    })

    console.log(`[codeGenerator] Attempt ${attempt}/${MAX_ATTEMPTS}: raw response before parsing:\n${raw}`)

    let parsed
    try {
      parsed = extractJson(raw)
    } catch (err) {
      console.error(
        `[codeGenerator] Attempt ${attempt}/${MAX_ATTEMPTS}: failed to parse AI provider response as JSON: ${err.message}\n` +
          `Raw response:\n${raw}`
      )
      lastError = new Error(`AI provider returned invalid JSON: ${err.message}`)
      continue
    }

    const result = codeProjectSchema.safeParse(parsed)
    if (!result.success) {
      const issues = result.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`).join('; ')
      console.error(
        `[codeGenerator] Attempt ${attempt}/${MAX_ATTEMPTS}: generated project failed validation: ${issues}\nRaw response:\n${raw}`
      )
      lastError = new Error(`Generated project failed validation: ${issues}`)
      continue
    }

    return assembleProject(result.data)
  }

  throw lastError
}
