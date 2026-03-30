'use client'

import { useCallback } from 'react'
import { useAppStore } from '@/store/app-store'
import hr from '@/locales/hr.json'
import en from '@/locales/en.json'

const translations: Record<string, typeof hr> = { hr, en }

export function useTranslation() {
  const language = useAppStore((s) => s.language)
  const setLanguage = useAppStore((s) => s.setLanguage)

  const t = useCallback(
    (key: string): string => {
      const keys = key.split('.')
      let result: Record<string, unknown> | string = translations[language] || hr
      for (const k of keys) {
        if (typeof result === 'object' && result !== null && k in result) {
          result = result[k] as Record<string, unknown> | string
        } else {
          return key
        }
      }
      return typeof result === 'string' ? result : key
    },
    [language]
  )

  return { t, language, setLanguage }
}
