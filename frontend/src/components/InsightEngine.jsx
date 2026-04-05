import { useState } from 'react'
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion'

// ── Helpers ───────────────────────────────────────────────────────────────────
function scoreColor(v) {
  if (v >= 70) return '#10b981'
  if (v >= 45) return '#6366f1'
  if (v >= 25) return '#f59e0b'
  return '#ef4444'
}

function scoreLabel(v) {
  if (v >= 70) return 'Excellent'
  if (v >= 45) return 'Good'
  if (v >= 25) return 'Moderate'
  return 'Critical'
}

function AnimatedNumber({ value }) {
  const spring  = useSpring(value, { stiffness: 80, damping: 20 })
  const display = useTransform(spring, v => String(Math.round(v)))
  return <motion.span>{display}</motion.span>
}

// ── Metric row with glowing bar ───────────────────────────────────────────────
const METRIC_META = {
  satisfaction: { label: 'Customer Satisfaction', icon: '😊' },
  costHealth:   { label: 'Cost Health',            icon: '💰' },
  envImpact:    { label: 'Eco Score',              icon: '🌿' },
}

function MetricRow({ metricKey, value }) {
  const { label, icon } = METRIC_META[metricKey]
  const color  = scoreColor(value)
  const status = scoreLabel(value)

  // Glow intensity on the bar grows when score is high
  const barGlow = value > 55 ? `0 0 ${Math.round((value - 55) * 0.18)}px ${color}99` : 'none'

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-sm leading-none">{icon}</span>
          <span className="text-xs font-medium text-white/60">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <motion.span
            key={status}
            initial={{ opacity: 0, y: -3 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
            style={{ color, background: `${color}18`, border: `1px solid ${color}30` }}
          >
            {status}
          </motion.span>
          <span className="text-sm font-bold tabular-nums text-white" style={{ minWidth: 26, textAlign: 'right' }}>
            <AnimatedNumber value={value} />
          </span>
        </div>
      </div>

      {/* Bar track */}
      <div
        className="h-1 w-full rounded-full overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.07)' }}
      >
        <motion.div
          className="h-full rounded-full"
          animate={{
            width: `${value}%`,
            background: color,
            boxShadow: barGlow,
          }}
          transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
        />
      </div>
    </div>
  )
}

// ── Live pinging dot ──────────────────────────────────────────────────────────
function LiveDot() {
  return (
    <span className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
    </span>
  )
}

// ── Panel ─────────────────────────────────────────────────────────────────────
export default function InsightEngine({ scores, insight }) {
  const [open, setOpen] = useState(true)

  const { satisfaction, costHealth, envImpact } = scores
  const overall      = Math.round((satisfaction + costHealth + envImpact) / 3)
  const overallColor = scoreColor(overall)

  // Panel glow scales with overall health
  const glowSize  = Math.round(20 + (overall / 100) * 40)
  const glowAlpha = Math.round((overall / 100) * 48).toString(16).padStart(2, '0')

  return (
    // Outer: mount slide-up animation
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.0, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="sim-panel fixed bottom-6 right-10 lg:bottom-8 lg:right-14 z-50 w-[280px] lg:w-[300px]"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      <div>
        <motion.div
          className="rounded-2xl overflow-hidden"
          animate={{
            boxShadow: `0 20px 60px rgba(0,0,0,0.55), 0 0 0 0.5px rgba(255,255,255,0.06), 0 0 ${glowSize}px ${overallColor}${glowAlpha}`,
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
          {/* Accent line */}
          <motion.div
            key={overallColor}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-0 left-0 right-0 h-px"
            style={{
              background: `linear-gradient(to right, transparent, ${overallColor}90, transparent)`,
              transformOrigin: 'left',
            }}
          />

          {/* Header */}
          <button
            onClick={() => setOpen(v => !v)}
            className="w-full flex items-center justify-between px-4 py-3.5 cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <LiveDot />
              <span className="text-sm font-semibold text-white">Insight Engine</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-bold tabular-nums" style={{ color: overallColor }}>
                <AnimatedNumber value={overall} />
              </span>
              <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3 }}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M4 6l4 4 4-4" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.div>
            </div>
          </button>

          {/* Body */}
          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="px-4 pt-4 pb-3 flex flex-col gap-4">
                    <MetricRow metricKey="satisfaction" value={satisfaction} />
                    <MetricRow metricKey="costHealth"   value={costHealth} />
                    <MetricRow metricKey="envImpact"    value={envImpact} />
                  </div>

                  <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '0 16px' }} />

                  {/* Insight sentence */}
                  <div className="px-4 py-3.5">
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={insight}
                        initial={{ opacity: 0, y: 6, filter: 'blur(4px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: -4, filter: 'blur(4px)' }}
                        transition={{ duration: 0.45, ease: 'easeOut' }}
                        className="text-xs leading-relaxed"
                        style={{ color: 'rgba(255,255,255,0.45)' }}
                      >
                        <span className="font-semibold" style={{ color: overallColor }}>
                          AI Insight —{' '}
                        </span>
                        {insight}
                      </motion.p>
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  )
}
