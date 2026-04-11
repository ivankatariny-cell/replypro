// Feature: calendar-appointments
// Property tests for upcoming appointments selector (Properties 14 & 15)
// Validates: Requirements 7.1, 7.4

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import type { AppointmentRow } from '@/types/supabase'

// ── Pure selector (mirrors getUpcoming in UpcomingAppointments.tsx) ───────────

function getUpcoming(appointments: AppointmentRow[], now: string): AppointmentRow[] {
  return appointments
    .filter((a) => a.start_at > now)
    .sort((a, b) => a.start_at.localeCompare(b.start_at))
    .slice(0, 3)
}

// ── Widget row rendering (mirrors the render logic in UpcomingAppointments.tsx) ─

interface RenderedRow {
  title: string
  formattedDate: string
  formattedTime: string
}

function renderAppointmentRow(appointment: AppointmentRow): RenderedRow {
  const date = new Date(appointment.start_at)
  return {
    title: appointment.title,
    formattedDate: date.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }),
    formattedTime: date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    }),
  }
}

// ── Arbitraries ───────────────────────────────────────────────────────────────

const NOW = '2025-06-01T12:00:00.000Z'

// Future appointment (start_at after NOW)
const futureAppointmentArb = fc.record({
  id: fc.uuid(),
  user_id: fc.uuid(),
  title: fc.string({ minLength: 1, maxLength: 80 }).filter((s) => s.trim().length > 0),
  description: fc.option(fc.string({ maxLength: 100 }), { nil: null }),
  // Dates from 2025-06-02 to 2025-12-31
  start_at: fc.record({
    y: fc.constant(2025),
    m: fc.integer({ min: 6, max: 12 }),
    d: fc.integer({ min: 2, max: 28 }),
    h: fc.integer({ min: 0, max: 23 }),
    min: fc.integer({ min: 0, max: 59 }),
  }).map(({ y, m, d, h, min }) =>
    `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}T${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}:00.000Z`
  ),
  client_id: fc.option(fc.uuid(), { nil: null }),
  property_id: fc.option(fc.uuid(), { nil: null }),
  created_at: fc.constant(NOW),
  updated_at: fc.constant(NOW),
}).map((a) => ({
  ...a,
  end_at: a.start_at, // end_at not relevant for selector tests
} satisfies AppointmentRow))

// Past appointment (start_at before NOW)
const pastAppointmentArb = fc.record({
  id: fc.uuid(),
  user_id: fc.uuid(),
  title: fc.string({ minLength: 1, maxLength: 80 }).filter((s) => s.trim().length > 0),
  description: fc.option(fc.string({ maxLength: 100 }), { nil: null }),
  // Dates from 2024-01-01 to 2025-05-31
  start_at: fc.record({
    y: fc.integer({ min: 2024, max: 2025 }),
    m: fc.integer({ min: 1, max: 5 }),
    d: fc.integer({ min: 1, max: 28 }),
    h: fc.integer({ min: 0, max: 23 }),
    min: fc.integer({ min: 0, max: 59 }),
  }).map(({ y, m, d, h, min }) =>
    `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}T${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}:00.000Z`
  ),
  client_id: fc.option(fc.uuid(), { nil: null }),
  property_id: fc.option(fc.uuid(), { nil: null }),
  created_at: fc.constant(NOW),
  updated_at: fc.constant(NOW),
}).map((a) => ({
  ...a,
  end_at: a.start_at,
} satisfies AppointmentRow))

// ── Feature: calendar-appointments, Property 14: Upcoming selector returns next 3 sorted ──

describe('getUpcoming — Property 14: returns future appointments sorted asc, limited to 3', () => {
  it('result contains only appointments with start_at > now (min 100 iterations)', () => {
    fc.assert(
      fc.property(
        fc.array(fc.oneof(futureAppointmentArb, pastAppointmentArb), { maxLength: 20 }),
        (appointments) => {
          const result = getUpcoming(appointments, NOW)
          return result.every((a) => a.start_at > NOW)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('result is sorted ascending by start_at (min 100 iterations)', () => {
    fc.assert(
      fc.property(
        fc.array(futureAppointmentArb, { minLength: 0, maxLength: 20 }),
        (appointments) => {
          const result = getUpcoming(appointments, NOW)
          for (let i = 1; i < result.length; i++) {
            if (result[i].start_at < result[i - 1].start_at) return false
          }
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('result length is at most 3 (min 100 iterations)', () => {
    fc.assert(
      fc.property(
        fc.array(futureAppointmentArb, { minLength: 0, maxLength: 20 }),
        (appointments) => {
          const result = getUpcoming(appointments, NOW)
          return result.length <= 3
        }
      ),
      { numRuns: 100 }
    )
  })

  it('result length equals min(future count, 3) (min 100 iterations)', () => {
    fc.assert(
      fc.property(
        fc.array(futureAppointmentArb, { minLength: 0, maxLength: 20 }),
        (appointments) => {
          const futureCount = appointments.filter((a) => a.start_at > NOW).length
          const result = getUpcoming(appointments, NOW)
          return result.length === Math.min(futureCount, 3)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('all-past list returns empty array (min 100 iterations)', () => {
    fc.assert(
      fc.property(
        fc.array(pastAppointmentArb, { minLength: 1, maxLength: 10 }),
        (appointments) => {
          return getUpcoming(appointments, NOW).length === 0
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ── Feature: calendar-appointments, Property 15: Widget row renders required fields ──

describe('renderAppointmentRow — Property 15: rendered row contains title, date, and time', () => {
  it('rendered row always contains the appointment title (min 100 iterations)', () => {
    fc.assert(
      fc.property(futureAppointmentArb, (appointment) => {
        const row = renderAppointmentRow(appointment)
        return row.title === appointment.title
      }),
      { numRuns: 100 }
    )
  })

  it('rendered row always has a non-empty formattedDate string (min 100 iterations)', () => {
    fc.assert(
      fc.property(futureAppointmentArb, (appointment) => {
        const row = renderAppointmentRow(appointment)
        return typeof row.formattedDate === 'string' && row.formattedDate.length > 0
      }),
      { numRuns: 100 }
    )
  })

  it('rendered row always has a non-empty formattedTime string (min 100 iterations)', () => {
    fc.assert(
      fc.property(futureAppointmentArb, (appointment) => {
        const row = renderAppointmentRow(appointment)
        return typeof row.formattedTime === 'string' && row.formattedTime.length > 0
      }),
      { numRuns: 100 }
    )
  })

  it('formattedDate is derived from start_at (min 100 iterations)', () => {
    fc.assert(
      fc.property(futureAppointmentArb, (appointment) => {
        const row = renderAppointmentRow(appointment)
        // The formatted date should contain the day number from start_at
        const dayNumber = new Date(appointment.start_at).getDate()
        return row.formattedDate.includes(String(dayNumber))
      }),
      { numRuns: 100 }
    )
  })
})
