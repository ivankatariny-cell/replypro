'use client'

import { Clock, User, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { Appointment } from '@/types'

interface Props {
  appointment: Appointment
  clientName?: string
  propertyTitle?: string
  onClick: () => void
  compact?: boolean
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function AppointmentCard({ appointment, clientName, propertyTitle, onClick, compact = false }: Props) {
  if (compact) {
    return (
      <button
        onClick={onClick}
        className="w-full text-left rounded-md bg-primary/12 hover:bg-primary/20 border border-primary/15 px-1.5 py-0.5 transition-colors cursor-pointer"
      >
        <p className="text-[10px] font-medium text-primary truncate leading-tight">
          {formatTime(appointment.start_at)} {appointment.title}
        </p>
      </button>
    )
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        'w-full text-left rounded-xl border bg-card hover:bg-accent/40 transition-colors cursor-pointer p-4 space-y-2.5 group'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-foreground leading-snug">{appointment.title}</p>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Clock className="h-3 w-3 shrink-0" />
        <span>{formatTime(appointment.start_at)} – {formatTime(appointment.end_at)}</span>
      </div>

      {(clientName || propertyTitle) && (
        <div className="flex flex-wrap gap-1.5">
          {clientName && (
            <span className="inline-flex items-center gap-1 rounded-full bg-info/10 text-info px-2 py-0.5 text-xs font-medium border border-info/15">
              <User className="h-2.5 w-2.5" />
              {clientName}
            </span>
          )}
          {propertyTitle && (
            <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 text-warning px-2 py-0.5 text-xs font-medium border border-warning/15">
              <Building2 className="h-2.5 w-2.5" />
              {propertyTitle}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
