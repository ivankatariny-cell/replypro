'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/store/app-store'
import { useUser } from './useUser'

export function useGenerations() {
  const { user } = useUser()
  const generations = useAppStore((s) => s.generations)
  const setGenerations = useAppStore((s) => s.setGenerations)
  const appendGenerations = useAppStore((s) => s.appendGenerations)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)

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
        else if (data) {
          setGenerations(data)
          if (data.length < 50) setHasMore(false)
        }
      } finally {
        setLoading(false)
      }
    })()
  }, [user, setGenerations])

  const loadMore = async (offset: number) => {
    if (!user) return 0
    const supabase = createClient()
    const { data, error: err } = await supabase
      .from('rp_generations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + 49)
    if (!err && data) {
      appendGenerations(data)
      if (data.length < 50) setHasMore(false)
    }
    return data?.length ?? 0
  }

  return { generations, loading, error, hasMore, loadMore }
}
