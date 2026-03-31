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
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 rounded-xl border border-green-200 dark:border-green-800/60 bg-green-50 dark:bg-green-950/20 px-4 py-3"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/40">
          <Crown className="h-4 w-4 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-green-700 dark:text-green-400">Pro Plan</p>
          <p className="text-xs text-green-600/80 dark:text-green-500">{t('dashboard.unlimited')}</p>
        </div>
      </motion.div>
    )
  }

  if (subscription.status === 'cancelled' || subscription.status === 'past_due') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-4 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3"
      >
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
          <p className="text-sm font-medium text-destructive">
            {subscription.status === 'past_due' ? t('billing.payment_issue') : t('errors.trial_expired')}
          </p>
        </div>
        <Link href="/billing">
          <Button size="sm" className="cursor-pointer shrink-0">{t('billing.upgrade_btn')}</Button>
        </Link>
      </motion.div>
    )
  }

  const remaining = subscription.trial_generations_limit - subscription.trial_generations_used
  const progress = (subscription.trial_generations_used / subscription.trial_generations_limit) * 100
  const isLow = remaining <= 3

  if (remaining <= 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-4 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3"
      >
        <p className="text-sm font-medium text-destructive">{t('errors.trial_expired')}</p>
        <Link href="/billing">
          <Button size="sm" className="cursor-pointer shrink-0">{t('billing.upgrade_btn')}</Button>
        </Link>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border px-4 py-3 ${
        isLow
          ? 'border-amber-300 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-950/20'
          : 'border-primary/20 bg-primary/5'
      }`}
    >
      <div className="flex items-center justify-between gap-4 mb-2.5">
        <div className="flex items-center gap-2">
          <Zap className={`h-4 w-4 shrink-0 ${isLow ? 'text-amber-600' : 'text-primary'}`} />
          <p className="text-sm">
            <span className={`font-bold ${isLow ? 'text-amber-600' : 'text-primary'}`}>{remaining}</span>
            <span className="text-muted-foreground ml-1">{t('dashboard.trial_remaining')}</span>
          </p>
        </div>
        <Link href="/billing">
          <Button variant="outline" size="sm" className="cursor-pointer text-xs h-7 shrink-0">
            {t('dashboard.upgrade_prompt')}
          </Button>
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
