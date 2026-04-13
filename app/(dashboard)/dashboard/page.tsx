'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { AnimatePresence } from 'motion/react'
import { useTranslation } from '@/hooks/useTranslation'
import { useSubscription } from '@/hooks/useSubscription'
import { useProfile } from '@/hooks/useProfile'
import { useAppStore } from '@/store/app-store'
import { useToast } from '@/components/ui/toast'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { TrialBanner } from '@/components/dashboard/TrialBanner'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { UpcomingAppointments } from '@/components/dashboard/UpcomingAppointments'
import { MessageInput } from '@/components/dashboard/MessageInput'
import { GenerateButton } from '@/components/dashboard/GenerateButton'
import { ReplyGrid } from '@/components/dashboard/ReplyGrid'
import { BookingPrompt } from '@/components/dashboard/BookingPrompt'
import { TemplateSelector } from '@/components/dashboard/TemplateSelector'
import { ClientSelector } from '@/components/dashboard/ClientSelector'
import { PropertySelector } from '@/components/dashboard/PropertySelector'
import { ChevronDown, ChevronUp, X, LayoutTemplate, Sparkles, Keyboard, Users, Zap } from 'lucide-react'
import Link from 'next/link'
import { sanitizeMessage } from '@/lib/utils/sanitize'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import type { GenerateResponse, Template, SuggestedBooking } from '@/types'

export default function DashboardPage() {
  return <Suspense><DashboardContent /></Suspense>
}

// Detect if user is on Mac
function isMac() {
  if (typeof navigator === 'undefined') return false
  return /Mac|iPhone|iPad|iPod/.test(navigator.platform)
}

function DashboardContent() {
  const { t, language } = useTranslation()
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
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [suggestedBooking, setSuggestedBooking] = useState<SuggestedBooking | null>(null)
  const [quickReply, setQuickReply] = useState(false)
  const legendRef = useRef<HTMLDivElement>(null)
  const mac = isMac()
  const modKey = mac ? '⌘' : 'Ctrl'


  useEffect(() => {
    if (searchParams.get('focus') === 'input') {
      const el = document.getElementById('message-input')
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        el.focus()
      }
      window.history.replaceState({}, '', '/dashboard')
    }
  }, [searchParams])

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

  // Close shortcut legend on outside click
  useEffect(() => {
    if (!showShortcuts) return
    const handler = (e: MouseEvent) => {
      if (legendRef.current && !legendRef.current.contains(e.target as Node)) {
        setShowShortcuts(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showShortcuts])

  const copyReply = (text: string | null | undefined, label: string) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    toast(`${label} — copied`)
  }

  useKeyboardShortcuts([
    {
      key: 'Enter',
      meta: mac,
      ctrl: !mac,
      description: `${modKey}+Enter — Generate replies`,
      handler: () => { if (!loading && message.trim() && canGenerate) handleGenerate() },
    },
    {
      key: '1',
      meta: mac,
      ctrl: !mac,
      description: `${modKey}+1 — Copy professional reply`,
      handler: () => copyReply(replies?.professional, 'Professional'),
    },
    {
      key: '2',
      meta: mac,
      ctrl: !mac,
      description: `${modKey}+2 — Copy friendly reply`,
      handler: () => copyReply(replies?.friendly, 'Friendly'),
    },
    {
      key: '3',
      meta: mac,
      ctrl: !mac,
      description: `${modKey}+3 — Copy direct reply`,
      handler: () => copyReply(replies?.direct, 'Direct'),
    },
  ])

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
        body: JSON.stringify({ message: message.trim(), client_id: selectedClient, property_id: selectedProperty, template_context: templateContext ? sanitizeMessage(templateContext) : null, quick_reply: quickReply }),
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
      setMessage('')
      setSuggestedBooking(data.suggestedBooking ?? null)
      if (subscription?.status === 'trial') {
        setSubscription({ ...subscription, trial_generations_used: subscription.trial_generations_used + 1 })
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
  const heading = firstName ? t('dashboard.welcome') + ', ' + firstName : t('nav.dashboard')

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{heading}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('dashboard.subtitle')}</p>
        </div>
        {/* Keyboard shortcut legend — desktop only */}
        <div className="relative hidden md:block" ref={legendRef}>
          <button
            onClick={() => setShowShortcuts((v) => !v)}
            aria-label="Keyboard shortcuts"
            className="flex h-8 w-8 items-center justify-center rounded-full border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <Keyboard className="h-4 w-4" />
          </button>
          {showShortcuts && (
            <div className="absolute right-0 top-10 z-50 w-64 rounded-xl border bg-card shadow-lg p-4 space-y-2.5">
              <p className="text-xs font-semibold text-foreground mb-1">{t('dashboard.keyboard_shortcuts')}</p>
              {[
                { keys: `${modKey} Enter`, label: 'Generate replies' },
                { keys: `${modKey} 1`, label: 'Copy professional reply' },
                { keys: `${modKey} 2`, label: 'Copy friendly reply' },
                { keys: `${modKey} 3`, label: 'Copy direct reply' },
              ].map(({ keys, label }) => (
                <div key={keys} className="flex items-center justify-between gap-4">
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <kbd className="inline-flex items-center rounded-md border bg-muted px-1.5 py-0.5 text-[11px] font-mono font-medium text-foreground whitespace-nowrap">
                    {keys}
                  </kbd>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ErrorBoundary>
        <StatsCards />
      </ErrorBoundary>
      <ErrorBoundary>
        <UpcomingAppointments />
      </ErrorBoundary>
      <ErrorBoundary>
        <TrialBanner />
      </ErrorBoundary>

      {/* Generator */}
      <ErrorBoundary>
      <div className="rounded-2xl border bg-card overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b bg-muted/20">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">{t('dashboard.ai_generator')}</p>
            <p className="text-[11px] text-muted-foreground">{t('dashboard.ai_generator_desc')}</p>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{t('dashboard.client_label')}</label>
              <ClientSelector value={selectedClient} onChange={setSelectedClient} />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{t('dashboard.property_label')}</label>
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
              {t('dashboard.message_label')}
            </label>
            <MessageInput value={message} onChange={setMessage} disabled={loading} />
          </div>

          <div className="flex items-center gap-2">
            <GenerateButton onClick={handleGenerate} loading={loading} disabled={!message.trim() || !canGenerate} />
            <button
              onClick={() => setQuickReply(!quickReply)}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${quickReply ? 'bg-primary/10 border-primary/20 text-primary' : 'text-muted-foreground hover:bg-accent'}`}
            >
              <Zap className="h-3.5 w-3.5" />
              {t('dashboard.quick_reply')}
            </button>
          </div>
          <p className="hidden md:block text-xs text-muted-foreground text-center -mt-1">
            {mac ? '⌘ Enter to generate' : 'Ctrl+Enter to generate'}
          </p>
        </div>
      </div>
      </ErrorBoundary>

      {/* Results */}
      {(replies || loading) && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold">{t('dashboard.generated_replies')}</p>
            <div className="flex-1 h-px bg-border" />
          </div>
          <ErrorBoundary>
            <ReplyGrid
              professional={replies?.professional ?? null}
              friendly={replies?.friendly ?? null}
              direct={replies?.direct ?? null}
              loading={loading}
            />
          </ErrorBoundary>
          {replies && !loading && !selectedClient && (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-border bg-muted/20 px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4 shrink-0" />
                <span>
                  {t('dashboard.link_client_prompt')}
                </span>
              </div>
              <Link
                href="/clients"
                className="shrink-0 text-xs font-medium text-primary hover:underline cursor-pointer"
              >
                {t('dashboard.add_client_link')}
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Booking prompt — shown after generation when a date/time was detected */}
      <AnimatePresence>
        {suggestedBooking && !loading && (
          <BookingPrompt
            booking={suggestedBooking}
            clientId={selectedClient}
            propertyId={selectedProperty}
            hasConflict={replies?.availabilityConflict ?? false}
            onDismiss={() => setSuggestedBooking(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
