import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// The dev server proxies /api to the backend so the browser always calls a
// same-origin path (no CORS, no absolute URL baked into the client bundle).
// The target is read fresh from env at server-start/config-reload time —
// Vite auto-restarts when this file changes, so editing VITE_API_URL and
// saving never leaves a stale target the way a client-side import.meta.env
// value would.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendTarget = env.VITE_API_URL || 'http://localhost:5001'

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: backendTarget,
          changeOrigin: true,
        },
      },
    },
  }
})
