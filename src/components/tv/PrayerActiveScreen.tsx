'use client'

import { useState, useEffect } from 'react'
import type { PrayerName } from '@/lib/types'
import { PRAYER_LABELS } from '@/lib/types'
import { pad } from '@/lib/utils'

interface PrayerActiveScreenProps {
  prayer: PrayerName
  iqamahRemaining: number | null   // seconds, null = iqamah done
  standbyRemaining: number | null  // seconds
}

export default function PrayerActiveScreen({
  prayer,
  iqamahRemaining,
  standbyRemaining,
}: PrayerActiveScreenProps) {
  const [now, setNow] = useState(new Date())

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const hours = pad(now.getHours())
  const minutes = pad(now.getMinutes())
  const seconds = pad(now.getSeconds())

  // Iqamah countdown
  const iqMin = iqamahRemaining ? Math.floor(iqamahRemaining / 60) : 0
  const iqSec = iqamahRemaining ? iqamahRemaining % 60 : 0

  // Standby countdown
  const stMin = standbyRemaining ? Math.floor(standbyRemaining / 60) : 0
  const stSec = standbyRemaining ? standbyRemaining % 60 : 0

  const isIqamahPhase = iqamahRemaining !== null && iqamahRemaining > 0
  const isStandbyPhase = !isIqamahPhase && standbyRemaining !== null

  return (
    <div className="tv-prayer-active">
      {/* Decorative BG */}
      <div className="tv-prayer-active-bg" />

      {/* Content */}
      <div className="tv-prayer-active-content">
        {/* Mosque icon */}
        <div className="tv-prayer-active-icon">🕌</div>

        {/* Title */}
        <div className="tv-prayer-active-label">WAKTU SHOLAT</div>

        {/* Prayer name */}
        <div className="tv-prayer-active-name">{PRAYER_LABELS[prayer]}</div>

        {/* Live clock */}
        <div className="tv-prayer-active-clock">
          <span className="tv-prayer-active-clock-hm">{hours}:{minutes}</span>
          <span className="tv-prayer-active-clock-sec">:{seconds}</span>
        </div>

        {/* Phase display */}
        {isIqamahPhase ? (
          <div className="tv-prayer-active-phase">
            <div className="tv-prayer-active-phase-label">Menuju Iqamah</div>
            <div className="tv-prayer-active-countdown">
              <span className="tv-prayer-active-countdown-num">{pad(iqMin)}</span>
              <span className="tv-prayer-active-countdown-sep">:</span>
              <span className="tv-prayer-active-countdown-num">{pad(iqSec)}</span>
            </div>
          </div>
        ) : isStandbyPhase ? (
          <div className="tv-prayer-active-phase">
            <div className="tv-prayer-active-phase-label standby">
              Sedang Melaksanakan Sholat {PRAYER_LABELS[prayer]}
            </div>
            <div className="tv-prayer-active-standby-timer">
              Kembali dalam {pad(stMin)}:{pad(stSec)}
            </div>
          </div>
        ) : (
          <div className="tv-prayer-active-phase">
            <div className="tv-prayer-active-phase-label">Telah Masuk</div>
          </div>
        )}
      </div>
    </div>
  )
}
