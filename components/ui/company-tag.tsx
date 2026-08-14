'use client'

import React from 'react'
import { motion, useReducedMotion } from 'motion/react'

type PopIcon = React.ComponentType<{ className?: string }>

// Where the little burst particles fly — a fan across the upper hemisphere,
// so the pop reads as rising out of the word.
const PARTICLES = [
  { x: -26, y: -18 },
  { x: -13, y: -30 },
  { x: 0, y: -36 },
  { x: 13, y: -30 },
  { x: 26, y: -18 },
]

// One logo burst: the mark pops in with an overshoot, floats up, and fades —
// the double-tap-heart gesture, borrowed for brand marks. Removes itself when
// the main mark finishes.
function Burst({
  Icon,
  color,
  particleColors,
  reduce,
  onDone,
}: {
  Icon: PopIcon
  color?: string
  particleColors?: string[]
  reduce: boolean
  onDone: () => void
}) {
  if (reduce) {
    return (
      <motion.span
        aria-hidden="true"
        style={color ? { color } : undefined}
        className="text-foreground pointer-events-none absolute -top-1 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: [0, 1, 0], scale: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        onAnimationComplete={onDone}
      >
        <Icon className="h-5 w-5" />
      </motion.span>
    )
  }

  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute -top-1 left-1/2 -translate-x-1/2"
    >
      {PARTICLES.map((p, i) => {
        const dot = particleColors
          ? particleColors[i % particleColors.length]
          : color
        return (
          <motion.span
            key={i}
            style={dot ? { backgroundColor: dot } : undefined}
            className={`absolute top-1/2 left-1/2 block h-1 w-1 rounded-full ${dot ? '' : 'bg-foreground'}`}
            initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
            animate={{ x: p.x, y: p.y, scale: [0, 1, 0], opacity: [0, 1, 0] }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        )
      })}
      <motion.span
        style={color ? { color } : undefined}
        className="text-foreground relative block"
        initial={{ scale: 0, opacity: 0, y: 0, rotate: -12 }}
        animate={{
          scale: [0, 1.3, 1],
          opacity: [0, 1, 1, 0],
          y: [0, -12, -36],
          rotate: [-12, 0, 5],
        }}
        transition={{ duration: 0.8, ease: 'easeOut', times: [0, 0.3, 0.6, 1] }}
        onAnimationComplete={onDone}
      >
        <Icon className="h-6 w-6" />
      </motion.span>
    </span>
  )
}

// A company name that keeps the line clean — no logo at rest. It lifts on
// hover, and a tap pops the brand mark in its own colors, like a double-tap
// heart. Spam it and the pops stack.
export function CompanyTag({
  icon: Icon,
  color,
  particleColors,
  children,
}: {
  icon: PopIcon
  color?: string
  particleColors?: string[]
  children: React.ReactNode
}) {
  const reduce = !!useReducedMotion()
  const [bursts, setBursts] = React.useState<number[]>([])
  const nextId = React.useRef(0)

  const pop = () => setBursts((b) => [...b, nextId.current++])
  const remove = (id: number) => setBursts((b) => b.filter((x) => x !== id))

  return (
    <span className="relative inline-block">
      <button
        type="button"
        onClick={pop}
        className="hover:text-foreground cursor-pointer align-baseline transition-all duration-200 hover:-translate-y-0.5 motion-reduce:transform-none"
      >
        {children}
      </button>
      {bursts.map((id) => (
        <Burst
          key={id}
          Icon={Icon}
          color={color}
          particleColors={particleColors}
          reduce={reduce}
          onDone={() => remove(id)}
        />
      ))}
    </span>
  )
}

// The four-color Google "G" — a single fill can't reproduce it, so the official
// mark is inlined with its four brand colors.
export function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className={className}>
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  )
}

// Adobe's corporate "A". Simple Icons dropped the mark at Adobe's request, so
// react-icons has no export for it; the CC0 path is inlined here.
export function AdobeIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M13.966 22.624l-1.69-4.281H8.122l3.892-9.144 5.662 13.425zM8.884 1.376H0v21.248zm15.116 0h-8.884L24 22.624z" />
    </svg>
  )
}
