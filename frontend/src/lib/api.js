import { supabase } from './supabaseClient'

// In dev, requests always go out as same-origin '/api/...' paths and are
// forwarded to the backend by the Vite proxy configured in vite.config.js.
// This means the browser never needs to know the backend's port directly,
// so there is no absolute URL baked into the client bundle that can go
// stale relative to a running dev server. VITE_API_URL is only consulted in
// production builds (no dev server / no proxy), where the frontend and
// backend are genuinely different origins and an absolute URL is required.
const API_URL = import.meta.env.DEV ? '' : import.meta.env.VITE_API_URL || ''

async function request(path, options = {}) {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }

  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`
  }

  const url = `${API_URL}${path}`
  let response

  try {
    response = await fetch(url, {
      ...options,
      headers,
    })
  } catch (err) {
    // fetch() throws a bare "Failed to fetch" TypeError for any network-level
    // failure (backend down, proxy target unreachable, DNS, etc.) with no
    // indication of what was actually being requested. Surface the target
    // URL and the underlying reason so the real problem is visible instead.
    throw new Error(`Could not reach the backend at "${url}". Is it running? (${err.message})`)
  }

  const contentType = response.headers.get('content-type') || ''
  const body = contentType.includes('application/json')
    ? await response.json()
    : await response.text().catch(() => null)

  if (!response.ok) {
    const message = (body && typeof body === 'object' && body.message) || (typeof body === 'string' && body) || `Request failed with status ${response.status}`
    throw new Error(message)
  }

  return body
}

export const api = {
  getMe: () => request('/api/user/me'),
  updateProfile: (payload) =>
    request('/api/user/me', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  // Analysis — the backend orchestrator runs the entire pipeline server-side.
  // The frontend only starts an analysis and polls for progress/results.
  analyze: (ideaText, businessDetails) =>
    request('/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ ideaText, businessDetails }),
    }),

  getReport: (sessionId) => request(`/api/report/${sessionId}`),

  // Session management
  listSessions: () => request('/api/analysis/sessions'),
  getSession: (sessionId) => request(`/api/analysis/sessions/${sessionId}`),

  // Build Studio — unlocks automatically once the CEO Agent returns "Build".
  // The frontend never chooses software-vs-physical; it just renders
  // whatever the backend already classified and generated.
  getBuildStudio: (sessionId) => request(`/api/analysis/sessions/${sessionId}/build-studio`),
  generateBuildStudio: (sessionId) =>
    request(`/api/analysis/sessions/${sessionId}/build-studio/generate`, { method: 'POST' }),

  // Build Studio — template gallery code generation. Converts a submitted
  // template form into a generated React/Tailwind project via the backend's
  // AI provider (Ollama by default).
  generateTemplateProject: (sessionId, templateKey, formValues) =>
    request(`/api/analysis/sessions/${sessionId}/build-studio/generate-template`, {
      method: 'POST',
      body: JSON.stringify({ templateKey, formValues }),
    }),
}
