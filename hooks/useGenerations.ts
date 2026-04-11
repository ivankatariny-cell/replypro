'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/store/app-store'
import { useUser } from './useUser'

export function useGenerations() {
  const { user } = useUser()
  const generations = useAppStore((s) => s.generations)
  const setGenerations = useAppStore((s) => s.setGenerations)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    const supabase = createClient()
    ;(async () => {
      try {
        const { data, error: err } = await supabase
          .from('rp_generations')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50)
        if (err) { setError(err.message) }
        else if (data) setGenerations(data)
      } finally {
        setLoading(false)
      }
    })()
  }, [user, setGenerations])

  return { generations, loading, error }
}
