'use client'
import { type JSX, useEffect, useMemo, useRef, useState } from 'react'
import { motion, MotionProps, useReducedMotion } from 'motion/react'

export type TextScrambleProps = {
  children: string
  duration?: number
  speed?: number
  characterSet?: string
  as?: React.ElementType
  className?: string
  trigger?: boolean
  onScrambleComplete?: () => void
} & MotionProps

const defaultChars =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

export function TextScramble({
  children,
  duration = 0.8,
  speed = 0.04,
  characterSet = defaultChars,
  className,
  as: Component = 'p',
  trigger = true,
  onScrambleComplete,
  ...props
}: TextScrambleProps) {
  // motion.create returns a new component type on every call; without the
  // memo React would remount the element on every scramble tick.
  const MotionComponent = useMemo(
    () => motion.create(Component as keyof JSX.IntrinsicElements),
    [Component],
  )
  const [displayText, setDisplayText] = useState(children)
  const reduceMotion = useReducedMotion()
  const onCompleteRef = useRef(onScrambleComplete)

  useEffect(() => {
    onCompleteRef.current = onScrambleComplete
  })

  useEffect(() => {
    if (!trigger) return

    if (reduceMotion) {
      setDisplayText(children)
      onCompleteRef.current?.()
      return
    }

    const text = children
    const steps = duration / speed
    let step = 0

    const interval = setInterval(() => {
      let scrambled = ''
      const progress = step / steps

      for (let i = 0; i < text.length; i++) {
        if (text[i] === ' ') {
          scrambled += ' '
          continue
        }

        if (progress * text.length > i) {
          scrambled += text[i]
        } else {
          scrambled +=
            characterSet[Math.floor(Math.random() * characterSet.length)]
        }
      }

      setDisplayText(scrambled)
      step++

      if (step > steps) {
        clearInterval(interval)
        setDisplayText(text)
        onCompleteRef.current?.()
      }
    }, speed * 1000)

    return () => clearInterval(interval)
  }, [trigger, reduceMotion, children, duration, speed, characterSet])

  return (
    <MotionComponent className={className} {...props}>
      {displayText}
    </MotionComponent>
  )
}
