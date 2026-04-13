'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'
import { useUser } from '@/hooks/useUser'
import { useProfile } from '@/hooks/useProfile'
import { createClient } from '@/lib/supabase/client'
import { LanguageSwitcher } from './LanguageSwitcher'
import { ThemeToggle } from './ThemeToggle'
import { cn } from '@/lib/utils/cn'
import {
  LayoutDashboard, History, Settings, CreditCard, LogOut,
  Users, Building2, Star, CalendarDays,
} from 'lucide-react'

const navItems = [
  { key: 'nav.dashboard', href: '/dashboard', icon: LayoutDashboard },
  { key: 'nav.clients', href: '/clients', icon: Users },
  { key: 'nav.properties', href: '/properties', icon: Building2 },
  { key: 'nav.favorites', href: '/favorites', icon: Star },
  { key: 'nav.calendar', href: '/calendar', icon: CalendarDays },
  { key: 'nav.history', href: '/history', icon: History },
]

const bottomItems = [
  { key: 'nav.settings', href: '/settings', icon: Settings },
  { key: 'nav.billing', href: '/billing', icon: CreditCard },
]

export function Sidebar() {
  const { t } = useTranslation()
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useUser()
  const { profile } = useProfile()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? '?'

  return (
    <aside className="hidden md:flex flex-col w-[220px] shrink-0 border-r bg-card/50 h-screen overflow-hidden">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 h-14 border-b shrink-0">
        <Image src="/icon.png" alt="ReplyPro" width={28} height={28} className="rounded-lg" />
        <span className="text-sm font-bold font-heading">ReplyPro</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">Menu</p>
        {navItems.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors duration-100 cursor-pointer',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{t(item.key)}</span>
            </Link>
          )
        })}

        <div className="pt-2.5 mt-2.5 border-t space-y-0.5">
          <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">Account</p>
          {bottomItems.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors duration-100 cursor-pointer',
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{t(item.key)}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t px-2 py-2.5 shrink-0 space-y-1">
        <div className="flex items-center gap-1 px-1">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold truncate leading-tight">{profile?.full_name || user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-[11px] font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors duration-100 cursor-pointer"
        >
          <LogOut className="h-3.5 w-3.5 shrink-0" />
          {t('nav.logout')}
        </button>
      </div>
    </aside>
  )
}