'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useTranslation } from '@/hooks/useTranslation'
import { useProperties } from '@/hooks/useProperties'
import { useUser } from '@/hooks/useUser'
import { useAppStore } from '@/store/app-store'
import { useToast } from '@/components/ui/toast'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, X, MapPin, Ruler, DoorOpen, Building2, ChevronDown } from 'lucide-react'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import type { Property } from '@/types'

export default function PropertiesPage() {
  const { t, language } = useTranslation()
  const { toast } = useToast()
  const { user } = useUser()
  const { properties, loading } = useProperties()
  const addProperty = useAppStore((s) => s.addProperty)
  const removeProperty = useAppStore((s) => s.removeProperty)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [form, setForm] = useState({ title: '', address: '', city: '', price: '', sqm: '', rooms: '', description: '', property_type: 'apartment' as Property['property_type'] })

  const typeLabels: Record<string, string> = language === 'hr'
    ? { apartment: 'Stan', house: 'Kuća', land: 'Zemljište', commercial: 'Poslovni', other: 'Ostalo' }
    : { apartment: 'Apartment', house: 'House', land: 'Land', commercial: 'Commercial', other: 'Other' }

  const typeColors: Record<string, string> = {
    apartment: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    house: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    land: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    commercial: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    other: 'bg-muted text-muted-foreground',
  }

  const handleAdd = async () => {
    if (!user || !form.title.trim()) return
    setSaving(true)
    const supabase = createClient()
    const { data, error } = await supabase.from('rp_properties').insert({
      user_id: user.id,
      title: form.title.trim(),
      address: form.address || null,
      city: form.city || null,
      price: form.price ? parseInt(form.price) : null,
      sqm: form.sqm ? parseInt(form.sqm) : null,
      rooms: form.rooms ? parseInt(form.rooms) : null,
      description: form.description || null,
      property_type: form.property_type,
    }).select().single()
    if (!error && data) {
      addProperty(data)
      setForm({ title: '', address: '', city: '', price: '', sqm: '', rooms: '', description: '', property_type: 'apartment' })
      setShowForm(false)
      toast(t('properties.added'), 'success')
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    setDeleting(true)
    const supabase = createClient()
    await supabase.from('rp_properties').delete().eq('id', id)
    removeProperty(id)
    setDeleting(false)
    setConfirmDeleteId(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('nav.properties')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{properties.length} properties in catalog</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
        >
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? t('properties.cancel') : t('properties.add')}
        </button>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="rounded-2xl border bg-card p-6 space-y-4">
              <p className="text-sm font-semibold">New Property</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('properties.title')}</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('properties.type')}</Label>
                  <div className="relative">
                    <select
                      value={form.property_type}
                      onChange={(e) => setForm({ ...form, property_type: e.target.value as Property['property_type'] })}
                      className="flex h-10 w-full appearance-none rounded-lg border border-input bg-background pl-3 pr-8 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('properties.address')}</Label>
                  <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('onboarding.city')}</Label>
                  <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('properties.price_label')}</Label>
                  <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">m²</Label>
                    <Input type="number" value={form.sqm} onChange={(e) => setForm({ ...form, sqm: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('properties.rooms')}</Label>
                    <Input type="number" value={form.rooms} onChange={(e) => setForm({ ...form, rooms: e.target.value })} />
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('properties.description')}</Label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={handleAdd} disabled={saving || !form.title.trim()} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 cursor-pointer transition-colors">
                  {t('properties.save')}
                </button>
                <button onClick={() => setShowForm(false)} className="rounded-lg border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent transition-colors cursor-pointer">
                  {t('properties.cancel')}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="py-20 text-center max-w-sm mx-auto">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-info/10 mx-auto mb-5">
            <Building2 className="h-10 w-10 text-info" />
          </div>
          <h3 className="text-base font-semibold mb-2">{t('properties.empty')}</h3>
          <p className="text-sm text-muted-foreground mb-6">{t('properties.empty_desc')}</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            {t('properties.empty_cta')}
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {properties.map((prop, i) => (
            <motion.div key={prop.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <div className="group rounded-2xl border bg-card p-5 hover:shadow-md transition-shadow h-full flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="font-semibold text-sm leading-snug">{prop.title}</p>
                    <span className={`inline-flex items-center mt-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${typeColors[prop.property_type]}`}>
                      {typeLabels[prop.property_type]}
                    </span>
                  </div>
                  <div className="flex items-center justify-end w-[62px] shrink-0">
                    <button
                      onClick={() => setConfirmDeleteId(prop.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {prop.price && (
                  <p className="text-xl font-bold text-primary mb-3">€{prop.price.toLocaleString()}</p>
                )}

                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-auto">
                  {prop.city && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{prop.city}</span>}
                  {prop.sqm && <span className="flex items-center gap-1"><Ruler className="h-3 w-3" />{prop.sqm}m²</span>}
                  {prop.rooms && <span className="flex items-center gap-1"><DoorOpen className="h-3 w-3" />{prop.rooms} {language === 'hr' ? 'soba' : 'rooms'}</span>}
                </div>

                {prop.description && (
                  <p className="text-xs text-muted-foreground mt-2.5 line-clamp-2 leading-relaxed">{prop.description}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
      <ConfirmDialog
        open={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={() => confirmDeleteId && handleDelete(confirmDeleteId)}
        title={language === 'hr' ? 'Obrisati nekretninu?' : 'Delete property?'}
        description={
          language === 'hr'
            ? `Ovo će trajno obrisati ${properties.find((p) => p.id === confirmDeleteId)?.title ?? ''}.`
            : `This will permanently delete ${properties.find((p) => p.id === confirmDeleteId)?.title ?? ''}.`
        }
        confirmLabel={t('confirm_dialog.confirm')}
        cancelLabel={t('confirm_dialog.cancel')}
        loading={deleting}
      />
    </div>
  )
}
