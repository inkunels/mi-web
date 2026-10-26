import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import heroImage from '../assets/hero-walnut-gallery.webp'
import { SWATCH_IMG } from '../data/content'
import { Button } from './ui'
import Wordmark from './Wordmark'

const CHIPS = [
  { label: 'Wood', swatch: SWATCH_IMG('cocoa-walnut') },
  { label: 'Aluminium', swatch: SWATCH_IMG('meteor-silver') },
  { label: 'Stone', swatch: SWATCH_IMG('yellow-cave') },
  { label: 'Granite', swatch: SWATCH_IMG('aura-grey') },
]

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 18, filter: 'blur(8px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  transition: { type: 'spring' as const, bounce: 0, visualDuration: 0.9, delay },
})

export default function Hero() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const imgScale = useTransform(scrollYProgress, [0, 1], [1, 1.14])
  const imgY = useTransform(scrollYProgress, [0, 1], ['0%', '10%'])
  const veil = useTransform(scrollYProgress, [0, 0.85], [0, 0.7])
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -90])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0])
  const markY = useTransform(scrollYProgress, [0, 1], [0, -140])
  const markScale = useTransform(scrollYProgress, [0, 1], [1, 0.92])

  return (
    <section id="top" ref={ref} className="hero" data-nav-theme="dark" aria-label="Introduction">
      <motion.div
        className="hero__media"
        initial={{ scale: 1.12, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.img
          src={heroImage}
          alt="Tall gallery lined in walnut panels, with sheer curtains, a skylight and two velvet sofas"
          width={1672}
          height={940}
          fetchPriority="high"
          decoding="async"
          draggable={false}
          style={{ scale: imgScale, y: imgY }}
        />
      </motion.div>
      <div className="hero__shade" aria-hidden="true" />
      <motion.div className="hero__veil" style={{ opacity: veil }} aria-hidden="true" />

      <motion.div className="hero__content container" style={{ y: contentY, opacity: contentOpacity }}>
        <div className="hero__intro">
          <motion.p {...rise(1.1)}>
            Premium cladding panels for facades, private residences and luxury retail. Wood, aluminium, stone and
            granite, made to measure.
          </motion.p>
          <motion.div className="hero__ctas" {...rise(1.25)}>
            <Button href="#materials" variant="light">
              Explore materials
            </Button>
            <Button href="#studio" variant="glass" arrow={false}>
              Sketch to render
            </Button>
          </motion.div>
        </div>
        <motion.div className="hero__meta" {...rise(1.35)}>
          <span className="hero__year">©2026</span>
          <ul className="hero__chips" aria-label="Material families">
            {CHIPS.map((c) => (
              <li key={c.label}>
                <i style={{ backgroundImage: `url(${c.swatch})` }} />
                {c.label}
              </li>
            ))}
          </ul>
        </motion.div>
      </motion.div>

      <motion.div className="hero__mark container" style={{ y: markY, scale: markScale }}>
        <Wordmark as="h1" variant="hero" delay={0.35} />
      </motion.div>

      <motion.div
        className="hero__scroll"
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 0.8 }}
      >
        <span>Scroll</span>
        <i />
      </motion.div>
    </section>
  )
}
