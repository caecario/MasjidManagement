'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import type { MediaItem } from '@/lib/types'

/* ── YouTube ID extractor ─────────────────────────── */
function extractYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/)
  return m ? m[1] : null
}

/* ── Hijri date checker ───────────────────────────── */
function getHijriParts(): { day: number; month: number } {
  try {
    const fmt = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
      day: 'numeric', month: 'numeric', year: 'numeric',
    })
    const parts = fmt.formatToParts(new Date())
    const day = parseInt(parts.find(p => p.type === 'day')?.value || '0')
    const month = parseInt(parts.find(p => p.type === 'month')?.value || '0')
    return { day, month }
  } catch {
    return { day: 0, month: 0 }
  }
}

function isInHijriRange(start: string, end: string): boolean {
  const { day, month } = getHijriParts()
  const [sm, sd] = start.split('-').map(Number)
  const [em, ed] = end.split('-').map(Number)

  // Simple range check (same month or cross-month)
  const current = month * 100 + day
  const startVal = sm * 100 + sd
  const endVal = em * 100 + ed

  if (startVal <= endVal) {
    return current >= startVal && current <= endVal
  }
  // Cross-year range (e.g. 12-25 to 1-5)
  return current >= startVal || current <= endVal
}

/* ── Filter active media ──────────────────────────── */
function getActiveMedia(items: MediaItem[]): MediaItem | null {
  const now = items.filter(m => {
    if (m.status !== 'active') return false

    switch (m.schedule_type) {
      case 'always': return true
      case 'manual': return m.autoplay
      case 'hijri_range':
        return m.schedule_start && m.schedule_end
          ? isInHijriRange(m.schedule_start, m.schedule_end)
          : false
      case 'prayer_time':
        // prayer_time scheduling is handled externally
        return m.autoplay
      default: return false
    }
  })
  return now[0] || null
}

/* ── Component Props ──────────────────────────────── */
interface TVMediaPlayerProps {
  mediaItems: MediaItem[]
  muted?: boolean  // mute during prayer
}

export default function TVMediaPlayer({ mediaItems, muted = false }: TVMediaPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showControls, setShowControls] = useState(false)

  const activeMedia = useMemo(() => getActiveMedia(mediaItems), [mediaItems])

  // Handle audio playback
  useEffect(() => {
    if (!activeMedia || !audioRef.current) return

    const audio = audioRef.current
    if (activeMedia.source_type === 'youtube') return // YouTube handled by iframe

    audio.src = activeMedia.source_url
    audio.loop = activeMedia.loop

    if (activeMedia.autoplay) {
      audio.play().then(() => setIsPlaying(true)).catch(() => {
        // Autoplay blocked — will play on user interaction
        setIsPlaying(false)
      })
    }

    return () => {
      audio.pause()
      audio.src = ''
    }
  }, [activeMedia])

  // Handle mute
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = muted
    }
  }, [muted])

  // Show/hide controls on hover
  useEffect(() => {
    if (!showControls) return
    const timer = setTimeout(() => setShowControls(false), 3000)
    return () => clearTimeout(timer)
  }, [showControls])

  if (!activeMedia) return null

  const ytId = activeMedia.source_type === 'youtube'
    ? extractYouTubeId(activeMedia.source_url)
    : null

  return (
    <>
      {/* Hidden audio element for uploaded/URL files */}
      {activeMedia.source_type !== 'youtube' && (
        <audio
          ref={audioRef}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => {
            if (!activeMedia.loop) setIsPlaying(false)
          }}
          preload="auto"
        />
      )}

      {/* YouTube iframe — hidden for audio, visible for video */}
      {ytId && (
        <div style={{
          position: activeMedia.media_type === 'video' ? 'fixed' : 'absolute',
          ...(activeMedia.media_type === 'video'
            ? { top: 0, left: 0, width: '100%', height: '100%', zIndex: 5 }
            : { width: 1, height: 1, overflow: 'hidden', opacity: 0, pointerEvents: 'none' }),
        }}>
          <iframe
            src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&loop=${activeMedia.loop ? 1 : 0}&playlist=${ytId}&controls=0&modestbranding=1${muted ? '&mute=1' : ''}`}
            width="100%"
            height="100%"
            allow="autoplay; encrypted-media"
            style={{ border: 'none' }}
            title={activeMedia.title}
          />
        </div>
      )}

      {/* Playback indicator — subtle bottom-left */}
      <div
        className="tv-media-indicator"
        onClick={() => {
          if (activeMedia.source_type !== 'youtube' && audioRef.current) {
            if (isPlaying) {
              audioRef.current.pause()
            } else {
              audioRef.current.play()
            }
          }
          setShowControls(true)
        }}
        onMouseEnter={() => setShowControls(true)}
        style={{
          position: 'fixed',
          bottom: '2.5rem',
          left: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.375rem',
          padding: '0.25rem 0.625rem',
          borderRadius: '1rem',
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(8px)',
          color: 'white',
          fontSize: '0.6875rem',
          cursor: 'pointer',
          zIndex: 50,
          opacity: showControls ? 1 : 0.4,
          transition: 'opacity 0.3s ease',
        }}
      >
        <span style={{ fontSize: '0.875rem' }}>
          {isPlaying || ytId ? '🎵' : '⏸'}
        </span>
        {showControls && (
          <span style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {activeMedia.title}
          </span>
        )}
      </div>
    </>
  )
}
