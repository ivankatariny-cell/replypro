'use client'

import { useTranslation } from '@/hooks/useTranslation'
import { Globe } from 'lucide-react'

export function LanguageSwitcher() {
  const { language, setLanguage } = useTranslation()

  return (
    <button
      onClick={() => setLanguage(language === 'hr' ? 'en' : 'hr')}
      className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 cursor-pointer"
      aria-label="Switch language"
    >
      <Globe className="h-4 w-4" />
      <span className="uppercase">{language}</span>
    </button>
  )
}
