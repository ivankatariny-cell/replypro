'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { useTranslation } from '@/hooks/useTranslation'
import { useSubscription } from '@/hooks/useSubscription'
import { useProfile } from '@/hooks/useProfile'
import { useAppStore } from '@/store/app-store'
import { useToast } from '@/components/ui/toast'
import { TrialBanner } from '@/components/dashboard/TrialBanner'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { MessageInput } from '@/components/dashboard/MessageInput'
import { GenerateButton } from '@/components/dashboard/GenerateButton'
import { ReplyGrid } from '@/components/dashboard/ReplyGrid'
import { TemplateSelector } from '@/components/dashboard/TemplateSelector'
import { ClientSelector } from '@/components/dashboard/ClientSelector'
import { PropertySelector } from '@/components/dashboard/PropertySelector'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp, X, LayoutTemplate } from 'lucide-react'
import type { GenerateResponse, Template } from '@/types'

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardContent />
    </Suspense>
  )
}

function DashboardContent() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const { subscription } = useSubscription()
  const { profile } = useProfile()
  const setSubscription = useAppStore((s) => s.setSubscription)
  const addGeneration = useAppStore((s) => s.addGeneration)

  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [replies, setReplies] = useState<GenerateResponse | null>(null)
  const [selectedClient, setSelectedClient] = useState<string | null>(null)
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null)
  const [templateContext, setTemplateContext] = useState<string | null>(null)
  const [showTemplates, setShowTemplates] = useState(false)

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      fetch('/api/stripe/sync', { method: 'POST' })
        .then((res) => res.json())
        .then((data) => {
          if (data.status === 'active' && subscription) {
            setSubscription({ ...subscription, status: 'active' })
            toast('Pro aktiviran!', 'success')
          }
        })
        .catch(() => {})
      window.history.replaceState({}, '', '/dashboard')
    }
  }, [searchParams, subscription, setSubscription, toast])

  const canGenerate =
    subscription?.status === 'active' ||
    (subscription?.status === 'trial' &&
      subscription.trial_generations_used < subscription.trial_generations_limit)

  const handleTemplateSelect = (template: Template) => {
    setTemplateContext(template.prompt_context)
    setShowTemplates(false)
    toast(t('dashboard.template_applied'), 'info')
  }

  const handleGenerate = async () => {
    if (!message.trim() || !canGenerate) return
    setLoading(true)
    setReplies(null)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message.trim(),
          client_id: selectedClient,
          property_id: selectedProperty,
          template_context: templateContext,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        toast(err.error || t('errors.generation_failed'), 'error')
        setLoading(false)
        return
      }
      const data: GenerateResponse = await res.json()
      setReplies(data)
      setTemplateContext(null)
      if (subscription?.status === 'trial') {
        setSubscription({
          ...subscription,
          trial_generations_used: subscription.trial_generations_used + 1,
        })
      }
      addGeneration({
        id: crypto.randomUUID(),
        user_id: '',
        original_message: message.trim(),
        reply_professional: data.professional,
        reply_friendly: data.friendly,
        reply_direct: data.direct,
        detected_language: data.detected_language,
        client_id: selectedClient,
        created_at: new Date().toISOString(),
      })
    } catch {
      toast(t('errors.generation_failed'), 'error')
    }
    setLoading(false)
  }

  const firstName = profile?.full_name?.split(' ')[0] || ''

  return (
    <div className="space-y-5">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        {firstName && (
          <p className="text-xl font-semibold">
            {t('dashboard.welcome')},{' '}
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="gradient-text"
            >
              {firstName}
            </motion.span>
          </p>
        )}
        <p className="text-sm text-muted-foreground mt-0.5">{t('dashboard.subtitle') || 'Generate AI replies for your clients'}</p>
      </motion.div>

      <StatsCards />
      <TrialBanner />

      {/* Generator card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-xl border bg-card overflow-hidden"
      >
        {/* Context selectors */}
        <div className="px-5 py-4 border-b bg-muted/20">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Context</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <ClientSelector value={selectedClient} onChange={setSelectedClient} />
            <PropertySelector value={selectedProperty} onChange={setSelectedProperty} />
          </div>

          {/* Template toggle */}
          <div className="mt-3">
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer"
            >
              <LayoutTemplate className="h-3.5 w-3.5" />
              {showTemplates ? t('dashboard.hide_templates') : t('dashboard.show_templates')}
              {showTemplates ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
            {showTemplates && (
              <div className="mt-2">
                <TemplateSelector onSelect={handleTemplateSelect} />
              </div>
            )}
          </div>

          {templateContext && (
            <div className="mt-3 flex items-center justify-between rounded-lg bg-primary/8 border border-primary/20 px-3 py-2">
              <p className="text-xs text-primary font-medium">{t('dashboard.template_active')}</p>
              <button
                onClick={() => setTemplateContext(null)}
                className="flex h-5 w-5 items-center justify-center rounded hover:bg-primary/10 transition-colors cursor-pointer"
                aria-label={t('dashboard.clear')}
              >
                <X className="h-3 w-3 text-primary" />
              </button>
            </div>
          )}
        </div>

        {/* Message input */}
        <div className="px-5 py-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t('dashboard.message_label') || 'Client Message'}
          </p>
          <MessageInput value={message} onChange={setMessage} disabled={loading} />
          <GenerateButton onClick={handleGenerate} loading={loading} disabled={!message.trim() || !canGenerate} />
        </div>
      </motion.div>

      {/* Results */}
      <AnimatePresence>
        {(replies || false) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ReplyGrid
        professional={replies?.professional ?? null}
        friendly={replies?.friendly ?? null}
        direct={replies?.direct ?? null}
        loading={loading}
      />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
