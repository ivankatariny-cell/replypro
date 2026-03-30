'use client'

import Link from 'next/link'
import { useTranslation } from '@/hooks/useTranslation'
import { useSubscription } from '@/hooks/useSubscription'
import { Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function TrialBanner() {
  const { t } = useTranslation()
  const { subscription } = useSubscription()

  if (!subscription || subscription.status === 'active') return null

  const remaining = subscription.trial_generations_limit - subscription.trial_generations_used

  if (subscription.status === 'cancelled' || remaining <= 0) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 flex items-center justify-between gap-4">
        <p className="text-sm font-medium text-destructive">{t('errors.trial_expired')}</p>
        <Link href="/billing">
          <Button size="sm" className="cursor-pointer">{t('billing.upgrade_btn')}</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <Zap className="h-4 w-4 text-primary" />
        <p className="text-sm font-medium">
          <span className="text-primary font-bold">{remaining}</span> {t('dashboard.trial_remaining')}
        </p>
      </div>
      <Link href="/billing">
        <Button variant="outline" size="sm" className="cursor-pointer">{t('dashboard.upgrade_prompt')}</Button>
      </Link>
    </div>
  )
}
