import { useRef, useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ── Triangle geometry ─────────────────────────────────────────────────────────
const W = 260   // SVG canvas width
const H = 234   // SVG canvas height  (equilateral: H = W * √3/2)
const PAD = 28  // vertex padding

const V = {
  speed:          { x: W / 2,       y: PAD },
  cost:           { x: PAD,         y: H - PAD },
  sustainability: { x: W - PAD,     y: H - PAD },
}

const CENTROID = {
  x: (V.speed.x + V.cost.x + V.sustainability.x) / 3,
  y: (V.speed.y + V.cost.y + V.sustainability.y) / 3,
}

const META = {
  speed:          { label: 'Speed',          color: '#6366f1', icon: '⚡' },
  cost:           { label: 'Cost',           color: '#a855f7', icon: '◈' },
  sustainability: { label: 'Sustainability', color: '#10b981', icon: '◉' },
}

// ── Barycentric helpers ───────────────────────────────────────────────────────
function toBary(P) {
  const A = V.speed, B = V.cost, C = V.sustainability
  const d = (B.y - C.y) * (A.x - C.x) + (C.x - B.x) * (A.y - C.y)
  const l1 = ((B.y - C.y) * (P.x - C.x) + (C.x - B.x) * (P.y - C.y)) / d
  const l2 = ((C.y - A.y) * (P.x - C.x) + (A.x - C.x) * (P.y - C.y)) / d
  const l3 = 1 - l1 - l2
  return [l1, l2, l3]
}

function clamp(P) {
  const [l1, l2, l3] = toBary(P)
  if (l1 >= 0 && l2 >= 0 && l3 >= 0) return P
  const cl1 = Math.max(0, l1)
  const cl2 = Math.max(0, l2)
  const cl3 = Math.max(0, l3)
  const s = cl1 + cl2 + cl3 || 1
  const A = V.speed, B = V.cost, C = V.sustainability
  return {
    x: (cl1 / s) * A.x + (cl2 / s) * B.x + (cl3 / s) * C.x,
    y: (cl1 / s) * A.y + (cl2 / s) * B.y + (cl3 / s) * C.y,
  }
}

function baryToValues(P) {
  const [l1, l2, l3] = toBary(P)
  const s = Math.max(l1, 0) + Math.max(l2, 0) + Math.max(l3, 0) || 1
  return {
    speed:          Math.round((Math.max(l1, 0) / s) * 100),
    cost:           Math.round((Math.max(l2, 0) / s) * 100),
    sustainability: Math.round((Math.max(l3, 0) / s) * 100),
  }
}

const TRI_POINTS = `${V.speed.x},${V.speed.y} ${V.cost.x},${V.cost.y} ${V.sustainability.x},${V.sustainability.y}`

// ── Score ring ────────────────────────────────────────────────────────────────
function ScoreRing({ score, color }) {
  const r = 16, circ = 2 * Math.PI * r, dash = (score / 100) * circ
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" style={{ overflow: 'visible' }}>
      <circle cx="22" cy="22" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2.5" />
      <motion.circle cx="22" cy="22" r={r} fill="none" stroke={color} strokeWidth="2.5"
        strokeLinecap="round" strokeDasharray={circ}
        animate={{ strokeDashoffset: circ - dash }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        transform="rotate(-90 22 22)" />
      <text x="22" y="26" textAnchor="middle" fill="white" fontSize="11" fontWeight="700">{score}</text>
    </svg>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function TradeoffControl({ values, update, reset, score, dominant }) {
  const svgRef     = useRef(null)
  const dragging   = useRef(false)
  const [puck, setPuck]     = useState(CENTROID)
  const [active, setActive] = useState(null)  // hovered vertex key

  const dominantColor = META[dominant]?.color ?? '#6366f1'

  // Derive values → puck on external reset (e.g. header Reset button)
  // If all values equal 50 it means reset was called → snap puck to centroid
  useEffect(() => {
    if (values.speed === 50 && values.cost === 50 && values.sustainability === 50) {
      setPuck(CENTROID)
    }
  }, [values.speed, values.cost, values.sustainability])

  const applyPos = useCallback((raw) => {
    const clamped = clamp(raw)
    setPuck(clamped)
    const v = baryToValues(clamped)
    update('speed',          v.speed)
    update('cost',           v.cost)
    update('sustainability', v.sustainability)
  }, [update])

  const getSVGPos = useCallback((e) => {
    const rect = svgRef.current.getBoundingClientRect()
    const src  = e.touches ? e.touches[0] : e
    return {
      x: (src.clientX - rect.left)  * (W / rect.width),
      y: (src.clientY - rect.top)   * (H / rect.height),
    }
  }, [])

  const onDown  = useCallback((e) => { dragging.current = true; applyPos(getSVGPos(e)) }, [applyPos, getSVGPos])
  const onMove  = useCallback((e) => { if (!dragging.current) return; e.preventDefault(); applyPos(getSVGPos(e)) }, [applyPos, getSVGPos])
  const onUp    = useCallback(() => { dragging.current = false }, [])

  useEffect(() => {
    window.addEventListener('mouseup',   onUp)
    window.addEventListener('touchend',  onUp)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('touchmove', onMove, { passive: false })
    return () => {
      window.removeEventListener('mouseup',   onUp)
      window.removeEventListener('touchend',  onUp)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('touchmove', onMove)
    }
  }, [onUp, onMove])

  const handleReset = () => {
    setPuck(CENTROID)
    reset()
  }

  // Per-corner line opacity = how close puck is to that corner
  const [l1, l2, l3] = toBary(puck)
  const bary = [Math.max(0,l1), Math.max(0,l2), Math.max(0,l3)]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="sim-panel fixed bottom-6 left-6 lg:bottom-8 lg:left-8 z-50"
      style={{ width: 300, fontFamily: 'Inter, sans-serif' }}
    >
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(8,8,14,0.78)',
          backdropFilter: 'blur(22px)',
          WebkitBackdropFilter: 'blur(22px)',
          border: '1px solid rgba(255,255,255,0.09)',
          boxShadow: `0 20px 60px rgba(0,0,0,0.6), 0 0 40px ${dominantColor}22`,
        }}
      >
        {/* Accent top-line */}
        <motion.div
          key={dominantColor}
          initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: `linear-gradient(to right, transparent, ${dominantColor}90, transparent)`, transformOrigin: 'left' }}
        />

        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div className="flex items-center gap-2.5">
            <ScoreRing score={score} color={dominantColor} />
            <div>
              <p className="text-[10px] text-white/35 font-medium uppercase tracking-wide">Decision Control</p>
              <p className="text-sm font-semibold text-white leading-tight">Drag to trade off</p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="text-[10px] text-white/25 hover:text-white/50 transition-colors cursor-pointer flex items-center gap-1"
          >
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
              <path d="M2 8a6 6 0 1 1 1.5 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              <path d="M2 5v3h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Balance
          </button>
        </div>

        {/* Triangle SVG */}
        <div className="px-4 pb-3 flex justify-center select-none">
          <svg
            ref={svgRef}
            width={W} height={H}
            viewBox={`0 0 ${W} ${H}`}
            style={{ cursor: 'crosshair', touchAction: 'none', display: 'block', overflow: 'visible' }}
            onMouseDown={onDown}
            onTouchStart={onDown}
          >
            <defs>
              {/* Soft glow filter for puck */}
              <filter id="puck-glow" x="-80%" y="-80%" width="260%" height="260%">
                <feGaussianBlur stdDeviation="4" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              {/* Triangle fill gradient (blends three vertex colors) */}
              <radialGradient id="tri-fill" cx="50%" cy="55%" r="60%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.03)"/>
                <stop offset="100%" stopColor="rgba(255,255,255,0.00)"/>
              </radialGradient>
            </defs>

            {/* Triangle base fill */}
            <polygon points={TRI_POINTS} fill="url(#tri-fill)" />

            {/* Triangle edges — per-edge colored by the opposite vertex */}
            {/* Speed-Cost edge → sustainability color */}
            <line x1={V.speed.x} y1={V.speed.y} x2={V.cost.x} y2={V.cost.y}
              stroke={META.sustainability.color} strokeWidth="1" strokeOpacity={0.2 + bary[2] * 0.45} />
            {/* Cost-Sustain edge → speed color */}
            <line x1={V.cost.x} y1={V.cost.y} x2={V.sustainability.x} y2={V.sustainability.y}
              stroke={META.speed.color} strokeWidth="1" strokeOpacity={0.2 + bary[0] * 0.45} />
            {/* Sustain-Speed edge → cost color */}
            <line x1={V.sustainability.x} y1={V.sustainability.y} x2={V.speed.x} y2={V.speed.y}
              stroke={META.cost.color} strokeWidth="1" strokeOpacity={0.2 + bary[1] * 0.45} />

            {/* Pull-lines from puck to vertices */}
            {Object.entries(V).map(([key, vt], i) => (
              <line key={key}
                x1={puck.x} y1={puck.y} x2={vt.x} y2={vt.y}
                stroke={META[key].color}
                strokeWidth={0.8 + bary[i] * 1.6}
                strokeOpacity={0.18 + bary[i] * 0.55}
                strokeDasharray="3 4"
              />
            ))}

            {/* Vertex circles + labels */}
            {Object.entries(V).map(([key, vt], i) => {
              const m = META[key]
              const weight = bary[i]
              const isTop = key === 'speed'
              return (
                <g key={key}
                  onMouseEnter={() => setActive(key)}
                  onMouseLeave={() => setActive(null)}
                  style={{ cursor: 'pointer' }}
                  onClick={() => applyPos({ x: vt.x, y: vt.y })}
                >
                  {/* Glow halo */}
                  <circle cx={vt.x} cy={vt.y} r={12 + weight * 10}
                    fill={m.color} fillOpacity={0.08 + weight * 0.14} />
                  {/* Outer ring */}
                  <circle cx={vt.x} cy={vt.y} r={9}
                    fill="none" stroke={m.color}
                    strokeWidth={weight > 0.45 ? 1.8 : 1}
                    strokeOpacity={0.35 + weight * 0.5} />
                  {/* Inner fill */}
                  <circle cx={vt.x} cy={vt.y} r={5}
                    fill={m.color} fillOpacity={0.3 + weight * 0.6} />

                  {/* Label */}
                  <text
                    x={vt.x}
                    y={key === 'speed' ? vt.y - 18 : vt.y + 22}
                    textAnchor="middle"
                    fill={m.color}
                    fontSize="10"
                    fontWeight="700"
                    fontFamily="Inter, sans-serif"
                    fillOpacity={0.6 + weight * 0.4}
                  >
                    {m.icon} {m.label}
                  </text>

                  {/* Value bubble — shown when dominant or hovered */}
                  <AnimatePresence>
                    {(weight > 0.4 || active === key) && (
                      <motion.g
                        key="val"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                      >
                        <rect
                          x={vt.x - 14} y={key === 'speed' ? vt.y + 12 : vt.y - 26}
                          width="28" height="16" rx="8"
                          fill={m.color} fillOpacity="0.18"
                          stroke={m.color} strokeOpacity="0.35" strokeWidth="0.8"
                        />
                        <text
                          x={vt.x}
                          y={key === 'speed' ? vt.y + 24 : vt.y - 14}
                          textAnchor="middle" fill={m.color}
                          fontSize="9" fontWeight="700" fontFamily="Inter, sans-serif"
                        >
                          {Math.round(weight * 100)}
                        </text>
                      </motion.g>
                    )}
                  </AnimatePresence>
                </g>
              )
            })}

            {/* Draggable puck */}
            <g filter="url(#puck-glow)">
              {/* Outer pulse ring */}
              <motion.circle
                cx={puck.x} cy={puck.y} r={14}
                fill="none" stroke={dominantColor} strokeWidth="1"
                strokeOpacity="0.4"
                animate={{ r: [14, 20, 14], strokeOpacity: [0.4, 0, 0.4] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              />
              {/* Puck body */}
              <circle cx={puck.x} cy={puck.y} r={8}
                fill={dominantColor} fillOpacity="0.22"
                stroke={dominantColor} strokeWidth="1.5" strokeOpacity="0.8"
              />
              {/* Center dot */}
              <circle cx={puck.x} cy={puck.y} r={3} fill={dominantColor} />
            </g>
          </svg>
        </div>

        {/* Value strip */}
        <div
          className="mx-4 mb-4 grid grid-cols-3 rounded-xl overflow-hidden"
          style={{ border: '1px solid rgba(255,255,255,0.07)' }}
        >
          {Object.entries(META).map(([key, m], i) => (
            <div key={key}
              className="flex flex-col items-center py-2.5 gap-0.5"
              style={{
                background: i % 2 === 1 ? 'rgba(255,255,255,0.02)' : 'transparent',
                borderRight: i < 2 ? '1px solid rgba(255,255,255,0.07)' : 'none',
              }}
            >
              <span className="text-[9px] font-semibold uppercase tracking-widest" style={{ color: m.color }}>
                {m.icon} {m.label.slice(0, 5)}
              </span>
              <motion.span
                key={values[key]}
                initial={{ scale: 1.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="text-lg font-bold tabular-nums text-white"
              >
                {values[key]}
              </motion.span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
