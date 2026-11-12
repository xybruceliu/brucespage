import type { MDXComponents } from 'mdx/types'
import { ComponentPropsWithoutRef } from 'react'
import { highlight } from 'sugar-high'
import { DrawArrow } from '@/components/ui/draw-arrow'

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
    code: ({ children, ...props }: ComponentPropsWithoutRef<'code'>) => {
      const codeHTML = highlight(children as string)
      return <code dangerouslySetInnerHTML={{ __html: codeHTML }} {...props} />
    },
    // A link out of the site opens in a new tab, and on hover the arrow draws
    // itself just past its last letter, raised, so the line doesn't reflow
    a: ({ href = '', children, ...props }: ComponentPropsWithoutRef<'a'>) => {
      if (!/^https?:\/\//.test(href)) {
        return (
          <a href={href} {...props}>
            {children}
          </a>
        )
      }
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="draw-arrow-trigger"
          {...props}
        >
          {children}
          <span className="relative inline-block w-0">
            <DrawArrow className="absolute bottom-[0.6em] left-[0.1em] size-[0.5em]" />
          </span>
        </a>
      )
    },
  }
}
