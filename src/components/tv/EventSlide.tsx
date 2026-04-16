'use client'

import type { Event } from '@/lib/types'
import { TEMPLATE_LABELS } from '@/lib/types'

interface EventSlideProps {
  event: Event
}

export default function EventSlide({ event }: EventSlideProps) {
  // If custom image, show image with info overlay
  if (event.image_type === 'custom' && event.image_url) {
    return (
      <div className="template-slide" style={{ position: 'relative', background: '#000' }}>
        <img
          src={event.image_url}
          alt={event.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {/* Gradient overlay with event info */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 40%, transparent 70%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '1.5rem 2rem',
        }}>
          <span className="template-badge" style={{ marginBottom: '0.5rem', alignSelf: 'flex-start' }}>
            {event.template_type === 'kajian_rutin' ? 'KAJIAN HARI INI' :
             event.template_type === 'sholat_jumat' ? "SHOLAT JUM'AT" :
             event.template_type === 'kajian_spesial' ? 'KAJIAN SPESIAL' : 'PENGUMUMAN'}
          </span>
          <h2 style={{
            color: 'white',
            fontSize: '2rem',
            fontWeight: 800,
            marginBottom: '0.5rem',
            textShadow: '0 2px 8px rgba(0,0,0,0.4)',
            lineHeight: 1.2,
          }}>
            {event.title}
          </h2>
          <div style={{ display: 'flex', gap: '1.25rem', color: 'rgba(255,255,255,0.9)', fontSize: '1rem' }}>
            {event.speaker && <span>🎤 {event.speaker}</span>}
            {event.time && <span>🕐 {event.time}</span>}
            {event.location && <span>📍 {event.location}</span>}
          </div>
        </div>
      </div>
    )
  }

  // Preset template
  const templateClass = `template-${event.template_type.replace('_', '-')}`

  return (
    <div className={`template-slide ${templateClass}`}>
      {/* Decorative arch */}
      <div className="template-arch" />

      {/* Content */}
      <div className="template-content">
        <span className="template-badge">
          {event.template_type === 'kajian_rutin' ? 'KAJIAN HARI INI' :
           event.template_type === 'sholat_jumat' ? "SHOLAT JUM'AT" :
           event.template_type === 'kajian_spesial' ? 'KAJIAN SPESIAL' :
           'PENGUMUMAN'}
        </span>

        <h2 className="template-title">{event.title}</h2>

        <div className="template-meta">
          {event.speaker && (
            <div className="template-meta-item">
              <span>🎤</span>
              <span>{event.speaker}</span>
            </div>
          )}
          {event.time && (
            <div className="template-meta-item">
              <span>🕐</span>
              <span>{event.time}</span>
            </div>
          )}
          {event.location && (
            <div className="template-meta-item">
              <span>📍</span>
              <span>{event.location}</span>
            </div>
          )}
        </div>
      </div>

      {/* Right decorative area */}
      <div className="template-image" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(255,255,255,0.04)',
      }}>
        <div style={{
          fontSize: '8rem',
          opacity: 0.15,
          filter: 'drop-shadow(0 0 40px rgba(212,168,67,0.3))',
        }}>
          🕌
        </div>
      </div>
    </div>
  )
}
