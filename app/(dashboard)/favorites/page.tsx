'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { useTranslation } from '@/hooks/useTranslation'
import { useFavorites } from '@/hooks/useFavorites'
import { useAppStore } from '@/store/app-store'
import { useToast } from '@/components/ui/toast'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Copy, Trash2, Star, Check } from 'lucide-react'

const toneConfig = {
  professional: { variant: 'professional' as const },
  friendly: { variant: 'friendly' as const },
  direct: { variant: 'direct' as const },
}

export default function FavoritesPage() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const { favorites } = useFavorites()
  const removeFavorite = useAppStore((s) => s.removeFavorite)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopy = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    toast(t('dashboard.copied'))
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleDelete = async (id: string) => {
    const supabase = createClient()
    await supabase.from('rp_favorites').delete().eq('id', id)
    removeFavorite(id)
    toast(t('favorites.removed'), 'info')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('nav.favorites')}</h1>
        <p className="text-sm text-muted-foreground mt-1">{favorites.length} saved replies</p>
      </div>

      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
            <Star className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">{t('favorites.empty')}</p>
          <p className="text-xs text-muted-foreground mt-1">Star replies from the dashboard to save them here</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {favorites.map((fav, i) => (
            <motion.div key={fav.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <div className="group flex flex-col rounded-2xl border bg-card overflow-hidden hover:shadow-md transition-shadow h-full">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/20">
                  <Badge variant={toneConfig[fav.tone]?.variant || 'outline'} className="text-xs">
                    {t(`dashboard.tone_${fav.tone}`)}
                  </Badge>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleCopy(fav.id, fav.content)}
                      className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors cursor-pointer ${copiedId === fav.id ? 'text-green-600' : 'text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5'}`}
                    >
                      {copiedId === fav.id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      onClick={() => handleDelete(fav.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-4">
                  <p className="text-sm leading-relaxed text-foreground/90 line-clamp-6 whitespace-pre-wrap">{fav.content}</p>
                </div>

                {/* Footer */}
                <div className="px-4 py-2.5 border-t bg-muted/10">
                  <p className="text-[11px] text-muted-foreground">{new Date(fav.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
