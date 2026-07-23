export const TEMPLATE_KEYS = ['ui_ux', 'dashboard', 'mobile_app', 'landing_page']

const OUTPUT_INSTRUCTIONS = `
Return STRICT JSON only, with this exact shape:
{
  "files": {
    "App.jsx": "<the full component file content as a string>",
    "index.css": "<the full stylesheet content as a string>"
  },
  "entryFile": "App.jsx"
}

Rules:
- Output exactly two files: "App.jsx" and "index.css". Both are required.
- App.jsx must be a complete, self-contained React component using functional components and
  hooks only, default-exporting the root component. Define any subcomponents inside the same file.
- App.jsx must start with "import './index.css'" and otherwise only import from: "react",
  "lucide-react" (icons), and "framer-motion" (animation/transitions). Do not import anything else,
  and do not import a CSS framework — there is no build-time CSS processor available, so Tailwind
  or other utility-class frameworks will not render.
- Style entirely through index.css using plain, modern, handwritten CSS: CSS custom properties for
  theme values, flexbox/grid for layout, real transitions/hover states, and responsive @media
  queries so the layout adapts on narrow screens. Reference your classes from App.jsx via
  className.
- The result must look like a polished, production-quality, visually rich UI suitable for a
  hackathon demo — real copy and content (no lorem ipsum, no "TODO" placeholders, no empty
  sections), thoughtful spacing, color, and typography. Do not ship a bare, unstyled skeleton.
- Do not include markdown fences or explanation text outside the JSON — JSON only.
- Keep both files concise enough to fit comfortably in the response — favor fewer, denser
  sections over exhaustive detail. Never stop mid-string or mid-object: the JSON must be complete
  and syntactically valid, with every brace, bracket, and quote closed.
`.trim()

function paramLines(formValues) {
  const lines = Object.entries(formValues || {})
    .filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== '')
    .map(([key, value]) => `- ${key}: ${value}`)

  return lines.length > 0 ? lines.join('\n') : '- (no parameters provided)'
}

const TEMPLATE_BRIEFS = {
  ui_ux: (params) => `Design and implement a UI/UX screen as a React component.

Parameters:
${params}

Build the screen described by these parameters: apply the requested visual style and primary
color as CSS custom properties and accents in index.css, and render the requested number of
distinct screen sections or states within the one component (e.g. tabs or stacked sections) if
more than one is requested.`,

  dashboard: (params) => `Design and implement an analytics/admin dashboard as a React component.

Parameters:
${params}

Build a dashboard reflecting the given name and data source, rendering the requested chart types
as styled placeholder chart blocks (CSS-styled divs standing in for real charts — no charting
library), and include the listed key widgets as KPI/stat cards.`,

  mobile_app: (params) => `Design and implement a mobile app UI as a React component, rendered as
a phone-frame layout inside a web page.

Parameters:
${params}

Build a phone-frame mockup for the given app name and platform, with the requested navigation
style (tab bar / drawer / stack) and the listed screens represented as switchable views within
the one component.`,

  landing_page: (params) => `Design and implement a marketing landing page as a React component.

Parameters:
${params}

Build a landing page using the given page title and hero headline, a prominent call-to-action
button with the given text, and the listed sections in order beneath the hero.`,
}

/** Turns a submitted template form into a structured code-generation prompt. */
export function buildTemplatePrompt(templateKey, formValues) {
  const brief = TEMPLATE_BRIEFS[templateKey]
  if (!brief) throw new Error(`Unknown template category: ${templateKey}`)

  return `${brief(paramLines(formValues))}\n\n${OUTPUT_INSTRUCTIONS}`
}
