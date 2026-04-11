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
const CELL_HEIGHT = 56

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
}: Props) {
  const today = new Date()

  const weekDays = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart)
      d.setDate(weekStart.getDate() + i)
      return d
    }),
    [weekStart]
  )

  const apptsByDay = useMemo(() => {
    const map: Record<string, Appointment[]> = {}
    appointments.forEach((a) => {
      const key = a.start_at.slice(0, 10)
      if (!map[key]) map[key] = []
      map[key].push(a)
    })
    return map
  }, [appointments])

  const prevWeek = () => { const d = new Date(weekStart); d.setDate(d.getDate() - 7); onWeekChange(d) }
  const nextWeek = () => { const d = new Date(weekStart); d.setDate(d.getDate() + 7); onWeekChange(d) }

  const weekLabel = `${weekDays[0].toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ${weekDays[6].toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`
  const totalGridHeight = HOURS.length * CELL_HEIGHT

  return (
    <div className="rounded-2xl border bg-card overflow-hidden">
      {/* Week navigation */}
      <div className="flex items-center justify-between px-5 py-4 border-b bg-muted/20">
        <button
          onClick={prevWeek}
          className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-accent transition-colors cursor-pointer text-muted-foreground hover:text-foreground"
          aria-label="Previous week"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h2 className="text-sm font-semibold">{weekLabel}</h2>
        <button
          onClick={nextWeek}
          className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-accent transition-colors cursor-pointer text-muted-foreground hover:text-foreground"
          aria-label="Next week"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-[52px_repeat(7,1fr)] border-b">
        <div className="border-r border-border/60" />
        {weekDays.map((day, i) => {
          const isToday = isSameDay(day, today)
          const isWeekend = day.getDay() === 0 || day.getDay() === 6
          return (
            <div
              key={i}
              className={cn(
                'text-center py-3 border-r border-border/60 last:border-r-0',
                isWeekend && 'bg-muted/20'
              )}
            >
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{DAY_SHORT[i]}</p>
              <div className={cn(
                'mx-auto mt-1 flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold',
                isToday ? 'bg-primary text-primary-foreground shadow-sm' : 'text-foreground'
              )}>
                {day.getDate()}
              </div>
            </div>
          )
        })}
      </div>

      {/* Scrollable time grid */}
      <div className="overflow-y-auto max-h-[560px]">
        <div
          className="grid grid-cols-[52px_repeat(7,1fr)] relative"
          style={{ height: totalGridHeight }}
        >
          {/* Time gutter */}
          <div className="border-r border-border/60 relative bg-muted/10">
            {HOURS.map((h) => (
              <div
                key={h}
                className="absolute w-full flex items-start justify-end pr-2.5"
                style={{ top: (h - HOUR_START) * CELL_HEIGHT, height: CELL_HEIGHT }}
              >
                <span className="text-[10px] text-muted-foreground/70 font-medium -translate-y-2">
                  {String(h).padStart(2, '0')}:00
                </span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDays.map((day, colIdx) => {
            const dateStr = toLocalDateStr(day)
            const dayAppts = apptsByDay[dateStr] ?? []
            const isWeekend = day.getDay() === 0 || day.getDay() === 6

            return (
              <div
                key={colIdx}
                className={cn(
                  'relative border-r border-border/60 last:border-r-0',
                  isWeekend && 'bg-muted/10'
                )}
              >
                {/* Hour lines */}
                {HOURS.map((h) => (
                  <div
                    key={h}
                    className="absolute w-full border-t border-border/40"
                    style={{ top: (h - HOUR_START) * CELL_HEIGHT }}
                  />
                ))}

                {/* Half-hour lines */}
                {HOURS.map((h) => (
                  <div
                    key={`half-${h}`}
                    className="absolute w-full border-t border-border/20 border-dashed"
                    style={{ top: (h - HOUR_START) * CELL_HEIGHT + CELL_HEIGHT / 2 }}
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
                  const height = Math.max(((clampedEnd - clampedStart) / 60) * CELL_HEIGHT, 22)

                  return (
                    <button
                      key={a.id}
                      onClick={() => onAppointmentClick(a)}
                      className="absolute left-1 right-1 rounded-lg bg-primary/15 border border-primary/25 hover:bg-primary/25 hover:border-primary/40 transition-all cursor-pointer overflow-hidden text-left px-2 py-1 shadow-sm"
                      style={{ top, height }}
                    >
                      <p className="text-[11px] font-semibold text-primary truncate leading-tight">{a.title}</p>
                      {height > 32 && (
                        <p className="text-[10px] text-primary/70 truncate leading-tight mt-0.5">
                          {new Date(a.start_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {' – '}
                          {new Date(a.end_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                      {height > 48 && a.client_id && clientNames[a.client_id] && (
                        <p className="text-[10px] text-muted-foreground truncate leading-tight mt-0.5">
                          {clientNames[a.client_id]}
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
