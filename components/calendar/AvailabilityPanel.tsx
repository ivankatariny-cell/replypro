'use client'

import { useState } from 'react'
import { Trash2, Plus, Check } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useTranslation } from '@/hooks/useTranslation'
import type { AvailabilityRule, AvailabilityException } from '@/types'

interface Props {
  rules: AvailabilityRule[]
  exceptions: AvailabilityException[]
  onSaveRule: (rule: Omit<AvailabilityRule, 'id' | 'user_id'>) => Promise<void>
  onAddException: (exc: Omit<AvailabilityException, 'id' | 'user_id'>) => Promise<void>
  onDeleteException: (id: string) => Promise<void>
  saving?: boolean
}

const DAY_NAMES: Record<string, { en: string; hr: string }> = {
  '1': { en: 'Monday',    hr: 'Ponedjeljak' },
  '2': { en: 'Tuesday',   hr: 'Utorak' },
  '3': { en: 'Wednesday', hr: 'Srijeda' },
  '4': { en: 'Thursday',  hr: 'Četvrtak' },
  '5': { en: 'Friday',    hr: 'Petak' },
  '6': { en: 'Saturday',  hr: 'Subota' },
  '0': { en: 'Sunday',    hr: 'Nedjelja' },
}

const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0]

export function AvailabilityPanel({ rules, exceptions, onSaveRule, onAddException, onDeleteException, saving = false }: Props) {
  const { language } = useTranslation()
  const lang = language === 'hr' ? 'hr' : 'en'

  const [newExcDate, setNewExcDate] = useState('')
  const [newExcReason, setNewExcReason] = useState('')
  const [addingExc, setAddingExc] = useState(false)
  const [savedDay, setSavedDay] = useState<number | null>(null)

  const [localRules, setLocalRules] = useState<Record<number, { start_time: string; end_time: string; is_available: boolean }>>(() => {
    const map: Record<number, { start_time: string; end_time: string; is_available: boolean }> = {}
    WEEKDAY_ORDER.forEach((d) => {
      const r = rules.find((r) => r.day_of_week === d)
      map[d] = {
        start_time: r?.start_time?.slice(0, 5) ?? '09:00',
        end_time: r?.end_time?.slice(0, 5) ?? '18:00',
        is_available: r?.is_available ?? true,
      }
    })
    return map
  })

  const handleRuleChange = (day: number, field: 'start_time' | 'end_time' | 'is_available', value: string | boolean) => {
    setLocalRules((prev) => ({ ...prev, [day]: { ...prev[day], [field]: value } }))
  }

  const handleSaveRule = async (day: number) => {
    const r = localRules[day]
    await onSaveRule({ day_of_week: day, start_time: r.start_time, end_time: r.end_time, is_available: r.is_available })
    setSavedDay(day)
    setTimeout(() => setSavedDay(null), 1800)
  }

  const handleAddException = async () => {
    if (!newExcDate) return
    setAddingExc(true)
    await onAddException({ exception_date: newExcDate, is_available: false, reason: newExcReason || null })
    setNewExcDate('')
    setNewExcReason('')
    setAddingExc(false)
  }

  return (
    <div className="space-y-8">
      {/* ── Weekly rules ─────────────────────────────────────────────────── */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">
          {lang === 'hr' ? 'Tjedna dostupnost' : 'Weekly Availability'}
        </p>

        <div className="space-y-2">
          {WEEKDAY_ORDER.map((day) => {
            const r = localRules[day]
            const isSaved = savedDay === day
            const isWeekend = day === 0 || day === 6

            return (
              <div
                key={day}
                className={`rounded-xl border transition-colors ${
                  r.is_available
                    ? 'bg-card border-border'
                    : 'bg-muted/30 border-border/50'
                }`}
              >
                {/* Row top: toggle + day name + save */}
                <div className="flex items-center gap-4 px-4 py-3">
                  {/* Toggle — large, clear on/off */}
                  <button
                    onClick={() => handleRuleChange(day, 'is_available', !r.is_available)}
                    className={`relative flex h-7 w-14 shrink-0 items-center rounded-full transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      r.is_available ? 'bg-primary' : 'bg-muted-foreground/20'
                    }`}
                    aria-label={`Toggle ${DAY_NAMES[String(day)][lang]}`}
                  >
                    {/* Track labels */}
                    <span className={`absolute left-1.5 text-[9px] font-bold transition-opacity ${r.is_available ? 'opacity-0' : 'opacity-60 text-muted-foreground'}`}>
                      OFF
                    </span>
                    <span className={`absolute right-1.5 text-[9px] font-bold text-primary-foreground transition-opacity ${r.is_available ? 'opacity-80' : 'opacity-0'}`}>
                      ON
                    </span>
                    {/* Thumb */}
                    <span
                      className={`absolute h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200 ${
                        r.is_available ? 'translate-x-8' : 'translate-x-1'
                      }`}
                    />
                  </button>

                  {/* Day name */}
                  <span className={`flex-1 text-sm font-semibold ${isWeekend ? 'text-muted-foreground' : ''} ${!r.is_available ? 'text-muted-foreground line-through' : ''}`}>
                    {DAY_NAMES[String(day)][lang]}
                  </span>

                  {/* Status badge when off */}
                  {!r.is_available && (
                    <span className="text-xs text-muted-foreground font-medium">
                      {lang === 'hr' ? 'Nedostupan' : 'Unavailable'}
                    </span>
                  )}

                  {/* Save button */}
                  {r.is_available && (
                    <button
                      onClick={() => handleSaveRule(day)}
                      disabled={saving}
                      className={`shrink-0 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 ${
                        isSaved
                          ? 'bg-success/12 text-success border border-success/25'
                          : 'bg-primary/10 text-primary hover:bg-primary/20 border border-transparent'
                      }`}
                    >
                      {isSaved && <Check className="h-3 w-3" />}
                      {isSaved
                        ? (lang === 'hr' ? 'Spremljeno' : 'Saved')
                        : (lang === 'hr' ? 'Spremi' : 'Save')}
                    </button>
                  )}

                  {/* Save unavailable rule */}
                  {!r.is_available && (
                    <button
                      onClick={() => handleSaveRule(day)}
                      disabled={saving}
                      className="shrink-0 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold bg-muted text-muted-foreground hover:bg-accent transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isSaved && <Check className="h-3 w-3 text-success" />}
                      {isSaved
                        ? (lang === 'hr' ? 'Spremljeno' : 'Saved')
                        : (lang === 'hr' ? 'Spremi' : 'Save')}
                    </button>
                  )}
                </div>

                {/* Time row — only when available */}
                {r.is_available && (
                  <div className="flex items-center gap-3 px-4 pb-3">
                    <div className="flex items-center gap-2 flex-1">
                      <div className="flex-1 space-y-1">
                        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                          {lang === 'hr' ? 'Od' : 'From'}
                        </label>
                        <input
                          type="time"
                          value={r.start_time}
                          onChange={(e) => handleRuleChange(day, 'start_time', e.target.value)}
                          className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
                        />
                      </div>
                      <div className="pt-5 text-muted-foreground font-medium text-sm">–</div>
                      <div className="flex-1 space-y-1">
                        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                          {lang === 'hr' ? 'Do' : 'To'}
                        </label>
                        <input
                          type="time"
                          value={r.end_time}
                          onChange={(e) => handleRuleChange(day, 'end_time', e.target.value)}
                          className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
                        />
                      </div>
                    </div>
                    {/* Time summary */}
                    <div className="shrink-0 text-right pt-5">
                      <span className="text-xs text-muted-foreground font-medium">
                        {r.start_time} – {r.end_time}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Exceptions ───────────────────────────────────────────────────── */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">
          {lang === 'hr' ? 'Slobodni dani' : 'Days Off'}
        </p>

        {/* Add exception */}
        <div className="rounded-xl border bg-muted/20 p-4 mb-4 space-y-3">
          <p className="text-xs font-medium text-muted-foreground">
            {lang === 'hr' ? 'Dodaj slobodan dan' : 'Add a day off'}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                {lang === 'hr' ? 'Datum' : 'Date'}
              </label>
              <Input type="date" value={newExcDate} onChange={(e) => setNewExcDate(e.target.value)} className="h-9" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                {lang === 'hr' ? 'Razlog (opcionalno)' : 'Reason (optional)'}
              </label>
              <Input
                value={newExcReason}
                onChange={(e) => setNewExcReason(e.target.value)}
                placeholder={lang === 'hr' ? 'Npr. praznik' : 'e.g. holiday'}
                className="h-9"
              />
            </div>
          </div>
          <button
            onClick={handleAddException}
            disabled={!newExcDate || addingExc}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            {addingExc
              ? (lang === 'hr' ? 'Dodajem...' : 'Adding...')
              : (lang === 'hr' ? 'Dodaj slobodan dan' : 'Add day off')}
          </button>
        </div>

        {/* Exception list */}
        {exceptions.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-muted/10 py-8 text-center">
            <p className="text-sm text-muted-foreground">
              {lang === 'hr' ? 'Nema slobodnih dana.' : 'No days off added yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {exceptions.map((exc) => {
              const d = new Date(exc.exception_date + 'T00:00:00')
              return (
                <div key={exc.id} className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3">
                  <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl bg-destructive/10">
                    <span className="text-[10px] font-bold text-destructive uppercase leading-none">
                      {d.toLocaleDateString(undefined, { month: 'short' })}
                    </span>
                    <span className="text-sm font-bold text-destructive leading-none mt-0.5">
                      {d.getDate()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">
                      {d.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                    {exc.reason && <p className="text-xs text-muted-foreground truncate mt-0.5">{exc.reason}</p>}
                  </div>
                  <span className="text-xs text-destructive font-semibold shrink-0 bg-destructive/8 border border-destructive/15 px-2.5 py-1 rounded-full">
                    {lang === 'hr' ? 'Slobodan' : 'Day off'}
                  </span>
                  <button
                    onClick={() => onDeleteException(exc.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer shrink-0"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
