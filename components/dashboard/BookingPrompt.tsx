'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { CalendarPlus, Check, X, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/hooks/useUser'
import { useClients } from '@/hooks/useClients'
import { useAppStore } from '@/store/app-store'
import { useToast } from '@/components/ui/toast'
import type { SuggestedBooking } from '@/types'

interface Props {
  booking: SuggestedBooking
  clientId?: string | null
  propertyId?: string | null
  language: 'hr' | 'en'
  onDismiss: () => void
}

export function BookingPrompt({ booking, clientId, propertyId, language, onDismiss }: Props) {
  const { user } = useUser()
  const { clients } = useClients()
  const addAppointment = useAppStore((s) => s.addAppointment)
  const { toast } = useToast()

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showCustomTime, setShowCustomTime] = useState(false)

  // Editable fields — pre-filled from extraction
  const [title, setTitle] = useState(booking.suggestedTitle)
  const [date, setDate] = useState(booking.date)
  const [startTime, setStartTime] = useState(booking.startTime)
  const [endTime, setEndTime] = useState(booking.endTime)

  const clientName = clientId ? clients.find((c) => c.id === clientId)?.full_name : null

  const handleSave = async () => {
    if (!user) return
    if (startTime >= endTime) {
      toast(language === 'hr' ? 'Kraj mora biti nakon početka.' : 'End time must be after start.', 'error')
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
      toast(language === 'hr' ? 'Greška pri stvaranju termina.' : 'Failed to create appointment.', 'error')
    } else if (data) {
      addAppointment(data)
      setSaved(true)
      toast(
        language === 'hr' ? 'Termin dodan u kalendar.' : 'Appointment added to calendar.',
        'success'
      )
      setTimeout(onDismiss, 1800)
    }
    setSaving(false)
  }

  if (saved) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl border border-success/25 bg-success/8 px-5 py-4 flex items-center gap-3"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success/15">
          <Check className="h-4 w-4 text-success" />
        </div>
        <p className="text-sm font-medium text-success">
          {language === 'hr' ? 'Termin dodan u kalendar.' : 'Appointment added to calendar.'}
        </p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.2 }}
      className="rounded-2xl border border-primary/20 bg-primary/5 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-primary/15 bg-primary/8">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15">
            <CalendarPlus className="h-3.5 w-3.5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {language === 'hr' ? 'Dodati u kalendar?' : 'Add to calendar?'}
            </p>
            <p className="text-xs text-muted-foreground">
              {language === 'hr' ? 'Klijent traži termin' : 'Client requested a time'}
            </p>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-foreground transition-colors cursor-pointer"
          aria-label="Dismiss"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Detected time */}
      <div className="px-5 py-4 space-y-3">
        <div className="flex items-center gap-2 rounded-xl bg-card border px-4 py-3">
          <Clock className="h-4 w-4 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">{booking.label}</p>
            {clientName && (
              <p className="text-xs text-muted-foreground mt-0.5">{clientName}</p>
            )}
          </div>
        </div>

        {/* Title input */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
            {language === 'hr' ? 'Naziv termina' : 'Appointment title'}
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full h-9 rounded-xl border border-input bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
            placeholder={booking.suggestedTitle}
          />
        </div>

        {/* Custom time toggle */}
        <button
          onClick={() => setShowCustomTime(!showCustomTime)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors cursor-pointer"
        >
          {showCustomTime ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          {language === 'hr' ? 'Promijeni vrijeme' : 'Change time'}
        </button>

        <AnimatePresence>
          {showCustomTime && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-3 gap-3 pt-1">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                    {language === 'hr' ? 'Datum' : 'Date'}
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full h-9 rounded-xl border border-input bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                    {language === 'hr' ? 'Početak' : 'Start'}
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full h-9 rounded-xl border border-input bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                    {language === 'hr' ? 'Kraj' : 'End'}
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full h-9 rounded-xl border border-input bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleSave}
            disabled={saving || !title.trim()}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-sm"
          >
            <CalendarPlus className="h-4 w-4" />
            {saving
              ? (language === 'hr' ? 'Dodajem...' : 'Adding...')
              : (language === 'hr' ? 'Dodaj u kalendar' : 'Add to calendar')}
          </button>
          <button
            onClick={onDismiss}
            className="rounded-xl border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
          >
            {language === 'hr' ? 'Zanemari' : 'Dismiss'}
          </button>
        </div>
      </div>
    </motion.div>
  )
}
