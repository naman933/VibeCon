import { AnimatePresence, motion } from 'framer-motion'

const SECTIONS = [
  {
    id: 'speed',
    label: '01 — Speed',
    headline: 'Speed',
    body: 'Fast delivery increases satisfaction',
    metric: '2.4× faster',
    accent: '#6366f1',
    glow: 'rgba(99, 102, 241, 0.45)',
    glowSoft: 'rgba(99, 102, 241, 0.12)',
  },
  {
    id: 'cost',
    label: '02 — Cost',
    headline: 'Cost',
    body: 'Lower cost improves accessibility',
    metric: '38% savings',
    accent: '#a855f7',
    glow: 'rgba(168, 85, 247, 0.45)',
    glowSoft: 'rgba(168, 85, 247, 0.12)',
  },
  {
    id: 'sustainability',
    label: '03 — Sustainability',
    headline: 'Sustainability',
    body: 'Sustainability reduces long-term impact',
    metric: '−60% emissions',
    accent: '#10b981',
    glow: 'rgba(16, 185, 129, 0.45)',
    glowSoft: 'rgba(16, 185, 129, 0.12)',
  },
]

const outerVariants = {
  enter: { opacity: 0, y: 40 },
  active: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -28, transition: { duration: 0.35 } },
}

export { SECTIONS }

export default function SectionOverlay({ activeSection }) {
  const section = SECTIONS[activeSection]

  return (
    <div className="absolute inset-0 pointer-events-none flex items-end pb-24 px-10 md:px-16">
      <AnimatePresence mode="wait">
        <motion.div
          key={section.id}
          variants={outerVariants}
          initial="enter"
          animate="active"
          exit="exit"
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col gap-4 max-w-lg relative"
        >
          {/* Ambient fog behind the text block */}
          <motion.div
            className="absolute pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            style={{
              inset: '-40px -60px -60px -40px',
              background: `radial-gradient(ellipse 80% 80% at 20% 80%, ${section.glowSoft} 0%, transparent 70%)`,
              filter: 'blur(20px)',
            }}
          />

          {/* Eyebrow */}
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="text-xs font-semibold uppercase tracking-[0.22em] relative"
            style={{ color: section.accent }}
          >
            {section.label}
          </motion.span>

          {/* Headline — triple-layer text shadow for deep glow */}
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16, duration: 0.5 }}
            className="text-5xl md:text-6xl font-bold text-white leading-none relative"
            style={{
              textShadow: [
                `0 0 30px ${section.glow}`,
                `0 0 70px ${section.glow.replace('0.45', '0.2')}`,
                `0 0 130px ${section.glow.replace('0.45', '0.08')}`,
              ].join(', '),
            }}
          >
            {section.headline}
          </motion.h2>

          {/* Body */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24, duration: 0.45 }}
            className="text-lg text-white/55 leading-relaxed relative"
          >
            {section.body}
          </motion.p>

          {/* Metric pill */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.32, duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full w-fit relative"
            style={{
              background: `${section.accent}18`,
              border: `1px solid ${section.accent}45`,
              boxShadow: `0 0 16px ${section.accent}28`,
            }}
          >
            <motion.span
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: section.accent }}
            />
            <span className="text-sm font-semibold" style={{ color: section.accent }}>
              {section.metric}
            </span>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
