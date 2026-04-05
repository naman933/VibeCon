import { motion, AnimatePresence } from 'framer-motion'

/**
 * BackgroundSystem — all ambient rendering in one place.
 *
 * Performance rules:
 *  - Gradient divs: static background CSS, only opacity animated → compositor-only
 *  - Pulse rings:   scale + opacity → compositor-only, no layout
 *  - Cost grid:     static backgroundImage, opacity animated → compositor-only
 *  - Nothing here triggers layout or paint on every frame.
 */

// Power curve → subtle at mid, dramatic at high.  50→0.28  75→0.53  100→0.85
const curve = (v) => Math.pow(v / 100, 1.8) * 0.85

// Section base gradients (scroll-driven)
const SECTION_GRADIENTS = [
  'radial-gradient(ellipse 90% 60% at 15% 100%, rgba(99,102,241,0.22) 0%, transparent 65%)',
  'radial-gradient(ellipse 90% 60% at 85% 100%, rgba(168,85,247,0.22) 0%, transparent 65%)',
  'radial-gradient(ellipse 90% 60% at 50% 80%,  rgba(16,185,129,0.18) 0%, transparent 65%)',
]

// Single expanding ring — scale + opacity only, fully GPU composited
function PulseRing({ cx, cy, color, delay, size = 320 }) {
  return (
    <motion.span
      style={{
        position: 'absolute',
        left: cx, top: cy,
        width: size, height: size,
        marginLeft: -size / 2, marginTop: -size / 2,
        borderRadius: '50%',
        border: `1px solid ${color}`,
        display: 'block',
        pointerEvents: 'none',
      }}
      animate={{ scale: [0.15, 3.0], opacity: [0.65, 0] }}
      transition={{
        duration: 3.8,
        repeat: Infinity,
        ease: [0.2, 0, 0.8, 1],
        delay,
      }}
    />
  )
}

export default function BackgroundSystem({ values, activeSection }) {
  const speedOp   = curve(values.speed)
  const costOp    = curve(values.cost) * 0.6
  const sustainOp = curve(values.sustainability)

  const t = { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }

  const showSpeedRings   = values.speed > 58
  const showSustainRings = values.sustainability > 58
  const showCostGrid     = values.cost > 58

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">

      {/* ── 1. Section gradient (scroll-driven crossfade) ─────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: 'easeInOut' }}
          className="absolute inset-0"
          style={{ background: SECTION_GRADIENTS[activeSection] }}
        />
      </AnimatePresence>

      {/* ── 2. Speed: electric indigo/violet from top-right + accent bottom-left ── */}
      <motion.div
        className="absolute inset-0"
        animate={{ opacity: speedOp }}
        transition={t}
        style={{
          background: [
            'radial-gradient(ellipse 120% 75% at 100% 0%,   rgba(79,70,229,0.75)  0%, transparent 48%)',
            'radial-gradient(ellipse  55% 45% at   0% 100%, rgba(139,92,246,0.42) 0%, transparent 45%)',
          ].join(', '),
        }}
      />

      {/* ── 3. Speed pulse rings — top-right corner ─────────────────────────── */}
      <AnimatePresence>
        {showSpeedRings && (
          <motion.div
            key="speed-rings"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
          >
            <PulseRing cx="92%" cy="6%"  color="rgba(99,102,241,0.9)"  delay={0}   size={280} />
            <PulseRing cx="92%" cy="6%"  color="rgba(139,92,246,0.7)"  delay={1.3} size={280} />
            <PulseRing cx="92%" cy="6%"  color="rgba(99,102,241,0.5)"  delay={2.6} size={280} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 4. Cost efficiency: clean slate/silver center bloom ─────────────── */}
      <motion.div
        className="absolute inset-0"
        animate={{ opacity: costOp }}
        transition={t}
        style={{
          background: [
            'radial-gradient(ellipse 75% 50% at 50% 50%, rgba(148,163,184,0.16) 0%, transparent 62%)',
            'radial-gradient(ellipse 100% 25% at 50% 100%, rgba(203,213,225,0.07) 0%, transparent 50%)',
          ].join(', '),
        }}
      />

      {/* ── 5. Cost grid: structured grid overlay — "precision, nothing wasted" ── */}
      <AnimatePresence>
        {showCostGrid && (
          <motion.div
            key="cost-grid"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: costOp * 0.11 }}
            exit={{ opacity: 0 }}
            transition={t}
            style={{
              backgroundImage: [
                'linear-gradient(rgba(148,163,184,0.45) 1px, transparent 1px)',
                'linear-gradient(90deg, rgba(148,163,184,0.45) 1px, transparent 1px)',
              ].join(', '),
              backgroundSize: '64px 64px',
            }}
          />
        )}
      </AnimatePresence>

      {/* ── 6. Sustainability: organic emerald from bottom-left + teal top-right ── */}
      <motion.div
        className="absolute inset-0"
        animate={{ opacity: sustainOp }}
        transition={t}
        style={{
          background: [
            'radial-gradient(ellipse 120% 75% at   0% 100%, rgba(5,150,105,0.68)  0%, transparent 48%)',
            'radial-gradient(ellipse  55% 45% at 100%   0%, rgba(52,211,153,0.32) 0%, transparent 45%)',
          ].join(', '),
        }}
      />

      {/* ── 7. Sustainability pulse rings — bottom-left corner ───────────────── */}
      <AnimatePresence>
        {showSustainRings && (
          <motion.div
            key="sustain-rings"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
          >
            <PulseRing cx="8%"  cy="94%" color="rgba(16,185,129,0.9)"  delay={0}   size={280} />
            <PulseRing cx="8%"  cy="94%" color="rgba(52,211,153,0.65)" delay={1.4} size={280} />
            <PulseRing cx="8%"  cy="94%" color="rgba(16,185,129,0.45)" delay={2.8} size={280} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 8. Scanlines: ultra-subtle horizontal texture ────────────────────── */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.009) 3px, rgba(255,255,255,0.009) 4px)',
        }}
      />

      {/* ── 9. Bottom vignette: keeps section text legible ───────────────────── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.22) 36%, transparent 66%)',
        }}
      />
    </div>
  )
}
