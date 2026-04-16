'use client'

import { useState, useEffect, useCallback } from 'react'

export function useSlideRotation(totalSlides: number, interval: number = 8000) {
  const [activeIndex, setActiveIndex] = useState(0)

  const next = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % totalSlides)
  }, [totalSlides])

  const goTo = useCallback((index: number) => {
    setActiveIndex(index)
  }, [])

  useEffect(() => {
    if (totalSlides <= 1) return
    const timer = setInterval(next, interval)
    return () => clearInterval(timer)
  }, [next, interval, totalSlides])

  return { activeIndex, next, goTo }
}
