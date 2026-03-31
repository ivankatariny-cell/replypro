'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
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
import { ChevronDown, ChevronUp, X, LayoutTemplate, Sparkles } from 'lucide-react'
import type { GenerateResponse, Template } from '@/types'

export default function DashboardPage() {
  return <Suspense><DashboardContent /></Suspense>
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
        .then((r) => r.json())
        .then((d) => {
          if (d.status === 'active' && subscription) {
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
    (subscription?.status === 'trial' && subscription.trial_generations_used < subscription.trial_generations_limit)

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
        body: JSON.stringify({ message: message.trim(), client_id: selectedClient, property_id: selectedProperty, template_context: templateContext }),
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
        setSubscription({ ...subscription, trial_generations_used: subscription.trial_generations_used + 1 })
      }
      addGeneration({
        id: crypto.randomUUID(), user_id: '', original_message: message.trim(),
        reply_professional: data.professional, reply_friendly: data.friendly, reply_direct: data.direct,
        detected_language: data.detected_language, client_id: selectedClient, created_at: new Date().toISOString(),
      })
    } catch { toast(t('errors.generation_failed'), 'error') }
    setLoading(false)
  }

  const firstName = profile?.full_name?.split(' ')[0] || ''

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {firstName ? `${t('dashboard.welcome')}, ${firstName}` : t('nav.dashboard')}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{t('dashboard.subtitle') || 'Generate AI-powered replies for your clients'}</p>
      </div>

      <StatsCards />
      <TrialBanner />

      {/* Generator */}
      <div className="rounded-2xl border bg-card overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b bg-muted/20">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">AI Reply Generator</p>
            <p className="text-[11px] text-muted-foreground">Paste a client message, get 3 tones</p>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Client</label>
              <ClientSelector value={selectedClient} onChange={setSelectedClient} />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Property</label>
              <PropertySelector value={selectedProperty} onChange={setSelectedProperty} />
            </div>
          </div>

          <div>
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer"
            >
              <LayoutTemplate className="h-3.5 w-3.5" />
              {showTemplates ? t('dashboard.hide_templates') : t('dashboard.show_templates')}
              {showTemplates ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </button>
            {showTemplates && <div className="mt-2"><TemplateSelector onSelect={handleTemplateSelect} /></div>}
          </div>

          {templateContext && (
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-3 py-1">
              <span className="text-xs font-medium text-primary">{t('dashboard.template_active')}</span>
              <button onClick={() => setTemplateContext(null)} className="text-primary/60 hover:text-primary cursor-pointer" aria-label="Clear">
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          <div className="border-t" />

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
              {t('dashboard.message_label') || 'Client Message'}
            </label>
            <MessageInput value={message} onChange={setMessage} disabled={loading} />
          </div>

          <GenerateButton onClick={handleGenerate} loading={loading} disabled={!message.trim() || !canGenerate} />
        </div>
      </div>

      {/* Results */}
      {(replies || loading) && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold">Generated Replies</p>
            <div className="flex-1 h-px bg-border" />
          </div>
          <ReplyGrid professional={replies?.professional ?? null} friendly={replies?.friendly ?? null} direct={replies?.direct ?? null} loading={loading} />
        </div>
      )}
    </div>
  )
}