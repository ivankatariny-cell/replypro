'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'

const DASHBOARD_ROUTES = [
  '/dashboard',
  '/settings',
  '/billing',
  '/history',
  '/clients',
  '/properties',
  '/favorites',
  '/onboarding',
]

const CONSENT_KEY = 'rp-cookie-consent'

export function CookieBanner() {
  const [visible, setVisible] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const { t, language } = useTranslation()

  useEffect(() => {
    setMounted(true)
    const isDashboard = DASHBOARD_ROUTES.some((r) => pathname?.startsWith(r))
    if (isDashboard) return
    const consented =
      typeof window !== 'undefined' && localStorage.getItem(CONSENT_KEY)
    if (!consented) setVisible(true)
  }, [pathname])

  const accept = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(CONSENT_KEY, '1')
    }
    setVisible(false)
  }

  if (!mounted || !visible) return null

  const learnMoreHref = language === 'hr' ? '/privatnost#kolacici' : '/privacy#cookies'

  return (
    <div
      className="cookie-banner fixed bottom-0 left-0 right-0 z-50 border-t bg-card shadow-lg"
      role="region"
      aria-label="Cookie notice"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <p className="text-sm text-muted-foreground">
          {t('cookie.message')}
        </p>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
          <Link
            href={learnMoreHref}
            className="inline-flex items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent cursor-pointer"
          >
            {t('cookie.learn_more')}
          </Link>
          <button
            onClick={accept}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 cursor-pointer"
          >
            {t('cookie.accept')}
          </button>
        </div>
      </div>
    </div>
  )
}
