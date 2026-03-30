'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/store/app-store'
import { useUser } from './useUser'
import type { Generation } from '@/types'

export function useGenerations() {
  const { user } = useUser()
  const generations = useAppStore((s) => s.generations)
  const setGenerations = useAppStore((s) => s.setGenerations)

  useEffect(() => {
    if (!user) return
    const supabase = createClient()
    supabase
      .from('rp_generations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        if (data) setGenerations(data as unknown as Generation[])
      })
  }, [user, setGenerations])

  return { generations }
}
