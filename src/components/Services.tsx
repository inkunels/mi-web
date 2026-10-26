import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { MAT, SERVICES } from '../data/content'
import { FadeIn, Photo, RevealText } from './ui'

export default function Services() {
  const [open, setOpen] = useState(0)

  return (
    <section className="services" id="services" data-nav-theme="light">
      <div className="container">
        <FadeIn>
          <div className="sec-rule">
            <span>
              <b>07/</b> How we work
            </span>
            <span>From sample to site</span>
          </div>
        </FadeIn>

        <div className="services__grid">
          <div className="services__copy">
            <RevealText className="h-sub" text={'One partner,\nfrom the first sample\nto the last panel.'} accent={['sample']} />
            <FadeIn delay={0.1} className="services__img">
              <Photo id={MAT.geoOffice} alt="Executive office clad in walnut-grain panels with a black stone wall" sizes="(max-width: 960px) 100vw, 40vw" />
            </FadeIn>
          </div>

          <ul className="accordion">
            {SERVICES.map((s, i) => {
              const isOpen = open === i
              return (
                <li key={s.n} className={isOpen ? 'is-open' : undefined}>
                  <button aria-expanded={isOpen} aria-controls={`svc-${s.n}`} onClick={() => setOpen(isOpen ? -1 : i)}>
                    <span className="accordion__n">{s.n}/</span>
                    <span className="accordion__title">{s.title}</span>
                    <span className="accordion__icon" aria-hidden="true">
                      <motion.i animate={{ rotate: isOpen ? 90 : 0, opacity: isOpen ? 0 : 1 }} />
                      <i />
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`svc-${s.n}`}
                        className="accordion__body"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ type: 'spring', bounce: 0, visualDuration: 0.45 }}
                      >
                        <p>{s.text}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}
