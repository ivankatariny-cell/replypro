'use client'

import { ReplyCard } from './ReplyCard'
import { Skeleton } from '@/components/ui/skeleton'

interface Props {
  professional: string | null
  friendly: string | null
  direct: string | null
  loading: boolean
}

export function ReplyGrid({ professional, friendly, direct, loading }: Props) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg border p-4 space-y-3">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    )
  }

  if (!professional) return null

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <ReplyCard tone="professional" content={professional} />
      <ReplyCard tone="friendly" content={friendly!} />
      <ReplyCard tone="direct" content={direct!} />
    </div>
  )
}
