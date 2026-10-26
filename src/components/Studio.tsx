import { Component, lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion, useInView, useMotionValueEvent, useScroll, useTransform } from 'motion/react'
import { useLenis } from 'lenis/react'
import { IMG, STAGES } from '../data/content'
import { Button, Photo } from './ui'

const StoreCanvas = lazy(() => import('../three/StoreCanvas'))

const BOUNDS = [0, 0.17, 0.31, 0.45, 0.68, 0.82]

function stageFor(v: number) {
  let s = 0
  for (let i = 0; i < BOUNDS.length; i++) if (v >= BOUNDS[i]) s = i
  return s
}

class CanvasBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    if (this.state.failed) {
      return (
        <div className="studio__fallback">
          <Photo id={IMG.retail} alt="Boutique clad in wallcraftpanels travertine panels" />
        </div>
      )
    }
    return this.props.children
  }
}

export default function Studio() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const near = useInView(ref, { margin: '150% 0px 150% 0px' })
  const visible = useInView(ref, { margin: '20% 0px 20% 0px' })
  const [mounted, setMounted] = useState(false)
  const [stage, setStage] = useState(0)
  const lenis = useLenis()

  const jump = (i: number) => {
    const el = ref.current
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY
    const span = el.offsetHeight - window.innerHeight
    const into = i === STAGES.length - 1 ? 0.14 : 0.05
    const target = top + Math.min(0.995, BOUNDS[i] + into) * span
    if (lenis) lenis.scrollTo(target, { duration: 1.8 })
    else window.scrollTo({ top: target, behavior: 'smooth' })
  }

  useEffect(() => {
    if (near) setMounted(true)
  }, [near])

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const s = stageFor(v)
    setStage((prev) => (prev === s ? prev : s))
  })

  const paperOpacity = useTransform(scrollYProgress, [0, 0.36, 0.44], [1, 1, 0])
  const gridOpacity = useTransform(scrollYProgress, [0, 0.04, 0.15, 0.22], [0.35, 1, 1, 0])
  const introOpacity = useTransform(scrollYProgress, [0, 0.035], [1, 0])
  const introY = useTransform(scrollYProgress, [0, 0.05], [0, -40])
  const uiOpacity = useTransform(scrollYProgress, [0.015, 0.045], [0, 1])
  const frameOpacity = useTransform(scrollYProgress, [0.84, 0.93], [0, 1])
  const pct = useTransform(() => `${String(Math.round(scrollYProgress.get() * 100)).padStart(2, '0')}%`)
  const current = STAGES[stage]

  return (
    <section ref={ref} id="studio" className="studio" aria-label="From sketch to render" data-nav-theme={stage >= 3 ? 'dark' : 'light'}>
      <div className={`studio__sticky ${stage >= 3 ? 'is-dark' : ''}`}>
        <div className="studio__stage">
          {mounted && (
            <CanvasBoundary>
              <Suspense fallback={null}>
                <StoreCanvas progress={scrollYProgress} active={visible} />
              </Suspense>
            </CanvasBoundary>
          )}
        </div>
        <motion.div className="studio__paper" style={{ opacity: paperOpacity }} aria-hidden="true" />
        <motion.div className="studio__grid" style={{ opacity: gridOpacity }} aria-hidden="true" />

        <div className="studio__ui">
          <div className="studio__scrim" aria-hidden="true" />
          <div className="studio__head">
            <span className="label">wallcraftpanels Studio · From sketch to render</span>
            <span className="label studio__project">Boutique Calma · 108 m² · Scale 1:50</span>
          </div>

          <motion.div className="studio__intro" style={{ opacity: introOpacity, y: introY }}>
            <span className="label">The 3D process</span>
            <h2>
              From sketch <span className="accent-word">to</span> boutique
            </h2>
            <p>Scroll to build a luxury store, line by line, in wood, aluminium, stone and granite.</p>
          </motion.div>

          <motion.ol className="studio__steps" aria-label="Stages" style={{ opacity: uiOpacity }}>
            {STAGES.map((s, i) => (
              <li key={s.key} className={i === stage ? 'is-active' : i < stage ? 'is-done' : ''}>
                <button onClick={() => jump(i)} aria-current={i === stage ? 'step' : undefined} aria-label={`Go to ${s.label}`}>
                  <span className="studio__step-n">{s.n}</span>
                  <span className="studio__step-label">{s.label}</span>
                </button>
              </li>
            ))}
          </motion.ol>

          <motion.div className="studio__caption" aria-live="polite" style={{ opacity: uiOpacity }}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={current.key}
                initial={{ opacity: 0, y: 26, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -16, filter: 'blur(6px)' }}
                transition={{ type: 'spring', bounce: 0, visualDuration: 0.45 }}
              >
                <span className="label">
                  {current.n} — {current.label}
                </span>
                <h3>{current.title}</h3>
                <p>{current.text}</p>
                {stage === STAGES.length - 1 && (
                  <div className="studio__cta">
                    <Button href="#contact" variant="light">
                      Design my space
                    </Button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>

          <div className="studio__progress" aria-hidden="true">
            <span className="studio__bar">
              <motion.i style={{ scaleX: scrollYProgress }} />
            </span>
            <motion.span className="label studio__pct">{pct}</motion.span>
          </div>

          <motion.div className="studio__frame" style={{ opacity: frameOpacity }} aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
            <span className="label studio__meta">Final render · 3840 × 2160 · 3000 K · ISO 200</span>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
