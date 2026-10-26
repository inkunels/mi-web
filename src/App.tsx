import { MotionConfig } from 'motion/react'
import { ReactLenis } from 'lenis/react'
import { FamilyProvider } from './hooks/family'
import { SamplesProvider } from './hooks/samples'
import Nav from './components/Nav'
import Hero from './components/Hero'
import Intro from './components/Intro'
import Families from './components/Families'
import Explorer from './components/Explorer'
import Boutique from './components/Boutique'
import Studio from './components/Studio'
import Performance from './components/Performance'
import Projects from './components/Projects'
import FlexStone from './components/FlexStone'
import Services from './components/Services'
import Contact from './components/Contact'
import Footer from './components/Footer'

export default function App() {
  return (
    <MotionConfig reducedMotion="user" transition={{ type: 'spring', bounce: 0, visualDuration: 0.5 }}>
      <ReactLenis root options={{ lerp: 0.11, wheelMultiplier: 0.9 }} />
      <SamplesProvider>
        <FamilyProvider>
          <Nav />
          <main>
            <Hero />
            <Intro />
            <Families />
            <Explorer />
            <FlexStone />
            <Boutique />
            <Studio />
            <Performance />
            <Projects />
            <Services />
            <Contact />
          </main>
          <Footer />
        </FamilyProvider>
      </SamplesProvider>
    </MotionConfig>
  )
}
