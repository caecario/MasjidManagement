'use client'

import { useState, useEffect, useCallback } from 'react'
import type { PrayerName } from '@/lib/types'

interface PrayerSchedule {
  subuh: string
  dzuhur: string
  ashar: string
  maghrib: string
  isya: string
}

interface UsePrayerTimesReturn {
  prayers: PrayerSchedule
  currentPrayer: PrayerName | null
  nextPrayer: PrayerName | null
  iqamahCountdown: number | null // seconds remaining
  iqamahPrayer: PrayerName | null
  loading: boolean
}

const PRAYER_ORDER: PrayerName[] = ['subuh', 'dzuhur', 'ashar', 'maghrib', 'isya']

const DEFAULT_IQAMAH: Record<PrayerName, number> = {
  subuh: 10,
  dzuhur: 10,
  ashar: 10,
  maghrib: 5,
  isya: 10,
}

/** Parse "HH:mm" to minutes since midnight */
function parseTime(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

export function usePrayerTimes(
  latitude: number = -6.2088,
  longitude: number = 106.8456,
  method: number = 20
): UsePrayerTimesReturn {
  const [prayers, setPrayers] = useState<PrayerSchedule>({
    subuh: '04:45',
    dzuhur: '12:03',
    ashar: '15:20',
    maghrib: '18:05',
    isya: '19:15',
  })
  const [loading, setLoading] = useState(true)
  const [currentPrayer, setCurrentPrayer] = useState<PrayerName | null>(null)
  const [nextPrayer, setNextPrayer] = useState<PrayerName | null>(null)
  const [iqamahCountdown, setIqamahCountdown] = useState<number | null>(null)
  const [iqamahPrayer, setIqamahPrayer] = useState<PrayerName | null>(null)

  // Fetch from AlAdhan API
  useEffect(() => {
    async function fetchPrayers() {
      try {
        const today = new Date()
        const dateStr = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`
        const url = `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${latitude}&longitude=${longitude}&method=${method}`

        const res = await fetch(url)
        const data = await res.json()

        if (data.code === 200) {
          const t = data.data.timings
          setPrayers({
            subuh: t.Fajr,
            dzuhur: t.Dhuhr,
            ashar: t.Asr,
            maghrib: t.Maghrib,
            isya: t.Isha,
          })
        }
      } catch (err) {
        console.error('Failed to fetch prayer times:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPrayers()
  }, [latitude, longitude, method])

  // Update current/next prayer + iqamah countdown
  const updatePrayerState = useCallback(() => {
    const now = new Date()
    const nowMinutes = now.getHours() * 60 + now.getMinutes()
    const nowSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()

    let current: PrayerName | null = null
    let next: PrayerName | null = null

    for (let i = PRAYER_ORDER.length - 1; i >= 0; i--) {
      const prayerMinutes = parseTime(prayers[PRAYER_ORDER[i]])
      if (nowMinutes >= prayerMinutes) {
        current = PRAYER_ORDER[i]
        next = PRAYER_ORDER[i + 1] || null
        break
      }
    }

    if (!current) {
      next = PRAYER_ORDER[0]
    }

    setCurrentPrayer(current)
    setNextPrayer(next)

    // Check iqamah countdown (within iqamah window of current prayer)
    if (current) {
      const prayerSeconds = parseTime(prayers[current]) * 60
      const iqamahMinutes = DEFAULT_IQAMAH[current]
      const iqamahEndSeconds = prayerSeconds + iqamahMinutes * 60
      const remaining = iqamahEndSeconds - nowSeconds

      if (remaining > 0 && remaining <= iqamahMinutes * 60) {
        setIqamahCountdown(remaining)
        setIqamahPrayer(current)
      } else {
        setIqamahCountdown(null)
        setIqamahPrayer(null)
      }
    }
  }, [prayers])

  useEffect(() => {
    updatePrayerState()
    const interval = setInterval(updatePrayerState, 1000)
    return () => clearInterval(interval)
  }, [updatePrayerState])

  return { prayers, currentPrayer, nextPrayer, iqamahCountdown, iqamahPrayer, loading }
}
