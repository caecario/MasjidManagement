'use client'

import type { Announcement } from '@/lib/types'

interface RunningTextProps {
  announcements: Announcement[]
}

export default function RunningText({ announcements }: RunningTextProps) {
  if (!announcements.length) return null

  // Duplicate for seamless loop
  const items = [...announcements, ...announcements]

  return (
    <footer className="tv-footer">
      <div className="tv-ticker">
        <span className="tv-ticker-label">📢 PENGUMUMAN</span>
        <div className="tv-ticker-track">
          <div className="tv-ticker-content">
            {items.map((ann, i) => (
              <span key={`${ann.id}-${i}`} className="tv-ticker-item">
                <span>{ann.icon}</span>
                <span>{ann.text}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
