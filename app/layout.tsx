import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { MotionConfig } from 'motion/react'
import './globals.css'
import { Header } from './header'
import { Footer } from './footer'
import { Sunlight } from '@/components/sunlight'
import { paintSky } from '@/components/sunlight/sky'
import { place } from '@/components/sunlight/place'
import {
  HIGHLIGHTED_AUTHORS,
  PERSONAL_INFO,
  SITE_URL,
  SOCIAL_LINKS,
} from './data'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Only until the first paint: the sky script below then points it at the
  // colour of the hour
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: '/',
  },
  title: {
    default: PERSONAL_INFO.name.english,
    template: `%s | ${PERSONAL_INFO.name.english}`,
  },
  description: PERSONAL_INFO.description,
  // The card image itself comes from app/opengraph-image.tsx.
  openGraph: {
    type: 'website',
    url: '/',
    siteName: PERSONAL_INFO.name.english,
    title: PERSONAL_INFO.name.english,
    description: PERSONAL_INFO.description,
  },
  twitter: {
    card: 'summary_large_image',
  },
}

// Tells search engines who this site is about, and ties the name variants
// used on papers to the same person and profiles.
const PERSON_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: PERSONAL_INFO.name.english,
  alternateName: [...HIGHLIGHTED_AUTHORS, PERSONAL_INFO.name.chinese],
  url: SITE_URL,
  image: `${SITE_URL}/img/profile-light.png`,
  jobTitle: PERSONAL_INFO.jobTitle,
  worksFor: { '@type': 'Organization', ...PERSONAL_INFO.affiliation },
  sameAs: SOCIAL_LINKS.map((link) => link.link).filter((link) =>
    link.startsWith('http'),
  ),
}

const geist = Geist({
  variable: '--font-geist',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geist.variable} ${geistMono.variable} bg-background tracking-tight antialiased`}
      >
        <script
          type="application/ld+json"
          // Escape "<" so the JSON can never close the script tag early.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(PERSON_JSON_LD).replace(/</g, '\\u003c'),
          }}
        />
        {/* There is no light or dark mode to pick: the site follows the
            visitor's sky, and the home page is a wall that takes the colour
            of the hour. Work out roughly where they are from their time zone
            and set both before the first frame, so nothing flashes; Sunlight
            keeps them up to date after that. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `var p;try{p=window.__sunPlace=(${place.toString()})()}catch(e){}try{(${paintSky.toString()})(undefined,location.pathname==='/',true,p)}catch(e){}`,
          }}
        />
        <Sunlight />
        {/* Visitors who ask for reduced motion get fades instead of
            movement across every motion component. */}
        <MotionConfig reducedMotion="user">
          <div className="flex min-h-screen w-full flex-col font-[family-name:var(--font-geist)]">
            <div className="relative mx-auto w-full max-w-screen-sm flex-1 px-4 pt-10 sm:pt-20">
              <Header />
              {children}
              <Footer />
            </div>
          </div>
        </MotionConfig>
      </body>
    </html>
  )
}
