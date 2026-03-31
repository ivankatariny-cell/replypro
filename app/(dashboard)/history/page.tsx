'use client'

import { useState, useMemo } from 'react'
import { motion } from 'motion/react'
import Link from 'next/link'
import { useTranslation } from '@/hooks/useTranslation'
import { useGenerations } from '@/hooks/useGenerations'
import { HistoryItem } from '@/components/history/HistoryItem'
import { Input } from '@/components/ui/input'
import { MessageSquare, Search } from 'lucide-react'

export default function HistoryPage() {
  const { t } = useTranslation()
  const { generations } = useGenerations()
  const [search, setSearch] = useState('')
  const [langFilter, setLangFilter] = useState<'all' | 'hr' | 'en'>('all')

  const filtered = useMemo(() => generations.filter((g) => {
    const matchSearch = !search || g.original_message.toLowerCase().includes(search.toLowerCase())
    const matchLang = langFilter === 'all' || g.detected_language === langFilter
    return matchSearch && matchLang
  }), [generations, search, langFilter])

  const grouped = useMemo(() => {
    const groups: Record<string, typeof generations> = {}
    filtered.forEach((g) => {
      const date = new Date(g.created_at).toLocaleDateString()
      if (!groups[date]) groups[date] = []
      groups[date].push(g)
    })
    return groups
  }, [filtered])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('history.title')}</h1>
        <p className="text-sm text-muted-foreground mt-1">{generations.length} {t('history.total')}</p>
      </div>

      {generations.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('history.search')} className="pl-9 rounded-xl" />
          </div>
          <div className="flex gap-1 p-1 rounded-xl border bg-muted/30">
            {(['all', 'hr', 'en'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLangFilter(l)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  langFilter === l ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {l === 'all' ? t('history.all_langs') : l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
            <MessageSquare className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">{generations.length === 0 ? t('history.empty') : t('history.no_results')}</p>
          {generations.length === 0 && (
            <Link href="/dashboard" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer">
              {t('history.go_to_dashboard')}
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([date, items]) => (
            <div key={date}>
              <div className="flex items-center gap-3 mb-3">
                <p className="text-xs font-semibold text-muted-foreground">{date}</p>
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground tabular-nums">{items.length}</span>
              </div>
              <div className="space-y-2">
                {items.map((gen, i) => (
                  <motion.div key={gen.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                    <HistoryItem gen={gen} />
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
