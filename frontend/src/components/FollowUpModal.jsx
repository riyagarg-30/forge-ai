import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BUSINESS_FIELDS, getDefaultDetails, getMissingFields, extractBusinessDetails } from '../utils/businessDetails'

/**
 * Presentation layer only. Field KEYS, `required` flags, options and the
 * submitted `details` payload all still come from BUSINESS_FIELDS — this map
 * just decides how each key is *shown* (founder-facing label, icon, section,
 * input widget). Backend field names are never changed.
 */
const FIELD_UI = {
  startupName: {
    label: 'Startup Name', icon: 'sparkles', group: 'basics',
    placeholder: 'e.g. Forge, Acme AI', help: 'What are you calling it?',
  },
  industry: {
    label: 'Industry', icon: 'building', group: 'basics', widget: 'search',
    placeholder: 'Search industries…',
  },
  country: {
    label: 'Home Base', icon: 'pin', group: 'basics',
    placeholder: 'e.g. India, United States',
  },
  targetRegion: {
    label: 'Target Market', icon: 'globe', group: 'market', widget: 'cards',
    help: 'Where are your first customers?',
  },
  businessModel: {
    label: 'Business Model', icon: 'briefcase', group: 'market', widget: 'cards',
  },
  targetAudience: {
    label: 'Ideal Customer', icon: 'users', group: 'market', widget: 'textarea',
    placeholder: 'Who feels this pain most? e.g. early-stage founders drowning in ops work',
    help: 'The person you are building for',
  },
  existingCompetitors: {
    label: 'Key Competitors', icon: 'flag', group: 'market',
    placeholder: 'e.g. Notion, Linear, Airtable',
  },
  revenueModel: {
    label: 'Pricing Strategy', icon: 'tag', group: 'money',
    placeholder: 'e.g. Subscription, Freemium, Usage-based',
    suggestions: ['Subscription', 'Freemium', 'Usage-based', 'Transaction fee', 'One-time'],
  },
  budget: {
    label: 'Starting Capital', icon: 'dollar', group: 'money',
    placeholder: 'e.g. $100,000',
  },
  startupStage: {
    label: 'Current Stage', icon: 'activity', group: 'team', widget: 'cards',
    cardMeta: {
      Idea: 'Just a concept',
      MVP: 'Building it',
      Beta: 'Testing with users',
      Live: 'In market',
    },
  },
  teamSize: {
    label: 'Team Size', icon: 'user', group: 'team',
    placeholder: 'e.g. 2–3 people',
  },
  timeline: {
    label: 'Launch Timeline', icon: 'clock', group: 'team',
    placeholder: 'e.g. 6 months',
  },
  additionalRequirements: {
    label: 'Anything Else?', icon: 'message', group: 'extra', widget: 'textarea',
    placeholder: 'Constraints, goals or context the AI team should know…',
  },
}

const GROUPS = [
  { id: 'basics', title: 'The Essentials', icon: 'sparkles' },
  { id: 'market', title: 'Market & Customers', icon: 'globe' },
  { id: 'money', title: 'Money & Model', icon: 'dollar' },
  { id: 'team', title: 'Team & Traction', icon: 'users' },
  { id: 'extra', title: 'Context', icon: 'message' },
]

// Keys surfaced as chips in the AI summary card, in display order.
const SUMMARY_KEYS = ['industry', 'businessModel', 'startupStage', 'targetRegion', 'country']

const ICONS = {
  sparkles: <path d="M12 3l1.6 4.9L18.5 9.5 13.6 11 12 16l-1.6-5L5.5 9.5l4.9-1.6z M18 15l.7 2.1L21 18l-2.3.9L18 21l-.7-2.1L15 18l2.3-.9z" />,
  building: <path d="M3 21h18M6 21V5a2 2 0 012-2h8a2 2 0 012 2v16M9.5 7h5M9.5 11h5M9.5 15h5" />,
  pin: <><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0116 0z" /><circle cx="12" cy="10" r="2.5" /></>,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 010 18 15 15 0 010-18z" /></>,
  briefcase: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2" /></>,
  users: <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />,
  activity: <path d="M22 6l-8.5 8.5-4-4L2 18" />,
  dollar: <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />,
  user: <><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></>,
  flag: <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V4s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7" />,
  tag: <><path d="M20.6 13.4l-7.2 7.2a2 2 0 01-2.8 0L2 12V2h10l8.6 8.6a2 2 0 010 2.8z" /><circle cx="7" cy="7" r="1" /></>,
  message: <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />,
  search: <><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></>,
  check: <path d="M20 6L9 17l-5-5" />,
  close: <path d="M18 6L6 18M6 6l12 12" />,
  bolt: <path d="M13 2L4.5 13.5H11l-1 8.5L18.5 10.5H12l1-8.5z" />,
}

function Icon({ name, className = 'h-4 w-4' }) {
  const paths = ICONS[name]
  if (!paths) return null
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {paths}
    </svg>
  )
}

/** Custom searchable dropdown — Linear/Vercel-style combobox. */
function SearchableSelect({ value, options, placeholder, onChange, disabled, invalid }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open])

  const filtered = options.filter((o) => o.toLowerCase().includes(query.toLowerCase()))

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={`input-field flex items-center justify-between text-left ${invalid ? 'border-red-500/60 ring-2 ring-red-500/20' : ''} ${!value ? 'text-slate-400' : ''}`}
      >
        <span className="truncate">{value || placeholder}</span>
        <svg className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-white/10 bg-forge-surface/95 shadow-xl shadow-black/40 backdrop-blur-xl"
          >
            <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2">
              <Icon name="search" className="h-3.5 w-3.5 text-slate-500" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search…"
                className="w-full bg-transparent text-sm text-white placeholder-slate-500 outline-none"
              />
            </div>
            <div className="max-h-48 overflow-y-auto py-1">
              {filtered.length === 0 && (
                <p className="px-3 py-2 text-xs text-slate-500">No matches</p>
              )}
              {filtered.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => { onChange(opt); setOpen(false); setQuery('') }}
                  className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors hover:bg-white/5 ${value === opt ? 'text-forge-purple' : 'text-slate-200'}`}
                >
                  {opt}
                  {value === opt && <Icon name="check" className="h-3.5 w-3.5" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/** Segmented radio cards for short enums. */
function RadioCards({ value, options, meta, onChange, disabled, invalid }) {
  return (
    <div className={`grid gap-2 ${meta ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3'}`}>
      {options.map((opt) => {
        const active = value === opt
        return (
          <button
            key={opt}
            type="button"
            disabled={disabled}
            onClick={() => onChange(opt)}
            className={`rounded-xl border px-3 py-2.5 text-left transition-all ${
              active
                ? 'border-forge-purple/70 bg-forge-purple/15 shadow-[0_0_0_1px_rgba(139,92,246,0.4)]'
                : invalid
                  ? 'border-red-500/40 bg-white/[0.02] hover:border-white/20'
                  : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
            }`}
          >
            <span className={`block text-sm font-medium ${active ? 'text-white' : 'text-slate-300'}`}>{opt}</span>
            {meta?.[opt] && (
              <span className={`mt-0.5 block text-[11px] ${active ? 'text-forge-purple' : 'text-slate-500'}`}>{meta[opt]}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export default function FollowUpModal({ open, ideaText, onClose, onConfirm, loading }) {
  const [details, setDetails] = useState(getDefaultDetails())
  const [showAll, setShowAll] = useState(false)
  const [fieldsToShow, setFieldsToShow] = useState(BUSINESS_FIELDS)
  const [detectedKeys, setDetectedKeys] = useState(() => new Set())
  const [attempted, setAttempted] = useState(false)

  useEffect(() => {
    if (open && ideaText) {
      const auto = extractBusinessDetails(ideaText)
      const extracted = getDefaultDetails(auto)
      setDetails(extracted)
      setShowAll(false)
      setAttempted(false)
      setDetectedKeys(new Set(Object.keys(auto).filter((k) => auto[k]?.toString().trim())))

      // Decide which fields to render ONCE, right when the modal opens.
      // This must NOT be recalculated on every render, or a field
      // unmounts the instant its value becomes non-empty (i.e. while typing).
      const stillMissing = BUSINESS_FIELDS.filter(
        (f) => f.required && !extracted[f.key]?.toString().trim()
      )
      setFieldsToShow(
        stillMissing.length > 0 ? stillMissing : BUSINESS_FIELDS.filter((f) => f.required)
      )
    }
  }, [open, ideaText])

  const missing = getMissingFields(details)

  const handleChange = (key, value) => {
    setDetails((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const stillMissing = getMissingFields(details)
    if (stillMissing.length > 0) {
      setAttempted(true)
      setShowAll(true)
      return
    }
    onConfirm(details)
  }

  if (!open) return null

  const visibleFields = showAll ? BUSINESS_FIELDS : fieldsToShow
  const visibleKeys = new Set(visibleFields.map((f) => f.key))
  const detectedCount = SUMMARY_KEYS.filter((k) => detectedKeys.has(k) && details[k]).length
  const requiredTotal = BUSINESS_FIELDS.filter((f) => f.required).length
  const filledRequired = requiredTotal - missing.length

  const renderField = (field) => {
    const ui = FIELD_UI[field.key] || {}
    const widget = ui.widget || field.type || 'text'
    const val = details[field.key] || ''
    const isDetected = detectedKeys.has(field.key) && val
    const invalid = attempted && field.required && !val.toString().trim()
    const fullWidth = widget === 'textarea' || widget === 'cards'

    return (
      <div key={field.key} className={fullWidth ? 'sm:col-span-2' : ''}>
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <label className="flex items-center gap-1.5 text-sm font-medium text-slate-300">
            <Icon name={ui.icon} className="h-3.5 w-3.5 text-slate-500" />
            {ui.label || field.label}
            {field.required && <span className="text-forge-purple">*</span>}
          </label>
          {isDetected && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
              <span className="h-1 w-1 rounded-full bg-emerald-400" />
              auto
            </span>
          )}
        </div>

        {widget === 'search' ? (
          <SearchableSelect
            value={val}
            options={field.options || []}
            placeholder={ui.placeholder || 'Select…'}
            onChange={(v) => handleChange(field.key, v)}
            disabled={loading}
            invalid={invalid}
          />
        ) : widget === 'cards' ? (
          <RadioCards
            value={val}
            options={field.options || []}
            meta={ui.cardMeta}
            onChange={(v) => handleChange(field.key, v)}
            disabled={loading}
            invalid={invalid}
          />
        ) : widget === 'textarea' ? (
          <textarea
            value={val}
            onChange={(e) => handleChange(field.key, e.target.value)}
            placeholder={ui.placeholder || field.placeholder}
            rows={3}
            className={`input-field resize-none ${invalid ? 'border-red-500/60 ring-2 ring-red-500/20' : ''}`}
            disabled={loading}
          />
        ) : (
          <input
            type="text"
            value={val}
            onChange={(e) => handleChange(field.key, e.target.value)}
            placeholder={ui.placeholder || field.placeholder}
            className={`input-field ${invalid ? 'border-red-500/60 ring-2 ring-red-500/20' : ''}`}
            disabled={loading}
          />
        )}

        {ui.suggestions && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {ui.suggestions.map((s) => (
              <button
                key={s}
                type="button"
                disabled={loading}
                onClick={() => handleChange(field.key, s)}
                className={`rounded-full border px-2.5 py-1 text-[11px] transition-colors ${
                  val === s
                    ? 'border-forge-purple/60 bg-forge-purple/15 text-white'
                    : 'border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/25 hover:text-slate-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {ui.help && !invalid && (
          <p className="mt-1.5 text-[11px] text-slate-500">{ui.help}</p>
        )}
        {invalid && <p className="mt-1.5 text-[11px] text-red-400">Required to start analysis</p>}
      </div>
    )
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 24 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          onClick={(e) => e.stopPropagation()}
          className="glass-panel flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="relative shrink-0 border-b border-white/10 px-7 py-5">
            <div className="pointer-events-none absolute inset-0 bg-forge-radial opacity-60" />
            <div className="relative flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-forge-gradient shadow-lg shadow-purple-900/40">
                  <Icon name="sparkles" className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-forge-purple">
                    AI Onboarding
                  </p>
                  <h2 className="mt-0.5 text-xl font-bold tracking-tight text-white">
                    Complete your startup profile
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    The more context you give, the sharper your co-founders' analysis.
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Close"
              >
                <Icon name="close" className="h-4 w-4" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-7 py-5">
            {/* AI summary card */}
            <div className="relative mb-6 overflow-hidden rounded-2xl border border-forge-purple/25 bg-gradient-to-br from-forge-purple/[0.12] to-forge-blue/[0.06] p-4">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-forge-purple/20">
                  <Icon name="bolt" className="h-3.5 w-3.5 text-forge-purple" />
                </span>
                <p className="text-xs font-semibold text-white">AI read your pitch</p>
                <span className="ml-auto rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] text-slate-300">
                  {detectedCount > 0
                    ? `${detectedCount} detail${detectedCount > 1 ? 's' : ''} detected`
                    : 'Add a few details'}
                </span>
              </div>
              <p className="mt-2.5 text-sm leading-relaxed text-slate-300 line-clamp-3">
                “{ideaText}”
              </p>
              {detectedCount > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {SUMMARY_KEYS.filter((k) => detectedKeys.has(k) && details[k]).map((k) => (
                    <span
                      key={k}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[11px] text-slate-200"
                    >
                      <Icon name={FIELD_UI[k]?.icon} className="h-3 w-3 text-forge-purple" />
                      {details[k]}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Progress toward required fields */}
            <div className="mb-5 flex items-center gap-3">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full bg-forge-gradient"
                  initial={false}
                  animate={{ width: `${(filledRequired / requiredTotal) * 100}%` }}
                  transition={{ type: 'spring', stiffness: 200, damping: 30 }}
                />
              </div>
              <span className="shrink-0 text-[11px] font-medium text-slate-400">
                {filledRequired}/{requiredTotal} ready
              </span>
            </div>

            {/* Grouped fields */}
            <div className="space-y-6">
              {GROUPS.map((group) => {
                const groupFields = visibleFields.filter(
                  (f) => (FIELD_UI[f.key]?.group || 'extra') === group.id && visibleKeys.has(f.key)
                )
                if (groupFields.length === 0) return null
                return (
                  <div key={group.id}>
                    <div className="mb-3 flex items-center gap-2">
                      <Icon name={group.icon} className="h-3.5 w-3.5 text-forge-purple" />
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        {group.title}
                      </h3>
                      <div className="h-px flex-1 bg-white/[0.06]" />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {groupFields.map(renderField)}
                    </div>
                  </div>
                )
              })}
            </div>

            {!showAll && missing.length === 0 && (
              <button
                type="button"
                onClick={() => setShowAll(true)}
                className="mt-5 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition-colors hover:text-slate-300"
              >
                <span className="text-base leading-none">+</span> Add optional details
              </button>
            )}
          </form>

          {/* Footer */}
          <div className="flex shrink-0 items-center justify-between gap-3 border-t border-white/10 px-7 py-4">
            <p className="hidden text-xs text-slate-500 sm:block">
              {missing.length > 0
                ? `${missing.length} required field${missing.length > 1 ? 's' : ''} left`
                : 'All set — ready to launch'}
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl bg-forge-gradient px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-900/30 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
              >
                {loading ? (
                  <>
                    <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                      <Icon name="bolt" className="h-4 w-4" />
                    </motion.span>
                    Creating session…
                  </>
                ) : (
                  <>
                    Confirm &amp; Start Analysis
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
