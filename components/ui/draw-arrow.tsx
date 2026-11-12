import { cn } from '@/lib/utils'

// A small up-right arrow that draws itself when the link around it is hovered
// or focused: the shaft shoots up and to the right, then the head follows. The
// link carries the `draw-arrow-trigger` class; the drawing is CSS
// (app/globals.css), so it works in server components and MDX too.
export function DrawArrow({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 15 15"
      fill="none"
      aria-hidden="true"
      className={cn('draw-arrow', className)}
    >
      <path
        d="M3.5 11.5L11.5 3.5"
        pathLength={1}
        stroke="currentColor"
        strokeWidth={1.4}
        strokeLinecap="round"
      />
      <path
        className="draw-arrow-head"
        d="M6 3.5H11.5V9"
        pathLength={1}
        stroke="currentColor"
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
