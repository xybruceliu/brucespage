'use client'

import React from 'react'
import { motion, useAnimationControls, useReducedMotion } from 'motion/react'

// Angles (from straight up) for the impact lines that spray off the palm on
// contact — a fan across the top, like a comic-book smack.
const LINES = [-75, -50, -25, 0, 25, 50, 75]

// The contact effect: short amber strokes shooting out from the slap point and
// fading — warm energy, not cold debris. Reduced motion keeps the flash but
// drops the outward travel. Removes itself when the first stroke finishes.
function Impact({ reduce, onDone }: { reduce: boolean; onDone: () => void }) {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0">
      {LINES.map((deg, i) => (
        <span
          key={i}
          className="absolute top-[38%] left-1/2"
          style={{ transform: `rotate(${deg}deg)` }}
        >
          <motion.span
            className="block w-[2px] -translate-x-1/2 rounded-full bg-amber-500"
            style={{ height: i % 2 === 0 ? 9 : 6 }}
            initial={
              reduce
                ? { opacity: 0, y: -13 }
                : { opacity: 0, y: -3, scaleY: 0.3 }
            }
            animate={
              reduce
                ? { opacity: [0, 1, 0], y: -13 }
                : { opacity: [0, 1, 0], y: -18, scaleY: [0.3, 1, 0.7] }
            }
            transition={{ duration: reduce ? 0.6 : 0.42, ease: 'easeOut' }}
            onAnimationComplete={i === 0 ? onDone : undefined}
          />
        </span>
      ))}
    </span>
  )
}

// A waving hand that greets once when the intro settles, lifts a little when you
// point at it, and — because you can't resist a raised palm — high-fives back
// when you click: it slaps forward and throws off a spark. Leave it hanging and
// nothing happens; smack it repeatedly and the sparks stack.
export function WaveEmoji({ label = 'waving hand' }: { label?: string }) {
  const controls = useAnimationControls()
  const reduce = useReducedMotion()
  const [impacts, setImpacts] = React.useState<number[]>([])
  const nextId = React.useRef(0)

  const wave = React.useCallback(() => {
    if (reduce) return
    controls.start({
      rotate: [0, 16, -10, 16, -6, 12, 0],
      transition: {
        duration: 1.1,
        ease: 'easeInOut',
        times: [0, 0.2, 0.35, 0.5, 0.65, 0.8, 1],
      },
    })
  }, [controls, reduce])

  React.useEffect(() => {
    const t = setTimeout(wave, 550) // greet just after the section blurs in
    return () => clearTimeout(t)
  }, [wave])

  const highFive = () => {
    setImpacts((s) => [...s, nextId.current++])
    if (reduce) {
      controls.start({ scale: [1, 1.15, 1], transition: { duration: 0.3 } })
      return
    }
    controls.start({
      rotate: [0, -24, 10, 0],
      scale: [1, 1.35, 0.92, 1],
      transition: { duration: 0.5, ease: 'easeOut', times: [0, 0.35, 0.62, 1] },
    })
  }

  return (
    <span className="relative inline-block">
      <motion.button
        type="button"
        aria-label={reduce ? label : `${label} — high five`}
        onClick={highFive}
        className="inline-block origin-[70%_80%] cursor-pointer align-[-0.1em] select-none"
        animate={controls}
        whileHover={reduce ? undefined : { y: -3 }}
        transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
      >
        👋
      </motion.button>
      {impacts.map((id) => (
        <Impact
          key={id}
          reduce={!!reduce}
          onDone={() => setImpacts((s) => s.filter((x) => x !== id))}
        />
      ))}
    </span>
  )
}
