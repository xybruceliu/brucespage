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

export const HIGHLIGHTED_AUTHORS = ['Xingyu Bruce Liu', 'Xingyu Liu']

export const PROJECTS: Project[] = [
  {
    title: 'A Text-Native Interface for Generative Video Authoring',
    authors: ['Xingyu Bruce Liu', 'Mira Dontcheva', 'Dingzeyu Li'],
    year: 2026,
    image: '/img/projects/liu2026doki.png',
    selected: true,
    links: {},
    id: 'liu2026doki',
  },
  {
    title: 'Thought as a Substrate in Human-AI Interaction',
    authors: ['Xingyu Bruce Liu'],
    year: 2025,
    image: '/img/projects/liu2025interacting.png',
    selected: false,
    links: {
      'UIST 2025 DC': 'https://dl.acm.org/doi/10.1145/3746058.3758466',
      pdf: '/pdf/projects/liu2025uistdc.pdf',
    },
    id: 'liu2025uistdc',
  },
  {
    title: 'Proactive Conversational Agents with Inner Thoughts',
    authors: ['Xingyu Bruce Liu', 'Shitao Fang', 'Weiyan Shi', 'Chien-Sheng Wu', 'Takeo Igarashi', 'Xiang Anthony Chen'],
    year: 2025,
    image: '/img/projects/liu2025inner.png',
    selected: true,
    links: {
      'CHI 2025': 'https://doi.org/10.1145/3706598.3713760',
      pdf: '/pdf/projects/liu2025inner.pdf',
      code: 'https://github.com/xybruceliu/thoughtful-agents',
    },
    id: 'liu2025inner',
  },
  {
    title: 'Human I/O: Towards a Unified Approach to Detecting Situational Impairments',
    authors: ['Xingyu Bruce Liu', 'Jiaohao Nick Li', 'David Kim', 'Xiang Anthony Chen', 'Ruofei Du'],
    year: 2024,
    image: '/img/projects/liu2024humanio.png',
    award: 'Best Paper Honorable Mention',
    selected: true,
    links: {
      'CHI 2024': 'https://doi.org/10.1145/3613904.3642065',
      pdf: '/pdf/projects/liu2024humanio.pdf',
      code: 'https://github.com/google/humanio',
      blog: 'https://research.google/blog/human-io-detecting-situational-impairments-with-large-language-models/',
      video: 'https://www.youtube.com/watch?v=LTXe3RCHd6I',
    },
    id: 'liu2024humanio',
  },
  {
    title: 'Experiencing Visual Captions: Augmented Communication with Real-Time Visuals Using Large Language Models',
    authors: ['Xingyu Bruce Liu', 'Vladimir Kirilyuk', 'Xiuxiu Yuan', 'Peggy Chi', 'Alex Olwal', 'Xiang Anthony Chen', 'Ruofei Du'],
    year: 2023,
    image: '/img/projects/liu2023vcdemo.png',
    links: {
      'UIST 2023 Demo': 'https://doi.org/10.1145/3586182.3615978',
    },
    id: 'liu2023vcdemo',
  },
  {
    title: 'Social Wormholes: Exploring Preferences and Opportunities for Distributed and Physically-Grounded Social Connections',
    authors: ['Xingyu Bruce Liu', 'Joanne Leong', 'Yuanyang Teng', 'Hanseul Jun', 'Sven Kratz', 'Yu Jiang Tham', 'Andrés Monroy-Hernández', 'Brian A. Smith', 'Rajan Vaish'],
    year: 2023,
    image: '/img/projects/liu2023social.png',
    links: {
      'CSCW 2023': 'https://doi.org/10.1145/3610208',
    },
    id: 'liu2023social',
  },
  {
    title: 'Visual Captions: Augmenting Verbal Communication with On-the-fly Visuals',
    authors: ['Xingyu Bruce Liu', 'Vladimir Kirilyuk', 'Xiuxiu Yuan', 'Alex Olwal', 'Peggy Chi', 'Xiang Anthony Chen', 'Ruofei Du'],
    year: 2023,
    image: '/img/projects/liu2023visualcaptions.png',
    selected: true,
    links: {
      'CHI 2023': 'https://dl.acm.org/doi/10.1145/3544548.3581566',
      pdf: '/pdf/projects/liu2023visual.pdf',
      code: 'https://github.com/google/archat',
      blog: 'https://blog.research.google/2023/06/visual-captions-using-large-language.html',
      video: 'https://youtu.be/sL_YeHtQt44',
    },
    id: 'liu2023visualcaptions',
  },
  {
    title: 'Rapsai: Accelerating Machine Learning Prototyping of Multimedia Applications Through Visual Programming',
    authors: ['Ruofei Du', 'Na Li', 'Jing Jin', 'Michelle Carney', 'Scott Miles', 'Maria Kleiner', 'Xiuxiu Yuan', 'Yinda Zhang', 'Anuva Kulkarni', 'Xingyu Bruce Liu', 'Sergio Escolano', 'Abhishek Kar', 'Alex Olwal', 'Ping Yu', 'Ram Iyengar', 'Adarsh Kowdle'],
    year: 2023,
    image: '/img/projects/du2023rapsai.png',
    award: 'Best Paper Honorable Mention',
    links: {
      'CHI 2023': 'https://dl.acm.org/doi/10.1145/3544548.3581338',
      pdf: '/pdf/projects/du2023rapsai.pdf',
      video: 'https://youtu.be/mQ5mvAbZYvc',
    },
    id: 'du2023rapsai',
  },
  {
    title: 'Modeling and Improving Text Stability in Live Captions',
    authors: ['Xingyu Bruce Liu', 'Jun Zhang', 'Leonardo Ferrer', 'Susan Xu', 'Vikas Bahirwani', 'Boris Smus', 'Alex Olwal', 'Ruofei Du'],
    year: 2023,
    image: '/img/projects/Liu2023Modeling.png',
    links: {
      'CHI 2023 LBW': 'https://doi.org/10.1145/3544549.3585609',
      pdf: '/pdf/projects/liu2023modeling.pdf',
      video: 'https://youtu.be/Indi_RwODS8',
    },
    id: 'liu2023modeling',
  },
  {
    title: 'CrossA11y: Identifying Video Accessibility Issues via Cross-Modal Grounding',
    authors: ['Xingyu Bruce Liu', 'Ruolin Wang', 'Dingzeyu Li', 'Xiang Anthony Chen', 'Amy Pavel'],
    year: 2022,
    image: '/img/projects/liu2022crossa11y.png',
    award: 'Best Paper Award',
    selected: true,
    links: {
      'UIST 2022': 'https://doi.org/10.1145/3526113.3545703',
      pdf: '/pdf/projects/liu2022crossa11y.pdf',
      video: 'https://youtu.be/HDqjnHOZ7J8',
    },
    id: 'liu2022crossa11y',
  },
  {
    title: 'What Makes Videos Accessible to Blind and Visually Impaired People?',
    authors: ['Xingyu Bruce Liu', 'Patrick Carrington', 'Xiang Anthony Chen', 'Amy Pavel'],
    year: 2021,
    image: '/img/projects/liu2021what.png',
    selected: false,
    links: {
      'CHI 2021': 'https://doi.org/10.1145/3411764.3445233',
      pdf: '/pdf/projects/liu2021what.pdf',
      video: 'https://youtu.be/n2enrJJZdTs',
    },
    id: 'liu2021what',
  },
  {
    title: 'Making Memes Accessible',
    authors: ['Cole Gleason', 'Amy Pavel', 'Xingyu Bruce Liu', 'Patrick Carrington', 'Lydia B. Chilton', 'Jeffrey P. Bigham'],
    year: 2019,
    image: '/img/projects/gleason2019making.png',
    links: {
      'ASSETS 2019': 'https://doi.org/10.1145/3308561.3353792',
      pdf: '/pdf/projects/gleason2019making.pdf',
      blog: 'https://time.com/5759721/meme-accessibility-blind/',
    },
    id: 'gleason2019making',
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
    link: '/pdf/cv.pdf',
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

export const PHOTO_GALLERY = [
  '000006.jpg',
  '000041 2.jpg',
  '000044 2.jpg',
  '000048 2.jpg',
  '000049.jpg',
  '000060 3.jpg',
  '000063110001.jpg',
  '000063110005.jpg',
  '000063110002.jpg',
  '000063110027.jpg',
  '000068.jpg',
  '000209220013.jpg',
  '000209220036.jpg',
  '000209240034.jpg',
  '000209310006.jpg',
  '000209310013.jpg',
  '000209310024.jpg',
  '000282940011.jpg',
  '000379820033.jpg',
  '000379830014.jpg',
  '34fa1cee0s9a874595ef9acb0dbbb712.jpeg',
  '8f385aaedk695be0b7da3713f974dee2.jpeg',
  '94a8a218dv08f7da0a6e775e45a6192e.jpeg',
]
