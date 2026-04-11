'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/store/app-store'
import { useUser } from './useUser'

export function useFavorites() {
  const { user } = useUser()
  const favorites = useAppStore((s) => s.favorites)
  const setFavorites = useAppStore((s) => s.setFavorites)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    const supabase = createClient()
    ;(async () => {
      try {
        const { data, error: err } = await supabase
          .from('rp_favorites')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
        if (err) { setError(err.message) }
        else if (data) setFavorites(data)
      } finally {
        setLoading(false)
      }
    })()
  }, [user, setFavorites])

  return { favorites, loading, error }
}
