import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import { useLenis } from 'lenis/react'
import { NAV } from '../data/content'
import { useSamples } from '../hooks/samples'
import { useScrollTo } from '../hooks/useScrollTo'
import { Logo } from './ui'

function activeSection() {
  let active = ''
  for (const item of NAV) {
    const el = document.querySelector<HTMLElement>(item.href)
    if (!el) continue
    const r = el.getBoundingClientRect()
    if (r.top <= window.innerHeight * 0.4 && r.bottom > window.innerHeight * 0.4) active = item.href
  }
  return active
}

export default function Nav() {
  const { scrollY } = useScroll()
  const [active, setActive] = useState('')
  const [open, setOpen] = useState(false)
  const { selected } = useSamples()
  const scrollTo = useScrollTo()
  const lenis = useLenis()

  const update = () => {
    const next = activeSection()
    setActive((a) => (a === next ? a : next))
  }

  useMotionValueEvent(scrollY, 'change', update)
  useEffect(update, [])

  useEffect(() => {
    if (!open) return
    lenis?.stop()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      lenis?.start()
      window.removeEventListener('keydown', onKey)
    }
  }, [open, lenis])

  const go = (href: string) => {
    setOpen(false)
    window.setTimeout(() => scrollTo(href), open ? 260 : 0)
  }

  return (
    <header className={`nav ${open ? 'is-open' : ''}`}>
      <div className="nav__bar">
        <a
          href="#top"
          className="nav__logo"
          aria-label="wallcraftpanels, back to top"
          onClick={(e) => {
            e.preventDefault()
            go('#top')
          }}
        >
          <Logo />
        </a>

        <nav className="nav__links" aria-label="Primary">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={active === item.href ? 'is-active' : undefined}
              aria-current={active === item.href ? 'true' : undefined}
              onClick={(e) => {
                e.preventDefault()
                go(item.href)
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="nav__actions">
          <a
            href="#contact"
            className="nav__samples"
            onClick={(e) => {
              e.preventDefault()
              go('#contact')
            }}
          >
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path
                d="M3.5 6.5 10 3l6.5 3.5v7L10 17l-6.5-3.5v-7Zm0 0L10 10m0 0 6.5-3.5M10 10v7"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
            </svg>
            <span className="nav__samples-label">Sample box</span>
            <AnimatePresence initial={false}>
              {selected.length > 0 && (
                <motion.span
                  key="count"
                  className="nav__count"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: 'spring', bounce: 0.4, visualDuration: 0.35 }}
                >
                  <motion.span key={selected.length} initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                    {selected.length}
                  </motion.span>
                </motion.span>
              )}
            </AnimatePresence>
          </a>
          <a
            href="#contact"
            className="nav__cta"
            onClick={(e) => {
              e.preventDefault()
              go('#contact')
            }}
          >
            Contact
          </a>
          <button
            className="nav__toggle"
            aria-expanded={open}
            aria-controls="nav-sheet"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((o) => !o)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="nav-sheet"
            className="nav__sheet"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: '100svh' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: 'spring', bounce: 0, visualDuration: 0.45 }}
          >
            <nav aria-label="Mobile">
              {[...NAV, { label: 'Contact', href: '#contact' }].map((item, i) => (
                <motion.a
                  key={item.href + item.label}
                  href={item.href}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', bounce: 0, visualDuration: 0.4, delay: 0.08 + i * 0.04 }}
                  onClick={(e) => {
                    e.preventDefault()
                    go(item.href)
                  }}
                >
                  {item.label}
                </motion.a>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
