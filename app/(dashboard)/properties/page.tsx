'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useTranslation } from '@/hooks/useTranslation'
import { useProperties } from '@/hooks/useProperties'
import { useUser } from '@/hooks/useUser'
import { useAppStore } from '@/store/app-store'
import { useToast } from '@/components/ui/toast'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Plus, X, MapPin, Ruler, DoorOpen } from 'lucide-react'
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
  const [form, setForm] = useState({ title: '', address: '', city: '', price: '', sqm: '', rooms: '', description: '', property_type: 'apartment' as Property['property_type'] })

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

  const typeLabels: Record<string, string> = language === 'hr'
    ? { apartment: 'Stan', house: 'Kuća', land: 'Zemljište', commercial: 'Poslovni', other: 'Ostalo' }
    : { apartment: 'Apartment', house: 'House', land: 'Land', commercial: 'Commercial', other: 'Other' }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold">{t('nav.properties')}</h1>
        <Button onClick={() => setShowForm(!showForm)} className="cursor-pointer">
          {showForm ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
          {showForm ? t('properties.cancel') : t('properties.add')}
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <Card>
              <CardContent className="p-4 md:p-6 space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div><Label>{t('properties.title')}</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
                  <div>
                    <Label>{t('properties.type')}</Label>
                    <select value={form.property_type} onChange={(e) => setForm({ ...form, property_type: e.target.value as any })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer">
                      {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                  <div><Label>{t('properties.address')}</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
                  <div><Label>{t('onboarding.city')}</Label><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
                  <div><Label>{t('properties.price_label')}</Label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><Label>m²</Label><Input type="number" value={form.sqm} onChange={(e) => setForm({ ...form, sqm: e.target.value })} /></div>
                    <div><Label>{t('properties.rooms')}</Label><Input type="number" value={form.rooms} onChange={(e) => setForm({ ...form, rooms: e.target.value })} /></div>
                  </div>
                </div>
                <div><Label>{t('properties.description')}</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                <Button onClick={handleAdd} disabled={saving || !form.title.trim()} className="cursor-pointer">{t('properties.save')}</Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {properties.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground"><p>{t('properties.empty')}</p></div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((prop, i) => (
            <motion.div key={prop.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="hover:border-primary/30 transition-colors h-full">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{prop.title}</p>
                      <Badge variant="outline" className="text-xs mt-1">{typeLabels[prop.property_type]}</Badge>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(prop.id)} className="h-7 w-7 text-destructive cursor-pointer"><X className="h-3.5 w-3.5" /></Button>
                  </div>
                  {prop.price && <p className="text-lg font-bold text-primary">€{prop.price.toLocaleString()}</p>}
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    {prop.city && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{prop.city}</span>}
                    {prop.sqm && <span className="flex items-center gap-1"><Ruler className="h-3 w-3" />{prop.sqm}m²</span>}
                    {prop.rooms && <span className="flex items-center gap-1"><DoorOpen className="h-3 w-3" />{prop.rooms} {language === 'hr' ? 'soba' : 'rooms'}</span>}
                  </div>
                  {prop.description && <p className="text-xs text-muted-foreground line-clamp-2">{prop.description}</p>}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
