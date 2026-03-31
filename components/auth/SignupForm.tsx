'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { useTranslation } from '@/hooks/useTranslation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MessageSquare, Loader2, AlertCircle, Check } from 'lucide-react'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  terms: z.literal(true, { message: 'Required' }),
})

type FormData = z.infer<typeof schema>

export function SignupForm() {
  const { t } = useTranslation()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { emailRedirectTo: `${window.location.origin}/onboarding` },
    })
    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }
    router.push('/onboarding')
    router.refresh()
  }

  const perks = [
    '10 free AI generations',
    'Client & property management',
    'No credit card required',
  ]

  return (
    <div className="w-full max-w-sm">
      {/* Logo (mobile only) */}
      <div className="flex items-center gap-2 mb-8 lg:hidden">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <MessageSquare className="h-4 w-4" />
        </div>
        <span className="text-lg font-bold font-heading">ReplyPro</span>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold font-heading">{t('nav.signup')}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t('auth.signup_subtitle') || 'Create your free account and start in minutes.'}
        </p>
      </div>

      {/* Perks */}
      <div className="flex flex-col gap-1.5 mb-6">
        {perks.map((perk) => (
          <div key={perk} className="flex items-center gap-2">
            <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Check className="h-2.5 w-2.5 text-primary" />
            </div>
            <span className="text-xs text-muted-foreground">{perk}</span>
          </div>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 mb-5">
          <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="agent@example.com"
            autoComplete="email"
            {...register('email')}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="Min. 6 characters"
            {...register('password')}
          />
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        <div className="flex items-start gap-2.5">
          <input
            type="checkbox"
            id="terms"
            {...register('terms')}
            className="mt-0.5 h-4 w-4 rounded border-input cursor-pointer accent-primary"
          />
          <Label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer leading-snug">
            I agree to the{' '}
            <a href="#" className="text-primary hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-primary hover:underline">Privacy Policy</a>
          </Label>
        </div>
        {errors.terms && <p className="text-xs text-destructive">{errors.terms.message}</p>}

        <Button type="submit" className="w-full cursor-pointer" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t('nav.signup')}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {t('nav.login')}?{' '}
        <Link href="/login" className="text-primary font-medium hover:underline cursor-pointer">
          {t('nav.login')}
        </Link>
      </p>
    </div>
  )
}
