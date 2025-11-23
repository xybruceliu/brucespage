'use client'
import { TextScramble } from '@/components/ui/text-scramble'
import { Tilt } from '@/components/ui/tilt'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { PERSONAL_INFO } from './data'

export function Header() {
  const [isDark, setIsDark] = useState(false)
  const [isChinese, setIsChinese] = useState(false)

  useEffect(() => {
    // Check initial theme
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'))
    }
    
    checkTheme()
    
    // Watch for theme changes
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })
    
    return () => observer.disconnect()
  }, [])

  return (
    <header className="mb-8 flex items-center justify-between">
      <div className="flex flex-col gap-3">
        <motion.div
          initial={{ opacity: 0, y: -20, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.3 }}
        >
          <Tilt rotationFactor={10} isRevese>
            <Image 
              src={isDark ? "/img/profile-dark.png" : "/img/profile-light.png"}
              alt="Bruce Liu"
              width={128}
              height={128}
              className="h-28 w-28 rounded-md object-cover"
            />
          </Tilt>
        </motion.div>
        <div>
          <div 
            onClick={() => setIsChinese(!isChinese)}
            className="font-medium text-foreground cursor-pointer inline-block"
          >
            <TextScramble
              characterSet={`${PERSONAL_INFO.name.chinese}${PERSONAL_INFO.name.english}`}
              key={isChinese ? 'chinese' : 'english'}
            >
              {isChinese ? PERSONAL_INFO.name.chinese : PERSONAL_INFO.name.english}
            </TextScramble>
          </div>
          <TextScramble
            className="text-muted-foreground"
            characterSet={PERSONAL_INFO.title.replace(/\s/g, '')}
          >
            {PERSONAL_INFO.title}
          </TextScramble>
        </div>
      </div>
    </header>
  )
}
