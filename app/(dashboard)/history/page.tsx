'use client'

import { useTranslation } from '@/hooks/useTranslation'
import { HistoryList } from '@/components/history/HistoryList'

export default function HistoryPage() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-heading font-bold">{t('history.title')}</h1>
      <HistoryList />
    </div>
  )
}
