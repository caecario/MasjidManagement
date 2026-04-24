'use client'

import type { PrayerName } from '@/lib/types'
import { PRAYER_LABELS } from '@/lib/types'
import { pad } from '@/lib/utils'

interface AdhanOverlayProps {
  prayer: PrayerName
  iqamahCountdown: number | null
  mode: 'adhan' | 'iqamah_countdown'
}

export default function AdhanOverlay({ prayer, iqamahCountdown, mode }: AdhanOverlayProps) {
  const minutes = iqamahCountdown ? Math.floor(iqamahCountdown / 60) : 0
  const seconds = iqamahCountdown ? iqamahCountdown % 60 : 0

  return (
    <div className="tv-adhan-overlay">
      {/* Decorative background */}
      <div className="tv-adhan-bg" />

      {/* Content */}
      <div className="tv-adhan-content">
        {mode === 'adhan' ? (
          <>
            <div className="tv-adhan-icon">🕌</div>
            <div className="tv-adhan-title">WAKTU SHOLAT</div>
            <div className="tv-adhan-prayer">{PRAYER_LABELS[prayer]}</div>
            <div className="tv-adhan-subtitle">Telah Masuk</div>
          </>
        ) : (
          <>
            <div className="tv-adhan-icon">🕌</div>
            <div className="tv-adhan-title">IQAMAH {PRAYER_LABELS[prayer]}</div>
            <div className="tv-iqamah-countdown-display">
              <span className="tv-iqamah-countdown-num">{pad(minutes)}</span>
              <span className="tv-iqamah-countdown-sep">:</span>
              <span className="tv-iqamah-countdown-num">{pad(seconds)}</span>
            </div>
            <div className="tv-adhan-subtitle">Menuju Iqamah</div>
          </>
        )}
      </div>
    </div>
  )
}
