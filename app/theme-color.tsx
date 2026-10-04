'use client'
import { useTheme } from 'next-themes'
import { useEffect } from 'react'

// The viewport metadata ships one theme-color per system color scheme. Once
// the theme is known (including a manual pick that differs from the system),
// point every one of them at the active background.
export function ThemeColor() {
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    if (!resolvedTheme) return
    const color = resolvedTheme === 'dark' ? '#0a0a0a' : '#ffffff'
    document
      .querySelectorAll('meta[name="theme-color"]')
      .forEach((meta) => meta.setAttribute('content', color))
  }, [resolvedTheme])

  return null
}
