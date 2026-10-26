import type { Profile, SampleItem } from '../data/content'

const W = 120
const BASE = 26

function surface(shape: Profile['shape']) {
  const pts: string[] = []
  const step = (n: number, fn: (t: number) => number) => {
    for (let i = 0; i <= n; i++) {
      const x = (i / n) * W
      pts.push(`${x.toFixed(2)},${fn(x).toFixed(2)}`)
    }
  }
  switch (shape) {
    case 'flute':
      step(240, (x) => {
        const p = (x % 15) / 15
        return 8 + Math.sin(p * Math.PI) * 6
      })
      break
    case 'round':
      step(240, (x) => {
        const p = (x % 17) / 17
        return 14 - Math.sin(p * Math.PI) * 8
      })
      break
    case 'wave':
      step(240, (x) => 11 + Math.sin((x / W) * Math.PI * 8) * 3.2)
      break
    case 'rib':
      step(240, (x) => ((x % 24) / 24 < 0.55 ? 4 : 14))
      break
    case 'scoop':
      step(120, (x) => 6 + Math.sin((x / W) * Math.PI) * 13)
      break
    default:
      step(4, () => 12)
  }
  return pts
}

export function ProfileSection({ shape, className }: { shape: Profile['shape']; className?: string }) {
  const top = surface(shape)
  const d = `M0,${BASE} L${top.join(' L')} L${W},${BASE} Z`
  return (
    <svg className={`profile-section ${className ?? ''}`} viewBox={`-2 0 ${W + 4} 30`} aria-hidden="true">
      <path d={d} className="profile-section__body" strokeWidth="0.8" strokeLinejoin="round" />
    </svg>
  )
}

export function SampleThumb({ item, className }: { item: SampleItem; className?: string }) {
  if (item.texture) {
    return <i className={`sample-thumb ${className ?? ''}`} style={{ backgroundImage: `url(${item.texture})` }} />
  }
  return (
    <i className={`sample-thumb sample-thumb--profile ${className ?? ''}`}>
      <ProfileSection shape={item.shape ?? 'flute'} />
    </i>
  )
}
