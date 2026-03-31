'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTranslation } from '@/hooks/useTranslation'
import { LanguageSwitcher } from './LanguageSwitcher'
import { ThemeToggle } from './ThemeToggle'
import { Button } from '@/components/ui/button'
import { MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export function Navbar() {
  const { t } = useTranslation()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className={cn(
        'fixed top-3 left-3 right-3 z-50 mx-auto max-w-6xl rounded-xl border px-4 md:px-5 py-2.5 transition-all duration-300',
        scrolled
          ? 'bg-card/95 backdrop-blur-xl shadow-md border-border'
          : 'bg-card/70 backdrop-blur-lg border-border/50'
      )}
    >
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 cursor-pointer">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <MessageSquare className="h-4 w-4" />
          </div>
          <span className="text-base font-bold font-heading">ReplyPro</span>
        </Link>
        <div className="flex items-center gap-1">
          {/* Hide language/theme/login on small screens to give CTA room */}
          <span className="hidden sm:flex items-center gap-1">
            <LanguageSwitcher />
            <ThemeToggle />
          </span>
          <Link href="/login" className="hidden sm:block">
            <Button variant="ghost" size="sm" className="cursor-pointer text-sm">{t('nav.login')}</Button>
          </Link>
          <Link href="/signup">
            <Button size="sm" className="cursor-pointer text-sm whitespace-nowrap">{t('landing.cta_primary')}</Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}
