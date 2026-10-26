import * as THREE from 'three'

export function boxUV(w: number, h: number, d: number, du = 0, dv = 0) {
  const geo = new THREE.BoxGeometry(w, h, d)
  const uv = geo.attributes.uv as THREE.BufferAttribute
  const faces: [number, number][] = [
    [d, h],
    [d, h],
    [w, d],
    [w, d],
    [w, h],
    [w, h],
  ]
  for (let f = 0; f < 6; f++) {
    const [fw, fh] = faces[f]
    for (let v = 0; v < 4; v++) {
      const i = f * 4 + v
      uv.setXY(i, uv.getX(i) * fw + du, uv.getY(i) * fh + dv)
    }
  }
  uv.needsUpdate = true
  return geo
}

type SlabOptions = {
  cx: number
  cz: number
  r0: number
  r1: number
  a0: number
  a1: number
  y0: number
  y1: number
  segments?: number
  du?: number
  dv?: number
}

export function curvedSlab({ cx, cz, r0, r1, a0, a1, y0, y1, segments = 24, du = 0, dv = 0 }: SlabOptions) {
  const positions: number[] = []
  const normals: number[] = []
  const uvs: number[] = []
  const indices: number[] = []
  const arc0 = Math.abs(a1 - a0) * r0
  const pt = (r: number, a: number, y: number) => [cx + Math.cos(a) * r, y, cz + Math.sin(a) * r]

  const surface = (r: number, inward: boolean) => {
    const base = positions.length / 3
    for (let i = 0; i <= segments; i++) {
      const t = i / segments
      const a = a0 + (a1 - a0) * t
      const n = [Math.cos(a), 0, Math.sin(a)]
      for (const [y, v] of [
        [y0, 0],
        [y1, 1],
      ]) {
        positions.push(...pt(r, a, y))
        normals.push(inward ? -n[0] : n[0], 0, inward ? -n[2] : n[2])
        uvs.push(t * arc0 + du, v * (y1 - y0) + dv)
      }
    }
    for (let i = 0; i < segments; i++) {
      const a = base + i * 2
      const b = a + 2
      if (inward !== a1 > a0) indices.push(a, a + 1, b, b, a + 1, b + 1)
      else indices.push(a, b, a + 1, b, b + 1, a + 1)
    }
  }

  const ring = (y: number, up: boolean) => {
    const base = positions.length / 3
    for (let i = 0; i <= segments; i++) {
      const t = i / segments
      const a = a0 + (a1 - a0) * t
      positions.push(...pt(r0, a, y), ...pt(r1, a, y))
      normals.push(0, up ? 1 : -1, 0, 0, up ? 1 : -1, 0)
      uvs.push(t * arc0 + du, 0, t * arc0 + du, r1 - r0)
    }
    for (let i = 0; i < segments; i++) {
      const a = base + i * 2
      const b = a + 2
      const ccw = up === a1 > a0
      if (ccw) indices.push(a, b, a + 1, b, b + 1, a + 1)
      else indices.push(a, a + 1, b, b, a + 1, b + 1)
    }
  }

  const cap = (a: number, start: boolean) => {
    const base = positions.length / 3
    const sign = (start ? -1 : 1) * Math.sign(a1 - a0)
    const n = [-Math.sin(a) * sign, 0, Math.cos(a) * sign]
    const quad = [pt(r0, a, y0), pt(r1, a, y0), pt(r0, a, y1), pt(r1, a, y1)]
    quad.forEach((p, i) => {
      positions.push(...p)
      normals.push(n[0], n[1], n[2])
      uvs.push((i % 2) * (r1 - r0), i < 2 ? 0 : y1 - y0)
    })
    const flip = !start === a1 > a0
    if (flip) indices.push(base, base + 1, base + 2, base + 2, base + 1, base + 3)
    else indices.push(base, base + 2, base + 1, base + 1, base + 2, base + 3)
  }

  surface(r0, true)
  surface(r1, false)
  ring(y1, true)
  ring(y0, false)
  cap(a0, true)
  cap(a1, false)

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geo.setIndex(indices)
  return geo
}

export function stadiumPoints(length: number, width: number, steps = 18) {
  const r = width / 2
  const half = length / 2 - r
  const pts: THREE.Vector2[] = []
  for (let i = 0; i <= steps; i++) {
    const a = -Math.PI / 2 + (i / steps) * Math.PI
    pts.push(new THREE.Vector2(half + Math.cos(a) * r, Math.sin(a) * r))
  }
  for (let i = 0; i <= steps; i++) {
    const a = Math.PI / 2 + (i / steps) * Math.PI
    pts.push(new THREE.Vector2(-half + Math.cos(a) * r, Math.sin(a) * r))
  }
  return pts
}

export function extrudeOutline(points: THREE.Vector2[], height: number, uvScale = 1) {
  const positions: number[] = []
  const normals: number[] = []
  const uvs: number[] = []
  const indices: number[] = []
  const n = points.length
  let acc = 0
  const lengths = [0]
  for (let i = 1; i <= n; i++) {
    acc += points[i % n].distanceTo(points[i - 1])
    lengths.push(acc)
  }
  for (let i = 0; i < n; i++) {
    const p0 = points[i]
    const p1 = points[(i + 1) % n]
    const dx = p1.x - p0.x
    const dz = p1.y - p0.y
    const len = Math.hypot(dx, dz) || 1
    const nx = dz / len
    const nz = -dx / len
    const base = positions.length / 3
    const u0 = lengths[i] * uvScale
    const u1 = lengths[i + 1] * uvScale
    positions.push(p0.x, 0, p0.y, p1.x, 0, p1.y, p0.x, height, p0.y, p1.x, height, p1.y)
    for (let k = 0; k < 4; k++) normals.push(nx, 0, nz)
    uvs.push(u0, 0, u1, 0, u0, height, u1, height)
    indices.push(base, base + 2, base + 1, base + 1, base + 2, base + 3)
  }
  const side = new THREE.BufferGeometry()
  side.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  side.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
  side.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  side.setIndex(indices)

  const top = new THREE.ShapeGeometry(new THREE.Shape(points.map((p) => new THREE.Vector2(p.x, -p.y))), 24)
  top.rotateX(-Math.PI / 2)
  top.translate(0, height, 0)
  const bottom = new THREE.ShapeGeometry(new THREE.Shape(points.map((p) => new THREE.Vector2(p.x, p.y))), 24)
  bottom.rotateX(Math.PI / 2)
  return { side, top, bottom }
}

export function smoothSideNormals(geo: THREE.BufferGeometry) {
  const pos = geo.attributes.position as THREE.BufferAttribute
  const nor = geo.attributes.normal as THREE.BufferAttribute
  const map = new Map<string, THREE.Vector3>()
  const key = (i: number) => `${pos.getX(i).toFixed(4)}|${pos.getZ(i).toFixed(4)}`
  for (let i = 0; i < pos.count; i++) {
    const k = key(i)
    const v = map.get(k) ?? new THREE.Vector3()
    v.x += nor.getX(i)
    v.z += nor.getZ(i)
    map.set(k, v)
  }
  for (let i = 0; i < pos.count; i++) {
    const v = map.get(key(i))!.clone().normalize()
    nor.setXYZ(i, v.x, 0, v.z)
  }
  nor.needsUpdate = true
  return geo
}

export function lathe(profile: [number, number][], segments = 48) {
  const pts = profile.map(([r, y]) => new THREE.Vector2(r, y))
  const geo = new THREE.LatheGeometry(pts, segments)
  return geo
}

export function archShape(width: number, height: number) {
  const r = width / 2
  const s = new THREE.Shape()
  s.moveTo(-r, 0)
  s.lineTo(r, 0)
  s.lineTo(r, height - r)
  s.absarc(0, height - r, r, 0, Math.PI, false)
  s.lineTo(-r, 0)
  return s
}

export function prepare(geo: THREE.BufferGeometry) {
  const g = geo.index ? geo.toNonIndexed() : geo
  if (!g.attributes.uv) {
    g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array((g.attributes.position.count * 2) | 0), 2))
  }
  if (!g.attributes.normal) g.computeVertexNormals()
  for (const name of Object.keys(g.attributes)) {
    if (name !== 'position' && name !== 'normal' && name !== 'uv') g.deleteAttribute(name)
  }
  g.morphAttributes = {}
  return g
}
