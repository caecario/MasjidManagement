'use client'

/**
 * Web Audio API beep generator for adhan & iqamah alerts.
 * No external audio files needed.
 */

let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext()
  }
  return audioCtx
}

/** Play a single beep tone */
function playTone(frequency: number, duration: number, volume: number = 0.3): Promise<void> {
  return new Promise((resolve) => {
    const ctx = getAudioContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.type = 'sine'
    oscillator.frequency.value = frequency

    // Fade in/out to avoid clicks
    gainNode.gain.setValueAtTime(0, ctx.currentTime)
    gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.02)
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration - 0.02)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + duration)

    oscillator.onended = () => resolve()
  })
}

/** Wait for ms */
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** 3x beep at adhan time (800Hz, ascending) */
export async function playAdhanBeep(): Promise<void> {
  try {
    await playTone(700, 0.4, 0.35)
    await wait(200)
    await playTone(800, 0.4, 0.35)
    await wait(200)
    await playTone(900, 0.6, 0.4)
  } catch {
    console.warn('Audio playback failed — user interaction may be required first')
  }
}

/** 2x beep at iqamah time (600Hz, lower) */
export async function playIqamahBeep(): Promise<void> {
  try {
    await playTone(600, 0.5, 0.3)
    await wait(300)
    await playTone(600, 0.8, 0.35)
  } catch {
    console.warn('Audio playback failed')
  }
}

/**
 * Resume AudioContext after user interaction.
 * Browsers require a user gesture before playing audio.
 * Call this on first click/touch.
 */
export function resumeAudioContext(): void {
  const ctx = getAudioContext()
  if (ctx.state === 'suspended') {
    ctx.resume()
  }
}
