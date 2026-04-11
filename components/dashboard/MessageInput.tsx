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
        id="message-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t('dashboard.placeholder')}
        disabled={disabled}
        rows={4}
        maxLength={2000}
        className="resize-none text-sm leading-relaxed rounded-xl"
        aria-label={t('dashboard.placeholder')}
      />
      <p className="text-[11px] text-muted-foreground text-right tabular-nums">{value.length} / 2,000</p>
    </div>
  )
}
