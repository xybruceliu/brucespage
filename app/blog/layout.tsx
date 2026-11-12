'use client'
import { TextMorph } from '@/components/ui/text-morph'
import { ScrollProgress } from '@/components/ui/scroll-progress'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { PERSONAL_INFO } from '../data'

// A post's page: one quiet line of nav in place of the homepage's header - the
// way home on the left, Copy URL on the right - then the post.

function HomeLink() {
  return (
    <Link
      href="/"
      className="group text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 rounded-sm text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
    >
      <ArrowLeft
        aria-hidden="true"
        className="h-3.5 w-3.5 transition-transform duration-200 ease-out group-hover:-translate-x-0.5 motion-reduce:transition-none"
      />
      {PERSONAL_INFO.name.english}
    </Link>
  )
}

function CopyButton() {
  const [text, setText] = useState('Copy')
  const currentUrl = typeof window !== 'undefined' ? window.location.href : ''

  useEffect(() => {
    setTimeout(() => {
      setText('Copy')
    }, 2000)
  }, [text])

  return (
    <button
      onClick={() => {
        setText('Copied')
        navigator.clipboard.writeText(currentUrl)
      }}
      className="font-base text-muted-foreground hover:text-foreground flex cursor-pointer items-center gap-1 rounded-sm text-center text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
      type="button"
    >
      <TextMorph>{text}</TextMorph>
      <span>URL</span>
    </button>
  )
}

export default function LayoutBlogPost({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <div className="bg-background pointer-events-none fixed top-0 left-0 z-10 h-12 w-full to-transparent backdrop-blur-xl [-webkit-mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <ScrollProgress
        className="bg-border fixed top-0 z-20 h-0.5"
        springOptions={{
          bounce: 0,
        }}
      />

      <nav className="flex items-center justify-between">
        <HomeLink />
        <CopyButton />
      </nav>
      <main className="prose prose-gray prose-h4:prose-base dark:prose-invert prose-h1:text-xl prose-h1:font-medium prose-h2:mt-12 prose-h2:scroll-m-20 prose-h2:text-lg prose-h2:font-medium prose-h3:text-base prose-h3:font-medium prose-h4:font-medium prose-h5:text-base prose-h5:font-medium prose-h6:text-base prose-h6:font-medium prose-strong:font-medium mt-12 pb-20 sm:mt-16">
        {children}
      </main>
    </>
  )
}
