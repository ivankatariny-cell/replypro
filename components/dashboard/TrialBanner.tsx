'use client'

import Link from 'next/link'
import { useTranslation } from '@/hooks/useTranslation'
import { useSubscription } from '@/hooks/useSubscription'
import { Zap, Crown, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function TrialBanner() {
  const { t } = useTranslation()
  const { subscription } = useSubscription()

  if (!subscription) return null

  // Pro active — show success badge
  if (subscription.status === 'active') {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/20 px-4 py-3 flex items-center gap-3">
        <Crown className="h-5 w-5 text-green-600" />
        <div>
          <p className="text-sm font-semibold text-green-700 dark:text-green-400">Pro Plan</p>
          <p className="text-xs text-green-600/80">Neograničene generacije</p>
        </div>
      </div>
    )
  }

  // Cancelled or past_due
  if (subscription.status === 'cancelled' || subscription.status === 'past_due') {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <p className="text-sm font-medium text-destructive">
            {subscription.status === 'past_due' ? 'Problem s plaćanjem' : t('errors.trial_expired')}
          </p>
        </div>
        <Link href="/billing">
          <Button size="sm" className="cursor-pointer">{t('billing.upgrade_btn')}</Button>
        </Link>
      </div>
    )
  }

  // Trial
  const remaining = subscription.trial_generations_limit - subscription.trial_generations_used

  if (remaining <= 0) {
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
