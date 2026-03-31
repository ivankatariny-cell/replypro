'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useTranslation } from '@/hooks/useTranslation'
import { useClients } from '@/hooks/useClients'
import { useUser } from '@/hooks/useUser'
import { useAppStore } from '@/store/app-store'
import { useToast } from '@/components/ui/toast'
import { createClient as createSupabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, X, Phone, Mail, MapPin, Search, Users } from 'lucide-react'
import type { Client, ClientStatus } from '@/types'

const statusConfig: Record<ClientStatus, { label: Record<string, string>; color: string }> = {
  new: { label: { hr: 'Novi', en: 'New' }, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
  contacted: { label: { hr: 'Kontaktiran', en: 'Contacted' }, color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300' },
  viewing: { label: { hr: 'Razgledavanje', en: 'Viewing' }, color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' },
  negotiation: { label: { hr: 'Pregovori', en: 'Negotiation' }, color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300' },
  closed: { label: { hr: 'Zaključeno', en: 'Closed' }, color: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' },
  lost: { label: { hr: 'Izgubljen', en: 'Lost' }, color: 'bg-muted text-muted-foreground' },
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
  const [form, setForm] = useState({
    full_name: '', phone: '', email: '', city: '',
    property_interest: '', budget_min: '', budget_max: '', notes: '',
  })

  const filtered = clients.filter((c) => {
    const matchSearch = !search ||
      c.full_name.toLowerCase().includes(search.toLowerCase()) ||
      c.city?.toLowerCase().includes(search.toLowerCase())
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

  const lang = language === 'hr' ? 'hr' : 'en'

  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-xl font-bold">{t('nav.clients')}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{clients.length} {t('stats.active_clients').toLowerCase()}</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="cursor-pointer" size="sm">
          {showForm ? <X className="mr-1.5 h-4 w-4" /> : <Plus className="mr-1.5 h-4 w-4" />}
          {showForm ? t('clients.cancel') : t('clients.add')}
        </Button>
      </motion.div>

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
              <p className="text-sm font-semibold">{t('clients.add')}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>{t('clients.name')}</Label>
                  <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>{t('clients.phone_label')}</Label>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>{t('onboarding.city')}</Label>
                  <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>{t('clients.interest')}</Label>
                  <Input value={form.property_interest} onChange={(e) => setForm({ ...form, property_interest: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label>{t('clients.budget_min')}</Label>
                    <Input type="number" value={form.budget_min} onChange={(e) => setForm({ ...form, budget_min: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>{t('clients.budget_max')}</Label>
                    <Input type="number" value={form.budget_max} onChange={(e) => setForm({ ...form, budget_max: e.target.value })} />
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>{t('clients.notes')}</Label>
                <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAdd} disabled={saving || !form.full_name.trim()} className="cursor-pointer" size="sm">
                  {t('clients.save')}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowForm(false)} className="cursor-pointer">
                  {t('clients.cancel')}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('clients.search')}
            className="pl-9"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="h-10 rounded-lg border border-input bg-background px-3 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">{t('clients.all_statuses')}</option>
          {Object.entries(statusConfig).map(([k, v]) => (
            <option key={k} value={k}>{v.label[lang]}</option>
          ))}
        </select>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted mb-4">
            <Users className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">{t('clients.empty')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((client, i) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <div className="flex items-start gap-4 rounded-xl border bg-card px-4 py-4 hover:border-border/80 transition-colors">
                {/* Avatar */}
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
                  {client.full_name[0].toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">{client.full_name}</span>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusConfig[client.status].color}`}>
                      {statusConfig[client.status].label[lang]}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-muted-foreground">
                    {client.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />{client.phone}
                      </span>
                    )}
                    {client.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />{client.email}
                      </span>
                    )}
                    {client.city && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />{client.city}
                      </span>
                    )}
                  </div>
                  {(client.budget_min || client.budget_max) && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('clients.budget')}: {client.budget_min ? `€${client.budget_min.toLocaleString()}` : '?'} – {client.budget_max ? `€${client.budget_max.toLocaleString()}` : '?'}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={client.status}
                    onChange={(e) => handleStatusChange(client.id, e.target.value as ClientStatus)}
                    className="h-8 rounded-lg border bg-background px-2 text-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {Object.entries(statusConfig).map(([k, v]) => (
                      <option key={k} value={k}>{v.label[lang]}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleDelete(client.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer"
                    aria-label="Delete client"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
