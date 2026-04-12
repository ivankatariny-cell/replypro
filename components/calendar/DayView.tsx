'use client'

import { useMemo } from 'react'
import { motion } from 'motion/react'
import { ArrowLeft, Plus, Clock, User, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { Appointment, AvailabilityRule, AvailabilityException } from '@/types'

interface Props {
  date: Date
  appointments: Appointment[]
  rules: AvailabilityRule[]
  exceptions: AvailabilityException[]
  clientNames: Record<string, string>
  propertyTitles: Record<string, string>
  language: string
  onBack: () => void
  onNewAppointment: () => void
  onAppointmentClick: (a: Appointment) => void
}

const HOUR_START = 7
const HOUR_END = 23
const HOURS = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i)
const CELL_H = 64 // px per hour

function pad(n: number) { return String(n).padStart(2, '0') }

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function timeToMin(t: string) {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function getAppointmentColor(appt: Appointment) {
  if (appt.property_id) return { bg: 'bg-primary/15', border: 'border-primary/25', hoverBg: 'hover:bg-primary/25', hoverBorder: 'hover:border-primary/40', text: 'text-primary', sub: 'text-primary/70', icon: 'text-primary/60' }
  if (appt.client_id)   return { bg: 'bg-info/15',    border: 'border-info/25',    hoverBg: 'hover:bg-info/25',    hoverBorder: 'hover:border-info/40',    text: 'text-info',    sub: 'text-info/70',    icon: 'text-info/60' }
  return { bg: 'bg-muted/50', border: 'border-border', hoverBg: 'hover:bg-muted/70', hoverBorder: 'hover:border-border', text: 'text-muted-foreground', sub: 'text-muted-foreground/70', icon: 'text-muted-foreground/60' }
}

export function DayView({
  date,
  appointments,
  rules,
  exceptions,
  clientNames,
  propertyTitles,
  language,
  onBack,
  onNewAppointment,
  onAppointmentClick,
}: Props) {
  const lang = language === 'hr' ? 'hr' : 'en'
  const today = new Date()
  const isToday = isSameDay(date, today)
  const dateStr = toDateStr(date)

  // Check if day is blocked by exception
  const exception = exceptions.find((e) => e.exception_date === dateStr)
  const isBlocked = exception && !exception.is_available

  // Get availability rule for this weekday
  const dow = date.getDay() // 0=Sun
  const rule = rules.find((r) => r.day_of_week === dow)
  const ruleStart = rule?.is_available ? timeToMin(rule.start_time.slice(0, 5)) : null
  const ruleEnd = rule?.is_available ? timeToMin(rule.end_time.slice(0, 5)) : null

  // Day's appointments
  const dayAppts = useMemo(() =>
    appointments
      .filter((a) => a.start_at.startsWith(dateStr))
      .sort((a, b) => a.start_at.localeCompare(b.start_at)),
    [appointments, dateStr]
  )

  const dateLabel = date.toLocaleDateString(lang === 'hr' ? 'hr-HR' : 'en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  const totalHeight = HOURS.length * CELL_H

  return (
    <motion.div
      initial={{ opacity: 0, x: 32 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 32 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="rounded-2xl border bg-card overflow-hidden shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b bg-muted/20">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            aria-label="Back to calendar"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h2 className="text-sm font-semibold capitalize">{dateLabel}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isBlocked
                ? (lang === 'hr' ? 'Slobodan dan' : 'Day off')
                : dayAppts.length === 0
                ? (lang === 'hr' ? 'Nema termina' : 'No appointments')
                : `${dayAppts.length} ${lang === 'hr' ? (dayAppts.length === 1 ? 'termin' : 'termina') : (dayAppts.length === 1 ? 'appointment' : 'appointments')}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isToday && (
            <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
              {lang === 'hr' ? 'Danas' : 'Today'}
            </span>
          )}
          <button
            onClick={onNewAppointment}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            {lang === 'hr' ? 'Novi termin' : 'New'}
          </button>
        </div>
      </div>

      {/* Blocked day banner */}
      {isBlocked && (
        <div className="px-5 py-3 bg-destructive/5 border-b border-destructive/15">
          <p className="text-sm text-destructive font-medium">
            {exception?.reason
              ? (lang === 'hr' ? `Slobodan dan: ${exception.reason}` : `Day off: ${exception.reason}`)
              : (lang === 'hr' ? 'Ovaj dan je označen kao slobodan.' : 'This day is marked as a day off.')}
          </p>
        </div>
      )}

      {/* Hourly grid */}
      <div className="overflow-y-auto max-h-[600px]">
        <div className="relative" style={{ height: totalHeight }}>
          {/* Hour rows */}
          {HOURS.map((h) => {
            const hMin = h * 60
            const isInWorkHours = ruleStart !== null && ruleEnd !== null && hMin >= ruleStart && hMin < ruleEnd
            const isCurrentHour = isToday && new Date().getHours() === h

            return (
              <div
                key={h}
                className={cn(
                  'absolute w-full flex border-t border-border/40',
                  isInWorkHours && !isBlocked ? 'bg-primary/3' : 'bg-transparent',
                  isCurrentHour && 'bg-primary/6'
                )}
                style={{ top: (h - HOUR_START) * CELL_H, height: CELL_H }}
              >
                {/* Time label */}
                <div className="w-14 shrink-0 flex items-start justify-end pr-3 pt-1.5">
                  <span className={cn(
                    'text-[11px] font-medium',
                    isCurrentHour ? 'text-primary font-bold' : 'text-muted-foreground/60'
                  )}>
                    {pad(h)}:00
                  </span>
                </div>
                {/* Hour cell */}
                <div className="flex-1 border-l border-border/40 relative" />
              </div>
            )
          })}

          {/* Current time indicator */}
          {isToday && (() => {
            const now = new Date()
            const nowMin = now.getHours() * 60 + now.getMinutes()
            const top = ((nowMin - HOUR_START * 60) / 60) * CELL_H
            if (top < 0 || top > totalHeight) return null
            return (
              <div
                className="absolute left-0 right-0 z-10 flex items-center pointer-events-none"
                style={{ top }}
              >
                <div className="w-14 flex justify-end pr-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                </div>
                <div className="flex-1 h-px bg-primary" />
              </div>
            )
          })()}

          {/* Appointments */}
          {dayAppts.map((a) => {
            const startMin = timeToMin(new Date(a.start_at).toTimeString().slice(0, 5))
            const endMin = timeToMin(new Date(a.end_at).toTimeString().slice(0, 5))
            const clampedStart = Math.max(startMin, HOUR_START * 60)
            const clampedEnd = Math.min(endMin, HOUR_END * 60)
            if (clampedEnd <= clampedStart) return null

            const top = ((clampedStart - HOUR_START * 60) / 60) * CELL_H
            const height = Math.max(((clampedEnd - clampedStart) / 60) * CELL_H, 28)
            const clientName = a.client_id ? clientNames[a.client_id] : null
            const propertyTitle = a.property_id ? propertyTitles[a.property_id] : null
            const c = getAppointmentColor(a)

            return (
              <button
                key={a.id}
                onClick={() => onAppointmentClick(a)}
                className={cn('absolute left-16 right-3 rounded-xl border transition-all cursor-pointer overflow-hidden text-left px-3 py-2 shadow-sm z-20', c.bg, c.border, c.hoverBg, c.hoverBorder)}
                style={{ top: top + 2, height: height - 4 }}
              >
                <p className={cn('text-xs font-bold truncate leading-tight', c.text)}>{a.title}</p>
                {height > 36 && (
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className={cn('h-2.5 w-2.5 shrink-0', c.icon)} />
                    <span className={cn('text-[10px] font-medium', c.sub)}>
                      {new Date(a.start_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {' – '}
                      {new Date(a.end_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )}
                {height > 56 && clientName && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <User className={cn('h-2.5 w-2.5 shrink-0', c.icon)} />
                    <span className={cn('text-[10px] truncate', c.sub)}>{clientName}</span>
                  </div>
                )}
                {height > 72 && propertyTitle && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <Building2 className={cn('h-2.5 w-2.5 shrink-0', c.icon)} />
                    <span className={cn('text-[10px] truncate', c.sub)}>{propertyTitle}</span>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Empty state */}
      {dayAppts.length === 0 && !isBlocked && (
        <div className="px-5 py-6 border-t text-center">
          <p className="text-sm text-muted-foreground">
            {lang === 'hr' ? 'Nema termina za ovaj dan.' : 'No appointments for this day.'}
          </p>
          <button
            onClick={onNewAppointment}
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            {lang === 'hr' ? 'Dodaj termin' : 'Add appointment'}
          </button>
        </div>
      )}
    </motion.div>
  )
}
