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
import { Badge } from '@/components/ui/badge'
import { Loader2, ArrowRight, Sparkles, Check } from 'lucide-react'
import Image from 'next/image'

const schema = z.object({
  full_name: z.string().min(2).max(100),
  agency_name: z.string().min(2).max(200),
  city: z.string().min(2).max(100),
  preferred_tone: z.enum(['formal', 'mixed', 'casual']),
})

type FormData = z.infer<typeof schema>

const tones = [
  { value: 'formal', labelHr: 'Formalno', labelEn: 'Formal', descHr: '"Vi" forma', descEn: 'Formal address' },
  { value: 'mixed', labelHr: 'Mješovito', labelEn: 'Mixed', descHr: 'Balans', descEn: 'Balanced' },
  { value: 'casual', labelHr: 'Opušteno', labelEn: 'Casual', descHr: '"Ti" forma', descEn: 'Informal' },
] as const

export function OnboardingForm() {
  const { t, language } = useTranslation()
  const router = useRouter()
  const { user } = useUser()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [demoLoading, setDemoLoading] = useState(false)
  const [demoReplies, setDemoReplies] = useState<{ professional: string; friendly: string; direct: string } | null>(null)

  const { register, handleSubmit, watch, formState: { errors, isValid } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { preferred_tone: 'mixed' },
    mode: 'onChange',
  })

  const watchedTone = watch('preferred_tone')

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
        body: JSON.stringify({ message: sampleMessage, demo: true }),
      })
      if (res.ok) setDemoReplies(await res.json())
    } catch {}
    setDemoLoading(false)
  }

  const goToDashboard = () => {
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10 bg-background">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Image src="/icon.png" alt="ReplyPro" width={36} height={36} className="rounded-xl" />
          <span className="text-xl font-bold font-heading">ReplyPro</span>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-all ${
                step > s
                  ? 'bg-primary text-primary-foreground'
                  : step === s
                  ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                  : 'bg-muted text-muted-foreground'
              }`}>
                {step > s ? <Check className="h-4 w-4" /> : s}
              </div>
              {s < 2 && (
                <div className={`h-0.5 w-16 rounded-full transition-colors ${step > 1 ? 'bg-primary' : 'bg-muted'}`} />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.25 }}
            >
              <div className="rounded-xl border bg-card overflow-hidden">
                <div className="px-6 py-5 border-b bg-muted/20 text-center">
                  <h1 className="text-xl font-bold font-heading">{t('onboarding.title')}</h1>
                  <p className="text-sm text-muted-foreground mt-1">{t('onboarding.subtitle')}</p>
                </div>
                <div className="px-6 py-5">
                  <form onSubmit={handleSubmit(saveProfile)} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="full_name">{t('onboarding.full_name')}</Label>
                      <Input id="full_name" placeholder="Marko Horvat" {...register('full_name')} />
                      {errors.full_name && <p className="text-xs text-destructive">{errors.full_name.message}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="agency_name">{t('onboarding.agency_name')}</Label>
                      <Input id="agency_name" placeholder="Premium Nekretnine" {...register('agency_name')} />
                      {errors.agency_name && <p className="text-xs text-destructive">{errors.agency_name.message}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="city">{t('onboarding.city')}</Label>
                      <Input id="city" placeholder="Zagreb" {...register('city')} />
                      {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>{t('onboarding.tone')}</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {tones.map((tone) => (
                          <label key={tone.value} className="cursor-pointer">
                            <input type="radio" value={tone.value} {...register('preferred_tone')} className="peer sr-only" />
                            <div className={`rounded-lg border-2 p-3 text-center text-xs transition-all peer-checked:border-primary peer-checked:bg-primary/5 hover:bg-accent ${
                              watchedTone === tone.value ? 'border-primary bg-primary/5' : 'border-input'
                            }`}>
                              <p className="font-semibold">{language === 'hr' ? tone.labelHr : tone.labelEn}</p>
                              <p className="text-muted-foreground mt-0.5">{language === 'hr' ? tone.descHr : tone.descEn}</p>
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
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className="rounded-xl border bg-card overflow-hidden">
                <div className="px-6 py-5 border-b bg-muted/20 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold font-heading">{t('onboarding.try_title')}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{t('onboarding.try_desc')}</p>
                </div>
                <div className="px-6 py-5 space-y-4">
                  {!demoReplies ? (
                    <>
                      <div className="rounded-lg bg-muted/50 border px-4 py-3">
                        <p className="text-xs font-semibold text-muted-foreground mb-1.5">{t('onboarding.sample_label')}</p>
                        <p className="text-sm italic text-foreground/80">
                          {language === 'hr'
                            ? '"Dobar dan, zanima me stan u centru grada, 3 sobe, do 200.000€. Imate li nešto?"'
                            : '"Hi, I\'m looking for a 3-bedroom apartment downtown, up to €200,000. Do you have anything?"'}
                        </p>
                      </div>
                      <Button onClick={handleDemo} className="w-full cursor-pointer" disabled={demoLoading}>
                        {demoLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        {t('onboarding.generate_demo')}
                      </Button>
                      <button
                        onClick={goToDashboard}
                        className="w-full text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors text-center"
                      >
                        {t('onboarding.skip')}
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2.5">
                        {(['professional', 'friendly', 'direct'] as const).map((tone, i) => (
                          <motion.div
                            key={tone}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.12 }}
                          >
                            <div className="rounded-lg border bg-muted/30 p-3">
                              <Badge variant={tone} className="mb-2 text-xs">{t(`dashboard.tone_${tone}`)}</Badge>
                              <p className="text-sm leading-relaxed">{demoReplies[tone]}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                      <div className="rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/40 px-4 py-3 text-center">
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
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
