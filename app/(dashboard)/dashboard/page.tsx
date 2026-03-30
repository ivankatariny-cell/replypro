'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslation } from '@/hooks/useTranslation'
import { useSubscription } from '@/hooks/useSubscription'
import { useAppStore } from '@/store/app-store'
import { useToast } from '@/components/ui/toast'
import { TrialBanner } from '@/components/dashboard/TrialBanner'
import { MessageInput } from '@/components/dashboard/MessageInput'
import { GenerateButton } from '@/components/dashboard/GenerateButton'
import { ReplyGrid } from '@/components/dashboard/ReplyGrid'
import type { GenerateResponse } from '@/types'

export default function DashboardPage() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const { subscription } = useSubscription()
  const setSubscription = useAppStore((s) => s.setSubscription)
  const addGeneration = useAppStore((s) => s.addGeneration)

  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [replies, setReplies] = useState<GenerateResponse | null>(null)

  // Sync subscription after Stripe checkout redirect
  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      fetch('/api/stripe/sync', { method: 'POST' })
        .then((res) => res.json())
        .then((data) => {
          if (data.status === 'active' && subscription) {
            setSubscription({ ...subscription, status: 'active' })
            toast('Pro aktiviran! Neograničene generacije.', 'success')
          }
        })
        .catch(() => {})
      // Clean URL
      window.history.replaceState({}, '', '/dashboard')
    }
  }, [searchParams, subscription, setSubscription, toast])

  const canGenerate = subscription?.status === 'active' ||
    (subscription?.status === 'trial' && (subscription.trial_generations_used < subscription.trial_generations_limit))

  const handleGenerate = async () => {
    if (!message.trim() || !canGenerate) return
    setLoading(true)
    setReplies(null)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.trim() }),
      })
      if (!res.ok) {
        const err = await res.json()
        toast(err.error || t('errors.generation_failed'), 'error')
        setLoading(false)
        return
      }
      const data: GenerateResponse = await res.json()
      setReplies(data)
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
        created_at: new Date().toISOString(),
      })
    } catch {
      toast(t('errors.generation_failed'), 'error')
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <TrialBanner />
      <div className="space-y-4">
        <MessageInput value={message} onChange={setMessage} disabled={loading} />
        <GenerateButton onClick={handleGenerate} loading={loading} disabled={!message.trim() || !canGenerate} />
      </div>
      <ReplyGrid
        professional={replies?.professional ?? null}
        friendly={replies?.friendly ?? null}
        direct={replies?.direct ?? null}
        loading={loading}
      />
    </div>
  )
}
