'use client'
import React from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { FileText, Twitter, Linkedin, GraduationCap, Award } from 'lucide-react'
import { Magnetic } from '@/components/ui/magnetic'
import { AnimatedLink } from '@/components/ui/animated-link'
import { ArrowUpRightIcon } from '@/components/ui/arrow-up-right'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { InfiniteSlider } from '@/components/ui/infinite-slider'
import Image from 'next/image'
// Note: re-import BLOG_POSTS from './data' when re-enabling the Blog section below.
import {
  PROJECTS,
  EMAIL,
  SOCIAL_LINKS,
  HIGHLIGHTED_AUTHORS,
  PHOTO_GALLERY,
} from './data'

const VARIANTS_CONTAINER = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
}

const VARIANTS_SECTION = {
  hidden: { opacity: 0, y: 20, filter: 'blur(8px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
}

const TRANSITION_SECTION = {
  duration: 0.3,
}

const VARIANTS_PROJECT_ITEM = {
  hidden: { opacity: 0, y: -20, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.3,
    },
  },
  exit: {
    opacity: 0,
    y: 20,
    filter: 'blur(8px)',
    transition: {
      duration: 0.2,
    },
  },
}

const iconMap = {
  FileText,
  Twitter,
  Linkedin,
  GraduationCap,
}

function MagneticSocialLink({
  children,
  link,
  icon,
}: {
  children: React.ReactNode
  link: string
  icon: keyof typeof iconMap
}) {
  const IconComponent = iconMap[icon]

  return (
    <Magnetic springOptions={{ bounce: 0 }} intensity={0.3}>
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="group bg-secondary text-secondary-foreground hover:bg-foreground hover:text-background relative inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-sm transition-all duration-200"
      >
        <IconComponent className="h-3.5 w-3.5" />
        {children}
      </a>
    </Magnetic>
  )
}

export default function Personal() {
  const [showAllProjects, setShowAllProjects] = React.useState(false)

  return (
    <motion.main
      className="space-y-24"
      variants={VARIANTS_CONTAINER}
      initial="hidden"
      animate="visible"
    >
      <motion.section
        variants={VARIANTS_SECTION}
        transition={TRANSITION_SECTION}
      >
        <div className="flex-1">
          <p className="text-muted-foreground">
            Hi! I&apos;m a Research Scientist at{' '}
            <AnimatedLink
              href="https://research.adobe.com/"
              isStatic={true}
              imageSrc="/img/adobe-building.jpg"
            >
              Adobe Research
            </AnimatedLink>
            .
            <br />I build autonomous agents that develop their own taste.
          </p>
          <br />
          <p className="text-muted-foreground">
            Previously, I received my Ph.D. from{' '}
            <AnimatedLink href="https://hci.ucla.edu/#team">
              UCLA HCI lab
            </AnimatedLink>{' '}
            advised by Professor{' '}
            <AnimatedLink href="https://hci.prof/">
              Xiang &lsquo;Anthony&rsquo; Chen
            </AnimatedLink>
            . My work was recognized by an{' '}
            <AnimatedLink
              href="https://www.sciencehub.ucla.edu/2023-amazon-fellows/"
              isStatic={true}
              imageSrc="/img/amazon-fellowship.png"
            >
              Amazon Ph.D. Fellowship
            </AnimatedLink>
            , an{' '}
            <AnimatedLink
              href="https://dl.acm.org/doi/10.1145/3526113.3545703"
              isStatic={true}
              imageSrc="/img/uist-best-paper.png"
            >
              ACM UIST Best Paper Award
            </AnimatedLink>
            , and two{' '}
            <AnimatedLink
              href="https://dl.acm.org/doi/10.1145/3613904.3642065"
              isStatic={true}
              imageSrc="/img/chi-best-paper.png"
            >
              ACM CHI Best Paper Honorable Mentions
            </AnimatedLink>
            . I&apos;ve also interned at Google, Meta, and Snap.
          </p>
          <br />
          <p className="text-muted-foreground">
            Here&apos;s my{' '}
            <AnimatedLink href="/pdf/cv.pdf" showPreview={false}>
              CV
              <ArrowUpRightIcon className="mb-0.5 inline h-4 w-4" />
            </AnimatedLink>
          </p>
        </div>
      </motion.section>

      <motion.section
        variants={VARIANTS_SECTION}
        transition={TRANSITION_SECTION}
      >
        <div className="mb-5 flex items-baseline gap-2">
          <h3 className="text-lg font-medium">Projects</h3>
          <span className="text-sm">
            <button
              onClick={() => setShowAllProjects(true)}
              className={`relative transition-colors ${
                showAllProjects
                  ? 'text-foreground cursor-default font-medium'
                  : 'text-muted-foreground group cursor-pointer'
              }`}
            >
              All
              {!showAllProjects && (
                <span className="bg-foreground absolute bottom-0 left-0 block h-[1px] w-full max-w-0 transition-all duration-200 group-hover:max-w-full"></span>
              )}
            </button>

            <span className="text-muted-foreground"> / </span>

            <button
              onClick={() => setShowAllProjects(false)}
              className={`relative transition-colors ${
                !showAllProjects
                  ? 'text-foreground cursor-default font-medium'
                  : 'text-muted-foreground group cursor-pointer'
              }`}
            >
              Selected
              {showAllProjects && (
                <span className="bg-foreground absolute bottom-0 left-0 block h-[1px] w-full max-w-0 transition-all duration-200 group-hover:max-w-full"></span>
              )}
            </button>
          </span>
        </div>
        <div className="space-y-8">
          <AnimatePresence mode="popLayout">
            {PROJECTS.filter((pub) => showAllProjects || pub.selected === true)
              .sort((a, b) => {
                if (b.year !== a.year) {
                  return b.year - a.year
                }
                return a.id.localeCompare(b.id)
              })
              .map((pub) => (
                <motion.div
                  key={pub.id}
                  className="flex flex-col gap-4 sm:flex-row sm:items-start"
                  variants={VARIANTS_PROJECT_ITEM}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                >
                  <div className="flex-1">
                    <h4 className="text-foreground font-medium">{pub.title}</h4>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {pub.authors.map((author, index) => (
                        <React.Fragment key={index}>
                          {HIGHLIGHTED_AUTHORS.includes(author) ? (
                            <span className="font-medium">{author}</span>
                          ) : (
                            author
                          )}
                          {index < pub.authors.length - 1 && ', '}
                        </React.Fragment>
                      ))}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {pub.award && (
                        <span className="inline-flex items-center gap-1 py-0.5 text-sm font-medium">
                          <Award className="h-3 w-3 text-rose-500" />
                          {pub.award}
                        </span>
                      )}
                    </div>
                    {pub.links && (
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {Object.entries(pub.links).map(([type, url]) => (
                          <motion.a
                            key={type}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ring-border hover:bg-accent hover:text-accent-foreground inline-flex items-center rounded-full px-2.5 py-1 text-xs ring-1 shadow-sm transition-colors"
                            initial="initial"
                            whileHover="hover"
                          >
                            {type}
                            <motion.span
                              variants={{
                                initial: {
                                  width: 0,
                                  opacity: 0,
                                  marginLeft: 0,
                                },
                                hover: {
                                  width: 'auto',
                                  opacity: 1,
                                  marginLeft: 2,
                                  transition: { duration: 0.2 },
                                },
                              }}
                              className="flex items-center overflow-hidden"
                            >
                              <svg
                                width="15"
                                height="15"
                                viewBox="0 0 15 15"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3 w-3 shrink-0"
                              >
                                <motion.path
                                  d="M3.5 11.5L11.5 3.5"
                                  stroke="currentColor"
                                  strokeWidth="1.2"
                                  strokeLinecap="round"
                                  variants={{
                                    initial: { pathLength: 0, opacity: 0 },
                                    hover: {
                                      pathLength: 1,
                                      opacity: 1,
                                      transition: {
                                        pathLength: {
                                          duration: 0.2,
                                          ease: 'easeOut',
                                        },
                                        opacity: { duration: 0.05 },
                                      },
                                    },
                                  }}
                                />
                                <motion.path
                                  d="M6.5 3.5H11.5V8.5"
                                  stroke="currentColor"
                                  strokeWidth="1.2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  variants={{
                                    initial: { pathLength: 0, opacity: 0 },
                                    hover: {
                                      pathLength: 1,
                                      opacity: 1,
                                      transition: {
                                        pathLength: {
                                          duration: 0.2,
                                          ease: 'easeOut',
                                          delay: 0.2,
                                        },
                                        opacity: { duration: 0.05, delay: 0.2 },
                                      },
                                    },
                                  }}
                                />
                              </svg>
                            </motion.span>
                          </motion.a>
                        ))}
                      </div>
                    )}
                  </div>
                  {pub.image && (
                    <div className="w-full shrink-0 sm:w-48">
                      <Image
                        src={pub.image}
                        alt={pub.title}
                        width={192}
                        height={128}
                        className="h-auto w-full rounded-sm shadow-lg"
                      />
                    </div>
                  )}
                </motion.div>
              ))}
          </AnimatePresence>
        </div>
      </motion.section>

      {/* <motion.section
        variants={VARIANTS_SECTION}
        transition={TRANSITION_SECTION}
      >
        <h3 className="mb-3 text-lg font-medium">Blog</h3>
        <div className="flex flex-col space-y-0">
          <AnimatedBackground
            enableHover
            className="h-full w-full rounded-[var(--radius-lg)] bg-muted"
            transition={{
              type: 'spring',
              bounce: 0,
              duration: 0.2,
            }}
          >
            {BLOG_POSTS.map((post) => (
              <Link
                key={post.uid}
                className="-mx-3 rounded-[var(--radius-xl)] px-3 py-3"
                href={post.link}
                data-id={post.uid}
              >
                <div className="flex flex-col space-y-1">
                  <h4 className="font-normal text-foreground">
                    {post.title}
                  </h4>
                  <p className="text-muted-foreground">
                    {post.description}
                  </p>
                </div>
              </Link>
            ))}
          </AnimatedBackground>
        </div>
      </motion.section> */}

      <motion.section
        variants={VARIANTS_SECTION}
        transition={TRANSITION_SECTION}
      >
        <h3 className="mb-5 text-lg font-medium">Connect</h3>
        <p className="text-muted-foreground mb-5">
          Feel free to contact me at{' '}
          <a className="text-foreground underline" href={`mailto:${EMAIL}`}>
            {EMAIL}
          </a>
        </p>
        <div className="flex items-center justify-start space-x-3">
          {SOCIAL_LINKS.map((link) => (
            <MagneticSocialLink
              key={link.label}
              link={link.link}
              icon={link.icon as keyof typeof iconMap}
            >
              {link.label}
            </MagneticSocialLink>
          ))}
        </div>
      </motion.section>

      <motion.section
        variants={VARIANTS_SECTION}
        transition={TRANSITION_SECTION}
      >
        {/* Preload full-size images */}
        {PHOTO_GALLERY.map((photo) => (
          <link
            key={`preload-${photo}`}
            rel="preload"
            as="image"
            href={`/img/photos/${photo}`}
          />
        ))}

        <InfiniteSlider speed={40} speedOnHover={20} gap={24}>
          {PHOTO_GALLERY.map((photo) => (
            <Dialog key={photo}>
              <DialogTrigger asChild>
                <Image
                  src={`/img/photos/${photo}`}
                  alt="Photo"
                  width={180}
                  height={120}
                  className="h-[120px] w-auto cursor-pointer rounded-sm object-cover transition-opacity hover:opacity-80"
                  loading="eager"
                  quality={85}
                  draggable={false}
                />
              </DialogTrigger>
              <DialogContent
                showCloseButton={false}
                className="flex h-auto w-auto max-w-none items-center justify-center border-none bg-transparent p-0 ring-0 shadow-none outline-none"
                style={
                  {
                    '--tw-enter-scale': '1',
                    '--tw-exit-scale': '1',
                  } as React.CSSProperties
                }
              >
                <DialogTitle className="sr-only">Photo view</DialogTitle>
                <img
                  src={`/img/photos/${photo}`}
                  alt="Photo"
                  className="rounded-md"
                  style={{
                    width: 'auto',
                    height: 'auto',
                    maxWidth: '70vw',
                    maxHeight: '70vh',
                  }}
                  draggable={false}
                />
              </DialogContent>
            </Dialog>
          ))}
        </InfiniteSlider>
      </motion.section>
    </motion.main>
  )
}
