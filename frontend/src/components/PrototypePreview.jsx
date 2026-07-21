import { useState } from 'react'
import { motion } from 'framer-motion'

export default function PrototypePreview({ prototype }) {
  const [activeScreen, setActiveScreen] = useState(0)

  if (!prototype) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center">
        <p className="text-slate-500">Prototype data unavailable</p>
      </div>
    )
  }

  const isHardware = prototype.prototypeType === 'hardware'

  if (isHardware) {
    return (
      <div className="space-y-4">
        <p className="text-sm leading-relaxed text-slate-300">{prototype.prototypeDescription}</p>
        <div className="grid gap-4 sm:grid-cols-3">
          {(prototype.conceptRenders || []).map((render, i) => (
            <motion.div
              key={render.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group overflow-hidden rounded-2xl border border-white/[0.08]"
            >
              <div className={`aspect-[4/3] bg-gradient-to-br ${render.placeholderGradient} flex items-center justify-center relative`}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08),transparent_50%)]" />
                <div className="relative text-center">
                  <span className="text-4xl opacity-60">📦</span>
                  <p className="mt-2 text-[10px] uppercase tracking-widest text-white/40">Concept Render</p>
                </div>
                <div className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 bg-black/40 flex items-center justify-center">
                  <span className="text-xs text-white/80">AI render slot — integration ready</span>
                </div>
              </div>
              <div className="border-t border-white/[0.06] p-3">
                <p className="text-sm font-medium text-white">{render.title}</p>
                <p className="text-xs text-slate-500">{render.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
        <IntegrationBadge prototype={prototype} />
      </div>
    )
  }

  const screens = prototype.screens || []

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-slate-300">{prototype.prototypeDescription}</p>

      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d0d18]">
        {/* Browser chrome */}
        <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-2.5">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/60" />
          </div>
          <div className="mx-auto flex h-6 w-48 items-center justify-center rounded-md bg-white/[0.04] text-[10px] text-slate-500">
            app.{prototype.integrationReady ? 'yourstartup' : 'prototype'}.com
          </div>
        </div>

        {/* Screen tabs */}
        {screens.length > 0 && (
          <div className="flex gap-1 border-b border-white/[0.06] px-4 py-2">
            {screens.map((screen, i) => (
              <button
                key={screen.id}
                onClick={() => setActiveScreen(i)}
                className={`rounded-lg px-3 py-1 text-[11px] transition-colors ${
                  activeScreen === i ? 'bg-forge-purple/20 text-forge-purple' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {screen.name}
              </button>
            ))}
          </div>
        )}

        {/* Preview area */}
        <div className="relative aspect-[16/10] p-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.08),transparent_60%)]" />

          {screens[activeScreen] ? (
            <motion.div
              key={screens[activeScreen].id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative h-full rounded-xl border border-white/[0.08] bg-white/[0.02] p-4"
            >
              <p className="text-xs font-medium text-forge-purple">{screens[activeScreen].name}</p>
              <p className="mt-1 text-[11px] text-slate-500">{screens[activeScreen].description}</p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {screens[activeScreen].elements?.map((el, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-dashed border-white/10 bg-white/[0.02] px-3 py-2 text-[11px] text-slate-400"
                  >
                    {el}
                  </div>
                ))}
              </div>
              <div className="absolute bottom-4 right-4 rounded-lg bg-forge-gradient/20 px-3 py-1.5 text-[10px] text-forge-purple">
                Interactive preview slot
              </div>
            </motion.div>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-slate-500">Wireframe preview</p>
            </div>
          )}
        </div>
      </div>

      {prototype.uiRecommendations?.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">UI Recommendations</h4>
          <ul className="mt-2 space-y-1">
            {prototype.uiRecommendations.map((rec, i) => (
              <li key={i} className="text-xs text-slate-400">• {rec}</li>
            ))}
          </ul>
        </div>
      )}

      <IntegrationBadge prototype={prototype} />
    </div>
  )
}

function IntegrationBadge({ prototype }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5">
      <span className="h-2 w-2 rounded-full bg-emerald-400" />
      <span className="text-[11px] text-slate-400">
        {prototype.integrationReady?.slotForLivePreview
          ? `Architecture ready for AI-generated ${prototype.prototypeType} prototypes via ${prototype.integrationReady?.apiEndpoint || 'API'}`
          : 'Placeholder architecture — future AI integration ready'}
      </span>
    </div>
  )
}
