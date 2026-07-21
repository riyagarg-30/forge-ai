-- Forge AI: Business details & agent progress tracking

ALTER TABLE analysis_sessions
  ADD COLUMN IF NOT EXISTS business_details JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS startup_name TEXT;

ALTER TABLE agent_results
  ADD COLUMN IF NOT EXISTS progress_phase TEXT,
  ADD COLUMN IF NOT EXISTS progress_message TEXT;

CREATE INDEX IF NOT EXISTS idx_analysis_sessions_created_at
  ON analysis_sessions(user_id, created_at DESC);
