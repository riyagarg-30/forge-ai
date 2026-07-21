# Forge AI — Startup Validation Platform

An AI-powered startup validation platform where founders collaborate with specialized AI co-founders. Watch every stage of reasoning — research, parallel analysis, live debate, and CEO decision — in a premium interactive workspace.

## Stack

- **Frontend:** React + Vite, Tailwind CSS, Framer Motion, React Router, Supabase Auth
- **Backend:** Node.js, Express, Supabase (PostgreSQL + Auth)
- **Database:** Supabase with RLS policies

## Quick Start

### 1. Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Run migrations in SQL Editor (in order):
   - `supabase/migrations/001_analysis_sessions.sql`
   - `supabase/migrations/002_business_details_progress.sql`
3. Copy Project URL, anon key, and service role key

### 2. Backend

```bash
cd backend
cp .env.example .env   # fill SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
npm install
npm run dev            # http://localhost:5000
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env   # fill VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_API_URL
npm install
npm run dev            # http://localhost:5173
```

## User Flow

1. **Login** → Forge AI Workspace
2. **Submit startup idea** → Smart Follow-up Modal (pre-fills detected fields)
3. **Confirm details** → Analysis session created
4. **6 agents run in parallel** (Research, Market, Finance, Product, Legal, Prototype)
5. **Live Debate Engine** — agents challenge each other in real time
6. **CEO Agent** — Build / Pivot / Don't Build decision
7. **Interactive Intelligence Report** — tabbed sections with domain readiness scores

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/analyze` | Create session with idea + business details |
| POST | `/api/agents/:agentKey` | Run agent (body: `{ sessionId }`) |
| GET | `/api/report/:id` | Full report with domain scores |
| GET | `/api/analysis/sessions` | List user's sessions |
| GET | `/api/analysis/sessions/:id` | Session + agent status |

Agent keys: `research`, `market`, `finance`, `product`, `legal`, `prototype`, `debate`, `ceo`

## Features

- Premium dark glassmorphism UI (Cursor / Perplexity inspired)
- Smart follow-up modal with auto-detection from prompt
- Parallel multi-agent analysis with live progress messages
- Live Debate Engine with typing indicators and streaming messages
- Domain-based readiness scores (8 independent domains)
- Interactive tabbed report (not a static PDF-style scroll)
- Prototype preview (software wireframes / hardware concept renders)
- Expandable 30-day execution roadmap
- Mock agent responses structured for future AI model integration

## Auth

Email/password, Google OAuth, forgot/reset password — all via Supabase Auth.
