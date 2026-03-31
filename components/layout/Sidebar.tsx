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
import {
  LayoutDashboard, History, Settings, CreditCard, LogOut,
  MessageSquare, User, Users, Building2, Star,
} from 'lucide-react'

const navItems = [
  { key: 'nav.dashboard', href: '/dashboard', icon: LayoutDashboard },
  { key: 'nav.clients', href: '/clients', icon: Users },
  { key: 'nav.properties', href: '/properties', icon: Building2 },
  { key: 'nav.favorites', href: '/favorites', icon: Star },
  { key: 'nav.history', href: '/history', icon: History },
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

  return (
    <aside className="hidden md:flex md:w-64 flex-col border-r bg-card h-screen sticky top-0">
      <div className="flex items-center gap-2 px-6 py-5 border-b">
        <MessageSquare className="h-6 w-6 text-primary" />
        <span className="text-lg font-bold font-heading">ReplyPro</span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200 cursor-pointer',
                active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
         
     <Icon className="h-5 w-5" />
              {t(item.key)}
            </Link>
          )
        })}
      </nav>
      <div className="border-t px-3 py-3 space-y-2">
        <div className="flex items-center gap-1 px-1">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <User className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{profile?.full_name || user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors duration-200 cursor-pointer"
        >
          <LogOut className="h-5 w-5" />
          {t('nav.logout')}
        </button>
      </div>
    </aside>
  )
}
