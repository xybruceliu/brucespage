'use client'

import { useMemo, useRef } from 'react'
import { RotateCcw } from 'lucide-react'
import { here, paintSky, type RGB } from './sky'

// The sun's path through today, in the footer of the home page: the curve of
// its height over the day, the horizon as a dashed line, and the sun on it
// now. Drag the sun along it, or use the arrow keys, to move the wall's hour.

const MINUTE = 60e3
const W = 104 // the width of the day, in pixels
const H = 22

const css = (c: RGB) => `rgb(${c[0]}, ${c[1]}, ${c[2]})`
const wrap = (m: number) => ((m % 1440) + 1440) % 1440

function midnight(time: number) {
  const d = new Date(time)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

/** The time, in the visitor's own 12 or 24 hours */
function labels(time: number) {
  const date = new Date(time)
  const twelve =
    new Intl.DateTimeFormat(undefined, { hour: 'numeric' }).resolvedOptions()
      .hourCycle === 'h12'
  const h = date.getHours()
  const hours = twelve
    ? String(((h + 11) % 12) + 1)
    : String(h).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const suffix = twelve ? (h < 12 ? 'AM' : 'PM') : ''
  return { hours, minutes, suffix }
}

const spoken = (time: number) => {
  const t = labels(time)
  return `${t.hours}:${t.minutes}${t.suffix ? ' ' + t.suffix : ''}`
}

// Today's light, every quarter of an hour, and when the sun rises and sets
function useDay(now: number) {
  const start = midnight(now)
  return useMemo(() => {
    const samples = Array.from({ length: 97 }, (_, i) =>
      paintSky(start + i * 15 * MINUTE, true, false, here()),
    )
    const crossings: number[] = []
    for (let i = 1; i < samples.length; i++) {
      const a = samples[i - 1].altitude
      const b = samples[i].altitude
      if (a < 0 !== b < 0) crossings.push((i - 1 + a / (a - b)) * 15)
    }
    return { start, samples, rise: crossings[0], set: crossings[1] }
  }, [start])
}

export function SunPath({
  time,
  now,
  simulated,
  onSet,
  onShift,
  onNow,
}: {
  /** The time being shown: the real one, or the one moved to */
  time: number
  /** The real time */
  now: number
  simulated: boolean
  onSet: (time: number) => void
  onShift: (by: number) => void
  onNow: () => void
}) {
  const day = useDay(now)
  const pick = useRef<(x: number) => void>(() => {})
  pick.current = (x) => {
    const f = Math.min(1, Math.max(0, x / W))
    onSet(day.start + Math.round(f * 1439) * MINUTE)
  }

  // Day above the horizon and night below, each scaled to fit
  const peak = Math.max(...day.samples.map((s) => s.altitude), 30)
  const trough = Math.max(...day.samples.map((s) => -s.altitude), 30)
  const y = (alt: number) =>
    H / 2 - (alt / (alt > 0 ? peak : trough)) * (H / 2 - 4)
  const curve = day.samples
    .map(
      (s, i) =>
        `${i ? 'L' : 'M'}${((i / 96) * W).toFixed(1)} ${y(s.altitude).toFixed(1)}`,
    )
    .join(' ')
  const minutes = wrap(Math.round((time - day.start) / MINUTE))
  const i = minutes / 15
  const a = day.samples[Math.floor(i)]
  const b = day.samples[Math.min(96, Math.ceil(i))]
  const alt = a.altitude + (b.altitude - a.altitude) * (i % 1)
  const at = (m: number) => {
    const t = labels(day.start + m * MINUTE)
    return `${t.hours}:${t.minutes}`
  }
  const t = labels(time)

  const rise = day.rise === undefined ? '' : at(day.rise)
  const set = day.set === undefined ? '' : at(day.set)
  const tip = rise && set ? `Sunrise ${rise} · Sunset ${set}` : undefined

  return (
    // One line, like the credit beside it: the time, then the path. Once the
    // time has been moved, the time itself becomes the way back: a small
    // pill with a reset arrow
    <div className="flex items-center gap-1.5">
      {(() => {
        const reading = (
          <>
            {simulated && (
              <RotateCcw
                aria-hidden="true"
                className="text-muted-foreground group-hover:text-foreground size-3 shrink-0 self-center transition-colors"
                strokeWidth={2}
              />
            )}
            {/* Exactly as wide as "00:00", so nothing moves when 9 turns
                  to 10 */}
            <span className="sun-path-time">
              <span aria-hidden="true" className="invisible">
                00:00
              </span>
              <span>
                {t.hours}:{t.minutes}
              </span>
            </span>
            {t.suffix && <span className="sun-path-suffix">{t.suffix}</span>}
          </>
        )
        const pill =
          'inline-flex items-baseline gap-1.5 rounded-full px-2 py-0.5'
        return simulated ? (
          <button
            type="button"
            onClick={onNow}
            title="Back to now"
            aria-label={`Showing ${spoken(time)}. Back to now`}
            className={`${pill} group bg-muted cursor-pointer transition-colors hover:bg-[color-mix(in_srgb,var(--foreground)_12%,transparent)] focus-visible:outline-2`}
          >
            {reading}
          </button>
        ) : (
          <span className={pill}>{reading}</span>
        )
      })()}
      <div
        role="slider"
        tabIndex={0}
        aria-label="Time of day on the wall"
        aria-valuemin={0}
        aria-valuemax={1439}
        aria-valuenow={minutes}
        aria-valuetext={spoken(time) + (tip ? `. ${tip}` : '')}
        title={tip}
        onKeyDown={(e) => {
          // Arrow keys move a quarter of an hour, page keys an hour
          const step =
            {
              ArrowRight: 15,
              ArrowUp: 15,
              ArrowLeft: -15,
              ArrowDown: -15,
              PageUp: 60,
              PageDown: -60,
            }[e.key] ?? 0
          if (!step) return
          e.preventDefault()
          onShift(step * MINUTE)
        }}
        onPointerDown={(e) => {
          const el = e.currentTarget
          try {
            el.setPointerCapture(e.pointerId)
          } catch {}
          const left = () => el.getBoundingClientRect().left
          pick.current(e.clientX - left())
          const move = (ev: PointerEvent) => pick.current(ev.clientX - left())
          const up = () => {
            el.removeEventListener('pointermove', move)
            el.removeEventListener('pointerup', up)
            el.removeEventListener('pointercancel', up)
          }
          el.addEventListener('pointermove', move)
          el.addEventListener('pointerup', up)
          el.addEventListener('pointercancel', up)
        }}
        // A little taller than it looks, so it is easy to catch
        className="-my-1 cursor-ew-resize touch-none rounded-sm py-1 select-none focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{ width: W }}
      >
        <svg
          width={W}
          height={H}
          viewBox={`0 0 ${W} ${H}`}
          aria-hidden="true"
          className="block overflow-visible"
        >
          <defs>
            <clipPath id="sun-path-day">
              <rect x={-4} y={-6} width={W + 8} height={H / 2 + 6} />
            </clipPath>
          </defs>
          <line
            x1={0}
            x2={W}
            y1={H / 2}
            y2={H / 2}
            stroke="var(--border)"
            strokeDasharray="2 3"
          />
          <path d={curve} fill="none" stroke="var(--border)" strokeWidth={1} />
          <path
            d={curve}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.25}
            clipPath="url(#sun-path-day)"
          />
          {/* Sunrise and sunset, where the path crosses the horizon */}
          {[day.rise, day.set].map(
            (m, k) =>
              m !== undefined && (
                <circle
                  key={k}
                  cx={(m / 1440) * W}
                  cy={H / 2}
                  r={1.5}
                  fill="currentColor"
                />
              ),
          )}
          <circle
            cx={(minutes / 1440) * W}
            cy={y(alt)}
            r={3.5}
            fill={css(day.samples[Math.round(i)].lit)}
            stroke="var(--foreground)"
            strokeOpacity={0.55}
            strokeWidth={1}
          />
        </svg>
      </div>
    </div>
  )
}
