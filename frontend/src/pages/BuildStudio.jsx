import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  useActiveCode,
} from '@codesandbox/sandpack-react'
import WorkspaceLayout from '../components/WorkspaceLayout'
import GlassCard from '../components/GlassCard'
import { api } from '../lib/api'

/** Maps a { files, entryFile, dependencies } project from the backend into Sandpack's file map. */
function buildSandpackFiles(project) {
  const files = {}

  for (const [name, content] of Object.entries(project.files)) {
    files[name.startsWith('/') ? name : `/${name}`] = content
  }

  return files
}

const TEMPLATE_CATEGORIES = [
  {
    key: 'ui_ux',
    title: 'UI/UX',
    icon: '🎨',
    description: 'Screen-level interface design for a specific flow or feature.',
    placeholderImage: 'https://placehold.co/600x400/1e1b2e/a78bfa?text=UI%2FUX+Template',
  },
  {
    key: 'dashboard',
    title: 'Dashboard',
    icon: '📊',
    description: 'Data-driven admin or analytics dashboard layout.',
    placeholderImage: 'https://placehold.co/600x400/1e1b2e/60a5fa?text=Dashboard+Template',
  },
  {
    key: 'mobile_app',
    title: 'Mobile App',
    icon: '📱',
    description: 'Native or cross-platform mobile app screens.',
    placeholderImage: 'https://placehold.co/600x400/1e1b2e/34d399?text=Mobile+App+Template',
  },
  {
    key: 'landing_page',
    title: 'Landing Page',
    icon: '🌐',
    description: 'Marketing landing page for the product or launch.',
    placeholderImage: 'https://placehold.co/600x400/1e1b2e/f472b6?text=Landing+Page+Template',
  },
]

const FORM_FIELDS = {
  ui_ux: [
    { name: 'screenName', label: 'Screen / Flow Name', type: 'text', placeholder: 'e.g. Onboarding' },
    { name: 'style', label: 'Visual Style', type: 'select', options: ['Minimal', 'Playful', 'Corporate', 'Dark Glassmorphism'] },
    { name: 'primaryColor', label: 'Primary Color', type: 'text', placeholder: 'e.g. #7C3AED' },
    { name: 'screenCount', label: 'Number of Screens', type: 'number', placeholder: 'e.g. 3' },
  ],
  dashboard: [
    { name: 'dashboardName', label: 'Dashboard Name', type: 'text', placeholder: 'e.g. Sales Overview' },
    { name: 'dataSource', label: 'Primary Data Source', type: 'text', placeholder: 'e.g. Stripe, Postgres' },
    { name: 'chartTypes', label: 'Chart Types', type: 'select', options: ['Line', 'Bar', 'Pie', 'Mixed'] },
    { name: 'widgets', label: 'Key Widgets', type: 'textarea', placeholder: 'e.g. Revenue, Active Users, Churn' },
  ],
  mobile_app: [
    { name: 'appName', label: 'App Name', type: 'text', placeholder: 'e.g. Forge Mobile' },
    { name: 'platform', label: 'Platform', type: 'select', options: ['iOS', 'Android', 'Both'] },
    { name: 'navigationStyle', label: 'Navigation Style', type: 'select', options: ['Tab Bar', 'Drawer', 'Stack'] },
    { name: 'screens', label: 'Screens to Include', type: 'textarea', placeholder: 'e.g. Home, Profile, Settings' },
  ],
  landing_page: [
    { name: 'pageTitle', label: 'Page Title', type: 'text', placeholder: 'e.g. Forge AI' },
    { name: 'heroHeadline', label: 'Hero Headline', type: 'text', placeholder: 'e.g. Validate your startup idea in minutes' },
    { name: 'ctaText', label: 'Call-to-Action Text', type: 'text', placeholder: 'e.g. Get Started' },
    { name: 'sections', label: 'Sections to Include', type: 'textarea', placeholder: 'e.g. Features, Pricing, Testimonials' },
  ],
}

export default function BuildStudio() {
  const { sessionId } = useParams()
  const [studio, setStudio] = useState(null)
  const [error, setError] = useState('')
  const [activeTemplate, setActiveTemplate] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState('')
  const [project, setProject] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const data = await api.getBuildStudio(sessionId)
        if (!cancelled) setStudio(data)
      } catch (err) {
        if (!cancelled) setError(err.message)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [sessionId])

  async function handleTemplateSubmit(values) {
    const template = activeTemplate
    setActiveTemplate(null)
    setGenError('')
    setGenerating(true)
    try {
      const result = await api.generateTemplateProject(sessionId, template.key, values)
      setProject(result)
    } catch (err) {
      setGenError(err.message)
    } finally {
      setGenerating(false)
    }
  }

  if (error) {
    return (
      <WorkspaceLayout title="Build Studio">
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
          <p className="text-rose-400">{error}</p>
          <Link to={`/analysis/${sessionId}/report`} className="text-sm text-forge-purple hover:underline">
            ← Back to report
          </Link>
        </div>
      </WorkspaceLayout>
    )
  }

  if (!studio) {
    return (
      <WorkspaceLayout title="Build Studio">
        <div className="flex min-h-[60vh] items-center justify-center">
          <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-sm text-slate-400">
            Loading Build Studio…
          </motion.div>
        </div>
      </WorkspaceLayout>
    )
  }

  if (!studio.startupType) {
    return (
      <WorkspaceLayout title="Build Studio">
        <div className="mx-auto max-w-2xl px-4 py-16 text-center">
          <p className="text-slate-300">
            Build Studio unlocks automatically once the CEO Agent issues a &ldquo;Build&rdquo; verdict.
          </p>
          <Link to={`/analysis/${sessionId}/report`} className="mt-4 inline-block text-sm text-forge-purple hover:underline">
            ← Back to report
          </Link>
        </div>
      </WorkspaceLayout>
    )
  }

  return (
    <WorkspaceLayout title="Build Studio">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
        <Link to={`/analysis/${sessionId}/report`} className="mb-3 inline-flex items-center gap-1 text-xs text-slate-500 hover:text-white">
          ← Back to report
        </Link>

        <div className="mb-8">
          <h1 className="flex items-center gap-2 text-2xl font-bold text-white sm:text-3xl">
            🏗️ Build Studio
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Pick a template to start configuring it. Fill in the parameters, then generation will pick up from there.
          </p>
        </div>

        {genError && (
          <div className="mb-6 rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-sm text-rose-300">
            {genError}
          </div>
        )}

        {generating && (
          <div className="mb-6 rounded-xl border border-blue-500/20 bg-blue-500/5 px-4 py-3 text-sm text-blue-300">
            Generating your project — this can take a moment on a local model.
          </div>
        )}

        {project ? (
          <GeneratedProjectView project={project} onBack={() => setProject(null)} />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {TEMPLATE_CATEGORIES.map((template) => (
              <TemplateCard key={template.key} template={template} onClick={() => setActiveTemplate(template)} />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {activeTemplate && (
          <TemplateFormModal
            template={activeTemplate}
            onClose={() => setActiveTemplate(null)}
            onSubmit={handleTemplateSubmit}
          />
        )}
      </AnimatePresence>
    </WorkspaceLayout>
  )
}

function TemplateCard({ template, onClick }) {
  return (
    <button type="button" onClick={onClick} className="text-left">
      <GlassCard className="transition-transform hover:scale-[1.01]">
        <img
          src={template.placeholderImage}
          alt={template.title}
          className="mb-4 w-full rounded-xl border border-white/[0.06] object-cover"
        />
        <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
          <span>{template.icon}</span> {template.title}
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-slate-400">{template.description}</p>
      </GlassCard>
    </button>
  )
}

function GeneratedProjectView({ project, onBack }) {
  const files = buildSandpackFiles(project)
  const activeFile = `/${project.entryFile}`

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-1 text-xs text-slate-500 hover:text-white"
      >
        ← Back to templates
      </button>

      <SandpackProvider
        template="vite-react"
        files={files}
        theme="dark"
        customSetup={{ dependencies: project.dependencies || {} }}
        options={{ activeFile }}
      >
        <SandpackLayout>
          <div className="flex w-1/2 flex-col">
            <EditorToolbar activeFile={activeFile} />
            <SandpackCodeEditor showLineNumbers style={{ height: 520 }} />
          </div>
          <SandpackPreview style={{ height: 520 }} showOpenInCodeSandbox={false} />
        </SandpackLayout>
      </SandpackProvider>
    </div>
  )
}

function EditorToolbar({ activeFile }) {
  const { code } = useActiveCode()

  function handleCopy() {
    navigator.clipboard.writeText(code)
  }

  function handleDownload() {
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = activeFile.split('/').pop() || 'App.jsx'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex items-center justify-end gap-2 border-b border-white/10 bg-white/[0.02] px-3 py-2">
      <button
        type="button"
        onClick={handleCopy}
        className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-medium text-slate-300 hover:text-white"
      >
        Copy
      </button>
      <button
        type="button"
        onClick={handleDownload}
        className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-medium text-slate-300 hover:text-white"
      >
        Download
      </button>
    </div>
  )
}

function TemplateFormModal({ template, onClose, onSubmit }) {
  const fields = FORM_FIELDS[template.key] || []
  const [values, setValues] = useState({})

  function handleChange(name, value) {
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit(values)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg"
      >
        <GlassCard>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-base font-semibold text-white">
              <span>{template.icon}</span> {template.title} Parameters
            </h3>
            <button type="button" onClick={onClose} className="text-slate-500 hover:text-white">
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map((field) => (
              <FormField key={field.name} field={field} value={values[field.name] || ''} onChange={handleChange} />
            ))}

            <button
              type="submit"
              className="w-full rounded-xl bg-forge-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-900/30 transition-transform hover:scale-[1.02]"
            >
              Save Configuration
            </button>
          </form>
        </GlassCard>
      </motion.div>
    </motion.div>
  )
}

function FormField({ field, value, onChange }) {
  const baseClass =
    'w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-forge-purple/50 focus:outline-none'

  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-slate-400">{field.label}</label>
      {field.type === 'select' && (
        <select className={baseClass} value={value} onChange={(e) => onChange(field.name, e.target.value)}>
          <option value="" disabled>
            Select…
          </option>
          {field.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      )}
      {field.type === 'textarea' && (
        <textarea
          className={`${baseClass} min-h-[80px] resize-none`}
          placeholder={field.placeholder}
          value={value}
          onChange={(e) => onChange(field.name, e.target.value)}
        />
      )}
      {(field.type === 'text' || field.type === 'number') && (
        <input
          type={field.type}
          className={baseClass}
          placeholder={field.placeholder}
          value={value}
          onChange={(e) => onChange(field.name, e.target.value)}
        />
      )}
    </div>
  )
}
