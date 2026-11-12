'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

// A post's outline, in the left margin of a wide screen: a slim column of short
// lines, one for each section (longer) and each bold lead-in under it
// (shorter), the one being read and its section darkest. Hovering the column
// fades in the sections' names beside their lines, one after another - only
// those, a word or two each, and no card behind them. A lead-in keeps to its
// line: hovering it darkens it and names it in a tooltip. A click scrolls
// there. It reads the headings from the post itself, so a post needs nothing to
// have one.

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
    // A click leaves no focus behind, so the names fade once the pointer leaves
    if (event.detail > 0) event.currentTarget.blur()
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    item.element.scrollIntoView({
      behavior: still ? 'auto' : 'smooth',
      block: 'start',
    })
    history.replaceState(null, '', `#${item.id}`)
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
          const reading =
            item.id === active?.id || (section && item.id === active?.section)
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
                {/* The row is the target, wider and taller than its line; the line thickens a little under the pointer */}
                <span
                  aria-hidden="true"
                  className={`block h-[2px] rounded-full transition-[width,height,background-color] duration-200 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover/item:h-[3px] ${
                    section
                      ? 'w-[18px] group-hover/item:w-6'
                      : 'w-[9px] group-hover/item:w-[14px]'
                  } ${
                    reading
                      ? 'bg-foreground'
                      : 'bg-muted-foreground/30 group-hover/item:bg-foreground'
                  }`}
                />
                {section && (
                  <span
                    className={`pointer-events-none absolute top-1/2 left-full ml-3 -translate-x-1 -translate-y-1/2 text-[12.5px] whitespace-nowrap opacity-0 transition-[opacity,translate] duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] group-focus-within/outline:pointer-events-auto group-focus-within/outline:translate-x-0 group-focus-within/outline:opacity-100 group-hover/outline:pointer-events-auto group-hover/outline:translate-x-0 group-hover/outline:opacity-100 motion-reduce:transition-none ${
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
