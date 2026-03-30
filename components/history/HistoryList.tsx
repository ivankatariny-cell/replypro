'use client'

import Link from 'next/link'
import { useGenerations } from '@/hooks/useGenerations'
import { useTranslation } from '@/hooks/useTranslation'
import { HistoryItem } from './HistoryItem'
import { Button } from '@/components/ui/button'
import { MessageSquare } from 'lucide-react'

export function HistoryList() {
  const { t } = useTranslation()
  const { generations } = useGenerations()

  if (generations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <MessageSquare className="h-12 w-12 text-muted-foreground/40 mb-4" />
        <p className="text-muted-foreground mb-4">{t('history.empty')}</p>
        <Link href="/dashboard">
          <Button className="cursor-pointer">{t('history.go_to_dashboard')}</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {generations.map((gen) => (
        <HistoryItem key={gen.id} gen={gen} />
      ))}
    </div>
  )
}
