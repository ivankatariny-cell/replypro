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
import { Card, CardContent } from '@/components/ui/card'
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

  const canGenerate = subscription?.status === 'active' ||
    (subscription?.status === 'trial' && (subscription.trial_generations_used < subscription.trial_generations_limit))

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

  return (
    <div className="space-y-6">
      {profile && (
        <p className="text-lg font-medium">
          {t('dashboard.welcome')}, {profile.full_name?.split(' ')[0] || ''}
        </p>
      )}

      <StatsCards />
      <TrialBanner />

      <Card>
        <CardContent className="p-4 md:p-6 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <ClientSelector value={selectedClient} onChange={setSelectedClient} />
            <PropertySelector value={selectedProperty} onChange={setSelectedProperty} />
          </div>

          <div>
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="text-sm font-medium text-primary hover:underline cursor-pointer mb-2"
            >
              {showTemplates ? t('dashboard.hide_templates') : t('dashboard.show_templates')}
            </button>
            {showTemplates && <TemplateSelector onSelect={handleTemplateSelect} />}
          </div>

          {templateContext && (
            <div className="rounded-lg bg-primary/5 border border-primary/20 px-3 py-2 text-xs text-primary">
              {t('dashboard.template_active')}
              <button onClick={() => setTemplateContext(null)} className="ml-2 underline cursor-pointer">{t('dashboard.clear')}</button>
            </div>
          )}

          <MessageInput value={message} onChange={setMessage} disabled={loading} />
          <GenerateButton onClick={handleGenerate} loading={loading} disabled={!message.trim() || !canGenerate} />
        </CardContent>
      </Card>

      <ReplyGrid
        professional={replies?.professional ?? null}
        friendly={replies?.friendly ?? null}
        direct={replies?.direct ?? null}
        loading={loading}
      />
    </div>
  )
}
