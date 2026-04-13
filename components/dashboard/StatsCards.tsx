'use client'

import { useTranslation } from '@/hooks/useTranslation'
import { useGenerations } from '@/hooks/useGenerations'
import { useClients } from '@/hooks/useClients'
import { useSubscription } from '@/hooks/useSubscription'
import { Skeleton } from '@/components/ui/skeleton'
import { motion } from 'motion/react'
import { MessageSquare, Users, Zap } from 'lucide-react'

export function StatsCards() {
  const { t } = useTranslation()
  const { generations, loading: genLoading } = useGenerations()
  const { clients, loading: clientsLoading } = useClients()
  const { subscription } = useSubscription()

  const remaining =
    subscription?.status === 'active'
      ? '∞'
      : subscription
      ? String(subscription.trial_generations_limit - subscription.trial_generations_used)
      : '-'

  const stats = [
    { label: t('stats.total_generated'), value: generations.length, loading: genLoading, icon: MessageSquare, color: 'text-primary', bg: 'bg-primary/10' },
    { label: t('stats.active_clients'), value: clients.length, loading: clientsLoading, icon: Users, color: 'text-info', bg: 'bg-info/10' },
    { label: subscription?.status === 'active' ? t('dashboard.unlimited') : t('dashboard.trial_remaining'), value: remaining, loading: false, icon: Zap, color: 'text-warning', bg: 'bg-warning/10' },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {stats.map((stat, i) => {
        const Icon = stat.icon
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -2, boxShadow: '0 8px 24px hsl(var(--primary)/0.08)' }}
            className="flex items-center gap-4 rounded-xl border bg-card px-4 py-4 transition-all duration-200 cursor-default"
          >
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 400 }}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${stat.bg}`}
            >
              <Icon className={`h-5 w-5 ${stat.color}`} />
            </motion.div>
            <div className="min-w-0">
              {stat.loading ? (
                <Skeleton className="h-7 w-12 mb-1" />
              ) : (
                <motion.p
                  key={String(stat.value)}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="text-2xl font-bold leading-none tabular-nums"
                >
                  {stat.value}
                </motion.p>
              )}
              <p className="text-xs text-muted-foreground mt-1 truncate">{stat.label}</p>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
