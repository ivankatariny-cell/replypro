// Feature: calendar-appointments
// Tests for lib/utils/datetime-detect.ts

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { containsDateOrTime } from '@/lib/utils/datetime-detect'

// ── 12.1 Unit tests ───────────────────────────────────────────────────────────

describe('containsDateOrTime — unit tests', () => {
  describe('Croatian date patterns', () => {
    it.each([
      ['sutra u 10 sati', 'sutra'],
      ['prekosutra dolazim', 'prekosutra'],
      ['idući tjedan imam termin', 'idući tjedan'],
      ['sljedeći tjedan', 'sljedeći tjedan'],
      ['u ponedjeljak', 'u ponedjeljak'],
      ['idući petak', 'idući petak'],
      ['15. ožujka', 'Croatian month name'],
      ['5 travnja u 10:00', 'Croatian month + time'],
      ['poslijepodne', 'poslijepodne'],
      ['ujutro', 'ujutro'],
      ['navečer', 'navečer'],
      ['podne', 'podne'],
      ['u 10 sati', 'u N sati'],
      ['u 3 sata', 'u N sata'],
      ['15.3.', 'numeric date DD.M.'],
      ['15.03.2025', 'numeric date DD.MM.YYYY'],
      ['10:00', 'time HH:MM'],
      ['Mogu li doći 15/03?', 'numeric date DD/MM'],
    ])('returns true for "%s" (%s)', (msg) => {
      expect(containsDateOrTime(msg)).toBe(true)
    })
  })

  describe('English date patterns', () => {
    it.each([
      ['Can we meet tomorrow?', 'tomorrow'],
      ['today works for me', 'today'],
      ['next week', 'next week'],
      ['this week', 'this week'],
      ['next Monday', 'next Monday'],
      ['on Friday', 'on Friday'],
      ['March 15', 'English month + day'],
      ['15th March', 'day + English month'],
      ['at 3pm', 'at Npm'],
      ['at 10:00', 'at HH:MM'],
      ['3pm works', 'Npm standalone'],
      ['10am', '10am'],
      ['at noon', 'at noon'],
      ['at midnight', 'at midnight'],
    ])('returns true for "%s" (%s)', (msg) => {
      expect(containsDateOrTime(msg)).toBe(true)
    })
  })

  describe('negative cases — no date/time', () => {
    it.each([
      ['Hello, I am interested in the apartment'],
      ['Can you send me more details?'],
      ['What is the price?'],
      ['Zanima me stan u centru'],
      ['Možete li mi poslati više informacija?'],
      ['Kolika je cijena?'],
      ['I would like to schedule a viewing'],
      ['Please contact me'],
      [''],
    ])('returns false for "%s"', (msg) => {
      expect(containsDateOrTime(msg)).toBe(false)
    })
  })
})

// ── 12.2 Property-based tests ─────────────────────────────────────────────────

// Feature: calendar-appointments, Property 12: Date/time detection — positive
describe('containsDateOrTime — Property 12: positive detection', () => {
  // Arbitraries that produce known date/time patterns
  const croatianDatePatternArb = fc.oneof(
    fc.constant('sutra'),
    fc.constant('prekosutra'),
    fc.constant('idući tjedan'),
    fc.constant('sljedeći tjedan'),
    fc.constant('u ponedjeljak'),
    fc.constant('u utorak'),
    fc.constant('u srijedu'),
    fc.constant('u četvrtak'),
    fc.constant('u petak'),
    fc.constant('u subotu'),
    fc.constant('u nedjelju'),
    fc.constant('idući ponedjeljak'),
    fc.constant('idući petak'),
    fc.constant('poslijepodne'),
    fc.constant('ujutro'),
    fc.constant('navečer'),
    fc.constant('podne'),
    fc.integer({ min: 1, max: 28 }).map((d) => `${d}. ožujka`),
    fc.integer({ min: 1, max: 28 }).map((d) => `${d} travnja`),
    fc.integer({ min: 1, max: 28 }).map((d) => `${d} svibnja`),
    fc.integer({ min: 1, max: 28 }).map((d) => `u ${d} sati`),
    fc.integer({ min: 1, max: 28 }).map((d) => `u ${d} sata`),
  )

  const englishDatePatternArb = fc.oneof(
    fc.constant('tomorrow'),
    fc.constant('today'),
    fc.constant('next week'),
    fc.constant('this week'),
    fc.constant('next Monday'),
    fc.constant('next Friday'),
    fc.constant('on Wednesday'),
    fc.constant('on Thursday'),
    fc.integer({ min: 1, max: 28 }).map((d) => `March ${d}`),
    fc.integer({ min: 1, max: 28 }).map((d) => `${d} March`),
    fc.integer({ min: 1, max: 12 }).map((h) => `at ${h}pm`),
    fc.integer({ min: 1, max: 12 }).map((h) => `at ${h}am`),
    fc.constant('at noon'),
    fc.constant('at midnight'),
  )

  const timePatternArb = fc.oneof(
    fc.record({
      h: fc.integer({ min: 0, max: 23 }),
      m: fc.integer({ min: 0, max: 59 }),
    }).map(({ h, m }) => `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`),
    fc.record({
      d: fc.integer({ min: 1, max: 28 }),
      mo: fc.integer({ min: 1, max: 12 }),
    }).map(({ d, mo }) => `${d}.${mo}.`),
  )

  const patternArb = fc.oneof(croatianDatePatternArb, englishDatePatternArb, timePatternArb)

  it('returns true for any message containing a known pattern (min 100 iterations)', () => {
    fc.assert(
      fc.property(
        patternArb,
        fc.string({ maxLength: 20 }),
        fc.string({ maxLength: 20 }),
        (pattern, prefix, suffix) => {
          const msg = `${prefix} ${pattern} ${suffix}`.trim()
          return containsDateOrTime(msg) === true
        }
      ),
      { numRuns: 100 }
    )
  })
})

// Feature: calendar-appointments, Property 13: Date/time detection — negative
describe('containsDateOrTime — Property 13: negative detection', () => {
  // Words that contain no date/time patterns
  const nonDateWords = [
    'hello', 'world', 'apartment', 'price', 'details', 'contact', 'please',
    'information', 'interested', 'viewing', 'location', 'floor', 'rooms',
    'stan', 'cijena', 'detalji', 'kontakt', 'informacije', 'lokacija',
    'kat', 'sobe', 'kupovina', 'prodaja', 'agencija', 'nekretnina',
    'beautiful', 'modern', 'spacious', 'available', 'listing',
    'lijepo', 'moderno', 'prostrano', 'dostupno', 'oglas',
  ]

  it('returns false for messages composed only of non-date words (min 100 iterations)', () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom(...nonDateWords), { minLength: 3, maxLength: 10 }),
        (words) => {
          const msg = words.join(' ')
          return containsDateOrTime(msg) === false
        }
      ),
      { numRuns: 100 }
    )
  })
})
