'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useTranslation } from '@/hooks/useTranslation'
import { useToast } from '@/components/ui/toast'
import { useAppStore } from '@/store/app-store'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/hooks/useUser'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Copy, Check, Pencil, Star, Save } from 'lucide-react'

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
  const [starred, setStarred] = useState(false)
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
      setStarred(true)
      toast(t('dashboard.saved_favorite'))
    }
    setSaving(false)
  }

  const handleSaveEdit = () => {
    setEditing(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3, boxShadow: '0 12px 32px hsl(var(--primary)/0.08)' }}
      className="flex flex-col rounded-xl border bg-card overflow-hidden transition-shadow duration-200 shimmer-hover"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
        <motion.div whileHover={{ scale: 1.03 }}>
          <Badge variant={config.variant}>{t(config.key)}</Badge>
        </motion.div>
        <div className="flex items-center gap-0.5">
          <motion.div whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}>
            <Button
              variant="ghost" size="icon"
              onClick={handleFavorite}
              disabled={saving || starred}
              className={`h-8 w-8 cursor-pointer transition-colors ${starred ? 'text-amber-500' : 'text-muted-foreground hover:text-amber-500'}`}
              aria-label={t('dashboard.save_favorite')}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={starred ? 'filled' : 'empty'}
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 30 }}
                  transition={{ duration: 0.2 }}
                >
                  <Star className={`h-4 w-4 ${starred ? 'fill-current' : ''}`} />
                </motion.div>
              </AnimatePresence>
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}>
            <Button
              variant="ghost" size="icon"
              onClick={() => setEditing(!editing)}
              className={`h-8 w-8 cursor-pointer ${editing ? 'text-primary bg-primary/10' : 'text-muted-foreground'}`}
              aria-label={t('dashboard.edit_btn')}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}>
            <Button
              variant="ghost" size="icon"
              onClick={handleCopy}
              className={`h-8 w-8 cursor-pointer transition-colors ${copied ? 'text-green-600' : 'text-muted-foreground hover:text-foreground'}`}
              aria-label={t('dashboard.copy_btn')}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={copied ? 'check' : 'copy'}
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 20 }}
                  transition={{ duration: 0.15 }}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </motion.div>
              </AnimatePresence>
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-3">
        <AnimatePresence mode="wait">
          {editing ? (
            <motion.div
              key="edit"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="space-y-2"
            >
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full min-h-[120px] rounded-lg border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                aria-label="Edit reply"
                autoFocus
              />
              <Button size="sm" onClick={handleSaveEdit} className="cursor-pointer h-7 text-xs">
                <Save className="h-3 w-3 mr-1.5" />
                {t('clients.save')}
              </Button>
            </motion.div>
          ) : (
            <motion.p
              key="view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90"
            >
              {text}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t bg-muted/20">
        <p className="text-xs text-muted-foreground italic">{t('dashboard.placeholder_note')}</p>
      </div>
    </motion.div>
  )
}
