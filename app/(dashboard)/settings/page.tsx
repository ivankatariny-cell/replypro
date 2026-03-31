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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, User, Shield, Download, Eye, Palette } from 'lucide-react'

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
  const [showPreview, setShowPreview] = useState(false)

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const watchedName = watch('full_name')
  const watchedAgency = watch('agency_name')
  const watchedCity = watch('city')
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
      profile: profile,
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
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold">{t('settings.title')}</h1>
        {subscription && (
          <Badge variant={subscription.status === 'active' ? 'default' : 'outline'}>
            {subscription.status === 'active' ? 'Pro' : 'Free'}
          </Badge>
        )}
      </div>

      {/* Profile Card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">{t('settings.profile_section')}</CardTitle>
                <CardDescription>{t('settings.profile_desc')}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="full_name">{t('onboarding.full_name')}</Label>
                  <Input id="full_name" {...register('full_name')} />
                  {errors.full_name && <p className="text-sm text-destructive">{errors.full_name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="agency_name">{t('onboarding.agency_name')}</Label>
                  <Input id="agency_name" {...register('agency_name')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">{t('onboarding.city')}</Label>
                  <Input id="city" {...register('city')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preferred_tone">{t('onboarding.tone')}</Label>
                  <select id="preferred_tone" {...register('preferred_tone')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer">
                    <option value="formal">{t('onboarding.tone_formal')}</option>
                    <option value="mixed">{t('onboarding.tone_mixed')}</option>
                    <option value="casual">{t('onboarding.tone_casual')}</option>
                  </select>
                  {watchedTone && (
                    <p className="text-xs text-muted-foreground">{toneDescriptions[language]?.[watchedTone]}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button type="submit" className="cursor-pointer" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t('settings.save_btn')}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowPreview(!showPreview)} className="cursor-pointer">
                  <Eye className="mr-2 h-4 w-4" />
                  {t('settings.preview')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* Signature Preview */}
      {showPreview && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Palette className="h-4 w-4 text-primary" />
                {t('settings.signature_preview')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg bg-muted/50 p-4 text-sm space-y-1">
                <p className="italic text-muted-foreground">{t('settings.preview_example')}</p>
                <div className="border-t pt-2 mt-2">
                  <p className="font-medium">{watchedName || 'Ime Prezime'}</p>
                  <p className="text-xs text-muted-foreground">{watchedAgency || 'Agencija'}, {watchedCity || 'Grad'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Account Info */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.3 }}>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">{t('settings.account')}</CardTitle>
                <CardDescription>{user?.email}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">{t('settings.member_since')}</p>
                <p className="font-medium">{profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '—'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{t('stats.total_generated')}</p>
                <p className="font-medium">{generations.length}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{t('stats.active_clients')}</p>
                <p className="font-medium">{clients.filter((c) => c.status !== 'closed' && c.status !== 'lost').length}</p>
              </div>
              <div>
                <p className="text-muted-foreground">{t('settings.plan')}</p>
                <p className="font-medium capitalize">{subscription?.status || 'trial'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Data Export */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.3 }}>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                <Download className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <CardTitle className="text-lg">{t('settings.export_title')}</CardTitle>
                <CardDescription>{t('settings.export_desc')}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={handleExport} className="cursor-pointer">
              <Download className="mr-2 h-4 w-4" />
              {t('settings.export_btn')}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
