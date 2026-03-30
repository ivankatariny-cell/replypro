'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/store/app-store'
import { useUser } from './useUser'
import type { UserProfile } from '@/types'

export function useProfile() {
  const { user } = useUser()
  const profile = useAppStore((s) => s.profile)
  const setProfile = useAppStore((s) => s.setProfile)
  const setLanguage = useAppStore((s) => s.setLanguage)

  useEffect(() => {
    if (!user) return
    const supabase = createClient()
    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          const p = data as unknown as UserProfile
          setProfile(p)
          if (p.language) setLanguage(p.language)
        }
      })
  }, [user, setProfile, setLanguage])

  return { profile }
}
