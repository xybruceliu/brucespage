'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { usePathname } from 'next/navigation'
import { SunPath } from './sun-path'
import { here, paintSky, type RGB, type Sky } from './sky'
import { makeScene, SCENES, type Scene, type SceneName } from './scenes'

// The home page as a sunlit wall, after Sunstill (sunstill.app). The wall
// takes the colour of the hour on the visitor's clock, and the sun (or the
// moon) comes in through a window in the side wall, just past the right edge
// of the screen, so the patch of light sweeps across the page over the day.
// The sun's path in the footer shows the time and moves it. Everything in it
// is soft, so it is drawn on a small canvas and stretched over the screen.

// The room, in metres
const SIDE_WALL = 0.02 // from the right edge of the screen to that wall
const NEAR = 0.5 // from the page to the near edge of the window
const TOP = -0.1 // top of the window, measured down from the top of the screen

const FPS = 30
const RAD = Math.PI / 180
// The light the scenes were composed under; at other hours the plant's
// shadow slides across the window
const REFERENCE = { elevation: 20 * RAD, bearing: 50 * RAD }

type Angles = Pick<Sky, 'elevation' | 'bearing'>

const wind = (t: number) =>
  0.6 + 0.25 * Math.sin(t * 0.11) + 0.15 * Math.sin(t * 0.043 + 1.7)

const css = (c: RGB) => `rgb(${c[0]}, ${c[1]}, ${c[2]})`

// Where a shadow cast from `depth` metres outside the window lands in it
function shift(light: Angles, depth: number) {
  return {
    u: -depth * Math.tan(light.bearing),
    v: (depth * Math.tan(light.elevation)) / Math.cos(light.bearing),
  }
}

// Safari only recently learned to blur on a canvas
function canvasFilters() {
  const c = document.createElement('canvas')
  c.width = c.height = 8
  const g = c.getContext('2d', { willReadFrequently: true })
  if (!g || !('filter' in g)) return false
  g.filter = 'blur(2px)'
  g.fillStyle = '#fff'
  g.fillRect(3, 3, 2, 2)
  return g.getImageData(1, 1, 1, 1).data[3] > 0
}

function createRenderer(canvas: HTMLCanvasElement) {
  const filters = canvasFilters()
  const layer = () => document.createElement('canvas')
  // In the plane of the window
  const aperture = layer() // the opening, softened
  const frame = layer() // what never moves, softened
  const sharp = layer() // the plant before it is softened
  const foliage = layer() // the leaves, softened
  const occluders = layer() // everything in the light's way
  const mask = layer() // where the light gets through
  const through = layer() // where it shines through the leaves themselves
  // On the wall
  const light = layer() // the light's soft edges, in its own colour
  const core = layer() // the middle of the light, washed out nearly to white
  const bloom = layer() // the middle bleeding past its edges, half size
  const halo = layer() // the haze the light spreads round itself, small
  const glow = layer() // the light bouncing round the room, tiny and blurred
  const golden = layer() // the light through the leaves, half size
  let scene: Scene | null = null
  let width = 0
  let height = 0
  let scale = 0.5 // canvas pixels per CSS pixel
  let k = 300 // CSS pixels per metre of wall
  let rho = 300 // pixels per metre in the plane of the window
  let margin = 0.08 // metres around the window, for its soft edges
  let across: CanvasGradient | null = null
  let corners: CanvasGradient | null = null

  const ctx = (c: HTMLCanvasElement) => c.getContext('2d')!
  const reset = (c: HTMLCanvasElement) => {
    const g = ctx(c)
    g.setTransform(1, 0, 0, 1, 0, 0)
    g.globalCompositeOperation = 'source-over'
    g.globalAlpha = 1
    g.filter = 'none'
    g.clearRect(0, 0, c.width, c.height)
    return g
  }
  const blur = (px: number) =>
    filters ? `blur(${Math.max(0, px).toFixed(2)}px)` : 'none'
  const inMetres = (g: CanvasRenderingContext2D, du = 0, dv = 0) => {
    g.setTransform(rho, 0, 0, rho, (margin + du) * rho, (margin + dv) * rho)
    g.fillStyle = g.strokeStyle = '#fff'
    g.lineCap = 'round'
  }

  // The window as it lands on the wall: its vertical edges stay vertical,
  // its horizontal ones slope down away from the window
  function projection(at: Angles, by = 1): DOMMatrix2DInit {
    const out = 1 / Math.tan(at.bearing)
    const down = Math.tan(at.elevation) / Math.sin(at.bearing)
    const sk = scale * k * by
    const wall = width / k + SIDE_WALL
    return {
      a: (-sk * out) / rho,
      b: (sk * down) / rho,
      c: 0,
      d: sk / rho,
      e: sk * (wall - (NEAR - margin) * out),
      f: sk * (TOP - margin + (NEAR - margin) * down),
    }
  }

  function build() {
    if (!scene || !width || !height) return
    k = Math.min(420, Math.max(230, height / 2.6))
    // On a phone the text fills the screen, so the window is smaller there
    if (width < 640) k = Math.min(k, width / 1.8)
    scale = Math.min(0.6, Math.sqrt(520_000 / (width * height)))
    canvas.width = light.width = core.width = Math.round(width * scale)
    canvas.height = light.height = core.height = Math.round(height * scale)
    bloom.width = golden.width = Math.ceil(canvas.width / 2)
    bloom.height = golden.height = Math.ceil(canvas.height / 2)
    halo.width = Math.ceil(canvas.width / 4)
    halo.height = Math.ceil(canvas.height / 4)
    glow.width = Math.ceil(canvas.width / 8)
    glow.height = Math.ceil(canvas.height / 8)
    rho = Math.min(480, 2 * scale * k)
    margin = Math.max(0.08, scene.frameBlur * 4)
    const w = Math.ceil((scene.width + 2 * margin) * rho)
    const h = Math.ceil((scene.height + 2 * margin) * rho)
    for (const c of [
      aperture,
      frame,
      sharp,
      foliage,
      occluders,
      mask,
      through,
    ]) {
      c.width = w
      c.height = h
    }
    scene.prepare(rho)

    // The opening, a little brighter where the light comes in
    let g = reset(aperture)
    g.filter = blur(scene.frameBlur * 1.4 * rho)
    inMetres(g)
    const fade = g.createLinearGradient(0, 0, scene.width, scene.height)
    fade.addColorStop(0, '#fff')
    fade.addColorStop(1, 'rgba(255, 255, 255, 0.9)')
    g.fillStyle = fade
    g.fillRect(0, 0, scene.width, scene.height)

    g = reset(sharp)
    inMetres(g)
    scene.drawFrame(g)
    g = reset(frame)
    g.filter = blur(scene.frameBlur * rho)
    g.drawImage(sharp, 0, 0)

    // The room is darker away from the window and into the corners
    g = ctx(canvas)
    across = g.createLinearGradient(canvas.width, 0, 0, 0)
    across.addColorStop(0, 'rgba(0, 0, 0, 0)')
    across.addColorStop(1, 'rgba(0, 0, 0, 0.03)')
    const r = Math.hypot(canvas.width, canvas.height)
    corners = g.createRadialGradient(
      canvas.width * 0.7,
      canvas.height * 0.35,
      r * 0.2,
      canvas.width * 0.7,
      canvas.height * 0.35,
      r * 0.85,
    )
    corners.addColorStop(0, 'rgba(0, 0, 0, 0)')
    corners.addColorStop(1, 'rgba(0, 0, 0, 0.06)')
  }

  function draw(t: number, sky: Sky, gust: number) {
    if (!scene || !canvas.width) return
    const now = shift(sky, scene.depth)
    const ref = shift(REFERENCE, scene.depth)
    let g = reset(sharp)
    inMetres(g, now.u - ref.u, now.v - ref.v)
    scene.drawPlant(g, t, gust)
    g = reset(foliage)
    g.filter = blur(scene.plantBlur * rho)
    g.drawImage(sharp, 0, 0)
    // A canopy further out: its shadow moves more with the sun, and blurs
    // more, into dappled light
    const far = scene.far
    if (far) {
      const fNow = shift(sky, far.depth)
      const fRef = shift(REFERENCE, far.depth)
      g = reset(sharp)
      inMetres(g, fNow.u - fRef.u, fNow.v - fRef.v)
      far.draw(g, t, gust)
      g = ctx(foliage)
      g.filter = blur(far.blur * rho)
      g.drawImage(sharp, 0, 0)
      g.filter = 'none'
    }

    g = reset(occluders)
    g.drawImage(frame, 0, 0)
    g.drawImage(foliage, 0, 0)

    // Where the light gets through
    g = reset(mask)
    g.drawImage(aperture, 0, 0)
    g.globalCompositeOperation = 'destination-out'
    g.drawImage(occluders, 0, 0)

    // The light on the wall. Like real sunlight it is too bright for its
    // own colour in the middle, which washes out nearly to white; the colour
    // shows at its soft edges, which reach a little past the middle's, and
    // in the shadows of the slats and leaves, which the edges half fill
    g = reset(light)
    g.imageSmoothingQuality = 'high'
    g.setTransform(projection(sky))
    g.filter = blur(0.02 * scale * k)
    g.drawImage(mask, 0, 0)
    if (filters) {
      g.filter = blur(0.05 * scale * k)
      g.globalAlpha = 0.45
      g.drawImage(mask, 0, 0)
    }
    g.setTransform(1, 0, 0, 1, 0, 0)
    g.filter = 'none'
    g.globalAlpha = 1
    g.globalCompositeOperation = 'source-in'
    g.fillStyle = css(sky.lit)
    g.fillRect(0, 0, light.width, light.height)

    g = reset(core)
    g.imageSmoothingQuality = 'high'
    g.setTransform(projection(sky))
    g.drawImage(mask, 0, 0)
    g.setTransform(1, 0, 0, 1, 0, 0)
    g.globalCompositeOperation = 'source-in'
    g.fillStyle = css(sky.core)
    g.fillRect(0, 0, core.width, core.height)

    // Too bright to keep inside its own edges: the middle bleeds a little
    // past them, the way an overexposed patch does
    g = reset(bloom)
    g.setTransform(projection(sky, 1 / 2))
    g.filter = blur((0.035 * scale * k) / 2)
    g.drawImage(mask, 0, 0)
    g.setTransform(1, 0, 0, 1, 0, 0)
    g.filter = 'none'
    g.globalCompositeOperation = 'source-in'
    g.fillStyle = css(sky.core)
    g.fillRect(0, 0, bloom.width, bloom.height)

    // And a haze round it, the way a bright patch glows in the eye
    g = reset(halo)
    g.setTransform(projection(sky, 1 / 4))
    g.filter = blur((0.16 * scale * k) / 4)
    g.drawImage(mask, 0, 0)
    g.setTransform(1, 0, 0, 1, 0, 0)
    g.filter = 'none'
    g.globalCompositeOperation = 'source-in'
    g.fillStyle = css(sky.tint)
    g.fillRect(0, 0, halo.width, halo.height)

    // And the same light bounced around the room
    g = reset(glow)
    g.setTransform(projection(sky, 1 / 8))
    g.filter = blur(3)
    g.drawImage(mask, 0, 0)
    g.setTransform(1, 0, 0, 1, 0, 0)
    g.filter = 'none'
    g.globalCompositeOperation = 'source-in'
    g.fillStyle = css(sky.lit)
    g.fillRect(0, 0, glow.width, glow.height)

    // Sun through the leaves themselves: inside the window, behind leaves
    const leaves = scene.translucent
    if (leaves && sky.strength > 0) {
      g = reset(through)
      g.drawImage(aperture, 0, 0)
      g.globalCompositeOperation = 'destination-out'
      g.drawImage(frame, 0, 0)
      g.globalCompositeOperation = 'destination-in'
      g.drawImage(foliage, 0, 0)
      g = reset(golden)
      g.imageSmoothingQuality = 'high'
      g.setTransform(projection(sky, 1 / 2))
      g.filter = blur(0.004 * scale * k)
      g.drawImage(through, 0, 0)
      g.setTransform(1, 0, 0, 1, 0, 0)
      g.filter = 'none'
      g.globalCompositeOperation = 'source-in'
      g.fillStyle = css(leaves.colour)
      g.fillRect(0, 0, golden.width, golden.height)
    }

    g = reset(canvas)
    g.fillStyle = css(sky.wall)
    g.fillRect(0, 0, canvas.width, canvas.height)
    if (across && corners) {
      g.fillStyle = across
      g.fillRect(0, 0, canvas.width, canvas.height)
      g.fillStyle = corners
      g.fillRect(0, 0, canvas.width, canvas.height)
    }
    g.imageSmoothingQuality = 'high'
    g.globalAlpha = 0.55
    g.drawImage(glow, 0, 0, canvas.width, canvas.height)
    // Light adds to the wall, so the haze brightens it and never greys it
    g.globalCompositeOperation = 'screen'
    g.globalAlpha = 0.85 * sky.strength
    g.drawImage(halo, 0, 0, canvas.width, canvas.height)
    if (leaves && sky.strength > 0) {
      g.globalAlpha = leaves.amount * sky.strength
      g.drawImage(golden, 0, 0, canvas.width, canvas.height)
    }
    g.globalCompositeOperation = 'source-over'
    g.globalAlpha = 1
    g.drawImage(light, 0, 0)
    g.drawImage(core, 0, 0)
    g.globalCompositeOperation = 'screen'
    g.globalAlpha = 0.55 * sky.strength
    g.drawImage(bloom, 0, 0, canvas.width, canvas.height)
    g.globalCompositeOperation = 'source-over'
    g.globalAlpha = 1
  }

  return {
    soft: !filters,
    resize(w: number, h: number) {
      width = w
      height = h
      build()
    },
    setScene(next: Scene) {
      scene = next
      build()
    },
    draw,
  }
}

// A faint grain, as on a photograph of a wall, drawn once at full resolution
function grain() {
  const size = 160
  const c = document.createElement('canvas')
  c.width = c.height = size
  const g = c.getContext('2d')!
  const img = g.createImageData(size, size)
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.random() < 0.5 ? 0 : 255
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v
    img.data[i + 3] = Math.random() * 7
  }
  g.putImageData(img, 0, 0)
  return c.toDataURL()
}

const HOUR = 3600e3
const DAY = 24 * HOUR

export function Sunlight() {
  const pathname = usePathname()
  return pathname === '/' ? <Room /> : <PlainSky />
}

// Every other page: light by day and dark by night, and nothing more
function PlainSky() {
  useEffect(() => {
    const paint = () => paintSky(undefined, false, true, here())
    paint()
    const id = window.setInterval(paint, 60_000)
    return () => window.clearInterval(id)
  }, [])
  return null
}

function Room() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const grainRef = useRef<HTMLDivElement>(null)
  // How far the visitor has moved the clock on, and the real time it counts
  // from; the board shows the two together
  const [offset, setOffset] = useState(0)
  const [now, setNow] = useState(() => Date.now())
  // The footer keeps a place for the sun's path
  const [slot, setSlot] = useState<HTMLElement | null>(null)
  const settings = useRef({
    offset: 0,
    jump: false,
    scene: 'ginkgo' as SceneName,
  })
  const redraw = useRef<(() => void) | null>(null)

  // `?sun=17.5` opens the page at half past five; `?scene=blinds` changes
  // the window
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const scene = params.get('scene')
    if (scene && (SCENES as readonly string[]).includes(scene))
      settings.current.scene = scene as SceneName
    setSlot(document.getElementById('sun-path'))
    const hour = parseFloat(params.get('sun') ?? '')
    if (!Number.isNaN(hour)) {
      const d = new Date()
      settings.current.jump = true
      setOffset(
        Math.round((hour - d.getHours() - d.getMinutes() / 60) * 60) * 60e3,
      )
    }
    const id = window.setInterval(() => setNow(Date.now()), 10_000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const current = settings.current
    if (grainRef.current)
      grainRef.current.style.backgroundImage = `url(${grain()})`
    const renderer = createRenderer(canvas)
    if (renderer.soft) canvas.style.filter = 'blur(2px)'
    renderer.setScene(makeScene(current.scene))
    renderer.resize(window.innerWidth, window.innerHeight)

    const still = window.matchMedia('(prefers-reduced-motion: reduce)')
    const start = performance.now()
    let sky: Sky | null = null
    // The offset the sky is showing, which eases after the clock's
    let shown = current.offset
    let frame = 0
    let last = -Infinity
    let lastFrame = start
    let resizing = 0

    const repaint = () => {
      sky = paintSky(Date.now() + shown, true, true, here())
    }
    const render = (time: number) => {
      const dt = Math.min(100, time - lastFrame)
      lastFrame = time
      const goal = current.offset
      if (shown !== goal) {
        // A day on is the same hour: always go the short way round
        shown += Math.round((goal - shown) / DAY) * DAY
        if (still.matches || current.jump) shown = goal
        else {
          shown += (goal - shown) * (1 - Math.exp(-dt / 220))
          if (Math.abs(goal - shown) < 30e3) shown = goal
        }
        current.jump = false
        repaint()
      } else if (!sky) repaint()
      const t = still.matches ? 0 : (time - start) / 1000
      renderer.draw(t, sky!, wind(t))
      canvas.style.opacity = '1'
    }
    const tick = (time: number) => {
      frame = requestAnimationFrame(tick)
      if (time - last < 1000 / FPS - 2) return
      last = time
      render(time)
    }
    const play = () => {
      cancelAnimationFrame(frame)
      if (document.hidden) return
      repaint()
      if (still.matches) render(performance.now())
      else frame = requestAnimationFrame(tick)
    }
    // Phones resize as their toolbars come and go; the canvas just stretches
    // until they settle
    const onResize = () => {
      window.clearTimeout(resizing)
      resizing = window.setTimeout(() => {
        renderer.resize(window.innerWidth, window.innerHeight)
        render(performance.now())
      }, 150)
    }
    // The sky moves on with the real clock too
    const clock = window.setInterval(() => {
      if (document.hidden) return
      repaint()
      if (still.matches) render(performance.now())
    }, 20_000)

    redraw.current = () => render(performance.now())
    play()
    window.addEventListener('resize', onResize)
    document.addEventListener('visibilitychange', play)
    still.addEventListener('change', play)
    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(resizing)
      window.clearInterval(clock)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', play)
      still.removeEventListener('change', play)
      redraw.current = null
      // Hand the page back to the plain sky of every other page
      paintSky(undefined, false, true, here())
    }
  }, [])

  useEffect(() => {
    settings.current.offset = offset
    redraw.current?.()
  }, [offset])

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 h-full w-full opacity-0 transition-opacity duration-700 print:hidden"
      />
      <div
        ref={grainRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 print:hidden"
      />
      {slot &&
        createPortal(
          <SunPath
            time={now + offset}
            now={now}
            simulated={Math.abs(offset) >= 60e3}
            onSet={(time) => setOffset(time - Date.now())}
            onShift={(by) => setOffset((o) => o + by)}
            onNow={() => setOffset(0)}
          />,
          slot,
        )}
    </>
  )
}
