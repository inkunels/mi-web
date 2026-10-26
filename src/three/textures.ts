import * as THREE from 'three'
import { isLocal, MAT, TEXTURE } from '../data/content'

export type SurfaceMaps = {
  map: THREE.Texture
  normalMap: THREE.Texture
  roughnessMap: THREE.Texture
}

export type TextureSet = {
  walnut: SurfaceMaps
  oak: SurfaceMaps
  stone: SurfaceMaps
  fabric: SurfaceMaps
  granite: SurfaceMaps
  flute: THREE.Texture
  brushed: { normalMap: THREE.Texture; roughnessMap: THREE.Texture }
}

type Spec = {
  id: string
  width: number
  normalStrength: number
  roughBase: number
  roughRange: number
}

const SPECS: Record<'walnut' | 'oak' | 'stone' | 'fabric' | 'granite', Spec> = {
  walnut: { id: TEXTURE.walnut, width: 2048, normalStrength: 2.4, roughBase: 0.42, roughRange: 0.26 },
  oak: { id: TEXTURE.straight, width: 2048, normalStrength: 2.0, roughBase: 0.5, roughRange: 0.22 },
  stone: { id: TEXTURE.travertine, width: 2048, normalStrength: 1.6, roughBase: 0.3, roughRange: 0.3 },
  fabric: { id: TEXTURE.fabric, width: 1024, normalStrength: 3.2, roughBase: 0.82, roughRange: 0.14 },
  granite: { id: MAT.texDaisur, width: 1024, normalStrength: 1.1, roughBase: 0.24, roughRange: 0.22 },
}

function url(id: string, width: number) {
  if (isLocal(id)) return id
  return `https://images.unsplash.com/${id}?auto=format&fm=jpg&fit=max&w=${width}&q=82`
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.decoding = 'async'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Could not load ${src}`))
    img.src = src
  })
}

function deriveMaps(img: HTMLImageElement, spec: Spec, size = 1024) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!
  ctx.drawImage(img, 0, 0, size, size)
  const src = ctx.getImageData(0, 0, size, size).data
  const lum = new Float32Array(size * size)
  let min = 1
  let max = 0
  for (let i = 0; i < size * size; i++) {
    const l = (0.2126 * src[i * 4] + 0.7152 * src[i * 4 + 1] + 0.0722 * src[i * 4 + 2]) / 255
    lum[i] = l
    if (l < min) min = l
    if (l > max) max = l
  }
  const range = Math.max(0.0001, max - min)

  const normal = ctx.createImageData(size, size)
  const rough = ctx.createImageData(size, size)
  const n = normal.data
  const r = rough.data
  const s = spec.normalStrength
  for (let y = 0; y < size; y++) {
    const ym = ((y - 1 + size) % size) * size
    const yp = ((y + 1) % size) * size
    const yc = y * size
    for (let x = 0; x < size; x++) {
      const xm = (x - 1 + size) % size
      const xp = (x + 1) % size
      const dx = (lum[yc + xp] - lum[yc + xm]) / range
      const dy = (lum[yp + x] - lum[ym + x]) / range
      let nx = -dx * s * 0.5
      let ny = dy * s * 0.5
      let nz = 1
      const len = Math.hypot(nx, ny, nz)
      nx /= len
      ny /= len
      nz /= len
      const o = (yc + x) * 4
      n[o] = (nx * 0.5 + 0.5) * 255
      n[o + 1] = (ny * 0.5 + 0.5) * 255
      n[o + 2] = (nz * 0.5 + 0.5) * 255
      n[o + 3] = 255
      const norm = (lum[yc + x] - min) / range
      const rv = (spec.roughBase + (1 - norm) * spec.roughRange) * 255
      r[o] = rv
      r[o + 1] = rv
      r[o + 2] = rv
      r[o + 3] = 255
    }
  }

  const nCanvas = document.createElement('canvas')
  nCanvas.width = nCanvas.height = size
  nCanvas.getContext('2d')!.putImageData(normal, 0, 0)
  const rCanvas = document.createElement('canvas')
  rCanvas.width = rCanvas.height = size
  rCanvas.getContext('2d')!.putImageData(rough, 0, 0)
  return { nCanvas, rCanvas }
}

function configure(tex: THREE.Texture, anisotropy: number, color = false) {
  tex.wrapS = THREE.MirroredRepeatWrapping
  tex.wrapT = THREE.MirroredRepeatWrapping
  tex.anisotropy = anisotropy
  tex.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace
  tex.needsUpdate = true
  return tex
}

async function loadSurface(spec: Spec, anisotropy: number): Promise<SurfaceMaps> {
  const img = await loadImage(url(spec.id, spec.width))
  const { nCanvas, rCanvas } = deriveMaps(img, spec)
  return {
    map: configure(new THREE.Texture(img), anisotropy, true),
    normalMap: configure(new THREE.CanvasTexture(nCanvas), anisotropy),
    roughnessMap: configure(new THREE.CanvasTexture(rCanvas), anisotropy),
  }
}

function fluteTexture(anisotropy: number) {
  const w = 256
  const h = 4
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  const data = ctx.createImageData(w, h)
  for (let x = 0; x < w; x++) {
    const t = (x / w) * Math.PI * 2
    const nx = Math.sin(t) * 0.85
    const nz = Math.sqrt(1 - nx * nx)
    for (let y = 0; y < h; y++) {
      const o = (y * w + x) * 4
      data.data[o] = (nx * 0.5 + 0.5) * 255
      data.data[o + 1] = 128
      data.data[o + 2] = (nz * 0.5 + 0.5) * 255
      data.data[o + 3] = 255
    }
  }
  ctx.putImageData(data, 0, 0)
  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.anisotropy = anisotropy
  tex.colorSpace = THREE.NoColorSpace
  return tex
}

function brushedTextures(anisotropy: number) {
  const w = 1024
  const h = 8
  const heights = new Float32Array(w)
  let v = 0
  for (let x = 0; x < w; x++) {
    v = v * 0.55 + (Math.random() - 0.5)
    heights[x] = v + (Math.random() - 0.5) * 0.6
  }
  const nCanvas = document.createElement('canvas')
  const rCanvas = document.createElement('canvas')
  nCanvas.width = rCanvas.width = w
  nCanvas.height = rCanvas.height = h
  const nCtx = nCanvas.getContext('2d')!
  const rCtx = rCanvas.getContext('2d')!
  const n = nCtx.createImageData(w, h)
  const r = rCtx.createImageData(w, h)
  for (let x = 0; x < w; x++) {
    const dx = heights[(x + 1) % w] - heights[(x - 1 + w) % w]
    const nx = Math.max(-0.6, Math.min(0.6, -dx * 0.35))
    const nz = Math.sqrt(1 - nx * nx)
    const rough = 0.3 + Math.min(0.12, Math.abs(heights[x]) * 0.08)
    for (let y = 0; y < h; y++) {
      const o = (y * w + x) * 4
      n.data[o] = (nx * 0.5 + 0.5) * 255
      n.data[o + 1] = 128
      n.data[o + 2] = (nz * 0.5 + 0.5) * 255
      n.data[o + 3] = 255
      r.data[o] = r.data[o + 1] = r.data[o + 2] = rough * 255
      r.data[o + 3] = 255
    }
  }
  nCtx.putImageData(n, 0, 0)
  rCtx.putImageData(r, 0, 0)
  const make = (c: HTMLCanvasElement) => {
    const tex = new THREE.CanvasTexture(c)
    tex.wrapS = THREE.RepeatWrapping
    tex.wrapT = THREE.RepeatWrapping
    tex.anisotropy = anisotropy
    tex.colorSpace = THREE.NoColorSpace
    return tex
  }
  return { normalMap: make(nCanvas), roughnessMap: make(rCanvas) }
}

export async function loadTextureSet(anisotropy: number): Promise<TextureSet> {
  const [walnut, oak, stone, fabric, granite] = await Promise.all([
    loadSurface(SPECS.walnut, anisotropy),
    loadSurface(SPECS.oak, anisotropy),
    loadSurface(SPECS.stone, anisotropy),
    loadSurface(SPECS.fabric, anisotropy),
    loadSurface(SPECS.granite, anisotropy),
  ])
  return { walnut, oak, stone, fabric, granite, flute: fluteTexture(anisotropy), brushed: brushedTextures(anisotropy) }
}
