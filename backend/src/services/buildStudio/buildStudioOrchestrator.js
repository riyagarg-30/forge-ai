import { supabaseAdmin } from '../../config/supabaseAdmin.js'
import { generateStructured } from '../agents/lib/llmJson.js'
import {
  buildAssetContext,
  techStackPrompt,
  apiStructurePrompt,
  databaseSchemaPrompt,
  developmentRoadmapPrompt,
  manufacturingPlanPrompt,
  conceptSheetPrompt,
} from './prompts.js'
import {
  techStackSchema,
  apiStructureSchema,
  databaseSchemaSchema,
  developmentRoadmapSchema,
  manufacturingPlanSchema,
  conceptSheetSchema,
} from './schemas.js'

const MAX_ATTEMPTS = 2

const ASSET_TITLES = {
  ui_mockups: 'UI Mockups',
  landing_page: 'Landing Page',
  dashboard: 'Dashboard',
  mobile_screens: 'Mobile Screens',
  tech_stack: 'Tech Stack',
  api_structure: 'API Structure',
  database_schema: 'Database Schema',
  development_roadmap: 'Development Roadmap',
  product_concept: 'Product Concept',
  product_views: 'Product Views',
  internal_components: 'Internal Components',
  packaging_design: 'Packaging Design',
  manufacturing_plan: 'Manufacturing Plan',
  concept_sheet: 'Engineering Concept Sheet',
}

/** Builds the flat list of asset jobs to run for a software startup. No image generation — the concept sheet is a deterministically-rendered document. */
function buildSoftwareJobs(ctx) {
  return [
    {
      assetKey: 'concept_sheet', kind: 'document', sequence: 0,
      run: () => generateStructured({ agentName: 'Build Studio: Concept Sheet', prompt: conceptSheetPrompt(ctx, 'software'), schema: conceptSheetSchema, temperature: 0.5, maxTokens: 1800 }),
    },
    {
      assetKey: 'tech_stack', kind: 'document', sequence: 0,
      run: () => generateStructured({ agentName: 'Build Studio: Tech Stack', prompt: techStackPrompt(ctx), schema: techStackSchema, temperature: 0.4, maxTokens: 1200 }),
    },
    {
      assetKey: 'api_structure', kind: 'document', sequence: 0,
      run: () => generateStructured({ agentName: 'Build Studio: API Structure', prompt: apiStructurePrompt(ctx), schema: apiStructureSchema, temperature: 0.4, maxTokens: 2000 }),
    },
    {
      assetKey: 'database_schema', kind: 'document', sequence: 0,
      run: () => generateStructured({ agentName: 'Build Studio: Database Schema', prompt: databaseSchemaPrompt(ctx), schema: databaseSchemaSchema, temperature: 0.4, maxTokens: 2000 }),
    },
    {
      assetKey: 'development_roadmap', kind: 'document', sequence: 0,
      run: () => generateStructured({ agentName: 'Build Studio: Development Roadmap', prompt: developmentRoadmapPrompt(ctx), schema: developmentRoadmapSchema, temperature: 0.4, maxTokens: 1600 }),
    },
  ]
}

/** Builds the flat list of asset jobs to run for a physical-product startup. No image generation — the concept sheet is a deterministically-rendered document. */
function buildPhysicalJobs(ctx) {
  return [
    {
      assetKey: 'concept_sheet', kind: 'document', sequence: 0,
      run: () => generateStructured({ agentName: 'Build Studio: Concept Sheet', prompt: conceptSheetPrompt(ctx, 'hardware'), schema: conceptSheetSchema, temperature: 0.5, maxTokens: 1800 }),
    },
    {
      assetKey: 'manufacturing_plan', kind: 'document', sequence: 0,
      run: () => generateStructured({ agentName: 'Build Studio: Manufacturing Plan', prompt: manufacturingPlanPrompt(ctx), schema: manufacturingPlanSchema, temperature: 0.4, maxTokens: 1600 }),
    },
  ]
}

async function upsertPendingRow(sessionId, job) {
  const { data, error } = await supabaseAdmin
    .from('build_studio_assets')
    .upsert(
      {
        session_id: sessionId,
        asset_key: job.assetKey,
        sequence: job.sequence,
        asset_kind: job.kind,
        title: job.kind === 'image' && job.sequence > 0 ? `${ASSET_TITLES[job.assetKey]} ${job.sequence + 1}` : ASSET_TITLES[job.assetKey],
        status: 'pending',
        error_message: null,
      },
      { onConflict: 'session_id,asset_key,sequence' }
    )
    .select()
    .single()

  if (error) throw error
  return data
}

/** Runs one asset job with a single retry, persisting status transitions. */
async function runJob(sessionId, job) {
  const row = await upsertPendingRow(sessionId, job)
  let lastError = null

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    await supabaseAdmin.from('build_studio_assets').update({ status: 'running', error_message: null }).eq('id', row.id)

    try {
      const output = await job.run()
      const update =
        job.kind === 'image'
          ? { status: 'completed', image_url: output.imageUrl, storage_path: output.storagePath, completed_at: new Date().toISOString() }
          : { status: 'completed', content: output, completed_at: new Date().toISOString() }

      const { data: updated, error } = await supabaseAdmin
        .from('build_studio_assets')
        .update(update)
        .eq('id', row.id)
        .select()
        .single()

      if (error) throw error
      return updated
    } catch (err) {
      lastError = err
      console.error(`[buildStudio] ${job.assetKey}#${job.sequence} attempt ${attempt}/${MAX_ATTEMPTS} failed:`, err.message)
    }
  }

  const { data: failed } = await supabaseAdmin
    .from('build_studio_assets')
    .update({ status: 'failed', error_message: lastError?.message || 'Asset generation failed.' })
    .eq('id', row.id)
    .select()
    .single()

  return failed || row
}

/**
 * Generates every Build Studio asset for a session. Only callable once the
 * CEO verdict is "Build" and startup_type has already been classified
 * (both enforced by the controller before this is invoked). Never throws —
 * failures are recorded per-asset so the rest of the batch still completes.
 */
export async function runBuildStudio(sessionId) {
  const { data: session, error: sessionError } = await supabaseAdmin
    .from('analysis_sessions')
    .select('*')
    .eq('id', sessionId)
    .single()

  if (sessionError || !session) throw new Error(`Session ${sessionId} not found for Build Studio.`)

  const { data: agentRows, error: agentError } = await supabaseAdmin
    .from('agent_results')
    .select('agent_key, result')
    .eq('session_id', sessionId)

  if (agentError) throw agentError

  const priorResults = {}
  for (const row of agentRows || []) {
    if (row.result) priorResults[row.agent_key] = row.result
  }
  const ceoResult = priorResults.ceo

  await supabaseAdmin.from('analysis_sessions').update({ build_studio_status: 'generating' }).eq('id', sessionId)

  const ctx = buildAssetContext({ session, priorResults, ceoResult })
  const jobs = session.startup_type === 'physical' ? buildPhysicalJobs(ctx) : buildSoftwareJobs(ctx)

  // All jobs are documents (LLM content, deterministically rendered by the
  // frontend) now that Pollinations image generation has been removed, so
  // they can all run concurrently with no rate-limit concern.
  const outcomes = await Promise.allSettled(jobs.map((job) => runJob(sessionId, job)))
  const allFailed = outcomes.every((o) => o.status === 'rejected' || o.value?.status === 'failed')

  // Partial success still leaves a usable Build Studio (whatever generated
  // is shown; failed rows are retryable). Only a total wipeout is "failed".
  await supabaseAdmin
    .from('analysis_sessions')
    .update({ build_studio_status: allFailed ? 'failed' : 'completed' })
    .eq('id', sessionId)

  return outcomes
}
