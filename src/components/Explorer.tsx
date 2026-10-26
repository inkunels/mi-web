import { useState, type PointerEvent } from 'react'
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { FAMILIES, PROFILES, profileId, SWATCHES, type Family, type FamilyId } from '../data/content'
import { useFamily } from '../hooks/family'
import { MAX_SAMPLES, useSamples } from '../hooks/samples'
import { ProfileSection } from './Material'
import { FadeIn, Photo, RevealText } from './ui'

function Segmented({ value, onChange }: { value: FamilyId; onChange: (id: FamilyId) => void }) {
  return (
    <div className="segmented" role="tablist" aria-label="Material family">
      {FAMILIES.map((f) => (
        <button
          key={f.id}
          role="tab"
          aria-selected={f.id === value}
          aria-controls="explorer-panel"
          className={f.id === value ? 'is-active' : undefined}
          onClick={() => onChange(f.id)}
        >
          {f.id === value && (
            <motion.span
              layoutId="segmented-pill"
              className="segmented__pill"
              transition={{ type: 'spring', bounce: 0.15, visualDuration: 0.45 }}
            />
          )}
          <span>{f.name}</span>
        </button>
      ))}
    </div>
  )
}

function Gallery({ family }: { family: Family }) {
  const [index, setIndex] = useState(0)
  const shot = family.gallery[index]
  return (
    <div className="gallery">
      <div className="gallery__stage">
        <AnimatePresence initial={false}>
          <motion.div
            key={shot.src}
            className="gallery__img"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <Photo id={shot.src} srcSet={shot.srcSet} alt={shot.caption} sizes="(max-width: 960px) 100vw, 56vw" />
          </motion.div>
        </AnimatePresence>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={shot.caption}
            className="gallery__caption"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {shot.caption}
          </motion.span>
        </AnimatePresence>
      </div>
      <div className="gallery__thumbs" role="group" aria-label="Spaces">
        {family.gallery.map((g, k) => (
          <button
            key={g.src}
            className={k === index ? 'is-active' : undefined}
            aria-pressed={k === index}
            aria-label={`Show ${g.caption}`}
            onClick={() => setIndex(k)}
          >
            <Photo id={g.src} srcSet={g.srcSet} alt="" sizes="160px" />
          </button>
        ))}
      </div>
    </div>
  )
}

function TiltChip({ texture, label }: { texture: string; label: string }) {
  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)
  const rotateX = useSpring(useTransform(py, [0, 1], [12, -12]), { stiffness: 220, damping: 20 })
  const rotateY = useSpring(useTransform(px, [0, 1], [-14, 14]), { stiffness: 220, damping: 20 })
  const sheen = useTransform(
    () => `radial-gradient(120% 90% at ${px.get() * 100}% ${py.get() * 60}%, rgba(255,255,255,.42), transparent 55%)`,
  )

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    px.set((e.clientX - r.left) / r.width)
    py.set((e.clientY - r.top) / r.height)
  }

  return (
    <motion.div
      className="chip3d"
      role="img"
      aria-label={label}
      onPointerMove={onMove}
      onPointerLeave={() => {
        px.set(0.5)
        py.set(0.5)
      }}
      style={{ rotateX, rotateY, transformPerspective: 700 }}
    >
      <AnimatePresence initial={false}>
        <motion.i
          key={texture}
          className="chip3d__face"
          style={{ backgroundImage: `url(${texture})` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        />
      </AnimatePresence>
      <motion.i className="chip3d__sheen" style={{ backgroundImage: sheen }} />
    </motion.div>
  )
}

function AddButton({ id }: { id: string }) {
  const { selected, toggle, isFull } = useSamples()
  const added = selected.includes(id)
  const disabled = !added && isFull
  return (
    <button className={`add-btn ${added ? 'is-added' : ''}`} onClick={() => toggle(id)} disabled={disabled} aria-pressed={added}>
      <span className="add-btn__icon" aria-hidden="true">
        <motion.svg viewBox="0 0 16 16" animate={{ rotate: added ? 45 : 0 }} transition={{ type: 'spring', bounce: 0.3, visualDuration: 0.35 }}>
          <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </motion.svg>
      </span>
      {added ? 'Remove from sample box' : disabled ? `Sample box full (${MAX_SAMPLES})` : 'Add to sample box'}
    </button>
  )
}

function SwatchPicker({ family }: { family: FamilyId }) {
  const list = SWATCHES.filter((s) => s.family === family)
  const [currentId, setCurrentId] = useState(list[0].id)
  const current = list.find((s) => s.id === currentId) ?? list[0]
  const { selected } = useSamples()

  return (
    <div className="picker">
      <div className="picker__current">
        <TiltChip texture={current.texture} label={`${current.name} ${current.code}`} />
        <div className="picker__meta">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22 }}
            >
              <strong>{current.name}</strong>
              <span>{current.code}</span>
            </motion.div>
          </AnimatePresence>
          <AddButton id={current.id} />
        </div>
      </div>
      <div className="picker__grid" role="radiogroup" aria-label="Finishes">
        {list.map((s) => (
          <button
            key={s.id}
            role="radio"
            aria-checked={s.id === current.id}
            aria-label={`${s.name}, ${s.code}`}
            title={`${s.name} · ${s.code}`}
            className={`picker__dot ${s.id === current.id ? 'is-current' : ''}`}
            onClick={() => setCurrentId(s.id)}
          >
            <i style={{ backgroundImage: `url(${s.texture})` }} />
            {selected.includes(s.id) && <span className="picker__check" aria-hidden="true" />}
          </button>
        ))}
      </div>
      <p className="picker__note">
        {list.length} signature finishes shown. Tap one to preview it, then add up to {MAX_SAMPLES} to your sample box.
      </p>
    </div>
  )
}

function ProfilePicker() {
  const [code, setCode] = useState(PROFILES[0].code)
  const current = PROFILES.find((p) => p.code === code) ?? PROFILES[0]
  const { selected } = useSamples()

  return (
    <div className="picker">
      <div className="picker__current picker__current--profile">
        <div className="profile-preview">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={current.code}
              initial={{ opacity: 0, scaleY: 0.6 }}
              animate={{ opacity: 1, scaleY: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', bounce: 0.2, visualDuration: 0.4 }}
            >
              <ProfileSection shape={current.shape} />
            </motion.div>
          </AnimatePresence>
          <span className="profile-preview__dim">3000 mm</span>
        </div>
        <div className="picker__meta">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={current.code}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22 }}
            >
              <strong>{current.code}</strong>
              <span>{current.size} · standard length 3000 mm</span>
            </motion.div>
          </AnimatePresence>
          <AddButton id={profileId(current.code)} />
        </div>
      </div>
      <div className="profiles" role="radiogroup" aria-label="Profiles">
        {PROFILES.map((p) => (
          <button
            key={p.code}
            role="radio"
            aria-checked={p.code === code}
            className={`profiles__item ${p.code === code ? 'is-current' : ''}`}
            onClick={() => setCode(p.code)}
          >
            <ProfileSection shape={p.shape} />
            <span className="profiles__code">{p.code}</span>
            <span className="profiles__size">{p.size}</span>
            {selected.includes(profileId(p.code)) && <span className="picker__check" aria-hidden="true" />}
          </button>
        ))}
      </div>
      <p className="picker__note">Trims W2424 · W2222 · ELP2626 · ELP3434 finish every edge and corner.</p>
    </div>
  )
}

export default function Explorer() {
  const { family, setFamily } = useFamily()
  const f = FAMILIES.find((x) => x.id === family) ?? FAMILIES[0]

  return (
    <section className="explorer" id="explorer" data-nav-theme="light" aria-label="Material explorer">
      <div className="container">
        <div className="explorer__head">
          <FadeIn>
            <span className="eyebrow">The collection</span>
          </FadeIn>
          <RevealText className="h-sub" text="Explore every finish." accent={['finish.']} />
          <FadeIn delay={0.1}>
            <Segmented value={family} onChange={setFamily} />
          </FadeIn>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={family}
            id="explorer-panel"
            role="tabpanel"
            className="explorer__panel"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ type: 'spring', bounce: 0, visualDuration: 0.5 }}
          >
            <Gallery family={f} />
            <div className="explorer__info">
              <span className="eyebrow">
                {f.index} · {f.short}
              </span>
              <h3>{f.name}</h3>
              <p className="explorer__line">{f.line}</p>
              <p className="explorer__desc">{f.description}</p>
              <dl className="explorer__facts">
                {f.facts.map((fact) => (
                  <div key={fact.label}>
                    <dt>{fact.value}</dt>
                    <dd>{fact.label}</dd>
                  </div>
                ))}
              </dl>
              {f.id === 'profile' ? <ProfilePicker /> : <SwatchPicker family={f.id} />}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}
