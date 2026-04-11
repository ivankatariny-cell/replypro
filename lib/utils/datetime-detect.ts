/**
 * Pure utility function — no imports, no side effects.
 * Detects date or time references in Croatian and English messages.
 *
 * Validates: Requirements 6.1, 6.2, 6.3, 6.5
 */

const PATTERNS: RegExp[] = [
  // --- Numeric shared patterns ---
  // Time: 10:00, 3:30, 10.00
  /\b\d{1,2}[.:]\d{2}\b/,
  // Date: 15/03, 3/15, 15.3., 15.03.
  /\b\d{1,2}[./]\d{1,2}\.?\b/,

  // --- Croatian/Bosnian/Serbian date patterns ---
  // Relative days
  /\bsutra\b/i,
  /\bprekosutra\b/i,
  /\bju[cč]er\b/i,
  // Relative week
  /\bidući\s+tjedan\b/i,
  /\bsljede[cć]i\s+tjedan\b/i,
  /\bovaj\s+tjedan\b/i,
  // Weekday references — covers Croatian (ponedjeljak), Serbian/Bosnian (ponedeljak/pondjeljak)
  // and typo-tolerant variants (ponedljak, etc.)
  /\b(?:idući|sljede[cć]i|ovaj|u|sad\s+ovaj|ovaj\s+sad)\s+(?:pon[eo]d[ej]?[lj]?jak?|utorak|srijedu?|sredu?|[cč]etvrtak|[cč]etvrtak|petak|subotu?|nedjelju?|nedelju?)\b/i,
  // Standalone weekday
  /\bu\s+(?:pon[eo]d[ej]?[lj]?jak?|utorak|srijedu?|sredu?|[cč]etvrtak|petak|subotu?|nedjelju?|nedelju?)\b/i,
  // Croatian month names (e.g., "15. ožujka", "5 travnja")
  /\b\d{1,2}\.?\s*(?:sije[cč]nja|velja[cč]e|o[žz]ujka|travnja|svibnja|lipnja|srpnja|kolovoza|rujna|listopada|studenog|prosinca)\b/i,
  // Croatian time of day
  /\bposlijepodne\b/i,
  /\bujutro\b/i,
  /\bnave[cč]er\b/i,
  /\bpodne\b/i,
  /\bno[cć]u\b/i,
  // "u 10 sati", "u 3 sata", "u 21:00 sati" — digit or HH:MM before sati/sata
  /\bu\s+\d{1,2}(?::\d{2})?\s+sat[ia]\b/i,

  // --- English date patterns ---
  // Relative days
  /\btomorrow\b/i,
  /\byesterday\b/i,
  /\btoday\b/i,
  // Relative week
  /\bnext\s+week\b/i,
  /\bthis\s+week\b/i,
  /\blast\s+week\b/i,
  // Next/this/last + weekday
  /\b(?:next|this|last)\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
  // Standalone weekday (on Monday, on Friday)
  /\bon\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
  // English month names + day (e.g., "March 15", "15 March", "March 15th")
  /\b(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}(?:st|nd|rd|th)?\b/i,
  /\b\d{1,2}(?:st|nd|rd|th)?\s+(?:january|february|march|april|may|june|july|august|september|october|november|december)\b/i,
  // "at 3pm", "at 10:00", "at noon"
  /\bat\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)?\b/i,
  /\bat\s+noon\b/i,
  /\bat\s+midnight\b/i,
  // "[digit]am" / "[digit]pm" — e.g., "3pm", "10am"
  /\b\d{1,2}(?::\d{2})?\s*(?:am|pm)\b/i,
];

/**
 * Returns true if the message contains any Croatian or English date/time reference.
 * Pure function — no imports, no side effects.
 */
export function containsDateOrTime(message: string): boolean {
  for (const pattern of PATTERNS) {
    if (pattern.test(message)) {
      return true;
    }
  }
  return false;
}
