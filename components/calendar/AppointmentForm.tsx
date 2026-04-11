'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useClients } from '@/hooks/useClients'
import { useProperties } from '@/hooks/useProperties'
import { useTranslation } from '@/hooks/useTranslation'
import type { Appointment } from '@/types'

export interface AppointmentFormData {
  title: string
  description: string
  date: string        // YYYY-MM-DD
  start_time: string  // HH:MM
  end_time: string    // HH:MM
  client_id: string | null
  property_id: string | null
}

interface Props {
  initial?: Appointment
  onSave: (data: AppointmentFormData) => void
  onCancel: () => void
  saving: boolean
}

function toDateStr(iso: string) {
  return iso.slice(0, 10)
}
function toTimeStr(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
}

export function AppointmentForm({ initial, onSave, onCancel, saving }: Props) {
  const { t } = useTranslation()
  const { clients } = useClients()
  const { properties } = useProperties()

  const [form, setForm] = useState<AppointmentFormData>({
    title: initial?.title ?? '',
    description: initial?.description ?? '',
    date: initial ? toDateStr(initial.start_at) : new Date().toISOString().slice(0, 10),
    start_time: initial ? toTimeStr(initial.start_at) : '09:00',
    end_time: initial ? toTimeStr(initial.end_at) : '10:00',
    client_id: initial?.client_id ?? null,
    property_id: initial?.property_id ?? null,
  })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (initial) {
      setForm({
        title: initial.title,
        description: initial.description ?? '',
        date: toDateStr(initial.start_at),
        start_time: toTimeStr(initial.start_at),
        end_time: toTimeStr(initial.end_at),
        client_id: initial.client_id,
        property_id: initial.property_id,
      })
    }
  }, [initial])

  const set = (key: keyof AppointmentFormData, value: string | null) =>
    setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = () => {
    setError(null)
    if (!form.title.trim()) { setError(t('calendar.error_title_required')); return }
    if (!form.date) { setError(t('calendar.error_date_required')); return }
    if (form.start_time >= form.end_time) { setError(t('calendar.error_end_after_start')); return }
    onSave(form)
  }

  const activeClients = clients.filter((c) => c.status !== 'lost' && c.status !== 'closed')
  const activeProperties = properties.filter((p) => p.status === 'active')

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {t('calendar.form_title')} *
        </Label>
        <Input
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          placeholder={t('calendar.form_title_placeholder')}
          autoFocus
        />
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {t('calendar.form_description')}
        </Label>
        <Textarea
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          placeholder={t('calendar.form_description_placeholder')}
          className="min-h-[60px] resize-none"
        />
      </div>

      {/* Date + Times */}
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {t('calendar.form_date')} *
          </Label>
          <Input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {t('calendar.form_start_time')} *
          </Label>
          <Input type="time" value={form.start_time} onChange={(e) => set('start_time', e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {t('calendar.form_end_time')} *
          </Label>
          <Input type="time" value={form.end_time} onChange={(e) => set('end_time', e.target.value)} />
        </div>
      </div>

      {/* Client + Property */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {t('dashboard.select_client')}
          </Label>
          <select
            value={form.client_id ?? ''}
            onChange={(e) => set('client_id', e.target.value || null)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-1 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">{t('dashboard.no_client')}</option>
            {activeClients.map((c) => (
              <option key={c.id} value={c.id}>{c.full_name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {t('dashboard.select_property')}
          </Label>
          <select
            value={form.property_id ?? ''}
            onChange={(e) => set('property_id', e.target.value || null)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-1 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">{t('dashboard.no_property')}</option>
            {activeProperties.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Validation error */}
      {error && (
        <p className="text-xs text-destructive font-medium">{error}</p>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={handleSubmit}
          disabled={saving || !form.title.trim()}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          {saving ? t('calendar.saving') : t('calendar.save_appointment')}
        </button>
        <button
          onClick={onCancel}
          className="rounded-lg border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent transition-colors cursor-pointer"
        >
          {t('clients.cancel')}
        </button>
      </div>
    </div>
  )
}
