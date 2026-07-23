import { useState } from 'react'
import { classifyIdeaType, buildPrototypeSketch } from '../utils/prototypeImage'
import PrototypeSketch from './PrototypeSketch'

/**
 * Standalone "Generate Prototype" action for the final report. Renders a
 * deterministic grid/schematic layout preview built entirely from the
 * Product Agent's own output — no AI image generation, no network call.
 */
export default function PrototypeGenerator({ ceo, product, session }) {
  const [visible, setVisible] = useState(false)

  if (!ceo || (ceo.verdict !== 'Build' && ceo.verdict !== 'Pivot')) return null

  const ideaType = classifyIdeaType({
    ideaText: session?.idea_text,
    businessDetails: session?.business_details,
    product,
    startupName: session?.startup_name,
  })

  const sketch = buildPrototypeSketch({
    startupName: session?.startup_name,
    ideaText: session?.idea_text,
    product,
    ideaType,
  })

  return (
    <div className="rounded-2xl border border-landing-border bg-landing-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-landing-muted">Prototype Preview</h4>
          <p className="mt-1 text-xs text-landing-muted">
            {ideaType === 'hardware'
              ? 'A deterministic engineering concept sheet — isometric, orthographic, and exploded views derived from the Product Agent\'s recommendations.'
              : 'A schematic UI layout sketch derived from the Product Agent\'s recommendations.'}
          </p>
        </div>
        <button
          onClick={() => setVisible((v) => !v)}
          className="flex-shrink-0 rounded-xl bg-landing-accent px-4 py-2 text-sm font-semibold text-white shadow-md shadow-landing-accent/20 transition-transform hover:scale-[1.02]"
        >
          {visible ? 'Hide Prototype' : '🖼️ Generate Prototype'}
        </button>
      </div>

      {visible && (
        <div className="mt-4">
          <PrototypeSketch sketch={sketch} />
        </div>
      )}
    </div>
  )
}
