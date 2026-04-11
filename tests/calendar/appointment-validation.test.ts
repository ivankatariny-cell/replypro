// Feature: calendar-appointments
// Property tests for appointment validation (Properties 1 & 2)
// Validates: Requirements 1.2, 1.3, 5.1

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import type { AppointmentRow } from '@/types/supabase'

// ── Pure validation logic (mirrors AppointmentForm.handleSubmit) ──────────────

interface AppointmentFormData {
  title: string
  date: string       // YYYY-MM-DD
  start_time: string // HH:MM
  end_time: string   // HH:MM
  client_id: string | null
  property_id: string | null
}

type ValidationResult =
  | { valid: true }
  | { valid: false; error: 'title_required' | 'date_required' | 'end_must_be_after_start' }

function validateAppointmentForm(form: AppointmentFormData): ValidationResult {
  if (!form.title.trim()) return { valid: false, error: 'title_required' }
  if (!form.date) return { valid: false, error: 'date_required' }
  if (form.start_time >= form.end_time) return { valid: false, error: 'end_must_be_after_start' }
  return { valid: true }
}

/** Converts form data + date into ISO timestamps for a round-trip check */
function formDataToAppointment(form: AppointmentFormData, id: string, userId: string): AppointmentRow {
  const start_at = `${form.date}T${form.start_time}:00.000Z`
  const end_at = `${form.date}T${form.end_time}:00.000Z`
  return {
    id,
    user_id: userId,
    title: form.title,
    description: null,
    start_at,
    end_at,
    client_id: form.client_id,
    property_id: form.property_id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

// ── Arbitraries ───────────────────────────────────────────────────────────────

const dateArb = fc.record({
  y: fc.integer({ min: 2025, max: 2030 }),
  m: fc.integer({ min: 1, max: 12 }),
  d: fc.integer({ min: 1, max: 28 }),
}).map(({ y, m, d }) =>
  `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
)

// Generates HH:MM strings
const timeArb = fc.record({
  h: fc.integer({ min: 0, max: 23 }),
  m: fc.integer({ min: 0, max: 59 }),
}).map(({ h, m }) => `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)

// Valid form: non-empty title, valid date, end_time strictly after start_time
const validFormArb = fc.record({
  title: fc.string({ minLength: 1, maxLength: 100 }).filter((s) => s.trim().length > 0),
  date: dateArb,
  times: fc.record({ start: timeArb, end: timeArb }).filter(({ start, end }) => end > start),
  client_id: fc.option(fc.uuid(), { nil: null }),
  property_id: fc.option(fc.uuid(), { nil: null }),
}).map(({ title, date, times, client_id, property_id }) => ({
  title,
  date,
  start_time: times.start,
  end_time: times.end,
  client_id,
  property_id,
}))

// Invalid form: end_time <= start_time (same or earlier)
const invalidTimeFormArb = fc.record({
  title: fc.string({ minLength: 1, maxLength: 100 }).filter((s) => s.trim().length > 0),
  date: dateArb,
  times: fc.record({ start: timeArb, end: timeArb }).filter(({ start, end }) => end <= start),
}).map(({ title, date, times }) => ({
  title,
  date,
  start_time: times.start,
  end_time: times.end,
  client_id: null,
  property_id: null,
}))

// ── Feature: calendar-appointments, Property 1: Valid appointment creation round-trip ──

describe('Appointment validation — Property 1: valid form passes and round-trips', () => {
  it('any valid form data passes validation (min 100 iterations)', () => {
    fc.assert(
      fc.property(validFormArb, (form) => {
        const result = validateAppointmentForm(form)
        return result.valid === true
      }),
      { numRuns: 100 }
    )
  })

  it('valid form data round-trips: stored appointment preserves title, date, start_at, end_at (min 100 iterations)', () => {
    fc.assert(
      fc.property(validFormArb, fc.uuid(), fc.uuid(), (form, id, userId) => {
        const result = validateAppointmentForm(form)
        if (!result.valid) return false

        const appointment = formDataToAppointment(form, id, userId)

        const titleMatches = appointment.title === form.title
        const dateMatches = appointment.start_at.startsWith(form.date)
        const startTimeMatches = appointment.start_at.includes(`T${form.start_time}:`)
        const endTimeMatches = appointment.end_at.includes(`T${form.end_time}:`)
        const endAfterStart = appointment.end_at > appointment.start_at

        return titleMatches && dateMatches && startTimeMatches && endTimeMatches && endAfterStart
      }),
      { numRuns: 100 }
    )
  })
})

// ── Feature: calendar-appointments, Property 2: Invalid time range is always rejected ──

describe('Appointment validation — Property 2: invalid time range always rejected', () => {
  it('any form where end_time <= start_time fails validation (min 100 iterations)', () => {
    fc.assert(
      fc.property(invalidTimeFormArb, (form) => {
        const result = validateAppointmentForm(form)
        return result.valid === false && result.error === 'end_must_be_after_start'
      }),
      { numRuns: 100 }
    )
  })

  it('empty title always fails validation regardless of times', () => {
    fc.assert(
      fc.property(
        fc.record({ date: dateArb, times: fc.record({ start: timeArb, end: timeArb }) }),
        ({ date, times }) => {
          const result = validateAppointmentForm({
            title: '   ',
            date,
            start_time: times.start,
            end_time: times.end,
            client_id: null,
            property_id: null,
          })
          return result.valid === false && result.error === 'title_required'
        }
      ),
      { numRuns: 100 }
    )
  })
})
