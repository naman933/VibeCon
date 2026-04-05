import { motion, AnimatePresence } from 'framer-motion'
import { STEPS } from '@/hooks/useNarrative'

// ── Position map ─────────────────────────────────────────────────────────────
const POSITIONS = {
  'center': {
    style: {
      position: 'fixed',
      top: '50%', left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 60,
    },
    origin: 'scale',
  },
  'center-low': {
    style: {
      position: 'fixed',
      bottom: '160px', left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 60,
    },
    origin: 'bottom',
  },
  'left': {
    style: {
      position: 'fixed',
      bottom: '280px', left: '32px',
      zIndex: 60,
    },
    origin: 'bottom-left',
  },
  'right': {
    style: {
      position: 'fixed',
      bottom: '280px', right: '56px',
      zIndex: 60,
    },
    origin: 'bottom-right',
  },
}

// Arrow pointer SVG based on direction
function Pointer({ dir }) {
  if (!dir) return null
  const map = {
    'bottom':       { rotate: '0deg',    offset: { bottom: -20, left: '50%', marginLeft: -10 } },
    'bottom-left':  { rotate: '-30deg',  offset: { bottom: -20, left: 24 } },
    'bottom-right': { rotate: '30deg',   offset: { bottom: -20, right: 24 } },
  }
  const cfg = map[dir]
  if (!cfg) return null

  return (
    <motion.div
      animate={{ y: [0, 5, 0] }}
      transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        position: 'absolute',
        ...cfg.offset,
        transform: `rotate(${cfg.rotate})`,
      }}
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 2v12M5 9l5 7 5-7" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5"
          strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </motion.div>
  )
}

// Step dots row
function StepDots({ current }) {
  return (
    <div className="flex items-center gap-1.5">
      {STEPS.filter(s => s.step !== null).map((_, i) => {
        const realIndex = i + 1 // steps 1-3
        const active = current === realIndex
        const done   = current > realIndex
        return (
          <motion.span
            key={i}
            animate={{
              width:   active ? 18 : 6,
              opacity: done ? 0.3 : 1,
              background: active ? '#6366f1' : done ? '#4b5563' : 'rgba(255,255,255,0.25)',
            }}
            transition={{ duration: 0.3 }}
            style={{ height: 6, borderRadius: 99, display: 'block' }}
          />
        )
      })}
    </div>
  )
}

// ── Main card ─────────────────────────────────────────────────────────────────
const cardVariants = {
  hidden:  { opacity: 0, scale: 0.92, y: 12, filter: 'blur(6px)' },
  visible: { opacity: 1, scale: 1,    y: 0,  filter: 'blur(0px)' },
  exit:    { opacity: 0, scale: 0.95, y: -8, filter: 'blur(4px)' },
}

export default function NarrativeOverlay({ activeStep, stepIndex, onAdvance, onDismiss }) {
  const isIntro = activeStep?.id === 'intro'
  const pos     = POSITIONS[activeStep?.position ?? 'center']

  return (
    <AnimatePresence mode="wait">
      {activeStep && (
        <>
          {/* Backdrop for intro only */}
          {isIntro && (
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="fixed inset-0 z-50"
              style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(2px)' }}
            />
          )}

          <motion.div
            key={activeStep.id}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            style={{
              ...pos.style,
              width: isIntro ? 400 : 320,
              fontFamily: 'Inter, sans-serif',
            }}
          >
            <div
              className="relative rounded-2xl overflow-visible"
              style={{
                background: 'rgba(9, 9, 14, 0.82)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 0 0.5px rgba(255,255,255,0.05)',
              }}
            >
              {/* Top accent bar */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.15, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="absolute top-0 left-0 right-0 h-px rounded-t-2xl"
                style={{
                  background: 'linear-gradient(to right, transparent, rgba(99,102,241,0.8), transparent)',
                  transformOrigin: 'left',
                }}
              />

              <div className="p-6 flex flex-col gap-4">

                {/* Header row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {activeStep.step && (
                      <span
                        className="text-[10px] font-bold uppercase tracking-[0.18em] px-2 py-0.5 rounded-full"
                        style={{
                          color: '#6366f1',
                          background: 'rgba(99,102,241,0.14)',
                          border: '1px solid rgba(99,102,241,0.3)',
                        }}
                      >
                        {activeStep.step}
                      </span>
                    )}
                    {!activeStep.step && (
                      <motion.span
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-1.5 h-1.5 rounded-full bg-indigo-400 inline-block"
                      />
                    )}
                  </div>

                  {/* Dismiss × */}
                  <button
                    onClick={onDismiss}
                    className="text-white/20 hover:text-white/50 transition-colors cursor-pointer text-lg leading-none"
                  >
                    ×
                  </button>
                </div>

                {/* Title */}
                <div>
                  <h3 className="text-base font-bold text-white mb-1.5 leading-snug">
                    {activeStep.title}
                  </h3>
                  <p className="text-sm text-white/50 leading-relaxed">
                    {activeStep.body}
                  </p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-1">
                  {activeStep.step
                    ? <StepDots current={stepIndex} />
                    : <span />
                  }

                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={onAdvance}
                    className="px-4 py-1.5 rounded-full text-xs font-semibold text-white cursor-pointer"
                    style={{
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      boxShadow: '0 0 16px rgba(99,102,241,0.35)',
                    }}
                  >
                    {activeStep.cta}
                  </motion.button>
                </div>
              </div>

              {/* Pointer arrow */}
              <Pointer dir={activeStep.pointer} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
