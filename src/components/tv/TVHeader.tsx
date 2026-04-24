'use client'

import { useClock } from '@/hooks/useClock'

interface TVHeaderProps {
  logoUrl?: string | null
  mosqueName?: string
  tagline?: string
}

export default function TVHeader({
  logoUrl,
  mosqueName = 'MASJID AS-SYAMS',
  tagline = 'Menerangi Hati, Menghidupkan Sunnah',
}: TVHeaderProps) {
  const { hours, minutes, seconds, gregorian, hijriInfo } = useClock()

  const highlightClass = `tv-hijri-${hijriInfo.highlight}`

  // Center label — special date > month label > friday
  const centerLabel = hijriInfo.specialDate
    ? { text: `${hijriInfo.specialDate.emoji} ${hijriInfo.specialDate.label}`, type: 'special' }
    : hijriInfo.monthLabel
    ? { text: hijriInfo.monthLabel, type: hijriInfo.highlight }
    : hijriInfo.isFriday
    ? { text: '🕌 Jum\'at Mubarak', type: 'friday' }
    : null

  return (
    <header className="tv-header">
      {/* Left: Logo + Name */}
      <div className="flex items-center gap-sm" style={{ flex: '0 0 auto' }}>
        <div style={{
          width: 44,
          height: 44,
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          flexShrink: 0,
          background: 'rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={mosqueName}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          ) : (
            <span style={{ fontSize: '1.375rem' }}>🕌</span>
          )}
        </div>
        <div>
          <div style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '0.02em' }}>
            {mosqueName}
          </div>
          <div style={{ fontSize: '0.625rem', opacity: 0.7, fontStyle: 'italic' }}>
            {tagline}
          </div>
        </div>
      </div>

      {/* Center: Special Label */}
      {centerLabel && (
        <div className={`tv-center-label tv-center-label-${centerLabel.type}`}>
          {centerLabel.text}
        </div>
      )}

      {/* Right: Dates + Clock */}
      <div className="flex items-center gap-md">
        {/* Date block */}
        <div className="tv-header-dates">
          {/* Gregorian */}
          <div className="tv-header-gregorian">{gregorian}</div>

          {/* Hijri */}
          <div className={`tv-hijri-date ${highlightClass}`}>
            <span className="tv-hijri-text">{hijriInfo.text}</span>
          </div>
        </div>

        {/* Divider */}
        <div style={{
          width: 1,
          height: 40,
          background: 'rgba(255,255,255,0.15)',
        }} />

        {/* Clock */}
        <div className="tv-clock">
          <div className="tv-clock-time">
            {hours}:{minutes}
            <span className="tv-clock-seconds">:{seconds}</span>
          </div>
          <div className="tv-clock-label">WIB</div>
        </div>
      </div>
    </header>
  )
}
