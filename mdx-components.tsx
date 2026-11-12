import type { MDXComponents } from 'mdx/types'
import { ComponentPropsWithoutRef } from 'react'
import { highlight } from 'sugar-high'

// The underline a link grows on hover, as the homepage's links do
// (components/ui/animated-link.tsx): 1px of the text's color, left to right in
// 200 ms. Drawn as a background, so a link that wraps onto a second line keeps
// flowing with the text instead of jumping to the next line whole.
const LINK =
  'text-foreground font-normal no-underline bg-[linear-gradient(currentColor,currentColor)] bg-no-repeat bg-[length:0%_1px] bg-[position:0_100%] transition-[background-size] duration-200 hover:bg-[length:100%_1px] focus-visible:bg-[length:100%_1px] motion-reduce:transition-none'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    Cover: ({
      src,
      alt,
      caption,
    }: {
      src: string
      alt: string
      caption: string
    }) => {
      return (
        <figure>
          <img src={src} alt={alt} className="rounded-[var(--radius-xl)]" />
          <figcaption className="text-center">{caption}</figcaption>
        </figure>
      )
    },
    // A code block is highlighted; code inline in a sentence stays plain text
    code: ({
      children,
      className,
      ...props
    }: ComponentPropsWithoutRef<'code'>) => {
      if (!className?.startsWith('language-')) {
        return (
          <code className={className} {...props}>
            {children}
          </code>
        )
      }
      const codeHTML = highlight(children as string)
      return (
        <code
          className={className}
          dangerouslySetInnerHTML={{ __html: codeHTML }}
          {...props}
        />
      )
    },
    // Every link in a post opens in a new tab, so following one never takes the
    // reader out of the post - all but a jump to a heading on the same page
    a: ({ href = '', children, ...props }: ComponentPropsWithoutRef<'a'>) => {
      const samePage = href.startsWith('#')
      return (
        <a
          href={href}
          className={LINK}
          {...props}
          {...(!samePage && { target: '_blank', rel: 'noopener noreferrer' })}
        >
          {children}
        </a>
      )
    },
  }
}
