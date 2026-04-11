'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import Link from 'next/link'
import { useTranslation } from '@/hooks/useTranslation'
import { useFavorites } from '@/hooks/useFavorites'
import { useAppStore } from '@/store/app-store'
import { useToast } from '@/components/ui/toast'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Copy, Trash2, Star, Check } from 'lucide-react'

const toneConfig = {
  professional: { variant: 'professional' as const },
  friendly: { variant: 'friendly' as const },
  direct: { variant: 'direct' as const },
}

export default function FavoritesPage() {
  const { t, language } = useTranslation()
  const { toast } = useToast()
  const { favorites, loading } = useFavorites()
  const removeFavorite = useAppStore((s) => s.removeFavorite)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleCopy = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    toast(t('dashboard.copied'))
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleDelete = async (id: string) => {
    setDeleting(true)
    const supabase = createClient()
    await supabase.from('rp_favorites').delete().eq('id', id)
    removeFavorite(id)
    toast(t('favorites.removed'), 'info')
    setDeleting(false)
    setConfirmDeleteId(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('nav.favorites')}</h1>
        <p className="text-sm text-muted-foreground mt-1">{favorites.length} saved replies</p>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-2xl" />
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="py-20 text-center max-w-sm mx-auto">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-warning/10 mx-auto mb-5">
            <Star className="h-10 w-10 text-warning" />
          </div>
          <h3 className="text-base font-semibold mb-2">{t('favorites.empty')}</h3>
          <p className="text-sm text-muted-foreground mb-6">{t('favorites.empty_desc')}</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
          >
            {t('favorites.empty_cta')}
          </Link>
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
                      onClick={() => setConfirmDeleteId(fav.id)}
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

      <ConfirmDialog
        open={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={() => confirmDeleteId && handleDelete(confirmDeleteId)}
        title={language === 'hr' ? 'Ukloniti iz favorita?' : 'Remove from favorites?'}
        description={
          language === 'hr'
            ? 'Ovaj odgovor bit će uklonjen iz vaših favorita.'
            : 'This reply will be removed from your saved favorites.'
        }
        confirmLabel={t('confirm_dialog.confirm')}
        cancelLabel={t('confirm_dialog.cancel')}
        loading={deleting}
      />
    </div>
  )
}
