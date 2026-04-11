// Feature: calendar-appointments
// Tests for lib/prompts/real-estate.ts — buildAvailabilityContext

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { buildAvailabilityContext } from '@/lib/prompts/real-estate'

// ── 12.3 Unit tests ───────────────────────────────────────────────────────────

describe('buildAvailabilityContext — unit tests', () => {
  it('free slot: output contains AVAILABLE and the requested datetime', () => {
    const result = buildAvailabilityContext({
      requestedDateTime: 'Monday 15 March at 10:00',
      isFree: true,
      alternatives: [],
    })
    expect(result).toContain('AVAILABLE')
    expect(result).toContain('Monday 15 March at 10:00')
  })

  it('free slot: output does not mention alternatives or OCCUPIED', () => {
    const result = buildAvailabilityContext({
      requestedDateTime: 'Tuesday 16 March at 14:00',
      isFree: true,
      alternatives: [{ date: '2025-03-17', startTime: '09:00', endTime: '17:00' }],
    })
    expect(result).not.toContain('OCCUPIED')
    expect(result).not.toContain('Alternative')
  })

  it('conflicted with 3 alternatives: output contains OCCUPIED and all 3 slots', () => {
    const alternatives = [
      { date: '2025-03-17', startTime: '09:00', endTime: '17:00' },
      { date: '2025-03-18', startTime: '10:00', endTime: '16:00' },
      { date: '2025-03-19', startTime: '08:00', endTime: '12:00' },
    ]
    const result = buildAvailabilityContext({
      requestedDateTime: 'Monday 15 March at 10:00',
      isFree: false,
      alternatives,
    })
    expect(result).toContain('OCCUPIED')
    expect(result).toContain('2025-03-17')
    expect(result).toContain('2025-03-18')
    expect(result).toContain('2025-03-19')
    expect(result).toContain('09:00')
    expect(result).toContain('10:00')
    expect(result).toContain('08:00')
  })

  it('conflicted with 0 alternatives: output contains OCCUPIED and follow-up message', () => {
    const result = buildAvailabilityContext({
      requestedDateTime: 'Friday 20 March at 15:00',
      isFree: false,
      alternatives: [],
    })
    expect(result).toContain('OCCUPIED')
    expect(result).toContain('No free slots')
  })

  it('conflicted with more than 3 alternatives: only first 3 are included', () => {
    const alternatives = [
      { date: '2025-03-17', startTime: '09:00', endTime: '17:00' },
      { date: '2025-03-18', startTime: '10:00', endTime: '16:00' },
      { date: '2025-03-19', startTime: '08:00', endTime: '12:00' },
      { date: '2025-03-20', startTime: '11:00', endTime: '15:00' },
      { date: '2025-03-21', startTime: '13:00', endTime: '18:00' },
    ]
    const result = buildAvailabilityContext({
      requestedDateTime: 'Monday 15 March at 10:00',
      isFree: false,
      alternatives,
    })
    expect(result).toContain('2025-03-17')
    expect(result).toContain('2025-03-18')
    expect(result).toContain('2025-03-19')
    expect(result).not.toContain('2025-03-20')
    expect(result).not.toContain('2025-03-21')
  })

  it('conflicted with 1 alternative: output contains exactly that slot', () => {
    const result = buildAvailabilityContext({
      requestedDateTime: 'Wednesday 18 March at 09:00',
      isFree: false,
      alternatives: [{ date: '2025-03-19', startTime: '14:00', endTime: '18:00' }],
    })
    expect(result).toContain('OCCUPIED')
    expect(result).toContain('2025-03-19')
    expect(result).toContain('14:00')
    expect(result).toContain('18:00')
  })

  it('output always starts with AVAILABILITY CONTEXT header', () => {
    const freeResult = buildAvailabilityContext({
      requestedDateTime: 'any time',
      isFree: true,
      alternatives: [],
    })
    const occupiedResult = buildAvailabilityContext({
      requestedDateTime: 'any time',
      isFree: false,
      alternatives: [],
    })
    expect(freeResult).toContain('AVAILABILITY CONTEXT')
    expect(occupiedResult).toContain('AVAILABILITY CONTEXT')
  })
})

// ── 12.4 Property-based tests ─────────────────────────────────────────────────

// Arbitraries
const dateStrArb = fc.record({
  y: fc.constant(2025),
  m: fc.integer({ min: 1, max: 12 }),
  d: fc.integer({ min: 1, max: 28 }),
}).map(({ y, m, d }) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`)

const timeStrArb = fc.record({
  h: fc.integer({ min: 0, max: 23 }),
  m: fc.integer({ min: 0, max: 59 }),
}).map(({ h, m }) => `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)

const slotArb = fc.record({
  date: dateStrArb,
  startTime: timeStrArb,
  endTime: timeStrArb,
})

const requestedDateTimeArb = fc.string({ minLength: 1, maxLength: 50 })

// Feature: calendar-appointments, Property 10: Free slot context confirms availability
describe('buildAvailabilityContext — Property 10: free slot always indicates available', () => {
  it('for any free slot, output contains AVAILABLE and not OCCUPIED (min 100 iterations)', () => {
    fc.assert(
      fc.property(requestedDateTimeArb, (requestedDateTime) => {
        const result = buildAvailabilityContext({
          requestedDateTime,
          isFree: true,
          alternatives: [],
        })
        return result.includes('AVAILABLE') && !result.includes('OCCUPIED')
      }),
      { numRuns: 100 }
    )
  })

  it('for any free slot, output always contains the requested datetime string (min 100 iterations)', () => {
    fc.assert(
      fc.property(requestedDateTimeArb, (requestedDateTime) => {
        const result = buildAvailabilityContext({
          requestedDateTime,
          isFree: true,
          alternatives: [],
        })
        return result.includes(requestedDateTime)
      }),
      { numRuns: 100 }
    )
  })
})

// Feature: calendar-appointments, Property 11: Conflicted slot includes up to 3 alternatives
describe('buildAvailabilityContext — Property 11: conflicted slot includes min(N, 3) alternatives', () => {
  it('output contains OCCUPIED for any conflicted slot (min 100 iterations)', () => {
    fc.assert(
      fc.property(
        requestedDateTimeArb,
        fc.array(slotArb, { maxLength: 10 }),
        (requestedDateTime, alternatives) => {
          const result = buildAvailabilityContext({
            requestedDateTime,
            isFree: false,
            alternatives,
          })
          return result.includes('OCCUPIED')
        }
      ),
      { numRuns: 100 }
    )
  })

  it('output includes exactly min(N, 3) alternative slot dates (min 100 iterations)', () => {
    fc.assert(
      fc.property(
        requestedDateTimeArb,
        fc.array(slotArb, { maxLength: 10 }),
        (requestedDateTime, alternatives) => {
          const result = buildAvailabilityContext({
            requestedDateTime,
            isFree: false,
            alternatives,
          })
          const expectedCount = Math.min(alternatives.length, 3)
          const includedSlots = alternatives.slice(0, expectedCount)
          const excludedSlots = alternatives.slice(expectedCount)

          // All included slots' dates appear in output
          const allIncluded = includedSlots.every((s) => result.includes(s.date))
          // None of the excluded slots' dates appear (only if they have unique dates)
          const noneExcluded = excludedSlots
            .filter((s) => !includedSlots.some((inc) => inc.date === s.date))
            .every((s) => !result.includes(s.date))

          return allIncluded && noneExcluded
        }
      ),
      { numRuns: 100 }
    )
  })

  it('with 0 alternatives, output mentions follow-up (min 100 iterations)', () => {
    fc.assert(
      fc.property(requestedDateTimeArb, (requestedDateTime) => {
        const result = buildAvailabilityContext({
          requestedDateTime,
          isFree: false,
          alternatives: [],
        })
        return result.includes('No free slots') || result.includes('follow up')
      }),
      { numRuns: 100 }
    )
  })
})
