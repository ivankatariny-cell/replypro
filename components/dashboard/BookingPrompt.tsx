'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { CalendarPlus, Check, X, Clock, ChevronDown, ChevronUp, AlertTriangle, CalendarDays, User, Building2 } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/hooks/useUser'
import { useClients } from '@/hooks/useClients'
import { useProperties } from '@/hooks/useProperties'
import { useAppStore } from '@/store/app-store'
import { useToast } from '@/components/ui/toast'
import type { SuggestedBooking } from '@/types'

interface Props {
  booking: SuggestedBooking
  clientId?: string | null
  propertyId?: string | null
  /** Whether the requested slot conflicts with existing appointments */
  hasConflict?: boolean
  onDismiss: () => void
}

const t = {
  hr: {
    header: 'Dodati u kalendar?',
    subheader: 'Klijent predlaže termin',
    conflictBadge: 'Termin zauzet',
    conflictNote: 'Ovaj termin se preklapa s postojećim terminom. Možete ga svejedno dodati ili promijeniti vrijeme.',
    titleLabel: 'Naziv termina',
    changeTime: 'Promijeni datum/vrijeme',
    dateLabel: 'Datum',
    startLabel: 'Početak',
    endLabel: 'Kraj',
    addBtn: 'Dodaj u kalendar',
    addingBtn: 'Dodajem...',
    dismissBtn: 'Zanemari',
    savedMsg: 'Termin dodan u kalendar',
    viewCalendar: 'Otvori kalendar',
    endError: 'Kraj mora biti nakon početka.',
    errorMsg: 'Greška pri stvaranju termina.',
    clientLabel: 'Klijent',
    propertyLabel: 'Nekretnina',
  },
  en: {
    header: 'Add to calendar?',
    subheader: 'Client suggested a time',
    conflictBadge: 'Time conflict',
    conflictNote: 'This slot overlaps with an existing appointment. You can still add it or pick a different time.',
    titleLabel: 'Appointment title',
    changeTime: 'Change date / time',
    dateLabel: 'Date',
    startLabel: 'Start',
    endLabel: 'End',
    addBtn: 'Add to calendar',
    addingBtn: 'Adding...',
    dismissBtn: 'Dismiss',
    savedMsg: 'Appointment added to calendar',
    viewCalendar: 'Open calendar',
    endError: 'End time must be after start.',
    errorMsg: 'Failed to create appointment.',
    clientLabel: 'Client',
    propertyLabel: 'Property',
  },
}

export function BookingPrompt({ booking, clientId, propertyId, hasConflict = false, onDismiss }: Props) {
  const lang = booking.language ?? 'en'
  const copy = t[lang]

  const { user } = useUser()
  const { clients } = useClients()
  const { properties } = useProperties()
  const addAppointment = useAppStore((s) => s.addAppointment)
  const { toast } = useToast()

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [savedDate, setSavedDate] = useState('')
  const [showCustomTime, setShowCustomTime] = useState(false)

  const [title, setTitle] = useState(booking.suggestedTitle)
  const [date, setDate] = useState(booking.date)
  const [startTime, setStartTime] = useState(booking.startTime)
  const [endTime, setEndTime] = useState(booking.endTime)

  const clientName = clientId ? (clients.find((c) => c.id === clientId)?.full_name ?? null) : null
  const propertyTitle = propertyId ? (properties.find((p) => p.id === propertyId)?.title ?? null) : null

  const handleSave = async () => {
    if (!user) return
    if (startTime >= endTime) {
      toast(copy.endError, 'error')
      return
    }
    setSaving(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('rp_appointments')
      .insert({
        user_id: user.id,
        title: title.trim() || booking.suggestedTitle,
        start_at: new Date(`${date}T${startTime}:00`).toISOString(),
        end_at: new Date(`${date}T${endTime}:00`).toISOString(),
        client_id: clientId ?? null,
        property_id: propertyId ?? null,
        description: null,
      })
      .select()
      .single()

    if (error) {
      toast(copy.errorMsg, 'error')
    } else if (data) {
      addAppointment(data)
      setSavedDate(date)
      setSaved(true)
      toast(copy.savedMsg, 'success')
    }
    setSaving(false)
  }

  // ── Saved state ────────────────────────────────────────────────────────────
  if (saved) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl border border-success/25 bg-success/8 overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-success/15">
              <Check className="h-4.5 w-4.5 text-success" />
            </div>
            <div>
              <p className="text-sm font-semibold text-success">{copy.savedMsg}</p>
              <p className="text-xs text-success/70 mt-0.5">{title}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/calendar?date=${savedDate}`}
              className="inline-flex items-center gap-1.5 rounded-xl bg-success/15 hover:bg-success/25 px-3 py-1.5 text-xs font-semibold text-success transition-colors cursor-pointer"
            >
              <CalendarDays className="h-3.5 w-3.5" />
              {copy.viewCalendar}
            </Link>
            <button
              onClick={onDismiss}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-success/50 hover:text-success hover:bg-success/10 transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </motion.div>
    )
  }

  // ── Main prompt ────────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="rounded-2xl border border-primary/20 bg-card overflow-hidden shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b bg-primary/5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/12">
            <CalendarPlus className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold">{copy.header}</p>
            <p className="text-xs text-muted-foreground">{copy.subheader}</p>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
          aria-label="Dismiss"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="px-5 py-4 space-y-4">
        {/* Conflict warning */}
        {hasConflict && (
          <div className="flex items-start gap-2.5 rounded-xl border border-warning/25 bg-warning/8 px-3.5 py-3">
            <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-warning">{copy.conflictBadge}</p>
              <p className="text-xs text-warning/80 mt-0.5">{copy.conflictNote}</p>
            </div>
          </div>
        )}

        {/* Detected time pill */}
        <div className="flex items-center gap-3 rounded-xl border bg-muted/30 px-4 py-3">
          <div className="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary">
            <span className="text-[10px] font-bold uppercase leading-none">
              {new Date(booking.date + 'T00:00:00').toLocaleDateString(lang === 'hr' ? 'hr-HR' : 'en-GB', { month: 'short' })}
            </span>
            <span className="text-base font-bold leading-none mt-0.5">
              {new Date(booking.date + 'T00:00:00').getDate()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold capitalize">{booking.label}</p>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              {clientName && (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <User className="h-3 w-3" />{clientName}
                </span>
              )}
              {propertyTitle && (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Building2 className="h-3 w-3" />{propertyTitle}
                </span>
              )}
              {!clientName && !propertyTitle && (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />{startTime} – {endTime}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Title input */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
            {copy.titleLabel}
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full h-9 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
            placeholder={booking.suggestedTitle}
          />
        </div>

        {/* Change time toggle */}
        <button
          onClick={() => setShowCustomTime(!showCustomTime)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          {showCustomTime ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          {copy.changeTime}
        </button>

        <AnimatePresence>
          {showCustomTime && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-3 gap-3 pt-1">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">{copy.dateLabel}</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full h-9 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">{copy.startLabel}</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full h-9 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">{copy.endLabel}</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full h-9 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={saving || !title.trim()}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-sm"
          >
            <CalendarPlus className="h-4 w-4" />
            {saving ? copy.addingBtn : copy.addBtn}
          </button>
          <button
            onClick={onDismiss}
            className="rounded-xl border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
          >
            {copy.dismissBtn}
          </button>
        </div>
      </div>
    </motion.div>
  )
}
