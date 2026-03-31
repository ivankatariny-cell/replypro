'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import { useTranslation } from '@/hooks/useTranslation'
import { useSubscription } from '@/hooks/useSubscription'
import { Zap, Crown, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function TrialBanner() {
  const { t } = useTranslation()
  const { subscription } = useSubscription()

  if (!subscription) return null

  if (subscription.status === 'active') {
    return (
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-green-200 dark:border-green-800 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 px-4 py-3 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/40">
          <Crown className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-green-700 dark:text-green-400">Pro Plan</p>
          <p className="text-xs text-green-600/80 dark:text-green-500/80">{t('dashboard.unlimited')}</p>
        </div>
      </motion.div>
    )
  }

  if (subscription.status === 'cancelled' || subscription.status === 'past_due') {
    return (
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <p className="text-sm font-medium text-destructive">
            {subscription.status === 'past_due' ? t('billing.payment_issue') : t('errors.trial_expired')}
          </p>
        </div>
        <Link href="/billing">
          <Button size="sm" className="cursor-pointer">{t('billing.upgrade_btn')}</Button>
        </Link>
      </motion.div>
    )
  }

  const remaining = subscription.trial_generations_limit - subscription.trial_generations_used
  const progress = (subscription.trial_generations_used / subscription.trial_generations_limit) * 100
  const isLow = remaining <= 3

  if (remaining <= 0) {
    return (
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 flex items-center justify-between gap-4">
        <p className="text-sm font-medium text-destructive">{t('errors.trial_expired')}</p>
        <Link href="/billing">
          <Button size="sm" className="cursor-pointer">{t('billing.upgrade_btn')}</Button>
        </Link>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className={`rounded-xl border px-4 py-3 ${isLow ? 'border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/20' : 'border-primary/20 bg-primary/5'}`}>
      <div className="flex items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-2">
          <Zap className={`h-4 w-4 ${isLow ? 'text-amber-600' : 'text-primary'}`} />
          <p className="text-sm font-medium">
            <span className={`font-bold ${isLow ? 'text-amber-600' : 'text-primary'}`}>{remaining}</span> {t('dashboard.trial_remaining')}
          </p>
        </div>
        <Link href="/billing">
          <Button variant="outline" size="sm" className="cursor-pointer text-xs">{t('dashboard.upgrade_prompt')}</Button>
        </Link>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${isLow ? 'bg-amber-500' : 'bg-primary'}`}
        />
      </div>
    </motion.div>
  )
}
