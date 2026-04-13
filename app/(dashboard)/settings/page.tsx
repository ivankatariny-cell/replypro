'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/hooks/useUser'
import { useProfile } from '@/hooks/useProfile'
import { useTranslation } from '@/hooks/useTranslation'
import { useSubscription } from '@/hooks/useSubscription'
import { useAppStore } from '@/store/app-store'
import { useToast } from '@/components/ui/toast'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import { Loader2, User, Shield, Download, ChevronDown, Trash2, Lock } from 'lucide-react'

const schema = z.object({
  full_name: z.string().min(2).max(100),
  agency_name: z.string().min(2).max(200),
  city: z.string().min(2).max(100),
  preferred_tone: z.enum(['formal', 'mixed', 'casual']),
  language: z.enum(['hr', 'en']),
})
type FormData = z.infer<typeof schema>

export default function SettingsPage() {
  const { t, language } = useTranslation()
  const { toast } = useToast()
  const { user } = useUser()
  const { profile } = useProfile()
  const { subscription } = useSubscription()
  const generations = useAppStore((s) => s.generations)
  const clients = useAppStore((s) => s.clients)
  const setLanguage = useAppStore((s) => s.setLanguage)
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' })
  const [pwLoading, setPwLoading] = useState(false)

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) })
  const watchedTone = watch('preferred_tone')

  useEffect(() => {
    if (profile) reset({ full_name: profile.full_name || '', agency_name: profile.agency_name || '', city: profile.city || '', preferred_tone: profile.preferred_tone || 'mixed', language: (profile.language as 'hr' | 'en') || 'hr' })
  }, [profile, reset])

  const onSubmit = async (data: FormData) => {
    if (!user) return
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('profiles').update({ full_name: data.full_name, agency_name: data.agency_name, city: data.city, preferred_tone: data.preferred_tone, language: data.language }).eq('id', user.id)
    if (!error) {
      toast(t('settings.saved'), 'success')
      setLanguage(data.language)
    }
    setLoading(false)
  }

  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    setExporting(true)
    try {
      const res = await fetch('/api/user/export')
      if (!res.ok) throw new Error('Export failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const date = new Date().toISOString().split('T')[0]
      a.download = `replypro-data-export-${date}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast(t('settings.exported'), 'success')
    } catch {
      toast(language === 'hr' ? 'Greška pri izvozu podataka.' : 'Export failed. Please try again.', 'error')
    } finally {
      setExporting(false)
    }
  }

  const handleDelete = async () => {
    if (!user || deleteConfirmEmail !== user.email) return
    setDeleting(true)
    try {
      const res = await fetch('/api/user/delete', { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/')
    } catch {
      toast(t('settings.delete_error'), 'error')
      setDeleting(false)
    }
  }

  const handlePasswordChange = async () => {
    if (pwForm.next !== pwForm.confirm) {
      toast(t('auth.passwords_no_match'), 'error')
      return
    }
    if (pwForm.next.length < 6) {
      toast(language === 'hr' ? 'Lozinka mora imati najmanje 6 znakova.' : 'Password must be at least 6 characters.', 'error')
      return
    }
    setPwLoading(true)
    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user!.email!,
      password: pwForm.current,
    })
    if (signInError) {
      toast(language === 'hr' ? 'Trenutna lozinka nije ispravna.' : 'Current password is incorrect.', 'error')
      setPwLoading(false)
      return
    }
    const { error } = await supabase.auth.updateUser({ password: pwForm.next })
    if (!error) {
      toast(language === 'hr' ? 'Lozinka promijenjena.' : 'Password changed.', 'success')
      setPwForm({ current: '', next: '', confirm: '' })
    } else {
      toast(error.message, 'error')
    }
    setPwLoading(false)
  }

  const toneDesc: Record<string, Record<string, string>> = {
    hr: { formal: 'Koristi "Vi" formu, profesionalan ton', mixed: 'Balans profesionalnog i prijateljskog', casual: 'Opušten, koristi "ti" formu' },
    en: { formal: 'Uses formal address, professional tone', mixed: 'Balance of professional and friendly', casual: 'Relaxed, uses informal address' },
  }

  const planLabel = subscription?.status === 'active' ? 'Pro' : subscription?.status === 'trial' ? 'Trial' : 'Free'
  const planColor = subscription?.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-muted text-muted-foreground'

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('settings.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('settings.subtitle')}</p>
        </div>
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${planColor}`}>{planLabel}</span>
      </div>

      {/* Profile */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        <div className="rounded-2xl border bg-card overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b bg-muted/20">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">{t('settings.profile_section')}</p>
              <p className="text-xs text-muted-foreground">{t('settings.profile_desc')}</p>
            </div>
          </div>
          <div className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { id: 'full_name', label: t('onboarding.full_name'), key: 'full_name' as const },
                  { id: 'agency_name', label: t('onboarding.agency_name'), key: 'agency_name' as const },
                  { id: 'city', label: t('onboarding.city'), key: 'city' as const },
                ].map(({ id, label, key }) => (
                  <div key={id} className="space-y-1.5">
                    <Label htmlFor={id} className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</Label>
                    <Input id={id} {...register(key)} className="rounded-lg" />
                    {errors[key] && <p className="text-xs text-destructive">{errors[key]?.message}</p>}
                  </div>
                ))}
                <div className="space-y-1.5">
                  <Label htmlFor="preferred_tone" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('onboarding.tone')}</Label>
                  <div className="relative">
                    <select id="preferred_tone" {...register('preferred_tone')} className="flex h-10 w-full appearance-none rounded-lg border border-input bg-background pl-3 pr-8 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring">
                      <option value="formal">{t('onboarding.tone_formal')}</option>
                      <option value="mixed">{t('onboarding.tone_mixed')}</option>
                      <option value="casual">{t('onboarding.tone_casual')}</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                  </div>
                  {watchedTone && <p className="text-xs text-muted-foreground">{toneDesc[language]?.[watchedTone]}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="language" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('settings.language_label')}</Label>
                  <div className="relative">
                    <select id="language" {...register('language')} className="flex h-10 w-full appearance-none rounded-lg border border-input bg-background pl-3 pr-8 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring">
                      <option value="hr">{t('settings.language_hr')}</option>
                      <option value="en">{t('settings.language_en')}</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              </div>
              <button type="submit" disabled={loading} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 cursor-pointer transition-colors">
                {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {t('settings.save_btn')}
              </button>
            </form>
          </div>
        </div>
      </motion.div>

      {/* Account */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.25 }}>
        <div className="rounded-2xl border bg-card overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b bg-muted/20">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-semibold">{t('settings.account')}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-5">
              {[
                { label: t('settings.member_since'), value: profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '—' },
                { label: t('stats.total_generated'), value: generations.length },
                { label: t('stats.active_clients'), value: clients.filter((c) => c.status !== 'closed' && c.status !== 'lost').length },
                { label: t('settings.plan'), value: planLabel },
              ].map((item, i) => (
                <div key={i}>
                  <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                  <p className="text-sm font-semibold">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Change Password */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12, duration: 0.25 }}>
        <div className="rounded-2xl border bg-card overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b bg-muted/20">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30">
              <Lock className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <p className="text-sm font-semibold">{language === 'hr' ? 'Promjena lozinke' : 'Change password'}</p>
              <p className="text-xs text-muted-foreground">{language === 'hr' ? 'Ažurirajte svoju lozinku' : 'Update your account password'}</p>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-3">
              {[
                { id: 'pw-current', label: language === 'hr' ? 'Trenutna lozinka' : 'Current password', key: 'current' as const },
                { id: 'pw-next', label: language === 'hr' ? 'Nova lozinka' : 'New password', key: 'next' as const },
                { id: 'pw-confirm', label: language === 'hr' ? 'Potvrdi novu lozinku' : 'Confirm new password', key: 'confirm' as const },
              ].map(({ id, label, key }) => (
                <div key={id} className="space-y-1.5">
                  <Label htmlFor={id} className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</Label>
                  <Input
                    id={id}
                    type="password"
                    value={pwForm[key]}
                    onChange={(e) => setPwForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="rounded-lg"
                    autoComplete="new-password"
                  />
                </div>
              ))}
            </div>
            <button
              onClick={handlePasswordChange}
              disabled={pwLoading || !pwForm.current || !pwForm.next || !pwForm.confirm}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              {pwLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {language === 'hr' ? 'Promijeni lozinku' : 'Change password'}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Export */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14, duration: 0.25 }}>
        <div className="rounded-2xl border bg-card overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b bg-muted/20">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <Download className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-semibold">{t('settings.export_title')}</p>
              <p className="text-xs text-muted-foreground">{t('settings.export_desc')}</p>
            </div>
          </div>
          <div className="p-6 space-y-3">
            <button onClick={handleExport} disabled={exporting} className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors cursor-pointer disabled:opacity-50">
              {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
              {exporting ? (language === 'hr' ? 'Izvoz u tijeku...' : 'Exporting...') : t('settings.export_btn')}
            </button>
            <p className="text-xs text-muted-foreground">
              {language === 'hr'
                ? 'Izvoz uključuje sve vaše osobne podatke u skladu s GDPR-om (čl. 20).'
                : 'Export includes all your personal data in compliance with GDPR (Art. 20).'}
            </p>
          </div>
        </div>
      </motion.div>
      {/* Danger Zone */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22, duration: 0.25 }}>
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-destructive/20">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10">
              <Trash2 className="h-4 w-4 text-destructive" />
            </div>
            <div>
              <p className="text-sm font-semibold text-destructive">{t('settings.delete_title')}</p>
              <p className="text-xs text-muted-foreground">{t('settings.delete_desc')}</p>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-sm text-muted-foreground">{t('settings.delete_warning')}</p>
            <div className="space-y-1.5">
              <Label htmlFor="delete-confirm" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {t('settings.delete_confirm_label')}
              </Label>
              <Input
                id="delete-confirm"
                type="email"
                value={deleteConfirmEmail}
                onChange={(e) => setDeleteConfirmEmail(e.target.value)}
                placeholder={t('settings.delete_confirm_placeholder')}
                className="rounded-lg border-destructive/30 focus:ring-destructive/30"
                autoComplete="off"
              />
            </div>
            <button
              onClick={handleDelete}
              disabled={deleting || deleteConfirmEmail !== user?.email}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              {deleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {deleting ? t('settings.deleting') : t('settings.delete_btn')}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
