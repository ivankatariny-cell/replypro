'use client'

import Link from 'next/link'
import { useTranslation } from '@/hooks/useTranslation'
import { LanguageSwitcher } from './LanguageSwitcher'
import { Button } from '@/components/ui/button'
import { MessageSquare } from 'lucide-react'

export function Navbar() {
  const { t } = useTranslation()

  return (
    <nav className="fixed top-4 left-4 right-4 z-50 mx-auto max-w-7xl rounded-xl border bg-card/80 backdrop-blur-md px-4 md:px-6 py-3">
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 cursor-pointer">
          <MessageSquare className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold font-heading text-foreground">ReplyPro</span>
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
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
