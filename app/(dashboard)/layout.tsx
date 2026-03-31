'use client'

import { Sidebar } from '@/components/layout/Sidebar'
import { MobileNav } from '@/components/layout/MobileNav'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 min-w-0 px-4 md:px-6 lg:px-8 py-6 pb-24 md:pb-8 max-w-5xl w-full">
        {children}
      </main>
      <MobileNav />
    </div>
  )
}
