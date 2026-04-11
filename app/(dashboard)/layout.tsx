'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Sidebar } from '@/components/layout/Sidebar'
import { MobileNav } from '@/components/layout/MobileNav'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { useUser } from '@/hooks/useUser'
import { useProfile } from '@/hooks/useProfile'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user } = useUser()
  const { profile, loading } = useProfile()

  useEffect(() => {
    if (user && profile && profile.onboarding_completed === false) {
      router.push('/onboarding')
    }
  }, [user, profile, router])

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <div className="px-4 sm:px-6 md:px-8 py-6 pb-24 md:pb-8 max-w-4xl mx-auto w-full">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
