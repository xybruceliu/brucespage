'use client'
import { AnimatedBackground } from '@/components/ui/animated-background'
import { TextLoop } from '@/components/ui/text-loop'
import { MonitorIcon, MoonIcon, SunIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { PERSONAL_INFO } from './data'

const THEMES_OPTIONS = [
  {
    label: 'Light',
    id: 'light',
    icon: <SunIcon className="h-4 w-4" />,
  },
  {
    label: 'Dark',
    id: 'dark',
    icon: <MoonIcon className="h-4 w-4" />,
  }
]

function ThemeSwitch() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <AnimatedBackground
      className="pointer-events-none rounded-[var(--radius-lg)] bg-muted"
      defaultValue={theme}
      transition={{
        type: 'spring',
        bounce: 0,
        duration: 0.4,
      }}
      enableHover={true}
    >
      {THEMES_OPTIONS.map((themeOption) => {
        return (
          <button
            key={themeOption.id}
            className={`inline-flex h-7 w-7 items-center justify-center text-muted-foreground transition-colors duration-200 focus-visible:outline-2 cursor-pointer ${
              themeOption.id === 'light'
                ? 'data-[checked=true]:text-amber-500 hover:text-amber-500'
                : 'data-[checked=true]:text-blue-700 hover:text-blue-700'
            }`}
            type="button"
            aria-label={`Switch to ${themeOption.label} theme`}
            data-id={themeOption.id}
            onClick={() => setTheme(themeOption.id)}
          >
            {themeOption.icon}
          </button>
        )
      })}
    </AnimatedBackground>
  )
}

export function Footer() {
  return (
    <footer className="mt-8 border-t border-border px-0 py-4">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
      © 2025 {PERSONAL_INFO.name.english}.
        <div className="text-xs text-muted-foreground">
          <ThemeSwitch />
        </div>
      </div>
    </footer>
  )
}
