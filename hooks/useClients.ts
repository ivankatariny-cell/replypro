'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/store/app-store'
import { useUser } from './useUser'

export function useClients() {
  const { user } = useUser()
  const clients = useAppStore((s) => s.clients)
  const setClients = useAppStore((s) => s.setClients)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    const supabase = createClient()
    ;(async () => {
      try {
        const { data, error: err } = await supabase
          .from('rp_clients')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
        if (err) { setError(err.message) }
        else if (data) setClients(data)
      } finally {
        setLoading(false)
      }
    })()
  }, [user, setClients])

  return { clients, loading, error }
}
