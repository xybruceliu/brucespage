'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

// A post's outline, in the left margin of a wide screen: a tight column of
// short lines, one for each section (longer) and each bold lead-in under it
// (shorter), the one being read darkest. Under the pointer it opens up like a
// dock: the row hovered grows most and its neighbors less, each by how near it
// is, and only those rows name themselves - the hovered one in full, the ones
// around it fading - so it never shows more than a few words. The hovered row
// stays where it was, so the column doesn't slide out from under the pointer.
// A click scrolls there. It reads the headings from the post itself, so a post
// needs nothing to have one.

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

/** A row's height at rest, and the space before a section, in px */
const ROW = 6
const SECTION_GAP = 6
/** A row's height by how many rows it is from the hovered one: 0, 1, 2, 3 */
const OPEN = [26, 20, 16, 10]
/** A line's thickness by that distance, in px */
const THICK = [5, 3, 2.5]
/** How much longer a line gets by that distance, in px */
const LONGER = [16, 8, 4]
/** How strong a row's title shows by that distance */
const LABEL = [1, 0.55, 0.3]

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

export function Outline() {
  const pathname = usePathname()
  const [items, setItems] = useState<Item[]>([])
  const [active, setActive] = useState<Item | null>(null)
  const [hovered, setHovered] = useState<number | null>(null)

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

  if (items.length < 2) return null

  const jump = (event: React.MouseEvent<HTMLAnchorElement>, item: Item) => {
    event.preventDefault()
    // A click leaves no focus behind, so the column closes once the pointer leaves
    if (event.detail > 0) event.currentTarget.blur()
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    item.element.scrollIntoView({
      behavior: still ? 'auto' : 'smooth',
      block: 'start',
    })
    history.replaceState(null, '', `#${item.id}`)
  }

  /** How many rows a row is from the hovered one - none while nothing is */
  const distance = (i: number) =>
    hovered === null ? Infinity : Math.abs(i - hovered)
  const height = (i: number) => OPEN[distance(i)] ?? ROW
  const gap = (i: number) => (items[i].level === 2 && i > 0 ? SECTION_GAP : 0)
  // The column at rest, and how far to lift it so the hovered row stays put:
  // everything the rows above it grew, and half of what it grew itself
  const restHeight = items.reduce((sum, _, i) => sum + ROW + gap(i), 0)
  const lift =
    hovered === null
      ? 0
      : items
          .slice(0, hovered)
          .reduce((sum, _, i) => sum + height(i) - ROW, 0) +
        (height(hovered) - ROW) / 2

  return (
    <nav
      aria-label="On this page"
      className="fixed top-1/2 left-6 z-30 hidden -translate-y-1/2 min-[1200px]:block"
      style={{ height: restHeight }}
      onMouseLeave={() => setHovered(null)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node))
          setHovered(null)
      }}
    >
      <ul
        className="absolute top-0 left-0 transition-transform duration-200 ease-[cubic-bezier(0.25,1,0.5,1)] motion-reduce:transition-none"
        style={{ transform: `translateY(${-lift}px)` }}
      >
        {items.map((item, i) => {
          const d = distance(i)
          const section = item.level === 2
          const reading =
            item.id === active?.id || (section && item.id === active?.section)
          const label = LABEL[d] ?? 0
          return (
            <li key={item.id} style={{ marginTop: gap(i) }}>
              <a
                href={`#${item.id}`}
                onClick={(event) => jump(event, item)}
                onMouseEnter={() => setHovered(i)}
                onFocus={() => setHovered(i)}
                aria-label={item.title}
                aria-current={item.id === active?.id ? 'location' : undefined}
                className="relative flex w-10 items-center rounded-sm transition-[height] duration-200 ease-[cubic-bezier(0.25,1,0.5,1)] focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none"
                style={{ height: height(i) }}
              >
                <span
                  aria-hidden="true"
                  className={`block shrink-0 rounded-full transition-[width,height,background-color] duration-200 ease-[cubic-bezier(0.25,1,0.5,1)] motion-reduce:transition-none ${
                    d === 0 || reading
                      ? 'bg-foreground'
                      : d <= 2
                        ? 'bg-muted-foreground/60'
                        : 'bg-muted-foreground/30'
                  }`}
                  style={{
                    width: (section ? 16 : 8) + (LONGER[d] ?? 0),
                    height: THICK[d] ?? 2,
                  }}
                />
                {/* Its title hangs off the row, taking the pointer only while it shows */}
                <span
                  aria-hidden="true"
                  className={`absolute top-1/2 left-full max-w-[220px] -translate-y-1/2 truncate text-[12.5px] whitespace-nowrap transition-[opacity,color] duration-200 ${
                    section ? 'font-medium' : ''
                  } ${d === 0 || (reading && label) ? 'text-foreground' : 'text-muted-foreground'}`}
                  style={{
                    opacity: label,
                    pointerEvents: label ? 'auto' : 'none',
                  }}
                >
                  {item.title}
                </span>
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
