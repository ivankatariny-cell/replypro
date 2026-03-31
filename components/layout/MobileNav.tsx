'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'
import { cn } from '@/lib/utils/cn'
import { LayoutDashboard, History, Sparkles, Users, MoreHorizontal, Settings, CreditCard, Building2, Star, LogOut, X } from 'lucide-react'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LanguageSwitcher } from './LanguageSwitcher'
import { ThemeToggle } from './ThemeToggle'

const mainTabs = [
  { key: 'nav.dashboard', href: '/dashboard', icon: LayoutDashboard },
  { key: 'nav.history', href: '/history', icon: History },
  { key: 'nav.dashboard', href: '/dashboard', icon: Sparkles, isCenter: true },
  { key: 'nav.clients', href: '/clients', icon: Users },
  { key: 'nav.more', href: '#more', icon: MoreHorizontal },
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
      {/* More menu overlay */}
      {showMore && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowMore(false)} />
          <div className="absolute bottom-[72px] left-3 right-3 rounded-2xl border bg-card shadow-2xl overflow-hidden animate-slide-in-bottom">
            <div className="flex items-center justify-between px-4 py-2.5 border-b">
              <span className="text-xs font-semibold">{t('nav.more')}</span>
              <div className="flex items-center gap-0.5">
                <LanguageSwitcher />
                <ThemeToggle />
                <button onClick={() => setShowMore(false)} className="ml-0.5 flex h-7 w-7 items-center justify-center rounded-md hover:bg-accent transition-colors cursor-pointer" aria-label="Close">
                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </div>
            </div>
            <div className="p-2 grid grid-cols-2 gap-1">
              {moreItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link key={item.href} href={item.href} onClick={() => setShowMore(false)}
                    className={cn('flex items-center gap-2 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors cursor-pointer',
                      pathname === item.href ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent'
                    )}>
                    <Icon className="h-4 w-4 shrink-0" />
                    {t(item.key)}
                  </Link>
                )
              })}
            </div>
            <div className="px-2 pb-2">
              <button onClick={handleLogout} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-[13px] font-medium text-destructive hover:bg-destructive/10 transition-colors cursor-pointer">
                <LogOut className="h-4 w-4 shrink-0" />
                {t('nav.logout')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-card/95 backdrop-blur-lg md:hidden safe-area-bottom">
        <div className="flex items-center justify-around h-[60px]">
          {mainTabs.map((item, i) => {
            const Icon = item.icon
            const isMore = item.href === '#more'
            const active = !isMore && pathname === item.href

            if (item.isCenter) {
              return (
                <Link key={`center-${i}`} href={item.href} className="flex items-center justify-center -mt-4 cursor-pointer" aria-label={t(item.key)}>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
                    <Icon className="h-5 w-5" />
                  </div>
                </Link>
              )
            }

            if (isMore) {
              return (
                <button key={`more-${i}`} onClick={() => setShowMore(!showMore)}
                  className={cn('flex flex-col items-center gap-0.5 py-1.5 min-w-[48px] cursor-pointer transition-colors', showMore ? 'text-primary' : 'text-muted-foreground')}>
                  <Icon className="h-5 w-5" />
                  <span className="text-[10px] font-medium">{t(item.key)}</span>
                </button>
              )
            }

            return (
              <Link key={item.href} href={item.href}
                className={cn('flex flex-col items-center gap-0.5 py-1.5 min-w-[48px] cursor-pointer transition-colors', active ? 'text-primary' : 'text-muted-foreground')}>
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{t(item.key)}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}