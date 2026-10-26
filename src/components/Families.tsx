import { motion } from 'motion/react'
import { FAMILIES, PROFILES, SWATCHES, type Family, type FamilyId } from '../data/content'
import { useFamily } from '../hooks/family'
import { useScrollTo } from '../hooks/useScrollTo'
import { ProfileSection } from './Material'
import { Chevron, FadeIn, Photo, RevealText } from './ui'

const SIZES: Record<FamilyId, string> = {
  wood: '(max-width: 760px) 100vw, 58vw',
  aluminium: '(max-width: 760px) 100vw, 42vw',
  stone: '(max-width: 760px) 100vw, 33vw',
  granite: '(max-width: 760px) 100vw, 33vw',
  profile: '(max-width: 760px) 100vw, 33vw',
}

function Tile({ f, i, onOpen }: { f: Family; i: number; onOpen: () => void }) {
  const swatches = SWATCHES.filter((s) => s.family === f.id).slice(0, 5)
  return (
    <motion.article
      className={`tile tile--${f.id}`}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -8% 0px' }}
      transition={{ type: 'spring', bounce: 0, visualDuration: 0.9, delay: (i < 2 ? i : i - 2) * 0.08 }}
    >
      <button className="tile__hit" onClick={onOpen} aria-label={`Explore ${f.name}: ${f.line}`}>
        <span className="tile__media">
          <Photo id={f.image} srcSet={f.imageSet} alt="" sizes={SIZES[f.id]} />
        </span>
        <span className="tile__shade" aria-hidden="true" />
        <span className="tile__top">
          <span className="tile__index">{f.index}</span>
          <span className="tile__kicker">{f.short}</span>
        </span>
        <span className="tile__body">
          <span className="tile__name">{f.name}</span>
          <span className="tile__line">{f.line}</span>
        </span>
        <span className="tile__foot">
          {swatches.length > 0 ? (
            <span className="tile__dots" aria-hidden="true">
              {swatches.map((s) => (
                <i key={s.id} style={{ backgroundImage: `url(${s.texture})` }} />
              ))}
            </span>
          ) : (
            <span className="tile__profiles" aria-hidden="true">
              {PROFILES.slice(0, 3).map((p) => (
                <ProfileSection key={p.code} shape={p.shape} />
              ))}
            </span>
          )}
          <span className="tile__more">
            Explore
            <Chevron />
          </span>
        </span>
      </button>
    </motion.article>
  )
}

export default function Families() {
  const { setFamily } = useFamily()
  const scrollTo = useScrollTo()

  const open = (id: FamilyId) => {
    setFamily(id)
    scrollTo('#explorer')
  }

  return (
    <section className="families" id="materials" data-nav-theme="light">
      <div className="container">
        <FadeIn>
          <div className="sec-rule">
            <span>
              <b>02/</b> Materials
            </span>
            <span>Wood · Aluminium · Stone · Granite · 3D Profiles</span>
          </div>
        </FadeIn>
        <div className="section-intro">
          <RevealText className="h-section" text={'Five materials.\nOne way of building.'} accent={['One']} />
          <FadeIn delay={0.15}>
            <p className="lead">
              Every wallcraftpanels surface is a light, thin panel with the look and touch of the real thing.{' '}
              <strong>Pick a family to see its finishes, codes and spaces.</strong>
            </p>
          </FadeIn>
        </div>
        <div className="families__grid">
          {FAMILIES.map((f, i) => (
            <Tile key={f.id} f={f} i={i} onOpen={() => open(f.id)} />
          ))}
        </div>
      </div>
    </section>
  )
}
