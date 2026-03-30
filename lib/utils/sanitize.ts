export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, '').trim()
}

export function sanitizeMessage(input: string): string {
  return stripHtml(input).slice(0, 2000).trim()
}

export function sanitizeProfileField(input: string, maxLength: number): string {
  return stripHtml(input).slice(0, maxLength).trim()
}
