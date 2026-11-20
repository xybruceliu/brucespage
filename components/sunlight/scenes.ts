// What stands between the sun and the page: a window with its blind or its
// bars, and a plant. Everything is drawn in white, in metres, in the plane of
// the window: u runs from the edge nearest the page out into the room (which
// is right to left on screen), v from the top of the window down.

export const SCENES = [
  'blinds',
  'olive',
  'ginkgo',
  'bamboo',
  'curtain',
  'palm',
  'moon',
] as const
export type SceneName = (typeof SCENES)[number]

export type Scene = {
  width: number
  height: number
  /** Where the plant stands, in metres from the window: + outside, − inside. */
  depth: number
  /** How soft the shadows are, in metres of penumbra. */
  frameBlur: number
  plantBlur: number
  /** Builds whatever depends on the drawing resolution. */
  prepare(pxPerMetre: number): void
  /** The parts that never move. */
  drawFrame(g: CanvasRenderingContext2D): void
  /** The parts the wind moves; `t` in seconds, `wind` from 0 to 1. */
  drawPlant(g: CanvasRenderingContext2D, t: number, wind: number): void
  /** Leaves further out behind the plant, drawn softer: a canopy. */
  far?: {
    depth: number
    blur: number
    draw(g: CanvasRenderingContext2D, t: number, wind: number): void
  }
  /** Leaves thin enough for the sun to shine through, in this colour, and
   * how much of it. */
  translucent?: { colour: [number, number, number]; amount: number }
}

export function makeScene(name: SceneName): Scene {
  switch (name) {
    case 'olive':
      return olive()
    case 'ginkgo':
      return ginkgo()
    case 'bamboo':
      return bamboo()
    case 'curtain':
      return curtain()
    case 'palm':
      return palm()
    case 'moon':
      return moon()
    default:
      return blinds()
  }
}

const TAU = Math.PI * 2
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

// The same plant every visit
function random(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ---------- A venetian blind, and a monstera inside the room ----------

// A venetian blind, not quite all the way down, on a window whose two
// sashes meet in the middle
function venetian(rand: () => number, W: number, H: number) {
  const BOTTOM = 1.1
  const PITCH = 0.046
  const SLAT = 0.025
  const slats: { v: number; tilt: number }[] = []
  for (let v = 0.01; v < BOTTOM - SLAT; v += PITCH)
    slats.push({ v: v + (rand() - 0.5) * 0.004, tilt: (rand() - 0.5) * 0.006 })
  return (g: CanvasRenderingContext2D) => {
    // Where the two sashes meet
    g.fillRect(W / 2 - 0.011, -0.1, 0.022, H + 0.2)
    for (const s of slats) {
      g.beginPath()
      g.moveTo(-0.1, s.v)
      g.lineTo(W + 0.1, s.v + s.tilt)
      g.lineTo(W + 0.1, s.v + s.tilt + SLAT)
      g.lineTo(-0.1, s.v + SLAT)
      g.fill()
    }
    g.fillRect(-0.1, BOTTOM, W + 0.2, 0.03)
    // The cords that hold the slats
    for (const u of [0.24, 0.86]) g.fillRect(u, -0.1, 0.0035, BOTTOM + 0.1)
  }
}

function blinds(): Scene {
  const W = 1.1
  const H = 1.4
  const rand = random(11)
  const blind = venetian(rand, W, H)
  const plant = monstera(rand)

  return {
    width: W,
    height: H,
    depth: -0.12,
    frameBlur: 0.0065,
    plantBlur: 0.0045,
    prepare: plant.prepare,
    drawFrame: blind,
    drawPlant: plant.draw,
  }
}

type Sprite = {
  canvas: HTMLCanvasElement
  // In metres: where the stalk meets the leaf, and the sprite's size
  x: number
  y: number
  w: number
  h: number
}

function monstera(rand: () => number) {
  const root = { u: 0.5, v: 1.85 }
  // Angles are of the midrib in window coordinates: 0 points left on screen,
  // ±π right, negative is up
  const leaves = [
    { u: 0.52, v: 0.4, len: 0.32, ang: -2.25, fore: 0.95, bend: 0.16 },
    { u: 0.64, v: 0.84, len: 0.34, ang: -0.62, fore: 0.85, bend: -0.13 },
    { u: 0.4, v: 1.16, len: 0.28, ang: -2.6, fore: 0.8, bend: 0.11 },
  ].map((leaf) => ({
    ...leaf,
    seed: Math.floor(rand() * 1e9),
    phase: rand() * TAU,
    speed: 0.45 + rand() * 0.3,
    sprite: null as Sprite | null,
  }))

  return {
    prepare(rho: number) {
      for (const leaf of leaves)
        leaf.sprite = monsteraLeaf(leaf.len, rho, random(leaf.seed))
    },
    draw(g: CanvasRenderingContext2D, t: number, wind: number) {
      for (const leaf of leaves) {
        if (!leaf.sprite) continue
        const sway =
          wind *
          (0.03 * Math.sin(t * leaf.speed + leaf.phase) +
            0.012 * Math.sin(t * leaf.speed * 2.3 + leaf.phase * 1.7))
        // The stalk bends a little too and carries the leaf with it
        const c = Math.cos(sway * 0.25)
        const s = Math.sin(sway * 0.25)
        const du = leaf.u - root.u
        const dv = leaf.v - root.v
        const u = root.u + du * c - dv * s
        const v = root.v + du * s + dv * c
        g.lineWidth = 0.0075
        g.beginPath()
        g.moveTo(root.u, root.v)
        g.quadraticCurveTo(
          (root.u + u) / 2 + leaf.bend,
          (root.v + v) / 2 + 0.1,
          u,
          v,
        )
        g.stroke()

        const sp = leaf.sprite
        g.save()
        g.translate(u, v)
        g.rotate(leaf.ang + sway)
        g.scale(1, leaf.fore)
        g.drawImage(sp.canvas, -sp.x, -sp.y, sp.w, sp.h)
        g.restore()
      }
    },
  }
}

// A heart-shaped leaf with its slits and holes, drawn once
function monsteraLeaf(L: number, rho: number, rand: () => number): Sprite {
  const back = 0.18 * L
  const half = 0.5 * L
  const pad = 0.01
  const w = L + back + 2 * pad
  const h = 2 * half + 2 * pad
  const canvas = document.createElement('canvas')
  canvas.width = Math.ceil(w * rho)
  canvas.height = Math.ceil(h * rho)
  const g = canvas.getContext('2d')!
  g.setTransform(rho, 0, 0, rho, (back + pad) * rho, (half + pad) * rho)
  g.fillStyle = '#fff'

  // The blade, from the tip round both lobes and back
  g.beginPath()
  g.moveTo(L, 0)
  g.bezierCurveTo(0.9 * L, -0.3 * L, 0.66 * L, -0.48 * L, 0.38 * L, -0.48 * L)
  g.bezierCurveTo(
    0.12 * L,
    -0.48 * L,
    -0.12 * L,
    -0.42 * L,
    -0.16 * L,
    -0.24 * L,
  )
  g.bezierCurveTo(-0.18 * L, -0.12 * L, -0.05 * L, -0.04 * L, 0, 0)
  g.bezierCurveTo(-0.05 * L, 0.04 * L, -0.18 * L, 0.12 * L, -0.16 * L, 0.24 * L)
  g.bezierCurveTo(-0.12 * L, 0.42 * L, 0.12 * L, 0.48 * L, 0.38 * L, 0.48 * L)
  g.bezierCurveTo(0.66 * L, 0.48 * L, 0.9 * L, 0.3 * L, L, 0)
  g.fill()

  // Slits along the veins, which leave the midrib pointing back into the
  // lobes near the stalk and forward near the tip
  g.globalCompositeOperation = 'destination-out'
  const n = 7
  for (const side of [-1, 1]) {
    for (let i = 0; i < n; i++) {
      const f = (i + 0.5) / n
      const x0 = lerp(0, 0.84, f) * L
      const ang = lerp(2.05, 0.75, f) + (rand() - 0.5) * 0.15
      const dx = Math.cos(ang)
      const dy = Math.sin(ang) * side
      const r0 = (0.13 + 0.1 * rand()) * L * (1 - 0.5 * f)
      const r1 = 0.7 * L
      const w0 = 0.008 * L
      const w1 = (0.05 + 0.03 * rand()) * L
      g.beginPath()
      g.moveTo(x0 + dx * r0 - (dy * w0) / 2, dy * r0 + (dx * w0) / 2)
      g.lineTo(x0 + dx * r1 - (dy * w1) / 2, dy * r1 + (dx * w1) / 2)
      g.lineTo(x0 + dx * r1 + (dy * w1) / 2, dy * r1 - (dx * w1) / 2)
      g.lineTo(x0 + dx * r0 + (dy * w0) / 2, dy * r0 - (dx * w0) / 2)
      g.fill()

      // Now and then a small hole closer in, between two veins
      if (i > 0 && rand() < 0.6) {
        const hf = f - 0.5 / n
        const ha = lerp(2.05, 0.75, hf)
        const r = 0.085 * L
        g.beginPath()
        g.ellipse(
          lerp(0, 0.84, hf) * L + Math.cos(ha) * r,
          Math.sin(ha) * side * r,
          0.03 * L,
          0.011 * L,
          ha * side,
          0,
          TAU,
        )
        g.fill()
      }
    }
  }
  g.globalCompositeOperation = 'source-over'
  return { canvas, x: back + pad, y: half + pad, w, h }
}

// ---------- A six-pane window, and olive branches outside it ----------

type Twig = {
  ang: number
  len: number
  bend: number
  width: number
  phase: number
  speed: number
  leaves: {
    s: number
    ang: number
    len: number
    width: number
    phase: number
  }[]
  twigs: { s: number; twig: Twig }[]
}

function twig(
  rand: () => number,
  ang: number,
  len: number,
  bend: number,
  order: number,
): Twig {
  const leaves: Twig['leaves'] = []
  let side = rand() < 0.5 ? -1 : 1
  for (let s = 0.16; s < 0.97; s += (0.03 + rand() * 0.012) / len) {
    leaves.push({
      s,
      ang: side * (0.42 + rand() * 0.45),
      len: 0.065 + rand() * 0.035,
      width: 0.015 + rand() * 0.006,
      phase: rand() * TAU,
    })
    side = -side
  }
  for (const a of [0.12, -0.22])
    leaves.push({ s: 1, ang: a, len: 0.075, width: 0.016, phase: rand() * TAU })

  const twigs: Twig['twigs'] = []
  for (let i = 0; i < order; i++)
    twigs.push({
      s: 0.25 + rand() * 0.55,
      twig: twig(
        rand,
        (rand() < 0.5 ? -1 : 1) * (0.5 + rand() * 0.5),
        len * (0.35 + rand() * 0.25),
        (rand() - 0.5) * 0.05,
        order - 1,
      ),
    })

  return {
    ang,
    len,
    bend,
    width: 0.0028 + order * 0.0012,
    phase: rand() * TAU,
    speed: 0.3 + rand() * 0.25,
    leaves,
    twigs,
  }
}

function drawTwig(
  g: CanvasRenderingContext2D,
  tw: Twig,
  u: number,
  v: number,
  base: number,
  t: number,
  wind: number,
) {
  const sway =
    wind *
    (0.024 * Math.sin(t * tw.speed + tw.phase) +
      0.009 * Math.sin(t * tw.speed * 2.7 + tw.phase))
  const ang = base + tw.ang + sway
  const ex = u + Math.cos(ang) * tw.len
  const ey = v + Math.sin(ang) * tw.len
  const mx = (u + ex) / 2 - Math.sin(ang) * tw.bend
  const my = (v + ey) / 2 + Math.cos(ang) * tw.bend

  g.lineWidth = tw.width
  g.beginPath()
  g.moveTo(u, v)
  g.quadraticCurveTo(mx, my, ex, ey)
  g.stroke()

  const at = (s: number) => {
    const a = (1 - s) * (1 - s)
    const b = 2 * (1 - s) * s
    const c = s * s
    return [a * u + b * mx + c * ex, a * v + b * my + c * ey]
  }
  const heading = (s: number) =>
    Math.atan2(
      (1 - s) * (my - v) + s * (ey - my),
      (1 - s) * (mx - u) + s * (ex - mx),
    )

  for (const leaf of tw.leaves) {
    const [x, y] = at(leaf.s)
    const flutter =
      wind * 0.1 * Math.sin(t * (1.4 + leaf.phase * 0.15) + leaf.phase)
    oliveLeaf(
      g,
      x,
      y,
      heading(leaf.s) + leaf.ang + flutter,
      leaf.len,
      leaf.width,
    )
  }
  for (const sub of tw.twigs) {
    const [x, y] = at(sub.s)
    drawTwig(g, sub.twig, x, y, heading(sub.s), t, wind)
  }
}

function oliveLeaf(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  ang: number,
  len: number,
  width: number,
) {
  const c = Math.cos(ang)
  const s = Math.sin(ang)
  const mx = x + c * len * 0.45
  const my = y + s * len * 0.45
  g.beginPath()
  g.moveTo(x, y)
  g.quadraticCurveTo(mx - s * width, my + c * width, x + c * len, y + s * len)
  g.quadraticCurveTo(mx + s * width, my - c * width, x, y)
  g.fill()
}

function olive(): Scene {
  const W = 1.1
  const H = 1.4
  const rand = random(5)
  // Where each branch reaches in from, in window coordinates
  const branches = [
    { u: W + 0.15, v: -0.1, twig: twig(rand, 2.5, 0.85, 0.1, 3) },
    { u: 0.5, v: -0.16, twig: twig(rand, 1.65, 0.55, -0.07, 2) },
    { u: W + 0.2, v: 0.58, twig: twig(rand, 3.3, 0.62, 0.06, 2) },
  ]

  return {
    width: W,
    height: H,
    depth: 0.25,
    frameBlur: 0.006,
    plantBlur: 0.008,
    prepare() {},
    drawFrame(g) {
      const sash = 0.028
      g.fillRect(-0.1, -0.1, W + 0.2, 0.1 + sash)
      g.fillRect(-0.1, H - sash, W + 0.2, 0.1 + sash)
      g.fillRect(-0.1, -0.1, 0.1 + sash, H + 0.2)
      g.fillRect(W - sash, -0.1, 0.1 + sash, H + 0.2)
      g.fillRect(W / 2 - 0.017, 0, 0.034, H)
      for (const v of [H / 3, (2 * H) / 3]) g.fillRect(0, v - 0.014, W, 0.028)
    },
    drawPlant(g, t, wind) {
      for (const b of branches) drawTwig(g, b.twig, b.u, b.v, 0, t, wind)
    },
  }
}

// A plain window: its frame, a bar down the middle where the sashes meet,
// and with `transom` a bar across near the top
function casement(
  g: CanvasRenderingContext2D,
  W: number,
  H: number,
  transom?: number,
) {
  const sash = 0.026
  g.fillRect(-0.1, -0.1, W + 0.2, 0.1 + sash)
  g.fillRect(-0.1, H - sash, W + 0.2, 0.1 + sash)
  g.fillRect(-0.1, -0.1, 0.1 + sash, H + 0.2)
  g.fillRect(W - sash, -0.1, 0.1 + sash, H + 0.2)
  g.fillRect(W / 2 - 0.015, 0, 0.03, H)
  if (transom !== undefined) g.fillRect(0, transom - 0.012, W, 0.024)
}

// A point and the heading along a quadratic curve
function along(
  u: number,
  v: number,
  mu: number,
  mv: number,
  eu: number,
  ev: number,
  s: number,
) {
  const a = (1 - s) * (1 - s)
  const b = 2 * (1 - s) * s
  const c = s * s
  return {
    u: a * u + b * mu + c * eu,
    v: a * v + b * mv + c * ev,
    ang: Math.atan2(
      (1 - s) * (mv - v) + s * (ev - mv),
      (1 - s) * (mu - u) + s * (eu - mu),
    ),
  }
}

// ---------- A ginkgo branch outside a plain window ----------

type GinkgoLeaf = {
  /** Around the spur, and how far it hangs */
  ang: number
  stalk: number
  r: number
  spread: number
  notch: number
  fore: number
  wave: number
  phase: number
}
type GinkgoBranch = {
  u: number
  v: number
  ang: number
  len: number
  bend: number
  width: number
  phase: number
  spurs: { s: number; side: number; leaves: GinkgoLeaf[] }[]
  twigs: { s: number; branch: GinkgoBranch }[]
}

function ginkgoBranch(
  rand: () => number,
  u: number,
  v: number,
  ang: number,
  len: number,
  bend: number,
  order: number,
  // Metres between tufts, and how many leaves each has
  tuft = { gap: 0.24, min: 2, max: 4 },
): GinkgoBranch {
  // Leaves grow in tufts of three to six on short spurs along the wood
  const spurs: GinkgoBranch['spurs'] = []
  let side = rand() < 0.5 ? -1 : 1
  for (
    let s = 0.12;
    s < 0.98;
    s += (tuft.gap + rand() * tuft.gap * 0.4) / len
  ) {
    const leaves: GinkgoLeaf[] = []
    const n = tuft.min + Math.floor(rand() * (tuft.max - tuft.min + 1))
    for (let i = 0; i < n; i++)
      leaves.push({
        ang: (i / Math.max(1, n - 1) - 0.5) * 2.6 + (rand() - 0.5) * 0.4,
        stalk: 0.06 + rand() * 0.05,
        r: 0.075 + rand() * 0.03,
        spread: 0.8 + rand() * 0.3,
        notch: rand() < 0.55 ? 0.15 + rand() * 0.3 : 0,
        fore: 0.6 + rand() * 0.4,
        wave: rand() * TAU,
        phase: rand() * TAU,
      })
    spurs.push({ s, side, leaves })
    side = -side
  }
  const twigs: GinkgoBranch['twigs'] = []
  for (let i = 0; i < order; i++)
    twigs.push({
      s: 0.3 + rand() * 0.45,
      branch: ginkgoBranch(
        rand,
        0,
        0,
        (rand() < 0.5 ? -1 : 1) * (0.45 + rand() * 0.4),
        len * (0.35 + rand() * 0.2),
        (rand() - 0.5) * 0.06,
        order - 1,
        tuft,
      ),
    })
  return {
    u,
    v,
    ang,
    len,
    bend,
    width: 0.008 + order * 0.006,
    phase: rand() * TAU,
    spurs,
    twigs,
  }
}

// A fan, split a little at the middle of its rim on some leaves
function ginkgoLeaf(
  g: CanvasRenderingContext2D,
  u: number,
  v: number,
  ang: number,
  leaf: GinkgoLeaf,
  // With `batch`, only add the leaf to the path being built
  steps = 18,
  batch = false,
) {
  const c = Math.cos(ang)
  const s = Math.sin(ang)
  if (!batch) g.beginPath()
  g.moveTo(u, v)
  for (let i = 0; i <= steps; i++) {
    const f = i / steps - 0.5
    const phi = f * 2 * leaf.spread
    const notch = 1 - leaf.notch * Math.exp(-((phi / 0.09) ** 2))
    const r = leaf.r * (1 + 0.05 * Math.sin(9 * phi + leaf.wave)) * notch
    // Narrow where it meets the stalk, then opening out
    const along = r * Math.cos(phi) * leaf.fore
    const across = r * Math.sin(phi)
    g.lineTo(u + c * along - s * across, v + s * along + c * across)
  }
  g.closePath()
  if (!batch) g.fill()
}

function drawGinkgo(
  g: CanvasRenderingContext2D,
  b: GinkgoBranch,
  u: number,
  v: number,
  base: number,
  t: number,
  wind: number,
) {
  const sway = wind * 0.012 * Math.sin(t * 0.35 + b.phase)
  const ang = base + b.ang + sway
  const eu = u + Math.cos(ang) * b.len
  const ev = v + Math.sin(ang) * b.len
  const mu = (u + eu) / 2 - Math.sin(ang) * b.bend
  const mv = (v + ev) / 2 + Math.cos(ang) * b.bend
  g.lineWidth = b.width
  g.beginPath()
  g.moveTo(u, v)
  g.quadraticCurveTo(mu, mv, eu, ev)
  g.stroke()

  for (const spur of b.spurs) {
    const at = along(u, v, mu, mv, eu, ev, spur.s)
    // The spur stubs out sideways and a little down
    const sa = at.ang + spur.side * 1.1
    const su = at.u + Math.cos(sa) * 0.022
    const sv = at.v + Math.sin(sa) * 0.022
    g.lineWidth = 0.007
    g.beginPath()
    g.moveTo(at.u, at.v)
    g.lineTo(su, sv)
    g.stroke()
    // Long stalks let each leaf turn on its own in the wind; they hang
    // between the spur's direction and straight down
    const hang = Math.atan2(Math.sin(sa) + 1.2, Math.cos(sa))
    g.lineWidth = 0.0035
    for (const leaf of spur.leaves) {
      const flutter =
        wind * 0.22 * Math.sin(t * (1.6 + leaf.phase * 0.12) + leaf.phase)
      const la = hang + leaf.ang * 0.55 + flutter
      const lu = su + Math.cos(la) * leaf.stalk
      const lv = sv + Math.sin(la) * leaf.stalk
      g.beginPath()
      g.moveTo(su, sv)
      g.lineTo(lu, lv)
      g.stroke()
      ginkgoLeaf(g, lu, lv, la + flutter * 0.6, leaf)
    }
  }
  for (const tw of b.twigs) {
    const at = along(u, v, mu, mv, eu, ev, tw.s)
    drawGinkgo(g, tw.branch, at.u, at.v, at.ang, t, wind)
  }
}

// A school window: a fanlight across the top, two casements below it, each
// split once by a glazing bar. Where two members meet, a hairline of light
// gets between them
function schoolWindow(g: CanvasRenderingContext2D, W: number, H: number) {
  const jamb = 0.045
  const head = 0.05
  const sill = 0.065
  const bar = 0.034
  const glazing = 0.015
  const gap = 0.004
  const top = H * 0.29
  g.fillRect(-0.1, -0.1, W + 0.2, 0.1 + head)
  g.fillRect(-0.1, H - sill, W + 0.2, 0.1 + sill)
  g.fillRect(-0.1, -0.1, 0.1 + jamb, H + 0.2)
  g.fillRect(W - jamb, -0.1, 0.1 + jamb, H + 0.2)
  // The transom, and the two casements' meeting stiles
  g.fillRect(0, top - bar / 2, W, bar / 2 - gap / 2)
  g.fillRect(0, top + gap / 2, W, bar / 2 - gap / 2)
  g.fillRect(W / 2 - bar / 2, top, bar / 2 - gap / 2, H - top)
  g.fillRect(W / 2 + gap / 2, top, bar / 2 - gap / 2, H - top)
  // The fanlight is one long pane with a single bar in the middle
  g.fillRect(W / 2 - glazing / 2, 0, glazing, top)
  const mid = top + (H - top) * 0.48
  g.fillRect(0, mid - glazing / 2, W, glazing)
}

type Cluster = {
  u: number
  v: number
  phase: number
  leaves: GinkgoLeaf[]
}

// The crown of a ginkgo further out, thick at the top of the window and
// thinning lower down, with sky between the tufts
function crown(
  rand: () => number,
  W: number,
  H: number,
  // How thick it is at the top, and how much it thins lower down
  top: number,
  thinning: number,
): Cluster[] {
  const cell = 0.085
  const list: Cluster[] = []
  for (let v = -0.15; v < H * 0.72; v += cell)
    for (let u = -0.15; u < W + 0.15; u += cell) {
      const thick = top - thinning * Math.max(0, v / (H * 0.72))
      if (rand() > thick) continue
      const leaves: GinkgoLeaf[] = []
      const n = 3 + Math.floor(rand() * 4)
      for (let i = 0; i < n; i++)
        leaves.push({
          ang: rand() * TAU,
          stalk: 0.015 + rand() * 0.03,
          r: 0.045 + rand() * 0.03,
          spread: 0.8 + rand() * 0.3,
          notch: rand() < 0.5 ? 0.15 + rand() * 0.3 : 0,
          fore: 0.55 + rand() * 0.45,
          wave: rand() * TAU,
          phase: rand() * TAU,
        })
      list.push({
        u: u + (rand() - 0.5) * cell,
        v: v + (rand() - 0.5) * cell,
        phase: rand() * TAU,
        leaves,
      })
    }
  return list
}

type Falling = {
  u: number
  drift: number
  period: number
  offset: number
  spin: number
  leaf: GinkgoLeaf
}

function ginkgo(): Scene {
  const W = 1.1
  const H = 1.4
  const rand = random(29)
  // The near boughs, thick with tufts, crossing the lower half
  const tuft = { gap: 0.17, min: 3, max: 5 }
  const branches = [
    ginkgoBranch(rand, W + 0.16, 0.42, 2.85, 1.35, -0.18, 1, tuft),
    ginkgoBranch(rand, W + 0.12, 1.02, 3.38, 0.95, 0.12, 1, tuft),
    ginkgoBranch(rand, 0.32, -0.12, 1.85, 0.62, -0.06, 0, tuft),
  ]
  const clusters = crown(rand, W, H, 0.47, 0.38)
  // A few leaves always on their way down
  const falling: Falling[] = [0, 1].map((i) => ({
    u: 0.15 + rand() * (W - 0.3),
    drift: (rand() - 0.5) * 0.5,
    period: 15 + rand() * 9,
    offset: i / 2 + rand() * 0.1,
    spin: (0.7 + rand() * 0.8) * (rand() < 0.5 ? -1 : 1),
    leaf: {
      ang: 0,
      stalk: 0,
      r: 0.07 + rand() * 0.02,
      spread: 0.9,
      notch: 0.25,
      fore: 1,
      wave: rand() * TAU,
      phase: rand() * TAU,
    },
  }))

  return {
    width: W,
    height: H,
    depth: 0.22,
    frameBlur: 0.0055,
    plantBlur: 0.005,
    prepare() {},
    drawFrame(g) {
      schoolWindow(g, W, H)
    },
    drawPlant(g, t, wind) {
      for (const b of branches) drawGinkgo(g, b, b.u, b.v, 0, t, wind)
      for (const f of falling) {
        const p = (((t / f.period + f.offset) % 1) + 1) % 1
        const v = -0.25 + (H + 0.5) * p
        const u =
          f.u + f.drift * p + 0.06 * Math.sin(p * TAU * 1.5 + f.leaf.phase)
        // Tumbling, so it narrows and widens as it turns
        const turn = f.spin * t + f.leaf.phase
        f.leaf.fore = 0.3 + 0.7 * Math.abs(Math.cos(turn * 0.7))
        ginkgoLeaf(g, u, v, turn, f.leaf)
      }
    },
    far: {
      depth: 0.9,
      blur: 0.014,
      draw(g, t, wind) {
        // One path for the whole crown
        g.beginPath()
        for (const c of clusters) {
          const du = wind * 0.014 * Math.sin(t * 0.42 + c.phase)
          const dv = wind * 0.006 * Math.sin(t * 0.57 + c.phase * 1.3)
          for (const leaf of c.leaves) {
            const flutter =
              wind * 0.18 * Math.sin(t * (1.5 + leaf.phase * 0.1) + leaf.phase)
            const a = leaf.ang + flutter
            ginkgoLeaf(
              g,
              c.u + du + Math.cos(a) * leaf.stalk,
              c.v + dv + Math.sin(a) * leaf.stalk,
              a,
              leaf,
              10,
              true,
            )
          }
        }
        g.fill()
      },
    },
    // Autumn leaves: the sun comes through them gold
    translucent: { colour: [255, 178, 46], amount: 0.85 },
  }
}

// ---------- Bamboo outside the window ----------

type Culm = {
  u: number
  lean: number
  width: number
  nodes: number[]
  phase: number
  twigs: {
    v: number
    side: number
    len: number
    leaves: { ang: number; len: number; width: number; phase: number }[]
  }[]
}

function culms(
  rand: () => number,
  spots: { u: number; lean: number; width: number }[],
  top: number,
  bottom: number,
): Culm[] {
  return spots.map((spot) => {
    const nodes: number[] = []
    for (
      let v = bottom - 0.05 - rand() * 0.1;
      v > top;
      v -= 0.26 + rand() * 0.1
    )
      nodes.push(v)
    // Branches leave from the upper nodes, alternately, with a spray of
    // narrow leaves at the end that hang
    const twigs: Culm['twigs'] = []
    let side = rand() < 0.5 ? -1 : 1
    for (const v of nodes) {
      if (v > bottom - 0.45 || rand() < 0.25) continue
      const leaves = []
      const n = 5 + Math.floor(rand() * 3)
      for (let i = 0; i < n; i++)
        leaves.push({
          ang: 0.7 + (i / (n - 1)) * 1.5 + (rand() - 0.5) * 0.25,
          len: 0.2 + rand() * 0.09,
          width: 0.026 + rand() * 0.01,
          phase: rand() * TAU,
        })
      twigs.push({ v, side, len: 0.1 + rand() * 0.1, leaves })
      side = -side
    }
    return { ...spot, nodes, phase: rand() * TAU, twigs }
  })
}

function drawCulms(
  g: CanvasRenderingContext2D,
  list: Culm[],
  top: number,
  bottom: number,
  t: number,
  wind: number,
) {
  for (const c of list) {
    // The tops move most
    const sway = wind * 0.018 * Math.sin(t * 0.4 + c.phase)
    const x = (v: number) =>
      c.u + (c.lean + sway) * ((bottom - v) / (bottom - top))
    g.lineWidth = c.width
    g.lineCap = 'butt'
    g.beginPath()
    g.moveTo(x(bottom), bottom)
    g.lineTo(x(top), top)
    g.stroke()
    // A ring at each node, a little wider than the culm
    for (const v of c.nodes)
      g.fillRect(x(v) - c.width * 0.62, v - 0.004, c.width * 1.24, 0.008)
    g.lineCap = 'round'

    for (const tw of c.twigs) {
      const u0 = x(tw.v)
      const a = -Math.PI / 2 + tw.side * 0.85
      const u1 = u0 + Math.cos(a) * tw.len
      const v1 = tw.v + Math.sin(a) * tw.len
      g.lineWidth = 0.006
      g.beginPath()
      g.moveTo(u0, tw.v)
      g.lineTo(u1, v1)
      g.stroke()
      for (const leaf of tw.leaves) {
        const flutter =
          wind * 0.16 * Math.sin(t * (1.3 + leaf.phase * 0.1) + leaf.phase)
        // Fanning from the twig's own direction round to hanging down
        const la = a + tw.side * leaf.ang + flutter
        oliveLeaf(g, u1, v1, la, leaf.len, leaf.width)
      }
    }
  }
}

function bamboo(): Scene {
  const W = 1.1
  const H = 1.4
  const rand = random(31)
  const list = culms(
    rand,
    [
      { u: 0.14, lean: 0.05, width: 0.05 },
      { u: 0.56, lean: -0.05, width: 0.04 },
      { u: 0.97, lean: 0.03, width: 0.055 },
    ],
    -0.2,
    H + 0.25,
  )
  return {
    width: W,
    height: H,
    depth: 0.3,
    frameBlur: 0.006,
    plantBlur: 0.0065,
    prepare() {},
    drawFrame(g) {
      casement(g, W, H)
    },
    drawPlant(g, t, wind) {
      drawCulms(g, list, -0.2, H + 0.25, t, wind)
    },
  }
}

// ---------- A round window, as in a Chinese garden, with bamboo ----------

function moon(): Scene {
  const W = 1.1
  const H = 1.4
  const R = 0.52
  const rand = random(37)
  const list = culms(
    rand,
    [
      { u: 0.36, lean: 0.06, width: 0.046 },
      { u: 0.78, lean: -0.02, width: 0.036 },
    ],
    -0.2,
    H + 0.25,
  )
  return {
    width: W,
    height: H,
    depth: 0.35,
    frameBlur: 0.006,
    plantBlur: 0.007,
    prepare() {},
    drawFrame(g) {
      // The wall all round the opening
      g.beginPath()
      g.rect(-0.1, -0.1, W + 0.2, H + 0.2)
      g.arc(W / 2, H * 0.47, R, 0, TAU, true)
      g.fill('evenodd')
    },
    drawPlant(g, t, wind) {
      drawCulms(g, list, -0.2, H + 0.25, t, wind)
    },
  }
}

// ---------- A sheer curtain drawn halfway across ----------

function curtain(): Scene {
  const W = 1.1
  const H = 1.4
  return {
    width: W,
    height: H,
    depth: -0.04,
    frameBlur: 0.0055,
    plantBlur: 0.006,
    prepare() {},
    drawFrame(g) {
      casement(g, W, H, H * 0.42)
    },
    drawPlant(g, t, wind) {
      // Voile lets about half the light through, less where it folds over
      // itself; its edge drifts a little in the draught
      const edge = W * 0.44 + wind * 0.025 * Math.sin(t * 0.27)
      const drift = t * 0.12 + wind * 0.4 * Math.sin(t * 0.21)
      for (let u = edge; u < W + 0.1; u += 0.006) {
        const f = u - edge
        const fold =
          0.45 +
          0.24 * Math.sin((f / 0.095) * TAU + drift) +
          0.08 * Math.sin((f / 0.034) * TAU - drift * 1.7)
        g.globalAlpha = Math.min(0.85, Math.max(0.2, fold))
        g.fillRect(u, -0.1, 0.0065, H + 0.2)
      }
      // The hem down its leading edge
      g.globalAlpha = 0.75
      g.fillRect(edge - 0.004, -0.1, 0.014, H + 0.2)
      g.globalAlpha = 1
    },
  }
}

// ---------- An areca palm in the room ----------

type Frond = {
  ang: number
  len: number
  bend: number
  phase: number
  pinnae: { s: number; side: number; len: number; phase: number }[]
}

function palm(): Scene {
  const W = 1.1
  const H = 1.4
  const rand = random(43)
  const root = { u: 0.55, v: H + 0.4 }
  const fronds: Frond[] = [
    { ang: -1.78, len: 1.8, bend: -0.28 },
    { ang: -1.28, len: 1.6, bend: 0.32 },
    { ang: -2.3, len: 1.35, bend: -0.26 },
  ].map((f) => {
    const pinnae: Frond['pinnae'] = []
    for (let s = 0.18; s < 0.99; s += 0.034 + rand() * 0.008)
      for (const side of [-1, 1])
        pinnae.push({
          s,
          side,
          len: (0.16 + 0.22 * Math.sin(Math.PI * s)) * (0.85 + rand() * 0.3),
          phase: rand() * TAU,
        })
    return { ...f, phase: rand() * TAU, pinnae }
  })
  return {
    width: W,
    height: H,
    depth: -0.18,
    frameBlur: 0.006,
    plantBlur: 0.005,
    prepare() {},
    drawFrame(g) {
      casement(g, W, H, 0.3)
    },
    drawPlant(g, t, wind) {
      for (const f of fronds) {
        const sway = wind * 0.025 * Math.sin(t * 0.33 + f.phase)
        const ang = f.ang + sway
        const eu = root.u + Math.cos(ang) * f.len
        const ev = root.v + Math.sin(ang) * f.len
        // Arching over: the middle of the stalk rises above the line
        const mu = (root.u + eu) / 2 - Math.sin(ang) * f.bend
        const mv = (root.v + ev) / 2 + Math.cos(ang) * f.bend - 0.25
        g.lineWidth = 0.014
        g.beginPath()
        g.moveTo(root.u, root.v)
        g.quadraticCurveTo(mu, mv, eu, ev)
        g.stroke()
        // Leaflets lean towards the tip and droop at their ends
        for (const p of f.pinnae) {
          const at = along(root.u, root.v, mu, mv, eu, ev, p.s)
          const flutter = wind * 0.07 * Math.sin(t * 1.2 + p.phase)
          const a = at.ang + p.side * (0.55 + 0.25 * p.s) + flutter
          const droop = 0.35 * p.side
          const tu = at.u + Math.cos(a) * p.len
          const tv = at.v + Math.sin(a) * p.len
          const cu = at.u + Math.cos(a - droop) * p.len * 0.6
          const cv = at.v + Math.sin(a - droop) * p.len * 0.6
          const w = 0.022
          g.beginPath()
          g.moveTo(at.u, at.v)
          g.quadraticCurveTo(cu - Math.sin(a) * w, cv + Math.cos(a) * w, tu, tv)
          g.quadraticCurveTo(
            cu + Math.sin(a) * w,
            cv - Math.cos(a) * w,
            at.u,
            at.v,
          )
          g.fill()
        }
      }
    },
  }
}
