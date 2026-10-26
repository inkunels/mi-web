import { useRef } from 'react'
import { motion, useScroll, useTransform, type MotionValue } from 'motion/react'
import { FIGURES, STATEMENT, SWATCH_IMG } from '../data/content'
import { Counter, FadeIn, TextLink } from './ui'

const LAYERS = [
  { name: 'Wood', code: 'LPSW2118', img: SWATCH_IMG('cocoa-walnut') },
  { name: 'Aluminium', code: 'LPMG10009', img: SWATCH_IMG('laser-gold') },
  { name: 'Stone', code: 'LPSS4391', img: SWATCH_IMG('yellow-cave') },
  { name: 'Granite', code: 'LPSS1331', img: SWATCH_IMG('star-rock') },
]

function Word({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.14, 1])
  return (
    <>
      <motion.span style={{ opacity }}>{children}</motion.span>{' '}
    </>
  )
}

function Layer({ i, spread, name, code, img }: { i: number; spread: MotionValue<number> } & (typeof LAYERS)[number]) {
  const transform = useTransform(
    spread,
    (s) => `translate(-50%, -50%) rotateX(58deg) rotateZ(-42deg) translateZ(${((LAYERS.length - 1 - i) * s).toFixed(1)}px)`,
  )
  return (
    <motion.div className="stack__layer" style={{ transform, backgroundImage: `url(${img})`, zIndex: LAYERS.length - i }}>
      <span className="stack__tag">
        {name} · {code}
      </span>
    </motion.div>
  )
}

export default function Intro() {
  const section = useRef<HTMLElement>(null)
  const text = useRef<HTMLParagraphElement>(null)
  const { scrollYProgress: read } = useScroll({ target: text, offset: ['start 0.82', 'end 0.42'] })
  const { scrollYProgress: pass } = useScroll({ target: section, offset: ['start end', 'end start'] })
  const spread = useTransform(pass, [0.15, 0.6], [6, 52])
  const words = STATEMENT.split(' ')

  return (
    <section ref={section} className="intro" id="about" data-nav-theme="light">
      <div className="container">
        <FadeIn>
          <div className="sec-rule">
            <span>
              <b>01/</b> About
            </span>
            <span>Design with material</span>
          </div>
        </FadeIn>

        <div className="intro__grid">
          <div className="intro__visual">
            <div className="stack" aria-hidden="true">
              {LAYERS.map((l, i) => (
                <Layer key={l.name} i={i} spread={spread} {...l} />
              ))}
            </div>
          </div>
          <div className="intro__copy">
            <p ref={text} className="intro__statement">
              {words.map((w, i) => (
                <Word key={i} progress={read} range={[i / words.length, (i + 1) / words.length]}>
                  {w}
                </Word>
              ))}
            </p>
            <FadeIn delay={0.1}>
              <TextLink href="#materials">Discover the five families</TextLink>
            </FadeIn>
          </div>
        </div>

        <div className="figures">
          {FIGURES.map((f, i) => (
            <FadeIn key={f.label} delay={i * 0.08} className="figures__item">
              <strong>
                <Counter to={f.value} suffix={f.suffix} />
              </strong>
              <span>{f.label}</span>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
