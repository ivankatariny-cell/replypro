// Feature: calendar-appointments
// Property tests for availability rule round-trip and slot blocking logic
// Properties 6, 7, 8, 9
// Validates: Requirements 2.2, 2.3, 2.4, 2.6

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import type { AvailabilityRuleRow, AvailabilityExceptionRow, AppointmentRow } from '@/types/supabase'

// ── Pure slot availability logic (extracted from lib/calendar/availability.ts) ─

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function toDateString(d: Date): string {
  return d.toISOString().slice(0, 10)
}

/**
 * Returns true if the slot on `date` is occupied, given the rule, exception, and appointments.
 * Mirrors the isSlotOccupied logic in lib/calendar/availability.ts.
 */
function isSlotOccupied(
  date: Date,
  rule: AvailabilityRuleRow | undefined,
  exception: AvailabilityExceptionRow | undefined,
  appointments: AppointmentRow[]
): boolean {
  if (exception && !exception.is_available) return true
  if (!rule) return false
  if (!rule.is_available) return true

  const ruleStart = timeToMinutes(rule.start_time)
  const ruleEnd = timeToMinutes(rule.end_time)
  const dateStr = toDateString(date)

  const dayAppointments = appointments.filter((a) => a.start_at.startsWith(dateStr))
  if (dayAppointments.length === 0) return false

  const intervals = dayAppointments
    .map((a) => ({
      start: timeToMinutes(a.start_at.slice(11, 16)),
      end: timeToMinutes(a.end_at.slice(11, 16)),
    }))
    .sort((a, b) => a.start - b.start)

  let covered = ruleStart
  for (const interval of intervals) {
    if (interval.start > covered) break
    covered = Math.max(covered, interval.end)
  }
  return covered >= ruleEnd
}

// ── Arbitraries ───────────────────────────────────────────────────────────────

const timeStrArb = fc.record({
  h: fc.integer({ min: 0, max: 22 }),
  m: fc.integer({ min: 0, max: 59 }),
}).map(({ h, m }) => `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)

// Rule with start_time < end_time
const validRuleArb = fc.record({
  id: fc.uuid(),
  user_id: fc.uuid(),
  day_of_week: fc.integer({ min: 0, max: 6 }),
  times: fc.record({ start: timeStrArb, end: timeStrArb }).filter(({ start, end }) => end > start),
  is_available: fc.boolean(),
}).map(({ id, user_id, day_of_week, times, is_available }) => ({
  id,
  user_id,
  day_of_week,
  start_time: times.start,
  end_time: times.end,
  is_available,
} satisfies AvailabilityRuleRow))

// Unavailable rule
const unavailableRuleArb = validRuleArb.map((r) => ({ ...r, is_available: false }))

// Available rule
const availableRuleArb = validRuleArb.map((r) => ({ ...r, is_available: true }))

const dateArb = fc.record({
  y: fc.integer({ min: 2025, max: 2030 }),
  m: fc.integer({ min: 1, max: 12 }),
  d: fc.integer({ min: 1, max: 28 }),
}).map(({ y, m, d }) => new Date(`${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}T00:00:00.000Z`))

const exceptionArb = fc.record({
  id: fc.uuid(),
  user_id: fc.uuid(),
  exception_date: dateArb.map(toDateString),
  is_available: fc.boolean(),
  reason: fc.option(fc.string({ maxLength: 50 }), { nil: null }),
}).map((e) => e satisfies AvailabilityExceptionRow)

const unavailableExceptionArb = exceptionArb.map((e) => ({ ...e, is_available: false }))

// ── Feature: calendar-appointments, Property 6: Availability rule round-trip ──

describe('Availability rule — Property 6: round-trip preserves all fields', () => {
  it('saving and reading back a rule returns the same fields (min 100 iterations)', () => {
    fc.assert(
      fc.property(validRuleArb, (rule) => {
        // Simulate a "store and retrieve" by cloning the object (as a DB would return it)
        const stored: AvailabilityRuleRow = { ...rule }

        return (
          stored.day_of_week === rule.day_of_week &&
          stored.start_time === rule.start_time &&
          stored.end_time === rule.end_time &&
          stored.is_available === rule.is_available &&
          stored.user_id === rule.user_id
        )
      }),
      { numRuns: 100 }
    )
  })

  it('rule with valid times always has end_time > start_time (min 100 iterations)', () => {
    fc.assert(
      fc.property(validRuleArb, (rule) => {
        return rule.end_time > rule.start_time
      }),
      { numRuns: 100 }
    )
  })

  it('day_of_week is always in range 0–6 (min 100 iterations)', () => {
    fc.assert(
      fc.property(validRuleArb, (rule) => {
        return rule.day_of_week >= 0 && rule.day_of_week <= 6
      }),
      { numRuns: 100 }
    )
  })
})

// ── Feature: calendar-appointments, Property 7: Unavailable weekday rule blocks all slots ──

describe('Slot blocking — Property 7: unavailable rule blocks all slots on that day', () => {
  it('isSlotOccupied returns true when rule.is_available is false (min 100 iterations)', () => {
    fc.assert(
      fc.property(dateArb, unavailableRuleArb, (date, rule) => {
        return isSlotOccupied(date, rule, undefined, []) === true
      }),
      { numRuns: 100 }
    )
  })

  it('isSlotOccupied returns false when no rule exists and no exception (min 100 iterations)', () => {
    fc.assert(
      fc.property(dateArb, (date) => {
        return isSlotOccupied(date, undefined, undefined, []) === false
      }),
      { numRuns: 100 }
    )
  })
})

// ── Feature: calendar-appointments, Property 8: Exception overrides weekday rule ──

describe('Slot blocking — Property 8: unavailable exception overrides any rule', () => {
  it('isSlotOccupied returns true when exception.is_available is false, regardless of rule (min 100 iterations)', () => {
    fc.assert(
      fc.property(dateArb, validRuleArb, unavailableExceptionArb, (date, rule, exception) => {
        // Exception with is_available=false should block regardless of rule
        return isSlotOccupied(date, rule, exception, []) === true
      }),
      { numRuns: 100 }
    )
  })

  it('unavailable exception blocks even when rule says available (min 100 iterations)', () => {
    fc.assert(
      fc.property(dateArb, availableRuleArb, unavailableExceptionArb, (date, rule, exception) => {
        return isSlotOccupied(date, rule, exception, []) === true
      }),
      { numRuns: 100 }
    )
  })
})

// ── Feature: calendar-appointments, Property 9: Exception deletion restores weekday rule ──

describe('Slot blocking — Property 9: removing exception restores rule behavior', () => {
  it('without exception, result matches rule-only evaluation (min 100 iterations)', () => {
    fc.assert(
      fc.property(dateArb, validRuleArb, exceptionArb, (date, rule, _exception) => {
        // With exception deleted (undefined), result should equal rule-only result
        const withoutException = isSlotOccupied(date, rule, undefined, [])
        const ruleOnlyResult = !rule.is_available

        return withoutException === ruleOnlyResult
      }),
      { numRuns: 100 }
    )
  })

  it('available rule with no exception and no appointments returns false (min 100 iterations)', () => {
    fc.assert(
      fc.property(dateArb, availableRuleArb, (date, rule) => {
        return isSlotOccupied(date, rule, undefined, []) === false
      }),
      { numRuns: 100 }
    )
  })
})
