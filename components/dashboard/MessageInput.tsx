'use client'

import { useTranslation } from '@/hooks/useTranslation'
import { Textarea } from '@/components/ui/textarea'

interface Props {
  value: string
  onChange: (v: string) => void
  disabled?: boolean
}

export function MessageInput({ value, onChange, disabled }: Props) {
  const { t } = useTranslation()

  return (
    <div className="space-y-2">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t('dashboard.placeholder')}
        disabled={disabled}
        rows={6}
        maxLength={2000}
        className="resize-none text-base"
        aria-label={t('dashboard.placeholder')}
      />
      <p className="text-xs text-muted-foreground text-right">{value.length}/2000</p>
    </div>
  )
}
