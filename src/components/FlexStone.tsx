import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import { FLEX } from '../data/mdv'
import { Button, FadeIn, Photo, RevealText } from './ui'

function Band() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const side = useTransform(scrollYProgress, [0.05, 0.42], [7, 0])
  const radius = useTransform(scrollYProgress, [0.05, 0.42], [28, 0])
  const clipPath = useTransform(() => `inset(0% ${side.get()}vw round ${radius.get()}px)`)
  const scale = useTransform(scrollYProgress, [0, 1], [1.16, 1])
  const captionOpacity = useTransform(scrollYProgress, [0.3, 0.45], [0, 1])

  return (
    <div ref={ref} className="flex__band">
      <motion.div className="flex__band-frame" style={{ clipPath }}>
        <motion.img
          src={FLEX.band.src}
          srcSet={FLEX.band.srcSet}
          sizes="100vw"
          alt="Curved villa wall clad in white flexible stone, with tree shadows across the surface"
          loading="lazy"
          decoding="async"
          draggable={false}
          style={{ scale }}
        />
        <motion.span className="flex__band-caption" style={{ opacity: captionOpacity }}>
          {FLEX.bandCaption}
        </motion.span>
      </motion.div>
    </div>
  )
}

export default function FlexStone() {
  return (
    <section className="flex" id="flexible-stone" data-nav-theme="light">
      <div className="container">
        <FadeIn>
          <div className="sec-rule">
            <span>
              <b>03/</b> Flexible stone
            </span>
            <span>Natural stone powder · 2–3 mm</span>
          </div>
        </FadeIn>
        <div className="section-intro">
          <FadeIn>
            <span className="eyebrow">Flexible stone</span>
          </FadeIn>
          <RevealText className="h-section" text={'Stone that bends.'} accent={['bends.']} />
          <FadeIn delay={0.12}>
            <p className="lead">{FLEX.intro}</p>
          </FadeIn>
        </div>
      </div>

      <Band />

      <div className="container">
        <div className="flex__highlights">
          {FLEX.highlights.map((h, i) => (
            <FadeIn key={h.label} delay={i * 0.06} className="flex__highlight">
              <strong>
                {h.value}
                {h.unit && <small>{h.unit}</small>}
              </strong>
              <span>{h.label}</span>
            </FadeIn>
          ))}
        </div>

        <div className="flex__structure">
          <FadeIn className="flex__layers">
            <img
              src={FLEX.layersImage.src}
              alt="Exploded view of a flexible stone sheet: printed stone surface, stone powder layer and fibreglass mesh"
              loading="lazy"
              decoding="async"
              draggable={false}
            />
          </FadeIn>
          <div className="flex__structure-copy">
            <FadeIn>
              <span className="eyebrow">Material structure</span>
            </FadeIn>
            <RevealText as="h3" className="h-sub" text={'Three layers.\nOne stone surface.'} accent={['One']} />
            <ol className="flex__layer-list">
              {FLEX.layers.map((l, i) => (
                <motion.li
                  key={l.n}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '0px 0px -10% 0px' }}
                  transition={{ type: 'spring', bounce: 0, visualDuration: 0.7, delay: 0.08 + i * 0.08 }}
                >
                  <span className="flex__layer-n">{l.n}</span>
                  <span>
                    <strong>{l.title}</strong>
                    <span>{l.text}</span>
                  </span>
                </motion.li>
              ))}
            </ol>
          </div>
        </div>

        <div className="flex__features-head">
          <span className="eyebrow">Performance characteristics</span>
          <RevealText as="h3" className="h-sub" text="Everything stone does. Lighter." accent={['Lighter.']} />
        </div>
        <ul className="flex__features">
          {FLEX.features.map((f, i) => (
            <motion.li
              key={f.n}
              className={`feat feat--${f.size} feat--a${i + 1}`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '0px 0px -8% 0px' }}
              transition={{ type: 'spring', bounce: 0, visualDuration: 0.8, delay: (i % 3) * 0.07 }}
            >
              <div className="feat__img">
                <Photo
                  id={f.pic.src}
                  srcSet={f.pic.srcSet}
                  alt={f.title}
                  sizes={f.size === 'tall' ? '(max-width: 760px) 100vw, 34vw' : '(max-width: 760px) 100vw, 33vw'}
                />
              </div>
              <div className="feat__text">
                <span className="feat__n">{f.n}</span>
                <h4>{f.title}</h4>
                <p>{f.text}</p>
              </div>
            </motion.li>
          ))}
        </ul>

        <div className="flex__specs">
          <div className="flex__specs-head">
            <span className="eyebrow">Technical specifications</span>
            <h3 className="h-sub">Flexible stone, in numbers.</h3>
            <p>Reference values from the manufacturer’s data. Ask our team for the full colour range and samples.</p>
            <Button href="#contact">Request samples</Button>
          </div>
          <dl className="flex__spec-list">
            {FLEX.specs.map((s) => (
              <div key={s.label}>
                <dt>{s.label}</dt>
                <dd>{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
