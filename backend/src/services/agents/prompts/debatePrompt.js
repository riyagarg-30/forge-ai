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
1. Each of the 7 personas must speak at least once, referencing SPECIFIC content from the reports above (a number, an assumption, a named competitor, a stated risk) — not vague platitudes.
2. Generate genuine disagreement: at least one participant must directly challenge another's reasoning with a counter-argument, not just add supporting color.
3. The Venture Capitalist should stress-test the investment case (market size credibility, competitive moat, funding need vs. ask).
4. The Startup CEO persona should defend the vision while acknowledging real weaknesses — not cheerlead uncritically.
5. The CTO should assess technical feasibility and challenge the Product Agent's plan if the tech stack/timeline looks unrealistic for the team size/budget.
6. The CFO should scrutinize the Finance Agent's unit economics and cost assumptions specifically — do they hold up?
7. The Product Manager should defend or revise MVP scope under pressure from cost/timeline pushback.
8. The Marketing Expert should assess go-to-market feasibility and customer acquisition assumptions.
9. The Legal Counsel should raise concrete regulatory/compliance concerns from the Legal Agent report and their real impact on timeline/cost.
10. Identify at least 2 genuine points of disagreement with the different positions taken and how (if at all) they were resolved.
11. Identify strengths, weaknesses, remaining risks, and opportunities that emerged from the discussion — grounded in what was actually said, not generic startup risk boilerplate.
12. End with a consensus statement reflecting where the committee actually landed — it does not have to be unanimous positivity; unresolved tension should be reflected honestly.
13. Give a confidence score (0-100) reflecting how much real convergence the committee reached versus how much remains contested.
14. Populate "sources" per the SOURCE CITATION RULE below — pull from whichever of the five reports' own "sources" arrays support the specific claims raised in the debate (e.g. a Market source cited when the VC challenges TAM, a Legal source cited when Legal Counsel raises a regulation).

${SOURCE_CITATION_RULE}

CONSTRAINTS
- Do NOT write a scripted, generic conversation. Every message must be traceable to something specific in the reports above.
- Do NOT have every persona agree with each other — a debate with no real disagreement is a failure.
- Each message's "type" must accurately reflect its content: "statement" (opening position), "agreement", "challenge" (direct pushback), "counter" (rebuttal to a challenge), "evidence" (citing specific data from a report), "consensus" (converging statement).
- Produce at least 10 messages total across the 7 personas (some personas speak more than once as the discussion develops).
- Return ONLY valid JSON, no markdown, no preamble.

REASONING STRATEGY
Before writing messages: (1) identify the 2-3 most contestable claims across the five reports (e.g. an optimistic TAM, an aggressive timeline, an unaddressed compliance cost), (2) assign these as the flashpoints of the debate, (3) script the discussion so personas naturally clash on those flashpoints with real content, (4) only after the discussion is coherent, derive the summary fields (agreements, disagreements, risks, strengths, weaknesses, opportunities, consensus) from what was actually said.

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
