import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

export const MAX_SAMPLES = 6

type SamplesValue = {
  selected: string[]
  toggle: (id: string) => void
  remove: (id: string) => void
  isFull: boolean
}

const SamplesContext = createContext<SamplesValue | null>(null)

export function SamplesProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<string[]>([])

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((s) => s !== id)
      if (prev.length >= MAX_SAMPLES) return prev
      return [...prev, id]
    })
  }, [])

  const remove = useCallback((id: string) => {
    setSelected((prev) => prev.filter((s) => s !== id))
  }, [])

  const value = useMemo(
    () => ({ selected, toggle, remove, isFull: selected.length >= MAX_SAMPLES }),
    [selected, toggle, remove],
  )

  return <SamplesContext.Provider value={value}>{children}</SamplesContext.Provider>
}

export function useSamples() {
  const ctx = useContext(SamplesContext)
  if (!ctx) throw new Error('useSamples must be used inside SamplesProvider')
  return ctx
}
