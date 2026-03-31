'use client'

import { useState, useMemo } from 'react'
import { motion } from 'motion/react'
import Link from 'next/link'
import { useTranslation } from '@/hooks/useTranslation'
import { useGenerations } from '@/hooks/useGenerations'
import { HistoryItem } from '@/components/history/HistoryItem'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MessageSquare, Search, Calendar } from 'lucide-react'

export default function HistoryPage() {
  const { t } = useTranslation()
  const { generations } = useGenerations()
  const [search, setSearch] = useState('')
  const [langFilter, setLangFilter] = useState<'all' | 'hr' | 'en'>('all')

  const filtered = useMemo(() => {
    return generations.filter((g) => {
      const matchSearch = !search || g.original_message.toLowerCase().includes(search.toLowerCase())
      const matchLang = langFilter === 'all' || g.detected_language === langFilter
      return matchSearch && matchLang
    })
  }, [generations, search, langFilter])

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
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">{t('history.title')}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{generations.length} {t('history.total')}</p>
        </div>
      </div>

      {/* Filters */}
      {generations.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('history.search')}
              className="pl-9"
            />
          </div>
          <div className="flex gap-1">
            {(['all', 'hr', 'en'] as const).map((l) => (
              <Button
                key={l}
                variant={langFilter === l ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLangFilter(l)}
                className="cursor-pointer"
              >
                {l === 'all' ? t('history.all_langs') : l.toUpperCase()}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted mb-4">
            <MessageSquare className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium mb-1">
            {generations.length === 0 ? t('history.empty') : t('history.no_results')}
          </p>
          {generations.length === 0 && (
            <Link href="/dashboard" className="mt-3">
              <Button size="sm" className="cursor-pointer">{t('history.go_to_dashboard')}</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, items]) => (
            <div key={date}>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <p className="text-xs font-semibold text-muted-foreground">{date}</p>
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground tabular-nums">{items.length}</span>
              </div>
              <div className="space-y-2">
                {items.map((gen, i) => (
                  <motion.div
                    key={gen.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
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
