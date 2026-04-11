'use client'

import { useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { Appointment, AvailabilityException } from '@/types'

interface Props {
  appointments: Appointment[]
  exceptions: AvailabilityException[]
  currentMonth: Date
  onMonthChange: (date: Date) => void
  onDayClick: (date: Date) => void
  onAppointmentClick: (a: Appointment) => void
  clientNames?: Record<string, string>
  propertyTitles?: Record<string, string>
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function toLocalDateStr(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function MonthGrid({
  appointments,
  exceptions,
  currentMonth,
  onMonthChange,
  onDayClick,
  onAppointmentClick,
  clientNames = {},
  propertyTitles = {},
}: Props) {
  const today = new Date()

  const { days, startOffset } = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const rawDay = firstDay.getDay()
    const offset = rawDay === 0 ? 6 : rawDay - 1
    return { days: lastDay.getDate(), startOffset: offset }
  }, [currentMonth])

  const exceptionSet = useMemo(() => {
    const s = new Set<string>()
    exceptions.forEach((e) => { if (!e.is_available) s.add(e.exception_date) })
    return s
  }, [exceptions])

  const appointmentsByDay = useMemo(() => {
    const map: Record<string, Appointment[]> = {}
    appointments.forEach((a) => {
      const key = a.start_at.slice(0, 10)
      if (!map[key]) map[key] = []
      map[key].push(a)
    })
    return map
  }, [appointments])

  const prevMonth = () => onMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  const nextMonth = () => onMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  const monthLabel = currentMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })

  const totalCells = startOffset + days
  const trailingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7)

  return (
    <div className="rounded-2xl border bg-card overflow-hidden">
      {/* Month navigation */}
      <div className="flex items-center justify-between px-5 py-4 border-b bg-muted/20">
        <button
          onClick={prevMonth}
          className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-accent transition-colors cursor-pointer text-muted-foreground hover:text-foreground"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h2 className="text-sm font-semibold capitalize tracking-wide">{monthLabel}</h2>
        <button
          onClick={nextMonth}
          className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-accent transition-colors cursor-pointer text-muted-foreground hover:text-foreground"
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 border-b">
        {DAY_LABELS.map((d) => (
          <div key={d} className="py-2.5 text-center text-xs font-medium text-muted-foreground tracking-wide uppercase">
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 divide-x divide-y divide-border/60">
        {Array.from({ length: startOffset }).map((_, i) => (
          <div key={`es-${i}`} className="bg-muted/10 min-h-[100px]" />
        ))}

        {Array.from({ length: days }).map((_, i) => {
          const dayNum = i + 1
          const cellDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dayNum)
          const dateStr = toLocalDateStr(cellDate)
          const isToday = isSameDay(cellDate, today)
          const isBlocked = exceptionSet.has(dateStr)
          const dayAppts = appointmentsByDay[dateStr] ?? []
          const isWeekend = cellDate.getDay() === 0 || cellDate.getDay() === 6

          return (
            <div
              key={dayNum}
              onClick={() => onDayClick(cellDate)}
              className={cn(
                'min-h-[100px] p-2 cursor-pointer transition-colors group',
                isBlocked
                  ? 'bg-destructive/5 hover:bg-destructive/8'
                  : isWeekend
                  ? 'bg-muted/20 hover:bg-muted/40'
                  : 'bg-card hover:bg-accent/30'
              )}
            >
              {/* Day number */}
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                    isToday
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : isBlocked
                      ? 'text-destructive/70'
                      : isWeekend
                      ? 'text-muted-foreground'
                      : 'text-foreground group-hover:text-primary'
                  )}
                >
                  {dayNum}
                </span>
                {isBlocked && (
                  <span className="text-[9px] text-destructive font-semibold uppercase tracking-wide">Off</span>
                )}
                {!isBlocked && dayAppts.length > 2 && (
                  <span className="text-[9px] text-muted-foreground font-medium">+{dayAppts.length - 2}</span>
                )}
              </div>

              {/* Appointments */}
              <div className="space-y-0.5">
                {dayAppts.slice(0, 2).map((a) => (
                  <button
                    key={a.id}
                    onClick={(e) => { e.stopPropagation(); onAppointmentClick(a) }}
                    className="w-full text-left rounded-md bg-primary/12 hover:bg-primary/20 border border-primary/15 px-1.5 py-0.5 transition-colors group/appt"
                  >
                    <p className="text-[10px] font-medium text-primary truncate leading-tight">
                      {formatTime(a.start_at)} {a.title}
                    </p>
                    {a.client_id && clientNames[a.client_id] && (
                      <p className="text-[9px] text-muted-foreground truncate leading-tight">
                        {clientNames[a.client_id]}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )
        })}

        {Array.from({ length: trailingCells }).map((_, i) => (
          <div key={`ee-${i}`} className="bg-muted/10 min-h-[100px]" />
        ))}
      </div>
    </div>
  )
}
