import { buildAvailabilityContext } from '@/lib/prompts/real-estate'
import type { Database } from '@/types/supabase'

type AppointmentRow = Database['public']['Tables']['rp_appointments']['Row']
type AvailabilityRuleRow = Database['public']['Tables']['rp_availability_rules']['Row']
type AvailabilityExceptionRow = Database['public']['Tables']['rp_availability_exceptions']['Row']

// ── Date extraction ───────────────────────────────────────────────────────────

const CROATIAN_MONTHS: Record<string, number> = {
  siječnja: 0, veljače: 1, ožujka: 2, travnja: 3, svibnja: 4, lipnja: 5,
  srpnja: 6, kolovoza: 7, rujna: 8, listopada: 9, studenog: 10, prosinca: 11,
}

const ENGLISH_MONTHS: Record<string, number> = {
  january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
  july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
}

const CROATIAN_WEEKDAYS: Record<string, number> = {
  ponedjeljak: 1, utorak: 2, srijedu: 3, srijeda: 3,
  četvrtak: 4, cetvrtak: 4, petak: 5, subotu: 6, subota: 6, nedjelju: 0, nedjelja: 0,
}

const ENGLISH_WEEKDAYS: Record<string, number> = {
  monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6, sunday: 0,
}

/**
 * Best-effort date extraction from a message string.
 * Returns a Date object and a human-readable label.
 * Falls back to today if no date can be extracted.
 */
function extractDate(message: string): { date: Date; label: string } {
  const lower = message.toLowerCase()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // "sutra" / "tomorrow"
  if (/\bsutra\b/i.test(message) || /\btomorrow\b/i.test(message)) {
    const d = new Date(today)
    d.setDate(d.getDate() + 1)
    return { date: d, label: d.toLocaleDateString('hr-HR', { weekday: 'long', day: 'numeric', month: 'long' }) }
  }

  // "prekosutra"
  if (/\bprekosutra\b/i.test(message)) {
    const d = new Date(today)
    d.setDate(d.getDate() + 2)
    return { date: d, label: d.toLocaleDateString('hr-HR', { weekday: 'long', day: 'numeric', month: 'long' }) }
  }

  // "today" / "danas"
  if (/\btoday\b/i.test(message) || /\bdanas\b/i.test(message)) {
    return { date: today, label: today.toLocaleDateString('hr-HR', { weekday: 'long', day: 'numeric', month: 'long' }) }
  }

  // Croatian month name: "15. ožujka", "5 travnja"
  const croatianMonthMatch = lower.match(
    /(\d{1,2})\.?\s*(siječnja|veljače|ožujka|travnja|svibnja|lipnja|srpnja|kolovoza|rujna|listopada|studenog|prosinca)/i
  )
  if (croatianMonthMatch) {
    const day = parseInt(croatianMonthMatch[1], 10)
    const month = CROATIAN_MONTHS[croatianMonthMatch[2].toLowerCase()]
    const d = new Date(today.getFullYear(), month, day)
    if (d < today) d.setFullYear(d.getFullYear() + 1)
    return { date: d, label: d.toLocaleDateString('hr-HR', { weekday: 'long', day: 'numeric', month: 'long' }) }
  }

  // English month name: "March 15", "15 March", "March 15th"
  const englishMonthMatch = lower.match(
    /(?:(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})(?:st|nd|rd|th)?|(\d{1,2})(?:st|nd|rd|th)?\s+(january|february|march|april|may|june|july|august|september|october|november|december))/i
  )
  if (englishMonthMatch) {
    const monthName = (englishMonthMatch[1] || englishMonthMatch[4]).toLowerCase()
    const day = parseInt(englishMonthMatch[2] || englishMonthMatch[3], 10)
    const month = ENGLISH_MONTHS[monthName]
    const d = new Date(today.getFullYear(), month, day)
    if (d < today) d.setFullYear(d.getFullYear() + 1)
    return { date: d, label: d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }) }
  }

  // Numeric date: DD.MM. or DD/MM/YYYY or DD.MM.YYYY
  const numericDateMatch = message.match(/(\d{1,2})[./](\d{1,2})(?:[./](\d{2,4}))?/)
  if (numericDateMatch) {
    const day = parseInt(numericDateMatch[1], 10)
    const month = parseInt(numericDateMatch[2], 10) - 1
    const yearRaw = numericDateMatch[3]
    let year = today.getFullYear()
    if (yearRaw) {
      year = yearRaw.length === 2 ? 2000 + parseInt(yearRaw, 10) : parseInt(yearRaw, 10)
    }
    const d = new Date(year, month, day)
    if (!yearRaw && d < today) d.setFullYear(d.getFullYear() + 1)
    return { date: d, label: d.toLocaleDateString('hr-HR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) }
  }

  // Croatian weekday: "u ponedjeljak", "idući petak", "sljedeći utorak"
  const croatianWeekdayMatch = lower.match(
    /(?:idući|sljede[cć]i|ovaj|u)\s+(ponedjeljak|utorak|srijedu?|[cč]etvrtak|petak|subotu?|nedjelju?)/i
  )
  if (croatianWeekdayMatch) {
    const rawDay = croatianWeekdayMatch[1].toLowerCase().replace('č', 'c').replace('ć', 'c')
    const targetDow = CROATIAN_WEEKDAYS[croatianWeekdayMatch[1].toLowerCase()] ??
      CROATIAN_WEEKDAYS[rawDay]
    if (targetDow !== undefined) {
      const d = nextWeekday(today, targetDow, /idući|sljede/i.test(lower))
      return { date: d, label: d.toLocaleDateString('hr-HR', { weekday: 'long', day: 'numeric', month: 'long' }) }
    }
  }

  // English weekday: "next Monday", "on Friday", "this Wednesday"
  const englishWeekdayMatch = lower.match(
    /(?:next|this|last|on)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i
  )
  if (englishWeekdayMatch) {
    const targetDow = ENGLISH_WEEKDAYS[englishWeekdayMatch[1].toLowerCase()]
    const forceNext = /next/i.test(englishWeekdayMatch[0])
    const d = nextWeekday(today, targetDow, forceNext)
    return { date: d, label: d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }) }
  }

  // Fallback: today
  return { date: today, label: today.toLocaleDateString('hr-HR', { weekday: 'long', day: 'numeric', month: 'long' }) }
}

/** Returns the next occurrence of a given day-of-week (0=Sun…6=Sat). */
function nextWeekday(from: Date, targetDow: number, forceNext: boolean): Date {
  const d = new Date(from)
  const currentDow = d.getDay()
  let diff = targetDow - currentDow
  if (diff <= 0 || forceNext) diff += 7
  d.setDate(d.getDate() + diff)
  return d
}

// ── Slot availability logic ───────────────────────────────────────────────────

function toDateString(d: Date): string {
  return d.toISOString().slice(0, 10) // "YYYY-MM-DD"
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function isSlotOccupied(
  date: Date,
  rule: AvailabilityRuleRow | undefined,
  exception: AvailabilityExceptionRow | undefined,
  appointments: AppointmentRow[]
): boolean {
  // Exception with is_available=false blocks the day
  if (exception && !exception.is_available) return true

  // No rule → treat as available (graceful degradation per design.md)
  if (!rule) return false

  // Rule says unavailable
  if (!rule.is_available) return true

  // Check if any appointment fills the entire available window
  const ruleStart = timeToMinutes(rule.start_time)
  const ruleEnd = timeToMinutes(rule.end_time)
  const dateStr = toDateString(date)

  const dayAppointments = appointments.filter(a => a.start_at.startsWith(dateStr))
  if (dayAppointments.length === 0) return false

  // Merge appointment intervals and check if they cover the full rule window
  const intervals = dayAppointments
    .map(a => ({
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

function findAlternativeSlots(
  weekStart: Date,
  rules: AvailabilityRuleRow[],
  exceptions: AvailabilityExceptionRow[],
  appointments: AppointmentRow[],
  excludeDate: Date
): Array<{ date: string; startTime: string; endTime: string }> {
  const alternatives: Array<{ date: string; startTime: string; endTime: string }> = []
  const excludeStr = toDateString(excludeDate)

  for (let i = 0; i < 7 && alternatives.length < 3; i++) {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    const dateStr = toDateString(d)

    if (dateStr === excludeStr) continue

    const dow = d.getDay() // 0=Sun…6=Sat
    const rule = rules.find(r => r.day_of_week === dow)
    const exception = exceptions.find(e => e.exception_date === dateStr)

    if (!rule || !rule.is_available) continue
    if (exception && !exception.is_available) continue

    // Check if the day has any appointments that fill the window
    if (isSlotOccupied(d, rule, exception, appointments)) continue

    alternatives.push({
      date: dateStr,
      startTime: rule.start_time.slice(0, 5),
      endTime: rule.end_time.slice(0, 5),
    })
  }

  return alternatives
}

// ── Public API ────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchAvailabilityContext(
  userId: string,
  message: string,
  // Accept any Supabase client variant (server, service role, etc.)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabaseClient: any
): Promise<string> {
  try {
    const { date: requestedDate, label: requestedLabel } = extractDate(message)
    const dateStr = toDateString(requestedDate)
    const dow = requestedDate.getDay()

    // Compute week boundaries (Mon–Sun of the requested date's week)
    const dayOfWeek = requestedDate.getDay() // 0=Sun
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    const weekStart = new Date(requestedDate)
    weekStart.setDate(requestedDate.getDate() + diffToMonday)
    weekStart.setHours(0, 0, 0, 0)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 7)

    const weekStartStr = toDateString(weekStart)
    const weekEndStr = toDateString(weekEnd)

    // Query all three tables in parallel
    const [appointmentsResult, rulesResult, exceptionsResult] = await Promise.all([
      supabaseClient
        .from('rp_appointments')
        .select('id, user_id, title, start_at, end_at, client_id, property_id')
        .eq('user_id', userId)
        .gte('start_at', weekStartStr)
        .lt('start_at', weekEndStr),

      supabaseClient
        .from('rp_availability_rules')
        .select('id, user_id, day_of_week, start_time, end_time, is_available')
        .eq('user_id', userId),

      supabaseClient
        .from('rp_availability_exceptions')
        .select('id, user_id, exception_date, is_available, reason')
        .eq('user_id', userId)
        .gte('exception_date', weekStartStr)
        .lt('exception_date', weekEndStr),
    ])

    if (appointmentsResult.error) throw appointmentsResult.error
    if (rulesResult.error) throw rulesResult.error
    if (exceptionsResult.error) throw exceptionsResult.error

    const appointments: AppointmentRow[] = appointmentsResult.data ?? []
    const rules: AvailabilityRuleRow[] = rulesResult.data ?? []
    const exceptions: AvailabilityExceptionRow[] = exceptionsResult.data ?? []

    const rule = rules.find((r: AvailabilityRuleRow) => r.day_of_week === dow)
    const exception = exceptions.find((e: AvailabilityExceptionRow) => e.exception_date === dateStr)

    const isFree = !isSlotOccupied(requestedDate, rule, exception, appointments)

    const alternatives = isFree
      ? []
      : findAlternativeSlots(weekStart, rules, exceptions, appointments, requestedDate)

    return buildAvailabilityContext({
      requestedDateTime: requestedLabel,
      isFree,
      alternatives,
    })
  } catch (err) {
    console.warn('[fetchAvailabilityContext] failed, skipping availability context:', err)
    return ''
  }
}
