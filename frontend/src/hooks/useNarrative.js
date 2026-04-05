import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * useNarrative
 *
 * Tracks which narrative step the user is on and auto-advances
 * based on their interactions.
 *
 * Steps:
 *   0 — Intro      "Welcome" splash, auto-dismissed after 3s or on any interaction
 *   1 — Priority   "Choose your priority" — shown until a slider moves meaningfully
 *   2 — Tradeoffs  "Observe the trade-offs" — shown until user has scrolled once
 *   3 — Impact     "Understand the impact" — shown until both panels have been read
 *   4 — Done       Journey complete — small persistent badge only
 */

export const STEPS = [
  {
    id: 'intro',
    step: null,
    title: 'Welcome to the Simulator',
    body: 'Explore how Speed, Cost, and Sustainability shape real-world decisions.',
    cta: 'Begin',
    position: 'center',
  },
  {
    id: 'priority',
    step: 'Step 1',
    title: 'Choose your priority',
    body: 'Drag the sliders in the bottom-left panel to reflect what matters most to your operation.',
    cta: 'Got it',
    position: 'left',       // anchors near the ControlPanel
    pointer: 'bottom-left',
  },
  {
    id: 'tradeoffs',
    step: 'Step 2',
    title: 'Observe the trade-offs',
    body: 'Scroll down to move through each decision dimension and watch the scene respond.',
    cta: 'Got it',
    position: 'center-low',
    pointer: 'bottom',
  },
  {
    id: 'impact',
    step: 'Step 3',
    title: 'Understand the impact',
    body: 'The Insight Engine on the right converts your choices into live performance scores.',
    cta: 'Got it',
    position: 'right',      // anchors near InsightEngine
    pointer: 'bottom-right',
  },
]

export function useNarrative({ values, hasScrolled }) {
  const [step, setStep]       = useState(0)   // 0-4
  const [dismissed, setDismissed] = useState(false)
  const prevValues            = useRef(values)
  const sliderMoved           = useRef(false)
  const autoTimer             = useRef(null)

  const advance = useCallback(() => {
    setStep(s => Math.min(s + 1, STEPS.length))
  }, [])

  const dismiss = useCallback(() => {
    setDismissed(true)
    setStep(STEPS.length) // jump straight to done
  }, [])

  // Auto-advance from intro after 4s if user does nothing
  useEffect(() => {
    if (step === 0) {
      autoTimer.current = setTimeout(() => setStep(1), 4000)
    }
    return () => clearTimeout(autoTimer.current)
  }, [step])

  // Advance step 1 → 2 when any slider moves by ≥ 8 points
  useEffect(() => {
    if (step !== 1 || sliderMoved.current) return
    const keys = ['speed', 'cost', 'sustainability']
    const moved = keys.some(k => Math.abs(values[k] - prevValues.current[k]) >= 8)
    if (moved) {
      sliderMoved.current = true
      const t = setTimeout(() => setStep(2), 900)
      return () => clearTimeout(t)
    }
    prevValues.current = values
  }, [values, step])

  // Advance step 2 → 3 when user has scrolled
  useEffect(() => {
    if (step === 2 && hasScrolled) {
      const t = setTimeout(() => setStep(3), 1200)
      return () => clearTimeout(t)
    }
  }, [hasScrolled, step])

  // Step 3 → done: user clicks "Got it" via advance()

  const activeStep = dismissed ? null : STEPS[step] ?? null
  const isComplete = step >= STEPS.length

  return { activeStep, stepIndex: step, advance, dismiss, isComplete }
}
