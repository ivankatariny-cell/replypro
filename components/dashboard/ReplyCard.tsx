'use client'

import { useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'
import { useToast } from '@/components/ui/toast'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Copy, Check, Pencil } from 'lucide-react'

interface Props {
  tone: 'professional' | 'friendly' | 'direct'
  content: string
}

const toneConfig = {
  professional: { key: 'dashboard.tone_professional', variant: 'professional' as const },
  friendly: { key: 'dashboard.tone_friendly', variant: 'friendly' as const },
  direct: { key: 'dashboard.tone_direct', variant: 'direct' as const },
}

export function ReplyCard({ tone, content }: Props) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(content)
  const config = toneConfig[tone]

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    toast(t('dashboard.copied'))
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className={`transition-all duration-200 hover:border-primary/40 ${copied ? 'border-green-500' : ''}`}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Badge variant={config.variant}>{t(config.key)}</Badge>
          <div className="flex gap-1">
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
  )
}
