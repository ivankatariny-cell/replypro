'use client'

import { ReplyCard } from './ReplyCard'
import { Skeleton } from '@/components/ui/skeleton'

interface Props {
  professional: string | null
  friendly: string | null
  direct: string | null
  loading: boolean
  generationId?: string
}

export function ReplyGrid({ professional, friendly, direct, loading, generationId }: Props) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border bg-card overflow-hidden">
            <div className="px-4 py-3 border-b bg-muted/30">
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
            <div className="px-4 py-3 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!professional) return null

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <ReplyCard tone="professional" content={professional} index={0} generationId={generationId} />
      <ReplyCard tone="friendly" content={friendly!} index={1} generationId={generationId} />
      <ReplyCard tone="direct" content={direct!} index={2} generationId={generationId} />
    </div>
  )
}
