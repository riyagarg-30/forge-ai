import { motion } from 'framer-motion'
import DashboardLayout from '../components/DashboardLayout'
import AnalyticsCard from '../components/AnalyticsCard'
import ChartPlaceholder from '../components/ChartPlaceholder'
import GlassCard from '../components/GlassCard'
import { useAuth } from '../context/AuthContext'

const stats = [
  { title: 'Total Revenue', value: '$48,290', change: '12.4%', positive: true, icon: '💰' },
  { title: 'Active Users', value: '3,842', change: '8.1%', positive: true, icon: '👥' },
  { title: 'Conversion Rate', value: '4.32%', change: '2.3%', positive: false, icon: '📈' },
  { title: 'Avg. Session', value: '6m 12s', change: '5.7%', positive: true, icon: '⏱' },
]

const activity = [
  { label: 'New user signed up', time: '2 minutes ago', color: 'bg-emerald-400' },
  { label: 'Payment received — $249.00', time: '18 minutes ago', color: 'bg-blue-400' },
  { label: 'Password reset requested', time: '1 hour ago', color: 'bg-amber-400' },
  { label: 'New team member invited', time: '3 hours ago', color: 'bg-violet-400' },
]

export default function Dashboard() {
  const { user } = useAuth()
  const firstName = (user?.user_metadata?.full_name || user?.email || '').split(' ')[0] || 'there'

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
        <h2 className="text-2xl font-bold text-white sm:text-3xl">
          Hey {firstName}, here&apos;s your overview
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Here&apos;s what&apos;s happening with your account today.
        </p>
      </motion.div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, i) => (
          <AnalyticsCard key={stat.title} {...stat} delay={i * 0.05} />
        ))}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ChartPlaceholder
            title="Revenue Overview"
            subtitle="Monthly recurring revenue trend"
            delay={0.2}
          />
        </div>
        <GlassCard delay={0.25}>
          <h3 className="mb-4 text-lg font-semibold text-white">Recent Activity</h3>
          <ul className="space-y-4">
            {activity.map((item) => (
              <li key={item.label} className="flex items-start gap-3">
                <span className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${item.color}`} />
                <div>
                  <p className="text-sm text-slate-200">{item.label}</p>
                  <p className="text-xs text-slate-500">{item.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartPlaceholder title="User Growth" subtitle="New signups over time" delay={0.3} />
        <ChartPlaceholder title="Engagement" subtitle="Daily active sessions" delay={0.35} />
      </div>
    </DashboardLayout>
  )
}
