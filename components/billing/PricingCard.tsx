'use client'

import { useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { useSubscription } from '@/hooks/useSubscription'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Loader2 } from 'lucide-react'

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

  const features = [
    t('landing.pricing_feature_1'),
    t('landing.pricing_feature_2'),
    t('landing.pricing_feature_3'),
    t('landing.pricing_feature_4'),
  ]

  if (isActive) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-green-600">{t('billing.active_title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {subscription?.current_period_end && (
            <p className="text-sm text-muted-foreground">
              {t('billing.next_billing')}: {new Date(subscription.current_period_end).toLocaleDateString()}
            </p>
          )}
          <Button variant="destructive" className="cursor-pointer" onClick={handleCheckout}>
            {t('billing.cancel_btn')}
          </Button>
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
            {subscription.trial_generations_used} {t('billing.trial_desc')}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-2">
          {features.map((f) => (
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
