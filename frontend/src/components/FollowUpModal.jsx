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
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-landing-border bg-landing-card shadow-2xl"
        >
          <div className="border-b border-landing-border px-6 py-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-landing-accent">
                  Smart Follow-up
                </p>
                <h2 className="mt-1 text-xl font-bold text-landing-text">
                  Complete your startup profile
                </h2>
                <p className="mt-2 text-sm text-landing-muted">
                  {missing.length > 0
                    ? `We pre-filled what we could. ${missing.length} field${missing.length > 1 ? 's' : ''} still needed.`
                    : 'All required fields detected — review and confirm.'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-landing-muted transition-colors hover:bg-landing-bg hover:text-landing-text"
              >
                ✕
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="overflow-y-auto px-6 py-5" style={{ maxHeight: 'calc(90vh - 180px)' }}>
            <div className="mb-4 rounded-xl border border-landing-border bg-landing-bg px-4 py-3">
              <p className="text-[10px] uppercase tracking-wider text-landing-muted">Your idea</p>
              <p className="mt-1 text-sm text-landing-text line-clamp-3">{ideaText}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {(showAll ? BUSINESS_FIELDS : fieldsToShow).map((field) => (
                <div key={field.key} className={field.type === 'textarea' ? 'sm:col-span-2' : ''}>
                  <label className="label-text-light">
                    {field.label}
                    {field.required && <span className="text-landing-accent"> *</span>}
                    {details[field.key] && (
                      <span className="ml-2 text-[10px] text-emerald-600">auto-detected</span>
                    )}
                  </label>
                  {field.type === 'select' ? (
                    <select
                      value={details[field.key] || ''}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      className="input-field-light"
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
                      className="input-field-light resize-none"
                      disabled={loading}
                    />
                  ) : (
                    <input
                      type="text"
                      value={details[field.key] || ''}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="input-field-light"
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
                className="mt-4 text-xs font-medium text-landing-muted hover:text-landing-text"
              >
                + Add optional details
              </button>
            )}
          </form>

          <div className="flex items-center justify-between gap-3 border-t border-landing-border px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl px-4 py-2 text-sm font-medium text-landing-muted transition-colors hover:text-landing-text"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-landing-accent px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-landing-accent/20 transition-all hover:scale-[1.02] disabled:opacity-50"
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
