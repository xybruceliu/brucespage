'use client'
import { TextScramble } from '@/components/ui/text-scramble'
import Link from 'next/link'

export function Header() {
  return (
    <header className="mb-8 flex items-center justify-between">
      <div>
        <Link href="/" className="font-medium text-foreground">
          Bruce Liu
        </Link>
        <TextScramble
          className="text-muted-foreground"
          characterSet="Ph.D.Candidate@UCLA"
        >
          Ph.D. Candidate @ UCLA
        </TextScramble>
      </div>
    </header>
  )
}
