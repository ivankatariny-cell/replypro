'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { useTranslation } from '@/hooks/useTranslation'
import { useSubscription } from '@/hooks/useSubscription'
import { useAppStore } from '@/store/app-store'
import { useToast } from '@/components/ui/toast'
import { PricingCard } from '@/components/billing/PricingCard'
import { RefreshCw, CreditCard } from 'lucide-react'

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
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('nav.billing')}</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your subscription and plan</p>
        </div>
        {subscription?.status !== 'active' && (
          <button
            onClick={handleSync}
            disabled={syncing}
            className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent disabled:opacity-50 transition-colors cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? t('billing.syncing') : t('billing.sync_btn')}
          </button>
        )}
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <PricingCard />
      </motion.div>
    </div>
  )
}
