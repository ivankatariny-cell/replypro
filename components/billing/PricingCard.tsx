'use client'

import { useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { useSubscription } from '@/hooks/useSubscription'
import { Button } from '@/components/ui/button'
import { Check, Loader2, Crown, Infinity, Zap } from 'lucide-react'

export function PricingCard() {
  const { t } = useTranslation()
  const { subscription } = useSubscription()
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch {
      setLoading(false)
    }
  }

  const isTrial = subscription?.status === 'trial'
  const isActive = subscription?.status === 'active'
  const isCancelled = subscription?.status === 'cancelled'

  const proFeatures = [
    t('landing.pricing_feature_1'),
    t('landing.pricing_feature_2'),
    t('landing.pricing_feature_3'),
    t('landing.pricing_feature_4'),
    t('landing.pricing_feature_5'),
    t('landing.pricing_feature_6'),
  ]

  if (isActive) {
    return (
      <div className="max-w-md rounded-xl border border-green-200 dark:border-green-800/60 bg-card overflow-hidden">
        <div className="px-6 py-5 border-b bg-green-50 dark:bg-green-950/20">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/40">
              <Crown className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="font-semibold text-green-700 dark:text-green-400">{t('billing.active_title')}</p>
              <p className="text-xs text-green-600/80 dark:text-green-500">{t('billing.upgrade_price')}</p>
            </div>
          </div>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="flex items-center gap-2.5 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/40 px-3 py-2.5">
            <Infinity className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
            <span className="text-sm font-medium text-green-700 dark:text-green-400">{t('landing.pricing_pro_desc')}</span>
          </div>
          <ul className="space-y-2.5">
            {proFeatures.map((f) => (
              <li key={f} className="flex items-center gap-2.5 text-sm">
                <Check className="h-4 w-4 text-green-500 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          {subscription?.current_period_end && (
            <p className="text-xs text-muted-foreground pt-2 border-t">
              {t('billing.next_billing')}: {new Date(subscription.current_period_end).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md rounded-xl border border-primary/40 bg-card overflow-hidden">
      <div className="px-6 py-5 border-b bg-primary/5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold">{isCancelled ? t('billing.cancelled_title') : t('billing.upgrade_title')}</p>
            <p className="text-2xl font-bold text-primary leading-tight">{t('billing.upgrade_price')}</p>
          </div>
        </div>
        {isTrial && subscription && (
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary/60"
                style={{ width: `${(subscription.trial_generations_used / subscription.trial_generations_limit) * 100}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground shrink-0">
              {subscription.trial_generations_used}/{subscription.trial_generations_limit} {t('billing.trial_desc')}
            </p>
          </div>
        )}
      </div>
      <div className="px-6 py-5 space-y-4">
        <ul className="space-y-2.5">
          {proFeatures.map((f) => (
            <li key={f} className="flex items-center gap-2.5 text-sm">
              <Check className="h-4 w-4 text-primary shrink-0" />
              {f}
            </li>
          ))}
        </ul>
        <Button onClick={handleCheckout} className="w-full cursor-pointer" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isCancelled ? t('billing.resubscribe_btn') : t('billing.upgrade_btn')}
        </Button>
        <p className="text-xs text-muted-foreground text-center">{t('landing.guarantee')}</p>
      </div>
    </div>
  )
}
