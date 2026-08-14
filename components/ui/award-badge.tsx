'use client'

import React from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Award } from 'lucide-react'

const EASE_OUT = [0.25, 1, 0.5, 1] as const

// A four-point glint that pops once when the badge is hovered — a small,
// gold-tinted reward for the reader who lingers on an honor.
function Sparkle() {
  return (
    <motion.svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="pointer-events-none absolute -top-1.5 -right-1.5 h-2.5 w-2.5 text-amber-300"
      variants={{
        rest: { opacity: 0, scale: 0, rotate: -45 },
        hover: {
          opacity: [0, 1, 0],
          scale: [0, 1, 0.4],
          rotate: 25,
        },
      }}
      transition={{ duration: 0.6, ease: 'easeOut', times: [0, 0.45, 1] }}
    >
      <path
        d="M12 0 L13.8 10.2 L24 12 L13.8 13.8 L12 24 L10.2 13.8 L0 12 L10.2 10.2 Z"
        fill="currentColor"
      />
    </motion.svg>
  )
}

// Award recognition, rendered with a quiet celebratory response on hover:
// the medal twinkles, a soft gold glow blooms behind it, and a glint pops.
// Amber is the site's only accent, reserved for genuine honors.
export function AwardBadge({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion()

  return (
    <motion.span
      className="relative inline-flex items-center gap-1 py-0.5 text-sm font-medium"
      initial="rest"
      animate="rest"
      whileHover="hover"
    >
      <span className="relative inline-flex items-center justify-center">
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute -inset-1 rounded-full bg-amber-400/30 blur-[7px]"
          variants={{
            rest: { opacity: 0, scale: 0.6 },
            hover: { opacity: 1, scale: 1 },
          }}
          transition={{ duration: 0.3, ease: EASE_OUT }}
        />
        <motion.span
          className="relative inline-flex text-amber-500"
          variants={{
            rest: { rotate: 0, scale: 1 },
            hover: reduce
              ? { rotate: 0, scale: 1 }
              : { rotate: [0, -8, 5, 0], scale: [1, 1.18, 1.09, 1.13] },
          }}
          transition={{ duration: 0.55, ease: EASE_OUT }}
        >
          <Award className="h-3 w-3" />
        </motion.span>
        {!reduce && <Sparkle />}
      </span>
      {children}
    </motion.span>
  )
}
