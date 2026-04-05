import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion'

// ── Animated counter ──────────────────────────────────────────────────────────
function Count({ value, prefix = '', suffix = '' }) {
  const spring  = useSpring(value, { stiffness: 60, damping: 18 })
  const display = useTransform(spring, v => `${prefix}${Math.round(v)}${suffix}`)
  useEffect(() => { spring.set(value) }, [value, spring])
  return <motion.span>{display}</motion.span>
}

function CountFloat({ value, decimals = 1, prefix = '', suffix = '' }) {
  const spring  = useSpring(value, { stiffness: 60, damping: 18 })
  const display = useTransform(spring, v => `${prefix}${v.toFixed(decimals)}${suffix}`)
  useEffect(() => { spring.set(value) }, [value, spring])
  return <motion.span>{display}</motion.span>
}

// ── Comparison bar (vs industry baseline at 50) ───────────────────────────────
function CompareBar({ value, color, invert = false }) {
  // bar is centred at 50%; left half = below avg, right half = above avg
  const pct   = Math.round(value)
  const above = pct >= 50
  const width = Math.abs(pct - 50) // 0–50
  const left  = above ? 50 : pct

  return (
    <div className="relative h-1 w-full rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }}>
      {/* Baseline tick */}
      <div className="absolute top-0 bottom-0 w-px bg-white/20" style={{ left: '50%' }} />
      {/* Filled region */}
      <motion.div
        className="absolute top-0 bottom-0 rounded-full"
        animate={{ left: `${left}%`, width: `${width}%`, background: above ? color : '#ef4444' }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      />
    </div>
  )
}

// ── Live dot ─────────────────────────────────────────────────────────────────
function LiveDot() {
  return (
    <span className="relative flex h-2 w-2 flex-shrink-0">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
    </span>
  )
}

// ── Impact card ───────────────────────────────────────────────────────────────
function ImpactCard({ config, score }) {
  const { color, icon, label, primary, unit, analogy, analogyIcon, score: scoreVal, compareLabel } = config

  const isPositive = scoreVal >= 50

  return (
    <motion.div
      layout
      className="rounded-xl p-3.5 flex flex-col gap-2.5"
      style={{
        background: `${color}0a`,
        border: `1px solid ${color}22`,
      }}
    >
      {/* Top row: icon + label + pill */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base leading-none">{icon}</span>
          <span className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color }}>
            {label}
          </span>
        </div>
        <span
          className="text-[9px] font-semibold px-2 py-0.5 rounded-full"
          style={{
            color: isPositive ? color : '#ef4444',
            background: isPositive ? `${color}15` : 'rgba(239,68,68,0.12)',
            border: `1px solid ${isPositive ? color + '30' : 'rgba(239,68,68,0.25)'}`,
          }}
        >
          {isPositive ? '▲' : '▼'} {isPositive ? 'Above avg' : 'Below avg'}
        </span>
      </div>

      {/* Primary metric — big number */}
      <div className="flex items-end gap-1.5 leading-none">
        <span className="text-3xl font-bold text-white tabular-nums tracking-tight">
          {primary}
        </span>
        <span className="text-xs text-white/40 mb-0.5 font-medium">{unit}</span>
      </div>

      {/* vs industry bar */}
      <div className="flex flex-col gap-1">
        <CompareBar value={scoreVal} color={color} />
        <div className="flex justify-between">
          <span className="text-[9px] text-white/25">Worst</span>
          <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.35)' }}>{compareLabel}</span>
          <span className="text-[9px] text-white/25">Best</span>
        </div>
      </div>

      {/* Analogy line */}
      <div
        className="flex items-start gap-1.5 rounded-lg px-2.5 py-2"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <span className="text-sm leading-none flex-shrink-0 mt-px">{analogyIcon}</span>
        <p className="text-[10px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
          {analogy}
        </p>
      </div>
    </motion.div>
  )
}

// ── Main panel ────────────────────────────────────────────────────────────────
export default function InsightEngine({ scores, insight, impacts }) {
  const [open, setOpen] = useState(true)

  const { satisfaction, costHealth, envImpact } = scores
  const { satisfaction: sat, cost, env }         = impacts

  const overall      = Math.round((satisfaction + costHealth + envImpact) / 3)
  const overallColor = overall >= 65 ? '#10b981' : overall >= 40 ? '#6366f1' : '#f59e0b'
  const glowAlpha    = Math.round((overall / 100) * 44).toString(16).padStart(2, '0')

  // Build live impact configs with animated values baked in as JSX
  const cards = [
    {
      color:       '#6366f1',
      icon:        '😊',
      label:       'Customer Satisfaction',
      primary:     <Count value={sat.recommends * 10} suffix="%" />,
      unit:        'would recommend',
      scoreVal:    satisfaction,
      compareLabel: 'vs industry 50%',
      analogyIcon: '🗣️',
      analogy:     <>Like <Count value={sat.repeatRate} suffix="%" /> of customers returning for a second order — every month, automatically.</>,
    },
    {
      color:       '#a855f7',
      icon:        '💰',
      label:       'Cost Efficiency',
      primary:     cost.savingsPerK >= 0
        ? <><span style={{ fontSize: '0.7em', opacity: 0.6 }}>+$</span><Count value={cost.savingsPerK} /></>
        : <><span style={{ fontSize: '0.7em', color: '#ef4444' }}>−$</span><Count value={Math.abs(cost.savingsPerK)} /></>,
      unit:        'saved per 1,000 orders',
      scoreVal:    costHealth,
      compareLabel: 'vs industry avg',
      analogyIcon: '🧑‍💼',
      analogy:     cost.savingsPerK >= 0
        ? <>That's <Count value={cost.staffHours} suffix=" hrs" /> of skilled labour freed up every month at 10k order volume.</>
        : <>At this pace, overspend equals <Count value={cost.staffHours} suffix=" hrs" /> of wasted operational budget monthly.</>,
    },
    {
      color:       '#10b981',
      icon:        '🌿',
      label:       'Environmental Impact',
      primary:     env.co2Delta <= 0
        ? <><span style={{ fontSize: '0.7em', opacity: 0.6 }}>−</span><Count value={Math.abs(env.co2Delta * 100)} /></>
        : <><span style={{ fontSize: '0.7em', color: '#ef4444' }}>+</span><Count value={env.co2Delta * 100} /></>,
      unit:        'kg CO₂ per 100 deliveries',
      scoreVal:    envImpact,
      compareLabel: 'vs carbon baseline',
      analogyIcon: env.co2Delta <= 0 ? '🌳' : '🚗',
      analogy:     env.co2Delta <= 0
        ? <>Equivalent to planting <Count value={env.treesPerMonth} suffix=" trees" /> every month — or taking <Count value={Math.round(env.carKm / 100)} suffix=" cars" /> off the road.</>
        : <>This configuration generates the same emissions as driving <Count value={env.carKm} suffix=" km" /> extra per 100 deliveries.</>,
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.0, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="sim-panel fixed bottom-6 right-6 lg:bottom-8 lg:right-10 z-50"
      style={{ width: 300, fontFamily: 'Inter, sans-serif' }}
    >
      <div>
        <motion.div
          className="rounded-2xl overflow-hidden"
          animate={{ boxShadow: `0 20px 60px rgba(0,0,0,0.6), 0 0 0 0.5px rgba(255,255,255,0.06), 0 0 36px ${overallColor}${glowAlpha}` }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          style={{
            position: 'relative',
            background: 'rgba(8,8,14,0.80)',
            backdropFilter: 'blur(22px)',
            WebkitBackdropFilter: 'blur(22px)',
            border: '1px solid rgba(255,255,255,0.09)',
          }}
        >
          {/* Top accent sweep */}
          <motion.div
            key={overallColor}
            initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-0 left-0 right-0 h-px"
            style={{ background: `linear-gradient(to right, transparent, ${overallColor}88, transparent)`, transformOrigin: 'left' }}
          />

          {/* Header */}
          <button
            onClick={() => setOpen(v => !v)}
            className="w-full flex items-center justify-between px-4 py-3 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <LiveDot />
              <span className="text-sm font-semibold text-white">Real-World Impact</span>
            </div>
            <div className="flex items-center gap-2">
              {/* Overall score pill */}
              <div
                className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                style={{ background: `${overallColor}16`, border: `1px solid ${overallColor}30` }}
              >
                <span className="text-[10px] font-bold tabular-nums" style={{ color: overallColor }}>
                  <Count value={overall} />
                </span>
                <span className="text-[9px] text-white/30">/100</span>
              </div>
              <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}>
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                  <path d="M4 6l4 4 4-4" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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

                  {/* 3 impact cards */}
                  <div className="px-3 pt-3 pb-2 flex flex-col gap-2">
                    {cards.map((c, i) => <ImpactCard key={i} config={c} />)}
                  </div>

                  {/* Insight sentence */}
                  <div className="mx-3 mb-3 rounded-xl px-3 py-2.5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={insight}
                        initial={{ opacity: 0, y: 4, filter: 'blur(4px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: -4, filter: 'blur(4px)' }}
                        transition={{ duration: 0.4 }}
                        className="text-[10px] leading-relaxed"
                        style={{ color: 'rgba(255,255,255,0.4)' }}
                      >
                        <span className="font-bold" style={{ color: overallColor }}>↳ </span>
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
