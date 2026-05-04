'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
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
  adhanTriggered: PrayerName | null   // fires once when adhan time is reached
  iqamahTriggered: PrayerName | null  // fires once when iqamah time is reached
  clearTriggers: () => void
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
  provinsi: string = 'DKI Jakarta',
  kabkota: string = 'Kota Jakarta'
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
  const [adhanTriggered, setAdhanTriggered] = useState<PrayerName | null>(null)
  const [iqamahTriggered, setIqamahTriggered] = useState<PrayerName | null>(null)

  // Track which prayers have already triggered today (avoid re-firing)
  const firedAdhan = useRef<Set<string>>(new Set())
  const firedIqamah = useRef<Set<string>>(new Set())

  const clearTriggers = useCallback(() => {
    setAdhanTriggered(null)
    setIqamahTriggered(null)
  }, [])

  // Fetch from eQuran.id API
  useEffect(() => {
    async function fetchPrayers() {
      try {
        const today = new Date()
        const bulan = today.getMonth() + 1
        const tahun = today.getFullYear()
        const todayDate = today.getDate()

        const res = await fetch('https://equran.id/api/v2/shalat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ provinsi, kabkota, bulan, tahun }),
        })
        const data = await res.json()

        if (data.code === 200 && data.data?.jadwal) {
          // Find today's schedule from the monthly jadwal array
          const todaySchedule = data.data.jadwal.find(
            (j: { tanggal: number }) => j.tanggal === todayDate
          )
          if (todaySchedule) {
            setPrayers({
              subuh: todaySchedule.subuh,
              dzuhur: todaySchedule.dzuhur,
              ashar: todaySchedule.ashar,
              maghrib: todaySchedule.maghrib,
              isya: todaySchedule.isya,
            })
          }
        }
      } catch (err) {
        console.error('Failed to fetch prayer times:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPrayers()
  }, [provinsi, kabkota])

  // Reset fired triggers at midnight
  useEffect(() => {
    const checkMidnight = setInterval(() => {
      const now = new Date()
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        firedAdhan.current.clear()
        firedIqamah.current.clear()
      }
    }, 60000)
    return () => clearInterval(checkMidnight)
  }, [])

  // Update current/next prayer + iqamah countdown + triggers
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

    // Adhan trigger — fires once when prayer minute is first reached
    if (current) {
      const prayerMinutes = parseTime(prayers[current])
      if (nowMinutes === prayerMinutes && !firedAdhan.current.has(current)) {
        firedAdhan.current.add(current)
        setAdhanTriggered(current)
      }
    }

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

      // Iqamah trigger — fires once when iqamah time is reached
      const iqamahSeconds = prayerSeconds + iqamahMinutes * 60
      if (nowSeconds >= iqamahSeconds && nowSeconds < iqamahSeconds + 2 && !firedIqamah.current.has(current)) {
        firedIqamah.current.add(current)
        setIqamahTriggered(current)
      }
    }
  }, [prayers])

  useEffect(() => {
    updatePrayerState()
    const interval = setInterval(updatePrayerState, 1000)
    return () => clearInterval(interval)
  }, [updatePrayerState])

  return {
    prayers,
    currentPrayer,
    nextPrayer,
    iqamahCountdown,
    iqamahPrayer,
    adhanTriggered,
    iqamahTriggered,
    clearTriggers,
    loading,
  }
}

