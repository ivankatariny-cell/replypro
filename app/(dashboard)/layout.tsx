'use client'

import { Sidebar } from '@/components/layout/Sidebar'
import { MobileNav } from '@/components/layout/MobileNav'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 px-4 md:px-8 py-6 pb-24 md:pb-6 max-w-5xl">
        {children}
      </main>
      <MobileNav />
    </div>
  )
}
