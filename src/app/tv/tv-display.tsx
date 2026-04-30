'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSlideRotation } from '@/hooks/useSlideRotation'
import { useRealtimeSync } from '@/hooks/useRealtimeSync'
import { usePrayerTimes } from '@/hooks/usePrayerTimes'
import { useTVDisplayMode } from '@/hooks/useTVDisplayMode'
import { resumeAudioContext } from '@/hooks/useBeepSound'
import type { Event, Donation, Finance, Announcement, Hadith, PrayerName } from '@/lib/types'

import TVHeader from '@/components/tv/TVHeader'
import PrayerTimesPanel from '@/components/tv/PrayerTimesPanel'
import EventSlide from '@/components/tv/EventSlide'
import HadithSlide from '@/components/tv/HadithSlide'
import DonationPanel from '@/components/tv/DonationPanel'
import FinancialSummary from '@/components/tv/FinancialSummary'
import RunningText from '@/components/tv/RunningText'
import AdhanOverlay from '@/components/tv/AdhanOverlay'
import PrayerBlankScreen from '@/components/tv/PrayerBlankScreen'
import FullscreenSlide from '@/components/tv/FullscreenSlide'

interface TVDisplayProps {
  initialEvents: Event[]
  initialDonations: Donation[]
  initialFinance: Finance | null
  initialAnnouncements: Announcement[]
  initialHadiths: Hadith[]
  logoUrl?: string | null
  qrisUrl?: string | null
  mosqueName?: string
  tagline?: string
  fullscreenInterval?: number
  fullscreenDuration?: number
  prayerDurations?: Record<PrayerName, number>
  latitude?: number
  longitude?: number
  method?: number
}

export default function TVDisplay({
  initialEvents,
  initialDonations,
  initialFinance,
  initialAnnouncements,
  initialHadiths,
  logoUrl,
  qrisUrl,
  mosqueName,
  tagline,
  fullscreenInterval = 5,
  fullscreenDuration = 30,
  prayerDurations = {
    subuh: 15,
    dzuhur: 15,
    ashar: 15,
    maghrib: 10,
    isya: 15,
  },
  latitude = -6.2088,
  longitude = 106.8456,
  method = 20,
}: TVDisplayProps) {
  const [events, setEvents] = useState(initialEvents)
  const [donations, setDonations] = useState(initialDonations)
  const [finance, setFinance] = useState(initialFinance)
  const [announcements, setAnnouncements] = useState(initialAnnouncements)
  const [hadiths, setHadiths] = useState(initialHadiths)
  const [audioEnabled, setAudioEnabled] = useState(false)

  // Build slides array (events + hadiths interleaved)
  const slides: Array<{ type: 'event'; data: Event } | { type: 'hadith'; data: Hadith }> = []
  events.forEach((e) => slides.push({ type: 'event', data: e }))
  hadiths.forEach((h) => slides.push({ type: 'hadith', data: h }))

  const { activeIndex } = useSlideRotation(slides.length, 8000)

  // Prayer times + triggers
  const {
    prayers,
    currentPrayer,
    nextPrayer,
    adhanTriggered,
    iqamahTriggered,
    iqamahCountdown,
    clearTriggers,
  } = usePrayerTimes(latitude, longitude, method)

  // TV display mode state machine
  const { mode, activePrayer, blankRemaining } = useTVDisplayMode(
    adhanTriggered,
    iqamahTriggered,
    clearTriggers,
    {
      fullscreenInterval,
      fullscreenDuration,
      prayerDurations,
    }
  )

  // Enable audio on first user interaction (browser policy)
  useEffect(() => {
    const enableAudio = () => {
      if (!audioEnabled) {
        resumeAudioContext()
        setAudioEnabled(true)
      }
    }
    window.addEventListener('click', enableAudio, { once: true })
    window.addEventListener('touchstart', enableAudio, { once: true })
    window.addEventListener('keydown', enableAudio, { once: true })
    return () => {
      window.removeEventListener('click', enableAudio)
      window.removeEventListener('touchstart', enableAudio)
      window.removeEventListener('keydown', enableAudio)
    }
  }, [audioEnabled])

  // Refetch data function
  const refetch = useCallback(async (table: string) => {
    const supabase = createClient()

    if (table === 'events') {
      const { data } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'active')
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true })
      if (data) setEvents(data)
    }

    if (table === 'donations') {
      const { data } = await supabase
        .from('donations')
        .select('*')
        .in('status', ['active', 'completed'])
        .order('created_at', { ascending: false })
      if (data) setDonations(data)
    }

    if (table === 'finances') {
      const { data } = await supabase
        .from('finances')
        .select('*')
        .order('as_of_date', { ascending: false })
        .limit(1)
        .single()
      if (data) setFinance(data)
    }

    if (table === 'announcements') {
      const { data } = await supabase
        .from('announcements')
        .select('*')
        .eq('status', 'active')
        .order('sort_order', { ascending: true })
      if (data) setAnnouncements(data)
    }

    if (table === 'hadiths') {
      const { data } = await supabase
        .from('hadiths')
        .select('*')
        .eq('status', 'active')
      if (data) setHadiths(data)
    }
  }, [])

  // Realtime sync (Supabase)
  useRealtimeSync(
    ['events', 'donations', 'finances', 'announcements', 'hadiths'],
    refetch
  )

  // Polling fallback — batch refetch every 60s
  useEffect(() => {
    const interval = setInterval(async () => {
      await refetch('events')
      await refetch('donations')
      await refetch('finances')
      await refetch('announcements')
      await refetch('hadiths')
    }, 60000)
    return () => clearInterval(interval)
  }, [refetch])

  // ── Render based on mode ─────────────────────────────────
  // Prayer blank screen
  if (mode === 'prayer_blank' && activePrayer) {
    return <PrayerBlankScreen prayer={activePrayer} remaining={blankRemaining} />
  }

  // Adhan / Iqamah countdown overlay
  if ((mode === 'adhan' || mode === 'iqamah_countdown') && activePrayer) {
    return (
      <AdhanOverlay
        prayer={activePrayer}
        iqamahCountdown={iqamahCountdown}
        mode={mode}
      />
    )
  }

  // Fullscreen slide mode
  if (mode === 'fullscreen') {
    return <FullscreenSlide events={events} hadiths={hadiths} />
  }

  // Normal mode
  return (
    <div className="tv-layout">
      <TVHeader logoUrl={logoUrl} mosqueName={mosqueName} tagline={tagline} />

      <div className="tv-body">
        {/* Left: Prayer Times */}
        <PrayerTimesPanel prayers={prayers} currentPrayer={currentPrayer} nextPrayer={nextPrayer} />

        {/* Center: Slides + Financial */}
        <div className="tv-center">
          <div className="tv-slide-container">
            {slides.map((slide, i) => (
              <div
                key={`slide-${i}`}
                className={`tv-slide ${i === activeIndex ? 'active' : ''}`}
              >
                {slide.type === 'event' ? (
                  <EventSlide event={slide.data} />
                ) : (
                  <HadithSlide hadith={slide.data} />
                )}
              </div>
            ))}

            {/* Dots */}
            {slides.length > 1 && (
              <div className="tv-dots" style={{
                position: 'absolute',
                bottom: '0.5rem',
                left: 0,
                right: 0,
              }}>
                {slides.map((_, i) => (
                  <div
                    key={i}
                    className={`tv-dot ${i === activeIndex ? 'active' : ''}`}
                  />
                ))}
              </div>
            )}
          </div>

          <FinancialSummary finance={finance} />
        </div>

        {/* Right: Donations + QRIS */}
        <div className="tv-right-panel">
          <DonationPanel donations={donations} />

          {/* QRIS Card — image fills entire card */}
          <div className="tv-qris-card" style={{ padding: 0, overflow: 'hidden' }}>
            {qrisUrl ? (
              <img src={qrisUrl} alt="QRIS" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '0.375rem' }} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '0.25rem' }}>
                <span style={{ fontSize: '2rem' }}>📱</span>
                <span style={{ fontSize: '0.625rem', color: 'var(--gray-400)' }}>Upload QRIS di admin</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <RunningText announcements={announcements} />

      {/* Audio enable hint */}
      {!audioEnabled && (
        <div className="tv-audio-hint">
          🔇 Klik layar untuk mengaktifkan suara
        </div>
      )}
    </div>
  )
}
