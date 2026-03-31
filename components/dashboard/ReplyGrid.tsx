'use client'

import { ReplyCard } from './ReplyCard'

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
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-2xl border bg-card overflow-hidden animate-pulse">
            <div className="px-4 py-3 border-b bg-muted/20">
              <div className="h-5 w-20 rounded-full bg-muted" />
            </div>
            <div className="p-4 space-y-2.5">
              <div className="h-3.5 w-full rounded bg-muted" />
              <div className="h-3.5 w-full rounded bg-muted" />
              <div className="h-3.5 w-3/4 rounded bg-muted" />
              <div className="h-3.5 w-5/6 rounded bg-muted" />
            </div>
            <div className="px-4 py-2 border-t bg-muted/10">
              <div className="h-3 w-32 rounded bg-muted" />
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
