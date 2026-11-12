import fs from 'node:fs'
import path from 'node:path'
import { PERSONAL_INFO } from '../data'

// The line under a post's title: who wrote it, when, and how long it takes to
// read. The time is counted from the post's own source when the page is built,
// so it stays right as the post changes.

/** Words a minute for careful reading of nonfiction */
const WORDS_PER_MINUTE = 230
/** Seconds to look at a figure, card or table */
const SECONDS_PER_FIGURE = 12

/** Minutes to read a post's MDX source: its words, plus a moment for each figure */
const readingMinutes = (source: string) => {
  // What's read starts at the title, after the imports and the metadata
  const title = source.search(/^# /m)
  const body = title >= 0 ? source.slice(title) : source
  const figures = (body.match(/<[A-Z][A-Za-z]*[^>]*\/>/g) ?? []).filter(
    (tag) => !tag.startsWith('<PostMeta'),
  ).length
  const words = body
    .replace(/<[^>]+>/g, ' ')
    .replace(/\]\([^)]*\)/g, ']')
    .split(/\s+/)
    .filter((word) => /[A-Za-z0-9]/.test(word)).length
  return Math.max(
    1,
    Math.round(words / WORDS_PER_MINUTE + (figures * SECONDS_PER_FIGURE) / 60),
  )
}

export function PostMeta({ post, date }: { post: string; date: string }) {
  const source = fs.readFileSync(
    path.join(process.cwd(), 'app', 'blog', post, 'page.mdx'),
    'utf8',
  )
  return (
    <p className="text-muted-foreground text-sm">
      <span className="text-foreground">{PERSONAL_INFO.name.english}</span>
      <span aria-hidden="true"> · </span>
      {date}
      <span aria-hidden="true"> · </span>
      {readingMinutes(source)} min read
    </p>
  )
}
