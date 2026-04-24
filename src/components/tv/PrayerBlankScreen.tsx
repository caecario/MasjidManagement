'use client'

import type { PrayerName } from '@/lib/types'
import { PRAYER_LABELS } from '@/lib/types'
import { pad } from '@/lib/utils'

interface PrayerBlankScreenProps {
  prayer: PrayerName
  remaining: number | null  // seconds
}

export default function PrayerBlankScreen({ prayer, remaining }: PrayerBlankScreenProps) {
  const minutes = remaining ? Math.floor(remaining / 60) : 0
  const seconds = remaining ? remaining % 60 : 0

  return (
    <div className="tv-prayer-blank">
      <div className="tv-prayer-blank-content">
        <div className="tv-prayer-blank-icon">🕌</div>
        <div className="tv-prayer-blank-text">
          Sedang melaksanakan sholat {PRAYER_LABELS[prayer]}
        </div>
        {remaining !== null && remaining > 0 && (
          <div className="tv-prayer-blank-timer">
            {pad(minutes)}:{pad(seconds)}
          </div>
        )}
      </div>
    </div>
  )
}
