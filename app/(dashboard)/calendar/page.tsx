'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Plus, X, CalendarDays, LayoutGrid, RefreshCw, Settings2, ChevronRight } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { useAppointments } from '@/hooks/useAppointments'
import { useAvailability } from '@/hooks/useAvailability'
import { useClients } from '@/hooks/useClients'
import { useProperties } from '@/hooks/useProperties'
import { useUser } from '@/hooks/useUser'
import { useAppStore } from '@/store/app-store'
import { useToast } from '@/components/ui/toast'
import { createClient as createSupabase } from '@/lib/supabase/client'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { MonthGrid } from '@/components/calendar/MonthGrid'
import { WeekGrid } from '@/components/calendar/WeekGrid'
import { DayView } from '@/components/calendar/DayView'
import { AppointmentForm, type AppointmentFormData } from '@/components/calendar/AppointmentForm'
import { AvailabilityPanel } from '@/components/calendar/AvailabilityPanel'
import type { Appointment, AvailabilityRule, AvailabilityException } from '@/types'

type View = 'month' | 'week'

function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function toISO(date: string, time: string): string {
  return new Date(`${date}T${time}:00`).toISOString()
}

export default function CalendarPage() {
  const { t, language } = useTranslation()
  const { toast } = useToast()
  const { user } = useUser()
  const { appointments, loading: apptLoading, error: apptError, refetch: refetchAppts } = useAppointments()
  const { rules, exceptions, loading: availLoading, error: availError, refetch: refetchAvail } = useAvailability()
  const { clients } = useClients()
  const { properties } = useProperties()
  const addAppointment = useAppStore((s) => s.addAppointment)
  const updateAppointment = useAppStore((s) => s.updateAppointment)
  const removeAppointment = useAppStore((s) => s.removeAppointment)

  const [view, setView] = useState<View>('month')
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [currentMonth, setCurrentMonth] = useState(() => { const d = new Date(); d.setDate(1); d.setHours(0,0,0,0); return d })
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()))
  const [showForm, setShowForm] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)
  const [saving, setSaving] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [showAvailability, setShowAvailability] = useState(false)
  const [availSaving, setAvailSaving] = useState(false)

  const loading = apptLoading || availLoading
  const error = apptError || availError

  const clientNames = useMemo(() => {
    const m: Record<string, string> = {}
    clients.forEach((c) => { m[c.id] = c.full_name })
    return m
  }, [clients])

  const propertyTitles = useMemo(() => {
    const m: Record<string, string> = {}
    properties.forEach((p) => { m[p.id] = p.title })
    return m
  }, [properties])

  // ── CRUD ──────────────────────────────────────────────────────────────────

  const handleSave = async (data: AppointmentFormData) => {
    if (!user) return
    setSaving(true)
    const supabase = createSupabase()
    const payload = {
      user_id: user.id,
      title: data.title.trim(),
      description: data.description || null,
      start_at: toISO(data.date, data.start_time),
      end_at: toISO(data.date, data.end_time),
      client_id: data.client_id,
      property_id: data.property_id,
    }

    if (editingAppointment) {
      const { data: updated, error: err } = await supabase
        .from('rp_appointments').update(payload).eq('id', editingAppointment.id).select().single()
      if (err) toast(language === 'hr' ? 'Greška pri ažuriranju.' : 'Failed to update.', 'error')
      else if (updated) { updateAppointment(editingAppointment.id, updated); toast(t('calendar.appointment_updated'), 'success'); closeForm() }
    } else {
      const { data: created, error: err } = await supabase
        .from('rp_appointments').insert(payload).select().single()
      if (err) toast(language === 'hr' ? 'Greška pri stvaranju.' : 'Failed to create.', 'error')
      else if (created) { addAppointment(created); toast(t('calendar.appointment_created'), 'success'); closeForm() }
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    setDeleting(true)
    const supabase = createSupabase()
    const { error: err } = await supabase.from('rp_appointments').delete().eq('id', id)
    if (err) toast(language === 'hr' ? 'Greška pri brisanju.' : 'Failed to delete.', 'error')
    else { removeAppointment(id); toast(t('calendar.appointment_deleted'), 'info') }
    setDeleting(false)
    setConfirmDeleteId(null)
  }

  const handleAppointmentClick = (a: Appointment) => { setEditingAppointment(a); setShowForm(true) }
  const handleDayClick = (date: Date) => {
    setSelectedDay(date)
    setEditingAppointment(null)
    setShowForm(false)
  }
  const handleBackFromDay = () => setSelectedDay(null)
  const closeForm = () => { setShowForm(false); setEditingAppointment(null) }

  // ── Availability ──────────────────────────────────────────────────────────

  const handleSaveRule = async (rule: Omit<AvailabilityRule, 'id' | 'user_id'>) => {
    if (!user) return
    setAvailSaving(true)
    const supabase = createSupabase()
    const { error: err } = await supabase.from('rp_availability_rules')
      .upsert({ ...rule, user_id: user.id }, { onConflict: 'user_id,day_of_week' })
    if (err) toast(language === 'hr' ? 'Greška pri spremanju.' : 'Failed to save.', 'error')
    else { toast(language === 'hr' ? 'Pravilo spremljeno.' : 'Rule saved.', 'success'); refetchAvail() }
    setAvailSaving(false)
  }

  const handleAddException = async (exc: Omit<AvailabilityException, 'id' | 'user_id'>) => {
    if (!user) return
    const supabase = createSupabase()
    const { error: err } = await supabase.from('rp_availability_exceptions')
      .upsert({ ...exc, user_id: user.id }, { onConflict: 'user_id,exception_date' })
    if (err) toast(language === 'hr' ? 'Greška.' : 'Failed.', 'error')
    else { toast(language === 'hr' ? 'Iznimka dodana.' : 'Exception added.', 'success'); refetchAvail() }
  }

  const handleDeleteException = async (id: string) => {
    const supabase = createSupabase()
    const { error: err } = await supabase.from('rp_availability_exceptions').delete().eq('id', id)
    if (!err) refetchAvail()
  }

  const deletingAppt = appointments.find((a) => a.id === confirmDeleteId)

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <CalendarDays className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{t('nav.calendar')}</h1>
            <p className="text-xs text-muted-foreground">
              {appointments.length} {language === 'hr' ? 'termina ukupno' : 'total appointments'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* View toggle */}
          <div className="flex items-center rounded-xl border bg-card p-1 gap-0.5">
            <button
              onClick={() => { setView('month'); setSelectedDay(null) }}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                view === 'month' && !selectedDay
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              {language === 'hr' ? 'Mjesec' : 'Month'}
            </button>
            <button
              onClick={() => { setView('week'); setSelectedDay(null) }}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                view === 'week' && !selectedDay
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              <CalendarDays className="h-3.5 w-3.5" />
              {language === 'hr' ? 'Tjedan' : 'Week'}
            </button>
          </div>

          {/* Availability */}
          <button
            onClick={() => setShowAvailability(!showAvailability)}
            className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition-all cursor-pointer ${
              showAvailability
                ? 'bg-primary/10 border-primary/30 text-primary'
                : 'bg-card text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
          >
            <Settings2 className="h-4 w-4" />
            {language === 'hr' ? 'Dostupnost' : 'Availability'}
          </button>

          {/* New appointment */}
          <button
            onClick={() => { setEditingAppointment(null); setShowForm(!showForm) }}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer shadow-sm"
          >
            {showForm && !editingAppointment ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {language === 'hr' ? 'Novi termin' : 'New appointment'}
          </button>
        </div>
      </div>

      {/* Appointment form panel */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
              {/* Form header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b bg-muted/20">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10">
                    <CalendarDays className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <p className="text-sm font-semibold">
                    {editingAppointment
                      ? (language === 'hr' ? 'Uredi termin' : 'Edit appointment')
                      : (language === 'hr' ? 'Novi termin' : 'New appointment')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {editingAppointment && (
                    <button
                      onClick={() => setConfirmDeleteId(editingAppointment.id)}
                      className="text-xs text-destructive hover:text-destructive/80 font-medium transition-colors cursor-pointer"
                    >
                      {language === 'hr' ? 'Obriši' : 'Delete'}
                    </button>
                  )}
                  <button
                    onClick={closeForm}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="p-5">
                <AppointmentForm
                  initial={editingAppointment ?? undefined}
                  onSave={handleSave}
                  onCancel={closeForm}
                  saving={saving}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Availability panel */}
      <AnimatePresence>
        {showAvailability && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b bg-muted/20">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10">
                    <Settings2 className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <p className="text-sm font-semibold">
                    {language === 'hr' ? 'Postavke dostupnosti' : 'Availability settings'}
                  </p>
                </div>
                <button
                  onClick={() => setShowAvailability(false)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="p-5">
                <AvailabilityPanel
                  rules={rules}
                  exceptions={exceptions}
                  onSaveRule={handleSaveRule}
                  onAddException={handleAddException}
                  onDeleteException={handleDeleteException}
                  saving={availSaving}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error state */}
      {error && !loading && (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-5 py-4 flex items-center justify-between gap-4">
          <p className="text-sm text-destructive">
            {language === 'hr' ? 'Greška pri učitavanju kalendara.' : 'Failed to load calendar data.'}
          </p>
          <button
            onClick={() => { refetchAppts(); refetchAvail() }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/20 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors cursor-pointer shrink-0"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            {language === 'hr' ? 'Pokušaj ponovo' : 'Retry'}
          </button>
        </div>
      )}

      {/* Calendar grid */}
      {loading ? (
        <div className="rounded-2xl border bg-card overflow-hidden">
          <div className="px-5 py-4 border-b bg-muted/20">
            <Skeleton className="h-5 w-36 rounded-lg" />
          </div>
          <div className="grid grid-cols-7 border-b">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="py-2.5 flex justify-center">
                <Skeleton className="h-3 w-8 rounded" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 divide-x divide-y divide-border/60">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="min-h-[100px] p-2">
                <Skeleton className="h-5 w-5 rounded-full mb-2" />
                {i % 5 === 0 && <Skeleton className="h-4 w-full rounded-md" />}
              </div>
            ))}
          </div>
        </div>
      ) : !error && (
        <AnimatePresence mode="wait">
          {selectedDay ? (
            <DayView
              key="day"
              date={selectedDay}
              appointments={appointments}
              rules={rules}
              exceptions={exceptions}
              clientNames={clientNames}
              propertyTitles={propertyTitles}
              language={language}
              onBack={handleBackFromDay}
              onNewAppointment={() => { setEditingAppointment(null); setShowForm(true) }}
              onAppointmentClick={handleAppointmentClick}
            />
          ) : view === 'month' ? (
            <MonthGrid
              key="month"
              appointments={appointments}
              exceptions={exceptions}
              currentMonth={currentMonth}
              onMonthChange={setCurrentMonth}
              onDayClick={handleDayClick}
              onAppointmentClick={handleAppointmentClick}
              clientNames={clientNames}
              propertyTitles={propertyTitles}
            />
          ) : (
            <WeekGrid
              key="week"
              appointments={appointments}
              weekStart={weekStart}
              onWeekChange={setWeekStart}
              onAppointmentClick={handleAppointmentClick}
              clientNames={clientNames}
              propertyTitles={propertyTitles}
            />
          )}
        </AnimatePresence>
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={() => confirmDeleteId && handleDelete(confirmDeleteId)}
        title={language === 'hr' ? 'Obrisati termin?' : 'Delete appointment?'}
        description={
          language === 'hr'
            ? `Ovo će trajno obrisati "${deletingAppt?.title ?? ''}".`
            : `This will permanently delete "${deletingAppt?.title ?? ''}".`
        }
        confirmLabel={t('confirm_dialog.confirm')}
        cancelLabel={t('confirm_dialog.cancel')}
        loading={deleting}
      />
    </div>
  )
}
