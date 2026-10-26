import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { AXES, COMPARE, CORES, FAMILIES, PROPERTIES, SWATCH_IMG, type Core } from '../data/content'
import { ProfileSection } from './Material'
import { FadeIn, RevealText } from './ui'

const ICONS: Record<(typeof PROPERTIES)[number]['id'], string> = {
  water: 'M12 3.5c3.1 3.7 5.6 6.8 5.6 10a5.6 5.6 0 0 1-11.2 0c0-3.2 2.5-6.3 5.6-10Z',
  fire: 'M12 21a6 6 0 0 0 6-6c0-3.6-2.6-5.6-3.6-8.6-1.3 1.6-1.8 3-2.2 4.6-1-1.4-1.5-3-1-5.5C7.6 7.4 6 10.9 6 15a6 6 0 0 0 6 6Z',
  rot: 'M5 19c0-8.8 5.2-14 14-14 0 8.8-5.2 14-14 14Zm0 0 7.5-7.5',
  toxic: 'M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm-5.6 2.4 11.2 11.2',
  install: 'M4 20l7.5-7.5M13 5.5l5.5 5.5-3 3L10 8.5l3-3Zm2.5-2.5 5.5 5.5',
  maintenance: 'M12 3.5v4M12 16.5v4M3.5 12h4M16.5 12h4M6 6l2.6 2.6M15.4 15.4 18 18M6 18l2.6-2.6M15.4 8.6 18 6',
  paint: 'M14.5 3.5 20.5 9.5 13 17l-6-6 7.5-7.5ZM7 11l-2.6 2.6a2.8 2.8 0 0 0 4 4L11 15',
  colour:
    'M12 3.5a8.5 8.5 0 1 0 0 17c1.4 0 2-.9 2-1.8 0-1.2-1-1.5-1-2.6 0-.9.8-1.6 1.8-1.6h2.2a3.6 3.6 0 0 0 3.6-3.6C20.6 6.8 16.8 3.5 12 3.5ZM8 11h.01M11 7.5h.01M15.5 8h.01',
  eco: 'M19.5 12a7.5 7.5 0 0 1-13.4 4.6M4.5 12a7.5 7.5 0 0 1 13.4-4.6M18.5 3.5v4.2h-4.2M5.5 20.5v-4.2h4.2',
}

const SIZE = 420
const C = SIZE / 2
const R = 148

function point(i: number, value: number) {
  const a = -Math.PI / 2 + (i * Math.PI * 2) / AXES.length
  const r = (value / 10) * R
  return [C + Math.cos(a) * r, C + Math.sin(a) * r] as const
}

const polygon = (scores: number[]) => scores.map((v, i) => point(i, v).map((n) => n.toFixed(1)).join(',')).join(' ')

function Radar({ active }: { active: Core }) {
  return (
    <svg className="radar" viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={`Performance profile of ${active.code}`}>
      {[2, 4, 6, 8, 10].map((ring) => (
        <polygon key={ring} className="radar__ring" points={polygon(AXES.map(() => ring))} />
      ))}
      {AXES.map((axis, i) => {
        const [x, y] = point(i, 10)
        const [lx, ly] = point(i, 12)
        return (
          <g key={axis}>
            <line className="radar__axis" x1={C} y1={C} x2={x} y2={y} />
            <text className="radar__label" x={lx} y={ly} textAnchor="middle" dominantBaseline="middle">
              {axis}
            </text>
          </g>
        )
      })}
      {CORES.filter((c) => c.id !== active.id).map((c) => (
        <polygon key={c.id} className="radar__ghost" points={polygon(c.scores)} />
      ))}
      <motion.polygon
        className="radar__shape"
        initial={false}
        animate={{ points: polygon(active.scores) }}
        transition={{ type: 'spring', bounce: 0.2, visualDuration: 0.7 }}
      />
      {active.scores.map((v, i) => {
        const [x, y] = point(i, v)
        return (
          <motion.circle
            key={i}
            className="radar__dot"
            r={4.5}
            initial={false}
            animate={{ cx: x, cy: y }}
            transition={{ type: 'spring', bounce: 0.2, visualDuration: 0.7 }}
          />
        )
      })}
    </svg>
  )
}

function Cell({ value }: { value: string | boolean }) {
  if (value === true)
    return (
      <span className="cmp__yes" aria-label="Yes">
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="m4 8.4 2.6 2.6L12 5.6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    )
  if (value === false)
    return (
      <span className="cmp__no" aria-label="No">
        —
      </span>
    )
  return <span className="cmp__text">{value}</span>
}

const HEAD_SWATCH: Record<string, string | null> = {
  Wood: SWATCH_IMG('manhattan-walnut'),
  Aluminium: SWATCH_IMG('meteor-silver'),
  Stone: SWATCH_IMG('yellow-cave'),
  Granite: SWATCH_IMG('star-rock'),
  '3D Profile': null,
}

export default function Performance() {
  const [activeId, setActiveId] = useState(CORES[0].id)
  const active = CORES.find((c) => c.id === activeId) ?? CORES[0]

  return (
    <section className="perf" id="performance" data-nav-theme="dark">
      <div className="container">
        <FadeIn>
          <div className="sec-rule sec-rule--dark">
            <span>
              <b>05/</b> Performance
            </span>
            <span>Resistance and values</span>
          </div>
        </FadeIn>

        <div className="section-intro">
          <RevealText className="h-section" text={'Built to last.\nMeasured, not promised.'} accent={['Measured,']} />
          <FadeIn delay={0.12}>
            <p className="lead">
              Water, fire, impact and sun. Nine built-in properties, four technical cores and the values that matter when
              you specify.
            </p>
          </FadeIn>
        </div>

        <ul className="props">
          {PROPERTIES.map((p, i) => (
            <motion.li
              key={p.id}
              className="props__item"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '0px 0px -8% 0px' }}
              transition={{ type: 'spring', bounce: 0, visualDuration: 0.7, delay: (i % 3) * 0.07 }}
            >
              <span className="props__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d={ICONS[p.id]} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </motion.li>
          ))}
        </ul>

        <div className="cores">
          <div className="cores__head">
            <span className="eyebrow">Technical cores</span>
            <h3 className="h-sub">Choose what is inside.</h3>
          </div>
          <div className="segmented segmented--dark" role="tablist" aria-label="Cores">
            {CORES.map((c) => (
              <button
                key={c.id}
                role="tab"
                aria-selected={c.id === activeId}
                className={c.id === activeId ? 'is-active' : undefined}
                onClick={() => setActiveId(c.id)}
              >
                {c.id === activeId && (
                  <motion.span
                    layoutId="cores-pill"
                    className="segmented__pill"
                    transition={{ type: 'spring', bounce: 0.15, visualDuration: 0.45 }}
                  />
                )}
                <span>{c.code}</span>
              </button>
            ))}
          </div>

          <div className="cores__grid">
            <div className="cores__radar">
              <Radar active={active} />
              <div className="cores__legend">
                <span>
                  <i className="dot dot--active" /> {active.code}
                </span>
                <span>
                  <i className="dot" /> Other cores
                </span>
              </div>
            </div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active.id}
                className="cores__detail"
                role="tabpanel"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ type: 'spring', bounce: 0, visualDuration: 0.4 }}
              >
                <h4>{active.name}</h4>
                <p className="cores__summary">{active.summary}</p>
                <div className="cores__headline">
                  {active.headline.map((h) => (
                    <div key={h.label}>
                      <strong>{h.value}</strong>
                      <span>{h.label}</span>
                    </div>
                  ))}
                </div>
                <table className="cores__table">
                  <tbody>
                    {active.rows.map((row) => (
                      <tr key={row.property}>
                        <th scope="row">{row.property}</th>
                        <td>
                          {row.value}
                          {row.norm && <span className="cores__norm">{row.norm}</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="cores__uses">
                  <span>Best for</span>
                  {active.uses}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="cmp">
          <div className="cores__head">
            <span className="eyebrow">Compare</span>
            <h3 className="h-sub">Which surface is right for you?</h3>
          </div>
          <div className="cmp__scroll">
            <table className="cmp__table">
              <thead>
                <tr>
                  <td />
                  {COMPARE.columns.map((col) => {
                    const family = FAMILIES.find((f) => f.name.startsWith(col.split(' ')[0]))
                    const img = HEAD_SWATCH[col]
                    return (
                      <th key={col} scope="col">
                        {img ? (
                          <i className="cmp__swatch" style={{ backgroundImage: `url(${img})` }} />
                        ) : (
                          <i className="cmp__swatch cmp__swatch--profile">
                            <ProfileSection shape="flute" />
                          </i>
                        )}
                        <span>{col}</span>
                        {family && <small>{family.short}</small>}
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {COMPARE.rows.map((row) => (
                  <tr key={row.label}>
                    <th scope="row">{row.label}</th>
                    {row.values.map((v, i) => (
                      <td key={i}>
                        <Cell value={v} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="perf__note">
          Reference values from manufacturer catalogues and data sheets. * Typical system values, subject to testing for each
          project. Radar scores are a comparative 0 to 10 index. Ask for the data sheet and declaration of performance for your
          batch before specifying.
        </p>
      </div>
    </section>
  )
}
