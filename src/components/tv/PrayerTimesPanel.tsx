'use client'

import { usePrayerTimes } from '@/hooks/usePrayerTimes'
import { PRAYER_ICONS, PRAYER_LABELS, type PrayerName } from '@/lib/types'
import { pad } from '@/lib/utils'

const PRAYER_ORDER: PrayerName[] = ['subuh', 'dzuhur', 'ashar', 'maghrib', 'isya']

export default function PrayerTimesPanel() {
  const { prayers, currentPrayer, nextPrayer } = usePrayerTimes()

  // Calculate countdown to next prayer
  const getCountdown = () => {
    if (!nextPrayer) return null
    const now = new Date()
    const nowMinutes = now.getHours() * 60 + now.getMinutes()
    const [h, m] = prayers[nextPrayer].split(':').map(Number)
    let diff = (h * 60 + m) - nowMinutes
    if (diff < 0) diff += 24 * 60
    const dH = Math.floor(diff / 60)
    const dM = diff % 60
    return { hours: dH, minutes: dM }
  }

  const countdown = getCountdown()

  return (
    <div className="tv-prayer-panel">
      {/* Header */}
      <div className="flex items-center gap-sm" style={{
        padding: '0.375rem 0.625rem',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        marginBottom: '0.125rem',
      }}>
        <span style={{ fontSize: '0.875rem' }}>🕐</span>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Waktu Sholat
        </span>
      </div>

      {/* Prayer items */}
      {PRAYER_ORDER.map((name) => (
        <div
          key={name}
          className={`tv-prayer-item ${currentPrayer === name ? 'active' : ''}`}
        >
          <div className="tv-prayer-name">
            <span>{PRAYER_ICONS[name]}</span>
            <span>{PRAYER_LABELS[name]}</span>
          </div>
          <div className="tv-prayer-time">
            {prayers[name]}
          </div>
        </div>
      ))}

      {/* Next prayer countdown */}
      {nextPrayer && countdown && (
        <div className="tv-iqamah">
          <div className="tv-iqamah-label">
            ⏱️ {PRAYER_LABELS[nextPrayer]} dalam
          </div>
          <div className="tv-iqamah-time">
            {countdown.hours > 0 ? `${countdown.hours}j ` : ''}{pad(countdown.minutes)} menit
          </div>
        </div>
      )}
    </div>
  )
}
