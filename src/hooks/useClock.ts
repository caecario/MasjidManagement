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
try {
  hijriFmt = new Intl.DateTimeFormat('id-u-ca-islamic', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
} catch {
  hijriFmt = null
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
  const hijri = useMemo(() => hijriFmt?.format(time) ?? '', [time])

  return { hours, minutes, seconds, gregorian, hijri, now: time }
}
