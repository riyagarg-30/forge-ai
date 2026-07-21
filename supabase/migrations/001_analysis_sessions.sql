-- Forge AI: Analysis Sessions & Agent Results
-- Run this migration in your Supabase SQL editor or via Supabase CLI

-- Analysis sessions
CREATE TABLE IF NOT EXISTS analysis_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  idea_text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Agent execution results (one row per agent per session)
CREATE TABLE IF NOT EXISTS agent_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES analysis_sessions(id) ON DELETE CASCADE,
  agent_key TEXT NOT NULL
    CHECK (agent_key IN (
      'research', 'market', 'finance', 'product',
      'legal', 'prototype', 'debate', 'ceo'
    )),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  result JSONB,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (session_id, agent_key)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_analysis_sessions_user_id ON analysis_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_sessions_status ON analysis_sessions(status);
CREATE INDEX IF NOT EXISTS idx_agent_results_session_id ON agent_results(session_id);

-- Auto-update updated_at on analysis_sessions
CREATE OR REPLACE FUNCTION update_analysis_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_analysis_sessions_updated_at ON analysis_sessions;
CREATE TRIGGER trg_analysis_sessions_updated_at
  BEFORE UPDATE ON analysis_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_analysis_sessions_updated_at();

-- Row Level Security
ALTER TABLE analysis_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_results ENABLE ROW LEVEL SECURITY;

-- Users can only access their own sessions
CREATE POLICY "Users can view own sessions"
  ON analysis_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON analysis_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON analysis_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can access agent results for their own sessions
CREATE POLICY "Users can view own agent results"
  ON agent_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM analysis_sessions
      WHERE analysis_sessions.id = agent_results.session_id
        AND analysis_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own agent results"
  ON agent_results FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM analysis_sessions
      WHERE analysis_sessions.id = agent_results.session_id
        AND analysis_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own agent results"
  ON agent_results FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM analysis_sessions
      WHERE analysis_sessions.id = agent_results.session_id
        AND analysis_sessions.user_id = auth.uid()
    )
  );
