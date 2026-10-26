import * as THREE from 'three'
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2.js'
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry.js'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'
import { insideRoom, type Stroke } from './store'

const PIECE = 0.22

function mulberry(seed: number) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function dedupe(strokes: Stroke[]) {
  const seen = new Set<string>()
  const key = (v: THREE.Vector3) => `${v.x.toFixed(2)},${v.y.toFixed(2)},${v.z.toFixed(2)}`
  return strokes.filter((s) => {
    if (s.a.distanceToSquared(s.b) < 1e-6) return false
    const k1 = key(s.a) + '|' + key(s.b)
    const k2 = key(s.b) + '|' + key(s.a)
    if (seen.has(k1) || seen.has(k2)) return false
    seen.add(k1)
    return true
  })
}

function pieces(a: THREE.Vector3, b: THREE.Vector3, out: number[], clip: boolean) {
  const len = a.distanceTo(b)
  const n = Math.max(1, Math.ceil(len / PIECE))
  for (let i = 0; i < n; i++) {
    const t0 = i / n
    const t1 = (i + 1) / n
    const x0 = a.x + (b.x - a.x) * t0
    const y0 = a.y + (b.y - a.y) * t0
    const z0 = a.z + (b.z - a.z) * t0
    const x1 = a.x + (b.x - a.x) * t1
    const y1 = a.y + (b.y - a.y) * t1
    const z1 = a.z + (b.z - a.z) * t1
    if (clip && !insideRoom((x0 + x1) / 2, (z0 + z1) / 2)) continue
    out.push(x0, y0, z0, x1, y1, z1)
  }
}

export function buildSketch(strokes: Stroke[]) {
  const rand = mulberry(3)
  const list = dedupe(strokes)
  list.sort((s1, s2) => {
    if (s1.layer !== s2.layer) return s1.layer - s2.layer
    const m1 = s1.a.x + s1.b.x - (s1.a.z + s1.b.z) * 0.15
    const m2 = s2.a.x + s2.b.x - (s2.a.z + s2.b.z) * 0.15
    return m1 - m2
  })

  const primary: number[] = []
  const secondary: number[] = []
  const fine: number[] = []
  const dir = new THREE.Vector3()
  const a = new THREE.Vector3()
  const b = new THREE.Vector3()
  const jitter = new THREE.Vector3()

  for (const s of list) {
    if (s.fine) {
      pieces(s.a, s.b, fine, !!s.clip)
      continue
    }
    const len = s.a.distanceTo(s.b)
    dir.subVectors(s.b, s.a).normalize()
    const over = len > 0.12 && !s.clip ? Math.min(0.14, 0.03 + len * 0.035) : 0
    a.copy(s.a).addScaledVector(dir, -over * (0.4 + rand() * 0.8))
    b.copy(s.b).addScaledVector(dir, over * (0.4 + rand() * 0.8))
    pieces(a, b, primary, !!s.clip)
    if (len > 0.25) {
      jitter.set(rand() - 0.5, rand() - 0.5, rand() - 0.5).multiplyScalar(0.018)
      a.copy(s.a).add(jitter).addScaledVector(dir, len * (rand() * 0.08))
      b.copy(s.b).add(jitter).addScaledVector(dir, -len * (rand() * 0.08))
      pieces(a, b, secondary, !!s.clip)
    }
  }

  const make = (arr: number[], width: number, opacity: number) => {
    const geo = new LineSegmentsGeometry()
    geo.setPositions(new Float32Array(arr))
    const material = new LineMaterial({
      color: '#2c2722',
      linewidth: width,
      transparent: true,
      opacity,
      depthWrite: false,
      worldUnits: false,
    })
    const obj = new LineSegments2(geo, material)
    obj.renderOrder = 10
    obj.frustumCulled = false
    return { obj, geo, material, total: arr.length / 6, opacity, width }
  }

  const layers = [make(primary, 1.15, 0.92), make(secondary, 0.7, 0.38), make(fine, 0.7, 0.42)]
  const [main, echo, thin] = layers
  const group = new THREE.Group()
  group.add(main.obj, echo.obj, thin.obj)

  return {
    group,
    setDraw(t: number) {
      main.geo.instanceCount = Math.floor(main.total * t)
      thin.geo.instanceCount = Math.floor(thin.total * t)
      echo.geo.instanceCount = Math.floor(echo.total * Math.max(0, t * 1.08 - 0.08))
    },
    setOpacity(o: number) {
      for (const l of layers) l.material.opacity = l.opacity * o
      group.visible = o > 0.004
    },
    setWidth(w: number) {
      for (const l of layers) l.material.linewidth = l.width * w
    },
    setResolution(w: number, h: number) {
      for (const l of layers) l.material.resolution.set(w, h)
    },
    count: main.total + echo.total + thin.total,
  }
}

export type Sketch = ReturnType<typeof buildSketch>
