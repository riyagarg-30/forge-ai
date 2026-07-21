import { runResearchAgent } from './researchAgent.js'
import { runMarketAgent } from './marketAgent.js'
import { runFinanceAgent } from './financeAgent.js'
import { runProductAgent } from './productAgent.js'
import { runLegalAgent } from './legalAgent.js'
import { runDebateAgent } from './debateAgent.js'
import { runCeoAgent } from './ceoAgent.js'

const AGENT_RUNNERS = {
  research: runResearchAgent,
  market: runMarketAgent,
  finance: runFinanceAgent,
  product: runProductAgent,
  legal: runLegalAgent,
  debate: runDebateAgent,
  ceo: runCeoAgent,
}

export async function executeAgent(agentKey, context) {
  const runner = AGENT_RUNNERS[agentKey]
  if (!runner) {
    throw new Error(`Unknown agent: ${agentKey}`)
  }

  return runner(context)
}

export { AGENT_RUNNERS }
