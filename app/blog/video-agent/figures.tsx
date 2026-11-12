'use client'

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

// The figures and examples of "Designing a Video Agent That Can Actually Make a
// Long Film", drawn in Doki's own visual language: its editor's tag colors (sky
// for @, purple for #, rose for the "=" of a definition; app/globals.css), its
// definition chips. Pictures and data come from Doki's example
// film The Last Three and the Doki demo; the clip planner is Doki's own
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

const TYPES = {
  Character: { emoji: '👤', symbol: '@' },
  Scene: { emoji: '🏠', symbol: '@' },
  Ingredient: { emoji: '🧩', symbol: '@' },
  Ambience: { emoji: '✨', symbol: '#' },
} as const

/** A definition's type, as the chip Doki puts before it */
function TypeChip({ type }: { type: keyof typeof TYPES }) {
  const { emoji, symbol } = TYPES[type]
  const tint =
    symbol === '@'
      ? 'border-[var(--doki-sky-line)] bg-[var(--doki-sky-bg)] text-[var(--doki-sky)]'
      : 'border-[var(--doki-pur-line)] bg-[var(--doki-pur-bg)] text-[var(--doki-pur)]'
  return (
    <span
      className={`mr-1.5 inline-flex items-center gap-1 rounded-md border px-1.5 py-px align-[0.06em] text-[0.82em] font-medium whitespace-nowrap ${tint}`}
    >
      <span aria-hidden="true">{emoji}</span>
      {type}
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

/** A scene clip's prompt in MiniMax's own shot-list form */
export function ShotList() {
  const shots = [
    {
      at: null,
      text: 'Medium shot on the snowy platform: Mio raises the camera to her eye …',
    },
    {
      at: '00:03.000',
      text: 'the camera cuts to a close-up of Haruto as he looks back …',
    },
    {
      at: '00:07.000',
      text: 'the camera cuts to the camera tumbling into the snow …',
    },
  ]
  return (
    <Excerpt label="A scene clip's video prompt, in MiniMax's shot-list form">
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

/** Dots for a 0-3 level: how much a cut needs one take (sky), or a shot its exact frame (purple) */
function Dots({
  level,
  kind,
  vertical,
}: {
  level: number
  kind: 'seam' | 'frame'
  vertical?: boolean
}) {
  const on =
    kind === 'seam' ? 'bg-[var(--doki-sky-line)]' : 'bg-[var(--doki-pur-line)]'
  return (
    <span
      className={`inline-flex items-center gap-[3px] ${vertical ? 'flex-col' : ''}`}
    >
      {[1, 2, 3].map((n) => (
        <i
          key={n}
          className={`block size-[6px] rounded-full ${n <= level ? on : 'bg-border'}`}
        />
      ))}
    </span>
  )
}

/** Two levels of the scene reader's rubric for a cut, with the dots the planner figure uses */
export function Rubric() {
  const levels = [
    {
      level: 3,
      text: "one moment that can't break - a line of dialogue answered, an action caught mid-way, a sound that runs across the cut, or two nearly identical views that would jump if made apart",
    },
    {
      level: 0,
      text: 'a new place or time, or a deliberate break - nothing needs to carry over',
    },
  ]
  return (
    <Excerpt label="Doki's scene reader, how much a cut needs one take">
      <ul className="space-y-2">
        {levels.map(({ level, text }) => (
          <li key={level} className="flex items-baseline gap-3">
            <span className="flex shrink-0 items-center gap-2 font-mono text-[12px]">
              <Dots level={level} kind="seam" />
              {level}
            </span>
            <span>{text}</span>
          </li>
        ))}
      </ul>
    </Excerpt>
  )
}

// -----------------------------------------------------------------------------
// The model quirks I hit most, and the wording that helped
// -----------------------------------------------------------------------------

const QUIRKS: [string, string][] = [
  [
    'The first frame shows the end of the action ("starting to sit" comes out seated)',
    'Describe the frame as a photo of the first instant, in states, not actions',
  ],
  [
    'Every clip slows to a stop before its cut',
    'Keep the action and the camera moving through the last second, except where a scene ends',
  ],
  [
    'The model cuts on its own, especially in dialogue',
    'Start with "Single continuous shot" and end with "No scene cuts."',
  ],
  [
    'A later cut in the same clip loses the film’s style',
    'Restate the look at the start of every cut',
  ],
  [
    'A crowd reacts on the same beat, like a flash mob',
    'Give each person who reacts a moment of their own, one after another',
  ],
  [
    'Speech in another language comes out as burned-in subtitles',
    'Name the language: “says in Mandarin”',
  ],
  [
    'A shot with no action plays nearly frozen',
    'Give the subject one small, natural action',
  ],
  [
    'A character’s voice changes from clip to clip',
    'Write how they sound in their definition, and tag them in their lines',
  ],
  [
    'A reverse angle comes out as the same view again',
    'Cut to it inside one clip instead of making a separate image',
  ],
  [
    'An invented sound (“a magical hum”) is heard as music',
    'Don’t add sounds the shot doesn’t have a source for',
  ],
]

export function QuirksTable() {
  return (
    <div className="not-prose border-border my-6 overflow-hidden rounded-[var(--radius-lg)] border text-[14px]">
      <div className="bg-muted/40 text-muted-foreground grid grid-cols-2 gap-6 px-4 py-2 font-mono text-[11px] tracking-wide uppercase">
        <span>What goes wrong</span>
        <span>What helped</span>
      </div>
      {QUIRKS.map(([wrong, fix]) => (
        <div
          key={wrong}
          className="border-border grid grid-cols-2 gap-6 border-t px-4 py-2.5 leading-snug"
        >
          <span className="text-muted-foreground">{wrong}</span>
          <span className="text-foreground">{fix}</span>
        </div>
      ))}
    </div>
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
    <span className="bg-foreground text-background absolute -top-2 -left-2 flex size-[18px] items-center justify-center rounded-full text-[10px] font-semibold tabular-nums">
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
                    <span className="bg-foreground text-background absolute top-0 left-0 flex size-[18px] items-center justify-center rounded-full text-[10px] font-semibold">
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
                  <p className="mb-1.5 text-[12.5px] leading-none">
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
                      <p className="text-muted-foreground text-[11px] leading-snug">
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
                <ol className="space-y-1 text-[12.5px]">
                  {RESOLVED.map((name, i) => (
                    <li key={name} className="flex items-center gap-2">
                      <span className="text-muted-foreground w-3 text-right text-[11px] tabular-nums">
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
                <p className="text-muted-foreground mt-3 mb-1.5 text-[11px]">
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
// Figure 2: one clip a shot, or one clip a scene
// -----------------------------------------------------------------------------

/** The platform scene's first three shots, which Figure 3's plan makes one clip */
const OPENING = [
  { image: 'b1', says: 'A girl raises her camera' },
  { image: 'b2', says: 'A boy looks back, and it slips' },
  { image: 'b3', says: 'The camera falls into the snow' },
]
const SHOT_GAP = 14
const WAVE_H = 40
const WAVE_PAD = 10

const smooth = (u: number) => u * u * (3 - 2 * u)

/**
 * A clip's motion and sound, as a line from x0 to x1. A clip of one shot starts
 * from a still and slows to a stop before its cut, so its swing rises from flat
 * and falls back; a clip of the whole scene keeps swinging through its cuts.
 */
const wave = (x0: number, x1: number, settles: boolean) => {
  const mid = WAVE_H / 2
  const points: string[] = []
  for (let x = x0; x <= x1 + 0.01; x += 1.5) {
    const t = (x - x0) / (x1 - x0)
    const envelope = settles
      ? smooth(Math.min(1, t / 0.22)) * smooth(Math.min(1, (1 - t) / 0.32))
      : 1
    const swing = envelope * (0.78 + 0.22 * Math.sin(x / 29)) * (mid - 7)
    const y = mid - swing * Math.sin(((x - x0) / 14) * Math.PI)
    points.push(`${x.toFixed(1)} ${y.toFixed(1)}`)
  }
  return `M${points.join(' L')}`
}

const GENERATIONS = [
  {
    label: 'One clip per shot',
    note: 'Motion and sound restart at every cut',
    clips: [
      [0, 1],
      [1, 2],
      [2, 3],
    ],
  },
  {
    label: 'One clip per scene',
    note: 'Motion and sound carry across the cuts',
    clips: [[0, 3]],
  },
]

export function SceneFigure() {
  return (
    <Figure
      number={2}
      caption={
        <>
          Three shots of one scene, on a snowy train platform. Generated one
          clip per shot, each clip starts from a still and slows to a stop
          before its cut. Generated as one clip, the scene keeps moving through
          its cuts (dashed).
        </>
      }
    >
      {(width: number) => {
        const imageW = (width - 2 * SHOT_GAP) / OPENING.length
        const left = (i: number) => i * (imageW + SHOT_GAP)
        const right = (i: number) => left(i) + imageW
        return (
          <div className="text-[12px]">
            <div className="flex" style={{ gap: SHOT_GAP }}>
              {OPENING.map((shot, i) => (
                <div key={shot.image} style={{ width: imageW }}>
                  <p className="mb-1 font-medium">Shot {i + 1}</p>
                  <img
                    src={`${IMG}/${shot.image}.jpg`}
                    alt={shot.says}
                    className="w-full rounded-[var(--radius-sm)] object-cover"
                    style={{ height: Math.round(imageW * 0.5625) }}
                  />
                  <p className="text-muted-foreground mt-1 text-[11px] leading-snug">
                    {shot.says}
                  </p>
                </div>
              ))}
            </div>

            <div className="text-muted-foreground mt-2 flex items-end gap-2 text-[11px] leading-none">
              <span className="border-border mb-[5px] h-2 flex-1 rounded-bl-[3px] border-b border-l" />
              One scene
              <span className="border-border mb-[5px] h-2 flex-1 rounded-br-[3px] border-r border-b" />
            </div>

            {GENERATIONS.map((row) => {
              const whole = row.clips.length === 1
              return (
                <div key={row.label} className="mt-5">
                  <p className="mb-1.5 flex items-baseline justify-between">
                    <span className="font-medium">{row.label}</span>
                    <span className="text-muted-foreground text-[11px]">
                      {row.note}
                    </span>
                  </p>
                  <svg
                    width={width}
                    height={WAVE_H}
                    className="block"
                    aria-hidden="true"
                  >
                    {row.clips.map(([a, b]) => (
                      <g key={a}>
                        <rect
                          x={left(a)}
                          width={right(b - 1) - left(a)}
                          height={WAVE_H}
                          rx="8"
                          className="fill-muted"
                        />
                        <path
                          d={wave(
                            left(a) + WAVE_PAD,
                            right(b - 1) - WAVE_PAD,
                            !whole,
                          )}
                          fill="none"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className={
                            whole
                              ? 'stroke-[var(--doki-sky)]'
                              : 'stroke-muted-foreground'
                          }
                        />
                      </g>
                    ))}
                    {whole &&
                      OPENING.slice(1).map((shot, i) => (
                        <line
                          key={shot.image}
                          x1={left(i + 1) - SHOT_GAP / 2}
                          x2={left(i + 1) - SHOT_GAP / 2}
                          y1="3"
                          y2={WAVE_H - 3}
                          strokeDasharray="2 3"
                          className="stroke-muted-foreground"
                        />
                      ))}
                  </svg>
                </div>
              )
            })}
          </div>
        )
      }}
    </Figure>
  )
}

// -----------------------------------------------------------------------------
// Figure 3: planning a scene's clips
// -----------------------------------------------------------------------------

const SCENE = [
  { image: 'b1', seconds: 3, says: 'A girl raises her camera' },
  { image: 'b2', seconds: 4, says: 'A boy looks back, and it slips' },
  { image: 'b3', seconds: 7, says: 'The camera falls into the snow' },
  { image: 'b4', seconds: 3, says: 'The boy picks it up' },
  { image: 'b5', seconds: 3, says: 'Through the train window' },
]
/** Doki's scene reader on this scene: how much each cut needs one take */
const READ_SEAMS = [2, 3, 2, 2]
/** ... and how much each shot needs to open exactly on its frame */
const READ_FRAMES = [2, 2, 3, 3, 2]
/** MiniMax H3 Max as Doki has it: clips of 5-15 s, its price a second, its measured losses by level */
const MODEL = {
  longest: 15,
  shortest: 5,
  pricePerSecond: 0.08,
  seam: [0, 0.1, 1.2, 1.3],
  frame: [-0.1, -0.1, 1.2, 1.2],
}
const LAMBDA = 0.5

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

const GAP = 14
const LEFT0 = 12

/** The scene's shots laid out across a width: seconds to pixels, and where each shot and cut sits */
const timeline = (width: number) => {
  const px = (width - 2 * LEFT0 - (SCENE.length - 1) * GAP) / 20
  const lefts = SCENE.reduce<number[]>((all, shot, i) => {
    all.push(i === 0 ? LEFT0 : all[i - 1] + SCENE[i - 1].seconds * px + GAP)
    return all
  }, [])
  const rightOf = (i: number) => lefts[i] + SCENE[i].seconds * px
  /** Where the planner can start a clip: before shot j (j = 0..5) */
  const cutX = (j: number) =>
    j === 0
      ? lefts[0]
      : j === SCENE.length
        ? rightOf(SCENE.length - 1)
        : lefts[j] - GAP / 2
  return { px, lefts, rightOf, cutX, imageH: Math.round(px * 2) }
}

/** A level the reader can change, by clicking its dots */
function LevelButton({
  level,
  kind,
  label,
  onClick,
  vertical,
}: {
  level: number
  kind: 'seam' | 'frame'
  label: string
  onClick: () => void
  vertical?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${label}: level ${level} of 3`}
      title={`${label}: ${level} of 3`}
      className="hover:bg-muted bg-background flex cursor-pointer items-center rounded-full p-1 transition-colors"
    >
      <Dots level={level} kind={kind} vertical={vertical} />
    </button>
  )
}

const LEGEND_H = 30
const BAND_H = 178
const DP_Y = LEGEND_H + 236

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
    `s${w.start + 1}${w.end - 1 > w.start ? `–s${w.end}` : ''}`

  return (
    <Figure
      number={3}
      caption={
        <>
          The platform scene of Fig. 2, all five shots, planned for MiniMax H3
          Max. Between shots, the dots say how much a cut needs one take; under
          each shot, how much it needs its exact frame. Below, every clip the
          planner weighs, with best[j] at each node and the plan it picks drawn
          dark. The scene is 20 s, over the model&rsquo;s 15, and it splits
          before s4, which has to open on its frame. Click the dots to change a
          level.
        </>
      }
    >
      {(width: number) => {
        const { px, lefts, rightOf, cutX, imageH } = timeline(width)
        const arc = (w: Weighed) => {
          const x1 = cutX(w.start)
          const x2 = cutX(w.end)
          const depth = 14 + (x2 - x1) * 0.12
          const pull = DP_Y + (depth * 4) / 3
          return {
            d: `M${x1} ${DP_Y} C ${x1} ${pull}, ${x2} ${pull}, ${x2} ${DP_Y}`,
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
          <div className="relative h-[376px] text-[12px]">
            <div className="text-muted-foreground absolute top-0 left-0 flex gap-5 px-1 text-[11px]">
              <span className="flex items-center gap-1.5">
                <Dots level={2} kind="seam" />
                How much a cut needs one take
              </span>
              <span className="flex items-center gap-1.5">
                <Dots level={2} kind="frame" />
                How much a shot needs its exact frame
              </span>
            </div>

            {plan.clips.map(([start, end]) => {
              const seconds = SCENE.slice(start, end).reduce(
                (sum, shot) => sum + shot.seconds,
                0,
              )
              return (
                <div
                  key={`${start}-${end}`}
                  className="bg-muted absolute rounded-[var(--radius-lg)] transition-[left,width] duration-300"
                  style={{
                    top: LEGEND_H,
                    left: lefts[start] - 6,
                    width: rightOf(end - 1) - lefts[start] + 12,
                    height: BAND_H,
                  }}
                >
                  <p className="text-muted-foreground px-2 pt-1.5 text-[11px]">
                    One generation · {seconds} s
                  </p>
                </div>
              )
            })}

            {SCENE.map((shot, i) => (
              <div
                key={shot.image}
                className="absolute"
                style={{
                  left: lefts[i],
                  top: LEGEND_H + 26,
                  width: shot.seconds * px,
                }}
              >
                <p className="mb-1 flex justify-between">
                  <span className="font-medium">s{i + 1}</span>
                  <span className="text-muted-foreground tabular-nums">
                    {shot.seconds} s
                  </span>
                </p>
                <img
                  src={`${IMG}/${shot.image}.jpg`}
                  alt={shot.says}
                  className="w-full rounded-[var(--radius-sm)] object-cover"
                  style={{ height: imageH }}
                />
                <div className="mt-1 -ml-1">
                  <LevelButton
                    level={frames[i]}
                    kind="frame"
                    label={`How much s${i + 1} needs its exact frame`}
                    onClick={() => setFrames(cycle(frames, i))}
                  />
                </div>
                <p className="text-muted-foreground text-[11px] leading-snug">
                  {shot.says}
                </p>
              </div>
            ))}

            {seams.map((level, i) => (
              <div
                key={i}
                className="absolute -translate-x-1/2"
                style={{
                  left: cutX(i + 1),
                  top: LEGEND_H + 44 + imageH / 2 - 15,
                }}
              >
                <LevelButton
                  vertical
                  level={level}
                  kind="seam"
                  label={`How much the cut after s${i + 1} needs one take`}
                  onClick={() => setSeams(cycle(seams, i))}
                />
              </div>
            ))}

            <svg
              className="pointer-events-none absolute top-0 left-0"
              width={width}
              height="376"
              aria-hidden="true"
            >
              <line
                x1={cutX(0)}
                x2={cutX(SCENE.length)}
                y1={DP_Y}
                y2={DP_Y}
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
                      className={`transition-colors ${on ? 'stroke-foreground' : hovered ? 'stroke-[var(--doki-sky-line)]' : 'stroke-border'}`}
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
                    y={DP_Y + depth + 15}
                    textAnchor="middle"
                    className="fill-foreground text-[11px] font-medium tabular-nums"
                  >
                    {clipName(w)}
                  </text>
                )
              })}
              {plan.best.map(({ loss }, j) => (
                <g key={j}>
                  <circle
                    cx={cutX(j)}
                    cy={DP_Y}
                    r="4"
                    className={
                      onPath(j)
                        ? 'fill-foreground stroke-foreground'
                        : 'fill-background stroke-muted-foreground'
                    }
                    strokeWidth="1.5"
                  />
                  <text
                    x={cutX(j)}
                    y={DP_Y - 11}
                    textAnchor="middle"
                    className={`text-[10px] tabular-nums ${onPath(j) ? 'fill-foreground' : 'fill-muted-foreground'}`}
                  >
                    {loss.toFixed(2)}
                  </text>
                </g>
              ))}
            </svg>

            <div
              className="text-muted-foreground absolute top-[352px] left-0 flex items-center justify-between px-1 text-[11px]"
              style={{ width }}
            >
              <span className="tabular-nums">
                {hover
                  ? `Clip ${clipName(hover)}: best[${hover.start}] plus what it loses = ${hover.loss.toFixed(2)}`
                  : 'Hover an arc to see what that clip would lose.'}
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
      says: 'a clip boundary before shot i+1',
    },
    {
      color: PUR,
      math: (
        <>
          &Sigma; {v('F')}(frame<sub>{v('k')}</sub>)
        </>
      ),
      says: 'each later shot opening only close to its frame',
    },
    {
      color: 'text-foreground',
      math: <>&lambda; &middot; price</>,
      says: 'the clip’s cost, at half a point a dollar',
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
            <th className="pr-5 text-left text-[11px] font-normal">
              Measured, MiniMax H3 Max
            </th>
            {[0, 1, 2, 3].map((n) => (
              <th key={n} className="w-14 pb-1 font-normal">
                <span className="flex flex-col items-center gap-1">
                  <span className="text-[11px]">{n}</span>
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="border-border border-t">
            <th className={`py-1.5 pr-5 text-left font-normal ${SKY}`}>
              {v('S')}, a boundary at that level
            </th>
            {MODEL.seam.map((n, i) => (
              <td key={i} className="text-center">
                {n}
              </td>
            ))}
          </tr>
          <tr className="border-border border-t">
            <th className={`py-1.5 pr-5 text-left font-normal ${PUR}`}>
              {v('F')}, a later shot at that level
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
// Figure 4: keep, edit or remake
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
      <img
        src={`${IMG}/${image}.jpg`}
        alt={label}
        className="aspect-video w-full rounded-[var(--radius-md)] object-cover"
      />
      <p className="mt-2 text-[12px]">
        {mark && (
          <span
            className={`mr-1.5 font-medium ${mark === 'yes' ? SKY : 'text-[var(--doki-rose)]'}`}
          >
            {mark === 'yes' ? '✓' : '✕'}
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
      number={4}
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
// Figure 5: where the reviews run
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
      number={5}
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
            <span className="relative z-10 my-2 flex size-5 items-center justify-center rounded-full border border-[var(--doki-sky-line)] bg-[var(--doki-sky-bg)] text-[10px] font-semibold text-[var(--doki-sky)] tabular-nums">
              {i + 1}
            </span>
            <div className="border-border bg-background w-full flex-1 rounded-[var(--radius-lg)] border p-3">
              <p className="font-medium">{review.check}</p>
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
