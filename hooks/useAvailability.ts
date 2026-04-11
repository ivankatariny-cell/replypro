'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from './useUser'
import type { AvailabilityRule, AvailabilityException } from '@/types'

export function useAvailability() {
  const { user } = useUser()
  const [rules, setRules] = useState<AvailabilityRule[]>([])
  const [exceptions, setExceptions] = useState<AvailabilityException[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = async () => {
    if (!user) return
    const supabase = createClient()
    setLoading(true)
    setError(null)
    try {
      const [rulesRes, exceptionsRes] = await Promise.all([
        supabase
          .from('rp_availability_rules')
          .select('*')
          .eq('user_id', user.id)
          .order('day_of_week', { ascending: true }),
        supabase
          .from('rp_availability_exceptions')
          .select('*')
          .eq('user_id', user.id)
          .order('exception_date', { ascending: true }),
      ])
      if (rulesRes.error) { setError(rulesRes.error.message); return }
      if (exceptionsRes.error) { setError(exceptionsRes.error.message); return }
      setRules(rulesRes.data ?? [])
      setExceptions(exceptionsRes.data ?? [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user) { setLoading(false); return }
    refetch()
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  return { rules, exceptions, loading, error, refetch }
}
