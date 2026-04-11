'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { useTranslation } from '@/hooks/useTranslation'
import { Loader2, AlertCircle, Mail, Lock, ArrowRight, Eye, EyeOff, Check, Sparkles } from 'lucide-react'
import { motion } from 'motion/react'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  terms: z.literal(true, { errorMap: () => ({ message: 'You must accept the terms' }) }),
})

type FormData = z.infer<typeof schema>

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1]

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.07, ease },
  }),
}

const perks = [
  '10 free AI generations — no card needed',
  'Croatian & English auto-detection',
  'Client & property context-aware replies',
]

export function SignupForm() {
  const { t } = useTranslation()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

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

  return (
    <motion.div
      initial="hidden"
      animate="show"
      className="w-full space-y-5"
    >
      {/* Header */}
      <motion.div custom={0} variants={fadeUp} className="space-y-1.5">
        <div
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold mb-2"
          style={{ background: 'hsl(164 72% 32% / 0.12)', color: 'hsl(164 72% 38%)', border: '1px solid hsl(164 72% 32% / 0.2)' }}
        >
          <Sparkles className="h-3 w-3" />
          Free — no credit card
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
        <p className="text-sm text-muted-foreground">
          {t('auth.signup_subtitle') || 'Start generating perfect replies in minutes.'}
        </p>
      </motion.div>

      {/* Perks */}
      <motion.div custom={1} variants={fadeUp} className="space-y-2">
        {perks.map((perk) => (
          <div key={perk} className="flex items-center gap-2.5">
            <div
              className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full"
              style={{ background: 'hsl(164 72% 32% / 0.12)', border: '1px solid hsl(164 72% 32% / 0.2)' }}
            >
              <Check className="h-2.5 w-2.5" style={{ color: 'hsl(164 72% 38%)' }} />
            </div>
            <span className="text-xs text-muted-foreground">{perk}</span>
          </div>
        ))}
      </motion.div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2.5 rounded-xl border border-destructive/25 bg-destructive/8 px-4 py-3"
        >
          <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </motion.div>
      )}

      {/* Form */}
      <motion.form custom={2} variants={fadeUp} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium">Email</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              id="email"
              type="email"
              placeholder="agent@example.com"
              autoComplete="email"
              {...register('email')}
              className="w-full h-11 rounded-xl border border-input bg-background pl-10 pr-4 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
            />
          </div>
          {errors.email && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />{errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium">Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Min. 6 characters"
              autoComplete="new-password"
              {...register('password')}
              className="w-full h-11 rounded-xl border border-input bg-background pl-10 pr-11 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />{errors.password.message}
            </p>
          )}
        </div>

        {/* Terms */}
        <div className="space-y-1">
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative mt-0.5">
              <input
                type="checkbox"
                id="terms"
                {...register('terms')}
                className="sr-only peer"
              />
              <div className="h-4 w-4 rounded border border-input bg-background peer-checked:bg-primary peer-checked:border-primary transition-all flex items-center justify-center">
                <Check className="h-2.5 w-2.5 text-primary-foreground opacity-0 peer-checked:opacity-100 transition-opacity" />
              </div>
            </div>
            <span className="text-xs text-muted-foreground leading-relaxed">
              I agree to the{' '}
              <a href="/terms" className="text-primary hover:underline font-medium">Terms of Service</a>
              {' '}and{' '}
              <a href="/privacy" className="text-primary hover:underline font-medium">Privacy Policy</a>
            </span>
          </label>
          {errors.terms && (
            <p className="text-xs text-destructive flex items-center gap-1 pl-7">
              <AlertCircle className="h-3 w-3" />{errors.terms.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-xl text-sm font-semibold text-primary-foreground flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99] shadow-sm hover:shadow-md"
          style={{ background: loading ? undefined : 'linear-gradient(135deg, hsl(164 72% 34%) 0%, hsl(174 64% 42%) 100%)' }}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Create free account
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </motion.form>

      {/* Sign in link */}
      <motion.p custom={3} variants={fadeUp} className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer">
          Sign in
        </Link>
      </motion.p>
    </motion.div>
  )
}
