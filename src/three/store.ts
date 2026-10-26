import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js'
import { archShape, boxUV, curvedSlab, extrudeOutline, lathe, prepare, smoothSideNormals, stadiumPoints } from './geometry'
import { patchMaterial, revealGroup, type RevealGroup } from './patch'
import type { TextureSet } from './textures'

RectAreaLightUniformsLib.init()

export type Stroke = { a: THREE.Vector3; b: THREE.Vector3; layer: number; clip?: boolean; fine?: boolean }

export type GroupKey = 'base' | 'floor' | 'walnut' | 'lama' | 'tacto' | 'stone' | 'soft' | 'detail' | 'lights'

export type Label = { id: string; position: [number, number, number]; title: string; meta?: string; group?: GroupKey }

const H = 4
const PW = 7 / 6
const NY0 = 0.6
const NY1 = 3.0
const LEFT_C = new THREE.Vector2(-3.5, -6.5)
const RIGHT_C = new THREE.Vector2(3.5, -6.5)
const CORNER_R = 2.5

export function insideRoom(x: number, z: number) {
  if (z > 0.02 || z < -9.02 || x < -6.02 || x > 6.02) return false
  if (z < -6.5) {
    if (x < -3.5) return Math.hypot(x - LEFT_C.x, z - LEFT_C.y) <= CORNER_R + 0.02
    if (x > 3.5) return Math.hypot(x - RIGHT_C.x, z - RIGHT_C.y) <= CORNER_R + 0.02
  }
  return true
}

function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function boxProjectUV(geo: THREE.BufferGeometry) {
  const pos = geo.attributes.position as THREE.BufferAttribute
  const nor = geo.attributes.normal as THREE.BufferAttribute
  const uv = new Float32Array(pos.count * 2)
  for (let i = 0; i < pos.count; i++) {
    const nx = Math.abs(nor.getX(i))
    const ny = Math.abs(nor.getY(i))
    const nz = Math.abs(nor.getZ(i))
    if (nx >= ny && nx >= nz) {
      uv[i * 2] = pos.getZ(i)
      uv[i * 2 + 1] = pos.getY(i)
    } else if (ny >= nz) {
      uv[i * 2] = pos.getX(i)
      uv[i * 2 + 1] = pos.getZ(i)
    } else {
      uv[i * 2] = pos.getX(i)
      uv[i * 2 + 1] = pos.getY(i)
    }
  }
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2))
  return geo
}

function scaleUV(geo: THREE.BufferGeometry, su: number, sv: number) {
  const uv = geo.attributes.uv as THREE.BufferAttribute
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * su, uv.getY(i) * sv)
  return geo
}

const tmpQ = new THREE.Quaternion()
const tmpE = new THREE.Euler()
function mat(x: number, y: number, z: number, ry = 0, rx = 0, rz = 0) {
  tmpE.set(rx, ry, rz)
  tmpQ.setFromEuler(tmpE)
  return new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), tmpQ, new THREE.Vector3(1, 1, 1))
}
const I = new THREE.Matrix4()

function makeGroups(): Record<GroupKey, RevealGroup> {
  return {
    base: revealGroup([0, 0, 0], [0, 1, 0], 4.5),
    floor: revealGroup([0, 0, -9], [0, 0, 1], 9),
    walnut: revealGroup([-3.6, 0, -9], [1, 0, 0], 7.4),
    lama: revealGroup([6, 0, 0.2], [0, 0, -1], 9.4),
    tacto: revealGroup([-6, 0, 0.2], [0, 0, -1], 9.4),
    stone: revealGroup([0, 0, 0], [0, 1, 0], 3.2),
    soft: revealGroup([0, 0, 0], [0, 1, 0], 1.3),
    detail: revealGroup([0, 0, 0], [0, 1, 0], 2.4),
    lights: revealGroup([0, 4.5, 0], [0, -1, 0], 0.8),
  }
}

type MatDef = { params: THREE.MeshPhysicalMaterialParameters; group: GroupKey; physical?: boolean; shadow?: boolean; rise?: boolean }

const MAT_DEFS = {
  structure: { params: { color: '#2a2622', roughness: 0.95 }, group: 'walnut' },
  grout: { params: { color: '#6f665c', roughness: 1 }, group: 'floor', rise: false },
  walnut: {
    params: { color: '#6a4a33', roughness: 0.55, clearcoat: 0.32, clearcoatRoughness: 0.32 },
    group: 'walnut',
    physical: true,
  },
  oak: { params: { color: '#b38a5c', roughness: 0.62 }, group: 'lama' },
  felt: { params: { color: '#1d1a17', roughness: 1 }, group: 'lama' },
  white: { params: { color: '#e8e2d9', roughness: 0.6 }, group: 'tacto' },
  stone: { params: { color: '#cdc1b0', roughness: 0.5 }, group: 'stone' },
  floor: { params: { color: '#cfc3b2', roughness: 0.42 }, group: 'floor', rise: false },
  champagne: { params: { color: '#c9b08a', metalness: 1, roughness: 0.3 }, group: 'soft' },
  metal: { params: { color: '#c7cace', metalness: 1, roughness: 0.34 }, group: 'tacto' },
  granite: { params: { color: '#d6d0c6', roughness: 0.36 }, group: 'stone' },
  fabric: {
    params: { color: '#cfc4b3', roughness: 0.95, sheen: 0.7, sheenRoughness: 0.75, sheenColor: '#f3ece0' },
    group: 'soft',
    physical: true,
  },
  plaster: { params: { color: '#eeeae4', roughness: 0.94 }, group: 'base', rise: false },
  plasterInner: { params: { color: '#f1ede7', roughness: 0.9, side: THREE.BackSide }, group: 'base', shadow: false, rise: false },
  brass: { params: { color: '#b89463', metalness: 1, roughness: 0.32 }, group: 'detail' },
  mirror: { params: { color: '#d8d5cf', metalness: 1, roughness: 0.04 }, group: 'detail' },
  ceramicBlack: { params: { color: '#1d1b19', roughness: 0.58 }, group: 'detail' },
  ceramicBone: { params: { color: '#e5dccf', roughness: 0.62 }, group: 'detail' },
  leather: { params: { color: '#5b3420', roughness: 0.42, clearcoat: 0.35, clearcoatRoughness: 0.4 }, group: 'detail', physical: true },
  leatherBlack: { params: { color: '#171513', roughness: 0.4, clearcoat: 0.4, clearcoatRoughness: 0.35 }, group: 'detail', physical: true },
  ivory: { params: { color: '#e6ded0', roughness: 0.96, sheen: 1, sheenRoughness: 0.6, sheenColor: '#ffffff' }, group: 'detail', physical: true },
  sand: { params: { color: '#c7b294', roughness: 0.96, sheen: 1, sheenRoughness: 0.6, sheenColor: '#f2e6d2' }, group: 'detail', physical: true },
  camel: { params: { color: '#9d7249', roughness: 0.96, sheen: 1, sheenRoughness: 0.6, sheenColor: '#e8c9a2' }, group: 'detail', physical: true },
  charcoal: { params: { color: '#383431', roughness: 0.96, sheen: 1, sheenRoughness: 0.6, sheenColor: '#8d8780' }, group: 'detail', physical: true },
  black: { params: { color: '#1a1918', roughness: 0.96, sheen: 1, sheenRoughness: 0.6, sheenColor: '#5d5a56' }, group: 'detail', physical: true },
  olive: { params: { color: '#666049', roughness: 0.96, sheen: 1, sheenRoughness: 0.6, sheenColor: '#bdb594' }, group: 'detail', physical: true },
  paper: { params: { color: '#ddd4c6', roughness: 0.9 }, group: 'detail' },
  lightDiffuser: { params: { color: '#000000', emissive: '#fff0dc', emissiveIntensity: 0 }, group: 'lights', shadow: false, rise: false },
  lightStrip: { params: { color: '#000000', emissive: '#ffd8a6', emissiveIntensity: 0 }, group: 'lights', shadow: false },
  lightDisc: { params: { color: '#000000', emissive: '#ffe2bd', emissiveIntensity: 0 }, group: 'lights', shadow: false, rise: false },
} satisfies Record<string, MatDef>

export type MatKey = keyof typeof MAT_DEFS

type LineOpt = { layer?: number; threshold?: number; proxy?: THREE.BufferGeometry; none?: boolean }

export function buildStore() {
  const rand = mulberry32(11)
  const groups = makeGroups()
  const materials = {} as Record<MatKey, THREE.MeshStandardMaterial>
  for (const key of Object.keys(MAT_DEFS) as MatKey[]) {
    const def: MatDef = MAT_DEFS[key]
    const m = def.physical ? new THREE.MeshPhysicalMaterial(def.params) : new THREE.MeshStandardMaterial(def.params as THREE.MeshStandardMaterialParameters)
    materials[key] = patchMaterial(m, groups[def.group], def.rise !== false)
  }

  const buckets = new Map<MatKey, THREE.BufferGeometry[]>()
  const strokes: Stroke[] = []

  const edgesToStrokes = (geo: THREE.BufferGeometry, matrix: THREE.Matrix4, threshold: number, layer: number) => {
    const edges = new THREE.EdgesGeometry(geo, threshold)
    const p = edges.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < p.count; i += 2) {
      const a = new THREE.Vector3().fromBufferAttribute(p, i).applyMatrix4(matrix)
      const b = new THREE.Vector3().fromBufferAttribute(p, i + 1).applyMatrix4(matrix)
      strokes.push({ a, b, layer })
    }
    edges.dispose()
  }

  const line = (a: [number, number, number], b: [number, number, number], layer: number, clip = false, fine = false) => {
    strokes.push({ a: new THREE.Vector3(...a), b: new THREE.Vector3(...b), layer, clip, fine })
  }

  const ring = (cx: number, y: number, cz: number, r: number, layer: number, segs = 36, a0 = 0, a1 = Math.PI * 2) => {
    for (let i = 0; i < segs; i++) {
      const t0 = a0 + ((a1 - a0) * i) / segs
      const t1 = a0 + ((a1 - a0) * (i + 1)) / segs
      line([cx + Math.cos(t0) * r, y, cz + Math.sin(t0) * r], [cx + Math.cos(t1) * r, y, cz + Math.sin(t1) * r], layer)
    }
  }

  const put = (key: MatKey, geo: THREE.BufferGeometry, matrix: THREE.Matrix4 = I, lines: LineOpt = {}) => {
    if (!lines.none) edgesToStrokes(lines.proxy ?? geo, matrix, lines.threshold ?? 28, lines.layer ?? 3)
    const g = prepare(geo.clone().applyMatrix4(matrix))
    const list = buckets.get(key) ?? []
    list.push(g)
    buckets.set(key, list)
  }

  const caps: THREE.BufferGeometry[] = []
  const capBox = (w: number, d: number, x: number, z: number) => {
    caps.push(prepare(new THREE.BoxGeometry(w, 0.004, d).translate(x, H + 0.004, z)))
  }

  // Structure
  const wallBox = (w: number, h: number, d: number, x: number, y: number, z: number) => {
    put('structure', boxUV(w, h, d), mat(x, y, z), { layer: 0 })
    if (y + h / 2 >= H - 0.001) capBox(w, d, x, z)
  }
  wallBox(0.25, H, 6.75, -6.125, H / 2, -3.125)
  wallBox(0.25, H, 6.75, 6.125, H / 2, -3.125)
  wallBox(0.8, H, 0.25, -5.6, H / 2, 0.125)
  wallBox(0.8, H, 0.25, 5.6, H / 2, 0.125)
  wallBox(3.5 - PW, H, 0.25, -(3.5 + PW) / 2, H / 2, -9.125)
  wallBox(3.5 - PW, H, 0.25, (3.5 + PW) / 2, H / 2, -9.125)
  put('structure', boxUV(2 * PW, NY0, 0.25), mat(0, NY0 / 2, -9.125), { layer: 0 })
  wallBox(2 * PW, H - NY1, 0.25, 0, (H + NY1) / 2, -9.125)
  wallBox(2 * PW + 0.5, H, 0.26, 0, H / 2, -9.65)
  for (const [c, a0, a1] of [
    [LEFT_C, Math.PI, Math.PI * 1.5],
    [RIGHT_C, Math.PI * 1.5, Math.PI * 2],
  ] as const) {
    put('structure', curvedSlab({ cx: c.x, cz: c.y, r0: 2.5, r1: 2.75, a0, a1, y0: 0, y1: H, segments: 36 }), I, { layer: 0 })
    caps.push(prepare(curvedSlab({ cx: c.x, cz: c.y, r0: 2.5, r1: 2.75, a0, a1, y0: H, y1: H + 0.006, segments: 36 })))
  }
  line([-5.2, 0.002, 0.02], [-1.0, 0.002, 0.02], 0)
  line([1.0, 0.002, 0.02], [5.2, 0.002, 0.02], 0)
  line([-5.2, 0.002, 0.07], [-1.0, 0.002, 0.07], 0)
  line([1.0, 0.002, 0.07], [5.2, 0.002, 0.07], 0)
  ring(-1.0, 0.002, 0.05, 1.0, 0, 14, -Math.PI / 2, 0)
  ring(1.0, 0.002, 0.05, 1.0, 0, 14, -Math.PI, -Math.PI / 2)

  // Floor
  for (let ix = 0; ix < 10; ix++) {
    for (let iz = 0; iz < 15; iz++) {
      const x = -6 + 0.6 + ix * 1.2
      const z = -0.3 - iz * 0.6
      if (!insideRoom(x, z) && !insideRoom(x - 0.6, z) && !insideRoom(x + 0.6, z) && !insideRoom(x, z - 0.3)) continue
      put('floor', boxUV(1.196, 0.02, 0.596, rand() * 6, rand() * 6), mat(x, -0.01, z), { none: true })
    }
  }
  put('grout', boxUV(12.4, 0.01, 9.6), mat(0, -0.0125, -4.5), { none: true })
  for (let k = 0; k <= 10; k++) line([-6 + k * 1.2, 0.002, 0.0], [-6 + k * 1.2, 0.002, -9], 1, true, true)
  for (let k = 0; k <= 15; k++) line([-6, 0.002, -k * 0.6], [6, 0.002, -k * 0.6], 1, true, true)

  // Back wall — Grain walnut, sequence matched around the niche
  for (let i = 0; i < 6; i++) {
    const x0 = -3.5 + i * PW + 0.002
    const w = PW - 0.004
    const cx = x0 + w / 2
    const du = i * PW
    if (i === 2 || i === 3) {
      const h0 = NY0 - 0.03
      put('walnut', boxUV(w, h0, 0.02, du, 0.03), mat(cx, 0.03 + h0 / 2, -8.99), { layer: 2 })
      const h1 = H - NY1 - 0.004
      put('walnut', boxUV(w, h1, 0.02, du, NY1 + 0.004), mat(cx, NY1 + 0.004 + h1 / 2, -8.99), { layer: 2 })
    } else {
      put('walnut', boxUV(w, H - 0.03, 0.02, du, 0.03), mat(cx, 0.03 + (H - 0.03) / 2, -8.99), { layer: 2 })
    }
  }

  // Niche lined in travertine
  const nDepth = 0.52
  const nz = -8.98 - nDepth / 2
  put('stone', boxUV(2 * PW, NY1 - NY0, 0.02), mat(0, (NY0 + NY1) / 2, -9.51), { layer: 3 })
  put('stone', boxUV(0.02, NY1 - NY0, nDepth), mat(-PW - 0.01, (NY0 + NY1) / 2, nz), { layer: 3 })
  put('stone', boxUV(0.02, NY1 - NY0, nDepth), mat(PW + 0.01, (NY0 + NY1) / 2, nz), { layer: 3 })
  put('stone', boxUV(2 * PW + 0.04, 0.02, nDepth), mat(0, NY0 - 0.01, nz), { layer: 3 })
  put('stone', boxUV(2 * PW + 0.04, 0.02, nDepth), mat(0, NY1 + 0.01, nz), { layer: 3 })
  for (const y of [1.38, 2.18]) put('stone', boxUV(2 * PW - 0.01, 0.035, nDepth - 0.03), mat(0, y, nz - 0.01), { layer: 3 })
  put('lightStrip', boxUV(2 * PW - 0.12, 0.01, 0.02), mat(0, NY1 - 0.006, -9.03), { none: true })

  // Left wall — Touch Skin-Touch white, straight + curved
  for (let i = 0; i < 5; i++) {
    const z0 = -i * 1.3 - 0.002
    const w = 1.296
    put('white', boxUV(0.02, H - 0.03, w, i * 1.3, 0.03), mat(-5.99, 0.03 + (H - 0.03) / 2, z0 - w / 2), { layer: 2 })
  }
  for (let j = 0; j < 3; j++) {
    const d = Math.PI / 2 / 3
    const g = 0.004 / 2.49
    const a0 = Math.PI + j * d + g / 2
    put(
      'metal',
      curvedSlab({ cx: LEFT_C.x, cz: LEFT_C.y, r0: 2.48, r1: 2.5, a0, a1: a0 + d - g, y0: 0.03, y1: H, segments: 14, du: 6.5 + j * 1.3 }),
      I,
      { layer: 2 },
    )
  }

  // Arched mirror with brass frame
  const mirror = new THREE.ExtrudeGeometry(archShape(1.0, 2.3), { depth: 0.012, bevelEnabled: false, curveSegments: 28 })
  put('mirror', mirror, mat(-5.966, 0.15, -1.6, Math.PI / 2), { layer: 4 })
  const frame = new THREE.ExtrudeGeometry(archShape(1.07, 2.37), { depth: 0.01, bevelEnabled: false, curveSegments: 28 })
  put('brass', frame, mat(-5.976, 0.115, -1.6, Math.PI / 2), { layer: 4 })

  // Right wall — Slat oak slats on acoustic felt
  put('felt', boxUV(0.02, H, 6.75), mat(5.99, H / 2, -3.125), { layer: 2 })
  put('felt', curvedSlab({ cx: RIGHT_C.x, cz: RIGHT_C.y, r0: 2.48, r1: 2.5, a0: Math.PI * 1.5, a1: Math.PI * 2, y0: 0, y1: H, segments: 30 }), I, { layer: 2 })
  const slatH = H - 0.06
  const slat = (m: THREE.Matrix4) => {
    put('oak', boxUV(0.03, slatH, 0.045, rand() * 3, rand() * 2), m, { none: true })
    const a = new THREE.Vector3(-0.0152, -slatH / 2, 0).applyMatrix4(m)
    const b = new THREE.Vector3(-0.0152, slatH / 2, 0).applyMatrix4(m)
    strokes.push({ a, b, layer: 2, fine: true })
  }
  for (let k = 0; k < 86; k++) slat(mat(5.965, 0.03 + slatH / 2, -0.06 - k * 0.075))
  const arcSlats = 52
  for (let k = 0; k < arcSlats; k++) {
    const a = Math.PI * 1.5 + ((k + 0.5) / arcSlats) * (Math.PI / 2)
    const r = 2.48 - 0.015
    slat(mat(RIGHT_C.x + Math.cos(a) * r, 0.03 + slatH / 2, RIGHT_C.y + Math.sin(a) * r, -a))
  }
  for (const y of [0.95, 1.55, 2.15]) put('oak', boxUV(0.45, 0.05, 2.4, rand() * 2, 0), mat(5.725, y, -3.4), { layer: 3 })

  // Ceiling with circular light well
  const ceilingShape = new THREE.Shape()
  ceilingShape.moveTo(-6.3, -9.8)
  ceilingShape.lineTo(6.3, -9.8)
  ceilingShape.lineTo(6.3, 0.3)
  ceilingShape.lineTo(-6.3, 0.3)
  ceilingShape.lineTo(-6.3, -9.8)
  const hole = new THREE.Path()
  hole.absarc(0, -5, 2.3, 0, Math.PI * 2, true)
  ceilingShape.holes.push(hole)
  const ceilingGeo = new THREE.ShapeGeometry(ceilingShape, 64)
  ceilingGeo.rotateX(Math.PI / 2)
  ceilingGeo.translate(0, H, 0)
  put('plaster', ceilingGeo, I, { none: true })
  const well = new THREE.CylinderGeometry(2.3, 2.3, 0.42, 72, 1, true)
  put('plasterInner', well, mat(0, H + 0.21, -5), { none: true })
  const disc = new THREE.CircleGeometry(2.3, 72).rotateX(Math.PI / 2)
  put('lightDiffuser', disc, mat(0, H + 0.4, -5), { none: true })
  put('lightStrip', boxUV(0.05, 0.004, 6.0), mat(5.45, H - 0.003, -3.3), { none: true })
  const downlights: [number, number][] = [
    [-2.35, -8.25],
    [2.35, -8.25],
    [-4.9, -1.6],
    [-4.9, -5.1],
    [3.0, -7.4],
    [-1.5, -1.8],
    [1.5, -1.8],
  ]
  for (const [x, z] of downlights) put('lightDisc', new THREE.CircleGeometry(0.05, 20).rotateX(Math.PI / 2), mat(x, H - 0.004, z), { none: true })

  // Central display table: travertine monolith with walnut top
  const tBase = extrudeOutline(stadiumPoints(2.5, 0.72), 0.76)
  smoothSideNormals(tBase.side)
  put('stone', tBase.side, mat(0, 0, -5), { layer: 3 })
  put('stone', tBase.top, mat(0, 0, -5), { none: true })
  const tTop = extrudeOutline(stadiumPoints(3.0, 1.0), 0.045)
  smoothSideNormals(tTop.side)
  put('walnut', tTop.side, mat(0, 0.76, -5), { layer: 3 })
  put('walnut', tTop.top, mat(0, 0.76, -5), { none: true })
  put('walnut', tTop.bottom, mat(0, 0.76, -5), { none: true })
  for (const [x, z] of [
    [-1.0, -0.5],
    [1.0, -0.5],
    [-1.0, 0.5],
    [1.0, 0.5],
    [-1.5, 0],
    [1.5, 0],
  ]) {
    line([x, 0.76, -5 + z], [x, 0.805, -5 + z], 3)
  }
  for (const [x, z] of [
    [-0.89, -0.36],
    [0.89, -0.36],
    [-0.89, 0.36],
    [0.89, 0.36],
    [-1.25, 0],
    [1.25, 0],
  ]) {
    line([x, 0, -5 + z], [x, 0.76, -5 + z], 3)
  }

  const rounded = (w: number, h: number, d: number, r = 0.02) => boxProjectUV(new RoundedBoxGeometry(w, h, d, 3, r))
  const proxy = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d)
  const folded = (key: MatKey, x: number, y: number, z: number, ry: number) =>
    put(key, rounded(0.38, 0.055, 0.3, 0.02), mat(x, y + 0.0275, z, ry), { layer: 4, proxy: proxy(0.38, 0.055, 0.3) })

  const top = 0.805
  folded('ivory', -0.85, top, -5.1, 0.04)
  folded('ivory', -0.85, top + 0.056, -5.1, -0.03)
  folded('sand', -0.85, top + 0.112, -5.1, 0.06)
  folded('camel', -0.32, top, -4.86, -0.12)
  folded('camel', -0.32, top + 0.056, -4.86, -0.08)
  put('leather', rounded(0.36, 0.26, 0.13, 0.025), mat(0.52, top + 0.13, -5.05, 0.22), { layer: 4, proxy: proxy(0.36, 0.26, 0.13) })
  const handle = new THREE.TorusGeometry(0.1, 0.007, 10, 32, Math.PI)
  put('leather', handle, mat(0.52, top + 0.26, -5.05, 0.22), { layer: 4, threshold: 60 })
  put('paper', rounded(0.24, 0.03, 0.32, 0.004), mat(0.12, top + 0.015, -5.28, 0.3), { layer: 4, proxy: proxy(0.24, 0.03, 0.32) })
  put('paper', rounded(0.22, 0.025, 0.3, 0.004), mat(0.13, top + 0.043, -5.27, 0.18), { layer: 4, proxy: proxy(0.22, 0.025, 0.3) })

  const vaseTall: [number, number][] = [
    [0.001, 0],
    [0.07, 0],
    [0.095, 0.03],
    [0.115, 0.14],
    [0.1, 0.26],
    [0.06, 0.34],
    [0.045, 0.39],
    [0.052, 0.41],
  ]
  const vaseRound: [number, number][] = [
    [0.001, 0],
    [0.06, 0],
    [0.13, 0.06],
    [0.155, 0.15],
    [0.12, 0.25],
    [0.06, 0.29],
    [0.058, 0.31],
  ]
  const vase = (key: MatKey, profile: [number, number][], x: number, y: number, z: number, s = 1) => {
    const p = profile.map(([r, h]) => [r * s, h * s] as [number, number])
    put(key, lathe(p, 48), mat(x, y, z), { none: true })
    const maxR = Math.max(...p.map(([r]) => r))
    const topY = p[p.length - 1][1]
    ring(x, y + topY, z, p[p.length - 1][0], 4, 16)
    for (const side of [-1, 1]) {
      for (let i = 0; i < p.length - 1; i++) {
        line([x + side * p[i][0], y + p[i][1], z], [x + side * p[i + 1][0], y + p[i + 1][1], z], 4)
      }
    }
    return maxR
  }
  vase('ceramicBone', vaseTall, 1.05, top, -5.15, 1.05)
  for (let b = 0; b < 3; b++) {
    const branch = new THREE.CylinderGeometry(0.003, 0.005, 0.55 + b * 0.12, 6)
    put('ceramicBlack', branch, mat(1.05 + (b - 1) * 0.03, top + 0.62 + b * 0.05, -5.15, 0, (b - 1) * 0.22, (b - 1) * 0.18), { none: true })
  }

  // Plinths and sculptural vessels
  const plinth = (x: number, z: number, r: number, h: number) => {
    const g = scaleUV(new THREE.CylinderGeometry(r, r, h, 56), Math.PI * 2 * r, h)
    put('granite', g, mat(x, h / 2, z), { none: true })
    ring(x, h, z, r, 3, 28)
    ring(x, 0.002, z, r, 3, 28)
    line([x - r, 0, z], [x - r, h, z], 3)
    line([x + r, 0, z], [x + r, h, z], 3)
  }
  plinth(-2.45, -7.0, 0.3, 0.95)
  plinth(-1.75, -7.65, 0.24, 0.6)
  vase('ceramicBlack', vaseTall, -2.45, 0.95, -7.0, 1.15)
  put('ceramicBone', new THREE.SphereGeometry(0.15, 40, 24), mat(-1.75, 0.6 + 0.15, -7.65), { none: true })
  ring(-1.75, 0.75, -7.65, 0.15, 4, 20)

  // Niche objects
  put('leatherBlack', rounded(0.34, 0.24, 0.12, 0.022), mat(-0.48, 1.38 + 0.0175 + 0.12, -9.24, 0.15), { layer: 4, proxy: proxy(0.34, 0.24, 0.12) })
  put('leatherBlack', new THREE.TorusGeometry(0.09, 0.006, 10, 28, Math.PI), mat(-0.48, 1.38 + 0.0175 + 0.24, -9.24, 0.15), { layer: 4, threshold: 60 })
  vase('ceramicBone', vaseRound, 0.5, 1.38 + 0.0175, -9.25, 1)
  vase('ceramicBlack', vaseTall, -0.32, 2.18 + 0.0175, -9.25, 0.9)
  vase('ceramicBone', vaseTall, 0.3, 2.18 + 0.0175, -9.27, 0.75)
  put('stone', new THREE.SphereGeometry(0.17, 40, 24), mat(0.05, NY0 + 0.17, -9.24), { none: true })
  ring(0.05, NY0 + 0.17, -9.24, 0.17, 4, 20)

  // Upholstered bench
  put('structure', boxUV(0.4, 0.06, 1.55), mat(-3.4, 0.03, -2.9), { layer: 3 })
  put('fabric', rounded(0.5, 0.38, 1.7, 0.05), mat(-3.4, 0.06 + 0.19, -2.9), { layer: 3, proxy: proxy(0.5, 0.38, 1.7) })

  // Garment rail hung from the ceiling
  const rail = new THREE.CylinderGeometry(0.012, 0.012, 2.5, 16).rotateX(Math.PI / 2)
  put('brass', rail, mat(-5.45, 1.78, -5.15), { none: true })
  line([-5.45, 1.78, -3.9], [-5.45, 1.78, -6.4], 4)
  for (const z of [-4.0, -6.3]) {
    put('brass', new THREE.CylinderGeometry(0.006, 0.006, H - 1.78, 8), mat(-5.45, 1.78 + (H - 1.78) / 2, z), { none: true })
    line([-5.45, 1.78, z], [-5.45, H, z], 4)
  }
  const palette: MatKey[] = ['ivory', 'sand', 'camel', 'charcoal', 'black', 'ivory', 'camel', 'olive']
  const heights = [1.05, 0.98, 1.1, 0.95, 1.12, 1.0, 1.08, 0.92]
  for (let i = 0; i < 8; i++) {
    const z = -4.18 - i * 0.27
    const h = heights[i]
    const ry = (rand() - 0.5) * 0.08
    put(palette[i], rounded(0.5, h, 0.05, 0.022), mat(-5.45, 1.72 - h / 2, z, ry), { layer: 4, proxy: proxy(0.5, h, 0.05) })
    put('ceramicBlack', boxUV(0.42, 0.01, 0.012), mat(-5.45, 1.735, z, ry), { none: true })
  }

  // Cash desk — Relief fluted front with travertine top
  const desk = extrudeOutline(stadiumPoints(2.0, 0.62), 1.0, 1)
  smoothSideNormals(desk.side)
  put('champagne', desk.side, mat(3.0, 0, -7.55), { layer: 3 })
  const deskTop = extrudeOutline(stadiumPoints(2.08, 0.7), 0.04)
  smoothSideNormals(deskTop.side)
  put('granite', deskTop.side, mat(3.0, 1.0, -7.55), { layer: 3 })
  put('granite', deskTop.top, mat(3.0, 1.0, -7.55), { none: true })
  for (const [x, z] of [
    [-0.69, -0.31],
    [0.69, -0.31],
    [-0.69, 0.31],
    [0.69, 0.31],
    [-1.0, 0],
    [1.0, 0],
  ]) {
    line([3.0 + x, 0, -7.55 + z], [3.0 + x, 1.0, -7.55 + z], 3)
  }
  vase('ceramicBone', vaseRound, 3.5, 1.04, -7.62, 0.7)
  put('paper', rounded(0.22, 0.02, 0.3, 0.004), mat(2.5, 1.05, -7.6, -0.2), { layer: 4, proxy: proxy(0.22, 0.02, 0.3) })

  // Shelf objects on the slatted wall
  folded('ivory', 5.72, 0.975, -2.7, 0.0)
  folded('ivory', 5.72, 1.031, -2.7, 0.02)
  folded('charcoal', 5.72, 0.975, -3.25, -0.02)
  folded('sand', 5.72, 0.975, -3.8, 0.03)
  put('leather', rounded(0.32, 0.24, 0.12, 0.022), mat(5.72, 1.575 + 0.12, -2.8, Math.PI / 2 + 0.1), { layer: 4, proxy: proxy(0.32, 0.24, 0.12) })
  folded('camel', 5.72, 1.575, -3.7, 0.02)
  folded('black', 5.72, 1.575 + 0.056, -3.7, -0.03)
  vase('ceramicBlack', vaseRound, 5.72, 2.175, -2.85, 0.8)
  vase('ceramicBone', vaseTall, 5.72, 2.175, -3.95, 0.8)

  // Merge into one mesh per material
  const root = new THREE.Group()
  root.name = 'wallcraft-store'
  const meshes = {} as Partial<Record<MatKey, THREE.Mesh>>
  for (const [key, list] of buckets) {
    const merged = mergeGeometries(list, false)
    if (!merged) continue
    merged.computeBoundingSphere()
    const mesh = new THREE.Mesh(merged, materials[key])
    const def: MatDef = MAT_DEFS[key]
    mesh.castShadow = def.shadow !== false && key !== 'floor' && key !== 'grout' && key !== 'plaster'
    mesh.receiveShadow = true
    mesh.name = key
    meshes[key] = mesh
    root.add(mesh)
    list.forEach((g) => g.dispose())
  }

  const capMaterial = new THREE.MeshBasicMaterial({ color: '#2b2620', transparent: true, opacity: 1, depthWrite: false })
  const capMesh = new THREE.Mesh(mergeGeometries(caps, false)!, capMaterial)
  capMesh.renderOrder = 20
  root.add(capMesh)

  // Lights
  const warm = new THREE.Color('#ffd7ad')
  const warmSoft = new THREE.Color('#ffe4c4')

  const day = new THREE.DirectionalLight('#fff6ea', 0)
  day.position.set(-7, 10, 13)
  day.target.position.set(0, 0, -5)
  day.castShadow = true
  day.shadow.mapSize.set(2048, 2048)
  day.shadow.camera.left = -11
  day.shadow.camera.right = 11
  day.shadow.camera.top = 11
  day.shadow.camera.bottom = -11
  day.shadow.camera.near = 2
  day.shadow.camera.far = 45
  day.shadow.bias = -0.0004
  day.shadow.normalBias = 0.03
  day.shadow.radius = 5
  root.add(day, day.target)

  const hemi = new THREE.HemisphereLight('#f6f1ea', '#8a7d70', 0)
  root.add(hemi)

  const wellSpot = new THREE.SpotLight(warmSoft, 0, 0, 0.92, 1, 2)
  wellSpot.position.set(0, H + 0.36, -5)
  wellSpot.target.position.set(0, 0, -5)
  wellSpot.castShadow = true
  wellSpot.shadow.mapSize.set(2048, 2048)
  wellSpot.shadow.bias = -0.0003
  wellSpot.shadow.normalBias = 0.025
  wellSpot.shadow.radius = 6
  wellSpot.shadow.camera.near = 0.2
  wellSpot.shadow.camera.far = 12
  root.add(wellSpot, wellSpot.target)

  const wellArea = new THREE.RectAreaLight(warmSoft, 0, 3.2, 3.2)
  wellArea.position.set(0, H + 0.3, -5)
  wellArea.rotation.x = -Math.PI / 2
  root.add(wellArea)

  const spot = (x: number, y: number, z: number, tx: number, ty: number, tz: number, angle: number, penumbra: number) => {
    const s = new THREE.SpotLight(warm, 0, 0, angle, penumbra, 2)
    s.position.set(x, y, z)
    s.target.position.set(tx, ty, tz)
    root.add(s, s.target)
    return s
  }
  const washers = [spot(-2.35, H - 0.05, -8.25, -2.35, 1.2, -9.0, 0.5, 0.75), spot(2.35, H - 0.05, -8.25, 2.35, 1.2, -9.0, 0.5, 0.75)]
  const accents = [
    spot(-4.9, H - 0.05, -1.6, -4.4, 0, -2.4, 0.62, 0.9),
    spot(-4.9, H - 0.05, -5.1, -5.6, 0.8, -5.1, 0.6, 0.9),
    spot(3.0, H - 0.05, -7.4, 3.0, 1.0, -7.55, 0.55, 0.9),
    spot(-1.5, H - 0.05, -1.8, -1.2, 0, -2.6, 0.7, 0.95),
    spot(1.5, H - 0.05, -1.8, 1.2, 0, -2.6, 0.7, 0.95),
  ]

  const slot = new THREE.RectAreaLight(warm, 0, 0.12, 6.0)
  slot.position.set(5.45, H - 0.02, -3.3)
  slot.rotation.x = -Math.PI / 2
  root.add(slot)

  const niche = new THREE.RectAreaLight(warm, 0, 2.2, 0.3)
  niche.position.set(0, NY1 - 0.03, -9.2)
  niche.rotation.x = -Math.PI / 2
  root.add(niche)

  const bounce = new THREE.RectAreaLight('#f3dcc0', 0, 9, 7)
  bounce.position.set(0, 0.05, -4.6)
  bounce.rotation.x = Math.PI / 2
  root.add(bounce)

  const lights = { day, hemi, wellSpot, wellArea, washers, accents, slot, niche, bounce }

  // Soft shaft of light falling from the light well (light and render stages)
  const shaftHeight = H + 0.35
  const shaftMaterial = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { uIntensity: { value: 0 }, uColor: { value: new THREE.Color('#ffe3c2') } },
    vertexShader: /* glsl */ `
      varying vec3 vWorld;
      varying vec3 vNormalW;
      varying float vH;
      void main() {
        vec4 w = modelMatrix * vec4(position, 1.0);
        vWorld = w.xyz;
        vNormalW = normalize(mat3(modelMatrix) * normal);
        vH = uv.y;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uIntensity;
      uniform vec3 uColor;
      varying vec3 vWorld;
      varying vec3 vNormalW;
      varying float vH;
      void main() {
        vec3 v = normalize(cameraPosition - vWorld);
        float facing = pow(abs(dot(v, normalize(vNormalW))), 1.7);
        float ang = atan(vWorld.z + 5.0, vWorld.x);
        float streaks = 0.78 + 0.22 * sin(ang * 23.0 + vH * 3.0) * sin(ang * 7.0 - 1.3);
        float fade = smoothstep(0.02, 0.9, vH) * (0.5 + 0.5 * vH);
        gl_FragColor = vec4(uColor, facing * fade * streaks * uIntensity);
      }`,
  })
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.75, shaftHeight, 96, 1, true), shaftMaterial)
  shaft.position.set(0, shaftHeight / 2, -5)
  shaft.renderOrder = 6
  shaft.visible = false
  root.add(shaft)

  const planLabels: Label[] = [
    { id: 'entrance', position: [0, 0.01, 0.75], title: 'Entrance', meta: 'Shopfront 10.4 m' },
    { id: 'table', position: [0, 0.82, -5], title: 'Display table', meta: 'Travertine · walnut' },
    { id: 'niche', position: [0, 0.6, -9.55], title: 'Display niche' },
    { id: 'desk', position: [3.0, 1.0, -7.55], title: 'Cash desk' },
    { id: 'slats', position: [5.2, 0.01, -3.3], title: 'Slatted wall' },
    { id: 'curve', position: [-4.5, 0.01, -7.8], title: 'Curved wall' },
    { id: 'mirror', position: [-5.2, 0.01, -1.6], title: 'Mirror · bench' },
    { id: 'w', position: [0, 0.01, 2.15], title: '12.00 m', meta: 'width' },
    { id: 'd', position: [-6.9, 0.01, -4.5], title: '9.00 m', meta: 'depth' },
  ]

  const materialLabels: Label[] = [
    { id: 'grain', position: [2.6, 2.75, -8.97], title: 'WOOD · Manhattan Walnut', meta: 'LPSW1161 · on CORE C 8 mm', group: 'walnut' },
    { id: 'slat', position: [5.94, 2.9, -1.2], title: '3D PROFILE · ELP14014', meta: '149 × 14 mm flutes · 3000 mm lengths', group: 'lama' },
    { id: 'curve', position: [-5.25, 2.7, -8.25], title: 'ALUMINIUM · Meteor Silver', meta: 'LPMG10017 · wrapped on R 2500 mm', group: 'tacto' },
    { id: 'relief', position: [3.0, 0.55, -7.24], title: 'ALUMINIUM · Laser Gold', meta: 'LPMG10009 · fluted cash desk', group: 'soft' },
    { id: 'granite', position: [-2.45, 0.6, -6.69], title: 'GRANITE · Daisur White', meta: 'IT-LL15 · plinths and counter top', group: 'stone' },
    { id: 'fabric', position: [-3.15, 0.46, -2.4], title: 'CLOTH · Woven texture', meta: 'Upholstered bench', group: 'soft' },
    { id: 'stone', position: [1.2, 0.79, -4.62], title: 'STONE · Yellow Cave', meta: 'LPSS4391 · monolithic table and floor', group: 'stone' },
  ]

  const applyTextures = (t: TextureSet) => {
    const setMaps = (
      m: THREE.MeshStandardMaterial,
      src: { map: THREE.Texture; normalMap: THREE.Texture; roughnessMap: THREE.Texture },
      repeat: [number, number],
      normalScale: number,
      roughness: number,
    ) => {
      const map = src.map.clone()
      const normalMap = src.normalMap.clone()
      const roughnessMap = src.roughnessMap.clone()
      for (const tex of [map, normalMap, roughnessMap]) {
        tex.repeat.set(repeat[0], repeat[1])
        tex.needsUpdate = true
      }
      m.map = map
      m.normalMap = normalMap
      m.normalScale.set(normalScale, normalScale)
      m.roughnessMap = roughnessMap
      m.roughness = roughness
      m.color.set('#ffffff')
      m.needsUpdate = true
    }
    setMaps(materials.walnut, t.walnut, [1 / 1.25, 1 / 2.6], 0.55, 1.0)
    setMaps(materials.oak, t.oak, [1 / 0.7, 1 / 2.2], 0.45, 1.05)
    setMaps(materials.stone, t.stone, [1 / 1.1, 1 / 1.1], 0.4, 1.0)
    setMaps(materials.floor, t.stone, [1 / 1.5, 1 / 1.5], 0.3, 0.72)
    setMaps(materials.fabric, t.fabric, [1 / 0.22, 1 / 0.22], 0.9, 1.0)
    materials.white.color.set('#ebe6de')
    const flute = t.flute.clone()
    flute.repeat.set(1 / 0.035, 1)
    flute.needsUpdate = true
    materials.champagne.normalMap = flute
    materials.champagne.normalScale.set(1.0, 1.0)
    const champagneRough = t.brushed.roughnessMap.clone()
    champagneRough.repeat.set(1 / 0.4, 1)
    champagneRough.needsUpdate = true
    materials.champagne.roughnessMap = champagneRough
    materials.champagne.roughness = 0.9
    materials.champagne.needsUpdate = true

    const brushedNormal = t.brushed.normalMap.clone()
    const brushedRough = t.brushed.roughnessMap.clone()
    for (const tex of [brushedNormal, brushedRough]) {
      tex.repeat.set(1 / 0.5, 1)
      tex.needsUpdate = true
    }
    materials.metal.normalMap = brushedNormal
    materials.metal.normalScale.set(0.35, 0.35)
    materials.metal.roughnessMap = brushedRough
    materials.metal.roughness = 0.95
    materials.metal.needsUpdate = true

    setMaps(materials.granite, t.granite, [1 / 0.9, 1 / 0.9], 0.35, 0.85)
  }

  return { root, groups, materials, meshes, strokes, capMaterial, lights, shaft, planLabels, materialLabels, applyTextures, height: H }
}

export type StoreBuild = ReturnType<typeof buildStore>
