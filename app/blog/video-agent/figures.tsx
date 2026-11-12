'use client'

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

// The figures and examples of "Designing a Video Agent That Can Actually Make a
// Long Film", drawn in Doki's own visual language: its editor's tag colors (sky
// for @, purple for #, rose for the "=" of a definition; app/globals.css), its
// definition chips. Pictures and data come from Doki's example
// film The Last Three, the Doki demo and the clip planner explainer; the clip planner is Doki's own
// (client/src/editor/services/clipPlanner.ts), cut down to what this scene needs.

const IMG = '/img/blog/video-agent'

// -----------------------------------------------------------------------------
// The figure frame
// -----------------------------------------------------------------------------

// A figure is wider than the text on a large screen: it reaches out by BREAKOUT
// on each side of the text column (608px), so it's up to FIGURE_MAX wide, while
// its caption stays in line with the text. A figure laid out for a width is
// drawn for the width it gets, never under FIGURE_MIN: narrower than that, as on
// a phone, it scrolls sideways.
const FIGURE_MIN = 600
const FIGURE_MAX = 784
const BREAKOUT = 'min-[880px]:-mx-[88px]'
const BACK_IN = 'min-[880px]:mx-[88px]'

/** The width a figure has to draw in, from its scroller's (minus its padding) */
function useFigureWidth() {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(FIGURE_MIN)
  useEffect(() => {
    const element = ref.current
    if (!element) return
    const measure = () =>
      setWidth(
        Math.max(FIGURE_MIN, Math.min(FIGURE_MAX, element.clientWidth - 32)),
      )
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  return [ref, width] as const
}

/** A figure that keeps its layout and scrolls sideways on a narrow screen */
function Figure({
  number,
  children,
  caption,
  fixed = true,
}: {
  /** Its number in the post, which its caption leads with */
  number: number
  /** What it shows - or, for a figure laid out for a width, what it shows at a width */
  children: ReactNode | ((width: number) => ReactNode)
  caption: ReactNode
  fixed?: boolean
}) {
  const [ref, width] = useFigureWidth()
  return (
    <figure className={`not-prose my-10 ${BREAKOUT}`}>
      <div
        ref={ref}
        className={fixed ? '-mx-4 overflow-x-auto overflow-y-hidden px-4' : ''}
      >
        <div
          className={fixed ? 'mx-auto' : ''}
          style={fixed ? { width } : undefined}
        >
          {typeof children === 'function' ? children(width) : children}
        </div>
      </div>
      <figcaption
        className={`text-muted-foreground mt-4 text-sm leading-relaxed ${BACK_IN}`}
      >
        <span className="text-foreground font-medium">Fig. {number}.</span>{' '}
        {caption}
      </figcaption>
    </figure>
  )
}

// -----------------------------------------------------------------------------
// Doki's script, as its editor shows it
// -----------------------------------------------------------------------------

const SKY = 'text-[var(--doki-sky)]'
const PUR = 'text-[var(--doki-pur)]'

/** A tag, colored as Doki's editor colors it: sky for @, purple for # */
export function T({ children }: { children: string }) {
  return (
    <span className={`font-medium ${children.startsWith('#') ? PUR : SKY}`}>
      {children}
    </span>
  )
}

// Doki's four types, with the post's plain names for them: what Doki calls a
// Scene is a place, an Ingredient an object, an Ambience a look
const TYPES = {
  Character: { emoji: '👤', symbol: '@', name: 'Character' },
  Scene: { emoji: '🏠', symbol: '@', name: 'Place' },
  Ingredient: { emoji: '🧩', symbol: '@', name: 'Object' },
  Ambience: { emoji: '✨', symbol: '#', name: 'Look' },
} as const

/** A definition's type, as the chip Doki puts before it */
function TypeChip({ type }: { type: keyof typeof TYPES }) {
  const { emoji, symbol, name } = TYPES[type]
  const tint =
    symbol === '@'
      ? 'border-[var(--doki-sky-line)] bg-[var(--doki-sky-bg)] text-[var(--doki-sky)]'
      : 'border-[var(--doki-pur-line)] bg-[var(--doki-pur-bg)] text-[var(--doki-pur)]'
  return (
    <span
      className={`mr-1.5 inline-flex items-center gap-1 rounded-md border px-1.5 py-px align-[0.06em] text-[0.82em] font-medium whitespace-nowrap ${tint}`}
    >
      <span aria-hidden="true">{emoji}</span>
      {name}
    </span>
  )
}

/** The "=" of a definition */
function Eq() {
  return <span className="mx-1 font-medium text-[var(--doki-rose)]">=</span>
}

/** A card that holds an excerpt: a label, then what it quotes */
function Excerpt({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="not-prose border-border bg-muted/40 my-6 rounded-[var(--radius-lg)] border px-4 py-3">
      <p className="text-muted-foreground mb-2 flex items-center gap-2 font-mono text-[11px] tracking-wide uppercase">
        <span
          aria-hidden="true"
          className="size-1.5 rounded-full bg-[var(--doki-sky-line)]"
        />
        {label}
      </p>
      <div className="text-foreground/90 text-[14px] leading-relaxed">
        {children}
      </div>
    </div>
  )
}

/** A prompt excerpt, quoted as it is in Doki's code */
export function Prompt({
  from,
  children,
}: {
  from: string
  children: ReactNode
}) {
  return (
    <Excerpt label={from}>
      <div className="space-y-2">{children}</div>
    </Excerpt>
  )
}

/** Two of The Last Three's definitions, as Doki's script shows them, with their reference shots */
export function Definitions() {
  const lines = [
    {
      type: 'Ingredient' as const,
      tag: '@Camera',
      image: 'camera',
      text: 'an old silver-and-black 35mm film SLR, a well-worn brown leather strap, and on its back a strip of masking tape with “3 left” written by hand',
    },
    {
      type: 'Character' as const,
      tag: '@Mio',
      image: 'mio',
      text: 'a high-school senior, 17, a black bob to her chin, pale skin with cheeks red from the cold, shy and gentle eyes; a navy duffle coat over a navy blazer and a gray check skirt, black tights, brown snow boots, a red knit scarf and red mittens',
    },
  ]
  return (
    <Excerpt label="Two definitions from a film made in Doki, translated from Japanese">
      <div className="divide-border divide-y">
        {lines.map((line) => (
          <div
            key={line.tag}
            className="flex items-start gap-4 py-3 first:pt-1 last:pb-1"
          >
            <p className="flex-1">
              <TypeChip type={line.type} />
              <T>{line.tag}</T>
              <Eq />
              {line.text}
            </p>
            <img
              src={`${IMG}/${line.image}.jpg`}
              alt={`${line.tag}'s reference shot`}
              className="border-border size-16 shrink-0 rounded-[var(--radius-md)] border object-cover"
            />
          </div>
        ))}
      </div>
    </Excerpt>
  )
}

/** The plan's morning generation, as Doki wrote its prompt in MiniMax's own shot-list form (the explainer's planned-1 run) */
export function ShotList() {
  const shots = [
    {
      at: null,
      text: 'Full shot, tracking backward. Mia, a young woman with short black hair wearing a yellow raincoat and red rain boots, jogs forward down the wet sidewalk holding a folded newspaper boat …',
    },
    {
      at: '00:04.000',
      text: 'the camera cuts to a medium low-angle shot, as in Image 1: Mia crouches by the curb beside a large street puddle …',
    },
  ]
  return (
    <Excerpt label="The morning generation's video prompt, in MiniMax's shot-list form">
      <ol className="space-y-1.5">
        {shots.map((shot, i) => (
          <li key={i} className="flex items-baseline gap-2.5">
            <span className="bg-background border-border shrink-0 rounded-md border px-1.5 font-mono text-[12px]">
              [Shot {i + 1}]
            </span>
            <span>
              {shot.at && (
                <>
                  At{' '}
                  <span className={`font-mono text-[13px] ${SKY}`}>
                    {shot.at}
                  </span>
                  ,{' '}
                </>
              )}
              {shot.text}
            </span>
          </li>
        ))}
      </ol>
    </Excerpt>
  )
}

/** A 0-3 rating as a numbered chip: a circle for how much a cut needs to flow (sky), a square for how much a shot needs its keyframe (purple); with onClick, the reader can change it */
function LevelChip({
  level,
  kind,
  label,
  onClick,
}: {
  level: number
  kind: 'seam' | 'frame'
  label?: string
  onClick?: () => void
}) {
  const look = `inline-flex size-5 shrink-0 items-center justify-center border font-mono text-[11px] leading-none font-semibold tabular-nums ${
    kind === 'seam'
      ? 'rounded-full border-[var(--doki-sky-line)] bg-[var(--doki-sky-bg)] text-[var(--doki-sky)]'
      : 'rounded-[5px] border-[var(--doki-pur-line)] bg-[var(--doki-pur-bg)] text-[var(--doki-pur)]'
  }`
  if (!onClick) return <span className={look}>{level}</span>
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${label}: ${level} of 3`}
      title={`${label}: ${level} of 3. Click to change it.`}
      className={`${look} cursor-pointer transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2`}
    >
      {level}
    </button>
  )
}

/** The scene reader's two scales, word for word, with the dots the planner figure uses */
const SCALES: {
  kind: 'seam' | 'frame'
  title: string
  levels: string[]
}[] = [
  {
    kind: 'seam',
    title: 'Each cut: how much the shots on both sides need to flow together',
    levels: [
      "one moment that can't break - a line of dialogue answered, an action caught mid-way, a sound that runs across the cut, or two nearly identical views that would jump if made apart",
      'the same moment and place, closely linked - a reaction, a detail of what was just shown',
      'the same scene, but a cut there could start afresh - a new beat, a new angle on a calmer moment',
      'a new place or time, or a deliberate break - nothing needs to carry over',
    ],
  },
  {
    kind: 'frame',
    title: 'Each shot: how much it needs to open exactly on its keyframe',
    levels: [
      'it must be exact - a photo the user supplied, text or a logo that must read, a product shot',
      'a key image - a reveal, an entrance, a composition the story relies on',
      'it helps - a clear new framing worth keeping',
      'any close framing will do - a reaction, an insert, a continuation of the shot before',
    ],
  },
]

/** The scene reader's rubric: both scales, from 3 down to 0 */
export function Rubric() {
  return (
    <Excerpt label="Doki's scene reader">
      <div className="space-y-4">
        {SCALES.map(({ kind, title, levels }) => (
          <div key={kind}>
            <p className="text-foreground mb-1.5 font-medium">{title}</p>
            <ul className="space-y-1.5">
              {levels.map((text, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="translate-y-[3px]">
                    <LevelChip level={3 - i} kind={kind} />
                  </span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Excerpt>
  )
}

// -----------------------------------------------------------------------------
// Figure 1: a shot's definitions, resolved
// -----------------------------------------------------------------------------

interface DefNode {
  key: string
  name: string
  order: number
  image?: string
  says?: ReactNode
  /** Its column, of four, and its row: the shot's own definitions, or the ones they use */
  col: number
  row: 0 | 1
}

const NODE_GAP = 16
const NODE_H = 80

// The second row sits under what uses it, so no two lines cross: the platform
// under the photo of it, Mio in the middle of the three photos of her
const NODES: DefNode[] = [
  { key: 'shop', name: '@PhotoShop', order: 1, image: 'shop', col: 0, row: 0 },
  {
    key: 'platform-photo',
    name: '@PlatformPhoto',
    order: 4,
    image: 'photo-platform',
    says: (
      <>
        <T>@Mio</T> on the <T>@Platform</T>
      </>
    ),
    col: 1,
    row: 0,
  },
  {
    key: 'road-photo',
    name: '@RoadPhoto',
    order: 5,
    image: 'photo-road',
    says: (
      <>
        <T>@Mio</T> on a snowy road
      </>
    ),
    col: 2,
    row: 0,
  },
  {
    key: 'window-photo',
    name: '@WindowPhoto',
    order: 7,
    image: 'photo-window',
    says: (
      <>
        <T>@Mio</T> on a train, <T>#BlueHour</T>
      </>
    ),
    col: 3,
    row: 0,
  },
  {
    key: 'platform',
    name: '@Platform',
    order: 3,
    image: 'platform',
    col: 1,
    row: 1,
  },
  { key: 'mio', name: '@Mio', order: 2, image: 'mio', col: 2, row: 1 },
  { key: 'blue', name: '#BlueHour', order: 6, col: 3, row: 1 },
]

const EDGES: [string, string][] = [
  ['platform-photo', 'platform'],
  ['platform-photo', 'mio'],
  ['road-photo', 'mio'],
  ['window-photo', 'mio'],
  ['window-photo', 'blue'],
]

/** The definitions in the order the prompt lists them, as resolved */
const RESOLVED = [
  '@PhotoShop',
  '@Mio',
  '@Platform',
  '@PlatformPhoto',
  '@RoadPhoto',
  '#BlueHour',
  '@WindowPhoto',
  '#ALL',
]

/** A line down, across at `turnY`, and down again, its corners rounded */
const elbow = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  turnY: number,
) => {
  if (Math.abs(x1 - x2) < 0.5) return `M${x1} ${y1} V${y2}`
  const r = Math.min(8, Math.abs(x2 - x1) / 2, turnY - y1, y2 - turnY)
  const dir = x2 > x1 ? 1 : -1
  return [
    `M${x1} ${y1}`,
    `V${turnY - r}`,
    `Q${x1} ${turnY} ${x1 + dir * r} ${turnY}`,
    `H${x2 - dir * r}`,
    `Q${x2} ${turnY} ${x2} ${turnY + r}`,
    `V${y2}`,
  ].join(' ')
}

function Badge({ n }: { n: number }) {
  return (
    <span className="bg-background absolute -top-2 -left-2 flex size-[18px] items-center justify-center rounded-full border border-[var(--doki-sky-line)] bg-[var(--doki-sky-bg)] text-[11px] font-semibold text-[var(--doki-sky)] tabular-nums">
      {n}
    </span>
  )
}

export function ResolveFigure() {
  // Laid out for the width it's drawn at: four columns of definitions, under
  // the shot, whose picture grows with the figure
  const layout = (width: number) => {
    const nodeW = (width - 3 * NODE_GAP) / 4
    const imageW = Math.round(width * 0.3)
    const imageH = Math.round(imageW * 0.56)
    const cardH = imageH + 18
    const rowY = [cardH + 48, cardH + 48 + NODE_H + 36]
    const x = (n: DefNode) => n.col * (nodeW + NODE_GAP)
    const y = (n: DefNode) => rowY[n.row]
    const centerX = (n: DefNode) => x(n) + nodeW / 2
    return {
      nodeW,
      imageW,
      imageH,
      cardH,
      rowY,
      height: rowY[1] + NODE_H,
      x,
      y,
      centerX,
    }
  }
  const node = (key: string) => NODES.find((n) => n.key === key)!

  return (
    <Figure
      number={1}
      caption={
        <>
          A shot and the definitions it reaches. Its words name four
          definitions, which name three more, and the film-wide look (
          <T>#ALL</T>) applies to every shot. The numbers are the order a
          depth-first walk emits them: each after what it uses. The image model
          gets the definitions in that order, and their images with the
          shot&rsquo;s own first, then the ones they bring, then the
          scene&rsquo;s earlier shots.
        </>
      }
    >
      {(width: number) => {
        const { nodeW, imageW, imageH, cardH, rowY, height, x, y, centerX } =
          layout(width)
        return (
          <>
            <div className="relative text-[13px]" style={{ height }}>
              <svg
                className="absolute inset-0 overflow-visible"
                width={width}
                height={height}
                fill="none"
                strokeWidth="1.5"
                strokeLinecap="round"
                aria-hidden="true"
              >
                {/* The shot's words name four: one trunk, a branch to each */}
                <g className="stroke-[var(--doki-sky-line)] opacity-60">
                  {NODES.filter((n) => n.row === 0).map((n) => (
                    <path
                      key={n.key}
                      d={elbow(
                        width / 2,
                        cardH,
                        centerX(n),
                        rowY[0],
                        cardH + 24,
                      )}
                    />
                  ))}
                </g>
                {/* What those use, each line to the definition it brings */}
                {EDGES.map(([from, to]) => {
                  const a = node(from)
                  const b = node(to)
                  return (
                    <path
                      key={from + to}
                      className={`opacity-60 ${b.name.startsWith('#') ? 'stroke-[var(--doki-pur-line)]' : 'stroke-[var(--doki-sky-line)]'}`}
                      d={elbow(
                        centerX(a),
                        rowY[0] + NODE_H,
                        centerX(b),
                        rowY[1],
                        rowY[0] + NODE_H + 18,
                      )}
                    />
                  )
                })}
              </svg>

              <div
                className="border-border bg-background absolute top-0 left-0 flex gap-4 rounded-[var(--radius-xl)] border p-2"
                style={{ width }}
              >
                <img
                  src={`${IMG}/counter.jpg`}
                  alt="Overhead close-up of a shop counter with three photos"
                  className="shrink-0 rounded-[var(--radius-md)] object-cover"
                  style={{ width: imageW, height: imageH }}
                />
                <div className="self-center pr-3">
                  <p className="text-foreground leading-snug">
                    Overhead close-up of <T>@PhotoShop</T>&rsquo;s counter: the
                    last three photos, <T>@PlatformPhoto</T>, <T>@RoadPhoto</T>{' '}
                    and <T>@WindowPhoto</T>.
                  </p>
                  <p className="text-muted-foreground relative mt-2 inline-block pl-6 text-[12px]">
                    <span className="absolute top-0 left-0 flex size-[18px] items-center justify-center rounded-full border border-[var(--doki-sky-line)] bg-[var(--doki-sky-bg)] text-[11px] font-semibold text-[var(--doki-sky)] tabular-nums">
                      8
                    </span>
                    + <T>#ALL</T>, in every shot
                  </p>
                </div>
              </div>

              {NODES.map((n) => (
                <div
                  key={n.key}
                  className="border-border bg-background absolute rounded-[var(--radius-lg)] border px-2.5 py-2"
                  style={{
                    left: x(n),
                    top: y(n),
                    width: nodeW,
                    height: NODE_H,
                  }}
                >
                  <Badge n={n.order} />
                  <p className="mb-1.5 text-[13px] leading-none">
                    <T>{n.name}</T>
                  </p>
                  <div className="flex items-center gap-2">
                    {n.image ? (
                      <img
                        src={`${IMG}/${n.image}.jpg`}
                        alt=""
                        className="size-[42px] shrink-0 rounded-[var(--radius-sm)] object-cover"
                      />
                    ) : (
                      <span
                        className={`flex size-[42px] shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--doki-pur-bg)] text-lg ${PUR}`}
                      >
                        #
                      </span>
                    )}
                    {n.says && (
                      <p className="text-muted-foreground text-[12px] leading-snug">
                        {n.says}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-border mt-8 grid grid-cols-[1fr_auto] gap-8 rounded-[var(--radius-xl)] border p-4 text-[13px]">
              <div>
                <p className="text-muted-foreground mb-2.5 font-mono text-[11px] tracking-wide uppercase">
                  The prompt&rsquo;s definitions
                </p>
                <ol className="space-y-1 text-[13px]">
                  {RESOLVED.map((name, i) => (
                    <li key={name} className="flex items-center gap-2">
                      <span className="text-muted-foreground w-3 text-right text-[12px] tabular-nums">
                        {i + 1}
                      </span>
                      <T>{name}</T>
                      <Eq />
                      <span
                        className="bg-muted h-[7px] rounded-full"
                        style={{ width: 70 + ((i * 37) % 80) }}
                      />
                    </li>
                  ))}
                </ol>
              </div>
              <div className="w-[236px]">
                <p className="text-muted-foreground mb-2.5 font-mono text-[11px] tracking-wide uppercase">
                  Its images
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'shop',
                    'photo-platform',
                    'photo-road',
                    'photo-window',
                    'mio',
                    'platform',
                  ].map((image) => (
                    <img
                      key={image}
                      src={`${IMG}/${image}.jpg`}
                      alt=""
                      className="size-[46px] rounded-[var(--radius-sm)] object-cover"
                    />
                  ))}
                </div>
                <p className="text-muted-foreground mt-3 mb-1.5 text-[12px]">
                  The scene so far
                </p>
                <div className="flex gap-1.5">
                  {['slope', 'owner'].map((image) => (
                    <img
                      key={image}
                      src={`${IMG}/${image}.jpg`}
                      alt=""
                      className="h-[46px] w-[82px] rounded-[var(--radius-sm)] object-cover"
                    />
                  ))}
                </div>
              </div>
            </div>
          </>
        )
      }}
    </Figure>
  )
}

// -----------------------------------------------------------------------------
// The planning figures' shared parts, after the clip planner explainer.
//
// Type: 14px for a heading inside a figure, 13px for labels and words, 12px
// for numbers and small notes, 11px only for a tag laid over a picture.
// Color: gray for structure and for packing, sky for the plan, rose only for
// the words that say what went wrong.
// Surfaces: a keyframe is a still on a card; a generated video, or a frame of
// one, sits in a dark frame of the same size and corners; a generation is a
// bracket under the shots it holds; a rating is a numbered chip.
// -----------------------------------------------------------------------------

const ROSE = 'text-[var(--doki-rose)]'
const TAG =
  'absolute top-1.5 left-1.5 rounded-[4px] px-1.5 py-[3px] text-[11px] leading-none font-medium'

/** A keyframe, as a still on a card: its shot's number and length, the image, and what happens */
function KeyframeCard({
  n,
  seconds,
  image,
  alt,
  says,
  imageH,
  children,
}: {
  n?: number
  seconds?: number
  image: string
  alt: string
  says?: string
  /** The image's height; without one it's 16:9 */
  imageH?: number
  children?: ReactNode
}) {
  return (
    <div className="border-border bg-background flex h-full flex-col rounded-[var(--radius-md)] border p-1.5">
      {n !== undefined && (
        <p className="mb-1 px-0.5 font-mono text-[12px] leading-none">
          <span className="font-semibold">{n}</span>
          {seconds !== undefined && (
            <span className="text-muted-foreground"> · {seconds}s</span>
          )}
        </p>
      )}
      <img
        src={`${IMG}/${image}.jpg`}
        alt={alt}
        className={`w-full rounded-[3px] object-cover ${imageH ? '' : 'aspect-video'}`}
        style={imageH ? { height: imageH } : undefined}
      />
      {says && (
        <p className="text-muted-foreground mt-1 line-clamp-2 px-0.5 text-[12px] leading-snug">
          {says}
        </p>
      )}
      {children && <div className="mt-auto">{children}</div>}
    </div>
  )
}

/**
 * A picture at 16:9: a keyframe as a still on a card, or a generated video (or a
 * frame of one) in a dark frame. Both come out the same size, so a keyframe and
 * what was generated from it line up side by side.
 */
function Frame({
  kind,
  image,
  video,
  alt,
}: {
  kind: 'keyframe' | 'generated'
  image?: string
  video?: ReactNode
  alt?: string
}) {
  const keyframe = kind === 'keyframe'
  return (
    <div
      className={`relative aspect-video overflow-hidden rounded-[var(--radius-md)] ${keyframe ? 'border-border bg-background border' : 'bg-black'}`}
    >
      <div className={`absolute ${keyframe ? 'inset-[5px]' : 'inset-0'}`}>
        {video ??
          (image && (
            <img
              src={`${IMG}/${image}.jpg`}
              alt={alt ?? ''}
              className={`size-full object-cover ${keyframe ? 'rounded-[3px]' : ''}`}
            />
          ))}
      </div>
      <span
        className={`${TAG} ${keyframe ? 'border-border bg-background/90 text-foreground top-2.5 left-2.5 border' : 'bg-black/65 text-white'}`}
      >
        {keyframe ? 'Keyframe' : '▶ Generated'}
      </span>
    </div>
  )
}

/** One generation, as a bracket under the shots it holds: gray when packed, sky when planned */
function Generation({
  x1,
  x2,
  top,
  label,
  planned,
}: {
  x1: number
  x2: number
  top: number
  label?: string
  planned?: boolean
}) {
  return (
    <div
      className="absolute transition-[left,width] duration-300"
      style={{ left: x1, top, width: x2 - x1 }}
    >
      <div
        className={`h-2 rounded-b-[3px] border-x-[1.5px] border-b-[1.5px] ${planned ? 'border-[var(--doki-sky-line)]' : 'border-muted-foreground'}`}
      />
      {label && (
        <p
          className={`mt-1 text-center text-[12px] tabular-nums ${planned ? SKY : 'text-muted-foreground'}`}
        >
          {label}
        </p>
      )}
    </div>
  )
}

/** What went wrong (✗, rose) or right (✓ or ↑, sky) */
function Mark({ good, children }: { good?: boolean; children: ReactNode }) {
  return <span className={`text-[13px] ${good ? SKY : ROSE}`}>{children}</span>
}

/** A row's name over its brackets: what made it, and for which model */
function RowLabel({
  name,
  model,
  planned,
}: {
  name: string
  model: string
  planned?: boolean
}) {
  return (
    <p className="text-muted-foreground text-[13px] leading-none">
      <span className={`font-medium ${planned ? SKY : 'text-foreground'}`}>
        {name}
      </span>{' '}
      · {model}
    </p>
  )
}

// -----------------------------------------------------------------------------
// The scene the planner is shown on, from the clip planner explainer
// (clip-planner-explainer/film-after/scenes/boat.txt): its shots, keyframes and
// the scene reader's reading, recorded the same in all six of its films
// -----------------------------------------------------------------------------

const SCENE = [
  { image: 'boat-1', seconds: 6, says: 'Night, rain: she folds a paper boat' },
  { image: 'boat-2', seconds: 5, says: 'She sets it on the windowsill' },
  { image: 'boat-3', seconds: 4, says: 'Next morning: she runs out' },
  { image: 'boat-4', seconds: 4, says: 'She lets it go on a puddle' },
]
const SCENE_SECONDS = SCENE.reduce((sum, shot) => sum + shot.seconds, 0)
/** The scene reader on this scene: how much each cut needs the shots on both sides to flow together */
const READ_SEAMS = [2, 0, 2]
/** ... and how much each shot needs to open exactly on its keyframe */
const READ_FRAMES = [1, 1, 2, 2]
/** MiniMax H3 Max as Doki has it: generations of 5-15 s, its price a second, its measured losses by level */
const MODEL = {
  longest: 15,
  shortest: 5,
  pricePerSecond: 0.08,
  seam: [0, 0.1, 1.2, 1.3],
  frame: [-0.1, -0.1, 1.2, 1.2],
}
const LAMBDA = 0.5

const GAP = 14
/** Room at the sides for the planner's end points */
const LEFT0 = 22

/** The scene's shots laid out across a width: seconds to pixels, and where each shot and cut sits */
const timeline = (width: number) => {
  const px = (width - 2 * LEFT0 - (SCENE.length - 1) * GAP) / SCENE_SECONDS
  const lefts = SCENE.reduce<number[]>((all, shot, i) => {
    all.push(i === 0 ? LEFT0 : all[i - 1] + SCENE[i - 1].seconds * px + GAP)
    return all
  }, [])
  const rightOf = (i: number) => lefts[i] + SCENE[i].seconds * px
  /** Where a generation can start: before shot j (j = 0..n) */
  const cutX = (j: number) =>
    j === 0
      ? lefts[0]
      : j === SCENE.length
        ? rightOf(SCENE.length - 1)
        : lefts[j] - GAP / 2
  return { px, lefts, rightOf, cutX, imageH: Math.round(px * 2) }
}

const secondsOf = (start: number, end: number) =>
  SCENE.slice(start, end).reduce((sum, shot) => sum + shot.seconds, 0)

interface Weighed {
  start: number
  end: number
  loss: number
}

const planScene = (seams: number[], frames: number[]) => {
  const best: { loss: number; start: number }[] = [{ loss: 0, start: 0 }]
  const weighed: Weighed[] = []
  for (let end = 1; end <= SCENE.length; end++) {
    let seconds = 0
    let later = 0
    for (let start = end - 1; start >= 0; start--) {
      seconds += SCENE[start].seconds
      if (start < end - 1 && seconds > MODEL.longest) break
      if (start < end - 1) later += MODEL.frame[frames[start + 1]]
      const boundary = start === 0 ? 0 : MODEL.seam[seams[start - 1]]
      const price =
        MODEL.pricePerSecond * Math.max(seconds, MODEL.shortest) * LAMBDA
      const loss = best[start].loss + boundary + later + price
      weighed.push({ start, end, loss })
      if (!best[end] || loss < best[end].loss - 1e-9)
        best[end] = { loss, start }
    }
  }
  const clips: [number, number][] = []
  for (let end = SCENE.length; end > 0; end = best[end].start)
    clips.unshift([best[end].start, end])
  return { best, weighed, clips }
}

/** A level the reader can change, by clicking its chip */
function LevelButton({
  level,
  kind,
  label,
  onClick,
}: {
  level: number
  kind: 'seam' | 'frame'
  label: string
  onClick: () => void
}) {
  return <LevelChip level={level} kind={kind} label={label} onClick={onClick} />
}

const LEGEND_H = 30
const PILL_W = 44
const PILL_H = 22

export function PlanFigure() {
  const [seams, setSeams] = useState(READ_SEAMS)
  const [frames, setFrames] = useState(READ_FRAMES)
  const [hover, setHover] = useState<Weighed | null>(null)
  const plan = useMemo(() => planScene(seams, frames), [seams, frames])
  const changed =
    seams.some((v, i) => v !== READ_SEAMS[i]) ||
    frames.some((v, i) => v !== READ_FRAMES[i])
  const chosen = (w: Weighed) =>
    plan.clips.some(([s, e]) => s === w.start && e === w.end)
  const onPath = (j: number) => j === 0 || plan.clips.some(([, e]) => e === j)
  const cycle = (values: number[], i: number) =>
    values.map((v, k) => (k === i ? (v + 1) % 4 : v))
  const clipName = (w: { start: number; end: number }) =>
    `${w.start + 1}${w.end - 1 > w.start ? `–${w.end}` : ''}`

  return (
    <Figure
      number={3}
      caption={
        <>
          The boat scene, planned for MiniMax H3. Between shots, a circle
          says how much a cut needs the shots on both sides to flow together; on
          each shot, a square says how much it needs a fresh start on its
          keyframe. Below, the nine generations that fit, with best[j] at each
          point and the plan in sky: it splits where the story jumps to the next
          morning. Click a chip to change its level.
        </>
      }
    >
      {(width: number) => {
        const { px, lefts, rightOf, cutX, imageH } = timeline(width)
        const cardY = LEGEND_H
        const cardH = imageH + 98
        const planY = cardY + cardH + 18
        const dpY = planY + 64
        const height = dpY + 128
        const arc = (w: Weighed) => {
          const x1 = cutX(w.start)
          const x2 = cutX(w.end)
          const depth = 14 + (x2 - x1) * 0.11
          const y = dpY + PILL_H
          const pull = y + (depth * 4) / 3
          return {
            d: `M${x1} ${y} C ${x1} ${pull}, ${x2} ${pull}, ${x2} ${y}`,
            mid: (x1 + x2) / 2,
            depth,
          }
        }
        // The plan's own arcs go last, so they're drawn over the others
        const ordered = [
          ...plan.weighed.filter((w) => !chosen(w)),
          ...plan.weighed.filter(chosen),
        ]
        return (
          <div className="relative" style={{ height }}>
            <div className="text-muted-foreground absolute top-0 left-0 flex gap-6 px-1 text-[13px]">
              <span className="flex items-center gap-1.5">
                <LevelChip level={2} kind="seam" />
                How much a cut needs to flow
              </span>
              <span className="flex items-center gap-1.5">
                <LevelChip level={2} kind="frame" />
                How much a shot needs its keyframe
              </span>
            </div>

            {SCENE.map((shot, i) => (
              <div
                key={shot.image}
                className="absolute"
                style={{
                  left: lefts[i],
                  top: cardY,
                  width: shot.seconds * px,
                  height: cardH,
                }}
              >
                <KeyframeCard
                  n={i + 1}
                  seconds={shot.seconds}
                  image={shot.image}
                  alt={shot.says}
                  says={shot.says}
                  imageH={imageH}
                >
                  <div className="mt-1.5 px-0.5">
                    <LevelButton
                      level={frames[i]}
                      kind="frame"
                      label={`How much shot ${i + 1} needs its keyframe`}
                      onClick={() => setFrames(cycle(frames, i))}
                    />
                  </div>
                </KeyframeCard>
              </div>
            ))}

            {seams.map((level, i) => (
              <div
                key={i}
                className="absolute z-10 -translate-x-1/2"
                style={{ left: cutX(i + 1), top: cardY + 22 + imageH / 2 - 10 }}
              >
                <LevelButton
                  level={level}
                  kind="seam"
                  label={`How much the cut after shot ${i + 1} needs to flow`}
                  onClick={() => setSeams(cycle(seams, i))}
                />
              </div>
            ))}

            <div className="absolute" style={{ left: lefts[0], top: planY }}>
              <RowLabel name="The plan" model="MiniMax H3" planned />
            </div>
            {plan.clips.map(([start, end]) => (
              <Generation
                key={`${start}-${end}`}
                x1={lefts[start]}
                x2={rightOf(end - 1)}
                top={planY + 22}
                label={`${secondsOf(start, end)} s`}
                planned
              />
            ))}

            <svg
              className="pointer-events-none absolute top-0 left-0 overflow-visible"
              width={width}
              height={height}
              aria-hidden="true"
            >
              <line
                x1={cutX(0)}
                x2={cutX(SCENE.length)}
                y1={dpY + PILL_H / 2}
                y2={dpY + PILL_H / 2}
                className="stroke-border"
                strokeWidth="1"
              />
              {ordered.map((w) => {
                const { d } = arc(w)
                const on = chosen(w)
                const hovered = hover?.start === w.start && hover?.end === w.end
                return (
                  <g key={`${w.start}-${w.end}`}>
                    <path
                      d={d}
                      fill="none"
                      strokeWidth={on ? 2 : hovered ? 1.75 : 1.25}
                      strokeLinecap="round"
                      className={`transition-colors ${on ? 'stroke-[var(--doki-sky)]' : hovered ? 'stroke-[var(--doki-sky-line)]' : 'stroke-border'}`}
                    />
                    <path
                      d={d}
                      fill="none"
                      stroke="transparent"
                      strokeWidth="10"
                      className="pointer-events-auto cursor-pointer"
                      style={{ pointerEvents: 'stroke' }}
                      onMouseEnter={() => setHover(w)}
                      onMouseLeave={() => setHover(null)}
                    />
                  </g>
                )
              })}
              {plan.weighed.filter(chosen).map((w) => {
                const { mid, depth } = arc(w)
                return (
                  <text
                    key={`label-${w.start}-${w.end}`}
                    x={mid}
                    y={dpY + PILL_H + depth + 13}
                    textAnchor="middle"
                    className="fill-[var(--doki-sky)] font-mono text-[12px] font-semibold"
                  >
                    {clipName(w)}
                  </text>
                )
              })}
              {plan.best.map(({ loss }, j) => (
                <g key={j}>
                  <rect
                    x={cutX(j) - PILL_W / 2}
                    y={dpY}
                    width={PILL_W}
                    height={PILL_H}
                    rx={PILL_H / 2}
                    className="fill-background"
                  />
                  <rect
                    x={cutX(j) - PILL_W / 2}
                    y={dpY}
                    width={PILL_W}
                    height={PILL_H}
                    rx={PILL_H / 2}
                    strokeWidth="1.25"
                    className={
                      onPath(j)
                        ? 'fill-[var(--doki-sky-bg)] stroke-[var(--doki-sky-line)]'
                        : 'fill-background stroke-border'
                    }
                  />
                  <text
                    x={cutX(j)}
                    y={dpY + PILL_H / 2 + 3.5}
                    textAnchor="middle"
                    className={`font-mono text-[11px] tabular-nums ${onPath(j) ? 'fill-[var(--doki-sky)] font-semibold' : 'fill-muted-foreground'}`}
                  >
                    {loss.toFixed(2)}
                  </text>
                </g>
              ))}
            </svg>

            <div
              className="text-muted-foreground absolute left-0 flex items-center justify-between px-1 text-[12px]"
              style={{ width, top: height - 18 }}
            >
              <span className="tabular-nums">
                {hover
                  ? `Generation ${clipName(hover)}: best[${hover.start}] plus what it loses = ${hover.loss.toFixed(2)}`
                  : 'Hover an arc to see what that generation would lose.'}
              </span>
              {changed && (
                <button
                  type="button"
                  className="text-foreground cursor-pointer underline underline-offset-2"
                  onClick={() => {
                    setSeams(READ_SEAMS)
                    setFrames(READ_FRAMES)
                  }}
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        )
      }}
    </Figure>
  )
}

/** The planner's recurrence, each term in the color of the dots it comes from, with the model's measured losses */
export function Formula() {
  const v = (s: string) => <i className="font-serif">{s}</i>
  const terms = [
    {
      color: SKY,
      math: (
        <>
          {v('S')}(seam<sub>{v('i')}</sub>)
        </>
      ),
      says: 'splitting the cut before shot i+1',
    },
    {
      color: PUR,
      math: (
        <>
          &Sigma; {v('F')}(frame<sub>{v('k')}</sub>)
        </>
      ),
      says: 'each later shot that does not get a fresh start',
    },
    {
      color: 'text-foreground',
      math: <>&lambda; &middot; price</>,
      says: 'the generation’s cost, at half a point a dollar',
    },
  ]
  return (
    <div className="not-prose border-border my-6 rounded-[var(--radius-lg)] border px-5 py-5">
      <p className="text-center text-[17px] leading-loose">
        best[{v('j')}] = min
        <sub className="text-[11px]">
          {v('i')} &lt; {v('j')}
        </sub>{' '}
        ( best[{v('i')}] + <span className={SKY}>{terms[0].math}</span> +{' '}
        <span className={PUR}>{terms[1].math}</span> + {terms[2].math}({v('i')},{' '}
        {v('j')}] )
      </p>
      <dl className="mx-auto mt-4 grid max-w-[460px] grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[13px]">
        {terms.map((term) => (
          <div key={term.says} className="contents">
            <dt className={`text-right ${term.color}`}>{term.math}</dt>
            <dd className="text-muted-foreground">{term.says}</dd>
          </div>
        ))}
      </dl>
      <table className="mx-auto mt-5 text-[13px] tabular-nums">
        <thead className="text-muted-foreground">
          <tr>
            <th className="pr-5 text-left text-[12px] font-normal">
              Measured, MiniMax H3 Max
            </th>
            {[0, 1, 2, 3].map((n) => (
              <th key={n} className="w-14 pb-1 font-normal">
                <span className="flex flex-col items-center gap-1">
                  <span className="text-[12px]">{n}</span>
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="border-border border-t">
            <th className={`py-1.5 pr-5 text-left font-normal ${SKY}`}>
              {v('S')}, splitting a cut at that level
            </th>
            {MODEL.seam.map((n, i) => (
              <td key={i} className="text-center">
                {n}
              </td>
            ))}
          </tr>
          <tr className="border-border border-t">
            <th className={`py-1.5 pr-5 text-left font-normal ${PUR}`}>
              {v('F')}, a shot mid-generation at that level
            </th>
            {MODEL.frame.map((n, i) => (
              <td key={i} className="text-center">
                {n}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  )
}

// -----------------------------------------------------------------------------
// Figure 2: the scene generated both ways (pair 1 of the explainer's before/after)
// -----------------------------------------------------------------------------

/** Each take's 5.6 s, from shot 3's first frame through the cut into shot 4, and the generation each part is in */
const RESULTS = [
  {
    video: 'result-packed',
    title: 'Packed full',
    plan: '[1 2 3] [4]',
    good: false,
    parts: [
      { from: 0, to: 4, label: 'Shot 3', generation: 1 },
      { from: 4, to: 5.6, label: 'Shot 4, a new generation', generation: 2 },
    ],
    notes: [
      'The morning opens in the kitchen',
      'She is running, then suddenly crouching',
    ],
  },
  {
    video: 'result-plan',
    title: 'Split at the jump',
    plan: '[1 2] [3 4]',
    good: true,
    parts: [
      { from: 0, to: 3.7, label: 'Shot 3', generation: 2 },
      {
        from: 3.7,
        to: 5.6,
        label: 'Shot 4, the same generation',
        generation: 2,
      },
    ],
    notes: [
      'The morning opens on its keyframe',
      'She slows and crouches in one move',
    ],
  },
]
const RESULT_SECONDS = 5.6
const pct = (seconds: number) => `${(100 * seconds) / RESULT_SECONDS}%`

/** The two takes play together, from the start, while the figure is in view - unless the reader would rather nothing moved */
export function ResultFigure() {
  const box = useRef<HTMLDivElement>(null)
  const videos = useRef<(HTMLVideoElement | null)[]>([])
  const heads = useRef<(HTMLSpanElement | null)[]>([])
  const [still, setStill] = useState(false)
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (reduced.matches) {
      setStill(true)
      return
    }
    const element = box.current
    if (!element) return
    let frame = 0
    // Each playhead follows its video
    const follow = () => {
      videos.current.forEach((video, i) => {
        const head = heads.current[i]
        if (video && head) head.style.left = pct(video.currentTime)
      })
      frame = requestAnimationFrame(follow)
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        videos.current.forEach((video) => {
          if (!video) return
          if (entry.isIntersecting) {
            video.currentTime = 0
            void video.play().catch(() => setStill(true))
          } else video.pause()
        })
        cancelAnimationFrame(frame)
        if (entry.isIntersecting) frame = requestAnimationFrame(follow)
      },
      { threshold: 0.5 },
    )
    observer.observe(element)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [])
  return (
    <Figure
      number={2}
      fixed={false}
      caption={
        <>
          Shots 3 and 4 of the boat scene, generated by MiniMax H3 with each
          split, from the same keyframes and references. The bar under each take
          shows its two shots, with a gap where a new generation starts.
        </>
      }
    >
      <div ref={box} className="grid gap-8 sm:grid-cols-2 sm:gap-6">
        {RESULTS.map((result, i) => (
          <div key={result.video}>
            <p className="mb-2.5 flex items-baseline gap-2 text-[14px] font-medium">
              <span className={result.good ? SKY : 'text-foreground'}>
                {result.title}
              </span>
              <span className="text-muted-foreground font-mono text-[12px] font-normal">
                {result.plan}
              </span>
            </p>
            <Frame
              kind="generated"
              video={
                <video
                  ref={(video) => {
                    videos.current[i] = video
                  }}
                  src={`${IMG}/${result.video}.mp4`}
                  poster={`${IMG}/${result.video}.jpg`}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  controls={still}
                  aria-label={`${result.title}: ${result.notes.join('; ')}`}
                  className="size-full object-cover"
                />
              }
            />
            {/* The take's shots: apart where a new generation starts, joined where the cut is inside one */}
            <div className="relative mt-3 h-[6px]">
              {result.parts.map((part, k) => {
                const gapBefore =
                  k === 0
                    ? 0
                    : result.parts[k - 1].generation === part.generation
                      ? 2
                      : 6
                const next = result.parts[k + 1]
                const gapAfter = !next
                  ? 0
                  : next.generation === part.generation
                    ? 2
                    : 6
                return (
                  <span
                    key={part.label}
                    className={`absolute top-0 h-full ${gapBefore !== 2 ? 'rounded-l-full' : ''} ${gapAfter !== 2 ? 'rounded-r-full' : ''} ${result.good ? 'bg-[var(--doki-sky-line)]' : 'bg-muted-foreground/40'}`}
                    style={{
                      left: `calc(${pct(part.from)} + ${gapBefore / 2}px)`,
                      width: `calc(${pct(part.to - part.from)} - ${(gapBefore + gapAfter) / 2}px)`,
                    }}
                  />
                )
              })}
              {!still && (
                <span
                  ref={(head) => {
                    heads.current[i] = head
                  }}
                  aria-hidden="true"
                  className="bg-foreground absolute -top-[4px] h-[14px] w-[2px] -translate-x-1/2 rounded-full"
                  style={{ left: 0 }}
                />
              )}
            </div>
            <div className="text-muted-foreground relative mt-1.5 h-4 text-[12px]">
              <span className="absolute left-0">{result.parts[0].label}</span>
              <span className="absolute right-0">{result.parts[1].label}</span>
            </div>
            <ul className="mt-3 space-y-1 text-[13px] leading-snug">
              {result.notes.map((note) => (
                <li key={note}>
                  <Mark good={result.good}>
                    {result.good ? '✓' : '✗'} {note}
                  </Mark>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Figure>
  )
}

// -----------------------------------------------------------------------------
// Figure 4: a longer scene, planned for two models (read and planned, not generated)
// -----------------------------------------------------------------------------

/** clip-planner-explainer/film-after/scenes/river.txt: its shots' lengths and parts */
const RIVER_SECONDS = [5, 3, 3, 4, 4, 3, 4, 3, 4, 4]
const RIVER_PARTS = [
  { from: 0, to: 3, when: 'Morning', where: 'the kitchen' },
  { from: 3, to: 8, when: 'Later', where: 'the river' },
  { from: 8, to: 10, when: 'Evening', where: 'downstream' },
]
interface RiverMark {
  /** A boundary before shot n, or the middle of shot n */
  at: { before: number } | { middle: number }
  text: string
  good: boolean
  align?: 'start' | 'center' | 'end'
}
/** The plans, as data/plan.json "river" has them (MiniMax packed, MiniMax planned, Seedance planned) */
const RIVER_PLANS: {
  name: string
  model: string
  planned: boolean
  groups: [number, number][]
  marks: RiverMark[]
}[] = [
  {
    name: 'Packed full',
    model: 'MiniMax H3',
    planned: false,
    groups: [
      [0, 4],
      [4, 8],
      [8, 10],
    ],
    marks: [
      {
        at: { middle: 3 },
        text: '✗ the river opens mid-generation',
        good: false,
        align: 'end',
      },
      {
        at: { before: 4 },
        text: '✗ her run is split',
        good: false,
        align: 'start',
      },
    ],
  },
  {
    name: 'The plan',
    model: 'MiniMax H3',
    planned: true,
    groups: [
      [0, 3],
      [3, 6],
      [6, 8],
      [8, 10],
    ],
    marks: [
      { at: { before: 3 }, text: '↑ fresh start', good: true },
      { at: { before: 6 }, text: '↑ the boat drifts away', good: true },
      { at: { before: 8 }, text: '↑ fresh start', good: true },
    ],
  },
  {
    name: 'The plan',
    model: 'Seedance 2.5',
    planned: true,
    groups: [
      [0, 8],
      [8, 10],
    ],
    marks: [],
  },
]
const RIVER_GAP = 6
const RIVER_THUMB_H = 54
const RIVER_ROW = 70

export function RiverFigure() {
  return (
    <Figure
      number={4}
      caption={
        <>
          A longer scene, 10 shots and 37 s in three parts, read and planned by
          Doki but not generated. Packing makes both mistakes again. MiniMax
          H3&rsquo;s plan starts fresh at both jumps in time and splits the
          river part where the boat drifts away from her; Seedance 2.5, with 30
          seconds a generation, needs two.
        </>
      }
    >
      {(width: number) => {
        const px =
          (width - (RIVER_SECONDS.length - 1) * RIVER_GAP) /
          RIVER_SECONDS.reduce((sum, s) => sum + s, 0)
        const left = (i: number) =>
          RIVER_SECONDS.slice(0, i).reduce((sum, s) => sum + s * px, 0) +
          i * RIVER_GAP
        const right = (i: number) => left(i) + RIVER_SECONDS[i] * px
        const markX = (at: RiverMark['at']) =>
          'before' in at
            ? left(at.before) - RIVER_GAP / 2
            : left(at.middle) + (RIVER_SECONDS[at.middle] * px) / 2
        const thumbsY = 30
        const plansY = thumbsY + RIVER_THUMB_H + 46
        return (
          <div
            className="relative"
            style={{
              height: plansY + (RIVER_PLANS.length - 1) * RIVER_ROW + 36,
            }}
          >
            {RIVER_PARTS.map((part) => (
              <p
                key={part.when}
                className="border-border absolute border-b pb-1 text-center text-[13px] leading-none"
                style={{
                  left: left(part.from),
                  width: right(part.to - 1) - left(part.from),
                }}
              >
                <span className="text-foreground font-medium">{part.when}</span>{' '}
                <span className="text-muted-foreground">· {part.where}</span>
              </p>
            ))}
            {RIVER_SECONDS.map((seconds, i) => (
              <div
                key={i}
                className="absolute"
                style={{ left: left(i), top: thumbsY, width: seconds * px }}
              >
                <div className="border-border bg-background rounded-[var(--radius-md)] border p-1">
                  <p className="mb-1 px-0.5 font-mono text-[12px] leading-none font-semibold">
                    {i + 1}
                  </p>
                  <img
                    src={`${IMG}/river-${i + 1}.jpg`}
                    alt={`Shot ${i + 1}`}
                    className="w-full rounded-[3px] object-cover"
                    style={{ height: RIVER_THUMB_H }}
                  />
                </div>
              </div>
            ))}
            {RIVER_PLANS.map((plan, row) => (
              <div
                key={plan.model + plan.groups.length}
                className="absolute left-0"
                style={{ top: plansY + row * RIVER_ROW, width }}
              >
                <RowLabel
                  name={plan.name}
                  model={plan.model}
                  planned={plan.planned}
                />
                <div className="relative mt-2.5 h-2">
                  {plan.groups.map(([a, b]) => (
                    <Generation
                      key={a}
                      x1={left(a)}
                      x2={right(b - 1)}
                      top={0}
                      planned={plan.planned}
                    />
                  ))}
                </div>
                {plan.marks.map((mark) => {
                  const align = mark.align ?? 'center'
                  return (
                    <p
                      key={mark.text + markX(mark.at)}
                      className={`absolute mt-2 whitespace-nowrap ${align === 'center' ? '-translate-x-1/2' : align === 'end' ? '-translate-x-full' : ''}`}
                      style={{
                        left:
                          markX(mark.at) +
                          (align === 'start' ? 6 : align === 'end' ? -6 : 0),
                      }}
                    >
                      <Mark good={mark.good}>{mark.text}</Mark>
                    </p>
                  )
                })}
              </div>
            ))}
          </div>
        )
      }}
    </Figure>
  )
}

// -----------------------------------------------------------------------------
// Figure 5: keep, edit or remake
// -----------------------------------------------------------------------------

function Shot({
  image,
  label,
  mark,
}: {
  image: string
  label: string
  mark?: 'yes' | 'no'
}) {
  return (
    <div>
      <KeyframeCard image={image} alt={label} />
      <p className="mt-2 text-[13px]">
        {mark && (
          <span
            className={`mr-1.5 font-medium ${mark === 'yes' ? SKY : 'text-[var(--doki-rose)]'}`}
          >
            {mark === 'yes' ? '✓' : '✗'}
          </span>
        )}
        {label}
      </p>
    </div>
  )
}

type Choice = 'keep' | 'edit' | 'remake'

/** A choice of the judge's, as a pill: keep is quiet, edit sky, remake rose */
function ChoicePill({ choice }: { choice: Choice }) {
  const tint = {
    keep: 'border-border text-muted-foreground',
    edit: 'border-[var(--doki-sky-line)] bg-[var(--doki-sky-bg)] text-[var(--doki-sky)]',
    remake:
      'border-[var(--doki-rose-line)] bg-[var(--doki-rose-bg)] text-[var(--doki-rose)]',
  }[choice]
  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-[12px] font-medium sm:px-2.5 ${tint}`}
    >
      {choice}
    </span>
  )
}

/** What Doki's judge picked: the demo's frozen Mars, and new lines in a Japanese teaser */
const CASES: {
  image: string
  change: ReactNode
  picks: { image: Choice; video: Choice }
}[] = [
  {
    image: 'jar-frozen',
    change: (
      <>
        <T>@Mars</T>
        <Eq />
        endless <s className="text-muted-foreground">red</s> frozen dunes
      </>
    ),
    picks: { image: 'edit', video: 'edit' },
  },
  {
    image: 'funeral-start',
    change: <>New lines of dialogue in a shot of a Japanese teaser</>,
    picks: { image: 'keep', video: 'remake' },
  },
]

export function UpdateFigure() {
  return (
    <Figure
      number={5}
      fixed={false}
      caption={
        <>
          A definition changes and one shot is out of date. Made again from its
          words, the shot comes out new: another pose, another dome, another
          light. Doki&rsquo;s judge picked an edit for its image and its video,
          so only the ground froze. Below, its choices for that change and for a
          shot of a Japanese teaser that got new lines of dialogue: the image
          was kept and the video remade, since an edit can&rsquo;t change what
          is said.
        </>
      }
    >
      <p className="mb-3 text-[14px]">
        <TypeChip type="Scene" />
        <T>@Mars</T>
        <Eq />
        Endless <s className="text-muted-foreground">red</s>{' '}
        <span
          className={`rounded-sm bg-[var(--doki-sky-bg)] px-0.5 font-medium ${SKY}`}
        >
          frozen
        </span>{' '}
        dunes …
      </p>
      <div className="grid grid-cols-3 gap-3">
        <Shot image="jar-mars" label="Before" />
        <Shot
          image="jar-remade"
          label="Made again: everything changed"
          mark="no"
        />
        <Shot
          image="jar-frozen"
          label="Edited: only the ground changed"
          mark="yes"
        />
      </div>

      <div className="border-border mt-6 overflow-hidden rounded-[var(--radius-xl)] border text-[13px]">
        <div className="bg-muted/40 text-muted-foreground grid grid-cols-[1fr_64px_76px] items-center gap-2 px-3 py-2 font-mono text-[11px] tracking-wide uppercase sm:grid-cols-[1fr_96px_96px] sm:gap-4 sm:px-4">
          <span>The change</span>
          <span className="text-center">Image</span>
          <span className="text-center">Video</span>
        </div>
        {CASES.map((c) => (
          <div
            key={c.image}
            className="border-border grid grid-cols-[1fr_64px_76px] items-center gap-2 border-t px-3 py-2.5 sm:grid-cols-[1fr_96px_96px] sm:gap-4 sm:px-4"
          >
            <span className="flex items-center gap-3">
              <img
                src={`${IMG}/${c.image}.jpg`}
                alt=""
                className="hidden h-9 w-16 shrink-0 rounded-[var(--radius-sm)] object-cover sm:block"
              />
              <span>{c.change}</span>
            </span>
            <span className="text-center">
              <ChoicePill choice={c.picks.image} />
            </span>
            <span className="text-center">
              <ChoicePill choice={c.picks.video} />
            </span>
          </div>
        ))}
      </div>
    </Figure>
  )
}

// -----------------------------------------------------------------------------
// Figure 6: where the reviews run
// -----------------------------------------------------------------------------

const REVIEWS = [
  {
    when: 'A few shots are written',
    check: 'Script read',
    sees: 'The script, read as its viewer will see the film',
  },
  {
    when: 'Each image or video is made',
    check: 'Picture check',
    sees: 'The new pictures, their neighbors, the reference images of what they tag',
  },
  {
    when: 'Every shot has a picture',
    check: 'Film review',
    sees: 'Every picture in order, with the lengths added up by code',
  },
  {
    when: 'Every shot has a video',
    check: 'First viewer, then film review',
    sees: 'The clips with sound. The viewer gets no script and no request',
  },
]

export function ReviewFigure() {
  return (
    <Figure
      number={6}
      caption={
        <>
          The reviews in one request, as the agent works from left to right.
          Each is set off by what the agent just did, not by the agent asking,
          and what it finds comes back in that tool&rsquo;s result. A shot is
          checked at most three times a request.
        </>
      }
    >
      <div className="relative grid grid-cols-4 gap-3 text-[12px]">
        {/* One line through all four moments */}
        <span
          aria-hidden="true"
          className="bg-border absolute top-[46px] right-[12.5%] left-[12.5%] h-px"
        />
        {REVIEWS.map((review, i) => (
          <div key={review.check} className="flex flex-col items-center">
            <p className="text-muted-foreground flex h-9 items-end text-center leading-tight">
              {review.when}
            </p>
            <span className="relative z-10 my-2 flex size-5 items-center justify-center rounded-full border border-[var(--doki-sky-line)] bg-[var(--doki-sky-bg)] text-[11px] font-semibold text-[var(--doki-sky)] tabular-nums">
              {i + 1}
            </span>
            <div className="border-border bg-background w-full flex-1 rounded-[var(--radius-lg)] border p-3">
              <p className="text-[13px] font-medium">{review.check}</p>
              <p className="text-muted-foreground mt-1 leading-snug">
                {review.sees}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Figure>
  )
}
