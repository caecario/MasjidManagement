'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { PrayerName, TVDisplayMode } from '@/lib/types'
import { playAdhanBeep, playIqamahBeep } from './useBeepSound'

interface TVDisplayConfig {
  fullscreenInterval: number  // minutes
  fullscreenDuration: number  // seconds
  prayerDurations: Record<PrayerName, number>  // minutes — standby after iqamah
}

interface UseTVDisplayModeReturn {
  mode: TVDisplayMode
  activePrayer: PrayerName | null
  /** seconds remaining on iqamah countdown (null = iqamah over) */
  iqamahRemaining: number | null
  /** seconds remaining on standby timer (null = not in standby) */
  standbyRemaining: number | null
}

const DEFAULT_CONFIG: TVDisplayConfig = {
  fullscreenInterval: 5,
  fullscreenDuration: 30,
  prayerDurations: {
    subuh: 15,
    dzuhur: 15,
    ashar: 15,
    maghrib: 10,
    isya: 15,
  },
}

export function useTVDisplayMode(
  adhanTriggered: PrayerName | null,
  iqamahTriggered: PrayerName | null,
  iqamahCountdown: number | null,
  clearTriggers: () => void,
  config: TVDisplayConfig = DEFAULT_CONFIG
): UseTVDisplayModeReturn {
  const [mode, setMode] = useState<TVDisplayMode>('normal')
  const [activePrayer, setActivePrayer] = useState<PrayerName | null>(null)
  const [standbyRemaining, setStandbyRemaining] = useState<number | null>(null)

  const fullscreenTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const standbyTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const standbyEndRef = useRef<number | null>(null)

  // ── Fullscreen cycle ─────────────────────────────────────
  const startFullscreenCycle = useCallback(() => {
    if (fullscreenTimerRef.current) clearTimeout(fullscreenTimerRef.current)

    fullscreenTimerRef.current = setTimeout(() => {
      setMode(prev => {
        if (prev !== 'normal') {
          startFullscreenCycle()
          return prev
        }
        return 'fullscreen'
      })
    }, config.fullscreenInterval * 60 * 1000)
  }, [config.fullscreenInterval])

  // Exit fullscreen after duration
  useEffect(() => {
    if (mode !== 'fullscreen') return

    const timer = setTimeout(() => {
      setMode('normal')
    }, config.fullscreenDuration * 1000)

    return () => clearTimeout(timer)
  }, [mode, config.fullscreenDuration])

  // Restart fullscreen cycle when returning to normal
  useEffect(() => {
    if (mode === 'normal') {
      startFullscreenCycle()
    }
    return () => {
      if (fullscreenTimerRef.current) clearTimeout(fullscreenTimerRef.current)
    }
  }, [mode, startFullscreenCycle])

  // ── Adhan trigger → enter prayer_active ──────────────────
  useEffect(() => {
    if (!adhanTriggered) return

    setMode('prayer_active')
    setActivePrayer(adhanTriggered)
    setStandbyRemaining(null)
    playAdhanBeep()
    clearTriggers()
  }, [adhanTriggered, clearTriggers])

  // ── Iqamah trigger → start standby countdown ─────────────
  useEffect(() => {
    if (!iqamahTriggered) return

    playIqamahBeep()

    // Start standby timer (runs AFTER iqamah countdown finishes)
    const duration = config.prayerDurations[iqamahTriggered] || 15
    const endTime = Date.now() + duration * 60 * 1000
    standbyEndRef.current = endTime

    setActivePrayer(iqamahTriggered)
    setStandbyRemaining(duration * 60)

    standbyTimerRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((standbyEndRef.current! - Date.now()) / 1000))
      setStandbyRemaining(remaining)

      if (remaining <= 0) {
        if (standbyTimerRef.current) clearInterval(standbyTimerRef.current)
        setMode('normal')
        setActivePrayer(null)
        setStandbyRemaining(null)
      }
    }, 1000)

    clearTriggers()

    return () => {
      if (standbyTimerRef.current) clearInterval(standbyTimerRef.current)
    }
  }, [iqamahTriggered, clearTriggers, config.prayerDurations])

  return {
    mode,
    activePrayer,
    iqamahRemaining: mode === 'prayer_active' && iqamahCountdown && iqamahCountdown > 0
      ? iqamahCountdown
      : null,
    standbyRemaining: mode === 'prayer_active' ? standbyRemaining : null,
  }
}
