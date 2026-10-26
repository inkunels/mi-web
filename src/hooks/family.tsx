import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { FamilyId } from '../data/content'

type FamilyValue = { family: FamilyId; setFamily: (id: FamilyId) => void }

const FamilyContext = createContext<FamilyValue | null>(null)

export function FamilyProvider({ children }: { children: ReactNode }) {
  const [family, setFamily] = useState<FamilyId>('wood')
  const value = useMemo(() => ({ family, setFamily }), [family])
  return <FamilyContext.Provider value={value}>{children}</FamilyContext.Provider>
}

export function useFamily() {
  const ctx = useContext(FamilyContext)
  if (!ctx) throw new Error('useFamily must be used inside FamilyProvider')
  return ctx
}
