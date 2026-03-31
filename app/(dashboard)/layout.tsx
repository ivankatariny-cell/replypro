'use client'

import { Sidebar } from '@/components/layout/Sidebar'
import { MobileNav } from '@/components/layout/MobileNav'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <div className="px-4 sm:px-6 md:px-8 py-6 pb-24 md:pb-8 max-w-4xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
