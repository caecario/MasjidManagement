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

          {/* Labels row: month label OR special date OR friday */}
          {hijriInfo.specialDate ? (
            <div className="tv-hijri-special">
              <span>{hijriInfo.specialDate.emoji}</span>
              <span>{hijriInfo.specialDate.label}</span>
            </div>
          ) : hijriInfo.monthLabel ? (
            <div className={`tv-hijri-label ${highlightClass}`}>
              {hijriInfo.monthLabel}
            </div>
          ) : hijriInfo.isFriday ? (
            <div className="tv-hijri-friday-badge">
              🕌 Jum&apos;at Mubarak
            </div>
          ) : null}
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
