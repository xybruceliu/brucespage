'use client'

import { useMemo, useState, type ReactNode } from 'react'

// The figures of "Designing a Video Agent That Can Actually Make a Long Film".
// Pictures and data come from Doki's example film The Last Three and from the
// Doki demo; the clip planner is Doki's own
// (client/src/editor/services/clipPlanner.ts), cut down to what this scene needs.

const IMG = '/img/blog/video-agent'

/** A figure that keeps its layout and scrolls sideways on a narrow screen */
function Figure({
  children,
  caption,
  fixed = true,
}: {
  children: ReactNode
  caption: ReactNode
  fixed?: boolean
}) {
  return (
    <figure className="not-prose my-10">
      <div
        className={fixed ? '-mx-4 overflow-x-auto overflow-y-hidden px-4' : ''}
      >
        <div className={fixed ? 'mx-auto w-[600px]' : ''}>{children}</div>
      </div>
      <figcaption className="text-muted-foreground mt-4 text-sm leading-relaxed">
        {caption}
      </figcaption>
    </figure>
  )
}

/** A tag, as Doki's script shows it */
function T({ children }: { children: ReactNode }) {
  return <span className="text-foreground font-medium">{children}</span>
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
    <div className="not-prose border-border bg-muted/50 my-6 rounded-[var(--radius-lg)] border px-4 py-3">
      <p className="text-muted-foreground mb-1.5 font-mono text-[11px] tracking-wide uppercase">
        {from}
      </p>
      <div
        className={`text-foreground/90 space-y-2 text-[14px] leading-relaxed ${typeof children === 'string' ? 'whitespace-pre-line' : ''}`}
      >
        {children}
      </div>
    </div>
  )
}

/** The model quirks I hit most, and the wording that helped */
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
      <div className="bg-muted/50 text-muted-foreground grid grid-cols-2 gap-4 px-4 py-2 font-mono text-[11px] tracking-wide uppercase">
        <span>What goes wrong</span>
        <span>What helped</span>
      </div>
      {QUIRKS.map(([wrong, fix]) => (
        <div
          key={wrong}
          className="border-border grid grid-cols-2 gap-4 border-t px-4 py-2.5 leading-snug"
        >
          <span className="text-muted-foreground">{wrong}</span>
          <span className="text-foreground/90">{fix}</span>
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
  x: number
  y: number
}

const NODE_W = 138
const ROW_A = 164
const ROW_B = 272
const NODE_H = 78

const NODES: DefNode[] = [
  { key: 'shop', name: '@PhotoShop', order: 1, image: 'shop', x: 0, y: ROW_A },
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
    x: 154,
    y: ROW_A,
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
    x: 308,
    y: ROW_A,
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
    x: 462,
    y: ROW_A,
  },
  { key: 'mio', name: '@Mio', order: 2, image: 'mio', x: 154, y: ROW_B },
  {
    key: 'platform',
    name: '@Platform',
    order: 3,
    image: 'platform',
    x: 308,
    y: ROW_B,
  },
  { key: 'blue', name: '#BlueHour', order: 6, x: 462, y: ROW_B },
]

const EDGES: [string, string][] = [
  ['platform-photo', 'mio'],
  ['platform-photo', 'platform'],
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

function Badge({ n }: { n: number }) {
  return (
    <span className="bg-foreground text-background absolute -top-2 -left-2 flex size-[18px] items-center justify-center rounded-full text-[10px] font-semibold tabular-nums">
      {n}
    </span>
  )
}

export function ResolveFigure() {
  const node = (key: string) => NODES.find((n) => n.key === key)!
  const top = (n: DefNode) => [n.x + NODE_W / 2, n.y] as const
  const bottom = (n: DefNode) => [n.x + NODE_W / 2, n.y + NODE_H] as const
  const curve = ([x1, y1]: readonly number[], [x2, y2]: readonly number[]) => {
    const mid = (y1 + y2) / 2
    return `M${x1} ${y1} C ${x1} ${mid}, ${x2} ${mid}, ${x2} ${y2}`
  }

  return (
    <Figure
      caption={
        <>
          One shot of <i>The Last Three</i>. Its words name four definitions,
          which name three more, and every shot also gets the film&rsquo;s{' '}
          <T>#ALL</T>. The numbers are the order a depth-first walk emits them:
          each after what it uses. The image model gets the definitions in that
          order, and their images with the shot&rsquo;s own first, then the ones
          they bring, then the scene&rsquo;s earlier shots.
        </>
      }
    >
      <div className="relative h-[350px] text-[13px]">
        <svg
          className="text-border absolute inset-0"
          width="600"
          height="350"
          aria-hidden="true"
        >
          {NODES.filter((n) => n.y === ROW_A).map((n) => (
            <path
              key={n.key}
              d={curve([300, 118], top(n))}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          ))}
          {EDGES.map(([from, to]) => (
            <path
              key={from + to}
              d={curve(bottom(node(from)), top(node(to)))}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          ))}
        </svg>

        <div className="border-border bg-background absolute top-0 left-0 flex w-[600px] gap-4 rounded-[var(--radius-xl)] border p-2">
          <img
            src={`${IMG}/counter.jpg`}
            alt="Overhead close-up of a shop counter with three photos"
            className="h-[100px] w-[179px] rounded-[var(--radius-md)] object-cover"
          />
          <div className="py-1 pr-2">
            <p className="text-foreground leading-snug">
              Overhead close-up of <T>@PhotoShop</T>&rsquo;s counter: the last
              three photos, <T>@PlatformPhoto</T>, <T>@RoadPhoto</T> and{' '}
              <T>@WindowPhoto</T>.
            </p>
            <p className="text-muted-foreground relative mt-2 inline-block pl-5 text-[12px]">
              <span className="bg-foreground text-background absolute top-0 left-0 flex size-[16px] items-center justify-center rounded-full text-[9px] font-semibold">
                8
              </span>
              + <T>#ALL</T>, in every shot
            </p>
          </div>
        </div>

        {NODES.map((n) => (
          <div
            key={n.key}
            className="border-border bg-background absolute rounded-[var(--radius-lg)] border px-2 py-1.5"
            style={{ left: n.x, top: n.y, width: NODE_W, height: NODE_H }}
          >
            <Badge n={n.order} />
            <p className="mb-1 pl-1.5 text-[12.5px]">
              <T>{n.name}</T>
            </p>
            <div className="flex items-center gap-2">
              {n.image ? (
                <img
                  src={`${IMG}/${n.image}.jpg`}
                  alt=""
                  className="size-[44px] shrink-0 rounded-[var(--radius-sm)] object-cover"
                />
              ) : (
                <span className="bg-muted text-muted-foreground flex size-[44px] shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-lg">
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

      <div className="text-[13px]">
        <div className="border-border mt-6 grid w-[600px] grid-cols-[1fr_236px] gap-6 rounded-[var(--radius-xl)] border p-4">
          <div>
            <p className="text-muted-foreground mb-2 font-mono text-[11px] tracking-wide uppercase">
              Prompt
            </p>
            <ol className="space-y-[3px] text-[12px]">
              {RESOLVED.map((name, i) => (
                <li key={name} className="flex items-center gap-2">
                  <span className="text-muted-foreground w-3 text-right tabular-nums">
                    {i + 1}
                  </span>
                  <T>{name}</T>
                  <span className="text-muted-foreground">=</span>
                  <span
                    className="bg-muted h-[7px] rounded-full"
                    style={{ width: 60 + ((i * 37) % 70) }}
                  />
                </li>
              ))}
            </ol>
          </div>
          <div>
            <p className="text-muted-foreground mb-2 font-mono text-[11px] tracking-wide uppercase">
              Images
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
      </div>
    </Figure>
  )
}

// -----------------------------------------------------------------------------
// Figure 2: planning a scene's clips
// -----------------------------------------------------------------------------

const SCENE = [
  { image: 'b1', seconds: 3, says: 'Mio raises the camera' },
  { image: 'b2', seconds: 4, says: 'Haruto looks back; it slips' },
  { image: 'b3', seconds: 7, says: 'The camera falls in the snow' },
  { image: 'b4', seconds: 3, says: 'Haruto picks it up' },
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

const PX = 26
const GAP = 14
const LEFT0 = 12
const LEFTS = SCENE.reduce<number[]>((lefts, shot, i) => {
  lefts.push(i === 0 ? LEFT0 : lefts[i - 1] + SCENE[i - 1].seconds * PX + GAP)
  return lefts
}, [])
const rightOf = (i: number) => LEFTS[i] + SCENE[i].seconds * PX
/** Where the planner can start a clip: before shot j (j = 0..5) */
const cutX = (j: number) =>
  j === 0
    ? LEFTS[0]
    : j === SCENE.length
      ? rightOf(SCENE.length - 1)
      : LEFTS[j] - GAP / 2

function Pips({
  level,
  onClick,
  label,
  vertical,
}: {
  level: number
  onClick: () => void
  label: string
  vertical?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${label}: level ${level} of 3`}
      title={`${label}: ${level} of 3`}
      className={`hover:bg-muted flex cursor-pointer items-center gap-[3px] rounded-full p-1 transition-colors ${vertical ? 'flex-col' : ''}`}
    >
      {[1, 2, 3].map((n) => (
        <i
          key={n}
          className={`block size-[6px] rounded-full ${n <= level ? 'bg-foreground' : 'bg-border'}`}
        />
      ))}
    </button>
  )
}

const DP_Y = 236

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
  const cycle = (values: number[], i: number) =>
    values.map((v, k) => (k === i ? (v + 1) % 4 : v))

  return (
    <Figure
      caption={
        <>
          A scene of <i>The Last Three</i>, planned for MiniMax H3 Max. The dots
          are the scene reader&rsquo;s levels: between shots, how much a cut
          needs one take; under each shot, how much it needs its exact frame.
          Below, every clip the planner weighs, with best[j] at each node. The
          scene is 20 s, over the model&rsquo;s 15, and it splits before s4,
          which has to open on its frame. Click the dots to change a level.
        </>
      }
    >
      <div className="relative h-[346px] text-[12px]">
        {plan.clips.map(([start, end]) => {
          const seconds = SCENE.slice(start, end).reduce(
            (sum, shot) => sum + shot.seconds,
            0,
          )
          return (
            <div
              key={`${start}-${end}`}
              className="bg-muted absolute top-0 rounded-[var(--radius-lg)] transition-all duration-300"
              style={{
                left: LEFTS[start] - 6,
                width: rightOf(end - 1) - LEFTS[start] + 12,
                height: 178,
              }}
            >
              <p className="text-muted-foreground px-2 pt-1.5 text-[11px]">
                One generation, {seconds} s
              </p>
            </div>
          )
        })}

        {SCENE.map((shot, i) => (
          <div
            key={shot.image}
            className="absolute"
            style={{ left: LEFTS[i], top: 26, width: shot.seconds * PX }}
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
              className="h-[52px] w-full rounded-[var(--radius-sm)] object-cover"
            />
            <div className="mt-1 -ml-1">
              <Pips
                level={frames[i]}
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
            style={{ left: cutX(i + 1), top: 56 }}
          >
            <Pips
              vertical
              level={level}
              label={`How much the cut after s${i + 1} needs one take`}
              onClick={() => setSeams(cycle(seams, i))}
            />
          </div>
        ))}

        <svg
          className="pointer-events-none absolute top-0 left-0"
          width="600"
          height="346"
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
          {plan.weighed.map((w) => {
            const x1 = cutX(w.start)
            const x2 = cutX(w.end)
            const depth = 14 + (x2 - x1) * 0.12
            const pull = DP_Y + (depth * 4) / 3
            const on = chosen(w)
            const d = `M${x1} ${DP_Y} C ${x1} ${pull}, ${x2} ${pull}, ${x2} ${DP_Y}`
            const hovered = hover?.start === w.start && hover?.end === w.end
            return (
              <g key={`${w.start}-${w.end}`}>
                <path
                  d={d}
                  fill="none"
                  strokeWidth={on ? 2 : 1.25}
                  className={`transition-colors ${on ? 'stroke-foreground' : hovered ? 'stroke-muted-foreground' : 'stroke-border'}`}
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
            const x1 = cutX(w.start)
            const x2 = cutX(w.end)
            const depth = 14 + (x2 - x1) * 0.12
            return (
              <text
                key={`label-${w.start}-${w.end}`}
                x={(x1 + x2) / 2}
                y={DP_Y + depth + 14}
                textAnchor="middle"
                className="fill-foreground text-[11px] tabular-nums"
              >
                s{w.start + 1}
                {w.end - 1 > w.start ? `–s${w.end}` : ''}
              </text>
            )
          })}
          {plan.best.map(({ loss }, j) => (
            <g key={j}>
              <circle
                cx={cutX(j)}
                cy={DP_Y}
                r="4"
                className="fill-background stroke-foreground"
                strokeWidth="1.5"
              />
              <text
                x={cutX(j)}
                y={DP_Y - 10}
                textAnchor="middle"
                className="fill-muted-foreground text-[10px] tabular-nums"
              >
                {loss.toFixed(2)}
              </text>
            </g>
          ))}
        </svg>

        <div className="text-muted-foreground absolute top-[324px] left-0 flex w-[600px] items-center justify-between px-3 text-[11px]">
          <span className="tabular-nums">
            {hover
              ? `Clip s${hover.start + 1}${hover.end - 1 > hover.start ? `–s${hover.end}` : ''}: best[${hover.start}] + its losses = ${hover.loss.toFixed(2)}`
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
    </Figure>
  )
}

/** The planner's recurrence, with the model's measured losses */
export function Formula() {
  const v = (s: string) => <i className="font-serif">{s}</i>
  return (
    <div className="not-prose border-border my-6 rounded-[var(--radius-lg)] border px-4 py-4 text-[15px]">
      <p className="text-center leading-loose">
        best[{v('j')}] = min
        <sub className="text-[11px]">
          {v('i')} &lt; {v('j')}
        </sub>{' '}
        ( best[{v('i')}] + {v('S')}(seam<sub>{v('i')}</sub>) + &Sigma;
        <sub className="text-[11px]">
          {v('k')}={v('i')}+2..{v('j')}
        </sub>{' '}
        {v('F')}(frame<sub>{v('k')}</sub>) + &lambda; &middot; price(
        {v('i')}, {v('j')}] )
      </p>
      <table className="mx-auto mt-3 text-[13px] tabular-nums">
        <thead className="text-muted-foreground">
          <tr>
            <th className="pr-4 text-left font-normal">level</th>
            {[0, 1, 2, 3].map((n) => (
              <th key={n} className="w-12 font-normal">
                {n}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <th className="pr-4 text-left font-normal">{v('S')}, a boundary</th>
            {MODEL.seam.map((n, i) => (
              <td key={i} className="text-center">
                {n}
              </td>
            ))}
          </tr>
          <tr>
            <th className="pr-4 text-left font-normal">
              {v('F')}, a later shot
            </th>
            {MODEL.frame.map((n, i) => (
              <td key={i} className="text-center">
                {n}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
      <p className="text-muted-foreground mt-2 text-center text-[12px]">
        MiniMax H3 Max, measured; &lambda; = 0.5 points per dollar
      </p>
    </div>
  )
}

// -----------------------------------------------------------------------------
// Figure 3: keep, edit or remake
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
      <p className="mt-1.5 text-[12px]">
        {mark && (
          <span
            className={`mr-1 ${mark === 'yes' ? 'text-foreground' : 'text-muted-foreground'}`}
          >
            {mark === 'yes' ? '✓' : '✕'}
          </span>
        )}
        {label}
      </p>
    </div>
  )
}

const CHOICES = ['keep', 'edit', 'remake'] as const
/** What Doki's judge picked: the demo's frozen Mars, and new lines in a Japanese teaser */
const PICKS = {
  image: { mars: 'edit', teaser: 'keep' },
  video: { mars: 'edit', teaser: 'remake' },
} as const

export function UpdateFigure() {
  return (
    <Figure
      fixed={false}
      caption={
        <>
          A definition changes and one shot is out of date. Made again from its
          words, the shot comes out new: another pose, another dome, another
          light. Doki&rsquo;s judge picked an edit for its image and its video,
          so only the ground froze. Below, the same choice for a shot of a
          Japanese teaser that got new lines of dialogue: the image was kept and
          the video remade, since an edit can&rsquo;t change what is said.
        </>
      }
    >
      <p className="mb-3 text-[14px]">
        <span className="bg-muted mr-2 rounded-md px-1.5 py-0.5 text-[12px]">
          Scene
        </span>
        <T>@Mars</T> = Endless <s className="text-muted-foreground">red</s>{' '}
        <span className="text-foreground font-medium">frozen</span> dunes …
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

      <div className="border-border mt-6 grid grid-cols-[64px_repeat(3,1fr)] items-center gap-x-3 gap-y-2 rounded-[var(--radius-xl)] border p-3 text-[12px]">
        <span />
        {CHOICES.map((choice) => (
          <span key={choice} className="text-muted-foreground text-center">
            {choice}
          </span>
        ))}
        {(['image', 'video'] as const).map((row) => (
          <Row key={row} row={row} />
        ))}
        <span />
        <p className="text-muted-foreground col-span-3 mt-1 flex flex-wrap gap-x-5 gap-y-1 text-[11px]">
          <span className="flex items-center gap-1.5">
            <img
              src={`${IMG}/jar-frozen.jpg`}
              alt=""
              className="h-4 w-7 rounded-sm object-cover"
            />
            Frozen Mars
          </span>
          <span className="flex items-center gap-1.5">
            <img
              src={`${IMG}/funeral-start.jpg`}
              alt=""
              className="h-4 w-7 rounded-sm object-cover"
            />
            New lines of dialogue
          </span>
        </p>
      </div>
    </Figure>
  )
}

function Row({ row }: { row: 'image' | 'video' }) {
  const picks = PICKS[row]
  return (
    <>
      <span className="font-medium capitalize">{row}</span>
      {CHOICES.map((choice) => (
        <span
          key={choice}
          className="bg-muted/60 flex h-[44px] items-center justify-center gap-1.5 rounded-[var(--radius-md)]"
        >
          {picks.mars === choice && (
            <img
              src={`${IMG}/jar-frozen.jpg`}
              alt="Frozen Mars"
              className="h-[34px] w-[60px] rounded-sm object-cover"
            />
          )}
          {picks.teaser === choice && (
            <img
              src={`${IMG}/${row === 'video' ? 'funeral-new' : 'funeral-start'}.jpg`}
              alt="New lines of dialogue"
              className="h-[34px] w-[60px] rounded-sm object-cover"
            />
          )}
        </span>
      ))}
    </>
  )
}

// -----------------------------------------------------------------------------
// Figure 4: where the reviews run
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
      caption={
        <>
          The reviews in one request, as the agent works from left to right.
          Each is set off by what the agent just did, not by the agent asking,
          and what it finds comes back in that tool&rsquo;s result. A shot is
          checked at most three times a request.
        </>
      }
    >
      <div className="grid grid-cols-4 gap-3 text-[12px]">
        {REVIEWS.map((review, i) => (
          <div key={review.check} className="flex flex-col">
            <p className="text-muted-foreground flex h-9 items-end leading-tight">
              {review.when}
            </p>
            <div className="relative my-2 flex items-center">
              <span className="bg-border h-px flex-1" />
              <span className="bg-foreground size-2 rounded-full" />
              <span
                className={`h-px flex-1 ${i < REVIEWS.length - 1 ? 'bg-border' : 'bg-transparent'}`}
              />
            </div>
            <div className="border-border flex-1 rounded-[var(--radius-lg)] border p-2.5">
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
