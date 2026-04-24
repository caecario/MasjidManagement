'use client'

import { useState, useEffect, useMemo } from 'react'
import { pad } from '@/lib/utils'

// Cache formatters — don't recreate 60x/min
const gregorianFmt = new Intl.DateTimeFormat('id-ID', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

let hijriFmt: Intl.DateTimeFormat | null = null
let hijriPartsFmt: Intl.DateTimeFormat | null = null
try {
  hijriFmt = new Intl.DateTimeFormat('id-u-ca-islamic', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  hijriPartsFmt = new Intl.DateTimeFormat('en-u-ca-islamic', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  })
} catch {
  hijriFmt = null
  hijriPartsFmt = null
}

/* ── Hijri month metadata ──────────────────────────────── */

// Sacred months (Bulan Haram)
const SACRED_MONTHS = new Set([1, 7, 11, 12]) // Muharram, Rajab, Dzulqa'dah, Dzulhijjah

const HIJRI_MONTH_LABELS: Record<number, string> = {
  1: 'Bulan Haram — Al-Muharram',
  7: 'Bulan Haram — Rajab',
  9: '🌙 Ramadhan Kareem',
  11: 'Bulan Haram — Dzulqa\'dah',
  12: 'Bulan Haram — Dzulhijjah',
}

// Special dates: [month, day] => label
const HIJRI_SPECIAL_DATES: Array<{ month: number; day: number; label: string; emoji: string }> = [
  { month: 1, day: 1, label: 'Tahun Baru Hijriyah', emoji: '🌟' },
  { month: 1, day: 10, label: 'Hari Asyura', emoji: '📿' },
  { month: 3, day: 12, label: 'Maulid Nabi ﷺ', emoji: '🕌' },
  { month: 7, day: 27, label: 'Isra\' Mi\'raj', emoji: '✨' },
  { month: 8, day: 15, label: 'Nisfu Sya\'ban', emoji: '🌕' },
  { month: 9, day: 1, label: 'Awal Ramadhan', emoji: '🌙' },
  { month: 9, day: 17, label: 'Nuzulul Qur\'an', emoji: '📖' },
  { month: 9, day: 27, label: 'Lailatul Qadar (perkiraan)', emoji: '💫' },
  { month: 10, day: 1, label: 'Idul Fitri', emoji: '🎉' },
  { month: 10, day: 2, label: 'Idul Fitri (Hari ke-2)', emoji: '🎉' },
  { month: 12, day: 9, label: 'Hari Arafah', emoji: '🏔️' },
  { month: 12, day: 10, label: 'Idul Adha', emoji: '🐑' },
  { month: 12, day: 11, label: 'Hari Tasyrik', emoji: '🐑' },
  { month: 12, day: 12, label: 'Hari Tasyrik', emoji: '🐑' },
  { month: 12, day: 13, label: 'Hari Tasyrik', emoji: '🐑' },
]

export type HijriHighlight = 'normal' | 'sacred' | 'ramadan' | 'friday' | 'eid'

export interface HijriInfo {
  text: string
  hijriMonth: number
  hijriDay: number
  highlight: HijriHighlight
  monthLabel: string | null
  specialDate: { label: string; emoji: string } | null
  isFriday: boolean
}

/** Parse Hijri parts from Intl formatter */
function getHijriParts(date: Date): { day: number; month: number; year: number } {
  if (!hijriPartsFmt) return { day: 0, month: 0, year: 0 }
  try {
    const parts = hijriPartsFmt.formatToParts(date)
    const day = parseInt(parts.find(p => p.type === 'day')?.value || '0')
    const month = parseInt(parts.find(p => p.type === 'month')?.value || '0')
    const year = parseInt(parts.find(p => p.type === 'year')?.value || '0')
    return { day, month, year }
  } catch {
    return { day: 0, month: 0, year: 0 }
  }
}

export function useClock() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const hours = pad(time.getHours())
  const minutes = pad(time.getMinutes())
  const seconds = pad(time.getSeconds())

  const gregorian = useMemo(() => gregorianFmt.format(time), [time])
  const hijriText = useMemo(() => hijriFmt?.format(time) ?? '', [time])
  const isFriday = time.getDay() === 5

  const hijriInfo: HijriInfo = useMemo(() => {
    const { day, month } = getHijriParts(time)

    // Determine highlight type
    let highlight: HijriHighlight = 'normal'
    if (month === 9) highlight = 'ramadan'
    else if (SACRED_MONTHS.has(month)) highlight = 'sacred'
    if (isFriday && highlight === 'normal') highlight = 'friday'

    // Check special dates
    const special = HIJRI_SPECIAL_DATES.find(s => s.month === month && s.day === day)
    if (special) highlight = 'eid'

    // Month label
    const monthLabel = HIJRI_MONTH_LABELS[month] || null

    return {
      text: hijriText,
      hijriMonth: month,
      hijriDay: day,
      highlight,
      monthLabel,
      specialDate: special || null,
      isFriday,
    }
  }, [time, hijriText, isFriday])

  return { hours, minutes, seconds, gregorian, hijri: hijriText, hijriInfo, now: time }
}
