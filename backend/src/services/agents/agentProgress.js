import { supabaseAdmin } from '../../config/supabaseAdmin.js'
import { AGENT_PROGRESS_STEPS } from '../../constants/agents.js'

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function runWithProgress(agentResultId, agentKey, executeFn) {
  const steps = AGENT_PROGRESS_STEPS[agentKey] || []

  for (const step of steps) {
    await supabaseAdmin
      .from('agent_results')
      .update({
        progress_phase: step.phase,
        progress_message: step.message,
      })
      .eq('id', agentResultId)

    await sleep(step.duration)
  }

  return executeFn()
}
