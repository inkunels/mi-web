import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useLenis } from 'lenis/react'
import { CASES, PANEL_SIZE, SECTORS, type CaseStudy, type Pic, type SectorId } from '../data/mdv'
import { useScrollTo } from '../hooks/useScrollTo'
import { Chevron, Counter, FadeIn, Photo, RevealText } from './ui'

const sectorName = (id: SectorId) => SECTORS.find((s) => s.id === id)?.name ?? ''
const fmt = (n: number) => n.toLocaleString('en-US')

function SectorRail({ value, onChange }: { value: SectorId | 'all'; onChange: (v: SectorId | 'all') => void }) {
  return (
    <div className="sectors" role="group" aria-label="Filter by sector">
      {SECTORS.map((s, i) => {
        const active = value === s.id
        const count = CASES.filter((c) => c.sector === s.id).length
        return (
          <motion.button
            key={s.id}
            className={`sector ${active ? 'is-active' : ''} ${value !== 'all' && !active ? 'is-dim' : ''}`}
            aria-pressed={active}
            onClick={() => onChange(active ? 'all' : s.id)}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '0px 0px -6% 0px' }}
            transition={{ type: 'spring', bounce: 0, visualDuration: 0.7, delay: i * 0.05 }}
          >
            <span className="sector__img">
              <Photo id={s.cover.src} srcSet={s.cover.srcSet} alt="" sizes="(max-width: 760px) 62vw, 17vw" />
            </span>
            <span className="sector__shade" aria-hidden="true" />
            <span className="sector__name">{s.name}</span>
            <span className="sector__count">
              {count} {count === 1 ? 'project' : 'projects'}
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}

function Card({ c, onOpen, index }: { c: CaseStudy; onOpen: () => void; index: number }) {
  return (
    <motion.li
      layout
      className="pcard"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ type: 'spring', bounce: 0, visualDuration: 0.6, delay: (index % 3) * 0.05 }}
    >
      <button className="pcard__hit" onClick={onOpen} aria-label={`Open case study: ${c.title}`}>
        <span className="pcard__img">
          <Photo id={c.main.src} srcSet={c.main.srcSet} alt="" sizes="(max-width: 760px) 100vw, (max-width: 960px) 50vw, 33vw" />
          <span className="pcard__view" aria-hidden="true">
            View project
            <Chevron />
          </span>
        </span>
        <span className="pcard__meta">
          <span className="pcard__title">{c.title}</span>
          <span className="pcard__sector">{sectorName(c.sector)}</span>
          <span className="pcard__facts">
            {fmt(c.area)} m² · {fmt(c.panels)} panels · {c.code}
          </span>
        </span>
      </button>
    </motion.li>
  )
}

function Featured({ c, onOpen }: { c: CaseStudy; onOpen: () => void }) {
  return (
    <motion.article
      key={c.id}
      className="featured"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ type: 'spring', bounce: 0, visualDuration: 0.6 }}
    >
      <button className="featured__img" onClick={onOpen} aria-label={`Open case study: ${c.title}`}>
        <Photo id={c.main.src} srcSet={c.main.srcSet} alt={`${c.title}, ${c.mainCaption.toLowerCase()}`} sizes="(max-width: 960px) 100vw, 64vw" />
      </button>
      <div className="featured__info">
        <span className="eyebrow">Featured · {sectorName(c.sector)}</span>
        <h3>{c.title}</h3>
        <p>{c.description}</p>
        <dl className="featured__stats">
          <div>
            <dt>{fmt(c.area)} m²</dt>
            <dd>Total area</dd>
          </div>
          <div>
            <dt>{fmt(c.panels)}</dt>
            <dd>Panels</dd>
          </div>
        </dl>
        <div className="featured__finish">
          <i style={{ backgroundImage: `url(${c.texture})` }} aria-hidden="true" />
          <span>
            Finish <strong>{c.code}</strong>
          </span>
        </div>
        <button className="btn" onClick={onOpen}>
          <span className="btn__roll">
            <span>View case study</span>
            <span aria-hidden="true">View case study</span>
          </span>
        </button>
      </div>
    </motion.article>
  )
}

function CaseView({ list, index, onClose, onIndex }: { list: CaseStudy[]; index: number; onClose: () => void; onIndex: (i: number) => void }) {
  const c = list[index]
  const shots: { pic: Pic; caption: string }[] = useMemo(() => [{ pic: c.main, caption: c.mainCaption }, ...c.details], [c])
  const [shot, setShot] = useState(0)
  const closeRef = useRef<HTMLButtonElement>(null)
  const scrollTo = useScrollTo()
  const current = shots[shot] ?? shots[0]

  useEffect(() => setShot(0), [c.id])

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    closeRef.current?.focus()
    return () => previous?.focus?.()
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onIndex((index + 1) % list.length)
      if (e.key === 'ArrowLeft') onIndex((index - 1 + list.length) % list.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, list.length, onClose, onIndex])

  return (
    <motion.div
      className="case"
      role="dialog"
      aria-modal="true"
      aria-labelledby="case-title"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="case__backdrop" onClick={onClose} />
      <motion.div
        className="case__panel"
        data-lenis-prevent
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.98 }}
        transition={{ type: 'spring', bounce: 0, visualDuration: 0.45 }}
      >
        <button ref={closeRef} className="case__close" onClick={onClose} aria-label="Close case study">
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>

        <div className="case__media">
          <div className="case__stage">
            <AnimatePresence initial={false}>
              <motion.img
                key={current.pic.src}
                src={current.pic.src}
                srcSet={current.pic.srcSet}
                sizes="(max-width: 960px) 100vw, 64vw"
                alt={`${c.title}, ${current.caption.toLowerCase()}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45 }}
                draggable={false}
              />
            </AnimatePresence>
            <span className="case__caption">{current.caption}</span>
          </div>
          <div className="case__thumbs" role="group" aria-label="Photos">
            {shots.map((s, i) => (
              <button
                key={s.pic.src}
                className={i === shot ? 'is-active' : undefined}
                aria-pressed={i === shot}
                aria-label={`Show ${s.caption}`}
                onClick={() => setShot(i)}
              >
                <img src={s.pic.src} alt="" loading="lazy" decoding="async" draggable={false} />
              </button>
            ))}
          </div>
        </div>

        <div className="case__info">
          <span className="eyebrow">
            {sectorName(c.sector)} · {index + 1} / {list.length}
          </span>
          <h3 id="case-title">{c.title}</h3>
          <p>{c.description}</p>
          <dl className="case__stats">
            <div>
              <dt>Total area</dt>
              <dd>{fmt(c.area)} m²</dd>
            </div>
            <div>
              <dt>Panels</dt>
              <dd>{fmt(c.panels)}</dd>
            </div>
            <div>
              <dt>Panel size</dt>
              <dd>{PANEL_SIZE}</dd>
            </div>
            <div>
              <dt>Finish</dt>
              <dd>{c.code}</dd>
            </div>
          </dl>
          <div className="case__texture">
            <i style={{ backgroundImage: `url(${c.texture})` }} aria-hidden="true" />
            <span>Flexible stone texture {c.code}</span>
          </div>
          <div className="case__actions">
            <button
              className="btn"
              onClick={() => {
                onClose()
                window.setTimeout(() => scrollTo('#contact'), 350)
              }}
            >
              <span className="btn__roll">
                <span>Ask about this finish</span>
                <span aria-hidden="true">Ask about this finish</span>
              </span>
            </button>
            <div className="case__nav">
              <button onClick={() => onIndex((index - 1 + list.length) % list.length)} aria-label="Previous project">
                <Chevron />
              </button>
              <button onClick={() => onIndex((index + 1) % list.length)} aria-label="Next project">
                <Chevron />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function Projects() {
  const [sector, setSector] = useState<SectorId | 'all'>('all')
  const [open, setOpen] = useState<number | null>(null)
  const lenis = useLenis()
  const list = CASES.filter((c) => sector === 'all' || c.sector === sector)
  const totals = useMemo(
    () => ({
      area: CASES.reduce((a, c) => a + c.area, 0),
      panels: CASES.reduce((a, c) => a + c.panels, 0),
    }),
    [],
  )
  const activeSector = SECTORS.find((s) => s.id === sector)

  useEffect(() => {
    if (open === null) return
    lenis?.stop()
    return () => lenis?.start()
  }, [open, lenis])

  return (
    <section className="projects" id="projects" data-nav-theme="light">
      <div className="container">
        <FadeIn>
          <div className="sec-rule">
            <span>
              <b>06/</b> Projects
            </span>
            <span>Flexible stone case studies</span>
          </div>
        </FadeIn>

        <div className="projects__head">
          <RevealText className="h-section" text={'Built in the\nreal world.'} accent={['real']} />
          <dl className="projects__totals">
            <div>
              <dt>
                <Counter to={CASES.length} />
              </dt>
              <dd>Case studies</dd>
            </div>
            <div>
              <dt>
                <Counter to={totals.area} suffix=" m²" />
              </dt>
              <dd>Clad in flexible stone</dd>
            </div>
            <div>
              <dt>
                <Counter to={totals.panels} />
              </dt>
              <dd>Panels installed</dd>
            </div>
          </dl>
        </div>

        <SectorRail value={sector} onChange={setSector} />

        <div className="projects__filter">
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={sector}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
            >
              {activeSector ? (
                <>
                  <strong>{activeSector.name}.</strong> {activeSector.text}
                </>
              ) : (
                <>
                  <strong>All sectors.</strong> Villas, hotels, museums, offices, restaurants and flagship stores renovated with
                  flexible stone.
                </>
              )}
            </motion.p>
          </AnimatePresence>
          {sector !== 'all' && (
            <button className="projects__clear" onClick={() => setSector('all')}>
              Show all
            </button>
          )}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <Featured key={list[0].id} c={list[0]} onOpen={() => setOpen(0)} />
        </AnimatePresence>

        <motion.ul layout className="projects__grid">
          <AnimatePresence initial={false}>
            {list.slice(1).map((c, i) => (
              <Card key={c.id} c={c} index={i} onOpen={() => setOpen(i + 1)} />
            ))}
          </AnimatePresence>
        </motion.ul>
      </div>

      <AnimatePresence>
        {open !== null && list[open] && (
          <CaseView key="case" list={list} index={open} onClose={() => setOpen(null)} onIndex={setOpen} />
        )}
      </AnimatePresence>
    </section>
  )
}
