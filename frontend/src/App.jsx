import { useRef, useState, useCallback } from 'react'
import { motion, useScroll, useTransform, useMotionValueEvent, AnimatePresence } from 'framer-motion'
import Header from '@/components/Header'
import IntroScreen from '@/components/IntroScreen'
import Scene3D from '@/components/Scene3D'
import SectionOverlay, { SECTIONS } from '@/components/SectionOverlay'
import ScrollNav from '@/components/ScrollNav'
import ControlPanel from '@/components/ControlPanel'
import InsightEngine from '@/components/InsightEngine'
import BackgroundSystem from '@/components/BackgroundSystem'
import NarrativeOverlay from '@/components/NarrativeOverlay'
import JourneyBadge from '@/components/JourneyBadge'
import { useSimulator } from '@/hooks/useSimulator'
import { useNarrative } from '@/hooks/useNarrative'

const SCENE_URL = 'https://prod.spline.design/1GrsQSTjOJCB7XCZ/scene.splinecode'

export default function App() {
  const splineApp   = useRef(null)
  const prevSection = useRef(0)
  const scrollRef   = useRef(null)

  // ── View state ─────────────────────────────────────────────────────────────
  const [started, setStarted]         = useState(false)
  const [activeSection, setActiveSection] = useState(0)
  const [hasScrolled, setHasScrolled] = useState(false)

  // ── Simulation state ───────────────────────────────────────────────────────
  const { values, update, reset, score, dominant, scores, insight } = useSimulator()

  // ── Narrative ─────────────────────────────────────────────────────────────
  const { activeStep, stepIndex, advance, dismiss, isComplete } = useNarrative({ values, hasScrolled })

  // ── Scroll tracking ───────────────────────────────────────────────────────
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

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSceneLoad = useCallback((app) => { splineApp.current = app }, [])

  const handleDotClick = useCallback((index) => {
    const el = scrollRef.current
    if (!el) return
    const targetY = (el.scrollHeight - window.innerHeight) * (index / (SECTIONS.length - 1))
    window.scrollTo({ top: el.offsetTop + targetY, behavior: 'smooth' })
  }, [])

  // Full reset: sliders + scroll position + section + narrative
  const handleReset = useCallback(() => {
    reset()
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setActiveSection(0)
    prevSection.current = 0
    setHasScrolled(false)
  }, [reset])

  const activeAccent = SECTIONS[activeSection].accent

  return (
    <>
      {/* ── Intro screen ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {!started && <IntroScreen key="intro" onStart={() => setStarted(true)} />}
      </AnimatePresence>

      {/* ── Main sim ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {started && (
          <motion.div
            key="sim"
            initial={{ opacity: 0, scale: 0.97, filter: 'blur(8px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <div ref={scrollRef} style={{ height: '300vh' }}>
              <div className="sticky top-0 h-screen w-screen overflow-hidden bg-black">

                <Scene3D sceneUrl={SCENE_URL} onLoad={handleSceneLoad} />

                <BackgroundSystem values={values} activeSection={activeSection} />

                <Header onReset={handleReset} />

                <SectionOverlay activeSection={activeSection} />

                <ScrollNav activeSection={activeSection} onDotClick={handleDotClick} />

                <ControlPanel
                  values={values}
                  update={update}
                  reset={reset}
                  score={score}
                  dominant={dominant}
                />

                <InsightEngine scores={scores} insight={insight} />

                {/* Progress bar */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
                  style={{ background: 'rgba(255,255,255,0.06)' }}
                >
                  <motion.div
                    className="h-full"
                    style={{
                      width: progressWidth,
                      background: `linear-gradient(to right, ${activeAccent}, ${activeAccent}99)`,
                    }}
                  />
                </div>

                {/* Scroll hint */}
                <AnimatePresence>
                  {!hasScrolled && !activeStep && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ delay: 0.6, duration: 0.6 }}
                      className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 pointer-events-none"
                    >
                      <span className="text-[10px] text-white/25 tracking-[0.2em] uppercase font-medium">
                        Scroll to explore
                      </span>
                      <motion.div
                        animate={{ y: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                          <path d="M8 3v10M4 9l4 4 4-4" stroke="rgba(255,255,255,0.25)"
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

      {/* Narrative overlay + completion badge (outside scroll container → stays fixed) */}
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
