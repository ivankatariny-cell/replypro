'use client'

import { useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { useSubscription } from '@/hooks/useSubscription'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Loader2, Crown, Infinity } from 'lucide-react'

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
    'Neograničene generacije',
    '3 tona odgovora (Professional, Friendly, Direct)',
    'Automatska detekcija jezika (HR/EN)',
    'Personalizirani potpis agenta',
    'Povijest svih generacija',
    'Prioritetna podrška',
  ]

  if (isActive) {
    return (
      <Card className="max-w-md mx-auto border-green-300">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <Crown className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-green-600">{t('billing.active_title')}</CardTitle>
          <p className="text-sm text-muted-foreground">29€/mjesec</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-950/20 p-3">
            <Infinity className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-700">Neograničene generacije aktivne</span>
          </div>
          <ul className="space-y-2">
            {proFeatures.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500" />
                {f}
              </li>
            ))}
          </ul>
          {subscription?.current_period_end && (
            <p className="text-xs text-muted-foreground text-center">
              {t('billing.next_billing')}: {new Date(subscription.current_period_end).toLocaleDateString()}
            </p>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-md mx-auto border-primary">
      <CardHeader>
        <CardTitle>{isCancelled ? t('billing.cancelled_title') : t('billing.upgrade_title')}</CardTitle>
        <p className="text-3xl font-bold text-primary">{t('billing.upgrade_price')}</p>
        {isTrial && subscription && (
          <p className="text-sm text-muted-foreground">
            {subscription.trial_generations_used}/10 {t('billing.trial_desc')}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-2">
          {proFeatures.map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-primary" />
              {f}
            </li>
          ))}
        </ul>
        <Button onClick={handleCheckout} className="w-full cursor-pointer" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isCancelled ? t('billing.resubscribe_btn') : t('billing.upgrade_btn')}
        </Button>
      </CardContent>
    </Card>
  )
}
