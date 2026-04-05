import { useState, useId } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SLIDER_META } from '@/hooks/useSimulator'

// ── Icons ────────────────────────────────────────────────────────────────────
function Icon({ name, color }) {
  const paths = {
    speed: (
      <path
        d="M13 2L4.09 12.44A1 1 0 0 0 5 14h6l-2 8 8.91-10.44A1 1 0 0 0 17 10h-6l2-8z"
        stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"
      />
    ),
    cost: (
      <>
        <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.4" fill="none" />
        <path
          d="M12 7v10M9.5 9.5c0-1.4 1.1-2.5 2.5-2.5s2.5 1.1 2.5 2.5c0 3-5 3-5 6 0 1.4 1.1 2.5 2.5 2.5s2.5-1.1 2.5-2.5"
          stroke={color} strokeWidth="1.4" strokeLinecap="round" fill="none"
        />
      </>
    ),
    leaf: (
      <path
        d="M21 3C21 3 14 3 9 8s-3 12-3 12 7 0 12-5 3-12 3-12zM3 21l9-9"
        stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"
      />
    ),
  }
  return <svg width="16" height="16" viewBox="0 0 24 24">{paths[name]}</svg>
}

// ── Score ring with glow ──────────────────────────────────────────────────────
function ScoreRing({ score, color }) {
  const r    = 20
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ

  return (
    <svg width="56" height="56" viewBox="0 0 56 56" style={{ overflow: 'visible' }}>
      {/* Track */}
      <circle cx="28" cy="28" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />

      {/* Glow blur ring (behind main arc) */}
      <motion.circle
        cx="28" cy="28" r={r}
        fill="none"
        stroke={color}
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={circ}
        animate={{ strokeDashoffset: circ - dash, opacity: score > 30 ? 0.35 : 0 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        transform="rotate(-90 28 28)"
        style={{ filter: 'blur(5px)' }}
      />

      {/* Main arc */}
      <motion.circle
        cx="28" cy="28" r={r}
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={circ}
        animate={{ strokeDashoffset: circ - dash }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        transform="rotate(-90 28 28)"
      />

      <text x="28" y="32" textAnchor="middle" fill="white" fontSize="13" fontWeight="700">
        {score}
      </text>
    </svg>
  )
}

// ── Single slider row ─────────────────────────────────────────────────────────
function SliderRow({ sliderKey, value, onChange }) {
  const id   = useId()
  const meta = SLIDER_META[sliderKey]
  const label = value < 33 ? meta.low : value < 67 ? meta.mid : meta.high

  const trackStyle = {
    background: `linear-gradient(to right, ${meta.color} 0%, ${meta.color} ${value}%, rgba(255,255,255,0.08) ${value}%, rgba(255,255,255,0.08) 100%)`,
  }

  const thumbStyle = {
    '--thumb-color': meta.color,
    '--thumb-shadow': `0 0 ${value > 60 ? 10 : 6}px ${meta.color}${value > 60 ? 'aa' : '60'}`,
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name={meta.icon} color={meta.color} />
          <label htmlFor={id} className="text-xs font-semibold text-white/80 cursor-pointer">
            {meta.label}
          </label>
        </div>
        <div className="flex items-center gap-2">
          <motion.span
            key={label}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] font-medium tracking-wide px-2 py-0.5 rounded-full"
            style={{ color: meta.color, background: `${meta.color}18`, border: `1px solid ${meta.color}30` }}
          >
            {label}
          </motion.span>
          <span className="text-xs font-bold tabular-nums" style={{ color: meta.color, minWidth: 28, textAlign: 'right' }}>
            {value}
          </span>
        </div>
      </div>

      <input
        id={id}
        type="range"
        min="0" max="100"
        value={value}
        onChange={e => onChange(sliderKey, e.target.value)}
        className="slider w-full"
        style={{ ...trackStyle, ...thumbStyle }}
      />
    </div>
  )
}

// ── Panel ─────────────────────────────────────────────────────────────────────
export default function ControlPanel({ values, update, reset, score, dominant }) {
  const [open, setOpen] = useState(true)

  const dominantColor    = SLIDER_META[dominant].color
  const dominantIntensity = values[dominant] / 100
  const glowSize          = Math.round(24 + dominantIntensity * 36)
  const glowAlpha         = Math.round(dominantIntensity * 52).toString(16).padStart(2, '0')

  return (
    // Outer: mount slide-up animation
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2.2, duration: 0.65, ease: [0.25, 0.1, 0.25, 1] }}
      className="sim-panel fixed bottom-6 left-6 lg:bottom-8 lg:left-8 z-50 w-[290px] lg:w-[310px]"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      {/* Inner: continuous float bob */}
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut', delay: 1.0 }}
      >
        <motion.div
          className="rounded-2xl overflow-hidden"
          animate={{
            boxShadow: `0 20px 60px rgba(0,0,0,0.55), 0 0 0 0.5px rgba(255,255,255,0.06), 0 0 ${glowSize}px ${dominantColor}${glowAlpha}`,
          }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          style={{
            position: 'relative',
            background: 'rgba(8, 8, 12, 0.72)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.09)',
          }}
        >
          {/* Accent line — reanimates whenever dominant color changes */}
          <motion.div
            key={dominantColor}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-0 left-0 right-0 h-px"
            style={{
              background: `linear-gradient(to right, transparent, ${dominantColor}90, transparent)`,
              transformOrigin: 'left',
            }}
          />

          {/* Header */}
          <button
            onClick={() => setOpen(v => !v)}
            className="w-full flex items-center justify-between px-4 py-3.5 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <ScoreRing score={score} color={dominantColor} />
              <div className="text-left">
                <p className="text-xs text-white/40 font-medium">Overall Score</p>
                <p className="text-sm font-semibold text-white">Decision Parameters</p>
              </div>
            </div>
            <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3 }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 6l4 4 4-4" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.div>
          </button>

          {/* Sliders */}
          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
                style={{ overflow: 'hidden' }}
              >
                <div
                  className="px-4 pb-4 flex flex-col gap-5"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <div className="pt-4 flex flex-col gap-5">
                    {Object.keys(values).map(key => (
                      <SliderRow
                        key={key}
                        sliderKey={key}
                        value={values[key]}
                        onChange={update}
                      />
                    ))}
                  </div>

                  <button
                    onClick={reset}
                    className="w-full py-2 rounded-xl text-xs font-semibold text-white/35 hover:text-white/60 transition-colors cursor-pointer"
                    style={{ border: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    Reset to defaults
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
