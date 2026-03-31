'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/store/app-store'
import { useUser } from './useUser'
import type { Client } from '@/types'

export function useClients() {
  const { user } = useUser()
  const clients = useAppStore((s) => s.clients)
  const setClients = useAppStore((s) => s.setClients)

  useEffect(() => {
    if (!user) return
    const supabase = createClient()
    supabase
      .from('rp_clients')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .then(({ data }) => {
        if (data) setClients(data as unknown as Client[])
      })
  }, [user, setClients])

  return { clients }
}
