import { motion } from 'framer-motion'

export default function Header({ onReset }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 lg:px-10 py-4"
      style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.65) 0%, transparent 100%)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            boxShadow: '0 0 12px rgba(99,102,241,0.35)',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L22 8V16L12 22L2 16V8L12 2Z" stroke="white" strokeWidth="1.8" strokeLinejoin="round" />
            <circle cx="12" cy="12" r="3" fill="white" />
          </svg>
        </div>
        <span className="text-white font-semibold text-sm tracking-tight hidden sm:block">
          3D Decision Simulator
        </span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onReset}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-colors"
          style={{
            color: 'rgba(255,255,255,0.5)',
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.04)',
          }}
        >
          <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
            <path d="M2 8a6 6 0 1 1 1.5 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M2 5v3h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Reset Simulation
        </motion.button>
      </div>
    </motion.header>
  )
}
