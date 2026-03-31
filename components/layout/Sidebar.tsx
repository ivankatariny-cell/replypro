'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'
import { useUser } from '@/hooks/useUser'
import { useProfile } from '@/hooks/useProfile'
import { createClient } from '@/lib/supabase/client'
import { LanguageSwitcher } from './LanguageSwitcher'
import { ThemeToggle } from './ThemeToggle'
import { cn } from '@/lib/utils/cn'
import { motion } from 'motion/react'
import {
  LayoutDashboard, History, Settings, CreditCard, LogOut,
  MessageSquare, Users, Building2, Star, ChevronRight,
} from 'lucide-react'

const navItems = [
  { key: 'nav.dashboard', href: '/dashboard', icon: LayoutDashboard },
  { key: 'nav.clients', href: '/clients', icon: Users },
  { key: 'nav.properties', href: '/properties', icon: Building2 },
  { key: 'nav.favorites', href: '/favorites', icon: Star },
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

  const NavLink = ({ item, index }: { item: typeof navItems[0]; index: number }) => {
    const Icon = item.icon
    const active = pathname === item.href
    return (
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.25, delay: index * 0.04 }}
      >
        <Link
          href={item.href}
          className={cn(
            'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 cursor-pointer',
            active
              ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
              : 'text-muted-foreground hover:bg-accent hover:text-foreground'
          )}
        >
          <Icon className="h-4 w-4 shrink-0" />
          <span className="flex-1 truncate">{t(item.key)}</span>
          {active && <ChevronRight className="h-3 w-3 opacity-60" />}
        </Link>
      </motion.div>
    )
  }

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? '?'

  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 border-r bg-card h-screen overflow-hidden">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-[60px] border-b shrink-0">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <MessageSquare className="h-4 w-4" />
        </div>
        <span className="text-sm font-bold font-heading tracking-tight">ReplyPro</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
          Menu
        </p>
        {navItems.map((item, i) => <NavLink key={item.href} item={item} index={i} />)}

        <div className="pt-3 mt-3 border-t space-y-0.5">
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
            Account
          </p>
          {bottomItems.map((item, i) => <NavLink key={item.href} item={item} index={navItems.length + i} />)}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t px-3 py-3 shrink-0">
        <div className="flex items-center gap-1 mb-2">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-accent transition-colors">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate">{profile?.full_name || user?.email}</p>
            {profile?.full_name && (
              <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
            )}
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="mt-1 flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-xs font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer"
        >
          <LogOut className="h-3.5 w-3.5 shrink-0" />
          {t('nav.logout')}
        </button>
      </div>
    </aside>
  )
}