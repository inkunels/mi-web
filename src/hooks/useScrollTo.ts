import { useCallback } from 'react'
import { useLenis } from 'lenis/react'

export function useScrollTo() {
  const lenis = useLenis()
  return useCallback(
    (href: string) => {
      const target = document.querySelector<HTMLElement>(href)
      if (!target) return
      if (lenis) lenis.scrollTo(target, { offset: -8, duration: 1.6 })
      else target.scrollIntoView({ behavior: 'smooth' })
    },
    [lenis],
  )
}
