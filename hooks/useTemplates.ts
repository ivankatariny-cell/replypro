'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/store/app-store'
import { useUser } from './useUser'
import type { Template } from '@/types'

export function useTemplates() {
  const { user } = useUser()
  const templates = useAppStore((s) => s.templates)
  const setTemplates = useAppStore((s) => s.setTemplates)

  useEffect(() => {
    if (!user) return
    const supabase = createClient()
    supabase
      .from('rp_templates')
      .select('*')
      .or(`user_id.eq.${user.id},is_system.eq.true`)
      .order('is_system', { ascending: false })
      .order('category')
      .then(({ data }) => {
        if (data) setTemplates(data as unknown as Template[])
      })
  }, [user, setTemplates])

  return { templates }
}
