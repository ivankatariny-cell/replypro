'use client'

import { useState } from 'react'
import type { Generation } from '@/types'
import { ChevronDown, User } from 'lucide-react'
import { ReplyCard } from '@/components/dashboard/ReplyCard'
import { motion, AnimatePresence } from 'motion/react'
import { useAppStore } from '@/store/app-store'

export function HistoryItem({ gen }: { gen: Generation }) {
  const [open, setOpen] = useState(false)
  const clients = useAppStore((s) => s.clients)
  const clientName = gen.client_id
    ? (clients.find((c) => c.id === gen.client_id)?.full_name ?? null)
    : null

  return (
    <div className="rounded-2xl border bg-card overflow-hidden">
      <button
        className="w-full flex items-center gap-4 px-5 py-4 text-left cursor-pointer hover:bg-muted/20 transition-colors"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground mb-0.5">{new Date(gen.created_at).toLocaleString()}</p>
          <p className="text-sm font-medium truncate">{gen.original_message}</p>
          {clientName && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <User className="h-3 w-3" />
              {clientName}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="rounded-full border px-2 py-0.5 text-[10px] font-semibold text-muted-foreground uppercase">
            {gen.detected_language}
          </span>
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div
              className="px-5 pb-5 pt-1 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 border-t"
              onClick={(e) => e.stopPropagation()}
            >
              <ReplyCard tone="professional" content={gen.reply_professional} />
              <ReplyCard tone="friendly" content={gen.reply_friendly} />
              <ReplyCard tone="direct" content={gen.reply_direct} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
