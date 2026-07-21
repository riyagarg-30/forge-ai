import { supabase } from './supabaseClient'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

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

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  })

  const contentType = response.headers.get('content-type') || ''
  const body = contentType.includes('application/json') ? await response.json() : null

  if (!response.ok) {
    const message = body?.message || `Request failed with status ${response.status}`
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
}
