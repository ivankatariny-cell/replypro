'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useTranslation } from '@/hooks/useTranslation'
import { useProperties } from '@/hooks/useProperties'
import { useUser } from '@/hooks/useUser'
import { useAppStore } from '@/store/app-store'
import { useToast } from '@/components/ui/toast'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, X, MapPin, Ruler, DoorOpen, Building2 } from 'lucide-react'
import type { Property } from '@/types'

export default function PropertiesPage() {
  const { t, language } = useTranslation()
  const { toast } = useToast()
  const { user } = useUser()
  const { properties } = useProperties()
  const addProperty = useAppStore((s) => s.addProperty)
  const removeProperty = useAppStore((s) => s.removeProperty)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '', address: '', city: '', price: '', sqm: '', rooms: '',
    description: '', property_type: 'apartment' as Property['property_type'],
  })

  const typeLabels: Record<string, string> = language === 'hr'
    ? { apartment: 'Stan', house: 'Kuća', land: 'Zemljište', commercial: 'Poslovni', other: 'Ostalo' }
    : { apartment: 'Apartment', house: 'House', land: 'Land', commercial: 'Commercial', other: 'Other' }

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
      addProperty(data as unknown as Property)
      setForm({ title: '', address: '', city: '', price: '', sqm: '', rooms: '', description: '', property_type: 'apartment' })
      setShowForm(false)
      toast(t('properties.added'), 'success')
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    const supabase = createClient()
    await supabase.from('rp_properties').delete().eq('id', id)
    removeProperty(id)
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">{t('nav.properties')}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{properties.length} {t('nav.properties').toLowerCase()}</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="cursor-pointer" size="sm">
          {showForm ? <X className="mr-1.5 h-4 w-4" /> : <Plus className="mr-1.5 h-4 w-4" />}
          {showForm ? t('properties.cancel') : t('properties.add')}
        </Button>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl border bg-card p-5 space-y-4">
              <p className="text-sm font-semibold">{t('properties.add')}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>{t('properties.title')}</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>{t('properties.type')}</Label>
                  <select
                    value={form.property_type}
                    onChange={(e) => setForm({ ...form, property_type: e.target.value as any })}
                    className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>{t('properties.address')}</Label>
                  <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>{t('onboarding.city')}</Label>
                  <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>{t('properties.price_label')}</Label>
                  <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label>m²</Label>
                    <Input type="number" value={form.sqm} onChange={(e) => setForm({ ...form, sqm: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>{t('properties.rooms')}</Label>
                    <Input type="number" value={form.rooms} onChange={(e) => setForm({ ...form, rooms: e.target.value })} />
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>{t('properties.description')}</Label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAdd} disabled={saving || !form.title.trim()} className="cursor-pointer" size="sm">
                  {t('properties.save')}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowForm(false)} className="cursor-pointer">
                  {t('properties.cancel')}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid */}
      {properties.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted mb-4">
            <Building2 className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">{t('properties.empty')}</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((prop, i) => (
            <motion.div
              key={prop.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="flex flex-col rounded-xl border bg-card p-4 hover:border-border/80 hover:shadow-sm transition-all h-full">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="font-medium text-sm leading-snug">{prop.title}</p>
                    <span className="inline-flex items-center mt-1 rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      {typeLabels[prop.property_type]}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(prop.id)}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer"
                    aria-label="Delete property"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                {prop.price && (
                  <p className="text-lg font-bold text-primary mb-2">€{prop.price.toLocaleString()}</p>
                )}

                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-auto">
                  {prop.city && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />{prop.city}
                    </span>
                  )}
                  {prop.sqm && (
                    <span className="flex items-center gap-1">
                      <Ruler className="h-3 w-3" />{prop.sqm}m²
                    </span>
                  )}
                  {prop.rooms && (
                    <span className="flex items-center gap-1">
                      <DoorOpen className="h-3 w-3" />{prop.rooms} {language === 'hr' ? 'soba' : 'rooms'}
                    </span>
                  )}
                </div>

                {prop.description && (
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{prop.description}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
