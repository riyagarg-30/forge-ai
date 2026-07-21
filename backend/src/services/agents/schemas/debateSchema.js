import { z } from 'zod'
import { SourceLink } from './common.js'

export const DEBATE_PERSONAS = [
  'Venture Capitalist',
  'Startup CEO',
  'CTO',
  'CFO',
  'Product Manager',
  'Marketing Expert',
  'Legal Counsel',
]

const Persona = z.enum(DEBATE_PERSONAS)
const MessageType = z.enum(['statement', 'agreement', 'challenge', 'counter', 'evidence', 'consensus'])

const DebateMessage = z.object({
  id: z.string().min(1),
  speaker: Persona,
  type: MessageType,
  content: z.string().min(1),
})

const Disagreement = z.object({
  topic: z.string().min(1),
  positions: z
    .array(
      z.object({
        speaker: Persona,
        position: z.string().min(1),
      })
    )
    .min(2),
  resolution: z.string().min(1),
})

export const debateSchema = z.object({
  summary: z.string().min(1),
  messages: z.array(DebateMessage).min(8),
  keyDisagreements: z.array(Disagreement).min(1),
  agreements: z.array(z.string().min(1)).min(2),
  openRisks: z.array(z.string().min(1)).min(2),
  strengthsIdentified: z.array(z.string().min(1)).min(2),
  weaknessesIdentified: z.array(z.string().min(1)).min(2),
  opportunitiesIdentified: z.array(z.string().min(1)).min(1),
  consensus: z.string().min(1),
  confidence: z.number().min(0).max(100),
  sources: z.array(SourceLink).default([]),
})
