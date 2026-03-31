'use client'

import { useTranslation } from '@/hooks/useTranslation'
import { useGenerations } from '@/hooks/useGenerations'
import { useClients } from '@/hooks/useClients'
import { useSubscription } from '@/hooks/useSubscription'
import { motion } from 'motion/react'
import { MessageSquare, Users, Zap, TrendingUp } from 'lucide-react'

export function StatsCards() {
  const { t } = useTranslation()
  const { generations } = useGenerations()
  const { clients } = useClients()
  const { subscription } = useSubscription()

  const remaining =
    subscription?.status === 'active'
      ? '∞'
      : subscription
      ? String(subscription.trial_generations_limit - subscription.trial_generations_used)
      : '-'

  const stats = [
    {
      label: t('stats.total_generated'),
      value: generations.length,
      icon: MessageSquare,
      iconClass: 'text-primary',
      bgClass: 'bg-primary/8',
      trend: null,
    },
    {
      label: t('stats.active_clients'),
      value: clients.length,
      icon: Users,
      iconClass: 'text-blue-500',
      bgClass: 'bg-blue-500/8',
      trend: null,
    },
    {
      label: t('dashboard.trial_remaining'),
      value: remaining,
      icon: Zap,
      iconClass: 'text-amber-500',
      bgClass: 'bg-amber-500/8',
      trend: null,
    },
  ]

  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.07 }}
            className="rounded-2xl border bg-card p-5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${stat.bgClass}`}>
                <Icon className={`h-4 w-4 ${stat.iconClass}`} />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums leading-none">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1.5 leading-snug">{stat.label}</p>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}