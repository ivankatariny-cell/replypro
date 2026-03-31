'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'
import { cn } from '@/lib/utils/cn'
import { LayoutDashboard, History, Sparkles, Users, MoreHorizontal } from 'lucide-react'
import { useState } from 'react'
import { Settings, CreditCard, Building2, Star, LogOut, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LanguageSwitcher } from './LanguageSwitcher'
import { ThemeToggle } from './ThemeToggle'
import { motion, AnimatePresence } from 'motion/react'

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
      <AnimatePresence>
        {showMore && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 md:hidden"
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowMore(false)} />
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="absolute bottom-20 left-4 right-4 rounded-2xl border bg-card shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <span className="text-sm font-semibold">{t('nav.more')}</span>
                <div className="flex items-center gap-1">
                  <LanguageSwitcher />
                  <ThemeToggle />
                  <button
                    onClick={() => setShowMore(false)}
                    className="ml-1 flex h-7 w-7 items-center justify-center rounded-md hover:bg-accent transition-colors cursor-pointer"
                    aria-label="Close"
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
              <div className="p-3 grid grid-cols-2 gap-1.5">
                {moreItems.map((item) => {
                  const Icon = item.icon
                  const active = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setShowMore(false)}
                      className={cn(
                        'flex items-center gap-2.5 rounded-xl px-3 py-3 text-sm font-medium transition-colors cursor-pointer',
                        active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {t(item.key)}
                    </Link>
                  )
                })}
              </div>
              <div className="px-3 pb-3">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                  {t('nav.logout')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-card/95 backdrop-blur-xl md:hidden safe-area-bottom">
        <div className="flex items-center justify-around px-1 h-16">
          {mainTabs.map((item, i) => {
            const Icon = item.icon
            const isMore = item.href === '#more'
            const active = !isMore && pathname === item.href

            if (item.isCenter) {
              return (
                <Link
                  key={`center-${i}`}
                  href={item.href}
                  className="flex flex-col items-center -mt-5 cursor-pointer"
                  aria-label={t(item.key)}
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
                    <Icon className="h-6 w-6" />
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
                    'flex flex-col items-center gap-1 px-3 py-2 text-xs cursor-pointer transition-colors min-w-[48px]',
                    showMore ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-[10px] font-medium">{t(item.key)}</span>
                </button>
              )
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-2 text-xs cursor-pointer transition-colors min-w-[48px]',
                  active ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <motion.div animate={active ? { scale: [1, 1.2, 1] } : {}} transition={{ duration: 0.3 }}>
                  <Icon className="h-5 w-5" />
                </motion.div>
                <span className="text-[10px] font-medium">{t(item.key)}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}