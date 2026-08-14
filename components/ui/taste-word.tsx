'use client'

import React from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/utils'

// A word that develops its own taste. On hover it samples a few typographic
// personalities — technical, assertive, ornamented — and settles back on the
// refined serif italic. A quiet wink at Bruce's work on agents that develop
// taste of their own.
//
// The faces are stacked over an invisible sizer set in the resting face, so the
// resting word never shifts the line; only mid-sample does a wider face graze
// its neighbors, and only for a beat.
const FACES = [
  'font-serif italic', // 0 — the refined resting face
  'font-mono not-italic tracking-tight', // 1 — technical
  'font-sans font-semibold not-italic', // 2 — assertive
  'font-serif italic font-medium', // 3 — ornamented
]

export function TasteWord({ children = 'taste' }: { children?: string }) {
  const reduce = useReducedMotion()
  const [face, setFace] = React.useState(0)
  const timer = React.useRef<ReturnType<typeof setInterval> | null>(null)

  const sample = () => {
    if (reduce || timer.current) return
    let step = 0
    timer.current = setInterval(() => {
      step += 1
      if (step >= FACES.length) {
        if (timer.current) clearInterval(timer.current)
        timer.current = null
        setFace(0) // settle on the refined face
        return
      }
      setFace(step)
    }, 160)
  }

  React.useEffect(() => {
    return () => {
      if (timer.current) clearInterval(timer.current)
    }
  }, [])

  return (
    <span
      onMouseEnter={sample}
      className="text-foreground relative inline-block cursor-default"
    >
      <span className="invisible font-serif italic" aria-hidden="true">
        {children}
      </span>
      {FACES.map((f, idx) => (
        <span
          key={idx}
          aria-hidden="true"
          className={cn(
            'absolute inset-0 whitespace-nowrap transition-opacity duration-150',
            f,
            face === idx ? 'opacity-100' : 'opacity-0',
          )}
        >
          {children}
        </span>
      ))}
      <span className="sr-only">{children}</span>
    </span>
  )
}
