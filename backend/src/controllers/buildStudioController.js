import { supabaseAdmin } from '../config/supabaseAdmin.js'
import { runBuildStudio } from '../services/buildStudio/buildStudioOrchestrator.js'
import { generateProjectFiles } from '../services/buildStudio/codeGenerator.js'
import { buildTemplatePrompt, TEMPLATE_KEYS } from '../services/buildStudio/templatePrompts.js'

async function getSessionForUser(sessionId, userId) {
  const { data, error } = await supabaseAdmin
    .from('analysis_sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('user_id', userId)
    .single()

  if (error || !data) return null
  return data
}

/**
 * POST /api/analysis/sessions/:sessionId/build-studio/generate
 * Kicks off asset generation for a session whose CEO verdict was "Build"
 * and which has already been auto-classified as software or physical.
 * Returns immediately; the frontend polls GET .../build-studio for progress.
 */
export async function generateBuildStudio(req, res) {
  try {
    const { sessionId } = req.params
    const session = await getSessionForUser(sessionId, req.user.id)

    if (!session) {
      return res.status(404).json({ message: 'Analysis session not found.' })
    }

    if (session.build_studio_status === 'locked') {
      return res.status(409).json({
        message: 'Build Studio is not available for this session yet. It unlocks automatically once the CEO Agent issues a "Build" verdict.',
      })
    }

    if (!session.startup_type) {
      return res.status(409).json({ message: 'Startup type has not been classified yet. Please try again shortly.' })
    }

    if (session.build_studio_status === 'generating') {
      return res.status(202).json({ message: 'Build Studio is already generating.', session })
    }

    await supabaseAdmin.from('analysis_sessions').update({ build_studio_status: 'generating' }).eq('id', sessionId)

    runBuildStudio(sessionId).catch(async (err) => {
      console.error(`[buildStudio] generation error for session ${sessionId}:`, err)
      await supabaseAdmin.from('analysis_sessions').update({ build_studio_status: 'failed' }).eq('id', sessionId)
    })

    return res.status(202).json({ message: 'Build Studio generation started.' })
  } catch (err) {
    console.error('generateBuildStudio error:', err)
    return res.status(500).json({ message: 'Failed to start Build Studio generation.' })
  }
}

/** GET /api/analysis/sessions/:sessionId/build-studio */
export async function getBuildStudio(req, res) {
  try {
    const { sessionId } = req.params
    const session = await getSessionForUser(sessionId, req.user.id)

    if (!session) {
      return res.status(404).json({ message: 'Analysis session not found.' })
    }

    const { data: assets, error } = await supabaseAdmin
      .from('build_studio_assets')
      .select('*')
      .eq('session_id', sessionId)
      .order('asset_key', { ascending: true })
      .order('sequence', { ascending: true })

    if (error) throw error

    return res.status(200).json({
      startupType: session.startup_type,
      startupTypeReasoning: session.startup_type_reasoning,
      buildStudioStatus: session.build_studio_status,
      assets: assets || [],
    })
  } catch (err) {
    console.error('getBuildStudio error:', err)
    return res.status(500).json({ message: 'Failed to fetch Build Studio assets.' })
  }
}

/**
 * POST /api/analysis/sessions/:sessionId/build-studio/generate-template
 * Converts a submitted template form into a code-generation prompt, sends
 * it to the configured AI provider, and returns the generated React/Tailwind
 * project files. Session-scoped for ownership checks only — it does not
 * require or touch build_studio_status.
 */
export async function generateTemplateProject(req, res) {
  try {
    const { sessionId } = req.params
    const { templateKey, formValues } = req.body || {}

    const session = await getSessionForUser(sessionId, req.user.id)
    if (!session) {
      return res.status(404).json({ message: 'Analysis session not found.' })
    }

    if (!TEMPLATE_KEYS.includes(templateKey)) {
      return res.status(400).json({ message: 'Unknown template category.' })
    }

    const prompt = buildTemplatePrompt(templateKey, formValues)
    const project = await generateProjectFiles({ prompt })

    return res.status(200).json({ templateKey, ...project })
  } catch (err) {
    console.error('generateTemplateProject error:', err)
    return res.status(500).json({ message: err.message || 'Failed to generate project.' })
  }
}
