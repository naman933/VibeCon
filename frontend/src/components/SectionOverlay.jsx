import { AnimatePresence, motion } from 'framer-motion'

export const SECTIONS = [
  {
    id: 'speed',
    label: '01 / Speed',
    headline: 'Speed',
    sub: 'Fast delivery increases\ncustomer satisfaction',
    body: 'Every second of delay reduces conversion. Optimise fulfilment velocity to stay ahead of rising expectations.',
    metric: '2.4× faster',
    accent: '#6366f1',
    glow: 'rgba(99,102,241,0.5)',
    glowSoft: 'rgba(99,102,241,0.10)',
    icon: '⚡',
  },
  {
    id: 'cost',
    label: '02 / Cost',
    headline: 'Cost',
    sub: 'Lower cost improves\naccessibility at scale',
    body: 'Lean operations unlock new market segments. Every efficiency gain widens the addressable population.',
    metric: '38% savings',
    accent: '#a855f7',
    glow: 'rgba(168,85,247,0.5)',
    glowSoft: 'rgba(168,85,247,0.10)',
    icon: '◈',
  },
  {
    id: 'sustainability',
    label: '03 / Sustainability',
    headline: 'Sustainability',
    sub: 'Sustainable choices reduce\nlong-term systemic risk',
    body: 'Responsible decisions today compound into competitive resilience. Green supply chains are not just ethical — they are strategic.',
    metric: '−60% emissions',
    accent: '#10b981',
    glow: 'rgba(16,185,129,0.5)',
    glowSoft: 'rgba(16,185,129,0.10)',
    icon: '◉',
  },
]

export default function SectionOverlay({ activeSection }) {
  const s = SECTIONS[activeSection]

  return (
    // Positioned in the upper-centre — clear of both bottom panels
    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center pb-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={s.id}
          initial={{ opacity: 0, y: 28, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0,  filter: 'blur(0px)' }}
          exit={{   opacity: 0, y: -16, filter: 'blur(4px)' }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center text-center gap-5 px-6 max-w-xl"
        >
          {/* Icon + eyebrow */}
          <div className="flex items-center gap-2.5">
            <motion.span
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              className="text-lg"
              style={{ color: s.accent }}
            >
              {s.icon}
            </motion.span>
            <span
              className="text-[10px] font-bold uppercase tracking-[0.22em]"
              style={{ color: s.accent }}
            >
              {s.label}
            </span>
          </div>

          {/* Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-6xl md:text-7xl font-bold text-white leading-none tracking-tight"
            style={{
              textShadow: [
                `0 0 40px ${s.glow}`,
                `0 0 90px ${s.glow.replace('0.5', '0.18')}`,
              ].join(', '),
            }}
          >
            {s.headline}
          </motion.h2>

          {/* Sub-headline */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.45 }}
            className="text-lg font-light leading-snug whitespace-pre-line"
            style={{ color: 'rgba(255,255,255,0.65)' }}
          >
            {s.sub}
          </motion.p>

          {/* Body — smaller, reads as supporting context */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.28, duration: 0.5 }}
            className="text-sm leading-relaxed max-w-sm"
            style={{ color: 'rgba(255,255,255,0.35)' }}
          >
            {s.body}
          </motion.p>

          {/* Metric pill */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.36, duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full"
            style={{
              background: `${s.accent}14`,
              border: `1px solid ${s.accent}40`,
              boxShadow: `0 0 20px ${s.accent}22`,
            }}
          >
            <motion.span
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: s.accent }}
            />
            <span className="text-sm font-semibold" style={{ color: s.accent }}>
              {s.metric}
            </span>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
