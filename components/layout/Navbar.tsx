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
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={cn(
      'fixed top-4 left-4 right-4 z-50 mx-auto max-w-7xl rounded-xl border px-4 md:px-6 py-3 transition-all duration-300',
      scrolled
        ? 'bg-card/90 backdrop-blur-lg shadow-lg border-border'
        : 'bg-card/60 backdrop-blur-md border-transparent'
    )}>
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 cursor-pointer">
          <MessageSquare className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold font-heading text-foreground">ReplyPro</span>
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          <Link href="/login">
            <Button variant="ghost" size="sm" className="cursor-pointer">{t('nav.login')}</Button>
          </Link>
          <Link href="/signup">
            <Button size="sm" className="cursor-pointer">{t('landing.cta_primary')}</Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}
