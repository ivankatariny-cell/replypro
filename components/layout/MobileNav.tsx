'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'
import { cn } from '@/lib/utils/cn'
import { LayoutDashboard, History, Sparkles, Users, Menu } from 'lucide-react'
import { useState } from 'react'
import { Settings, CreditCard, Building2, Star, LogOut, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LanguageSwitcher } from './LanguageSwitcher'
import { ThemeToggle } from './ThemeToggle'

const mainTabs = [
  { key: 'nav.dashboard', href: '/dashboard', icon: LayoutDashboard },
  { key: 'nav.history', href: '/history', icon: History },
  { key: 'nav.dashboard', href: '/dashboard', icon: Sparkles, isCenter: true },
  { key: 'nav.clients', href: '/clients', icon: Users },
  { key: 'nav.more', href: '#more', icon: Menu },
]

const moreItems = [
  { key: 'nav.properties', href: '/properties', icon: Building2 },
  { key: 'nav.favorites', href: '/favorites', icon: Star },
  { key: 'nav.settings', href: '/settings', icon: Settings },
  { key: 'nav.billing', href: '/billing', icon: CreditCard },
]

export function MobileNav() {
  const { t } = useTranslation()
  const pathname = usePathname()
  const router = useRouter()
  const [showMore, setShowMore] = useState(false)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <>
      {showMore && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowMore(false)} />
          <div className="absolute bottom-16 left-4 right-4 rounded-xl border bg-card p-4 shadow-lg animate-slide-in-bottom">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">{t('nav.more')}</span>
              <div className="flex items-center gap-1">
                <LanguageSwitcher />
                <ThemeToggle />
                <button onClick={() => setShowMore(false)} className="p-1 cursor-pointer">
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {moreItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setShowMore(false)}
                    className={cn(
                      'flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer',
                      pathname === item.href ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {t(item.key)}
                  </Link>
                )
              })}
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 mt-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              {t('nav.logout')}
            </button>
          </div>
        </div>
      )}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-card/95 backdrop-blur-md md:hidden safe-area-bottom">
        <div className="flex items-center justify-around px-2 py-1">
          {mainTabs.map((item, i) => {
            const Icon = item.icon
            const isMore = item.href === '#more'
            const active = !isMore && pathname === item.href

            if (item.isCenter) {
              return (
                <Link
                  key={`center-${i}`}
                  href={item.href}
                  className="flex flex-col items-center -mt-4 cursor-pointer"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                    <Icon className="h-5 w-5" />
                  </div>
                </Link>
              )
            }

            if (isMore) {
              return (
                <button
                  key={`more-${i}`}
                  onClick={() => setShowMore(!showMore)}
                  className={cn(
                    'flex flex-col items-center gap-0.5 px-3 py-2 text-xs cursor-pointer transition-colors',
                    showMore ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{t(item.key)}</span>
                </button>
              )
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-3 py-2 text-xs cursor-pointer transition-colors',
                  active ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{t(item.key)}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
