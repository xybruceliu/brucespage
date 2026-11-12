// The post's references, in the order the text first cites them: <Cite k="…" />
// numbers a citation by its place here, and <References /> lists them all.

interface Reference {
  who?: string
  title: string
  where?: string
  url: string
}

const REFERENCES: Record<string, Reference> = {
  seedance: {
    who: 'The Decoder',
    title:
      "ByteDance's Seedance 2.5 breaks the 30-second barrier for AI video generation",
    where: '2026',
    url: 'https://the-decoder.com/bytedances-seedance-2-5-breaks-the-30-second-barrier-for-ai-video-generation/',
  },
  minimax: {
    who: 'MiniMax',
    title:
      'MiniMax H3: An Open Model Breaking the Boundaries Between Tasks and Modalities',
    where: '2026',
    url: 'https://minimax.io/blog/minimax-h3',
  },
  boards: {
    who: 'Adobe',
    title: 'Firefly Boards',
    url: 'https://www.adobe.com/products/firefly/features/boards.html',
  },
  flora: {
    title: 'FLORA',
    url: 'https://www.florafauna.ai/',
  },
  tapnow: {
    title: 'TapNow',
    url: 'https://www.tapnow.ai/',
  },
  libtv: {
    who: 'LiblibAI',
    title: 'LibTV',
    url: 'https://www.liblib.tv/',
  },
  videorigami: {
    who: 'Yining Cao, Yiyi Huang, Anh Truong, Hijung Valentina Shin and Haijun Xia',
    title:
      'Compositional Structures as Substrates for Human-AI Co-creation Environment: A Design Approach and A Case Study',
    where: 'CHI 2025, arXiv:2503.04103',
    url: 'https://arxiv.org/abs/2503.04103',
  },
  creativeclaw: {
    who: 'CreativeClaw',
    title:
      'How to Make Long-Form AI Videos in Claude (Seedance 2.0 + Stitching)',
    url: 'https://creativeclaw.co/blog/long-form-video-claude',
  },
  videodirectorgpt: {
    who: 'Han Lin, Abhay Zala, Jaemin Cho and Mohit Bansal',
    title:
      'VideoDirectorGPT: Consistent Multi-scene Video Generation via LLM-Guided Planning',
    where: 'arXiv:2309.15091, 2023',
    url: 'https://arxiv.org/abs/2309.15091',
  },
  movieagent: {
    who: 'Weijia Wu et al.',
    title: 'Automated Movie Generation via Multi-Agent CoT Planning',
    where: 'arXiv:2503.07314, 2025',
    url: 'https://arxiv.org/abs/2503.07314',
  },
  lct: {
    title: 'Long Context Tuning for Video Generation',
    where: 'ICCV 2025, arXiv:2503.10589',
    url: 'https://arxiv.org/abs/2503.10589',
  },
  holocine: {
    title:
      'HoloCine: Holistic Generation of Cinematic Multi-Shot Long Video Narratives',
    where: 'arXiv:2510.20822, 2025',
    url: 'https://arxiv.org/abs/2510.20822',
  },
  doki: {
    who: 'Xingyu Bruce Liu, Mira Dontcheva and Dingzeyu Li',
    title: 'A Text-Native Interface for Generative Video Authoring',
    where: 'UIST 2026',
    url: 'https://dl.acm.org/doi/10.1145/3830398.3830715',
  },
  omni: {
    who: 'Google, on fal',
    title: 'Gemini Omni Flash video editing',
    where: 'API documentation',
    url: 'https://fal.ai/models/google/gemini-omni-flash/edit/api',
  },
}

const KEYS = Object.keys(REFERENCES)

/** A citation, "[3]" or "[3, 4]", linked to its references below */
export function Cite({ k }: { k: string }) {
  const keys = k.split(/\s+/).filter(Boolean)
  return (
    <span className="text-muted-foreground text-[0.85em] tabular-nums">
      [
      {keys.map((key, i) => (
        <span key={key}>
          {i > 0 && ', '}
          <a
            href={`#ref-${key}`}
            className="text-muted-foreground hover:text-foreground font-normal no-underline transition-colors"
          >
            {KEYS.indexOf(key) + 1}
          </a>
        </span>
      ))}
      ]
    </span>
  )
}

export function References() {
  return (
    <ol className="text-muted-foreground text-sm">
      {KEYS.map((key) => {
        const { who, title, where, url } = REFERENCES[key]
        return (
          <li key={key} id={`ref-${key}`} className="scroll-mt-16">
            {who && <>{who.replace(/\.$/, '')}. </>}
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground/80 hover:text-foreground font-normal"
            >
              {title}
            </a>
            {where && <>. {where}</>}.
          </li>
        )
      })}
    </ol>
  )
}
