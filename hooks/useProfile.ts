'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/store/app-store'
import { useUser } from './useUser'

export function useProfile() {
  const { user } = useUser()
  const profile = useAppStore((s) => s.profile)
  const setProfile = useAppStore((s) => s.setProfile)
  const setLanguage = useAppStore((s) => s.setLanguage)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    const supabase = createClient()
    ;(async () => {
      try {
        const { data, error: err } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        if (err) { setError(err.message) }
        else if (data) {
          setProfile(data)
          if ((data as any).language) setLanguage((data as any).language)
        }
      } finally {
        setLoading(false)
      }
    })()
  }, [user, setProfile, setLanguage])

  return { profile, loading, error }
}
