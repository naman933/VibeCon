import { motion } from 'framer-motion'

/**
 * JourneyBadge — appears after the 3-step journey is complete.
 * Sits top-center, subtle, celebrating that the user has explored all dimensions.
 */
export default function JourneyBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -16, scale: 0.9 }}
      animate={{ opacity: 1, y: 0,   scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
    >
      <div
        className="flex items-center gap-2 px-4 py-2 rounded-full"
        style={{
          background: 'rgba(9,9,14,0.72)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(99,102,241,0.3)',
          boxShadow: '0 0 24px rgba(99,102,241,0.2)',
        }}
      >
        <motion.span
          animate={{ rotate: [0, 15, -10, 0] }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-sm"
        >
          ✦
        </motion.span>
        <span
          className="text-xs font-semibold tracking-wide"
          style={{ color: 'rgba(255,255,255,0.65)' }}
        >
          Journey complete — keep exploring
        </span>
      </div>
    </motion.div>
  )
}
