'use client'

import { useClients } from '@/hooks/useClients'
import { useTranslation } from '@/hooks/useTranslation'
import { Users } from 'lucide-react'

interface Props {
  value: string | null
  onChange: (id: string | null) => void
}

export function ClientSelector({ value, onChange }: Props) {
  const { t } = useTranslation()
  const { clients } = useClients()

  return (
    <div className="flex items-center gap-2">
      <Users className="h-4 w-4 text-muted-foreground" />
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value || null)}
        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring"
        aria-label={t('dashboard.select_client')}
      >
        <option value="">{t('dashboard.no_client')}</option>
        {clients.map((c) => (
          <option key={c.id} value={c.id}>
            {c.full_name} {c.city ? `— ${c.city}` : ''}
          </option>
        ))}
      </select>
    </div>
  )
}
