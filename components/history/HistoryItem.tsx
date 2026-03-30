'use client'

import { useState } from 'react'
import type { Generation } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { ReplyCard } from '@/components/dashboard/ReplyCard'

export function HistoryItem({ gen }: { gen: Generation }) {
  const [open, setOpen] = useState(false)

  return (
    <Card className="cursor-pointer" onClick={() => setOpen(!open)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground mb-1">
              {new Date(gen.created_at).toLocaleString()}
            </p>
            <p className="text-sm truncate">{gen.original_message}</p>
          </div>
          <Badge variant="outline">{gen.detected_language.toUpperCase()}</Badge>
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
        {open && (
          <div className="mt-4 grid gap-3 md:grid-cols-3" onClick={(e) => e.stopPropagation()}>
            <ReplyCard tone="professional" content={gen.reply_professional} />
            <ReplyCard tone="friendly" content={gen.reply_friendly} />
            <ReplyCard tone="direct" content={gen.reply_direct} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
