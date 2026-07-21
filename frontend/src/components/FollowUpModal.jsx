import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BUSINESS_FIELDS, getDefaultDetails, getMissingFields, extractBusinessDetails } from '../utils/businessDetails'

export default function FollowUpModal({ open, ideaText, onClose, onConfirm, loading }) {
  const [details, setDetails] = useState(getDefaultDetails())
  const [showAll, setShowAll] = useState(false)
  const [fieldsToShow, setFieldsToShow] = useState(BUSINESS_FIELDS)

  useEffect(() => {
    if (open && ideaText) {
      const extracted = getDefaultDetails(extractBusinessDetails(ideaText))
      setDetails(extracted)
      setShowAll(false)

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
      setShowAll(true)
      return
    }
    onConfirm(details)
  }

  if (!open) return null

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
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="glass-panel max-h-[90vh] w-full max-w-2xl overflow-hidden"
        >
          <div className="border-b border-white/10 px-6 py-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-forge-purple">
                  Smart Follow-up
                </p>
                <h2 className="mt-1 text-xl font-bold text-white">
                  Complete your startup profile
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                  {missing.length > 0
                    ? `We pre-filled what we could. ${missing.length} field${missing.length > 1 ? 's' : ''} still needed.`
                    : 'All required fields detected — review and confirm.'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
              >
                ✕
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="overflow-y-auto px-6 py-5" style={{ maxHeight: 'calc(90vh - 180px)' }}>
            <div className="mb-4 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
              <p className="text-[10px] uppercase tracking-wider text-slate-500">Your idea</p>
              <p className="mt-1 text-sm text-slate-300 line-clamp-3">{ideaText}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {(showAll ? BUSINESS_FIELDS : fieldsToShow).map((field) => (
                <div key={field.key} className={field.type === 'textarea' ? 'sm:col-span-2' : ''}>
                  <label className="label-text">
                    {field.label}
                    {field.required && <span className="text-forge-purple"> *</span>}
                    {details[field.key] && (
                      <span className="ml-2 text-[10px] text-emerald-400">auto-detected</span>
                    )}
                  </label>
                  {field.type === 'select' ? (
                    <select
                      value={details[field.key] || ''}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      className="input-field"
                      disabled={loading}
                    >
                      <option value="">Select…</option>
                      {field.options.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      value={details[field.key] || ''}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      rows={3}
                      className="input-field resize-none"
                      disabled={loading}
                    />
                  ) : (
                    <input
                      type="text"
                      value={details[field.key] || ''}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="input-field"
                      disabled={loading}
                    />
                  )}
                </div>
              ))}
            </div>

            {!showAll && missing.length === 0 && (
              <button
                type="button"
                onClick={() => setShowAll(true)}
                className="mt-4 text-xs text-slate-500 hover:text-slate-300"
              >
                + Add optional details
              </button>
            )}
          </form>

          <div className="flex items-center justify-between gap-3 border-t border-white/10 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl px-4 py-2 text-sm text-slate-400 transition-colors hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-forge-gradient px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-900/30 transition-all hover:scale-[1.02] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>⚡</motion.span>
                  Creating session…
                </>
              ) : (
                <>Confirm & Start Analysis →</>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}