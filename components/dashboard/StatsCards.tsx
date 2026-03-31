'use client'

import { useTranslation } from '@/hooks/useTranslation'
import { useGenerations } from '@/hooks/useGenerations'
import { useClients } from '@/hooks/useClients'
import { useSubscription } from '@/hooks/useSubscription'
import { MessageSquare, Users, Zap } from 'lucide-react'

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
    { label: t('stats.total_generated'), value: generations.length, icon: MessageSquare, accent: 'bg-primary/10 text-primary' },
    { label: t('stats.active_clients'), value: clients.length, icon: Users, accent: 'bg-blue-500/10 text-blue-500' },
    { label: t('dashboard.trial_remaining'), value: remaining, icon: Zap, accent: 'bg-amber-500/10 text-amber-500' },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <div key={stat.label} className="rounded-xl border bg-card p-4 flex items-center gap-3.5">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${stat.accent.split(' ')[0]}`}>
              <Icon className={`h-[18px] w-[18px] ${stat.accent.split(' ')[1]}`} />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold tabular-nums leading-none tracking-tight">{stat.value}</p>
              <p className="text-[11px] text-muted-foreground mt-1 truncate">{stat.label}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}