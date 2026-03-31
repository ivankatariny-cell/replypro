'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { useTranslation } from '@/hooks/useTranslation'
import { useToast } from '@/components/ui/toast'
import { useAppStore } from '@/store/app-store'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/hooks/useUser'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Copy, Check, Pencil, Star } from 'lucide-react'

interface Props {
  tone: 'professional' | 'friendly' | 'direct'
  content: string
  index?: number
  generationId?: string
}

const toneConfig = {
  professional: { key: 'dashboard.tone_professional', variant: 'professional' as const },
  friendly: { key: 'dashboard.tone_friendly', variant: 'friendly' as const },
  direct: { key: 'dashboard.tone_direct', variant: 'direct' as const },
}

export function ReplyCard({ tone, content, index = 0, generationId }: Props) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const { user } = useUser()
  const addFavorite = useAppStore((s) => s.addFavorite)
  const [copied, setCopied] = useState(false)
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(content)
  const [saving, setSaving] = useState(false)
  const config = toneConfig[tone]

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    toast(t('dashboard.copied'))
    setTimeout(() => setCopied(false), 2000)
  }

  const handleFavorite = async () => {
    if (!user) return
    setSaving(true)
    const supabase = createClient()
    const { data, error } = await supabase.from('rp_favorites').insert({
      user_id: user.id,
      generation_id: generationId || null,
      tone,
      content: text,
    }).select().single()
    if (!error && data) {
      addFavorite(data as any)
      toast(t('dashboard.saved_favorite'))
    }
    setSaving(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay: index * 0.15, ease: 'easeOut' }}
    >
      <Card className={`transition-all duration-200 hover:border-primary/40 hover:shadow-md ${copied ? 'border-green-500' : ''}`}>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Badge variant={config.variant}>{t(config.key)}</Badge>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={handleFavorite} disabled={saving} className="h-8 w-8 cursor-pointer" aria-label={t('dashboard.save_favorite')}>
                <Star className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setEditing(!editing)} className="h-8 w-8 cursor-pointer" aria-label={t('dashboard.edit_btn')}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleCopy} className="h-8 w-8 cursor-pointer" aria-label={t('dashboard.copy_btn')}>
                {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
              </Button>
            </div>
          </div>
          {editing ? (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full min-h-[100px] rounded-md border bg-background p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label="Edit reply"
            />
          ) : (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{text}</p>
          )}
          <p className="text-xs text-muted-foreground italic">{t('dashboard.placeholder_note')}</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}
