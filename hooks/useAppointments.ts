'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/store/app-store'
import { useUser } from './useUser'

export function useAppointments() {
  const { user } = useUser()
  const appointments = useAppStore((s) => s.appointments)
  const setAppointments = useAppStore((s) => s.setAppointments)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = async () => {
    if (!user) return
    const supabase = createClient()
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('rp_appointments')
        .select('*')
        .eq('user_id', user.id)
        .order('start_at', { ascending: true })
      if (err) setError(err.message)
      else if (data) setAppointments(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user) { setLoading(false); return }
    refetch()
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  return { appointments, loading, error, refetch }
}
