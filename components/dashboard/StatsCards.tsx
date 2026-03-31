'use client'

import { useTranslation } from '@/hooks/useTranslation'
import { useGenerations } from '@/hooks/useGenerations'
import { useClients } from '@/hooks/useClients'
import { useSubscription } from '@/hooks/useSubscription'
import { Card, CardContent } from '@/components/ui/card'
import { MessageSquare, Users, Zap } from 'lucide-react'

export function StatsCards() {
  const { t } = useTranslation()
  const { generations } = useGenerations()
  const { clients } = useClients()
  const { subscription } = useSubscription()

  const remaining =
    subscription?.status === 'active'
      ? '\u221e'
      : subscription
      ? String(subscription.trial_generations_limit - subscription.trial_generations_used)
      : '-'

  const stats = [
    { label: t('stats.total_generated'), value: generations.length, icon: MessageSquare },
    { label: t('stats.active_clients'), value: clients.length, icon: Users },
    { label: t('dashboard.trial_remaining'), value: remaining, icon: Zap },
  ]

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xl font-bold leading-none">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1 truncate">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
