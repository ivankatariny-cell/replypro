'use client'

import { useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { AppointmentCard } from './AppointmentCard'
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
    // Monday-based: getDay() returns 0=Sun, convert to Mon=0
    const rawDay = firstDay.getDay()
    const offset = rawDay === 0 ? 6 : rawDay - 1
    const daysInMonth = lastDay.getDate()
    return { days: daysInMonth, startOffset: offset }
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

  // Build grid cells: leading empty + day cells
  const totalCells = startOffset + days
  const trailingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7)

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-accent transition-colors cursor-pointer"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h2 className="text-sm font-semibold capitalize">{monthLabel}</h2>
        <button
          onClick={nextMonth}
          className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-accent transition-colors cursor-pointer"
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-px">
        {DAY_LABELS.map((d) => (
          <div key={d} className="py-1.5 text-center text-xs font-medium text-muted-foreground">
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-px bg-border rounded-xl overflow-hidden border">
        {/* Leading empty cells */}
        {Array.from({ length: startOffset }).map((_, i) => (
          <div key={`empty-start-${i}`} className="bg-muted/30 min-h-[80px]" />
        ))}

        {/* Day cells */}
        {Array.from({ length: days }).map((_, i) => {
          const dayNum = i + 1
          const cellDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dayNum)
          const dateStr = toLocalDateStr(cellDate)
          const isToday = isSameDay(cellDate, today)
          const isBlocked = exceptionSet.has(dateStr)
          const dayAppts = appointmentsByDay[dateStr] ?? []

          return (
            <div
              key={dayNum}
              onClick={() => onDayClick(cellDate)}
              className={cn(
                'bg-card min-h-[80px] p-1.5 cursor-pointer hover:bg-accent/40 transition-colors',
                isBlocked && 'bg-destructive/5 hover:bg-destructive/10'
              )}
            >
              {/* Day number */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
                    isToday && 'bg-primary text-primary-foreground',
                    !isToday && 'text-foreground'
                  )}
                >
                  {dayNum}
                </span>
                {isBlocked && (
                  <span className="text-[10px] text-destructive font-medium">Blocked</span>
                )}
                {!isBlocked && dayAppts.length > 2 && (
                  <span className="text-[10px] text-muted-foreground">{dayAppts.length}</span>
                )}
              </div>

              {/* Appointments (show up to 2, then +N) */}
              <div className="space-y-0.5">
                {dayAppts.slice(0, 2).map((a) => (
                  <AppointmentCard
                    key={a.id}
                    appointment={a}
                    clientName={a.client_id ? clientNames[a.client_id] : undefined}
                    propertyTitle={a.property_id ? propertyTitles[a.property_id] : undefined}
                    onClick={(e) => { (e as unknown as MouseEvent).stopPropagation?.(); onAppointmentClick(a) }}
                    compact
                  />
                ))}
                {dayAppts.length > 2 && (
                  <p className="text-[10px] text-muted-foreground pl-1">+{dayAppts.length - 2} more</p>
                )}
              </div>
            </div>
          )
        })}

        {/* Trailing empty cells */}
        {Array.from({ length: trailingCells }).map((_, i) => (
          <div key={`empty-end-${i}`} className="bg-muted/30 min-h-[80px]" />
        ))}
      </div>
    </div>
  )
}
