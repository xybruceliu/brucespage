'use client'
import { useTheme } from 'next-themes'
import { useEffect } from 'react'

export function ThemeColor() {
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        resolvedTheme === 'dark' ? '#09090b' : '#ffffff'
      )
    }
  }, [resolvedTheme])

  return null
}

