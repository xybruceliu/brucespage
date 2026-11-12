'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

// A post's outline, at the right edge of a wide screen: a slim column of short
// lines, one for each section (longer) and each bold lead-in under it
// (shorter), the one being read darkest. Hovering or focusing it opens the
// column into a card of their titles, row by row; a click scrolls there. It
// reads the headings from the post itself, so a post needs nothing to have one.

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
      title = element.textContent ?? ''
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
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    const main = document.querySelector<HTMLElement>('main.blog-prose')
    if (!main) return
    const found = findItems(main)
    setItems(found)

    let frame = 0
    const update = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        let current = found[0]?.id ?? null
        for (const item of found) {
          if (item.element.getBoundingClientRect().top <= READ_LINE)
            current = item.id
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
    // A click leaves no focus behind, so the card closes once the pointer
    // leaves it; a keyboard user's Enter keeps it open to go on from there
    if (event.detail > 0) event.currentTarget.blur()
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    item.element.scrollIntoView({
      behavior: still ? 'auto' : 'smooth',
      block: 'start',
    })
    history.replaceState(null, '', `#${item.id}`)
  }

  return (
    <nav
      aria-label="On this page"
      className="group/outline fixed top-1/2 right-5 z-30 hidden -translate-y-1/2 min-[1024px]:block"
    >
      <div className="group-hover/outline:border-border group-hover/outline:bg-background/95 group-focus-within/outline:border-border group-focus-within/outline:bg-background/95 max-h-[80vh] overflow-y-auto rounded-[var(--radius-xl)] border border-transparent px-2 py-2 transition-[background-color,border-color,box-shadow] duration-200 ease-[cubic-bezier(0.25,1,0.5,1)] [scrollbar-width:none] group-focus-within/outline:shadow-[0_12px_32px_-12px_rgb(0_0_0/0.18)] group-focus-within/outline:backdrop-blur-md group-hover/outline:shadow-[0_12px_32px_-12px_rgb(0_0_0/0.18)] group-hover/outline:backdrop-blur-md">
        <ul className="flex flex-col items-end">
          {items.map((item) => {
            const on = item.id === active
            return (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  onClick={(event) => jump(event, item)}
                  aria-current={on ? 'location' : undefined}
                  className="group/item flex h-[9px] items-center justify-end gap-3 rounded-md transition-[height] duration-200 ease-[cubic-bezier(0.25,1,0.5,1)] group-focus-within/outline:h-7 group-hover/outline:h-7 focus-visible:outline-2"
                >
                  <span
                    className={`max-w-0 overflow-hidden text-[13px] whitespace-nowrap opacity-0 transition-[max-width,opacity,color] duration-200 ease-[cubic-bezier(0.25,1,0.5,1)] group-focus-within/outline:max-w-[260px] group-focus-within/outline:opacity-100 group-hover/outline:max-w-[260px] group-hover/outline:opacity-100 ${
                      item.level === 3 ? 'pr-0' : 'font-medium'
                    } ${on ? 'text-foreground' : 'text-muted-foreground group-hover/item:text-foreground'}`}
                  >
                    <span className="block truncate">{item.title}</span>
                  </span>
                  <span
                    aria-hidden="true"
                    className={`h-[2px] shrink-0 rounded-full transition-colors duration-200 ${
                      item.level === 2 ? 'w-4' : 'w-2.5'
                    } ${on ? 'bg-foreground' : 'bg-muted-foreground/35 group-hover/item:bg-foreground'}`}
                  />
                </a>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
