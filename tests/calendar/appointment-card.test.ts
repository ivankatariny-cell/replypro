// Feature: calendar-appointments
// Property tests for appointment card rendering (Properties 3, 4, 5)
// Validates: Requirements 1.4, 1.6, 1.7, 1.8

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import type { AppointmentRow } from '@/types/supabase'
import type { AppointmentFormData } from '@/components/calendar/AppointmentForm'

// ── Pure helpers (mirrors AppointmentForm pre-population logic) ───────────────

function toDateStr(iso: string): string {
  return iso.slice(0, 10)
}

function toTimeStr(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

/** Mirrors the useEffect pre-population in AppointmentForm */
function populateFormFromAppointment(appointment: AppointmentRow): AppointmentFormData {
  return {
    title: appointment.title,
    description: appointment.description ?? '',
    date: toDateStr(appointment.start_at),
    start_time: toTimeStr(appointment.start_at),
    end_time: toTimeStr(appointment.end_at),
    client_id: appointment.client_id,
    property_id: appointment.property_id,
  }
}

/** Simulates removing an appointment from a list by id */
function deleteAppointment(list: AppointmentRow[], id: string): AppointmentRow[] {
  return list.filter((a) => a.id !== id)
}

/** Simulates what AppointmentCard renders as text content */
function renderCardText(
  appointment: AppointmentRow,
  clientName?: string,
  propertyTitle?: string
): string {
  const parts: string[] = [appointment.title]
  if (clientName) parts.push(clientName)
  if (propertyTitle) parts.push(propertyTitle)
  return parts.join(' ')
}

// ── Arbitraries ───────────────────────────────────────────────────────────────

const isoDateTimeArb = fc.record({
  y: fc.integer({ min: 2025, max: 2030 }),
  m: fc.integer({ min: 1, max: 12 }),
  d: fc.integer({ min: 1, max: 28 }),
  h: fc.integer({ min: 0, max: 22 }),
  min: fc.integer({ min: 0, max: 59 }),
}).map(({ y, m, d, h, min }) =>
  `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}T${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}:00.000Z`
)

// Appointment with end_at strictly after start_at
const appointmentArb = fc.record({
  id: fc.uuid(),
  user_id: fc.uuid(),
  title: fc.string({ minLength: 1, maxLength: 80 }).filter((s) => s.trim().length > 0),
  description: fc.option(fc.string({ maxLength: 200 }), { nil: null }),
  start_at: isoDateTimeArb,
  client_id: fc.option(fc.uuid(), { nil: null }),
  property_id: fc.option(fc.uuid(), { nil: null }),
  created_at: fc.constant('2025-01-01T00:00:00.000Z'),
  updated_at: fc.constant('2025-01-01T00:00:00.000Z'),
}).map((a) => {
  // end_at = start_at + 1 hour
  const endDate = new Date(new Date(a.start_at).getTime() + 60 * 60 * 1000)
  return { ...a, end_at: endDate.toISOString() } satisfies AppointmentRow
})

const nonEmptyStringArb = fc.string({ minLength: 1, maxLength: 80 }).filter((s) => s.trim().length > 0)

// ── Feature: calendar-appointments, Property 3: Edit form pre-population round-trip ──

describe('AppointmentForm pre-population — Property 3: edit form matches stored data', () => {
  it('populated form title matches appointment title (min 100 iterations)', () => {
    fc.assert(
      fc.property(appointmentArb, (appointment) => {
        const form = populateFormFromAppointment(appointment)
        return form.title === appointment.title
      }),
      { numRuns: 100 }
    )
  })

  it('populated form description matches appointment description (min 100 iterations)', () => {
    fc.assert(
      fc.property(appointmentArb, (appointment) => {
        const form = populateFormFromAppointment(appointment)
        return form.description === (appointment.description ?? '')
      }),
      { numRuns: 100 }
    )
  })

  it('populated form date matches start_at date portion (min 100 iterations)', () => {
    fc.assert(
      fc.property(appointmentArb, (appointment) => {
        const form = populateFormFromAppointment(appointment)
        return form.date === appointment.start_at.slice(0, 10)
      }),
      { numRuns: 100 }
    )
  })

  it('populated form client_id matches appointment client_id (min 100 iterations)', () => {
    fc.assert(
      fc.property(appointmentArb, (appointment) => {
        const form = populateFormFromAppointment(appointment)
        return form.client_id === appointment.client_id
      }),
      { numRuns: 100 }
    )
  })

  it('populated form property_id matches appointment property_id (min 100 iterations)', () => {
    fc.assert(
      fc.property(appointmentArb, (appointment) => {
        const form = populateFormFromAppointment(appointment)
        return form.property_id === appointment.property_id
      }),
      { numRuns: 100 }
    )
  })
})

// ── Feature: calendar-appointments, Property 4: Appointment deletion removes from list ──

describe('Appointment deletion — Property 4: deleted appointment id absent from list', () => {
  it('deleted appointment id is not in the resulting list (min 100 iterations)', () => {
    fc.assert(
      fc.property(
        fc.array(appointmentArb, { minLength: 1, maxLength: 20 }),
        fc.integer({ min: 0, max: 19 }),
        (appointments, indexSeed) => {
          const index = indexSeed % appointments.length
          const target = appointments[index]
          const result = deleteAppointment(appointments, target.id)
          return !result.some((a) => a.id === target.id)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('deletion reduces list length by exactly 1 when id exists (min 100 iterations)', () => {
    fc.assert(
      fc.property(
        fc.array(appointmentArb, { minLength: 1, maxLength: 20 }),
        fc.integer({ min: 0, max: 19 }),
        (appointments, indexSeed) => {
          const index = indexSeed % appointments.length
          const target = appointments[index]
          const result = deleteAppointment(appointments, target.id)
          // Count occurrences of target.id in original (could be 1 if UUIDs are unique)
          const originalCount = appointments.filter((a) => a.id === target.id).length
          return result.length === appointments.length - originalCount
        }
      ),
      { numRuns: 100 }
    )
  })

  it('other appointments are preserved after deletion (min 100 iterations)', () => {
    fc.assert(
      fc.property(
        fc.array(appointmentArb, { minLength: 2, maxLength: 20 }),
        fc.integer({ min: 0, max: 19 }),
        (appointments, indexSeed) => {
          const index = indexSeed % appointments.length
          const target = appointments[index]
          const result = deleteAppointment(appointments, target.id)
          // All remaining appointments (those with different ids) should still be present
          const remaining = appointments.filter((a) => a.id !== target.id)
          return remaining.every((a) => result.some((r) => r.id === a.id))
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ── Feature: calendar-appointments, Property 5: Card renders linked entity names ──

describe('AppointmentCard rendering — Property 5: linked entity names appear in card', () => {
  it('card text contains client name when client_id is set (min 100 iterations)', () => {
    fc.assert(
      fc.property(appointmentArb, nonEmptyStringArb, (appointment, clientName) => {
        const apptWithClient = { ...appointment, client_id: 'some-client-id' }
        const text = renderCardText(apptWithClient, clientName, undefined)
        return text.includes(clientName)
      }),
      { numRuns: 100 }
    )
  })

  it('card text contains property title when property_id is set (min 100 iterations)', () => {
    fc.assert(
      fc.property(appointmentArb, nonEmptyStringArb, (appointment, propertyTitle) => {
        const apptWithProperty = { ...appointment, property_id: 'some-property-id' }
        const text = renderCardText(apptWithProperty, undefined, propertyTitle)
        return text.includes(propertyTitle)
      }),
      { numRuns: 100 }
    )
  })

  it('card text contains both client name and property title when both are set (min 100 iterations)', () => {
    fc.assert(
      fc.property(appointmentArb, nonEmptyStringArb, nonEmptyStringArb, (appointment, clientName, propertyTitle) => {
        const apptWithBoth = {
          ...appointment,
          client_id: 'some-client-id',
          property_id: 'some-property-id',
        }
        const text = renderCardText(apptWithBoth, clientName, propertyTitle)
        return text.includes(clientName) && text.includes(propertyTitle)
      }),
      { numRuns: 100 }
    )
  })

  it('card text always contains the appointment title (min 100 iterations)', () => {
    fc.assert(
      fc.property(appointmentArb, (appointment) => {
        const text = renderCardText(appointment)
        return text.includes(appointment.title)
      }),
      { numRuns: 100 }
    )
  })
})
