import { useId } from 'react'
import { HARDWARE_CATEGORIES } from '../utils/hardwareCategories'

/**
 * Deterministic engineering-blueprint schematic — no AI image generation.
 * Every shape is hand-authored SVG geometry keyed by detected hardware
 * category (see hardwareCategories.js), so a backpack idea actually draws
 * straps/compartments/antenna instead of one generic rounded rectangle.
 */
export default function PrototypeSketch({ sketch }) {
  const { productName, ideaType, summary } = sketch
  const isHardware = ideaType === 'hardware'

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 text-slate-900 shadow-xl sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            {isHardware ? 'Engineering Concept Sheet' : 'Schematic Layout Preview'}
          </p>
          <h3 className="mt-1 text-lg font-bold text-slate-900">{productName}</h3>
        </div>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          {isHardware ? 'Hardware / Physical Product' : 'Software Product'}
        </span>
      </div>

      {summary && <p className="mt-3 text-xs leading-relaxed text-slate-500">{summary}</p>}

      {isHardware ? <HardwareBlueprint sketch={sketch} /> : <SoftwarePreview sketch={sketch} />}
    </div>
  )
}

/* --------------------------------------- Shared helpers ----------------------------------------- */

function shapeAnchor(shape) {
  if (shape.anchor) return shape.anchor
  if (shape.kind === 'rect') return { x: shape.x + shape.w / 2, y: shape.y + shape.h / 2 }
  if (shape.kind === 'circle' || shape.kind === 'ellipse') return { x: shape.cx, y: shape.cy }
  return { x: 110, y: 110 }
}

function componentNumber(components, label) {
  if (!label) return null
  const lowerLabel = label.toLowerCase()
  const labelWords = lowerLabel.split(/\s+/).filter((w) => w.length > 2)

  const idx = components.findIndex((c) => {
    const lowerC = c.toLowerCase()
    if (lowerC.includes(lowerLabel) || lowerLabel.includes(lowerC)) return true
    return labelWords.some((w) => lowerC.includes(w))
  })
  return idx >= 0 ? idx + 1 : null
}

function ShapeElement({ shape, patternId }) {
  const stroke = '#334155'
  if (shape.kind === 'rect') {
    return (
      <rect
        x={shape.x}
        y={shape.y}
        width={shape.w}
        height={shape.h}
        rx={shape.rx ?? 4}
        fill={shape.grid ? `url(#${patternId})` : 'none'}
        stroke={stroke}
        strokeWidth={1.6}
      />
    )
  }
  if (shape.kind === 'circle') {
    return <circle cx={shape.cx} cy={shape.cy} r={shape.r} fill="none" stroke={stroke} strokeWidth={1.6} />
  }
  if (shape.kind === 'ellipse') {
    return <ellipse cx={shape.cx} cy={shape.cy} rx={shape.rx} ry={shape.ry} fill="none" stroke={stroke} strokeWidth={1.6} />
  }
  if (shape.kind === 'path') {
    return <path d={shape.d} fill="none" stroke={stroke} strokeWidth={1.6} strokeLinecap="round" />
  }
  return null
}

function GridDefs({ id }) {
  return (
    <defs>
      <pattern id={id} width="8" height="8" patternUnits="userSpaceOnUse">
        <path d="M 8 0 L 0 0 0 8" fill="none" stroke="#cbd5e1" strokeWidth="0.6" />
      </pattern>
    </defs>
  )
}

function Callout({ number, x, y }) {
  return (
    <g>
      <circle cx={x} cy={y} r="8" fill="#fff" stroke="#f97316" strokeWidth="1.5" />
      <text x={x} y={y + 3} textAnchor="middle" fontSize="8" fill="#f97316" fontWeight="700">
        {number}
      </text>
    </g>
  )
}

function DimensionLineH({ x1, x2, y }) {
  return (
    <g stroke="#94a3b8" strokeWidth="1">
      <line x1={x1} y1={y} x2={x2} y2={y} />
      <line x1={x1} y1={y - 4} x2={x1} y2={y + 4} />
      <line x1={x2} y1={y - 4} x2={x2} y2={y + 4} />
    </g>
  )
}

function SectionTitle({ children }) {
  return <h4 className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">{children}</h4>
}

/* ---------------------------------------- Hardware blueprint ------------------------------------- */

function HardwareBlueprint({ sketch }) {
  const patternUid = useId().replace(/[:]/g, '')
  const category = HARDWARE_CATEGORIES[sketch.category] || HARDWARE_CATEGORIES.device
  const { components, dimensions, weight, batteryLife, materials, wearable } = sketch

  return (
    <>
      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
        <p className="mb-2 text-center text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Isometric Concept View
        </p>
        <svg viewBox="0 0 260 240" className="h-64 w-full">
          <GridDefs id={`grid-${patternUid}-iso`} />
          <g transform="translate(130,120) scale(1.05) skewY(-9) skewX(-6) translate(-110,-110)">
            {category.front.map((s, i) => (
              <ShapeElement key={i} shape={s} patternId={`grid-${patternUid}-iso`} />
            ))}
          </g>
        </svg>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <OrthographicPanel
          label="Front View"
          shapes={category.front}
          components={components}
          patternId={`grid-${patternUid}-front`}
          dimensionText={dimensions ? `${dimensions.width} × ${dimensions.height} ${dimensions.unit}` : null}
        />
        <OrthographicPanel
          label="Side View"
          shapes={category.side}
          components={components}
          patternId={`grid-${patternUid}-side`}
          dimensionText={dimensions ? `${dimensions.length} × ${dimensions.height} ${dimensions.unit}` : null}
        />
        <OrthographicPanel
          label="Top View"
          shapes={category.top}
          components={components}
          patternId={`grid-${patternUid}-top`}
          dimensionText={dimensions ? `${dimensions.length} × ${dimensions.width} ${dimensions.unit}` : null}
        />
      </div>

      <ExplodedView shapes={category.front} components={components} patternId={`grid-${patternUid}-exp`} />

      {wearable && <UsageIllustration category={sketch.category} />}

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div>
          <SectionTitle>Technical Specifications</SectionTitle>
          <dl className="mt-3 space-y-1.5">
            {dimensions && (
              <SpecRow label="Dimensions" value={`${dimensions.length} × ${dimensions.width} × ${dimensions.height} ${dimensions.unit}`} />
            )}
            {weight && <SpecRow label="Weight" value={weight} />}
            {batteryLife && <SpecRow label="Estimated battery life" value={batteryLife} />}
          </dl>
        </div>
        {materials?.length > 0 && (
          <div>
            <SectionTitle>Materials</SectionTitle>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {materials.map((m, i) => (
                <span key={i} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] text-slate-600">
                  {m}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6">
        <SectionTitle>Numbered Components</SectionTitle>
        <ol className="mt-2 grid gap-1 sm:grid-cols-2">
          {components.map((c, i) => (
            <li key={i} className="text-xs text-slate-600">
              <span className="font-semibold text-slate-800">{i + 1}.</span> {c}
            </li>
          ))}
        </ol>
      </div>

      <p className="mt-4 text-center text-[10px] text-slate-400">
        Deterministic engineering concept sheet — schematic geometry, not a rendered image.
      </p>
    </>
  )
}

function SpecRow({ label, value }) {
  return (
    <div className="flex justify-between border-b border-slate-100 py-1 text-xs">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium text-slate-800">{value}</dd>
    </div>
  )
}

function OrthographicPanel({ label, shapes, components, patternId, dimensionText }) {
  const labeled = shapes.filter((s) => s.label)

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <svg viewBox="0 0 220 240" className="h-44 w-full">
        <GridDefs id={patternId} />
        {shapes.map((s, i) => (
          <ShapeElement key={i} shape={s} patternId={patternId} />
        ))}
        {labeled.map((s, i) => {
          const num = componentNumber(components, s.label)
          if (!num) return null
          const anchor = shapeAnchor(s)
          return <Callout key={i} number={num} x={anchor.x} y={anchor.y} />
        })}
        <DimensionLineH x1={40} x2={180} y={228} />
      </svg>
      <p className="mt-1 text-center text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      {dimensionText && <p className="text-center text-[10px] text-slate-400">{dimensionText}</p>}
    </div>
  )
}

function ExplodedView({ shapes, components, patternId }) {
  const labeled = shapes.filter((s) => s.label)
  const cx = 110
  const cy = 110

  return (
    <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <SectionTitle>Exploded / Component View</SectionTitle>
      <div className="mt-3 grid gap-4 sm:grid-cols-[260px_1fr] sm:items-center">
        <svg viewBox="0 0 260 260" className="h-56 w-full">
          <GridDefs id={patternId} />
          <g transform="translate(20,20)" opacity="0.4">
            {shapes.map((s, i) => (
              <ShapeElement key={i} shape={s} patternId={patternId} />
            ))}
          </g>
          {labeled.map((s, i) => {
            const num = componentNumber(components, s.label)
            if (!num) return null
            const anchor = shapeAnchor(s)
            const dx = anchor.x - cx
            const dy = anchor.y - cy
            const dist = Math.sqrt(dx * dx + dy * dy) || 1
            const ex = cx + (dx / dist) * (dist + 48) + 20
            const ey = cy + (dy / dist) * (dist + 48) + 20
            return (
              <g key={i}>
                <line
                  x1={anchor.x + 20}
                  y1={anchor.y + 20}
                  x2={ex}
                  y2={ey}
                  stroke="#f97316"
                  strokeWidth="1"
                  strokeDasharray="3 2"
                />
                <Callout number={num} x={ex} y={ey} />
              </g>
            )
          })}
        </svg>
        <ol className="space-y-1.5">
          {components.map((c, i) => (
            <li key={i} className="text-xs text-slate-600">
              <span className="font-semibold text-slate-800">{i + 1}. {c}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}

const USAGE_SPOTS = {
  backpack: { x: 100, y: 75, label: 'Worn on the back, both shoulder straps engaged' },
  helmet: { x: 100, y: 24, label: 'Worn on the head, chin strap secured' },
  wearable: { x: 58, y: 95, label: 'Worn on the wrist' },
}

function UsageIllustration({ category }) {
  const spot = USAGE_SPOTS[category]
  if (!spot) return null

  return (
    <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <SectionTitle>Usage Illustration</SectionTitle>
      <div className="mt-3 flex items-center gap-4">
        <svg viewBox="0 0 200 200" className="h-40 w-32 flex-shrink-0">
          <circle cx="100" cy="30" r="16" fill="none" stroke="#94a3b8" strokeWidth="2" />
          <path d="M 70 55 Q 100 45 130 55 L 125 140 Q 100 150 75 140 Z" fill="none" stroke="#94a3b8" strokeWidth="2" />
          <line x1="70" y1="60" x2="45" y2="120" stroke="#94a3b8" strokeWidth="2" />
          <line x1="130" y1="60" x2="155" y2="120" stroke="#94a3b8" strokeWidth="2" />
          <line x1="80" y1="140" x2="75" y2="185" stroke="#94a3b8" strokeWidth="2" />
          <line x1="120" y1="140" x2="125" y2="185" stroke="#94a3b8" strokeWidth="2" />
          <rect x={spot.x - 16} y={spot.y - 12} width="32" height="24" rx="4" fill="none" stroke="#f97316" strokeWidth="2" />
        </svg>
        <p className="text-xs text-slate-500">{spot.label}</p>
      </div>
    </div>
  )
}

/* ---------------------------------------- Software preview (unchanged) --------------------------- */

function SoftwarePreview({ sketch }) {
  const { components, techStack } = sketch

  return (
    <>
      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
        <svg viewBox="0 0 400 260" className="h-56 w-full">
          <defs>
            <pattern id="prototype-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="400" height="260" fill="url(#prototype-grid)" />
          <SoftwareSketch components={components} />
        </svg>
        <p className="mt-2 text-center text-[10px] text-slate-400">
          Schematic only — a structural preview of layout and components, not a rendered image.
        </p>
      </div>

      {components.length > 0 && (
        <div className="mt-4">
          <SectionTitle>Core Components / Features</SectionTitle>
          <ol className="mt-2 space-y-1">
            {components.map((c, i) => (
              <li key={i} className="text-xs text-slate-600">
                <span className="font-semibold text-slate-800">{i + 1}.</span> {c}
              </li>
            ))}
          </ol>
        </div>
      )}

      {techStack.length > 0 && (
        <div className="mt-4">
          <SectionTitle>Tech Stack</SectionTitle>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {techStack.map((t, i) => (
              <span key={i} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] text-slate-600">
                {t}
              </span>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

function SoftwareSketch({ components }) {
  const callouts = components.slice(0, 3)
  const positions = [
    { x: 205, y: 78 },
    { x: 150, y: 150 },
    { x: 260, y: 150 },
  ]

  return (
    <g stroke="#334155" strokeWidth="2" fill="none">
      <rect x="80" y="50" width="240" height="160" rx="8" />
      <line x1="80" y1="90" x2="320" y2="90" />
      <line x1="130" y1="90" x2="130" y2="210" />
      <rect x="140" y="102" width="170" height="40" rx="3" />
      <rect x="140" y="150" width="80" height="48" rx="3" />
      <rect x="230" y="150" width="80" height="48" rx="3" />
      {callouts.map((_, i) => (
        <Callout key={i} number={i + 1} x={positions[i].x} y={positions[i].y} />
      ))}
    </g>
  )
}
