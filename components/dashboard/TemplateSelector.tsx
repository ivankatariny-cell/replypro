'use client'

import { useTranslation } from '@/hooks/useTranslation'
import { useTemplates } from '@/hooks/useTemplates'
import type { Template, TemplateCategory } from '@/types'

interface Props {
  onSelect: (template: Template) => void
}

const categoryIcons: Record<TemplateCategory, string> = {
  first_contact: '👋',
  follow_up: '🔄',
  viewing: '🏠',
  price: '💰',
  closing: '✅',
  rejection: '❌',
  custom: '✏️',
}

const categoryLabels: Record<string, Record<TemplateCategory, string>> = {
  hr: {
    first_contact: 'Prvi kontakt',
    follow_up: 'Follow-up',
    viewing: 'Razgledavanje',
    price: 'Cijena',
    closing: 'Zaključivanje',
    rejection: 'Odbijanje',
    custom: 'Prilagođeno',
  },
  en: {
    first_contact: 'First Contact',
    follow_up: 'Follow-up',
    viewing: 'Viewing',
    price: 'Price',
    closing: 'Closing',
    rejection: 'Rejection',
    custom: 'Custom',
  },
}

export function TemplateSelector({ onSelect }: Props) {
  const { language } = useTranslation()
  const { templates } = useTemplates()

  const grouped = templates.reduce<Record<string, Template[]>>((acc, t) => {
    if (!acc[t.category]) acc[t.category] = []
    acc[t.category].push(t)
    return acc
  }, {})

  const labels = categoryLabels[language] || categoryLabels.hr

  return (
    <div className="space-y-3">
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category}>
          <p className="text-xs font-medium text-muted-foreground mb-1.5">
            {categoryIcons[category as TemplateCategory]} {labels[category as TemplateCategory]}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {items.map((tmpl) => (
              <button
                key={tmpl.id}
                onClick={() => onSelect(tmpl)}
                className="rounded-lg border bg-background px-3 py-1.5 text-xs font-medium hover:bg-accent hover:border-primary/30 transition-colors cursor-pointer"
              >
                {language === 'hr' ? tmpl.name_hr : tmpl.name_en}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
