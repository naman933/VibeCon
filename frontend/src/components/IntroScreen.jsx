import { motion } from 'framer-motion'

// Stagger helper
const stagger = (i, base = 0.12) => ({ delay: 0.3 + i * base, duration: 0.7, ease: [0.22, 1, 0.36, 1] })

const PILLARS = [
  { label: 'Speed',          color: '#6366f1', icon: '⚡' },
  { label: 'Cost',           color: '#a855f7', icon: '◈' },
  { label: 'Sustainability', color: '#10b981', icon: '◉' },
]

export default function IntroScreen({ onStart }) {
  return (
    <motion.div
      key="intro-screen"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04, filter: 'blur(12px)' }}
      transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
      style={{ background: '#000' }}
    >
      {/* Background radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: [
            'radial-gradient(ellipse 80% 55% at 50% 60%, rgba(99,102,241,0.13) 0%, transparent 65%)',
            'radial-gradient(ellipse 55% 40% at 15% 90%, rgba(16,185,129,0.08) 0%, transparent 60%)',
            'radial-gradient(ellipse 45% 35% at 88% 10%, rgba(168,85,247,0.08) 0%, transparent 55%)',
          ].join(', '),
        }}
      />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: [
            'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)',
            'linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
          ].join(', '),
          backgroundSize: '72px 72px',
        }}
      />

      <div className="relative flex flex-col items-center text-center px-6 max-w-3xl w-full gap-8">

        {/* Logo mark */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            boxShadow: '0 0 48px rgba(99,102,241,0.4), 0 0 0 1px rgba(255,255,255,0.08)',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L22 8V16L12 22L2 16V8L12 2Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
            <circle cx="12" cy="12" r="3" fill="white" />
          </svg>
        </motion.div>

        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={stagger(0)}
          className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-400"
        >
          Interactive 3D Experience
        </motion.p>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={stagger(1)}
          className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]"
          style={{
            background: 'linear-gradient(160deg, #ffffff 0%, rgba(255,255,255,0.55) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Experience Business<br />Trade-offs in 3D
        </motion.h1>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={stagger(2)}
          className="text-base md:text-lg text-white/45 leading-relaxed max-w-lg"
        >
          Adjust real-time parameters and watch how decisions cascade across speed, cost, and sustainability — rendered in an immersive 3D environment.
        </motion.p>

        {/* Pillar chips */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={stagger(3)}
          className="flex items-center gap-3 flex-wrap justify-center"
        >
          {PILLARS.map(p => (
            <div
              key={p.label}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{
                color: p.color,
                background: `${p.color}12`,
                border: `1px solid ${p.color}30`,
              }}
            >
              <span>{p.icon}</span>
              {p.label}
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={stagger(4)}
          className="flex items-center gap-4 pt-2"
        >
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: '0 0 48px rgba(99,102,241,0.55)' }}
            whileTap={{ scale: 0.97 }}
            onClick={onStart}
            className="relative px-8 py-3.5 rounded-full text-sm font-semibold text-white cursor-pointer overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              boxShadow: '0 0 32px rgba(99,102,241,0.4)',
            }}
          >
            {/* Shine sweep on hover */}
            <motion.span
              className="absolute inset-0 pointer-events-none"
              initial={{ x: '-100%', opacity: 0 }}
              whileHover={{ x: '100%', opacity: 1 }}
              transition={{ duration: 0.5 }}
              style={{
                background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%)',
              }}
            />
            Start Simulation
          </motion.button>

          <span className="text-xs text-white/20">No setup required</span>
        </motion.div>

      </div>

      {/* Bottom credit */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.8 }}
        className="absolute bottom-8 text-xs text-white/20 tracking-wide"
      >
        3D Decision Simulator · Powered by Spline & Framer Motion
      </motion.p>
    </motion.div>
  )
}
