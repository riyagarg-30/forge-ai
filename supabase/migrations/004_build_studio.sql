-- Forge AI: Build Studio
-- Adds startup-type classification + generated build assets (mockups,
-- product concept images, tech specs, manufacturing plans, etc).
-- Run this migration in your Supabase SQL editor or via Supabase CLI.

-- Classification + Build Studio lifecycle state on the parent session
ALTER TABLE analysis_sessions
  ADD COLUMN IF NOT EXISTS startup_type TEXT
    CHECK (startup_type IN ('software', 'physical')),
  ADD COLUMN IF NOT EXISTS startup_type_reasoning TEXT,
  ADD COLUMN IF NOT EXISTS build_studio_status TEXT NOT NULL DEFAULT 'locked'
    CHECK (build_studio_status IN ('locked', 'available', 'generating', 'completed', 'failed'));

-- One row per generated asset (image or structured document) per session.
-- `sequence` allows asset types that produce multiple items (e.g. several
-- product views) to be stored as distinct ordered rows under one asset_key.
CREATE TABLE IF NOT EXISTS build_studio_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES analysis_sessions(id) ON DELETE CASCADE,
  asset_key TEXT NOT NULL
    CHECK (asset_key IN (
      -- software track
      'ui_mockups', 'landing_page', 'dashboard', 'mobile_screens',
      'tech_stack', 'api_structure', 'database_schema', 'development_roadmap',
      -- physical product track
      'product_concept', 'product_views', 'internal_components',
      'packaging_design', 'manufacturing_plan'
    )),
  asset_kind TEXT NOT NULL CHECK (asset_kind IN ('image', 'document')),
  sequence INTEGER NOT NULL DEFAULT 0,
  title TEXT NOT NULL,
  content JSONB,
  image_url TEXT,
  storage_path TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  UNIQUE (session_id, asset_key, sequence)
);

CREATE INDEX IF NOT EXISTS idx_build_studio_assets_session_id
  ON build_studio_assets(session_id);

ALTER TABLE build_studio_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own build studio assets"
  ON build_studio_assets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM analysis_sessions
      WHERE analysis_sessions.id = build_studio_assets.session_id
        AND analysis_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own build studio assets"
  ON build_studio_assets FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM analysis_sessions
      WHERE analysis_sessions.id = build_studio_assets.session_id
        AND analysis_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own build studio assets"
  ON build_studio_assets FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM analysis_sessions
      WHERE analysis_sessions.id = build_studio_assets.session_id
        AND analysis_sessions.user_id = auth.uid()
    )
  );

-- Public storage bucket for generated concept/mockup images. The backend
-- (service role) is the only writer; images are served via public URL.
INSERT INTO storage.buckets (id, name, public)
VALUES ('build-studio-assets', 'build-studio-assets', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read access to build studio assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'build-studio-assets');
