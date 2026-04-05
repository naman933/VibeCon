import { useEffect, useRef } from 'react'

/**
 * SimCanvas — a custom WebGL-free canvas animation.
 *
 * Renders a living particle-network that morphs between three modes
 * driven by the active section and live slider values.
 *
 *  Speed       → fast-moving indigo/violet particles, directional flow
 *  Cost        → structured lattice in cool silver, minimal drift
 *  Sustainability → organic emerald clusters, slow breath, leaf-like paths
 */

const SECTION_THEMES = [
  // Speed
  {
    bg1: 'rgba(15, 10, 40, 1)',
    bg2: 'rgba(6, 4, 20, 1)',
    primary:   [99, 102, 241],
    secondary: [139, 92, 246],
    speed: 1.8,
    connectDist: 130,
    nodeCount: 55,
    glowColor: 'rgba(99,102,241,',
  },
  // Cost
  {
    bg1: 'rgba(8, 8, 18, 1)',
    bg2: 'rgba(4, 4, 12, 1)',
    primary:   [148, 130, 200],
    secondary: [168, 85, 247],
    speed: 0.6,
    connectDist: 160,
    nodeCount: 48,
    glowColor: 'rgba(168,85,247,',
  },
  // Sustainability
  {
    bg1: 'rgba(4, 20, 14, 1)',
    bg2: 'rgba(2, 10, 6, 1)',
    primary:   [16, 185, 129],
    secondary: [52, 211, 153],
    speed: 0.9,
    connectDist: 145,
    nodeCount: 60,
    glowColor: 'rgba(16,185,129,',
  },
]

function lerp(a, b, t) { return a + (b - a) * t }
function lerpArr(a, b, t) { return a.map((v, i) => lerp(v, b[i], t)) }

export default function SimCanvas({ activeSection, values }) {
  const canvasRef  = useRef(null)
  const stateRef   = useRef({
    nodes: [],
    theme: { ...SECTION_THEMES[0] },
    targetTheme: { ...SECTION_THEMES[0] },
    themeT: 1,
    t: 0,
  })

  // Build node list on init and section change
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const w = canvas.offsetWidth
    const h = canvas.offsetHeight
    const theme = SECTION_THEMES[activeSection]

    stateRef.current.targetTheme = { ...theme }
    stateRef.current.themeT = 0

    // Regenerate nodes with new count
    stateRef.current.nodes = Array.from({ length: theme.nodeCount }, (_, i) => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * theme.speed,
      vy: (Math.random() - 0.5) * theme.speed,
      r: 1.5 + Math.random() * 2.5,
      phase: Math.random() * Math.PI * 2,
      mass: 0.6 + Math.random() * 0.8,
    }))
  }, [activeSection])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf

    const resize = () => {
      canvas.width  = canvas.offsetWidth  * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }
    resize()
    window.addEventListener('resize', resize)

    // Seed nodes on first mount
    if (stateRef.current.nodes.length === 0) {
      const theme = SECTION_THEMES[0]
      stateRef.current.nodes = Array.from({ length: theme.nodeCount }, () => ({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        vx: (Math.random() - 0.5) * theme.speed,
        vy: (Math.random() - 0.5) * theme.speed,
        r: 1.5 + Math.random() * 2.5,
        phase: Math.random() * Math.PI * 2,
        mass: 0.6 + Math.random() * 0.8,
      }))
    }

    const draw = () => {
      const s = stateRef.current
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight

      // Advance theme interpolation
      if (s.themeT < 1) {
        s.themeT = Math.min(1, s.themeT + 0.018)
        const t = s.themeT
        s.theme = {
          ...s.targetTheme,
          primary:   lerpArr(s.theme.primary,   s.targetTheme.primary,   t),
          secondary: lerpArr(s.theme.secondary, s.targetTheme.secondary, t),
          speed:     lerp(s.theme.speed,   s.targetTheme.speed,   t),
          connectDist: lerp(s.theme.connectDist, s.targetTheme.connectDist, t),
        }
      }

      const { theme, nodes } = s
      const sliderBoost = (values.speed + values.cost + values.sustainability) / 300 // 0-1

      // ── Background gradient ──────────────────────────────────────────────────
      const grad = ctx.createRadialGradient(w * 0.5, h * 0.45, 0, w * 0.5, h * 0.5, Math.max(w, h) * 0.75)
      grad.addColorStop(0, theme.bg1)
      grad.addColorStop(1, theme.bg2)
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, w, h)

      // ── Section-specific decorative elements ─────────────────────────────────
      if (activeSection === 2) {
        // Sustainability: concentric rings from bottom-left (like growth rings)
        for (let i = 1; i <= 6; i++) {
          const r = (w * 0.12 * i) + Math.sin(s.t * 0.3 + i) * 8
          ctx.beginPath()
          ctx.arc(w * 0.08, h * 0.92, r, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(16,185,129,${0.04 + 0.015 * Math.sin(s.t * 0.4 + i)})`
          ctx.lineWidth = 1
          ctx.stroke()
        }
        // Leaf veins
        ctx.save()
        ctx.translate(w * 0.75, h * 0.25)
        ctx.rotate(Math.PI / 6 + Math.sin(s.t * 0.2) * 0.05)
        for (let i = 0; i < 7; i++) {
          const angle = (i / 6) * Math.PI - Math.PI / 2
          const len = 60 + i * 8
          ctx.beginPath()
          ctx.moveTo(0, 0)
          ctx.lineTo(Math.cos(angle) * len * 0.4, Math.sin(angle) * len)
          ctx.strokeStyle = `rgba(52,211,153,${0.06 - i * 0.005})`
          ctx.lineWidth = 1
          ctx.stroke()
        }
        ctx.restore()
      }

      if (activeSection === 0) {
        // Speed: directional light streaks
        for (let i = 0; i < 5; i++) {
          const y = h * (0.2 + i * 0.14) + Math.sin(s.t * 0.8 + i) * 12
          const len = w * (0.2 + (sliderBoost + 0.2) * 0.6)
          const alpha = 0.03 + i * 0.01
          const grad2 = ctx.createLinearGradient(0, y, len, y)
          grad2.addColorStop(0, `rgba(99,102,241,${alpha})`)
          grad2.addColorStop(1, 'transparent')
          ctx.fillStyle = grad2
          ctx.fillRect(0, y - 1, len, 2)
        }
      }

      if (activeSection === 1) {
        // Cost: structured grid overlay
        ctx.save()
        ctx.strokeStyle = 'rgba(168,85,247,0.04)'
        ctx.lineWidth = 1
        const gs = 72
        for (let x = 0; x < w; x += gs) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke() }
        for (let y = 0; y < h; y += gs) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke() }
        ctx.restore()
      }

      // ── Particle network ─────────────────────────────────────────────────────
      const speedMult = 1 + (values.speed - 50) / 80
      const effectiveDist = theme.connectDist

      nodes.forEach(n => {
        // Update position
        n.x += n.vx * speedMult * n.mass
        n.y += n.vy * speedMult * n.mass
        n.phase += 0.008

        // Soft boundary bounce
        if (n.x < 0)  { n.x = 0;  n.vx = Math.abs(n.vx) }
        if (n.x > w)  { n.x = w;  n.vx = -Math.abs(n.vx) }
        if (n.y < 0)  { n.y = 0;  n.vy = Math.abs(n.vy) }
        if (n.y > h)  { n.y = h;  n.vy = -Math.abs(n.vy) }
      })

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < effectiveDist) {
            const alpha = (1 - dist / effectiveDist) * 0.25
            const [r, g, b] = theme.primary
            ctx.beginPath()
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`
            ctx.lineWidth = 0.6
            ctx.stroke()
          }
        }
      }

      // Draw nodes
      nodes.forEach(n => {
        const pulse = 1 + Math.sin(n.phase) * 0.3
        const [r1, g1, b1] = theme.primary
        const [r2, g2, b2] = theme.secondary
        const blend = (Math.sin(n.phase * 0.5) + 1) / 2
        const r = Math.round(lerp(r1, r2, blend))
        const g = Math.round(lerp(g1, g2, blend))
        const b = Math.round(lerp(b1, b2, blend))

        // Glow halo
        const halo = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 5 * pulse)
        halo.addColorStop(0, `rgba(${r},${g},${b},0.25)`)
        halo.addColorStop(1, `rgba(${r},${g},${b},0)`)
        ctx.fillStyle = halo
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r * 5 * pulse, 0, Math.PI * 2)
        ctx.fill()

        // Core dot
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r * pulse, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${r},${g},${b},0.9)`
        ctx.fill()
      })

      // Center subtle glow (highlights where the eye should rest)
      const cg = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.min(w, h) * 0.4)
      const [cr, cg2, cb] = theme.primary
      cg.addColorStop(0, `rgba(${cr},${cg2},${cb},0.06)`)
      cg.addColorStop(1, 'transparent')
      ctx.fillStyle = cg
      ctx.fillRect(0, 0, w, h)

      s.t += 0.016
      raf = requestAnimationFrame(draw)
    }

    draw()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Pass live values to the running loop via ref (no re-render needed)
  useEffect(() => {
    stateRef.current.values = values
  }, [values])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ display: 'block' }}
    />
  )
}
