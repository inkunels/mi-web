import { FAMILIES, NAV, type FamilyId } from '../data/content'
import { useFamily } from '../hooks/family'
import { useScrollTo } from '../hooks/useScrollTo'
import { Logo } from './ui'
import Wordmark from './Wordmark'

export default function Footer() {
  const scrollTo = useScrollTo()
  const { setFamily } = useFamily()

  const openFamily = (id: FamilyId) => {
    setFamily(id)
    scrollTo('#explorer')
  }

  const link = (href: string, label: string) => (
    <a
      key={href + label}
      href={href}
      onClick={(e) => {
        e.preventDefault()
        scrollTo(href)
      }}
    >
      {label}
    </a>
  )

  return (
    <footer className="footer" data-nav-theme="light">
      <div className="container">
        <div className="footer__top">
          <div className="footer__brand">
            <Logo />
            <p>Premium cladding panels for facades, private residences and luxury retail.</p>
          </div>
          <nav className="footer__cols" aria-label="Footer">
            <div>
              <h3>Materials</h3>
              {FAMILIES.map((f) => (
                <a
                  key={f.id}
                  href="#explorer"
                  onClick={(e) => {
                    e.preventDefault()
                    openFamily(f.id)
                  }}
                >
                  {f.name}
                </a>
              ))}
            </div>
            <div>
              <h3>Explore</h3>
              {NAV.map((n) => link(n.href, n.label))}
            </div>
            <div>
              <h3>Studio</h3>
              {link('#services', 'How we work')}
              {link('#contact', 'Sample box')}
              {link('#contact', 'Contact')}
              <a href="mailto:hello@wallcraftpanels.com">hello@wallcraftpanels.com</a>
            </div>
          </nav>
        </div>

        <Wordmark variant="footer" />

        <div className="footer__bottom">
          <span>© 2026 wallcraftpanels. All rights reserved.</span>
          <span>Reference values only. Always check the data sheet of your batch.</span>
          <button
            className="footer__top-btn"
            onClick={() => scrollTo('#top')}
            aria-label="Back to top"
          >
            Back to top
            <svg viewBox="0 0 12 12" aria-hidden="true">
              <path d="M6 10V2M2.5 5.5 6 2l3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </footer>
  )
}
