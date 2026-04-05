import { motion } from 'framer-motion'
import { SECTIONS } from './SectionOverlay'

export default function ScrollNav({ activeSection, onDotClick }) {
  return (
    <div className="fixed right-8 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-3">
      {SECTIONS.map((section, i) => {
        const isActive = i === activeSection
        return (
          <button
            key={section.id}
            onClick={() => onDotClick(i)}
            className="relative flex items-center justify-center cursor-pointer group"
            style={{ width: 24, height: 24 }}
            aria-label={`Go to ${section.headline}`}
          >
            {/* Active glow ring */}
            {isActive && (
              <motion.span
                layoutId="nav-glow"
                className="absolute inset-0 rounded-full"
                style={{ background: `${section.accent}20`, border: `1px solid ${section.accent}50` }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
              />
            )}

            {/* Dot */}
            <motion.span
              animate={{
                width: isActive ? 8 : 5,
                height: isActive ? 8 : 5,
                background: isActive ? section.accent : 'rgba(255,255,255,0.25)',
              }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="rounded-full block"
            />

            {/* Label on hover */}
            <span
              className="absolute right-8 whitespace-nowrap text-xs font-medium text-white/0 group-hover:text-white/60 transition-colors duration-200 pointer-events-none"
            >
              {section.headline}
            </span>
          </button>
        )
      })}
    </div>
  )
}
