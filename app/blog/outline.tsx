'use client'

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

// A post's outline, in the left margin of a wide screen: a tight column of
// short lines, one for each section (longer) and each bold lead-in under it
// (shorter), the one being read darkest. Under the pointer it opens like a
// dock: each row grows by how near the pointer is - continuously, on springs -
// and names itself as it grows, so only the few rows around the pointer show a
// title, the nearest darkest. The column lifts as it opens, so the spot under
// the pointer stays put. A row is its whole width, line and title, so it's easy
// to hit; a click scrolls there. It reads the headings from the post itself,
// so a post needs nothing to have one.

interface Item {
  id: string
  title: string
  level: 2 | 3
  /** The section it's in (its own id, for a section) */
  section: string
  element: HTMLElement
}

/** How far below the top of the window a heading counts as being read, in px */
const READ_LINE = 140

/** A row's height at rest and at the pointer, and the space before a section, in px */
const ROW = 7
const OPEN = 28
const SECTION_GAP = 6
/** How far the opening reaches, in px of the column at rest */
const REACH = 8
/** The springs: the pointer's spot, and the column opening and closing */
const FOLLOW = { stiffness: 420, damping: 42, mass: 0.6 }
const ENGAGE = { stiffness: 260, damping: 30, mass: 0.8 }

/** How near the pointer is to a row, 1 on it, falling off smoothly */
const nearness = (pointer: number, center: number) =>
  Math.exp(-((pointer - center) ** 2) / (2 * REACH * REACH))

const slug = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

/** The post's sections and the bold lead-ins that open its paragraphs (not a list's label) */
const findItems = (main: HTMLElement): Item[] => {
  const used = new Set<string>()
  const items: Item[] = []
  let section = ''
  main.querySelectorAll<HTMLElement>('h2, p').forEach((element) => {
    let title: string
    let level: 2 | 3
    if (element.tagName === 'H2') {
      // "1. Memory" is "Memory" here: the order already shows
      title = (element.textContent ?? '').replace(/^\d+\.\s*/, '')
      level = 2
    } else {
      const lead = element.firstElementChild
      if (
        lead?.tagName !== 'STRONG' ||
        element.firstChild !== lead ||
        element.closest('.not-prose')
      )
        return
      // A bold line alone, like "If you're building one", labels a list
      if (
        (element.textContent ?? '').trim() === (lead.textContent ?? '').trim()
      )
        return
      title = (lead.textContent ?? '').replace(/[.:]\s*$/, '')
      level = 3
    }
    if (!title) return
    let id = element.id || slug(title)
    for (let n = 2; used.has(id); n++) id = `${slug(title)}-${n}`
    used.add(id)
    element.id = id
    element.style.scrollMarginTop = '96px'
    if (level === 2) section = id
    items.push({ id, title, level, section: section || id, element })
  })
  return items
}

/** Where each row sits in the column at rest: its top, and the space before it */
const restLayout = (items: Item[]) => {
  let y = 0
  return items.map((item, i) => {
    const gap = item.level === 2 && i > 0 ? SECTION_GAP : 0
    y += gap
    const top = y
    y += ROW
    return { top, gap }
  })
}

function Row({
  item,
  top,
  gap,
  pointer,
  engaged,
  reading,
  current,
  onJump,
  onFocusRow,
}: {
  item: Item
  top: number
  gap: number
  pointer: MotionValue<number>
  engaged: MotionValue<number>
  reading: boolean
  current: boolean
  onJump: (event: React.MouseEvent<HTMLAnchorElement>, item: Item) => void
  onFocusRow: (center: number) => void
}) {
  const center = top + ROW / 2
  const near = useTransform(
    [pointer, engaged],
    ([p, e]: number[]) => e * nearness(p, center),
  )
  const height = useTransform(near, (n) => ROW + (OPEN - ROW) * n)
  const lineWidth = useTransform(
    near,
    (n) => (item.level === 2 ? 16 : 8) + 8 * n,
  )
  const lineOpacity = useTransform(near, (n) => (reading ? 1 : 0.3 + 0.7 * n))
  // A title shows once its row is a little open, and is darkest at the pointer
  const labelOpacity = useTransform(near, (n) =>
    Math.max(0, Math.min(1, (n - 0.3) / 0.65)),
  )
  const labelShift = useTransform(near, (n) => (1 - Math.min(1, n * 1.5)) * -4)

  return (
    <motion.li style={{ height, marginTop: gap }}>
      <a
        href={`#${item.id}`}
        onClick={(event) => onJump(event, item)}
        onFocus={() => onFocusRow(center)}
        aria-label={item.title}
        aria-current={current ? 'location' : undefined}
        className="flex h-full w-44 cursor-pointer items-center gap-3 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <motion.span
          aria-hidden="true"
          className="bg-foreground block h-[2px] shrink-0 rounded-full"
          style={{ width: lineWidth, opacity: lineOpacity }}
        />
        <motion.span
          aria-hidden="true"
          className={`text-foreground shrink-0 text-[12.5px] whitespace-nowrap ${
            item.level === 2 ? 'font-medium' : ''
          }`}
          style={{ opacity: labelOpacity, x: labelShift }}
        >
          {item.title}
        </motion.span>
      </a>
    </motion.li>
  )
}

export function Outline() {
  const pathname = usePathname()
  const [items, setItems] = useState<Item[]>([])
  const [active, setActive] = useState<Item | null>(null)
  const navRef = useRef<HTMLElement>(null)
  const still = useReducedMotion()

  // Where the pointer is, in px down the column at rest, and whether it's in
  const pointerTarget = useMotionValue(0)
  const engagedTarget = useMotionValue(0)
  const pointerSpring = useSpring(pointerTarget, FOLLOW)
  const engagedSpring = useSpring(engagedTarget, ENGAGE)
  const pointer = still ? pointerTarget : pointerSpring
  const engaged = still ? engagedTarget : engagedSpring

  useEffect(() => {
    const main = document.querySelector<HTMLElement>('main.blog-prose')
    if (!main) return
    const found = findItems(main)
    setItems(found)

    let frame = 0
    const update = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        let current = found[0] ?? null
        for (const item of found) {
          if (item.element.getBoundingClientRect().top <= READ_LINE)
            current = item
          else break
        }
        setActive(current)
      })
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [pathname])

  const layout = restLayout(items)
  const restHeight = layout.length ? layout[layout.length - 1].top + ROW : 0

  // Lift the column by what has opened above the pointer's spot, so that
  // spot stays under the pointer as the rows around it open
  const lift = useTransform([pointer, engaged], ([p, e]: number[]) => {
    let sum = 0
    for (const { top } of layout) {
      const grown = (OPEN - ROW) * e * nearness(p, top + ROW / 2)
      sum += grown * Math.max(0, Math.min(1, (p - top) / ROW))
    }
    return -sum
  })

  if (items.length < 2) return null

  const jump = (event: React.MouseEvent<HTMLAnchorElement>, item: Item) => {
    event.preventDefault()
    // A click leaves no focus behind, so the column closes once the pointer leaves
    if (event.detail > 0) event.currentTarget.blur()
    item.element.scrollIntoView({
      behavior: still ? 'auto' : 'smooth',
      block: 'start',
    })
    history.replaceState(null, '', `#${item.id}`)
  }

  const follow = (clientY: number) => {
    const top = navRef.current?.getBoundingClientRect().top ?? 0
    // The nav is padded by 16px above the column
    pointerTarget.set(clientY - top - 16)
  }

  return (
    <nav
      ref={navRef}
      aria-label="On this page"
      className="fixed top-1/2 left-3 z-30 hidden -translate-y-1/2 px-3 py-4 min-[1200px]:block"
      onPointerEnter={(event) => {
        // Open from where the pointer came in, not from wherever it last was
        follow(event.clientY)
        pointerSpring.jump(pointerTarget.get())
        engagedTarget.set(1)
      }}
      onPointerMove={(event) => follow(event.clientY)}
      onPointerLeave={() => engagedTarget.set(0)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node))
          engagedTarget.set(0)
      }}
    >
      <div className="relative" style={{ height: restHeight }}>
        <motion.ul className="absolute top-0 left-0" style={{ y: lift }}>
          {items.map((item, i) => (
            <Row
              key={item.id}
              item={item}
              top={layout[i].top}
              gap={layout[i].gap}
              pointer={pointer}
              engaged={engaged}
              reading={
                item.id === active?.id ||
                (item.level === 2 && item.id === active?.section)
              }
              current={item.id === active?.id}
              onJump={jump}
              onFocusRow={(center) => {
                pointerTarget.set(center)
                engagedTarget.set(1)
              }}
            />
          ))}
        </motion.ul>
      </div>
    </nav>
  )
}
