'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { Loader2 } from 'lucide-react'

const schema = z.object({
  full_name: z.string().min(2).max(100),
  agency_name: z.string().min(2).max(200),
  city: z.string().min(2).max(100),
  preferred_tone: z.enum(['formal', 'mixed', 'casual']),
})

type FormData = z.infer<typeof schema>

export function OnboardingForm() {
  const { t } = useTranslation()
  const router = useRouter()
  const { user } = useUser()
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { preferred_tone: 'mixed' },
  })

  const onSubmit = async (data: FormData) => {
    if (!user) return
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      user_id: user.id,
      full_name: data.full_name,
      agency_name: data.agency_name,
      city: data.city,
      preferred_tone: data.preferred_tone,
      onboarding_completed: true,
    })
    if (!error) {
      router.push('/dashboard')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="font-heading">{t('onboarding.title')}</CardTitle>
          <CardDescription>{t('onboarding.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">{t('onboarding.full_name')}</Label>
              <Input id="full_name" {...register('full_name')} />
              {errors.full_name && <p className="text-sm text-destructive">{errors.full_name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="agency_name">{t('onboarding.agency_name')}</Label>
              <Input id="agency_name" {...register('agency_name')} />
              {errors.agency_name && <p className="text-sm text-destructive">{errors.agency_name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">{t('onboarding.city')}</Label>
              <Input id="city" {...register('city')} />
              {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="preferred_tone">{t('onboarding.tone')}</Label>
              <select id="preferred_tone" {...register('preferred_tone')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer">
                <option value="formal">{t('onboarding.tone_formal')}</option>
                <option value="mixed">{t('onboarding.tone_mixed')}</option>
                <option value="casual">{t('onboarding.tone_casual')}</option>
              </select>
            </div>
            <Button type="submit" className="w-full cursor-pointer" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('onboarding.save_btn')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
