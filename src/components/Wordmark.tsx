import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { animate, motion, useInView, useMotionValue, useTransform, type Variants } from 'motion/react'
import { BRAND, BRAND_SPLIT } from '../data/content'

type Props = {
  text?: string
  as?: 'h1' | 'div'
  className?: string
  variant?: 'hero' | 'footer'
  delay?: number
  split?: number
}

const letterVariants = (delay: number): Variants => ({
  hidden: { y: '0.32em', opacity: 0, filter: 'blur(12px)' },
  show: (i: number) => {
    const d = delay + i * 0.05
    return {
      y: '0em',
      opacity: 1,
      filter: 'blur(0px)',
      transition: {
        y: { type: 'spring', bounce: 0, visualDuration: 1.1, delay: d },
        opacity: { duration: 0.6, delay: d },
        filter: { duration: 0.8, delay: d },
      },
      transitionEnd: { filter: 'none' },
    }
  },
})

/**
 * Brand wordmark: flat white-to-platinum gradient letters, fitted to the
 * container width, with one soft light sweep once the letters settle.
 */
export default function Wordmark({
  text = BRAND,
  as = 'div',
  className,
  variant = 'hero',
  delay = 0,
  split = BRAND_SPLIT,
}: Props) {
  const wrap = useRef<HTMLDivElement>(null)
  const measure = useRef<HTMLSpanElement>(null)
  const [size, setSize] = useState<number | null>(null)
  const [ready, setReady] = useState(false)
  const [landed, setLanded] = useState(false)
  const inView = useInView(wrap, { once: true, margin: '0px 0px -8% 0px' })
  const sweep = useMotionValue(110)
  const sheenPos = useTransform(sweep, (v) => `${v}% 50%`)

  useLayoutEffect(() => {
    const el = wrap.current
    const m = measure.current
    if (!el || !m) return
    const fit = () => {
      const natural = m.getBoundingClientRect().width
      if (natural > 0) setSize(Math.floor((el.clientWidth / natural) * 100 * 100) / 100)
    }
    fit()
    // Re-measure when the container resizes and when the web font swaps in
    // (the measuring span changes width), so the word never overflows.
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    ro.observe(m)
    let alive = true
    const fonts = document.fonts
    const onFonts = () => alive && fit()
    fonts?.addEventListener?.('loadingdone', onFonts)
    Promise.all([fonts?.load?.('600 100px "Plus Jakarta Sans Variable"'), fonts?.ready]).finally(() => {
      if (!alive) return
      fit()
      setReady(true)
    })
    return () => {
      alive = false
      ro.disconnect()
      fonts?.removeEventListener?.('loadingdone', onFonts)
    }
  }, [])

  useEffect(() => {
    if (!landed) return
    const controls = animate(sweep, -10, { duration: 2.8, ease: [0.45, 0, 0.2, 1] })
    return () => controls.stop()
  }, [landed, sweep])

  const letter = useMemo(() => letterVariants(delay), [delay])
  const play = ready && (variant === 'hero' || inView)
  const letters = [...text]
  const Tag = as

  return (
    <Tag className={`wm wm--${variant} ${className ?? ''}`}>
      <span className="visually-hidden">{text}</span>
      <div ref={wrap} className="wm__fit" aria-hidden="true">
        <span className="wm__probe">
          <span ref={measure} className="wm__row wm__measure">
            {text}
          </span>
        </span>
        <div className="wm__inner" style={{ fontSize: size ? `${size}px` : undefined }}>
          <motion.span className="wm__row" initial="hidden" animate={play ? 'show' : 'hidden'}>
            {letters.map((ch, i) => (
              <motion.span
                key={i}
                className={i >= split ? 'wm__l wm__l--b' : 'wm__l'}
                custom={i}
                variants={letter}
                onAnimationComplete={(def) => {
                  if (i === letters.length - 1 && def === 'show') setLanded(true)
                }}
              >
                {ch}
              </motion.span>
            ))}
          </motion.span>
          <motion.span
            className="wm__row wm__sheen"
            initial={{ opacity: 0 }}
            animate={{ opacity: landed ? 1 : 0 }}
            transition={{ duration: 0.6 }}
            style={{ backgroundPosition: sheenPos }}
          >
            {text}
          </motion.span>
        </div>
      </div>
    </Tag>
  )
}
