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
  const pct = Math.round((value.length / 2000) * 100)

  return (
    <div className="space-y-1.5">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t('dashboard.placeholder')}
        disabled={disabled}
        rows={5}
        maxLength={2000}
        className="resize-none text-sm leading-relaxed"
        aria-label={t('dashboard.placeholder')}
      />
      <div className="flex items-center justify-between px-0.5">
        <div className="h-1 flex-1 mr-4 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${pct > 80 ? 'bg-warning' : 'bg-primary/40'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground tabular-nums shrink-0">{value.length}/2000</p>
      </div>
    </div>
  )
}
