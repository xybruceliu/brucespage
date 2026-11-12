import type { ReactNode } from 'react'

// A section's concrete advice, set apart from the prose so a reader skimming the
// post finds it: a card tinted in the sky of Doki's tags, its points checked off
// rather than bulleted (.takeaways in app/globals.css). The points are the
// Markdown list written inside it.

const TITLE = "If you're building one"

export function Takeaways({ children }: { children: ReactNode }) {
  return (
    <aside
      aria-label={TITLE}
      className="takeaways my-10 rounded-[var(--radius-lg)] border border-[var(--doki-sky-line)]/35 bg-[var(--doki-sky-bg)]/45 px-5 py-4"
    >
      <p className="!mt-0 !mb-2.5 text-sm font-medium text-[var(--doki-sky)]">
        {TITLE}
      </p>
      {children}
    </aside>
  )
}
