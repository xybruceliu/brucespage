type Project = {
  title: string
  authors: string[]
  year: number
  image?: string
  award?: string
  selected?: boolean
  links?: Record<string, string>
  id: string
}

type BlogPost = {
  title: string
  description: string
  link: string
  uid: string
}

type SocialLink = {
  label: string
  link: string
  icon: string
}

export const SITE_URL = 'https://liubruce.me'

export const PERSONAL_INFO = {
  name: {
    english: 'Bruce Liu',
    chinese: '刘星宇',
  },
  title: 'Ph.D. Candidate @ UCLA',
}

export const PROJECTS: Project[] = [
  {
    title: 'Learning to Navigate in Complex Environments',
    authors: ['Bruce Liu', 'Jane Doe', 'John Smith'],
    year: 2023,
    image: '/publications/navigation-teaser.jpg',
    award: 'Best Paper Award',
    selected: true,
    links: {
      pdf: '/papers/navigation.pdf',
      arxiv: 'https://arxiv.org/abs/2301.12345',
      github: 'https://github.com/username/project',
      doi: 'https://doi.org/10.1234/example',
    },
    id: 'pub1',
  },
  {
    title: 'Another Research Paper',
    authors: ['Bruce Liu', 'Collaborator Name'],
    year: 2024,
    links: {
      pdf: '/papers/another.pdf',
      arxiv: 'https://arxiv.org/abs/2302.54321',
    },
    id: 'pub2',
  },
]

export const BLOG_POSTS: BlogPost[] = [
  {
    title: 'Exploring the Intersection of Design, AI, and Design Engineering',
    description: 'How AI is changing the way we design',
    link: '/blog/exploring-the-intersection-of-design-ai-and-design-engineering',
    uid: 'blog-1',
  },
  {
    title: 'Why I left my job to start my own company',
    description:
      'A deep dive into my decision to leave my job and start my own company',
    link: '/blog/exploring-the-intersection-of-design-ai-and-design-engineering',
    uid: 'blog-2',
  },
  {
    title: 'What I learned from my first year of freelancing',
    description:
      'A look back at my first year of freelancing and what I learned',
    link: '/blog/exploring-the-intersection-of-design-ai-and-design-engineering',
    uid: 'blog-3',
  },
  {
    title: 'How to Export Metadata from MDX for Next.js SEO',
    description: 'A guide on exporting metadata from MDX files to leverage Next.js SEO features.',
    link: '/blog/example-mdx-metadata',
    uid: 'blog-4',
  },
]

export const SOCIAL_LINKS: SocialLink[] = [
  {
    label: 'CV',
    link: '/pdf/bruce_liu_cv.pdf', // Update this with your actual CV path
    icon: 'FileText',
  },
  {
    label: 'Twitter',
    link: 'https://x.com/liu_xingyu',
    icon: 'Twitter',
  },
  {
    label: 'LinkedIn',
    link: 'https://www.linkedin.com/in/xingyuliu1997/',
    icon: 'Linkedin',
  },
  {
    label: 'Scholar',
    link: 'https://scholar.google.com/citations?user=CTDSuK0AAAAJ',
    icon: 'GraduationCap',
  },
]

export const EMAIL = 'xingyuliu@ucla.edu'
