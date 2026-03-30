'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/store/app-store'
import { useUser } from './useUser'
import type { Subscription } from '@/types'

export function useSubscription() {
  const { user } = useUser()
  const subscription = useAppStore((s) => s.subscription)
  const setSubscription = useAppStore((s) => s.setSubscription)

  useEffect(() => {
    if (!user) return
    const supabase = createClient()
    supabase
      .from('rp_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (data) setSubscription(data as unknown as Subscription)
      })
  }, [user, setSubscription])

  return { subscription }
}
