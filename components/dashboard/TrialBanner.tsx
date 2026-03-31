'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import { useTranslation } from '@/hooks/useTranslation'
import { useSubscription } from '@/hooks/useSubscription'
import { Zap, Crown, AlertTriangle } from 'lucide-react'

export function TrialBanner() {
  const { t } = useTranslation()
  const { subscription } = useSubscription()

  if (!subscription) return null

  if (subscription.status === 'active') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 rounded-2xl border border-green-200 dark:border-green-800/50 bg-green-50 dark:bg-green-950/20 px-4 py-3"
      >
        <Crown className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="text-sm font-semibold text-green-700 dark:text-green-400">Pro Plan</span>
          <span className="text-xs text-green-600/70 dark:text-green-500 ml-2">{t('dashboard.unlimited')}</span>
        </div>
      </motion.div>
    )
  }

  if (subscription.status === 'cancelled' || subscription.status === 'past_due') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-4 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3"
      >
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
          <p className="text-sm font-medium text-destructive">
            {subscription.status === 'past_due' ? t('billing.payment_issue') : t('errors.trial_expired')}
          </p>
        </div>
        <Link href="/billing" className="shrink-0 rounded-lg bg-destructive px-3 py-1.5 text-xs font-medium text-destructive-foreground hover:bg-destructive/90 transition-colors cursor-pointer">
          {t('billing.upgrade_btn')}
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
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-4 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3"
      >
        <p className="text-sm font-medium text-destructive">{t('errors.trial_expired')}</p>
        <Link href="/billing" className="shrink-0 rounded-lg bg-destructive px-3 py-1.5 text-xs font-medium text-destructive-foreground hover:bg-destructive/90 transition-colors cursor-pointer">
          {t('billing.upgrade_btn')}
        </Link>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border px-4 py-3 ${isLow ? 'border-amber-300 dark:border-amber-700/50 bg-amber-50 dark:bg-amber-950/20' : 'border-border bg-muted/30'}`}
    >
      <div className="flex items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-2">
          <Zap className={`h-3.5 w-3.5 shrink-0 ${isLow ? 'text-amber-600' : 'text-muted-foreground'}`} />
          <p className="text-xs text-muted-foreground">
            <span className={`font-bold ${isLow ? 'text-amber-600' : 'text-foreground'}`}>{remaining}</span>
            {' '}{t('dashboard.trial_remaining')}
          </p>
        </div>
        <Link href="/billing" className="text-xs font-medium text-primary hover:underline cursor-pointer">
          {t('dashboard.upgrade_prompt')} →
        </Link>
      </div>
      <div className="h-1 rounded-full bg-border overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className={`h-full rounded-full ${isLow ? 'bg-amber-500' : 'bg-primary'}`}
        />
      </div>
    </motion.div>
  )
}
