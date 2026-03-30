'use client'

import { useTranslation } from '@/hooks/useTranslation'
import { PricingCard } from '@/components/billing/PricingCard'

export default function BillingPage() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-heading font-bold">{t('nav.billing')}</h1>
      <PricingCard />
    </div>
  )
}
