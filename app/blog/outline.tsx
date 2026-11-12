'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

// A post's outline, in the left margin of a wide screen: a slim column of short
// lines, one for each section (longer) and each bold lead-in under it
// (shorter), the one being read darkest. Hovering the column
// fades in the sections' names beside their lines, one after another - only
// those, a word or two each, and no card behind them. A lead-in keeps to its
// line: hovering it darkens it and names it in a tooltip. A click scrolls
// there. It reads the headings from the post itself, so a post needs nothing to
// have one.

interface Item {
  id: string
  title: string
  level: 2 | 3
  element: HTMLElement
}

/** How far below the top of the window a heading counts as being read, in px */
const READ_LINE = 140

const slug = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

/** The post's sections and the bold lead-ins that open its paragraphs (not a list's label) */
const findItems = (main: HTMLElement): Item[] => {
  const used = new Set<string>()
  const items: Item[] = []
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
    items.push({ id, title, level, element })
  })
  return items
}

export function Outline() {
  const pathname = usePathname()
  const [items, setItems] = useState<Item[]>([])
  const [active, setActive] = useState<Item | null>(null)
  const pinned = useRef<Item | null>(null)

  useEffect(() => {
    const main = document.querySelector<HTMLElement>('main.blog-prose')
    if (!main) return
    const found = findItems(main)
    setItems(found)

    /** Which item is being read, from where the headings are now */
    const compute = () => {
      // An item clicked stays the one being read until the reader scrolls
      if (pinned.current) return setActive(pinned.current)
      // The page's end stops scrolling before its last headings reach the
      // read line, so over its last screen the line slides down to the
      // window's bottom, and they're read in turn
      const left =
        document.documentElement.scrollHeight -
        (window.scrollY + window.innerHeight)
      const span = window.innerHeight - READ_LINE
      const line = READ_LINE + Math.max(0, span - Math.max(0, left))
      let current = found[0] ?? null
      for (const item of found) {
        if (item.element.getBoundingClientRect().top <= line) current = item
        else break
      }
      setActive(current)
    }
    let frame = 0
    const update = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(compute)
    }
    const release = () => {
      if (!pinned.current) return
      pinned.current = null
      compute()
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    window.addEventListener('wheel', release, { passive: true })
    window.addEventListener('touchmove', release, { passive: true })
    window.addEventListener('keydown', release)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
      window.removeEventListener('wheel', release)
      window.removeEventListener('touchmove', release)
      window.removeEventListener('keydown', release)
    }
  }, [pathname])

  if (items.length < 2) return null

  const jump = (event: React.MouseEvent<HTMLAnchorElement>, item: Item) => {
    event.preventDefault()
    // A click leaves no focus behind, so the names fade once the pointer leaves
    if (event.detail > 0) event.currentTarget.blur()
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    item.element.scrollIntoView({
      behavior: still ? 'auto' : 'smooth',
      block: 'start',
    })
    history.replaceState(null, '', `#${item.id}`)
    pinned.current = item
    setActive(item)
  }

  let sectionIndex = -1
  return (
    <nav
      aria-label="On this page"
      className="group/outline fixed top-1/2 left-6 z-30 hidden -translate-y-1/2 py-3 pr-4 min-[1200px]:block"
    >
      <ul className="flex flex-col">
        {items.map((item, i) => {
          const section = item.level === 2
          if (section) sectionIndex++
          // One line is lit: the one being read
          const reading = item.id === active?.id
          return (
            <li key={item.id} className={section && i > 0 ? 'mt-3' : ''}>
              <a
                href={`#${item.id}`}
                onClick={(event) => jump(event, item)}
                title={section ? undefined : item.title}
                aria-label={item.title}
                aria-current={item.id === active?.id ? 'location' : undefined}
                className="group/item relative flex h-[10px] w-8 items-center rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                {/* The row is the target, wider and taller than its line, and
                    the name sits past it: a line grows within its row on
                    hover, so the name never moves */}
                <span
                  aria-hidden="true"
                  className={`block h-[2px] rounded-full transition-[width,background-color] duration-200 ease-[cubic-bezier(0.25,1,0.5,1)] ${
                    section
                      ? 'w-[18px] group-hover/item:w-7'
                      : 'w-[9px] group-hover/item:w-4'
                  } ${
                    reading
                      ? 'bg-foreground'
                      : 'bg-muted-foreground/30 group-hover/item:bg-foreground'
                  }`}
                />
                {section && (
                  <span
                    className={`pointer-events-none absolute top-1/2 left-full ml-2 origin-left -translate-y-1/2 text-[12.5px] whitespace-nowrap opacity-0 transition-[opacity,scale,color] duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] group-focus-within/outline:pointer-events-auto group-focus-within/outline:opacity-100 group-hover/item:scale-110 group-hover/outline:pointer-events-auto group-hover/outline:opacity-100 motion-reduce:transition-none ${
                      reading
                        ? 'text-foreground'
                        : 'text-muted-foreground group-hover/item:text-foreground'
                    }`}
                    style={{ transitionDelay: `${sectionIndex * 25}ms` }}
                  >
                    {item.title}
                  </span>
                )}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
