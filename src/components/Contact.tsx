import { useEffect, useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { FAMILIES, SAMPLE_INDEX } from '../data/content'
import { MAX_SAMPLES, useSamples } from '../hooks/samples'
import { useScrollTo } from '../hooks/useScrollTo'
import { SampleThumb } from './Material'
import { FadeIn, RevealText } from './ui'

const TYPES = ['Retail', 'Residential', 'Facade', 'Hospitality']
const SCALES = ['< 100 m²', '100 – 500 m²', '500 – 2,000 m²', '> 2,000 m²']

const shopifyContact = typeof document !== 'undefined' ? document.getElementById('root')?.dataset.shopifyContact : undefined

function ChoiceGroup({
  name,
  field,
  options,
  value,
  onChange,
}: {
  name: string
  field: string
  options: string[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="choices" role="radiogroup" aria-label={name}>
      {options.map((o) => (
        <label key={o} className={`choice ${value === o ? 'is-active' : ''}`}>
          <input type="radio" name={field} value={o} checked={value === o} onChange={() => onChange(o)} />
          {value === o && (
            <motion.span
              layoutId={`choice-${name}`}
              className="choice__pill"
              transition={{ type: 'spring', bounce: 0.15, visualDuration: 0.4 }}
            />
          )}
          <span className="choice__text">{o}</span>
        </label>
      ))}
    </div>
  )
}

function SampleBox() {
  const { selected, remove } = useSamples()
  const scrollTo = useScrollTo()
  const items = selected.map((id) => SAMPLE_INDEX[id]).filter(Boolean)
  const empty = Math.max(0, MAX_SAMPLES - items.length)

  return (
    <div className="samplebox">
      <div className="samplebox__head">
        <span className="samplebox__title">Your sample box</span>
        <span className="samplebox__count">
          {items.length} / {MAX_SAMPLES}
        </span>
      </div>
      <ul className="samplebox__grid">
        <AnimatePresence initial={false}>
          {items.map((s) => (
            <motion.li
              layout
              key={s.id}
              className="samplebox__item"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ type: 'spring', bounce: 0.2, visualDuration: 0.4 }}
            >
              <SampleThumb item={s} />
              <span className="samplebox__name">{s.name}</span>
              <span className="samplebox__code">{s.code}</span>
              <button className="samplebox__remove" onClick={() => remove(s.id)} aria-label={`Remove ${s.name} ${s.code}`}>
                <svg viewBox="0 0 12 12" aria-hidden="true">
                  <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
        {Array.from({ length: empty }, (_, i) => (
          <motion.li layout key={`empty-${i}`} className="samplebox__item samplebox__item--empty">
            <button onClick={() => scrollTo('#explorer')} aria-label="Choose a finish in the collection">
              <span aria-hidden="true">+</span>
            </button>
          </motion.li>
        ))}
      </ul>
      <p className="samplebox__note">
        {items.length === 0
          ? 'Your box is empty. Add finishes from the collection or the boutique and they will appear here.'
          : 'Each sample ships with the data sheet of its finish.'}
      </p>
    </div>
  )
}

export default function Contact() {
  const { selected } = useSamples()
  const [type, setType] = useState(TYPES[0])
  const [scale, setScale] = useState(SCALES[1])
  const [families, setFamilies] = useState<string[]>([])
  const [sent, setSent] = useState(() => typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('contact_posted'))
  const picked = selected.map((id) => SAMPLE_INDEX[id]).filter(Boolean)

  useEffect(() => {
    if (!sent || !shopifyContact) return
    const timer = window.setTimeout(() => document.getElementById('contact')?.scrollIntoView(), 400)
    return () => window.clearTimeout(timer)
  }, [sent])

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    if (shopifyContact) return
    e.preventDefault()
    setSent(true)
  }

  const toggleFamily = (name: string) =>
    setFamilies((list) => (list.includes(name) ? list.filter((n) => n !== name) : [...list, name]))

  return (
    <section className="contact" id="contact" data-nav-theme="light">
      <div className="container">
        <FadeIn>
          <div className="sec-rule">
            <span>
              <b>08/</b> Contact
            </span>
            <span>Samples and project enquiries</span>
          </div>
        </FadeIn>

        <div className="contact__grid">
          <div className="contact__intro">
            <RevealText className="h-section" text={'Touch it\nbefore you\nspecify it.'} accent={['Touch']} />
            <FadeIn delay={0.12}>
              <p className="lead">
                Tell us about your space and we will send a curated box of samples with a material proposal.
              </p>
            </FadeIn>
            <FadeIn delay={0.18}>
              <SampleBox />
            </FadeIn>
            <dl className="contact__info">
              <div>
                <dt>Email</dt>
                <dd>
                  <a href="mailto:hello@wallcraftpanels.com">hello@wallcraftpanels.com</a>
                </dd>
              </div>
              <div>
                <dt>Showroom</dt>
                <dd>Visits by appointment</dd>
              </div>
              <div>
                <dt>Studio support</dt>
                <dd>Mon – Fri · 9:00 – 18:00</dd>
              </div>
            </dl>
          </div>

          <div className="contact__card">
            <AnimatePresence mode="wait" initial={false}>
              {sent ? (
                <motion.div
                  key="sent"
                  className="contact__sent"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: 'spring', bounce: 0, visualDuration: 0.5 }}
                >
                  <span className="contact__sent-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24">
                      <path d="m6 12.5 4 4 8-9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <h3>{shopifyContact ? 'Request sent.' : 'Request ready.'}</h3>
                  <p>Thank you. We will be in touch to coordinate your proposal and sample delivery.</p>
                  <button className="btn btn--ghost" onClick={() => setSent(false)}>
                    Send another request
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  className="form"
                  method="post"
                  action={shopifyContact}
                  acceptCharset="UTF-8"
                  onSubmit={onSubmit}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <input type="hidden" name="form_type" value="contact" />
                  <input type="hidden" name="utf8" value="✓" />
                  <input type="hidden" name="contact[samples]" value={picked.map((s) => `${s.name} (${s.code})`).join(', ')} />
                  <input type="hidden" name="contact[families]" value={families.join(', ')} />
                  <div className="form__row">
                    <label className="field">
                      <span>Full name</span>
                      <input name="contact[name]" required autoComplete="name" placeholder="Your name" />
                    </label>
                    <label className="field">
                      <span>Studio or company</span>
                      <input name="contact[company]" autoComplete="organization" placeholder="Optional" />
                    </label>
                  </div>
                  <div className="form__row">
                    <label className="field">
                      <span>Email</span>
                      <input name="contact[email]" type="email" required autoComplete="email" placeholder="name@studio.com" />
                    </label>
                    <label className="field">
                      <span>Phone</span>
                      <input name="contact[phone]" type="tel" autoComplete="tel" placeholder="Optional" />
                    </label>
                  </div>
                  <div className="field">
                    <span>Project type</span>
                    <ChoiceGroup name="Project type" field="contact[project_type]" options={TYPES} value={type} onChange={setType} />
                  </div>
                  <div className="field">
                    <span>Materials of interest</span>
                    <div className="tags" role="group" aria-label="Materials of interest">
                      {FAMILIES.map((f) => {
                        const on = families.includes(f.name)
                        return (
                          <button type="button" key={f.id} className={on ? 'is-on' : undefined} aria-pressed={on} onClick={() => toggleFamily(f.name)}>
                            {f.name}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  <div className="field">
                    <span>Approximate area</span>
                    <ChoiceGroup name="Approximate area" field="contact[area]" options={SCALES} value={scale} onChange={setScale} />
                  </div>
                  <label className="field">
                    <span>Message</span>
                    <textarea name="contact[body]" rows={3} placeholder="Location, timeline and what you imagine for the space" />
                  </label>
                  <div className="form__foot">
                    <span className="form__samples">
                      {picked.length > 0
                        ? `${picked.length} sample${picked.length > 1 ? 's' : ''} in your box`
                        : 'No samples selected yet'}
                    </span>
                    <button type="submit" className="btn btn--metal">
                      <span className="btn__roll">
                        <span>Send request</span>
                        <span aria-hidden="true">Send request</span>
                      </span>
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
