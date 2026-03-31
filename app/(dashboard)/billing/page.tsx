'use client'

import { useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { useSubscription } from '@/hooks/useSubscription'
import { useAppStore } from '@/store/app-store'
import { useToast } from '@/components/ui/toast'
import { PricingCard } from '@/components/billing/PricingCard'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'

export default function BillingPage() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const { subscription } = useSubscription()
  const setSubscription = useAppStore((s) => s.setSubscription)
  const [syncing, setSyncing] = useState(false)

  const handleSync = async () => {
    setSyncing(true)
    try {
      const res = await fetch('/api/stripe/sync', { method: 'POST' })
      const data = await res.json()
      if (data.status === 'active' && subscription) {
        setSubscription({ ...subscription, status: 'active' })
        toast(t('billing.pro_activated'), 'success')
      } else if (data.status === 'no_payment') {
        toast(t('billing.no_payment'), 'info')
      } else if (data.error) {
        toast(data.error, 'error')
      }
    } catch {
      toast(t('errors.generation_failed'), 'error')
    }
    setSyncing(false)
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">{t('nav.billing')}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your subscription</p>
        </div>
        {subscription?.status !== 'active' && (
          <Button variant="outline" size="sm" onClick={handleSync} disabled={syncing} className="cursor-pointer">
            <RefreshCw className={`h-4 w-4 mr-1.5 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? t('billing.syncing') : t('billing.sync_btn')}
          </Button>
        )}
      </div>

      <PricingCard />
    </div>
  )
}
