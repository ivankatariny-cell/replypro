'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/store/app-store'
import { useUser } from './useUser'
import type { Property } from '@/types'

export function useProperties() {
  const { user } = useUser()
  const properties = useAppStore((s) => s.properties)
  const setProperties = useAppStore((s) => s.setProperties)

  useEffect(() => {
    if (!user) return
    const supabase = createClient()
    supabase
      .from('rp_properties')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setProperties(data as unknown as Property[])
      })
  }, [user, setProperties])

  return { properties }
}
