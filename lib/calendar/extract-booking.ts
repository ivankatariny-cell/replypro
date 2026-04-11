/**
 * Pure utility — extracts a suggested booking from a client message.
 * Language-aware: Croatian messages get Croatian titles and date labels.
 * No side effects, no server-only imports.
 */

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
  // Serbian/Bosnian
  ponedeljak: 1, pondjeljak: 1, ponedljak: 1,
  sredu: 3, sreda: 3,
  nedelju: 0, nedelu: 0, nedelja: 0,
}

const ENGLISH_WEEKDAYS: Record<string, number> = {
  monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6, sunday: 0,
}

function pad(n: number) { return String(n).padStart(2, '0') }

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function nextWeekday(from: Date, targetDow: number, forceNext: boolean): Date {
  const d = new Date(from)
  const currentDow = d.getDay()
  let diff = targetDow - currentDow
  if (diff <= 0 || forceNext) diff += 7
  d.setDate(d.getDate() + diff)
  return d
}

function extractDateStr(message: string): string | null {
  const lower = message.toLowerCase()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (/\bsutra\b/i.test(message) || /\btomorrow\b/i.test(message)) {
    const d = new Date(today); d.setDate(d.getDate() + 1); return toDateStr(d)
  }
  if (/\bprekosutra\b/i.test(message)) {
    const d = new Date(today); d.setDate(d.getDate() + 2); return toDateStr(d)
  }
  if (/\btoday\b/i.test(message) || /\bdanas\b/i.test(message)) {
    return toDateStr(today)
  }

  const crMonth = lower.match(/(\d{1,2})\.?\s*(siječnja|veljače|ožujka|travnja|svibnja|lipnja|srpnja|kolovoza|rujna|listopada|studenog|prosinca)/i)
  if (crMonth) {
    const day = parseInt(crMonth[1], 10)
    const month = CROATIAN_MONTHS[crMonth[2].toLowerCase()]
    const d = new Date(today.getFullYear(), month, day)
    if (d < today) d.setFullYear(d.getFullYear() + 1)
    return toDateStr(d)
  }

  const enMonth = lower.match(/(?:(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})(?:st|nd|rd|th)?|(\d{1,2})(?:st|nd|rd|th)?\s+(january|february|march|april|may|june|july|august|september|october|november|december))/i)
  if (enMonth) {
    const monthName = (enMonth[1] || enMonth[4]).toLowerCase()
    const day = parseInt(enMonth[2] || enMonth[3], 10)
    const d = new Date(today.getFullYear(), ENGLISH_MONTHS[monthName], day)
    if (d < today) d.setFullYear(d.getFullYear() + 1)
    return toDateStr(d)
  }

  const numeric = message.match(/(\d{1,2})[./](\d{1,2})(?:[./](\d{2,4}))?/)
  if (numeric) {
    const day = parseInt(numeric[1], 10)
    const month = parseInt(numeric[2], 10) - 1
    const yearRaw = numeric[3]
    let year = today.getFullYear()
    if (yearRaw) year = yearRaw.length === 2 ? 2000 + parseInt(yearRaw, 10) : parseInt(yearRaw, 10)
    const d = new Date(year, month, day)
    if (!yearRaw && d < today) d.setFullYear(d.getFullYear() + 1)
    return toDateStr(d)
  }

  // Croatian/Bosnian/Serbian weekday
  const crWeekday = lower.match(/(?:idući|sljede[cć]i|ovaj|u|sad\s+ovaj|ovaj\s+sad)\s+(pon[eo]d[ej]?[lj]?jak?|utorak|srijedu?|sredu?|[cč]etvrtak|petak|subotu?|nedjelju?|nedelju?)/i)
  if (crWeekday) {
    const raw = crWeekday[1].toLowerCase()
    const targetDow = CROATIAN_WEEKDAYS[raw]
      ?? CROATIAN_WEEKDAYS[raw.replace('č', 'c').replace('ć', 'c')]
    if (targetDow !== undefined) {
      const d = nextWeekday(today, targetDow, /idući|sljede/i.test(lower))
      return toDateStr(d)
    }
  }

  // English weekday
  const enWeekday = lower.match(/(?:next|this|last|on)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i)
  if (enWeekday) {
    const targetDow = ENGLISH_WEEKDAYS[enWeekday[1].toLowerCase()]
    const d = nextWeekday(today, targetDow, /next/i.test(enWeekday[0]))
    return toDateStr(d)
  }

  return null
}

function extractTimeStr(message: string): string | null {
  // "u 10 sati", "u 21:00 sati" — check this FIRST before generic HH:MM to avoid false positives
  const hrTime = message.match(/\bu\s+(\d{1,2})(?::(\d{2}))?\s+sat[ia]\b/i)
  if (hrTime) {
    const h = parseInt(hrTime[1], 10)
    const m = hrTime[2] ? parseInt(hrTime[2], 10) : 0
    if (h >= 0 && h <= 23) return `${pad(h)}:${pad(m)}`
  }

  // HH:MM or HH.MM
  const colonTime = message.match(/\b(\d{1,2})[.:](\d{2})\b/)
  if (colonTime) {
    const h = parseInt(colonTime[1], 10)
    const m = parseInt(colonTime[2], 10)
    if (h >= 0 && h <= 23 && m >= 0 && m <= 59) return `${pad(h)}:${pad(m)}`
  }

  // "at 3pm", "3pm", "10am"
  const ampm = message.match(/\b(?:at\s+)?(\d{1,2})(?::\d{2})?\s*(am|pm)\b/i)
  if (ampm) {
    let h = parseInt(ampm[1], 10)
    const isPm = ampm[2].toLowerCase() === 'pm'
    if (isPm && h !== 12) h += 12
    if (!isPm && h === 12) h = 0
    return `${pad(h)}:00`
  }

  if (/\bat\s+noon\b/i.test(message)) return '12:00'
  if (/\bat\s+midnight\b/i.test(message)) return '00:00'

  return null
}

export interface SuggestedBooking {
  date: string        // YYYY-MM-DD
  startTime: string   // HH:MM
  endTime: string     // HH:MM
  label: string       // human-readable date+time
  suggestedTitle: string
  language: 'hr' | 'en'
}

/**
 * Extracts a suggested booking from a client message.
 * Returns null if no date reference is found.
 */
export function extractBooking(
  message: string,
  clientName?: string | null,
  propertyTitle?: string | null,
  language: 'hr' | 'en' = 'en'
): SuggestedBooking | null {
  const dateStr = extractDateStr(message)
  if (!dateStr) return null

  const timeStr = extractTimeStr(message) ?? '10:00'
  const [h, m] = timeStr.split(':').map(Number)
  const endH = h + 1 > 23 ? 23 : h + 1
  const endTime = `${pad(endH)}:${pad(m)}`

  const date = new Date(`${dateStr}T${timeStr}:00`)

  // Language-aware date label
  const locale = language === 'hr' ? 'hr-HR' : 'en-GB'
  const dateLabel = date.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })
  const timeLabel = language === 'hr' ? `u ${timeStr}` : `at ${timeStr}`
  const label = `${dateLabel} ${timeLabel}`

  // Language-aware title — most specific wins
  let suggestedTitle: string
  if (language === 'hr') {
    if (propertyTitle && clientName) suggestedTitle = `Razgledavanje — ${clientName}`
    else if (propertyTitle) suggestedTitle = `Razgledavanje nekretnine`
    else if (clientName) suggestedTitle = `Sastanak — ${clientName}`
    else suggestedTitle = 'Sastanak s klijentom'
  } else {
    if (propertyTitle && clientName) suggestedTitle = `Viewing — ${clientName}`
    else if (propertyTitle) suggestedTitle = 'Property viewing'
    else if (clientName) suggestedTitle = `Meeting — ${clientName}`
    else suggestedTitle = 'Client meeting'
  }

  return { date: dateStr, startTime: timeStr, endTime, label, suggestedTitle, language }
}
