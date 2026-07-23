-- Forge AI: Build Studio — replace Pollinations image generation with a
-- deterministic, locally-rendered engineering concept sheet. This adds the
-- new asset_key without removing the old (now unused) image ones, so any
-- existing rows from before this migration remain valid.

ALTER TABLE build_studio_assets
  DROP CONSTRAINT IF EXISTS build_studio_assets_asset_key_check;

ALTER TABLE build_studio_assets
  ADD CONSTRAINT build_studio_assets_asset_key_check
    CHECK (asset_key IN (
      -- software track (legacy, pre-concept-sheet)
      'ui_mockups', 'landing_page', 'dashboard', 'mobile_screens',
      'tech_stack', 'api_structure', 'database_schema', 'development_roadmap',
      -- physical product track (legacy, pre-concept-sheet)
      'product_concept', 'product_views', 'internal_components',
      'packaging_design', 'manufacturing_plan',
      -- current: deterministic engineering concept sheet (both tracks)
      'concept_sheet'
    ));
