'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/store/app-store'
import { useUser } from './useUser'

export function useTemplates() {
  const { user } = useUser()
  const templates = useAppStore((s) => s.templates)
  const setTemplates = useAppStore((s) => s.setTemplates)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    const supabase = createClient()
    ;(async () => {
      try {
        const { data, error: err } = await supabase
          .from('rp_templates')
          .select('*')
          .or(`user_id.eq.${user.id},is_system.eq.true`)
          .order('is_system', { ascending: false })
          .order('category')
        if (err) { setError(err.message) }
        else if (data) setTemplates(data)
      } finally {
        setLoading(false)
      }
    })()
  }, [user, setTemplates])

  return { templates, loading, error }
}
