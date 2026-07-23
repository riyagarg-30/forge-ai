import { buildStartupContext, formatPriorResult, SOURCE_CITATION_RULE } from '../lib/buildStartupContext.js'
import { DEBATE_PERSONAS } from '../schemas/debateSchema.js'

export function buildDebatePrompt({ startupName, ideaText, businessDetails, research, market, finance, product, legal }) {
  const context = buildStartupContext({ startupName, ideaText, businessDetails })

  return `ROLE
You are simulating a real investment committee meeting with seven distinct, opinionated participants:
${DEBATE_PERSONAS.map((p) => `- ${p}`).join('\n')}

Each participant has a genuinely different professional lens and does not simply agree with the group. They have read the reports below and are reacting to SPECIFIC claims, numbers, and assumptions in them — not generic startup talking points.

OBJECTIVE
Produce a realistic, substantive investment-committee discussion about whether to fund/build this startup, that surfaces real tension between the reports (e.g. Finance's cost assumptions vs. Product's scope, Market's growth claims vs. Legal's regulatory risk, CTO's feasibility concerns vs. Marketing's GTM timeline).

CONTEXT
${context}

REPORTS UNDER DISCUSSION:

${formatPriorResult('RESEARCH AGENT REPORT', research)}

${formatPriorResult('MARKET AGENT REPORT', market)}

${formatPriorResult('FINANCE AGENT REPORT', finance)}

${formatPriorResult('PRODUCT AGENT REPORT', product)}

${formatPriorResult('LEGAL AGENT REPORT', legal)}

INSTRUCTIONS
1. Each of the 7 personas speaks exactly once, in one short sentence (max ~15 words) referencing a SPECIFIC number, assumption, or claim from the reports above — not a generic platitude.
2. At least one message must directly challenge another persona's point with a counter-argument — a debate with zero real disagreement is a failure.
3. Identify only the top 3 strengths and top 3 risks that emerged, and exactly the genuine conflicts between agents' conclusions (e.g. Market's growth claims vs. Legal's regulatory risk, Finance's cost assumptions vs. Product's scope) — do not pad with more than what's genuinely there.
4. End with a consensus statement that states the committee's converging recommendation explicitly as one of "Build", "Pivot", or "Reject", plus the one-line reason why.
5. Give a confidence score (0-100) reflecting how much real convergence the committee reached.
6. Populate "sources" per the SOURCE CITATION RULE below — cite only the 1-3 sources that most directly back the strongest conflict or risk raised.

${SOURCE_CITATION_RULE}

CONSTRAINTS
- Be extremely concise: total output across all fields must read in well under 250 words. One short sentence per message/list item — no elaboration, no repetition, no restating the reports.
- Do NOT write a scripted, generic conversation. Every message must be traceable to something specific in the reports above.
- Each message's "type" must accurately reflect its content: "statement" (opening position), "agreement", "challenge" (direct pushback), "counter" (rebuttal to a challenge), "evidence" (citing specific data from a report), "consensus" (converging statement).
- Produce exactly 8 messages total, one per persona plus one closing consensus message from the Startup CEO.
- Return ONLY valid JSON, no markdown, no preamble.

REASONING STRATEGY
Pick the single most contestable claim across the five reports, script the 8 messages so the personas clash on it directly, then derive the summary fields (top 3 strengths/risks, the genuine conflicts, consensus) from only what was actually said — do not invent additional points to fill space.

EXPECTED JSON SCHEMA
Return ONLY valid JSON matching this exact schema (no extra top-level keys, no omitted keys). "speaker" must be exactly one of: ${DEBATE_PERSONAS.join(', ')}.

{
  "summary": "",
  "messages": [
    { "id": "m1", "speaker": "Venture Capitalist", "type": "statement", "content": "" }
  ],
  "keyDisagreements": [
    {
      "topic": "",
      "positions": [
        { "speaker": "CFO", "position": "" },
        { "speaker": "Product Manager", "position": "" }
      ],
      "resolution": ""
    }
  ],
  "agreements": ["", ""],
  "openRisks": ["", ""],
  "strengthsIdentified": ["", ""],
  "weaknessesIdentified": ["", ""],
  "opportunitiesIdentified": [""],
  "consensus": "",
  "confidence": 0,
  "sources": [{ "title": "", "url": "", "type": "" }]
}`
}
