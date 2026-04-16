'use client'

import { useState, useEffect } from 'react'
import type { Donation } from '@/lib/types'
import { formatRupiah, getPercentage } from '@/lib/utils'

interface DonationPanelProps {
  donations: Donation[]
}

export default function DonationPanel({ donations }: DonationPanelProps) {
  const activeDonations = donations.filter(d => d.status === 'active')
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (activeDonations.length <= 1) return
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeDonations.length)
    }, 10000)
    return () => clearInterval(timer)
  }, [activeDonations.length])

  if (!activeDonations.length) return null

  const donation = activeDonations[currentIndex]
  const pct = getPercentage(donation.collected_amount, donation.target_amount)
  const hasImage = !!donation.image_url

  return (
    <div className="tv-donation-card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: 0 }}>
      {/* Image at top if uploaded */}
      {hasImage && (
        <div style={{ flexShrink: 0, height: '40%', overflow: 'hidden', position: 'relative' }}>
          <img src={donation.image_url!} alt={donation.program_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 60%)' }} />
        </div>
      )}

      {/* Content */}
      <div style={{ padding: '0.5rem 0.75rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {/* Header */}
        <div className="flex items-center justify-between" style={{ marginBottom: '0.25rem' }}>
          <div className="tv-donation-title" style={{ marginBottom: 0, fontSize: '0.625rem' }}>Program Donasi</div>
          {activeDonations.length > 1 && (
            <span style={{ fontSize: '0.5625rem', color: 'var(--gray-400)', fontWeight: 600 }}>
              {currentIndex + 1}/{activeDonations.length}
            </span>
          )}
        </div>

        {/* Program name */}
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-800)', marginBottom: '0.25rem' }}>
          {donation.program_name}
        </div>

        {/* Amounts */}
        <div className="flex justify-between" style={{ marginBottom: '0.1875rem' }}>
          <div>
            <div style={{ fontSize: '0.5rem', color: 'var(--gray-500)', fontWeight: 600 }}>Target</div>
            <div style={{ fontSize: '0.625rem', fontWeight: 700 }}>{formatRupiah(donation.target_amount)}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.5rem', color: 'var(--gray-500)', fontWeight: 600 }}>Terkumpul</div>
            <div style={{ fontSize: '0.625rem', fontWeight: 800, color: 'var(--green-600)' }}>{formatRupiah(donation.collected_amount)}</div>
          </div>
        </div>

        {/* Progress */}
        <div className="progress-bar" style={{ marginBottom: '0.1875rem', height: 4 }}>
          <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
        </div>

        {/* Percentage + dots */}
        <div className="flex items-center justify-between">
          <span className="badge badge-green" style={{ fontSize: '0.5625rem', fontWeight: 700, padding: '0.0625rem 0.375rem' }}>
            {pct}%
          </span>
          {activeDonations.length > 1 && (
            <div className="tv-dots" style={{ margin: 0 }}>
              {activeDonations.map((_, i) => (
                <div key={i} className={`tv-dot ${i === currentIndex ? 'active' : ''}`} style={{ width: i === currentIndex ? 10 : 4, height: 4 }} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
