/* ──────────────────────────────────────────────
   Masjid TV App — Utility Functions
   ────────────────────────────────────────────── */

/** Format number as Indonesian Rupiah */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/** Format date to Indonesian locale */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

/** Format short date */
export function formatShortDate(date: string | Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

/** Get percentage for progress bar */
export function getPercentage(collected: number, target: number): number {
  if (target <= 0) return 0
  return Math.min(Math.round((collected / target) * 100), 100)
}

/** Pad number with leading zero */
export function pad(n: number): string {
  return n.toString().padStart(2, '0')
}

/** Simple Hijri date approximation (for display, not exact calculation) */
export function getHijriDate(): string {
  // Uses Intl for approximate Hijri date
  try {
    const formatter = new Intl.DateTimeFormat('id-u-ca-islamic', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    return formatter.format(new Date())
  } catch {
    return ''
  }
}

/** Check if an event date has passed */
export function isExpired(dateStr: string): boolean {
  const eventDate = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  eventDate.setHours(0, 0, 0, 0)
  return eventDate < today
}

/** Check if event is today */
export function isToday(dateStr: string): boolean {
  const eventDate = new Date(dateStr)
  const today = new Date()
  return (
    eventDate.getFullYear() === today.getFullYear() &&
    eventDate.getMonth() === today.getMonth() &&
    eventDate.getDate() === today.getDate()
  )
}
