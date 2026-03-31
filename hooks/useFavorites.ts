'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/store/app-store'
import { useUser } from './useUser'
import type { Favorite } from '@/types'

export function useFavorites() {
  const { user } = useUser()
  const favorites = useAppStore((s) => s.favorites)
  const setFavorites = useAppStore((s) => s.setFavorites)

  useEffect(() => {
    if (!user) return
    const supabase = createClient()
    supabase
      .from('rp_favorites')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setFavorites(data as unknown as Favorite[])
      })
  }, [user, setFavorites])

  return { favorites }
}
