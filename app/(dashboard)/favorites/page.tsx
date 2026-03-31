'use client'

import { motion } from 'motion/react'
import { useTranslation } from '@/hooks/useTranslation'
import { useFavorites } from '@/hooks/useFavorites'
import { useAppStore } from '@/store/app-store'
import { useToast } from '@/components/ui/toast'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Copy, Trash2, Star } from 'lucide-react'

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

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text)
    toast(t('dashboard.copied'))
  }

  const handleDelete = async (id: string) => {
    const supabase = createClient()
    await supabase.from('rp_favorites').delete().eq('id', id)
    removeFavorite(id)
    toast(t('favorites.removed'), 'info')
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold">{t('nav.favorites')}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{favorites.length} saved replies</p>
      </div>

      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
            <Star className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium mb-1">{t('favorites.empty')}</p>
          <p className="text-xs text-muted-foreground">Save replies from the dashboard to see them here.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((fav, i) => (
            <motion.div
              key={fav.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="flex flex-col rounded-xl border bg-card overflow-hidden hover:border-border/80 hover:shadow-sm transition-all h-full">
                {/* Card header */}
                <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
                  <Badge variant={toneConfig[fav.tone]?.variant || 'outline'}>
                    {t(`dashboard.tone_${fav.tone}`)}
                  </Badge>
                  <div className="flex items-center gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopy(fav.content)}
                      className="h-7 w-7 cursor-pointer text-muted-foreground hover:text-foreground"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(fav.id)}
                      className="h-7 w-7 cursor-pointer text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 px-4 py-3">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap line-clamp-6 text-foreground/90">{fav.content}</p>
                </div>

                {/* Footer */}
                <div className="px-4 py-2 border-t bg-muted/20">
                  <p className="text-xs text-muted-foreground">{new Date(fav.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
