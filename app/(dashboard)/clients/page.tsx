'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useTranslation } from '@/hooks/useTranslation'
import { useClients } from '@/hooks/useClients'
import { useUser } from '@/hooks/useUser'
import { useAppStore } from '@/store/app-store'
import { useToast } from '@/components/ui/toast'
import { createClient as createSupabase } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, X, Phone, Mail, MapPin, Search, Users, ChevronDown } from 'lucide-react'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import type { Client, ClientStatus } from '@/types'

const statusConfig: Record<ClientStatus, { label: Record<string, string>; dot: string }> = {
  new:         { label: { hr: 'Novi', en: 'New' },               dot: 'bg-blue-500' },
  contacted:   { label: { hr: 'Kontaktiran', en: 'Contacted' },  dot: 'bg-yellow-500' },
  viewing:     { label: { hr: 'Razgledavanje', en: 'Viewing' },  dot: 'bg-purple-500' },
  negotiation: { label: { hr: 'Pregovori', en: 'Negotiation' },  dot: 'bg-orange-500' },
  closed:      { label: { hr: 'Zaključeno', en: 'Closed' },      dot: 'bg-green-500' },
  lost:        { label: { hr: 'Izgubljen', en: 'Lost' },         dot: 'bg-muted-foreground' },
}

export default function ClientsPage() {
  const { t, language } = useTranslation()
  const { toast } = useToast()
  const { user } = useUser()
  const { clients, loading } = useClients()
  const addClient = useAppStore((s) => s.addClient)
  const updateClientStore = useAppStore((s) => s.updateClient)
  const removeClient = useAppStore((s) => s.removeClient)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<ClientStatus | 'all'>('all')
  const [saving, setSaving] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [form, setForm] = useState({ full_name: '', phone: '', email: '', city: '', property_interest: '', budget_min: '', budget_max: '', notes: '' })

  const lang = language === 'hr' ? 'hr' : 'en'

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
      addClient(data)
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
    setDeleting(true)
    const supabase = createSupabase()
    const { error } = await supabase.from('rp_clients').delete().eq('id', id)
    if (!error) { removeClient(id); toast(t('clients.deleted'), 'info') }
    setDeleting(false)
    setConfirmDeleteId(null)
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('nav.clients')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{clients.length} total clients</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
        >
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? t('clients.cancel') : t('clients.add')}
        </button>
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
            <div className="rounded-2xl border bg-card p-6 space-y-4">
              <p className="text-sm font-semibold text-foreground">New Client</p>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { label: t('clients.name'), key: 'full_name', type: 'text' },
                  { label: t('clients.phone_label'), key: 'phone', type: 'tel' },
                  { label: 'Email', key: 'email', type: 'email' },
                  { label: t('onboarding.city'), key: 'city', type: 'text' },
                  { label: t('clients.interest'), key: 'property_interest', type: 'text' },
                ].map(({ label, key, type }) => (
                  <div key={key} className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</Label>
                    <Input type={type} value={form[key as keyof typeof form]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
                  </div>
                ))}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('clients.budget_min')}</Label>
                    <Input type="number" value={form.budget_min} onChange={(e) => setForm({ ...form, budget_min: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('clients.budget_max')}</Label>
                    <Input type="number" value={form.budget_max} onChange={(e) => setForm({ ...form, budget_max: e.target.value })} />
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('clients.notes')}</Label>
                <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleAdd}
                  disabled={saving || !form.full_name.trim()}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  {t('clients.save')}
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="rounded-lg border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-accent transition-colors cursor-pointer"
                >
                  {t('clients.cancel')}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('clients.search')} className="pl-9 rounded-xl" />
        </div>
        <div className="relative">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as ClientStatus | 'all')}
            className="h-10 appearance-none rounded-xl border border-input bg-background pl-3 pr-8 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">{t('clients.all_statuses')}</option>
            {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label[lang]}</option>)}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="rounded-2xl border bg-card overflow-hidden divide-y">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="px-5 py-4">
              <Skeleton className="h-24 w-full rounded-2xl" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 && clients.length === 0 ? (
        <div className="py-20 text-center max-w-sm mx-auto">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 mx-auto mb-5">
            <Users className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-base font-semibold mb-2">{t('clients.empty')}</h3>
          <p className="text-sm text-muted-foreground mb-6">{t('clients.empty_desc')}</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            {t('clients.empty_cta')}
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
            <Users className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">{t('clients.search')} — no results</p>
        </div>
      ) : (
        <div className="rounded-2xl border bg-card overflow-hidden divide-y">
          {filtered.map((client, i) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors"
            >
              {/* Avatar */}
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">
                {client.full_name[0].toUpperCase()}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-semibold truncate">{client.full_name}</span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span className={`h-1.5 w-1.5 rounded-full ${statusConfig[client.status].dot}`} />
                    {statusConfig[client.status].label[lang]}
                  </span>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  {client.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{client.phone}</span>}
                  {client.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{client.email}</span>}
                  {client.city && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{client.city}</span>}
                  {(client.budget_min || client.budget_max) && (
                    <span>{client.budget_min ? `€${client.budget_min.toLocaleString()}` : '?'} – {client.budget_max ? `€${client.budget_max.toLocaleString()}` : '?'}</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="relative">
                  <select
                    value={client.status}
                    onChange={(e) => handleStatusChange(client.id, e.target.value as ClientStatus)}
                    onClick={(e) => e.stopPropagation()}
                    className="h-7 appearance-none rounded-lg border bg-background pl-2 pr-6 text-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label[lang]}</option>)}
                  </select>
                  <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
                </div>
                <button
                  onClick={() => setConfirmDeleteId(client.id)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={() => confirmDeleteId && handleDelete(confirmDeleteId)}
        title={language === 'hr' ? 'Obrisati klijenta?' : 'Delete client?'}
        description={
          language === 'hr'
            ? `Ovo će trajno obrisati ${clients.find((c) => c.id === confirmDeleteId)?.full_name ?? ''} i sve povezane podatke.`
            : `This will permanently delete ${clients.find((c) => c.id === confirmDeleteId)?.full_name ?? ''} and all associated data.`
        }
        confirmLabel={t('confirm_dialog.confirm')}
        cancelLabel={t('confirm_dialog.cancel')}
        loading={deleting}
      />
    </div>
  )
}
