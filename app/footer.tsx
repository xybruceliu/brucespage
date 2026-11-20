'use client'
import { ArrowUpRightIcon } from '@/components/ui/arrow-up-right'
import { TextLoop } from '@/components/ui/text-loop'
import { useReducedMotion } from 'motion/react'
import { useState } from 'react'
import { PERSONAL_INFO } from './data'

// The footer credit alternates between the copyright and the template link.
// Both live inside one link, so it's always clickable and always reachable by
// keyboard; it holds still while pointed at or focused, and for visitors who
// prefer reduced motion.
function FooterCredit() {
  const reduceMotion = useReducedMotion()
  const [held, setHeld] = useState(false)

  return (
    <a
      href="https://github.com/xybruceliu/brucespage"
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`© ${new Date().getFullYear()} ${PERSONAL_INFO.name.english}. Site built with the Brucespage template (GitHub)`}
      className="hover:text-foreground focus-visible:text-foreground rounded-sm transition-colors"
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={() => setHeld(false)}
    >
      <TextLoop
        className="overflow-y-clip text-xs"
        trigger={!held && !reduceMotion}
        transition={{
          type: 'spring',
          stiffness: 1000,
          damping: 100,
          mass: 10,
          // The spring overshoots; blur can't go negative, so ease it instead.
          filter: { type: 'tween', duration: 0.3, ease: 'easeOut' },
        }}
        variants={{
          initial: {
            y: 20,
            rotateX: 90,
            opacity: 0,
            filter: 'blur(4px)',
          },
          animate: {
            y: 0,
            rotateX: 0,
            opacity: 1,
            filter: 'blur(0px)',
          },
          exit: {
            y: -20,
            rotateX: -90,
            opacity: 0,
            filter: 'blur(4px)',
          },
        }}
      >
        <span>
          © {new Date().getFullYear()} {PERSONAL_INFO.name.english}
        </span>
        <span>
          Brucespage Template
          <ArrowUpRightIcon className="inline h-3 w-3" />
        </span>
      </TextLoop>
    </a>
  )
}

export function Footer() {
  return (
    <footer className="border-border mt-8 border-t px-0 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="text-muted-foreground flex flex-wrap items-center justify-between gap-x-4 gap-y-3 text-xs">
        <FooterCredit />
        {/* On the home page, the sun's path goes here (components/sunlight).
            The site follows the visitor's clock, so there is no theme
            switch. */}
        <div id="sun-path" className="ml-auto" />
      </div>
    </footer>
  )
}
