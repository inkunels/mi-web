import { Fragment, useEffect, useRef, useState, type CSSProperties, type ElementType, type ReactNode } from 'react'
import { animate, motion, useInView } from 'motion/react'
import { BRAND, BRAND_SPLIT, isLocal, srcSet, unsplash } from '../data/content'
import { useScrollTo } from '../hooks/useScrollTo'

export function Arrow({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2.5 8h11M9 3.5 13.5 8 9 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function Chevron({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M4.25 2 8.25 6l-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        <linearGradient id="ml-mark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.6" stopColor="#dcdce1" />
          <stop offset="1" stopColor="#a9a9b0" />
        </linearGradient>
      </defs>
      <rect x="4" y="3" width="3.4" height="18" rx="1.7" fill="url(#ml-mark)" />
      <rect x="10.3" y="7" width="3.4" height="14" rx="1.7" fill="url(#ml-mark)" />
      <rect x="16.6" y="11" width="3.4" height="10" rx="1.7" fill="url(#ml-mark)" />
    </svg>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={`logo ${className ?? ''}`}>
      <LogoMark className="logo__mark" />
      <span className="logo__word">
        {BRAND.slice(0, BRAND_SPLIT)}
        <span className="logo__word-b">{BRAND.slice(BRAND_SPLIT)}</span>
      </span>
    </span>
  )
}

type ButtonProps = {
  children: string
  href: string
  variant?: 'dark' | 'light' | 'glass' | 'ghost' | 'metal'
  size?: 'md' | 'sm'
  arrow?: boolean
  onClick?: () => void
}

export function Button({ children, href, variant = 'dark', size = 'md', arrow = true, onClick }: ButtonProps) {
  const scrollTo = useScrollTo()
  const cls = ['btn', variant !== 'dark' && `btn--${variant}`, size === 'sm' && 'btn--sm'].filter(Boolean).join(' ')
  return (
    <a
      className={cls}
      href={href}
      onClick={(e) => {
        onClick?.()
        if (href.startsWith('#')) {
          e.preventDefault()
          scrollTo(href)
        }
      }}
    >
      <span className="btn__roll">
        <span>{children}</span>
        <span aria-hidden="true">{children}</span>
      </span>
      {arrow && <Arrow className="btn__arrow" />}
    </a>
  )
}

export function TextLink({ children, href, onClick }: { children: string; href: string; onClick?: () => void }) {
  const scrollTo = useScrollTo()
  return (
    <a
      className="text-link"
      href={href}
      onClick={(e) => {
        onClick?.()
        if (href.startsWith('#')) {
          e.preventDefault()
          scrollTo(href)
        }
      }}
    >
      {children}
      <Chevron />
    </a>
  )
}

type PhotoProps = {
  id: string
  alt: string
  srcSet?: string
  sizes?: string
  className?: string
  eager?: boolean
  width?: number
  style?: CSSProperties
}

export function Photo({ id, alt, srcSet: localSet, sizes = '100vw', className, eager, width = 1600, style }: PhotoProps) {
  const local = isLocal(id)
  const set = local ? localSet : srcSet(id)
  return (
    <img
      className={className}
      src={local ? id : unsplash(id, width)}
      srcSet={set}
      sizes={set ? sizes : undefined}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      draggable={false}
      style={style}
    />
  )
}

type RevealProps = {
  text: string
  as?: ElementType
  className?: string
  delay?: number
  accent?: string[]
  once?: boolean
}

export function RevealText({ text, as: Tag = 'h2', className, delay = 0, accent = [], once = true }: RevealProps) {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once, margin: '0px 0px -12% 0px' })
  const lines = text.split('\n')
  const bare = (w: string) => w.replace(/[^\p{L}\p{N}]/gu, '').toLowerCase()
  const accents = accent.map(bare)
  let index = 0
  return (
    <Tag ref={ref} className={className} aria-label={text.replace(/\n/g, ' ')}>
      {lines.map((line, li) => (
        <span key={li} className="reveal-line" aria-hidden="true">
          {line.split(' ').map((word, wi) => {
            const i = index++
            const isAccent = accents.includes(bare(word))
            return (
              <Fragment key={wi}>
                <span className="word-mask">
                  <motion.span
                    className={isAccent ? 'accent-word' : undefined}
                    initial={{ y: '110%' }}
                    animate={inView ? { y: '0%' } : { y: '110%' }}
                    transition={{ type: 'spring', bounce: 0, visualDuration: 0.9, delay: delay + i * 0.04 }}
                  >
                    {word}
                  </motion.span>
                </span>
                {wi < line.split(' ').length - 1 ? ' ' : null}
              </Fragment>
            )
          })}
        </span>
      ))}
    </Tag>
  )
}

export function FadeIn({
  children,
  delay = 0,
  y = 24,
  className,
}: {
  children: ReactNode
  delay?: number
  y?: number
  className?: string
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ type: 'spring', bounce: 0, visualDuration: 0.8, delay }}
    >
      {children}
    </motion.div>
  )
}

export function Counter({ to, suffix = '', duration = 1.8 }: { to: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -15% 0px' })
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!inView) return
    const controls = animate(0, to, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setValue(Math.round(v)),
    })
    return () => controls.stop()
  }, [inView, to, duration])

  return (
    <span ref={ref} className="counter">
      {value.toLocaleString('en-US')}
      {suffix}
    </span>
  )
}
