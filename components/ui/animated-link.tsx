'use client'
import React from 'react'
import * as HoverCardPrimitive from '@radix-ui/react-hover-card'
import { encode } from 'qss'
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
} from 'motion/react'
import { cn } from '@/lib/utils'

type AnimatedLinkProps = {
  href: string
  children: React.ReactNode
  className?: string
  width?: number
  height?: number
  showPreview?: boolean
} & (
  | { isStatic: true; imageSrc: string }
  | { isStatic?: false; imageSrc?: never }
)

// The link stays inline so a long one wraps like the words around it. The
// hover underline is a background on the text, which follows the wrap; an
// absolutely placed bar would need inline-block, and an inline-block link
// can't break mid-phrase, leaving ragged lines in a paragraph.
const LINK_CLASSES =
  'text-foreground relative inline bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-[position:0_100%] bg-no-repeat transition-[background-size] duration-200 hover:bg-[length:100%_1px] focus-visible:bg-[length:100%_1px] motion-reduce:transition-none'

export function AnimatedLink({
  href,
  children,
  className = '',
  width = 200,
  height = 125,
  showPreview = true,
  isStatic = false,
  imageSrc = '',
}: AnimatedLinkProps) {
  const [isOpen, setOpen] = React.useState(false)
  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  let src
  if (!isStatic) {
    const params = encode({
      url: href,
      screenshot: true,
      meta: false,
      embed: 'screenshot.url',
      colorScheme: 'dark',
      'viewport.isMobile': true,
      'viewport.deviceScaleFactor': 1,
      'viewport.width': width * 3,
      'viewport.height': height * 3,
    })
    src = `https://api.microlink.io/?${params}`
  } else {
    src = imageSrc
  }

  const springConfig = { stiffness: 100, damping: 15 }
  const x = useMotionValue(0)
  const translateX = useSpring(x, springConfig)

  const handleMouseMove = (event: React.MouseEvent<HTMLElement>) => {
    const targetRect = (event.target as HTMLElement).getBoundingClientRect()
    const eventOffsetX = event.clientX - targetRect.left
    const offsetFromCenter = (eventOffsetX - targetRect.width / 2) / 2
    x.set(offsetFromCenter)
  }

  // If preview is disabled, render simple animated link
  if (!showPreview) {
    return (
      <motion.a
        className={cn('group', LINK_CLASSES, className)}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        initial="initial"
        whileHover="hover"
      >
        {children}
      </motion.a>
    )
  }

  return (
    <>
      {/* Warm the cache so the preview appears instantly on hover. Keep
          static previews small: they all download on page load. */}
      {isMounted ? (
        <span className="hidden" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element -- small preview or external screenshot URL */}
          <img src={src} width={width} height={height} alt="" />
        </span>
      ) : null}

      <HoverCardPrimitive.Root
        openDelay={50}
        closeDelay={100}
        onOpenChange={(open) => {
          setOpen(open)
        }}
      >
        <HoverCardPrimitive.Trigger
          onMouseMove={handleMouseMove}
          className={cn('group', LINK_CLASSES, className)}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
        >
          {children}
        </HoverCardPrimitive.Trigger>

        <HoverCardPrimitive.Portal>
          <HoverCardPrimitive.Content
            className="[transform-origin:var(--radix-hover-card-content-transform-origin)]"
            side="top"
            align="center"
            sideOffset={10}
          >
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.6 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: {
                      type: 'spring',
                      stiffness: 260,
                      damping: 20,
                    },
                  }}
                  exit={{ opacity: 0, y: 20, scale: 0.6 }}
                  className="rounded-xl"
                  style={{
                    x: translateX,
                  }}
                >
                  {/* Mouse-only duplicate of the trigger link above, so it stays
                      out of the tab order and accessibility tree. */}
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    tabIndex={-1}
                    aria-hidden="true"
                    className="block"
                    style={{ fontSize: 0 }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- small preview or external screenshot URL */}
                    <img
                      src={isStatic ? imageSrc : src}
                      width={width}
                      height={height}
                      className="rounded-lg shadow-lg"
                      alt=""
                    />
                  </a>
                </motion.div>
              )}
            </AnimatePresence>
          </HoverCardPrimitive.Content>
        </HoverCardPrimitive.Portal>
      </HoverCardPrimitive.Root>
    </>
  )
}
