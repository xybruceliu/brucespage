import type { MetadataRoute } from 'next'
import { BLOG_POSTS, SITE_URL } from './data'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    ...BLOG_POSTS.map((post) => ({
      url: `${SITE_URL}${post.link}`,
      changeFrequency: 'yearly' as const,
      priority: 0.7,
    })),
  ]
}
