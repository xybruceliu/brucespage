'use client'
import { TextEffect } from '@/components/ui/text-effect'
import Link from 'next/link'

export function Header() {
  return (
    <header className="mb-8 flex items-center justify-between">
      <div>
        <Link href="/" className="font-medium text-foreground">
          Julien Nim
        </Link>
        <TextEffect
          as="p"
          preset="fade"
          per="char"
          className="text-muted-foreground"
          delay={0.5}
        >
          Design Engineer
        </TextEffect>
      </div>
    </header>
  )
}
