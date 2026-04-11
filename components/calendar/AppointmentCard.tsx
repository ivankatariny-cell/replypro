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
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left rounded-lg border bg-primary/10 border-primary/20 hover:bg-primary/15 transition-colors cursor-pointer group',
        compact ? 'px-2 py-1' : 'px-3 py-2'
      )}
    >
      <p className={cn('font-medium text-foreground truncate', compact ? 'text-xs' : 'text-sm')}>
        {appointment.title}
      </p>

      {!compact && (
        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3 shrink-0" />
          <span>{formatTime(appointment.start_at)} – {formatTime(appointment.end_at)}</span>
        </div>
      )}

      {!compact && (clientName || propertyTitle) && (
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {clientName && (
            <span className="inline-flex items-center gap-1 rounded-full bg-info/10 text-info px-2 py-0.5 text-xs font-medium">
              <User className="h-2.5 w-2.5" />
              {clientName}
            </span>
          )}
          {propertyTitle && (
            <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 text-warning px-2 py-0.5 text-xs font-medium">
              <Building2 className="h-2.5 w-2.5" />
              {propertyTitle}
            </span>
          )}
        </div>
      )}
    </button>
  )
}
