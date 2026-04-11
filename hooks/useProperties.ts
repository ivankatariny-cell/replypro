'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/store/app-store'
import { useUser } from './useUser'

export function useProperties() {
  const { user } = useUser()
  const properties = useAppStore((s) => s.properties)
  const setProperties = useAppStore((s) => s.setProperties)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    const supabase = createClient()
    ;(async () => {
      try {
        const { data, error: err } = await supabase
          .from('rp_properties')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
        if (err) { setError(err.message) }
        else if (data) setProperties(data)
      } finally {
        setLoading(false)
      }
    })()
  }, [user, setProperties])

  return { properties, loading, error }
}
