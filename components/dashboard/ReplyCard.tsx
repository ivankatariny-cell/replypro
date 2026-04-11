'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useTranslation } from '@/hooks/useTranslation'
import { useToast } from '@/components/ui/toast'
import { useAppStore } from '@/store/app-store'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/hooks/useUser'
import { Badge } from '@/components/ui/badge'
import { Copy, Check, Pencil, Star, Save, X } from 'lucide-react'
interface Props {
  tone: 'professional' | 'friendly' | 'direct'
  content: string
  index?: number
  generationId?: string
}

const toneConfig = {
  professional: { key: 'dashboard.tone_professional', variant: 'professional' as const, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/30' },
  friendly: { key: 'dashboard.tone_friendly', variant: 'friendly' as const, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-950/30' },
  direct: { key: 'dashboard.tone_direct', variant: 'direct' as const, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30' },
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
    toast(`${t(`dashboard.tone_${tone}`)} — ${t('dashboard.copied')}`)
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
      addFavorite(data)
      setStarred(true)
      toast(t('dashboard.saved_favorite'))
    }
    setSaving(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col rounded-2xl border bg-card overflow-hidden hover:shadow-md transition-shadow duration-200"
    >
      {/* Tone header strip */}
      <div className={`px-4 py-2.5 flex items-center justify-between ${config.bg} border-b`}>
        <Badge variant={config.variant} className="text-xs">{t(config.key)}</Badge>
        <div className="flex items-center gap-0.5">
          <ActionBtn
            onClick={handleFavorite}
            disabled={saving || starred}
            active={starred}
            activeClass="text-amber-500"
            label={t('dashboard.save_favorite')}
          >
            <Star className={`h-3.5 w-3.5 ${starred ? 'fill-current' : ''}`} />
          </ActionBtn>
          <ActionBtn
            onClick={() => setEditing(!editing)}
            active={editing}
            activeClass="text-primary"
            label={t('dashboard.edit_btn')}
          >
            {editing ? <X className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
          </ActionBtn>
          <ActionBtn
            onClick={handleCopy}
            active={copied}
            activeClass="text-green-600"
            label={t('dashboard.copy_btn')}
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={copied ? 'check' : 'copy'}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ duration: 0.12 }}
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              </motion.span>
            </AnimatePresence>
          </ActionBtn>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 p-4">
        <AnimatePresence mode="wait">
          {editing ? (
            <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full min-h-[120px] rounded-lg border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                autoFocus
              />
              <button
                onClick={() => setEditing(false)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground cursor-pointer hover:bg-primary/90 transition-colors"
              >
                <Save className="h-3 w-3" />
                {t('clients.save')}
              </button>
            </motion.div>
          ) : (
            <motion.p key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
              {text}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t bg-muted/20">
        <p className="text-[11px] text-muted-foreground italic">{t('dashboard.placeholder_note')}</p>
      </div>
    </motion.div>
  )
}

function ActionBtn({ children, onClick, disabled, active, activeClass, label }: {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  active?: boolean
  activeClass?: string
  label: string
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed
        ${active ? activeClass : 'text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5'}`}
    >
      {children}
    </button>
  )
}