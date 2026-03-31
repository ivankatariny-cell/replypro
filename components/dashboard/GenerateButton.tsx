'use client'

import { useTranslation } from '@/hooks/useTranslation'
import { Button } from '@/components/ui/button'
import { Sparkles, Loader2 } from 'lucide-react'

interface Props {
  onClick: () => void
  loading: boolean
  disabled: boolean
}

export function GenerateButton({ onClick, loading, disabled }: Props) {
  const { t } = useTranslation()

  return (
    <Button
      onClick={onClick}
      disabled={disabled || loading}
      size="lg"
      className="w-full cursor-pointer text-sm font-semibold"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {t('dashboard.generating')}
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          {t('dashboard.generate_btn')}
        </>
      )}
    </Button>
  )
}
