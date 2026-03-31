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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Loader2, User, Shield, Download } from 'lucide-react'

const schema = z.object({
  full_name: z.string().min(2).max(100),
  agency_name: z.string().min(2).max(200),
  city: z.string().min(2).max(100),
  preferred_tone: z.enum(['formal', 'mixed', 'casual']),
})

type FormData = z.infer<typeof schema>

function SectionCard({ icon: Icon, iconBg, iconColor, title, description, children }: {
  icon: React.ElementType
  iconBg: string
  iconColor: string
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b bg-muted/20">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
        <div>
          <p className="text-sm font-semibold">{title}</p>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  )
}

export default function SettingsPage() {
  const { t, language } = useTranslation()
  const { toast } = useToast()
  const { user } = useUser()
  const { profile } = useProfile()
  const { subscription } = useSubscription()
  const generations = useAppStore((s) => s.generations)
  const clients = useAppStore((s) => s.clients)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const watchedTone = watch('preferred_tone')

  useEffect(() => {
    if (profile) {
      reset({
        full_name: profile.full_name || '',
        agency_name: profile.agency_name || '',
        city: profile.city || '',
        preferred_tone: profile.preferred_tone || 'mixed',
      })
    }
  }, [profile, reset])

  const onSubmit = async (data: FormData) => {
    if (!user) return
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('profiles').update({
      full_name: data.full_name,
      agency_name: data.agency_name,
      city: data.city,
      preferred_tone: data.preferred_tone,
    }).eq('id', user.id)
    if (!error) toast(t('settings.saved'), 'success')
    setLoading(false)
  }

  const handleExport = () => {
    const data = {
      profile,
      generations: generations.length,
      clients: clients.map((c) => ({ name: c.full_name, status: c.status, city: c.city })),
      exported_at: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `replypro-export-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast(t('settings.exported'), 'success')
  }

  const toneDescriptions: Record<string, Record<string, string>> = {
    hr: { formal: 'Koristi "Vi" formu, profesionalan ton', mixed: 'Balans profesionalnog i prijateljskog', casual: 'Opušten, koristi "ti" formu' },
    en: { formal: 'Uses formal address, professional tone', mixed: 'Balance of professional and friendly', casual: 'Relaxed, uses informal address' },
  }

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">{t('settings.title')}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your profile and preferences</p>
        </div>
        {subscription && (
          <Badge variant={subscription.status === 'active' ? 'default' : 'outline'}>
            {subscription.status === 'active' ? 'Pro' : 'Free'}
          </Badge>
        )}
      </div>

      {/* Profile */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        <SectionCard
          icon={User}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title={t('settings.profile_section')}
          description={t('settings.profile_desc')}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="full_name">{t('onboarding.full_name')}</Label>
                <Input id="full_name" {...register('full_name')} />
                {errors.full_name && <p className="text-xs text-destructive">{errors.full_name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="agency_name">{t('onboarding.agency_name')}</Label>
                <Input id="agency_name" {...register('agency_name')} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="city">{t('onboarding.city')}</Label>
                <Input id="city" {...register('city')} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="preferred_tone">{t('onboarding.tone')}</Label>
                <select
                  id="preferred_tone"
                  {...register('preferred_tone')}
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="formal">{t('onboarding.tone_formal')}</option>
                  <option value="mixed">{t('onboarding.tone_mixed')}</option>
                  <option value="casual">{t('onboarding.tone_casual')}</option>
                </select>
                {watchedTone && (
                  <p className="text-xs text-muted-foreground">{toneDescriptions[language]?.[watchedTone]}</p>
                )}
              </div>
            </div>
            <Button type="submit" className="cursor-pointer" disabled={loading} size="sm">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('settings.save_btn')}
            </Button>
          </form>
        </SectionCard>
      </motion.div>

      {/* Account info */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.25 }}>
        <SectionCard
          icon={Shield}
          iconBg="bg-blue-100 dark:bg-blue-900/30"
          iconColor="text-blue-600 dark:text-blue-400"
          title={t('settings.account')}
          description={user?.email}
        >
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: t('settings.member_since'), value: profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '—' },
              { label: t('stats.total_generated'), value: generations.length },
              { label: t('stats.active_clients'), value: clients.filter((c) => c.status !== 'closed' && c.status !== 'lost').length },
              { label: t('settings.plan'), value: <span className="capitalize">{subscription?.status || 'trial'}</span> },
            ].map((item, i) => (
              <div key={i}>
                <p className="text-xs text-muted-foreground mb-0.5">{item.label}</p>
                <p className="text-sm font-semibold">{item.value}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </motion.div>

      {/* Export */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16, duration: 0.25 }}>
        <SectionCard
          icon={Download}
          iconBg="bg-emerald-100 dark:bg-emerald-900/30"
          iconColor="text-emerald-600 dark:text-emerald-400"
          title={t('settings.export_title')}
          description={t('settings.export_desc')}
        >
          <Button variant="outline" onClick={handleExport} className="cursor-pointer" size="sm">
            <Download className="mr-2 h-4 w-4" />
            {t('settings.export_btn')}
          </Button>
        </SectionCard>
      </motion.div>
    </div>
  )
}
