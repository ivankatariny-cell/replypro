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
import { motion, AnimatePresence } from 'motion/react'
import {
  LayoutDashboard, History, Settings, CreditCard, LogOut,
  MessageSquare, Users, Building2, Star,
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
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
      >
        <Link
          href={item.href}
          className={cn(
            'relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 cursor-pointer group overflow-hidden',
            active
              ? 'nav-active'
              : 'text-muted-foreground hover:bg-accent hover:text-foreground'
          )}
        >
          {/* Hover shimmer */}
          {!active && (
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
          )}
          <motion.div
            animate={active ? { scale: [1, 1.15, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            <Icon className={cn('h-4 w-4 shrink-0 transition-colors', active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground')} />
          </motion.div>
          <span className="truncate">{t(item.key)}</span>
          {active && (
            <motion.div
              layoutId="sidebar-active"
              className="absolute inset-0 bg-primary/8 rounded-lg"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
        </Link>
      </motion.div>
    )
  }

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? '?'

  return (
    <aside className="hidden md:flex flex-col w-[var(--sidebar-width)] shrink-0 border-r bg-card h-screen sticky top-0 overflow-hidden">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-2.5 px-5 h-16 border-b shrink-0"
      >
        <motion.div
          whileHover={{ rotate: 10, scale: 1.1 }}
          transition={{ type: 'spring', stiffness: 400 }}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"
        >
          <MessageSquare className="h-4 w-4" />
        </motion.div>
        <span className="text-base font-bold font-heading tracking-tight">ReplyPro</span>
      </motion.div>

      {/* Main nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="px-3 mb-2 text-2xs font-semibold uppercase tracking-widest text-muted-foreground/60"
        >
          {t('nav.dashboard')}
        </motion.p>
        {navItems.map((item, i) => <NavLink key={item.href} item={item} index={i} />)}

        <div className="pt-4 mt-4 border-t">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="px-3 mb-2 text-2xs font-semibold uppercase tracking-widest text-muted-foreground/60"
          >
            Account
          </motion.p>
          {bottomItems.map((item, i) => <NavLink key={item.href} item={item} index={navItems.length + i} />)}
        </div>
      </nav>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="border-t px-3 py-3 shrink-0 space-y-1"
      >
        <div className="flex items-center gap-2 px-2 py-1">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold"
          >
            {initials}
          </motion.div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate leading-tight">{profile?.full_name || user?.email}</p>
            {profile?.full_name && (
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            )}
          </div>
        </div>
        <motion.button
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors duration-150 cursor-pointer"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {t('nav.logout')}
        </motion.button>
      </motion.div>
    </aside>
  )
}
