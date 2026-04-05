import { useRef, useState, useCallback } from 'react'
import { motion, useScroll, useTransform, useMotionValueEvent, AnimatePresence } from 'framer-motion'
import Header from '@/components/Header'
import IntroScreen from '@/components/IntroScreen'
import SimCanvas from '@/components/SimCanvas'
import SectionOverlay, { SECTIONS } from '@/components/SectionOverlay'
import ScrollNav from '@/components/ScrollNav'
import ControlPanel from '@/components/ControlPanel'
import InsightEngine from '@/components/InsightEngine'
import NarrativeOverlay from '@/components/NarrativeOverlay'
import JourneyBadge from '@/components/JourneyBadge'
import { useSimulator } from '@/hooks/useSimulator'
import { useNarrative } from '@/hooks/useNarrative'

export default function App() {
  const prevSection = useRef(0)
  const scrollRef   = useRef(null)

  const [started, setStarted]             = useState(false)
  const [activeSection, setActiveSection] = useState(0)
  const [hasScrolled, setHasScrolled]     = useState(false)

  const { values, update, reset, score, dominant, scores, insight } = useSimulator()
  const { activeStep, stepIndex, advance, dismiss, isComplete }     = useNarrative({ values, hasScrolled })

  const { scrollYProgress } = useScroll({ target: scrollRef, offset: ['start start', 'end end'] })

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    if (!hasScrolled && v > 0.01) setHasScrolled(true)
    const next = v < 0.34 ? 0 : v < 0.67 ? 1 : 2
    if (next !== prevSection.current) {
      prevSection.current = next
      setActiveSection(next)
    }
  })

  const progressWidth = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])
  const activeAccent  = SECTIONS[activeSection].accent

  const handleReset = useCallback(() => {
    reset()
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setActiveSection(0)
    prevSection.current = 0
    setHasScrolled(false)
  }, [reset])

  const handleDotClick = useCallback((index) => {
    const el = scrollRef.current
    if (!el) return
    const targetY = (el.scrollHeight - window.innerHeight) * (index / (SECTIONS.length - 1))
    window.scrollTo({ top: el.offsetTop + targetY, behavior: 'smooth' })
  }, [])

  return (
    <>
      {/* ── Intro ── */}
      <AnimatePresence>
        {!started && <IntroScreen key="intro" onStart={() => setStarted(true)} />}
      </AnimatePresence>

      {/* ── Simulation ── */}
      <AnimatePresence>
        {started && (
          <motion.div
            key="sim"
            initial={{ opacity: 0, filter: 'blur(12px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
          >
            <div ref={scrollRef} style={{ height: '300vh' }}>
              <div className="sticky top-0 w-screen h-screen overflow-hidden">

                {/* ── Canvas background — always full screen ── */}
                <SimCanvas activeSection={activeSection} values={values} />

                {/* ── Vignettes — bottom fade keeps panel area readable ── */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: [
                      'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.3) 28%, transparent 55%)',
                      'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, transparent 18%)',
                    ].join(', '),
                  }}
                />

                {/* ── Header ── */}
                <Header onReset={handleReset} />

                {/* ── Section content — centred, above the panels ── */}
                <SectionOverlay activeSection={activeSection} />

                {/* ── Right dot nav ── */}
                <ScrollNav activeSection={activeSection} onDotClick={handleDotClick} />

                {/* ── Decision sliders — bottom-left ── */}
                <ControlPanel
                  values={values}
                  update={update}
                  reset={reset}
                  score={score}
                  dominant={dominant}
                />

                {/* ── Insight engine — bottom-right ── */}
                <InsightEngine scores={scores} insight={insight} />

                {/* ── Scroll progress bar ── */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
                  style={{ background: 'rgba(255,255,255,0.06)' }}
                >
                  <motion.div
                    className="h-full"
                    style={{
                      width: progressWidth,
                      background: `linear-gradient(to right, ${activeAccent}cc, ${activeAccent}55)`,
                    }}
                  />
                </div>

                {/* ── Scroll hint ── */}
                <AnimatePresence>
                  {!hasScrolled && !activeStep && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: 0.8, duration: 0.7 }}
                      className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 pointer-events-none"
                    >
                      <span className="text-[10px] text-white/20 tracking-[0.2em] uppercase font-medium">
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Narrative + badge (fixed, outside scroll) ── */}
      {started && (
        <>
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
