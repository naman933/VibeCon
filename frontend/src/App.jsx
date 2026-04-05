import { useRef, useState, useCallback, useEffect } from 'react'
import { motion, useScroll, useTransform, useMotionValueEvent, AnimatePresence } from 'framer-motion'
import Header from '@/components/Header'
import IntroScreen from '@/components/IntroScreen'
import SimCanvas from '@/components/SimCanvas'
import SectionOverlay, { SECTIONS } from '@/components/SectionOverlay'
import ScrollNav from '@/components/ScrollNav'
import TradeoffControl from '@/components/TradeoffControl'
import InsightEngine from '@/components/InsightEngine'
import NarrativeOverlay from '@/components/NarrativeOverlay'
import JourneyBadge from '@/components/JourneyBadge'
import { useSimulator } from '@/hooks/useSimulator'
import { useNarrative } from '@/hooks/useNarrative'

export default function App() {
  const prevSection = useRef(0)
  const scrollRef   = useRef(null)

  const [started, setStarted]             = useState(false)
  const [visible, setVisible]             = useState(false) // controls canvas fade-in
  const [activeSection, setActiveSection] = useState(0)
  const [hasScrolled, setHasScrolled]     = useState(false)

  const { values, update, reset, score, dominant, scores, insight, impacts } = useSimulator()
  const { activeStep, stepIndex, advance, dismiss, isComplete }     = useNarrative({ values, hasScrolled })

  // Track window scroll — NOT a ref. This never breaks fixed children.
  const { scrollYProgress } = useScroll()

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    if (!started) return
    if (!hasScrolled && v > 0.005) setHasScrolled(true)

    // 300vh page: 3 equal sections at 0–0.33, 0.33–0.67, 0.67–1
    const next = v < 0.34 ? 0 : v < 0.67 ? 1 : 2
    if (next !== prevSection.current) {
      prevSection.current = next
      setActiveSection(next)
    }
  })

  const progressWidth = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])
  const activeAccent  = SECTIONS[activeSection].accent

  // When user clicks Start — scroll to top first, then fade canvas in
  const handleStart = useCallback(() => {
    window.scrollTo({ top: 0 })
    setStarted(true)
    // Small delay so the intro exit animation plays before canvas appears
    setTimeout(() => setVisible(true), 300)
  }, [])

  const handleReset = useCallback(() => {
    reset()
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setActiveSection(0)
    prevSection.current = 0
    setHasScrolled(false)
  }, [reset])

  const handleDotClick = useCallback((index) => {
    // Map section index → scroll position in the 300vh page
    const total = document.documentElement.scrollHeight - window.innerHeight
    const target = (index / (SECTIONS.length - 1)) * total
    window.scrollTo({ top: target, behavior: 'smooth' })
  }, [])

  // Lock/unlock body scroll based on intro visibility
  useEffect(() => {
    document.body.style.overflow = started ? '' : 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [started])

  return (
    <>
      {/* ── Intro screen (fixed, above everything) ── */}
      <AnimatePresence>
        {!started && <IntroScreen key="intro" onStart={handleStart} />}
      </AnimatePresence>

      {/* ── Scroll spacer — gives the page its 300vh height ── */}
      {started && (
        <div ref={scrollRef} style={{ height: '300vh' }} aria-hidden="true" />
      )}

      {/* ── Sticky viewport — the actual rendered UI ── */}
      {/* This is NOT inside a motion.div with filter, so fixed children work correctly */}
      {started && (
        <div
          className="fixed inset-0 w-screen h-screen overflow-hidden"
          style={{ zIndex: 0 }}
        >
          {/* Canvas — fades in after intro exits */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: visible ? 1 : 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          >
            <SimCanvas activeSection={activeSection} values={values} />
          </motion.div>

          {/* Bottom gradient — keeps panel readability without crushing the canvas */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: [
                'linear-gradient(to top,    rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.4) 22%, transparent 48%)',
                'linear-gradient(to bottom, rgba(0,0,0,0.5)  0%, transparent 16%)',
              ].join(', '),
            }}
          />

          {/* Section content — vertically centred, shifted up to clear bottom panels */}
          <SectionOverlay activeSection={activeSection} />

          {/* Scroll progress bar */}
          <div
            className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
            style={{ background: 'rgba(255,255,255,0.07)', zIndex: 10 }}
          >
            <motion.div
              className="h-full"
              style={{
                width: progressWidth,
                background: `linear-gradient(to right, ${activeAccent}cc, ${activeAccent}44)`,
              }}
            />
          </div>

          {/* Scroll hint */}
          <AnimatePresence>
            {!hasScrolled && !activeStep && visible && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 1.2, duration: 0.7 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 pointer-events-none"
                style={{ zIndex: 10 }}
              >
                <span className="text-[10px] text-white/25 tracking-[0.22em] uppercase font-medium">
                  Scroll to explore
                </span>
                <motion.div
                  animate={{ y: [0, 6, 0] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M8 3v10M4 9l4 4 4-4"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── All fixed UI — outside any filter wrapper, always viewport-relative ── */}
      {started && (
        <>
          <Header onReset={handleReset} />

          <ScrollNav activeSection={activeSection} onDotClick={handleDotClick} />

          <TradeoffControl
            values={values}
            update={update}
            reset={reset}
            score={score}
            dominant={dominant}
          />

          <InsightEngine scores={scores} insight={insight} impacts={impacts} />

          <NarrativeOverlay
            activeStep={activeStep}
            stepIndex={stepIndex}
            onAdvance={advance}
            onDismiss={dismiss}
          />

          <AnimatePresence>
            {isComplete && <JourneyBadge key="badge" />}
          </AnimatePresence>
        </>
      )}
    </>
  )
}
