# CLAUDE.md

Guidance for working in this repository.

## What this is

**Forge AI** — an AI-powered startup validation platform. A founder submits a startup idea, a set of specialized "AI co-founder" agents analyze it (research, market, finance, product, legal, prototype), the agents debate, and a CEO agent issues a Build / Pivot / Don't Build recommendation, rendered as an interactive intelligence report.

**Important:** The agents are currently **mock implementations**. Each agent returns hand-crafted structured data interpolated with the user's inputs (see `backend/src/services/agents/researchAgent.js`) and simulates work via `mockDelay()` / timed progress steps. There is **no real LLM/AI model wired in yet** — the structures are shaped for future model integration.

## Repository layout

```
backend/     Node.js + Express API, Supabase (service role) — the API server
frontend/    React + Vite SPA (Tailwind, Framer Motion, React Router, Supabase Auth)
supabase/    SQL migrations (run manually in the Supabase SQL editor, in order)
client/      Empty (only a stray .vite dir) — ignore; the real UI is in frontend/
```

The root `package-lock.json` is an empty stub. There is no root workspace — `backend/` and `frontend/` are installed and run independently.

## Commands

Backend (`cd backend`):
- `npm install`
- `npm run dev` — `node --watch index.js`, serves http://localhost:5000
- `npm start` — `node index.js`

Frontend (`cd frontend`):
- `npm install`
- `npm run dev` — Vite dev server, http://localhost:5173
- `npm run build` / `npm run preview`

There are **no tests, no linter, and no typecheck configured** in either package. "Verifying" a change means running the servers and exercising the flow in the browser.

## Environment / setup (required — the app will not start without this)

Neither `.env` is committed (both gitignored). You must create them from the examples:

- `backend/.env` (from `backend/.env.example`): `PORT`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `FRONTEND_ORIGIN`
- `frontend/.env` (from `frontend/.env.example`): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL`

**Gotcha:** `backend/src/config/supabaseAdmin.js` logs a warning if the Supabase vars are missing but does **not** exit — it then calls `createClient(undefined, ...)`, which throws `supabaseUrl is required` at module load and crashes the whole server before `app.listen`. A crash-on-startup is almost always a missing `backend/.env`.

Database: run `supabase/migrations/001_analysis_sessions.sql` then `002_business_details_progress.sql` in the Supabase SQL editor before use.

## Architecture

### Auth
- Supabase Auth on the frontend (`frontend/src/lib/supabaseClient.js`, `AuthContext.jsx`); email/password + Google OAuth + forgot/reset password.
- Frontend attaches the Supabase `access_token` as a `Bearer` header on every API call (`frontend/src/lib/api.js`).
- Backend verifies the token via `supabaseAdmin.auth.getUser(token)` in `requireAuth` (`backend/src/middleware/authMiddleware.js`), setting `req.user`. Nearly every route is behind `requireAuth`.
- Backend uses the **service role** key and bypasses RLS; RLS policies (defined in migration 001) protect direct client access. In controllers, ownership is enforced manually by matching `user_id` (see `getSessionForUser`).

### Data model (Supabase / Postgres)
- `analysis_sessions` — one per submitted idea: `idea_text`, `business_details` (jsonb), `startup_name`, `status` (`pending|running|completed|failed`).
- `agent_results` — one row per agent per session (`UNIQUE(session_id, agent_key)`): `agent_key`, `status`, `result` (jsonb), `progress_phase`, `progress_message`.

### Agents (backend)
- `src/constants/agents.js` — the single source of truth: `PARALLEL_AGENT_KEYS` (research, market, finance, product, legal, prototype), plus `debate` and `ceo` in `AGENT_KEYS`. Also `AGENT_META` (display info) and `AGENT_PROGRESS_STEPS` (timed fake progress messages). **The same agent key set is duplicated in `frontend/src/constants/agents.js` and in the DB `CHECK` constraint — keep all three in sync when adding an agent.**
- `src/services/agents/index.js` — `executeAgent(agentKey, context)` dispatches to per-agent runners (`researchAgent.js`, etc.).
- Each runner takes a `context` (`{ ideaText, businessDetails, startupName, priorResults }` via `parseContext`) and returns a structured result object. `debate` and `ceo` consume `priorResults` from the parallel agents.
- `analysisController.js` orchestrates: create session → run agents (storing rows in `agent_results`) → assemble report with domain readiness scores.

### API routes
Mounted in `backend/index.js`. Two overlapping surfaces exist:
- **Modular / spec API:** `POST /api/analyze`, `POST /api/agents/:agentKey` (body `{ sessionId }`), `GET /api/report/:id`. Also aliased under `/api/analysis/*`.
- **Session/legacy API** under `/api/analysis`: `GET /sessions`, `GET /sessions/:id`, `GET /sessions/:id/agents/:agentKey`, plus legacy `POST /sessions` and `POST /sessions/:id/agents/:agentKey/run`.
- Other: `/api/auth` (signup, session, revoke-all), `/api/user/me` (get/patch), `/health`.

### Frontend routing (`frontend/src/App.jsx`)
Public: `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/auth/callback`. Protected (via `ProtectedRoute`): `/dashboard` (Workspace), `/analysis/:sessionId` (AnalysisPipeline), `/analysis/:sessionId/report` (AnalysisReport), `/profile`, `/settings`. Unknown paths redirect to `/dashboard`.

## Conventions

- **ES modules everywhere** (`"type": "module"`); backend imports use explicit `.js` extensions.
- Backend: 2-space indent, no semicolons, single quotes.
- Frontend: React 18 function components + hooks; Tailwind utility classes; Framer Motion for animation; a "premium dark glassmorphism" visual style (see `GlassCard.jsx` and friends).
- API responses use `{ message: ... }` for errors; the frontend `request()` helper throws `Error(body.message)` on non-2xx.

## When making changes

- Adding/renaming an agent: update `backend/src/constants/agents.js`, `frontend/src/constants/agents.js`, the runner map in `backend/src/services/agents/index.js`, the runner file itself, and the `agent_key` CHECK constraint in the DB (new migration).
- Adding a DB column: write a new numbered migration in `supabase/migrations/`; do not edit existing ones (they're already applied).
- Replacing mock agents with a real model: the integration point is each `run<Name>Agent(context)` runner — keep the returned result shape stable, since controllers and the frontend report depend on it.
