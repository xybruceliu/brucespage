'use client'
import { cn } from '@/lib/utils'
import {
  useMotionValue,
  motion,
  useAnimationFrame,
  useReducedMotion,
  type PanInfo,
} from 'motion/react'
import { useState, useRef, useEffect } from 'react'
import useMeasure from 'react-use-measure'

export type InfiniteSliderProps = {
  children: React.ReactNode
  gap?: number
  speed?: number
  speedOnHover?: number
  direction?: 'horizontal' | 'vertical'
  reverse?: boolean
  className?: string
  'aria-label'?: string
}

const FOCUSABLE = 'a[href], button, input, select, textarea, [tabindex]'

export function InfiniteSlider({
  children,
  gap = 16,
  speed = 100,
  speedOnHover,
  direction = 'horizontal',
  reverse = false,
  className,
  'aria-label': ariaLabel,
}: InfiniteSliderProps) {
  const [ref, { width, height }] = useMeasure()
  const containerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const cloneRef = useRef<HTMLDivElement>(null)
  const translation = useMotionValue(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  // Keyboard focus inside the slider holds it still so the focused item
  // doesn't drift away (WCAG 2.2.2). So does a reduced-motion preference.
  const [isFocused, setIsFocused] = useState(false)
  const reduceMotion = useReducedMotion()

  const baseSpeed =
    isHovered && speedOnHover !== undefined ? speedOnHover : speed
  const directionFactor = reverse ? 1 : -1
  const targetVelocity =
    reduceMotion || isFocused ? 0 : baseSpeed * directionFactor

  const velocityRef = useRef(targetVelocity)
  const hasDragged = useRef(false)

  // The second copy of the children only exists to make the loop seamless:
  // keep it out of the accessibility tree and the tab order.
  useEffect(() => {
    const clone = cloneRef.current
    if (!clone) return
    for (const child of Array.from(clone.children)) {
      child.setAttribute('aria-hidden', 'true')
    }
    clone.querySelectorAll(FOCUSABLE).forEach((el) => {
      el.setAttribute('tabindex', '-1')
    })
  })

  useAnimationFrame((t, delta) => {
    if (isDragging) return

    // Determine the wrapping distance
    // The container has two copies of children + gap between them
    // width = 2 * content + gap
    // We want to wrap every (content + gap)
    // content + gap = (width + gap) / 2
    const size = direction === 'horizontal' ? width : height
    if (!size) return

    const contentSize = (size + gap) / 2

    // Apply decay/lerp to velocity to return to target speed
    const diff = targetVelocity - velocityRef.current
    const lerpFactor = 0.05 // Adjust for smoother/faster recovery
    if (Math.abs(diff) > 0.5) {
      velocityRef.current += diff * lerpFactor
    } else {
      velocityRef.current = targetVelocity
    }

    // Move
    const moveBy = velocityRef.current * (delta / 1000)
    const current = translation.get()
    let next = current + moveBy

    // Wrap logic
    if (next < -contentSize) {
      next += contentSize
      // If we wrapped, we might need to adjust current to avoid visual jump if framer was tracking it?
      // No, we are setting it.
    } else if (next > 0 && !isFocused) {
      // While focused, reveal() may leave the track slightly past the start
      // so the first item's focus ring isn't clipped; don't loop it away.
      next -= contentSize
    }

    translation.set(next)
  })

  // Slide the track (rather than scrolling the clipped container, which would
  // break the loop math) so the focused item — plus room for its focus ring
  // and hover effect — is fully visible.
  const reveal = (el: HTMLElement) => {
    const pad = 16
    const container = containerRef.current
    const track = trackRef.current
    if (!container || !track) return
    container.scrollLeft = 0
    container.scrollTop = 0

    const horizontal = direction === 'horizontal'
    const itemRect = el.getBoundingClientRect()
    const trackRect = track.getBoundingClientRect()
    // Position within the track; unaffected by the track's own transform.
    const offset = horizontal
      ? itemRect.left - trackRect.left
      : itemRect.top - trackRect.top
    const itemSize = horizontal ? itemRect.width : itemRect.height
    const viewSize = horizontal ? container.clientWidth : container.clientHeight

    let next = translation.get()
    if (next + offset < pad) {
      next = pad - offset
    } else if (next + offset + itemSize > viewSize - pad) {
      next = viewSize - pad - offset - itemSize
    }
    translation.set(next)
  }

  const onFocus = (event: React.FocusEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement
    if (!target.matches(':focus-visible')) return
    velocityRef.current = 0
    setIsFocused(true)
    reveal(target)
  }

  const onBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsFocused(false)
    }
  }

  // Browsers scroll even overflow-hidden containers to show a focused child;
  // undo that and slide the track instead.
  const onScroll = () => {
    const active = document.activeElement
    if (active instanceof HTMLElement && trackRef.current?.contains(active)) {
      reveal(active)
    } else if (containerRef.current) {
      containerRef.current.scrollLeft = 0
      containerRef.current.scrollTop = 0
    }
  }

  const onDragStart = () => {
    hasDragged.current = true
    setIsDragging(true)
  }

  const onDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    setIsDragging(false)
    // Capture the throw velocity from the drag gesture
    const throwVelocity =
      direction === 'horizontal' ? info.velocity.x : info.velocity.y

    // If the user just clicks or drags very slowly, info.velocity might be low.
    // We might want to ensure we don't stop if velocity is 0, unless that's intended.
    // But the lerp will pick it up back to targetVelocity anyway.
    // So if throw is 0, it will accelerate back to speed.
    velocityRef.current = throwVelocity
  }

  const onHoverStart = () => {
    setIsHovered(true)
  }

  const onHoverEnd = () => {
    setIsHovered(false)
  }

  return (
    <div
      ref={containerRef}
      role={ariaLabel ? 'region' : undefined}
      aria-label={ariaLabel}
      onScroll={onScroll}
      className={cn(
        'cursor-grab overflow-hidden active:cursor-grabbing',
        className,
      )}
    >
      <motion.div
        className="flex w-max"
        style={{
          ...(direction === 'horizontal'
            ? { x: translation }
            : { y: translation }),
          gap: `${gap}px`,
          flexDirection: direction === 'horizontal' ? 'row' : 'column',
        }}
        ref={(node: HTMLDivElement | null) => {
          ref(node)
          trackRef.current = node
        }}
        drag={direction === 'horizontal' ? 'x' : 'y'}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onHoverStart={onHoverStart}
        onHoverEnd={onHoverEnd}
        onFocus={onFocus}
        onBlur={onBlur}
        dragMomentum={false}
        onPointerDownCapture={() => {
          hasDragged.current = false
        }}
        onClickCapture={(e) => {
          if (hasDragged.current) {
            e.preventDefault()
            e.stopPropagation()
          }
        }}
      >
        {children}
        {/* display: contents keeps these in the same flex row as above. */}
        <div ref={cloneRef} className="contents">
          {children}
        </div>
      </motion.div>
    </div>
  )
}
