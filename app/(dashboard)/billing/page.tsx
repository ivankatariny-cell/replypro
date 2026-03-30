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
        toast('Pro plan aktiviran!', 'success')
      } else if (data.status === 'no_payment') {
        toast('Nema pronađenog plaćanja', 'info')
      } else if (data.error) {
        toast(data.error, 'error')
      }
    } catch {
      toast('Sync nije uspio', 'error')
    }
    setSyncing(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold">{t('nav.billing')}</h1>
        {subscription?.status !== 'active' && (
          <Button variant="ghost" size="sm" onClick={handleSync} disabled={syncing} className="cursor-pointer">
            <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Sinkronizacija...' : 'Već ste platili?'}
          </Button>
        )}
      </div>
      <PricingCard />
    </div>
  )
}
