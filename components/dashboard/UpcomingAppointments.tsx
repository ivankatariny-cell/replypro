'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAppointments } from '@/hooks/useAppointments'
import { useClients } from '@/hooks/useClients'
import { useTranslation } from '@/hooks/useTranslation'
import { Skeleton } from '@/components/ui/skeleton'
import { CalendarDays, ChevronRight, Clock } from 'lucide-react'
import type { Appointment } from '@/types'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getUpcoming(appointments: Appointment[]): Appointment[] {
  const now = new Date().toISOString()
  return appointments
    .filter((a) => a.start_at > now)
    .sort((a, b) => a.start_at.localeCompare(b.start_at))
    .slice(0, 3)
}

export function UpcomingAppointments() {
  const { t } = useTranslation()
  const router = useRouter()
  const { appointments, loading } = useAppointments()
  const { clients } = useClients()

  const upcoming = getUpcoming(appointments)

  const getClientName = (clientId: string | null): string | null => {
    if (!clientId) return null
    return clients.find((c) => c.id === clientId)?.full_name ?? null
  }

  const handleAppointmentClick = (appointment: Appointment) => {
    const date = appointment.start_at.slice(0, 10)
    router.push(`/calendar?date=${date}`)
  }

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/20">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
            <CalendarDays className="h-4 w-4 text-primary" />
          </div>
          <p className="text-sm font-semibold">{t('calendar.upcoming_title')}</p>
        </div>
        <Link
          href="/calendar"
          className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-0.5 cursor-pointer"
        >
          {t('calendar.view_calendar')}
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Body */}
      <div className="divide-y">
        {loading ? (
          // Skeleton loaders — 3 rows
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))
        ) : upcoming.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center gap-2 px-4 py-8 text-center">
            <CalendarDays className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm font-medium text-muted-foreground">{t('calendar.no_upcoming')}</p>
            <p className="text-xs text-muted-foreground/70">{t('calendar.no_upcoming_desc')}</p>
            <Link
              href="/calendar"
              className="mt-1 inline-flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors cursor-pointer"
            >
              {t('calendar.go_to_calendar')}
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        ) : (
          // Appointment rows
          upcoming.map((appt) => {
            const clientName = getClientName(appt.client_id)
            return (
              <button
                key={appt.id}
                onClick={() => handleAppointmentClick(appt)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors cursor-pointer text-left"
              >
                {/* Date badge */}
                <div className="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <span className="text-[10px] font-semibold uppercase leading-none">
                    {new Date(appt.start_at).toLocaleDateString(undefined, { month: 'short' })}
                  </span>
                  <span className="text-sm font-bold leading-none mt-0.5">
                    {new Date(appt.start_at).getDate()}
                  </span>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{appt.title}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span className="text-xs text-muted-foreground">
                      {formatDate(appt.start_at)} · {formatTime(appt.start_at)}
                    </span>
                  </div>
                  {clientName && (
                    <p className="text-xs text-muted-foreground/70 truncate mt-0.5">{clientName}</p>
                  )}
                </div>

                <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0" />
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
