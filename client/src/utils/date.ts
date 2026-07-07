// Formats a Date as YYYY-MM-DD using local time, not UTC.
// `toISOString().split('T')[0]` shifts to UTC first, which rolls the date
// forward for any timezone behind UTC in the evening (e.g. PST).
export function toLocalDateString(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
