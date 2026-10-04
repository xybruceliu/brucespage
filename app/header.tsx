'use client'
import { TextScramble } from '@/components/ui/text-scramble'
import { CompanyTag, AdobeIcon } from '@/components/ui/company-tag'
import { Tilt } from '@/components/ui/tilt'
import Image from 'next/image'
import { useState } from 'react'
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from 'motion/react'
import { PERSONAL_INFO } from './data'

// The profile photo already tilts toward the cursor; this adds a soft sheen
// that tracks the pointer across its surface, so the tilt reads as a real,
// light-catching object rather than a flat plane. Pointer-driven only —
// nothing animates on its own — so it stays calm at rest.
function ProfilePhoto() {
  const [lit, setLit] = useState(false)
  const x = useMotionValue(50)
  const y = useMotionValue(50)
  const sx = useSpring(x, { stiffness: 200, damping: 25 })
  const sy = useSpring(y, { stiffness: 200, damping: 25 })
  const sheen = useMotionTemplate`radial-gradient(circle at ${sx}% ${sy}%, rgba(255,255,255,0.55), transparent 55%)`

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    x.set(((e.clientX - rect.left) / rect.width) * 100)
    y.set(((e.clientY - rect.top) / rect.height) * 100)
  }

  return (
    <Tilt rotationFactor={10} isRevese>
      <div
        className="relative overflow-hidden rounded-md"
        onMouseMove={handleMove}
        onMouseEnter={() => setLit(true)}
        onMouseLeave={() => setLit(false)}
      >
        {/* Both are in the markup and CSS picks one, so the right photo shows
            on first paint (no light photo flashing in dark mode). The hidden
            one is lazy and display: none, so it never downloads. */}
        <Image
          src="/img/profile-light.png"
          alt={PERSONAL_INFO.name.english}
          width={128}
          height={128}
          className="h-28 w-28 rounded-md object-cover dark:hidden"
        />
        <Image
          src="/img/profile-dark.png"
          alt={PERSONAL_INFO.name.english}
          width={128}
          height={128}
          className="hidden h-28 w-28 rounded-md object-cover dark:block"
        />
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-md"
          style={{ background: sheen, mixBlendMode: 'soft-light' }}
          animate={{ opacity: lit ? 1 : 0 }}
          transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
        />
      </div>
    </Tilt>
  )
}

export function Header() {
  const [isChinese, setIsChinese] = useState(false)

  return (
    <header className="mb-8 flex items-center justify-between">
      <div className="flex flex-col gap-3">
        <motion.div
          initial={{ opacity: 0, y: -20, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.3 }}
        >
          <ProfilePhoto />
        </motion.div>
        <div>
          <h1 className="text-foreground font-medium">
            <button
              type="button"
              onClick={() => setIsChinese(!isChinese)}
              aria-pressed={isChinese}
              lang={isChinese ? 'zh-Hans' : undefined}
              className="inline-block cursor-pointer rounded-sm text-left"
            >
              <TextScramble
                as="span"
                characterSet={`${PERSONAL_INFO.name.chinese}${PERSONAL_INFO.name.english}`}
                key={isChinese ? 'chinese' : 'english'}
              >
                {isChinese
                  ? PERSONAL_INFO.name.chinese
                  : PERSONAL_INFO.name.english}
              </TextScramble>
            </button>
          </h1>
          {(() => {
            const title = PERSONAL_INFO.title
            const i = title.indexOf('Adobe')
            if (i === -1) {
              return (
                <TextScramble
                  className="text-muted-foreground"
                  characterSet={title.replace(/\s/g, '')}
                >
                  {title}
                </TextScramble>
              )
            }
            const before = title.slice(0, i)
            const after = title.slice(i + 'Adobe'.length)
            return (
              <p className="text-muted-foreground">
                <TextScramble
                  as="span"
                  characterSet={before.replace(/\s/g, '')}
                >
                  {before}
                </TextScramble>
                <CompanyTag icon={AdobeIcon} color="#FA0F00">
                  Adobe
                </CompanyTag>
                {after}
              </p>
            )
          })()}
        </div>
      </div>
    </header>
  )
}
