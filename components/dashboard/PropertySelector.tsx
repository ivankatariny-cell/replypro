'use client'

import { useProperties } from '@/hooks/useProperties'
import { useTranslation } from '@/hooks/useTranslation'
import { Building2 } from 'lucide-react'

interface Props {
  value: string | null
  onChange: (id: string | null) => void
}

export function PropertySelector({ value, onChange }: Props) {
  const { t } = useTranslation()
  const { properties } = useProperties()

  const active = properties.filter((p) => p.status === 'active')

  if (active.length === 0) return null

  return (
    <div className="flex items-center gap-2">
      <Building2 className="h-4 w-4 text-muted-foreground" />
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value || null)}
        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring"
        aria-label={t('dashboard.select_property')}
      >
        <option value="">{t('dashboard.no_property')}</option>
        {active.map((p) => (
          <option key={p.id} value={p.id}>
            {p.title} {p.price ? `— €${p.price.toLocaleString()}` : ''}
          </option>
        ))}
      </select>
    </div>
  )
}
