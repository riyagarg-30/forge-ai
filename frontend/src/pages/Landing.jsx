import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { AGENT_PIPELINE } from '../constants/agents'
import FloatingBadgeField from '../components/FloatingBadgeField'

const THEME_KEY = 'forge-landing-theme'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
}

const NAV_LINKS = [
  { href: '#agents', label: 'Agents' },
  { href: '#workflow', label: 'How it Works' },
  { href: '#build-studio', label: 'Build Studio' },
]

export default function Landing() {
  const { user } = useAuth()
  const [dark, setDark] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem(THEME_KEY) === 'dark'
  })

  useEffect(() => {
    localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light')
  }, [dark])

  return (
    <div
      className={`${dark ? 'dark' : ''} font-landing min-h-screen bg-landing-bg text-landing-text transition-colors duration-300 dark:bg-slate-950 dark:text-slate-50`}
    >
      <NavBar user={user} dark={dark} onToggleDark={() => setDark((d) => !d)} />
      <Hero user={user} />
      <FeatureHighlights />
      <AgentWorkflow />
      <BuildStudioPreview />
      <FinalCta user={user} />
      <Footer />
    </div>
  )
}

function Logo({ small = false }) {
  return (
    <Link to="/" className="flex items-center gap-2" aria-label="Forge AI — back to home">
      <span
        className={`flex items-center justify-center rounded-lg bg-landing-accent font-bold text-white ${
          small ? 'h-6 w-6 text-[11px]' : 'h-8 w-8 text-sm'
        }`}
      >
        F
      </span>
      <span className="text-lg font-semibold tracking-tight">Forge AI</span>
    </Link>
  )
}

function ThemeToggle({ dark, onToggle }) {
  return (
    <motion.button
      onClick={onToggle}
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.05 }}
      aria-label="Toggle dark mode"
      className="flex h-9 w-9 items-center justify-center rounded-full border border-landing-border bg-landing-card text-sm transition-colors dark:border-slate-800 dark:bg-slate-900"
    >
      <motion.span
        key={dark ? 'moon' : 'sun'}
        initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
        animate={{ opacity: 1, rotate: 0, scale: 1 }}
        transition={{ duration: 0.25 }}
      >
        {dark ? '🌙' : '☀️'}
      </motion.span>
    </motion.button>
  )
}

function NavBar({ user, dark, onToggleDark }) {
  return (
    <header className="sticky top-0 z-50 border-b border-landing-border/80 bg-landing-bg/80 backdrop-blur-md transition-colors duration-300 dark:border-slate-800/80 dark:bg-slate-950/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Logo />

        <nav className="hidden items-center gap-8 text-sm font-medium text-landing-muted sm:flex dark:text-slate-400">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="group relative py-1 transition-colors hover:text-landing-text dark:hover:text-white"
            >
              {link.label}
              <span className="absolute inset-x-0 -bottom-0.5 h-0.5 origin-left scale-x-0 bg-landing-accent transition-transform duration-200 group-hover:scale-x-100" />
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle dark={dark} onToggle={onToggleDark} />
          {user ? (
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/dashboard"
                className="rounded-full bg-landing-text px-4 py-2 text-sm font-semibold text-white transition-colors dark:bg-white dark:text-slate-900"
              >
                Go to Dashboard
              </Link>
            </motion.div>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-landing-muted hover:text-landing-text dark:text-slate-400 dark:hover:text-white">
                Log in
              </Link>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  to="/signup"
                  className="rounded-full bg-landing-text px-4 py-2 text-sm font-semibold text-white transition-colors dark:bg-white dark:text-slate-900"
                >
                  Get Started
                </Link>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

function BackgroundBlobs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-landing-accent/[0.08] blur-3xl animate-float dark:bg-landing-accent/[0.15]" />
      <div
        className="absolute right-0 top-20 h-80 w-80 rounded-full bg-blue-400/[0.08] blur-3xl animate-float dark:bg-blue-500/[0.12]"
        style={{ animationDelay: '1.5s' }}
      />
      <div
        className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-landing-accent/[0.06] blur-3xl animate-float dark:bg-landing-accent/[0.1]"
        style={{ animationDelay: '3s' }}
      />
    </div>
  )
}

function Hero({ user }) {
  return (
    <section className="relative overflow-hidden px-6 pb-28 pt-20 sm:pt-28">
      <BackgroundBlobs />

      <FloatingBadgeField className="hidden lg:block" />

      <motion.div
        className="relative mx-auto max-w-3xl text-center"
        initial="hidden"
        animate="show"
        variants={fadeUp}
        transition={{ duration: 0.6 }}
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-landing-border bg-landing-card px-4 py-1.5 text-xs font-medium text-landing-muted dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          <span className="h-1.5 w-1.5 rounded-full bg-landing-accent" /> AI co-founders for your next idea
        </span>

        <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-6xl">
          Validate your startup idea with{' '}
          <span className="text-landing-accent">AI co-founders</span>.
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-lg text-landing-muted dark:text-slate-400">
          Submit an idea. Seven specialized AI agents research, size the market, model the finances, debate the
          risks, and hand you an investor-ready Build / Pivot / Reject verdict — in minutes.
        </p>

        <div className="mt-10 flex items-center justify-center gap-4">
          <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}>
            <Link
              to={user ? '/dashboard' : '/signup'}
              className="rounded-full bg-landing-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-landing-accent/30"
            >
              {user ? 'Go to Dashboard' : 'Start Validating — Free'}
            </Link>
          </motion.div>
          {!user && (
            <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/login"
                className="rounded-full border border-landing-border bg-landing-card px-6 py-3 text-sm font-semibold text-landing-text dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
              >
                Log in
              </Link>
            </motion.div>
          )}
        </div>
      </motion.div>
    </section>
  )
}

function FeatureHighlights() {
  return (
    <section id="agents" className="border-t border-landing-border bg-landing-card px-6 py-24 transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Meet the team"
          title="Seven AI co-founders, one intelligence report."
          description="Each agent specializes in one lens on your idea — together they produce a single, evidence-based verdict."
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {AGENT_PIPELINE.map((agent, i) => (
            <motion.div
              key={agent.key}
              className="rounded-2xl border border-landing-border bg-landing-bg p-6 shadow-sm transition-colors duration-300 dark:border-slate-800 dark:bg-slate-950"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-80px' }}
              variants={fadeUp}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-landing-accent/10 text-xl">
                {agent.icon}
              </span>
              <h3 className="mt-4 text-base font-semibold">{agent.name}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-landing-muted dark:text-slate-400">{agent.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function AgentWorkflow() {
  const steps = [
    { title: 'Submit your idea', description: 'One idea description and a few business details.' },
    { title: 'Agents analyze in parallel', description: 'Research, Market, Finance, Product, and Legal run simultaneously.' },
    { title: 'Investment committee debates', description: 'Seven personas stress-test the findings and surface real conflicts.' },
    { title: 'CEO issues a verdict', description: 'Build, Pivot, Delay, or Reject — backed by cited evidence.' },
  ]

  return (
    <section id="workflow" className="px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <SectionHeading
          eyebrow="How it works"
          title="From idea to verdict, fully automated."
          description="Every step is traceable back to the evidence that produced it."
        />

        <div className="relative mt-14">
          <div className="absolute left-0 right-0 top-[18px] hidden h-px bg-landing-border lg:block dark:bg-slate-800" />
          <motion.div
            className="absolute left-0 top-[18px] hidden h-px bg-landing-accent lg:block"
            initial={{ width: '0%' }}
            whileInView={{ width: '100%' }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 1.2, ease: 'easeInOut', delay: 0.2 }}
          />

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-80px' }}
                variants={fadeUp}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="relative"
              >
                <motion.div
                  initial={{ scale: 0.6 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15, delay: i * 0.12 + 0.1 }}
                  className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full bg-landing-accent text-sm font-semibold text-white shadow-md shadow-landing-accent/30"
                >
                  {i + 1}
                </motion.div>
                <h3 className="mt-4 text-sm font-semibold">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-landing-muted dark:text-slate-400">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function BuildStudioPreview() {
  const assets = [
    { label: 'Engineering Concept Sheet', icon: '📐' },
    { label: 'Tech Stack', icon: '🧩' },
    { label: 'API Structure', icon: '🔌' },
    { label: 'Development Roadmap', icon: '🗺️' },
  ]

  return (
    <section id="build-studio" className="border-t border-landing-border bg-landing-card px-6 py-24 transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} variants={fadeUp} transition={{ duration: 0.5 }}>
          <span className="inline-flex items-center gap-2 rounded-full border border-landing-border bg-landing-bg px-4 py-1.5 text-xs font-medium text-landing-muted dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
            🏗️ Build Studio
          </span>
          <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
            Unlocks automatically the moment your idea gets a &ldquo;Build&rdquo; verdict.
          </h2>
          <p className="mt-4 text-landing-muted dark:text-slate-400">
            No extra step, no separate request. Once the CEO Agent recommends building, Build Studio generates a
            full engineering concept sheet, tech stack, API structure, and development roadmap — grounded in
            everything the other agents already found.
          </p>
          <motion.div className="mt-8 inline-block" whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}>
            <Link
              to="/signup"
              className="inline-flex rounded-full bg-landing-text px-6 py-3 text-sm font-semibold text-white transition-colors dark:bg-white dark:text-slate-900"
            >
              See it for your idea
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          variants={fadeUp}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="rounded-2xl border border-landing-border bg-landing-bg p-6 shadow-sm transition-colors duration-300 dark:border-slate-800 dark:bg-slate-950"
        >
          <div className="flex items-center justify-between border-b border-landing-border pb-3 dark:border-slate-800">
            <p className="text-xs font-semibold uppercase tracking-wider text-landing-muted dark:text-slate-400">Build Studio</p>
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
              Completed
            </span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {assets.map((asset, i) => (
              <motion.div
                key={asset.label}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -3 }}
                transition={{ delay: i * 0.08 }}
                className="rounded-xl border border-landing-border bg-landing-card p-4 transition-colors dark:border-slate-800 dark:bg-slate-900"
              >
                <span className="text-lg">{asset.icon}</span>
                <p className="mt-2 text-sm font-medium">{asset.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function FinalCta({ user }) {
  return (
    <section className="px-6 py-24">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-80px' }}
        variants={fadeUp}
        transition={{ duration: 0.5 }}
        className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl border border-landing-border bg-landing-card p-12 text-center shadow-sm transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-landing-accent/[0.08] blur-3xl animate-float dark:bg-landing-accent/[0.15]" />
        <h2 className="relative text-3xl font-bold tracking-tight sm:text-4xl">Ready to validate your next idea?</h2>
        <p className="relative mx-auto mt-4 max-w-lg text-landing-muted dark:text-slate-400">
          Get a full investment-committee-grade analysis before you write a single line of code.
        </p>
        <div className="relative mt-8 flex items-center justify-center gap-4">
          <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}>
            <Link
              to={user ? '/dashboard' : '/signup'}
              className="rounded-full bg-landing-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-landing-accent/30"
            >
              {user ? 'Go to Dashboard' : 'Start Validating — Free'}
            </Link>
          </motion.div>
          {!user && (
            <Link to="/login" className="text-sm font-semibold text-landing-muted hover:text-landing-text dark:text-slate-400 dark:hover:text-white">
              Log in →
            </Link>
          )}
        </div>
      </motion.div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-landing-border px-6 py-10 transition-colors duration-300 dark:border-slate-800">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-landing-muted sm:flex-row dark:text-slate-400">
        <Logo small />
        <p>© {new Date().getFullYear()} Forge AI. All rights reserved.</p>
      </div>
    </footer>
  )
}

function SectionHeading({ eyebrow, title, description }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-80px' }}
      variants={fadeUp}
      transition={{ duration: 0.5 }}
      className="mx-auto max-w-2xl text-center"
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-landing-accent">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
      <p className="mt-4 text-landing-muted dark:text-slate-400">{description}</p>
    </motion.div>
  )
}
