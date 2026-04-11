'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/store/app-store'
import { useUser } from './useUser'

export function useSubscription() {
  const { user } = useUser()
  const subscription = useAppStore((s) => s.subscription)
  const setSubscription = useAppStore((s) => s.setSubscription)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    const supabase = createClient()
    ;(async () => {
      try {
        const { data, error: err } = await supabase
          .from('rp_subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .single()
        if (err) { setError(err.message) }
        else if (data) setSubscription(data)
      } finally {
        setLoading(false)
      }
    })()
  }, [user, setSubscription])

  return { subscription, loading, error }
}
