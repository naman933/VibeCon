import { useRef, useState, useCallback, lazy, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Lazy-load the heavy Spline runtime so it doesn't block the initial paint
const Spline = lazy(() => import('@splinetool/react-spline'))

/**
 * Scene3D
 *
 * Props:
 *   sceneUrl  {string}  — Spline scene URL
 *                         e.g. "https://prod.spline.design/YOUR_ID/scene.splinecode"
 *
 * Exposes via splineRef (forwarded):
 *   splineRef.current  — the Spline Application instance
 *
 * Camera / interaction helpers are attached to `splineRef.current`:
 *   splineRef.current.emitEvent('mouseDown', 'ObjectName')
 *   splineRef.current.findObjectByName('ObjectName')
 *   splineRef.current.setZoom(1.5)
 *
 * Trigger events from outside this component by calling:
 *   sceneRef.current.emitEvent('mouseDown', 'Button')
 */
export default function Scene3D({
  sceneUrl = 'https://prod.spline.design/replace-with-your-scene-id/scene.splinecode',
  onLoad,
  onError,
}) {
  const splineRef = useRef(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  // Called by Spline when the scene + assets are fully ready
  const handleLoad = useCallback(
    (splineApp) => {
      splineRef.current = splineApp
      setIsLoaded(true)
      onLoad?.(splineApp)
    },
    [onLoad],
  )

  const handleError = useCallback(
    (err) => {
      console.error('[Scene3D] Spline load error:', err)
      setHasError(true)
      onError?.(err)
    },
    [onError],
  )

  return (
    <div className="absolute inset-0 w-full h-full">

      {/* ── Spline canvas (lazy-loaded) ── */}
      <Suspense fallback={null}>
        <Spline
          scene={sceneUrl}
          onLoad={handleLoad}
          onError={handleError}
          style={{ width: '100%', height: '100%' }}
        />
      </Suspense>

      {/* ── Loading overlay — fades out once scene is ready ── */}
      <AnimatePresence>
        {!isLoaded && !hasError && (
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="absolute inset-0 flex flex-col items-center justify-center"
            style={{ background: '#000', zIndex: 10 }}
          >
            {/* Spinner */}
            <div className="relative w-14 h-14 mb-6">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 rounded-full"
                style={{
                  border: '2px solid transparent',
                  borderTopColor: '#8b5cf6',
                  borderRightColor: '#6366f1',
                }}
              />
              <motion.span
                animate={{ rotate: -360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-2 rounded-full"
                style={{
                  border: '2px solid transparent',
                  borderTopColor: 'rgba(139, 92, 246, 0.4)',
                }}
              />
              {/* Center dot */}
              <span
                className="absolute inset-0 flex items-center justify-center"
              >
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              </span>
            </div>

            <p className="text-white/50 text-sm font-medium tracking-wide">
              Loading scene…
            </p>
          </motion.div>
        )}

        {/* ── Error state ── */}
        {hasError && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-3"
            style={{ background: '#000', zIndex: 10 }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mb-2"
              style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)' }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 6v5M10 14h.01M3 10a7 7 0 1 0 14 0A7 7 0 0 0 3 10z"
                  stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-white/60 text-sm font-medium">Failed to load 3D scene</p>
            <p className="text-white/25 text-xs max-w-xs text-center">
              Check the scene URL in Scene3D.jsx or your network connection.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
