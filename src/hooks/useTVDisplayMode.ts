'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { PrayerName, TVDisplayMode } from '@/lib/types'
import { playAdhanBeep, playIqamahBeep } from './useBeepSound'

interface TVDisplayConfig {
  fullscreenInterval: number  // minutes
  fullscreenDuration: number  // seconds
  prayerDurations: Record<PrayerName, number>  // minutes per prayer
}

interface UseTVDisplayModeReturn {
  mode: TVDisplayMode
  activePrayer: PrayerName | null  // which prayer triggered the current mode
  blankRemaining: number | null    // seconds remaining in blank mode
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
  clearTriggers: () => void,
  config: TVDisplayConfig = DEFAULT_CONFIG
): UseTVDisplayModeReturn {
  const [mode, setMode] = useState<TVDisplayMode>('normal')
  const [activePrayer, setActivePrayer] = useState<PrayerName | null>(null)
  const [blankRemaining, setBlankRemaining] = useState<number | null>(null)

  const fullscreenTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const blankTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const blankEndRef = useRef<number | null>(null)

  // ── Fullscreen cycle ─────────────────────────────────────
  const startFullscreenCycle = useCallback(() => {
    // Don't start if in prayer-related modes
    if (fullscreenTimerRef.current) clearTimeout(fullscreenTimerRef.current)

    fullscreenTimerRef.current = setTimeout(() => {
      setMode(prev => {
        // Only go fullscreen from normal mode
        if (prev !== 'normal') {
          // Retry later
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

  // ── Adhan trigger ────────────────────────────────────────
  useEffect(() => {
    if (!adhanTriggered) return

    // Interrupt any mode for adhan
    setMode('adhan')
    setActivePrayer(adhanTriggered)
    playAdhanBeep()
    clearTriggers()

    // After 5 seconds of adhan display, switch to iqamah countdown
    const timer = setTimeout(() => {
      setMode('iqamah_countdown')
    }, 5000)

    return () => clearTimeout(timer)
  }, [adhanTriggered, clearTriggers])

  // ── Iqamah trigger ───────────────────────────────────────
  useEffect(() => {
    if (!iqamahTriggered) return

    playIqamahBeep()
    clearTriggers()

    // Start prayer blank screen
    const duration = config.prayerDurations[iqamahTriggered] || 15
    const endTime = Date.now() + duration * 60 * 1000
    blankEndRef.current = endTime

    setMode('prayer_blank')
    setActivePrayer(iqamahTriggered)
    setBlankRemaining(duration * 60)

    // Countdown timer
    blankTimerRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((blankEndRef.current! - Date.now()) / 1000))
      setBlankRemaining(remaining)

      if (remaining <= 0) {
        if (blankTimerRef.current) clearInterval(blankTimerRef.current)
        setMode('normal')
        setActivePrayer(null)
        setBlankRemaining(null)
      }
    }, 1000)

    return () => {
      if (blankTimerRef.current) clearInterval(blankTimerRef.current)
    }
  }, [iqamahTriggered, clearTriggers, config.prayerDurations])

  return { mode, activePrayer, blankRemaining }
}
