import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/supabase'
import type { CookieOptions } from '@supabase/ssr'

export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[middleware] Missing Supabase env vars')

    const path = request.nextUrl.pathname
    const isDashboardRoute =
      path.startsWith('/dashboard') ||
      path.startsWith('/history') ||
      path.startsWith('/settings') ||
      path.startsWith('/billing') ||
      path.startsWith('/onboarding') ||
      path.startsWith('/clients') ||
      path.startsWith('/properties') ||
      path.startsWith('/favorites')

    if (isDashboardRoute) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable', code: 'CONFIG_ERROR' },
        { status: 503 }
      )
    }

    return NextResponse.next()
  }

  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  try {
    const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    })

    const { data: { user } } = await supabase.auth.getUser()

    const path = request.nextUrl.pathname
    const isAuthRoute = path === '/login' || path === '/signup'
    const isDashboardRoute =
      path.startsWith('/dashboard') ||
      path.startsWith('/history') ||
      path.startsWith('/settings') ||
      path.startsWith('/billing') ||
      path.startsWith('/onboarding') ||
      path.startsWith('/clients') ||
      path.startsWith('/properties') ||
      path.startsWith('/favorites')

    if (isDashboardRoute && !user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    if (isAuthRoute && user) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  } catch {
    // If auth check fails, just pass through
  }

  return response
}
