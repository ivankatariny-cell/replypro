'use client'

import { motion } from 'motion/react'
import { useTranslation } from '@/hooks/useTranslation'
import { useFavorites } from '@/hooks/useFavorites'
import { useAppStore } from '@/store/app-store'
import { useToast } from '@/components/ui/toast'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Copy, Trash2, Star } from 'lucide-react'
import { useState } from 'react'

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
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Star className="h-5 w-5 text-primary" />
        <h1 className="text-2xl font-heading font-bold">{t('nav.favorites')}</h1>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Star className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>{t('favorites.empty')}</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((fav, i) => (
            <motion.div key={fav.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="hover:border-primary/30 transition-colors h-full">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant={toneConfig[fav.tone]?.variant || 'outline'}>
                      {t(`dashboard.tone_${fav.tone}`)}
                    </Badge>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleCopy(fav.content)} className="h-7 w-7 cursor-pointer">
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(fav.id)} className="h-7 w-7 text-destructive cursor-pointer">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap line-clamp-6">{fav.content}</p>
                  <p className="text-xs text-muted-foreground">{new Date(fav.created_at).toLocaleDateString()}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
