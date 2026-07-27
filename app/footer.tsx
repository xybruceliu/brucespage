'use client'
import { AnimatedBackground } from '@/components/ui/animated-background'
import { ArrowUpRightIcon } from '@/components/ui/arrow-up-right'
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
  },
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
      className="bg-muted pointer-events-none rounded-[var(--radius-lg)]"
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
            className={`text-muted-foreground inline-flex h-7 w-7 cursor-pointer items-center justify-center transition-colors duration-200 focus-visible:outline-2 ${
              themeOption.id === 'light'
                ? 'hover:text-amber-500 data-[checked=true]:text-amber-500'
                : 'hover:text-blue-700 data-[checked=true]:text-blue-700'
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
    <footer className="border-border mt-8 border-t px-0 py-4">
      <div className="text-muted-foreground flex items-center justify-between text-xs">
        <TextLoop
          className="overflow-y-clip text-xs"
          transition={{
            type: 'spring',
            stiffness: 1000,
            damping: 100,
            mass: 10,
          }}
          variants={{
            initial: {
              y: 20,
              rotateX: 90,
              opacity: 0,
              filter: 'blur(4px)',
            },
            animate: {
              y: 0,
              rotateX: 0,
              opacity: 1,
              filter: 'blur(0px)',
            },
            exit: {
              y: -20,
              rotateX: -90,
              opacity: 0,
              filter: 'blur(4px)',
            },
          }}
        >
          <span>
            © {new Date().getFullYear()} {PERSONAL_INFO.name.english}
          </span>
          <a
            href="https://github.com/xybruceliu/brucespage"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground underline-offset-2 transition-colors"
          >
            Brucespage Template
            <ArrowUpRightIcon className="inline h-3 w-3" />
          </a>
        </TextLoop>
        <div className="text-muted-foreground text-xs">
          <ThemeSwitch />
        </div>
      </div>
    </footer>
  )
}
