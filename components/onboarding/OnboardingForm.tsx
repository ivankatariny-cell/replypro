'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/hooks/useUser'
import { useTranslation } from '@/hooks/useTranslation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, MessageSquare, ArrowRight, Sparkles, Check } from 'lucide-react'

const schema = z.object({
  full_name: z.string().min(2).max(100),
  agency_name: z.string().min(2).max(200),
  city: z.string().min(2).max(100),
  preferred_tone: z.enum(['formal', 'mixed', 'casual']),
})

type FormData = z.infer<typeof schema>

export function OnboardingForm() {
  const { t, language } = useTranslation()
  const router = useRouter()
  const { user } = useUser()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [demoLoading, setDemoLoading] = useState(false)
  const [demoReplies, setDemoReplies] = useState<{ professional: string; friendly: string; direct: string } | null>(null)

  const { register, handleSubmit, getValues, formState: { errors, isValid } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { preferred_tone: 'mixed' },
    mode: 'onChange',
  })

  const saveProfile = async (data: FormData) => {
    if (!user) return
    setLoading(true)
    const supabase = createClient()
    await supabase.from('profiles').upsert({
      id: user.id,
      full_name: data.full_name,
      agency_name: data.agency_name,
      city: data.city,
      preferred_tone: data.preferred_tone,
      onboarding_completed: true,
    })
    setLoading(false)
    setStep(2)
  }

  const handleDemo = async () => {
    setDemoLoading(true)
    try {
      const sampleMessage = language === 'hr'
        ? 'Dobar dan, zanima me stan u centru grada, 3 sobe, do 200.000€. Imate li nešto?'
        : 'Hi, I am looking for a 3-bedroom apartment downtown, up to €200,000. Do you have anything?'
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: sampleMessage }),
      })
      if (res.ok) {
        const data = await res.json()
        setDemoReplies(data)
      }
    } catch {}
    setDemoLoading(false)
  }

  const goToDashboard = () => {
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {step > s ? <Check className="h-4 w-4" /> : s}
              </div>
              {s < 2 && <div className={`h-0.5 w-12 rounded ${step > 1 ? 'bg-primary' : 'bg-muted'}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
              <Card>
                <CardHeader className="text-center">
                  <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                    <MessageSquare className="h-7 w-7 text-primary" />
                  </div>
                  <CardTitle className="font-heading text-xl">{t('onboarding.title')}</CardTitle>
                  <CardDescription>{t('onboarding.subtitle')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(saveProfile)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">{t('onboarding.full_name')}</Label>
                      <Input id="full_name" placeholder="Marko Horvat" {...register('full_name')} />
                      {errors.full_name && <p className="text-sm text-destructive">{errors.full_name.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="agency_name">{t('onboarding.agency_name')}</Label>
                      <Input id="agency_name" placeholder="Premium Nekretnine" {...register('agency_name')} />
                      {errors.agency_name && <p className="text-sm text-destructive">{errors.agency_name.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">{t('onboarding.city')}</Label>
                      <Input id="city" placeholder="Zagreb" {...register('city')} />
                      {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="preferred_tone">{t('onboarding.tone')}</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['formal', 'mixed', 'casual'] as const).map((tone) => (
                          <label key={tone} className="cursor-pointer">
                            <input type="radio" value={tone} {...register('preferred_tone')} className="peer sr-only" />
                            <div className="rounded-lg border-2 border-input p-3 text-center text-sm transition-colors peer-checked:border-primary peer-checked:bg-primary/5 hover:bg-accent">
                              <p className="font-medium">{t(`onboarding.tone_${tone}`)}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                    <Button type="submit" className="w-full cursor-pointer" disabled={loading || !isValid}>
                      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
                      {t('onboarding.next')}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
              <Card>
                <CardHeader className="text-center">
                  <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                    <Sparkles className="h-7 w-7 text-primary" />
                  </div>
                  <CardTitle className="font-heading text-xl">{t('onboarding.try_title')}</CardTitle>
                  <CardDescription>{t('onboarding.try_desc')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!demoReplies ? (
                    <>
                      <div className="rounded-lg bg-muted/50 p-4">
                        <p className="text-xs text-muted-foreground mb-1">{t('onboarding.sample_label')}</p>
                        <p className="text-sm italic">
                          {language === 'hr'
                            ? '"Dobar dan, zanima me stan u centru grada, 3 sobe, do 200.000€. Imate li nešto?"'
                            : '"Hi, I\'m looking for a 3-bedroom apartment downtown, up to €200,000. Do you have anything?"'}
                        </p>
                      </div>
                      <Button onClick={handleDemo} className="w-full cursor-pointer" disabled={demoLoading}>
                        {demoLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        {t('onboarding.generate_demo')}
                      </Button>
                      <button onClick={goToDashboard} className="w-full text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                        {t('onboarding.skip')}
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="space-y-3">
                        {(['professional', 'friendly', 'direct'] as const).map((tone) => (
                          <motion.div key={tone} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: tone === 'professional' ? 0 : tone === 'friendly' ? 0.15 : 0.3 }}>
                            <div className="rounded-lg border p-3">
                              <Badge variant={tone} className="mb-2">{t(`dashboard.tone_${tone}`)}</Badge>
                              <p className="text-sm">{demoReplies[tone]}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                      <div className="rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 p-3 text-center">
                        <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                          {t('onboarding.first_done')}
                        </p>
                      </div>
                      <Button onClick={goToDashboard} className="w-full cursor-pointer">
                        {t('onboarding.go_dashboard')}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
