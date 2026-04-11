'use client'

import { useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { Appointment } from '@/types'

interface Props {
  appointments: Appointment[]
  weekStart: Date
  onWeekChange: (date: Date) => void
  onAppointmentClick: (a: Appointment) => void
  clientNames?: Record<string, string>
  propertyTitles?: Record<string, string>
}

const HOUR_START = 7
const HOUR_END = 22
const HOURS = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i)
const CELL_HEIGHT = 48 // px per hour

function toLocalDateStr(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function getMinutesFromMidnight(iso: string) {
  const d = new Date(iso)
  return d.getHours() * 60 + d.getMinutes()
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function WeekGrid({
  appointments,
  weekStart,
  onWeekChange,
  onAppointmentClick,
  clientNames = {},
  propertyTitles = {},
}: Props) {
  const today = new Date()

  // Build array of 7 days starting from weekStart (Monday)
  const weekDays = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart)
      d.setDate(weekStart.getDate() + i)
      return d
    }),
    [weekStart]
  )

  // Group appointments by day string
  const apptsByDay = useMemo(() => {
    const map: Record<string, Appointment[]> = {}
    appointments.forEach((a) => {
      const key = a.start_at.slice(0, 10)
      if (!map[key]) map[key] = []
      map[key].push(a)
    })
    return map
  }, [appointments])

  const prevWeek = () => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() - 7)
    onWeekChange(d)
  }
  const nextWeek = () => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + 7)
    onWeekChange(d)
  }

  const weekLabel = `${weekDays[0].toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ${weekDays[6].toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`

  const totalGridHeight = HOURS.length * CELL_HEIGHT

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevWeek}
          className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-accent transition-colors cursor-pointer"
          aria-label="Previous week"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h2 className="text-sm font-semibold">{weekLabel}</h2>
        <button
          onClick={nextWeek}
          className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-accent transition-colors cursor-pointer"
          aria-label="Next week"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-[48px_repeat(7,1fr)] gap-px">
        <div /> {/* time gutter */}
        {weekDays.map((day, i) => {
          const isToday = isSameDay(day, today)
          return (
            <div key={i} className="text-center py-1.5">
              <p className="text-xs text-muted-foreground">{DAY_SHORT[i]}</p>
              <p className={cn(
                'mx-auto mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium',
                isToday ? 'bg-primary text-primary-foreground' : 'text-foreground'
              )}>
                {day.getDate()}
              </p>
            </div>
          )
        })}
      </div>

      {/* Scrollable grid */}
      <div className="overflow-y-auto max-h-[600px] rounded-xl border bg-card">
        <div
          className="grid grid-cols-[48px_repeat(7,1fr)] gap-px bg-border"
          style={{ height: totalGridHeight }}
        >
          {/* Time gutter */}
          <div className="bg-card relative">
            {HOURS.map((h) => (
              <div
                key={h}
                className="absolute w-full flex items-start justify-end pr-2"
                style={{ top: (h - HOUR_START) * CELL_HEIGHT, height: CELL_HEIGHT }}
              >
                <span className="text-[10px] text-muted-foreground -translate-y-2">
                  {String(h).padStart(2, '0')}:00
                </span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDays.map((day, colIdx) => {
            const dateStr = toLocalDateStr(day)
            const dayAppts = apptsByDay[dateStr] ?? []

            return (
              <div key={colIdx} className="bg-card relative">
                {/* Hour lines */}
                {HOURS.map((h) => (
                  <div
                    key={h}
                    className="absolute w-full border-t border-border/50"
                    style={{ top: (h - HOUR_START) * CELL_HEIGHT }}
                  />
                ))}

                {/* Appointments */}
                {dayAppts.map((a) => {
                  const startMin = getMinutesFromMidnight(a.start_at)
                  const endMin = getMinutesFromMidnight(a.end_at)
                  const clampedStart = Math.max(startMin, HOUR_START * 60)
                  const clampedEnd = Math.min(endMin, HOUR_END * 60)
                  if (clampedEnd <= clampedStart) return null

                  const top = ((clampedStart - HOUR_START * 60) / 60) * CELL_HEIGHT
                  const height = Math.max(((clampedEnd - clampedStart) / 60) * CELL_HEIGHT, 20)

                  return (
                    <button
                      key={a.id}
                      onClick={() => onAppointmentClick(a)}
                      className="absolute left-0.5 right-0.5 rounded-md bg-primary/15 border border-primary/30 hover:bg-primary/25 transition-colors cursor-pointer overflow-hidden text-left px-1.5 py-0.5"
                      style={{ top, height }}
                    >
                      <p className="text-xs font-medium text-foreground truncate leading-tight">{a.title}</p>
                      {height > 30 && (
                        <p className="text-[10px] text-muted-foreground truncate">
                          {new Date(a.start_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {a.client_id && clientNames[a.client_id] ? ` · ${clientNames[a.client_id]}` : ''}
                        </p>
                      )}
                    </button>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
