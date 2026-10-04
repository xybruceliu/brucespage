import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { PERSONAL_INFO } from './data'

// The card shown when the site is shared on Slack, LinkedIn, X, etc. Built
// from data.ts at build time, so it never goes stale like a screenshot would.
export const alt = `${PERSONAL_INFO.name.english}, ${PERSONAL_INFO.title}`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OpenGraphImage() {
  const photo = await readFile(
    join(process.cwd(), 'public/img/profile-light.png'),
  )

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '0 120px',
          background: '#ffffff',
          color: '#0a0a0a',
        }}
      >
        <img
          src={`data:image/png;base64,${photo.toString('base64')}`}
          width={176}
          height={176}
          alt=""
          style={{ borderRadius: 14 }}
        />
        <div
          style={{
            marginTop: 48,
            fontSize: 68,
            letterSpacing: '-0.025em',
          }}
        >
          {PERSONAL_INFO.name.english}
        </div>
        <div
          style={{
            marginTop: 12,
            fontSize: 36,
            letterSpacing: '-0.015em',
            color: '#737373',
          }}
        >
          {PERSONAL_INFO.title}
        </div>
      </div>
    ),
    size,
  )
}
