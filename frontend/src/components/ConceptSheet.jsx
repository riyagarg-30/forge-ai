/**
 * Renders the Build Studio "engineering concept sheet" — a deterministic
 * HTML/CSS/SVG blueprint-style document built purely from structured content
 * (dimensions, materials, components, specs). No AI image generation is
 * involved: the same input always renders the same sheet.
 */
const HARDWARE_VIEWS = ['Isometric View', 'Front View', 'Side View', 'Top View']
const SOFTWARE_VIEWS = ['Primary Screen', 'Secondary Screen', 'Mobile View']

export default function ConceptSheet({ sheet }) {
  if (!sheet) return null
  const isHardware = sheet.type === 'hardware'
  const views = isHardware ? HARDWARE_VIEWS : SOFTWARE_VIEWS
  const components = sheet.components || []

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 text-slate-900 shadow-xl sm:p-8">
      <SheetHeader sheet={sheet} />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {views.map((label, i) => (
          <ViewPanel
            key={label}
            label={label}
            index={i}
            isHardware={isHardware}
            dimensions={sheet.dimensions}
            components={components}
          />
        ))}
      </div>

      {sheet.hasExplodedView && components.length > 0 && <ExplodedView components={components} />}

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {isHardware && sheet.materials?.length > 0 && <InfoList title="Materials" items={sheet.materials} />}
        <ColorPalette palette={sheet.colorPalette} />
      </div>

      {sheet.aiFeatures?.length > 0 && (
        <div className="mt-8">
          <SectionTitle>AI-Powered Features</SectionTitle>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {sheet.aiFeatures.map((f, i) => (
              <div key={i} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-sm font-semibold text-slate-800">✦ {f.feature}</p>
                <p className="mt-1 text-xs text-slate-500">{f.callout}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div>
          <SectionTitle>Technical Specifications</SectionTitle>
          <dl className="mt-3 space-y-1.5">
            {sheet.technicalSpecs?.map((s, i) => (
              <div key={i} className="flex justify-between border-b border-slate-100 py-1 text-xs">
                <dt className="text-slate-500">{s.label}</dt>
                <dd className="font-medium text-slate-800">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div>
          <SectionTitle>Key Functions</SectionTitle>
          <ul className="mt-3 space-y-1.5">
            {sheet.keyFunctions?.map((k, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                <span className="mt-0.5 text-slate-400">▹</span>
                {k}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

function SheetHeader({ sheet }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Engineering Concept Sheet</p>
        <h2 className="mt-1 text-2xl font-bold text-slate-900">{sheet.productName}</h2>
        <p className="mt-1 text-sm text-slate-500">{sheet.tagline}</p>
      </div>
      <div className="flex flex-col items-end gap-2">
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          {sheet.type === 'hardware' ? 'Hardware / Physical Product' : 'Software Product'}
        </span>
        {sheet.dimensions && (
          <span className="text-[10px] text-slate-400">
            {sheet.dimensions.length} × {sheet.dimensions.width} × {sheet.dimensions.height} {sheet.dimensions.unit}
          </span>
        )}
      </div>
    </div>
  )
}

function componentNumber(components, c) {
  return components.indexOf(c) + 1
}

function ViewPanel({ label, index, isHardware, dimensions, components }) {
  const calloutComponents = components.length
    ? [...new Set([components[index % components.length], components[(index + 1) % components.length]])]
    : []

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <svg viewBox="0 0 200 200" className="h-40 w-full">
        {isHardware ? <HardwareSilhouette viewIndex={index} /> : <SoftwareWireframe viewIndex={index} />}
        {calloutComponents.map((c, i) => (
          <Callout key={c.label} number={componentNumber(components, c)} x={70 + i * 55} y={40 + i * 20} />
        ))}
      </svg>
      <p className="mt-2 text-center text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      {isHardware && dimensions && index < 3 && (
        <p className="mt-1 text-center text-[10px] text-slate-400">
          {dimensions.length} × {dimensions.width} × {dimensions.height} {dimensions.unit}
        </p>
      )}
      {calloutComponents.length > 0 && (
        <ul className="mt-2 space-y-0.5">
          {calloutComponents.map((c) => (
            <li key={c.label} className="text-[10px] text-slate-500">
              <span className="font-semibold text-slate-700">{componentNumber(components, c)}.</span> {c.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function DimensionLine({ x1, y1, x2, y2 }) {
  return (
    <g stroke="#94a3b8" strokeWidth="1">
      <line x1={x1} y1={y1} x2={x2} y2={y2} />
      <line x1={x1} y1={y1 - 4} x2={x1} y2={y1 + 4} />
      <line x1={x2} y1={y2 - 4} x2={x2} y2={y2 + 4} />
    </g>
  )
}

/** Views: 0 = isometric, 1 = front, 2 = side, 3 = top. Deterministic schematic silhouette with dimension lines, in the patent-drawing tradition of abstracting the exact product shape into a labeled geometric outline. */
function HardwareSilhouette({ viewIndex }) {
  if (viewIndex === 0) {
    return (
      <g transform="translate(100,105)" stroke="#334155" strokeWidth="2" fill="none">
        <g transform="skewY(-12) skewX(-8)">
          <rect x="-50" y="-40" width="100" height="80" rx="10" />
        </g>
      </g>
    )
  }
  if (viewIndex === 1) {
    return (
      <>
        <rect x="60" y="30" width="80" height="130" rx="10" fill="none" stroke="#334155" strokeWidth="2" />
        <DimensionLine x1={60} y1={172} x2={140} y2={172} />
      </>
    )
  }
  if (viewIndex === 2) {
    return (
      <>
        <rect x="80" y="30" width="40" height="130" rx="8" fill="none" stroke="#334155" strokeWidth="2" />
        <DimensionLine x1={80} y1={172} x2={120} y2={172} />
      </>
    )
  }
  return (
    <>
      <rect x="50" y="70" width="100" height="50" rx="10" fill="none" stroke="#334155" strokeWidth="2" />
      <DimensionLine x1={50} y1={132} x2={150} y2={132} />
    </>
  )
}

/** Views: 0 = primary screen, 1 = secondary screen, 2 = mobile view. Schematic wireframe blocks, not real UI content. */
function SoftwareWireframe({ viewIndex }) {
  if (viewIndex === 2) {
    return (
      <g stroke="#334155" strokeWidth="2" fill="none">
        <rect x="70" y="20" width="60" height="160" rx="10" />
        <line x1="70" y1="45" x2="130" y2="45" />
        <rect x="78" y="55" width="44" height="20" rx="3" />
        <rect x="78" y="82" width="44" height="20" rx="3" />
        <rect x="78" y="109" width="44" height="20" rx="3" />
      </g>
    )
  }
  const withSidebar = viewIndex === 0
  return (
    <g stroke="#334155" strokeWidth="2" fill="none">
      <rect x="20" y="30" width="160" height="140" rx="6" />
      <line x1="20" y1="55" x2="180" y2="55" />
      {withSidebar && <line x1="55" y1="55" x2="55" y2="170" />}
      <rect x={withSidebar ? 65 : 30} y="65" width={withSidebar ? 105 : 140} height="30" rx="3" />
      <rect x={withSidebar ? 65 : 30} y="100" width={withSidebar ? 50 : 65} height="55" rx="3" />
      <rect x={withSidebar ? 120 : 105} y="100" width={withSidebar ? 50 : 65} height="55" rx="3" />
    </g>
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

function ExplodedView({ components }) {
  return (
    <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <SectionTitle>Exploded / Component View</SectionTitle>
      <div className="mt-3 grid gap-4 sm:grid-cols-[220px_1fr] sm:items-center">
        <svg viewBox="0 0 200 200" className="h-44 w-full">
          <rect x="60" y="30" width="80" height="130" rx="10" fill="none" stroke="#334155" strokeWidth="1.5" strokeDasharray="4 3" />
          {components.slice(0, 8).map((c, i) => {
            const angle = (i / components.length) * Math.PI * 2
            const x = 100 + Math.cos(angle) * 75
            const y = 100 + Math.sin(angle) * 75
            return <Callout key={c.label} number={i + 1} x={x} y={y} />
          })}
        </svg>
        <ol className="space-y-1.5">
          {components.map((c, i) => (
            <li key={c.label} className="text-xs text-slate-600">
              <span className="font-semibold text-slate-800">
                {i + 1}. {c.label}
              </span>{' '}
              — {c.description}
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}

function ColorPalette({ palette }) {
  if (!palette?.length) return null
  return (
    <div>
      <SectionTitle>Color Palette</SectionTitle>
      <div className="mt-3 flex flex-wrap gap-3">
        {palette.map((c, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-full border border-slate-200" style={{ backgroundColor: c.hex }} />
            <div className="text-xs">
              <p className="font-medium text-slate-700">{c.name}</p>
              <p className="text-slate-400">{c.hex}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function InfoList({ title, items }) {
  return (
    <div>
      <SectionTitle>{title}</SectionTitle>
      <ul className="mt-3 space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
            <span className="mt-0.5 text-slate-400">•</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

function SectionTitle({ children }) {
  return <h4 className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">{children}</h4>
}
