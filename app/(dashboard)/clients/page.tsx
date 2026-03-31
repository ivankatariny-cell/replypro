'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useTranslation } from '@/hooks/useTranslation'
import { useClients } from '@/hooks/useClients'
import { useUser } from '@/hooks/useUser'
import { useAppStore } from '@/store/app-store'
import { useToast } from '@/components/ui/toast'
import { createClient as createSupabase } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Plus, X, Phone, Mail, MapPin, Search } from 'lucide-react'
import type { Client, ClientStatus } from '@/types'

const statusColors: Record<ClientStatus, string> = {
  new: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  contacted: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  viewing: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  negotiation: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  closed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  lost: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
}

const statusLabels: Record<string, Record<ClientStatus, string>> = {
  hr: { new: 'Novi', contacted: 'Kontaktiran', viewing: 'Razgledavanje', negotiation: 'Pregovori', closed: 'Zaključeno', lost: 'Izgubljen' },
  en: { new: 'New', contacted: 'Contacted', viewing: 'Viewing', negotiation: 'Negotiation', closed: 'Closed', lost: 'Lost' },
}

export default function ClientsPage() {
  const { t, language } = useTranslation()
  const { toast } = useToast()
  const { user } = useUser()
  const { clients } = useClients()
  const addClient = useAppStore((s) => s.addClient)
  const updateClientStore = useAppStore((s) => s.updateClient)
  const removeClient = useAppStore((s) => s.removeClient)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<ClientStatus | 'all'>('all')
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({ full_name: '', phone: '', email: '', city: '', property_interest: '', budget_min: '', budget_max: '', notes: '' })

  const filtered = clients.filter((c) => {
    const matchSearch = !search || c.full_name.toLowerCase().includes(search.toLowerCase()) || c.city?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || c.status === filterStatus
    return matchSearch && matchStatus
  })

  const handleAdd = async () => {
    if (!user || !form.full_name.trim()) return
    setSaving(true)
    const supabase = createSupabase()
    const { data, error } = await supabase.from('rp_clients').insert({
      user_id: user.id,
      full_name: form.full_name.trim(),
      phone: form.phone || null,
      email: form.email || null,
      city: form.city || null,
      property_interest: form.property_interest || null,
      budget_min: form.budget_min ? parseInt(form.budget_min) : null,
      budget_max: form.budget_max ? parseInt(form.budget_max) : null,
      notes: form.notes || null,
    }).select().single()
    if (!error && data) {
      addClient(data as unknown as Client)
      setForm({ full_name: '', phone: '', email: '', city: '', property_interest: '', budget_min: '', budget_max: '', notes: '' })
      setShowForm(false)
      toast(t('clients.added'), 'success')
    }
    setSaving(false)
  }

  const handleStatusChange = async (id: string, status: ClientStatus) => {
    const supabase = createSupabase()
    const { error } = await supabase.from('rp_clients').update({ status }).eq('id', id)
    if (!error) updateClientStore(id, { status })
  }

  const handleDelete = async (id: string) => {
    const supabase = createSupabase()
    const { error } = await supabase.from('rp_clients').delete().eq('id', id)
    if (!error) {
      removeClient(id)
      toast(t('clients.deleted'), 'info')
    }
  }

  const labels = statusLabels[language] || statusLabels.hr

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold">{t('nav.clients')}</h1>
        <Button onClick={() => setShowForm(!showForm)} className="cursor-pointer">
          {showForm ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
          {showForm ? t('clients.cancel') : t('clients.add')}
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <Card>
              <CardContent className="p-4 md:p-6 space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div><Label>{t('clients.name')}</Label><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
                  <div><Label>{t('clients.phone_label')}</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                  <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                  <div><Label>{t('onboarding.city')}</Label><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
                  <div><Label>{t('clients.interest')}</Label><Input value={form.property_interest} onChange={(e) => setForm({ ...form, property_interest: e.target.value })} /></div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><Label>{t('clients.budget_min')}</Label><Input type="number" value={form.budget_min} onChange={(e) => setForm({ ...form, budget_min: e.target.value })} /></div>
                    <div><Label>{t('clients.budget_max')}</Label><Input type="number" value={form.budget_max} onChange={(e) => setForm({ ...form, budget_max: e.target.value })} /></div>
                  </div>
                </div>
                <div><Label>{t('clients.notes')}</Label><Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
                <Button onClick={handleAdd} disabled={saving || !form.full_name.trim()} className="cursor-pointer">{t('clients.save')}</Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('clients.search')} className="pl-9" />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)} className="h-10 rounded-md border border-input bg-background px-3 text-sm cursor-pointer">
          <option value="all">{t('clients.all_statuses')}</option>
          {Object.entries(labels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>{t('clients.empty')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((client, i) => (
            <motion.div key={client.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="hover:border-primary/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{client.full_name}</span>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[client.status]}`}>
                          {labels[client.status]}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        {client.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{client.phone}</span>}
                        {client.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{client.email}</span>}
                        {client.city && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{client.city}</span>}
                      </div>
                      {client.property_interest && <p className="text-xs text-muted-foreground mt-1">{client.property_interest}</p>}
                      {(client.budget_min || client.budget_max) && (
                        <p className="text-xs text-muted-foreground">
                          {t('clients.budget')}: {client.budget_min ? `€${client.budget_min.toLocaleString()}` : '?'} - {client.budget_max ? `€${client.budget_max.toLocaleString()}` : '?'}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <select
                        value={client.status}
                        onChange={(e) => handleStatusChange(client.id, e.target.value as ClientStatus)}
                        className="h-8 rounded border bg-background px-2 text-xs cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {Object.entries(labels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(client.id)} className="h-8 w-8 text-destructive cursor-pointer">
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
