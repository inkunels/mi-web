import { useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import { useLenis } from 'lenis/react'
import { BOUTIQUE, SAMPLE_INDEX, type BoutiqueZone, type Hotspot } from '../data/content'
import { useSamples } from '../hooks/samples'
import { useMedia } from '../hooks/useMedia'
import { FadeIn, RevealText } from './ui'

type Zone = BoutiqueZone

const sampleId = (code: string) => code.toLowerCase().replace(/[^a-z0-9]/g, '')

function loupe(zone: Zone, at: [number, number], size: number, zoom = 5) {
  const w = size * zoom
  const h = (w * zone.size[1]) / zone.size[0]
  return {
    backgroundImage: `url(${zone.image})`,
    backgroundSize: `${w}px ${h}px`,
    backgroundPosition: `${size / 2 - (at[0] / 100) * w}px ${size / 2 - (at[1] / 100) * h}px`,
  }
}

function useCover(size: [number, number], focus: [number, number]) {
  const ref = useRef<HTMLDivElement>(null)
  const [box, setBox] = useState({ w: 0, h: 0 })
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => setBox({ w: el.clientWidth, h: el.clientHeight })
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const scale = Math.max(box.w / size[0], box.h / size[1]) || 0
  const dw = size[0] * scale
  const dh = size[1] * scale
  const ox = (box.w - dw) * focus[0]
  const oy = (box.h - dh) * focus[1]
  const place = (at: [number, number]) => {
    const x = ox + (at[0] / 100) * dw
    const y = oy + (at[1] / 100) * dh
    const inside = x > 14 && x < box.w - 14 && y > 14 && y < box.h - 14
    return { x, y, inside, flip: x > box.w * 0.58, low: y > box.h * 0.62 }
  }
  return { ref, place, ready: box.w > 0 }
}

function SampleToggle({ code }: { code: string }) {
  const id = sampleId(code)
  const { selected, toggle, isFull } = useSamples()
  if (!SAMPLE_INDEX[id]) return null
  const added = selected.includes(id)
  return (
    <button
      className={`mini-add ${added ? 'is-added' : ''}`}
      onClick={(e) => {
        e.stopPropagation()
        toggle(id)
      }}
      disabled={!added && isFull}
      aria-pressed={added}
      aria-label={`${added ? 'Remove' : 'Add'} ${code} ${added ? 'from' : 'to'} the sample box`}
    >
      {added ? 'Added' : '+ Sample'}
    </button>
  )
}

function Spot({
  p,
  index,
  zone,
  pos,
  open,
  setOpen,
}: {
  p: Hotspot
  index: number
  zone: Zone
  pos: ReturnType<ReturnType<typeof useCover>['place']>
  open: boolean
  setOpen: (i: number | null) => void
}) {
  if (!pos.inside) return null
  return (
    <div
      className={`spot ${open ? 'is-open' : ''} ${pos.flip ? 'spot--flip' : ''} ${pos.low ? 'spot--low' : ''}`}
      style={{ left: pos.x, top: pos.y }}
      onMouseEnter={() => setOpen(index)}
      onMouseLeave={() => setOpen(null)}
    >
      <button
        className="spot__dot"
        aria-expanded={open}
        aria-label={`${p.use}: ${p.name}, ${p.code}`}
        onClick={() => setOpen(open ? null : index)}
      >
        <span />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            className="spot__card"
            initial={{ opacity: 0, scale: 0.92, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', bounce: 0.15, visualDuration: 0.3 }}
          >
            <i className="spot__loupe" style={loupe(zone, p.at, 56)} aria-hidden="true" />
            <span className="spot__text">
              <span className="spot__use">
                {p.family} · {p.use}
              </span>
              <strong>{p.name}</strong>
              <span className="spot__code">{p.code}</span>
            </span>
            <SampleToggle code={p.code} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ZoneImage({ zone, open, setOpen }: { zone: Zone; open: number | null; setOpen: (i: number | null) => void }) {
  const { ref, place, ready } = useCover(zone.size, zone.focus)
  return (
    <div ref={ref} className="zone-img">
      <img
        src={zone.image}
        srcSet={zone.imageSet}
        sizes={zone.imageSet ? '(max-width: 960px) 100vw, 60vw' : undefined}
        alt={`${BOUTIQUE.name}, ${zone.title.toLowerCase()}`}
        style={{ objectPosition: `${zone.focus[0] * 100}% ${zone.focus[1] * 100}%` }}
        loading="lazy"
        decoding="async"
        draggable={false}
      />
      {ready &&
        zone.panels.map((p, i) => (
          <Spot key={i} p={p} index={i} zone={zone} pos={place(p.at)} open={open === i} setOpen={setOpen} />
        ))}
    </div>
  )
}

function Plan({ active, onPick }: { active: number; onPick?: (i: number) => void }) {
  return (
    <svg className="plan" viewBox="0 0 100 70" role="group" aria-label="Boutique floor plan">
      <path className="plan__wall" d="M34 68 H98 V2 H2 V68 H12" />
      <path className="plan__wall plan__wall--thin" d="M58 2 V10 Q58 34 86 36 H98" />
      <rect className="plan__fixture" x="66" y="56" width="18" height="5" rx="1" />
      <rect className="plan__fixture" x="5" y="12" width="2.4" height="32" rx="1" />
      <circle className="plan__fixture" cx="40" cy="44" r="3.2" />
      <circle className="plan__fixture" cx="40" cy="20" r="3.2" />
      <text className="plan__label" x="23" y="66.5" textAnchor="middle">
        Entrance
      </text>
      {BOUTIQUE.zones.map((z, i) => (
        <g
          key={z.id}
          className={`plan__zone ${i === active ? 'is-active' : ''}`}
          transform={`translate(${z.plan[0]} ${z.plan[1] * 0.7})`}
          onClick={onPick ? () => onPick(i) : undefined}
          style={onPick ? { cursor: 'pointer' } : undefined}
        >
          <circle r="5.2" />
          <text textAnchor="middle" dy="1.9">
            {i + 1}
          </text>
        </g>
      ))}
    </svg>
  )
}

function PanelList({ zone, open, setOpen }: { zone: Zone; open: number | null; setOpen: (i: number | null) => void }) {
  return (
    <ul className="panel-list">
      {zone.panels.map((p, i) => (
        <li
          key={i}
          className={open === i ? 'is-open' : undefined}
          onMouseEnter={() => setOpen(i)}
          onMouseLeave={() => setOpen(null)}
        >
          <i className="panel-list__loupe" style={loupe(zone, p.at, 44)} aria-hidden="true" />
          <span>
            <span className="panel-list__use">
              {p.use} · {p.family}
            </span>
            <strong>
              {p.name} <em>{p.code}</em>
            </strong>
          </span>
          <SampleToggle code={p.code} />
        </li>
      ))}
    </ul>
  )
}

function Sticky() {
  const track = useRef<HTMLDivElement>(null)
  const lenis = useLenis()
  const { scrollYProgress } = useScroll({ target: track, offset: ['start start', 'end end'] })
  const [active, setActive] = useState(0)
  const [open, setOpen] = useState<number | null>(null)
  const activeRef = useRef(0)
  const zones = BOUTIQUE.zones
  const zone = zones[active]

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const i = Math.min(zones.length - 1, Math.max(0, Math.floor(v * zones.length * 0.999)))
    if (i === activeRef.current) return
    activeRef.current = i
    setActive(i)
    setOpen(null)
  })

  const pick = (i: number) => {
    const el = track.current
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY
    const span = el.offsetHeight - window.innerHeight
    const target = top + ((i + 0.5) / zones.length) * span
    if (lenis) lenis.scrollTo(target, { duration: 1.2 })
    else window.scrollTo({ top: target, behavior: 'smooth' })
  }

  return (
    <div ref={track} className="boutique__track" style={{ height: `${zones.length * 85 + 15}vh` }}>
      <div className="boutique__sticky">
        <div className="boutique__stage">
          <AnimatePresence initial={false}>
            <motion.div
              key={zone.id}
              className="boutique__frame"
              initial={{ opacity: 0, scale: 1.04, filter: 'blur(6px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, transition: { duration: 0.5 } }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <ZoneImage zone={zone} open={open} setOpen={setOpen} />
            </motion.div>
          </AnimatePresence>
          <div className="boutique__counter" aria-hidden="true">
            <span>{zone.n}</span> / {String(zones.length).padStart(2, '0')}
          </div>
        </div>

        <aside className="boutique__aside">
          <ol className="zones" aria-label="Boutique zones">
            {zones.map((z, i) => (
              <li key={z.id} className={i === active ? 'is-active' : i < active ? 'is-done' : undefined}>
                <button onClick={() => pick(i)} aria-current={i === active ? 'step' : undefined}>
                  <span className="zones__n">{z.n}</span>
                  <span className="zones__title">{z.title}</span>
                </button>
                <AnimatePresence initial={false}>
                  {i === active && (
                    <motion.div
                      className="zones__body"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ type: 'spring', bounce: 0, visualDuration: 0.45 }}
                    >
                      <p>{z.text}</p>
                      <PanelList zone={z} open={open} setOpen={setOpen} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            ))}
          </ol>
          <div className="boutique__plan">
            <Plan active={active} onPick={pick} />
            <span className="boutique__plan-meta">{BOUTIQUE.meta}</span>
          </div>
        </aside>
      </div>
    </div>
  )
}

function Stacked() {
  const [open, setOpen] = useState<Record<string, number | null>>({})
  return (
    <div className="boutique__list">
      {BOUTIQUE.zones.map((z, i) => (
        <FadeIn key={z.id} className="zone-card" delay={i * 0.04}>
          <div className="zone-card__img">
            <ZoneImage zone={z} open={open[z.id] ?? null} setOpen={(v) => setOpen((o) => ({ ...o, [z.id]: v }))} />
          </div>
          <div className="zone-card__body">
            <span className="zones__n">{z.n}</span>
            <h3>{z.title}</h3>
            <p>{z.text}</p>
            <PanelList zone={z} open={open[z.id] ?? null} setOpen={(v) => setOpen((o) => ({ ...o, [z.id]: v }))} />
          </div>
        </FadeIn>
      ))}
    </div>
  )
}

export default function Boutique() {
  const wide = useMedia('(min-width: 961px)')
  return (
    <section className="boutique" id="boutique" data-nav-theme="light">
      <div className="container">
        <FadeIn>
          <div className="sec-rule">
            <span>
              <b>04/</b> Boutique
            </span>
            <span>Minimal luxury retail</span>
          </div>
        </FadeIn>
        <div className="boutique__intro">
          <RevealText className="h-section" text={`${BOUTIQUE.name}.\nQuiet luxury, panel by panel.`} accent={['panel']} />
          <FadeIn delay={0.12}>
            <p className="lead">
              A concept boutique where the panels are the interior: oak, rough stone, fluted wood and brushed gold.{' '}
              <strong>Walk through it and tap any point to see the exact finish.</strong>
            </p>
          </FadeIn>
        </div>
        {wide ? <Sticky /> : <Stacked />}
      </div>
    </section>
  )
}
