'use client'

import { useState, useMemo } from 'react'
import { motion } from 'motion/react'
import Link from 'next/link'
import { useTranslation } from '@/hooks/useTranslation'
import { useGenerations } from '@/hooks/useGenerations'
import { HistoryItem } from '@/components/history/HistoryItem'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold">{t('history.title')}</h1>
        <Badge variant="outline">{generations.length} {t('history.total')}</Badge>
      </div>

      {generations.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('history.search')} className="pl-9" />
          </div>
          <div className="flex gap-1">
            {(['all', 'hr', 'en'] as const).map((l) => (
              <Button key={l} variant={langFilter === l ? 'default' : 'outline'} size="sm" onClick={() => setLangFilter(l)} className="cursor-pointer">
                {l === 'all' ? t('history.all_langs') : l.toUpperCase()}
              </Button>
            ))}
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground mb-4">{generations.length === 0 ? t('history.empty') : t('history.no_results')}</p>
          {generations.length === 0 && (
            <Link href="/dashboard">
              <Button className="cursor-pointer">{t('history.go_to_dashboard')}</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, items]) => (
            <div key={date}>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-xs font-medium text-muted-foreground">{date}</p>
                <div className="flex-1 h-px bg-border" />
                <Badge variant="outline" className="text-[10px]">{items.length}</Badge>
              </div>
              <div className="space-y-2">
                {items.map((gen, i) => (
                  <motion.div key={gen.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
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
