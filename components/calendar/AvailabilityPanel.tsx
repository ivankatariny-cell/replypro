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
      map[d] = { start_time: r?.start_time ?? '09:00', end_time: r?.end_time ?? '18:00', is_available: r?.is_available ?? true }
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
    setTimeout(() => setSavedDay(null), 1500)
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
    <div className="space-y-6">
      {/* Weekly rules */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          {lang === 'hr' ? 'Tjedna dostupnost' : 'Weekly Availability'}
        </p>
        <div className="rounded-xl border overflow-hidden divide-y divide-border/60">
          {WEEKDAY_ORDER.map((day) => {
            const r = localRules[day]
            const isSaved = savedDay === day
            const isWeekend = day === 0 || day === 6
            return (
              <div
                key={day}
                className={`flex items-center gap-3 px-4 py-3 transition-colors ${isWeekend ? 'bg-muted/20' : 'bg-card'}`}
              >
                {/* Toggle */}
                <button
                  onClick={() => handleRuleChange(day, 'is_available', !r.is_available)}
                  className={`relative h-5 w-9 shrink-0 rounded-full transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    r.is_available ? 'bg-primary' : 'bg-muted-foreground/25'
                  }`}
                  aria-label={`Toggle ${DAY_NAMES[String(day)][lang]}`}
                >
                  <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${r.is_available ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </button>

                {/* Day name */}
                <span className={`w-28 text-sm font-medium shrink-0 ${!r.is_available ? 'text-muted-foreground' : ''}`}>
                  {DAY_NAMES[String(day)][lang]}
                </span>

                {/* Time inputs */}
                <div className={`flex items-center gap-2 flex-1 transition-opacity ${r.is_available ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                  <input
                    type="time"
                    value={r.start_time}
                    onChange={(e) => handleRuleChange(day, 'start_time', e.target.value)}
                    className="h-8 rounded-lg border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring w-28 cursor-pointer"
                  />
                  <span className="text-muted-foreground text-xs font-medium">–</span>
                  <input
                    type="time"
                    value={r.end_time}
                    onChange={(e) => handleRuleChange(day, 'end_time', e.target.value)}
                    className="h-8 rounded-lg border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring w-28 cursor-pointer"
                  />
                </div>

                {/* Save button */}
                <button
                  onClick={() => handleSaveRule(day)}
                  disabled={saving}
                  className={`shrink-0 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer disabled:opacity-50 ${
                    isSaved
                      ? 'bg-success/10 text-success border border-success/20'
                      : 'bg-primary/10 text-primary hover:bg-primary/20 border border-transparent'
                  }`}
                >
                  {isSaved ? <Check className="h-3 w-3" /> : null}
                  {isSaved ? (lang === 'hr' ? 'Spremljeno' : 'Saved') : (lang === 'hr' ? 'Spremi' : 'Save')}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Exceptions */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          {lang === 'hr' ? 'Slobodni dani (iznimke)' : 'Days Off (Exceptions)'}
        </p>

        {/* Add exception row */}
        <div className="flex items-end gap-2 mb-3">
          <div className="flex-1 space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium">
              {lang === 'hr' ? 'Datum' : 'Date'}
            </label>
            <Input type="date" value={newExcDate} onChange={(e) => setNewExcDate(e.target.value)} className="h-9" />
          </div>
          <div className="flex-1 space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium">
              {lang === 'hr' ? 'Razlog (opcionalno)' : 'Reason (optional)'}
            </label>
            <Input
              value={newExcReason}
              onChange={(e) => setNewExcReason(e.target.value)}
              placeholder={lang === 'hr' ? 'Npr. praznik' : 'e.g. holiday'}
              className="h-9"
            />
          </div>
          <button
            onClick={handleAddException}
            disabled={!newExcDate || addingExc}
            className="flex h-9 items-center gap-1.5 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors shrink-0 shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            {lang === 'hr' ? 'Dodaj' : 'Add'}
          </button>
        </div>

        {/* Exception list */}
        {exceptions.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-muted/20 py-6 text-center">
            <p className="text-sm text-muted-foreground">
              {lang === 'hr' ? 'Nema slobodnih dana.' : 'No days off added yet.'}
            </p>
          </div>
        ) : (
          <div className="rounded-xl border overflow-hidden divide-y divide-border/60">
            {exceptions.map((exc) => (
              <div key={exc.id} className="flex items-center gap-3 px-4 py-3 bg-card">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
                  <span className="text-xs font-bold text-destructive">
                    {new Date(exc.exception_date + 'T00:00:00').getDate()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">
                    {new Date(exc.exception_date + 'T00:00:00').toLocaleDateString(undefined, {
                      weekday: 'short', month: 'short', day: 'numeric'
                    })}
                  </p>
                  {exc.reason && <p className="text-xs text-muted-foreground truncate">{exc.reason}</p>}
                </div>
                <span className="text-xs text-destructive font-medium shrink-0 bg-destructive/8 px-2 py-0.5 rounded-full">
                  {lang === 'hr' ? 'Slobodan' : 'Day off'}
                </span>
                <button
                  onClick={() => onDeleteException(exc.id)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer shrink-0"
                  aria-label="Delete exception"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
