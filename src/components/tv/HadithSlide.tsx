'use client'

import type { Hadith } from '@/lib/types'

interface HadithSlideProps {
  hadith: Hadith
}

export default function HadithSlide({ hadith }: HadithSlideProps) {
  return (
    <div className="hadith-slide">
      <div style={{
        fontSize: '3rem',
        marginBottom: '1rem',
        opacity: 0.3,
      }}>
        ﷽
      </div>

      <div className="hadith-content">
        {hadith.content}
      </div>

      <div className="hadith-source">
        — {hadith.source}
      </div>
    </div>
  )
}
