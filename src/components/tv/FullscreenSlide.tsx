'use client'

import type { Event, Hadith } from '@/lib/types'
import EventSlide from './EventSlide'
import HadithSlide from './HadithSlide'
import { useSlideRotation } from '@/hooks/useSlideRotation'
import { useClock } from '@/hooks/useClock'

interface FullscreenSlideProps {
  events: Event[]
  hadiths: Hadith[]
}

export default function FullscreenSlide({ events, hadiths }: FullscreenSlideProps) {
  const { hours, minutes, seconds } = useClock()

  // Build slides array
  const slides: Array<{ type: 'event'; data: Event } | { type: 'hadith'; data: Hadith }> = []
  events.forEach((e) => slides.push({ type: 'event', data: e }))
  hadiths.forEach((h) => slides.push({ type: 'hadith', data: h }))

  const { activeIndex } = useSlideRotation(slides.length, 6000)

  if (!slides.length) return null

  return (
    <div className="tv-fullscreen-mode">
      {/* Minimal clock overlay */}
      <div className="tv-fullscreen-clock">
        {hours}:{minutes}
        <span style={{ fontSize: '1rem', opacity: 0.7 }}>:{seconds}</span>
      </div>

      {/* Fullscreen slides */}
      <div className="tv-fullscreen-slides">
        {slides.map((slide, i) => (
          <div
            key={`fs-${i}`}
            className={`tv-slide ${i === activeIndex ? 'active' : ''}`}
          >
            {slide.type === 'event' ? (
              <EventSlide event={slide.data} />
            ) : (
              <HadithSlide hadith={slide.data} />
            )}
          </div>
        ))}
      </div>

      {/* Dots */}
      {slides.length > 1 && (
        <div className="tv-fullscreen-dots">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`tv-dot ${i === activeIndex ? 'active' : ''}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
