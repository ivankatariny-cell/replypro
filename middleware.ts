import { updateSession } from '@/lib/supabase/middleware'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/history/:path*',
    '/settings/:path*',
    '/billing/:path*',
    '/onboarding/:path*',
    '/clients/:path*',
    '/properties/:path*',
    '/favorites/:path*',
    '/login',
    '/signup',
  ],
}
