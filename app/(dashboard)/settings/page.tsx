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
import { Loader2, User, Shield, Download, ChevronDown } from 'lucide-react'

const schema = z.object({
  full_name: z.string().min(2).max(100),
  agency_name: z.string().min(2).max(200),
  city: z.string().min(2).max(100),
  preferred_tone: z.enum(['formal', 'mixed', 'casual']),
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
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) })
  const watchedTone = watch('preferred_tone')

  useEffect(() => {
    if (profile) reset({ full_name: profile.full_name || '', agency_name: profile.agency_name || '', city: profile.city || '', preferred_tone: profile.preferred_tone || 'mixed' })
  }, [profile, reset])

  const onSubmit = async (data: FormData) => {
    if (!user) return
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('profiles').update({ full_name: data.full_name, agency_name: data.agency_name, city: data.city, preferred_tone: data.preferred_tone }).eq('id', user.id)
    if (!error) toast(t('settings.saved'), 'success')
    setLoading(false)
  }

  const handleExport = () => {
    const data = { profile, generations: generations.length, clients: clients.map((c) => ({ name: c.full_name, status: c.status, city: c.city })), exported_at: new Date().toISOString() }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `replypro-export-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast(t('settings.exported'), 'success')
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
          <p className="text-sm text-muted-foreground mt-1">Manage your profile and account</p>
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
          <div className="p-6">
            <button onClick={handleExport} className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors cursor-pointer">
              <Download className="h-3.5 w-3.5" />
              {t('settings.export_btn')}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
