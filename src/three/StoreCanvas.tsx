import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import { Bloom, DepthOfField, EffectComposer, N8AO, Noise, ToneMapping, Vignette } from '@react-three/postprocessing'
import { BlendFunction, ToneMappingMode, type BloomEffect, type DepthOfFieldEffect, type NoiseEffect, type VignetteEffect } from 'postprocessing'
import type { MotionValue } from 'motion/react'
import { buildStore, type GroupKey, type Label, type StoreBuild } from './store'
import { buildSketch } from './lines'
import { globals } from './patch'
import { loadTextureSet } from './textures'

type V3 = [number, number, number]
type Key = { p: number; pos: V3; tgt: V3; fov: number; up?: V3; fit?: number }

const KEYS: Key[] = [
  { p: 0.0, pos: [-2.2, 58, -4.52], tgt: [-2.2, 0, -4.5], fov: 15.5, up: [0, 0, -1], fit: 16.8 },
  { p: 0.15, pos: [-2.2, 55, -4.48], tgt: [-2.2, 0, -4.5], fov: 15.5, up: [0, 0, -1], fit: 16.8 },
  { p: 0.3, pos: [-9.6, 10.4, 8.6], tgt: [0.3, 0.7, -4.7], fov: 34 },
  { p: 0.43, pos: [4.3, 2.25, -0.45], tgt: [-1.3, 1.3, -6.7], fov: 54 },
  { p: 0.53, pos: [-3.4, 1.68, -0.6], tgt: [1.7, 1.42, -7.3], fov: 52 },
  { p: 0.65, pos: [1.7, 1.64, -0.55], tgt: [-1.9, 1.42, -7.5], fov: 52 },
  { p: 0.77, pos: [0, 1.6, -0.3], tgt: [0, 1.68, -8.6], fov: 50 },
  { p: 0.9, pos: [2.55, 1.46, -1.45], tgt: [-0.75, 1.3, -6.9], fov: 44 },
  { p: 1.0, pos: [2.35, 1.45, -1.7], tgt: [-0.75, 1.3, -6.9], fov: 43 },
]

// On portrait screens the plan is centred, since the interface sits above and below it.
const PORTRAIT_KEYS: Key[] = KEYS.map((k) =>
  k.fit ? { ...k, pos: [0, k.pos[1], k.pos[2]] as V3, tgt: [0, k.tgt[1], k.tgt[2]] as V3 } : k,
)

type Path = { keys: Key[]; pos: THREE.CatmullRomCurve3; tgt: THREE.CatmullRomCurve3 }

// Centripetal Catmull-Rom splines through the keyframes keep the camera moving
// continuously instead of easing to a stop at every keyframe.
function buildPath(keys: Key[]): Path {
  return {
    keys,
    pos: new THREE.CatmullRomCurve3(keys.map((k) => new THREE.Vector3(...k.pos)), false, 'centripetal'),
    tgt: new THREE.CatmullRomCurve3(keys.map((k) => new THREE.Vector3(...k.tgt)), false, 'centripetal'),
  }
}

const PATHS = { wide: buildPath(KEYS), portrait: buildPath(PORTRAIT_KEYS) }

const SCHEDULE: Record<GroupKey, [number, number]> = {
  base: [0.44, 0.5],
  floor: [0.455, 0.53],
  walnut: [0.475, 0.56],
  lama: [0.505, 0.59],
  tacto: [0.53, 0.61],
  stone: [0.555, 0.63],
  soft: [0.58, 0.65],
  detail: [0.6, 0.67],
  lights: [0.69, 0.75],
}

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x)
const ss = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}
const smoother = (t: number) => t * t * t * (t * (t * 6 - 15) + 10)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

const PAPER_HDR = new THREE.Color('#f2ede5').multiplyScalar(1.02)
const NIGHT = new THREE.Color('#14110f')
const FOCUS = new THREE.Vector3(-0.2, 0.95, -5.0)

type N8AORef = { configuration: { intensity: number } }
type LabelRefs = React.RefObject<(HTMLDivElement | null)[]>

function useIsMobile() {
  return useMemo(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 760px), (pointer: coarse)').matches, [])
}

function Scene({
  build,
  progress,
  mobile,
  planRefs,
  matRefs,
}: {
  build: StoreBuild
  progress: MotionValue<number>
  mobile: boolean
  planRefs: LabelRefs
  matRefs: LabelRefs
}) {
  const sketch = useMemo(() => buildSketch(build.strokes), [build])
  const { gl, scene, size } = useThree()
  const sp = useRef(progress.get())
  const parallax = useRef(new THREE.Vector2())
  const ao = useRef<N8AORef>(null)
  const bloom = useRef<BloomEffect>(null)
  const dof = useRef<DepthOfFieldEffect>(null)
  const vignette = useRef<VignetteEffect>(null)
  const noise = useRef<NoiseEffect>(null)
  const tmp = useMemo(
    () => ({
      pos: new THREE.Vector3(),
      tgt: new THREE.Vector3(),
      up: new THREE.Vector3(),
      a: new THREE.Vector3(),
      b: new THREE.Vector3(),
      right: new THREE.Vector3(),
      proj: new THREE.Vector3(),
      bg: new THREE.Color(),
    }),
    [],
  )

  useEffect(() => {
    let alive = true
    loadTextureSet(gl.capabilities.getMaxAnisotropy())
      .then((t) => {
        if (alive) build.applyTextures(t)
      })
      .catch((err) => console.warn('[wallcraftpanels] textures', err))
    return () => {
      alive = false
    }
  }, [build, gl])

  useEffect(() => {
    scene.background = tmp.bg.copy(PAPER_HDR)
    globals.paper.value.copy(PAPER_HDR)
  }, [scene, tmp])

  const placeLabel = (
    el: HTMLDivElement | null,
    label: Label,
    opacity: number,
    camera: THREE.Camera,
  ) => {
    if (!el) return
    if (opacity < 0.003) {
      if (el.style.visibility !== 'hidden') el.style.visibility = 'hidden'
      return
    }
    tmp.proj.set(...label.position).project(camera)
    if (tmp.proj.z > 1 || Math.abs(tmp.proj.x) > 1.2 || Math.abs(tmp.proj.y) > 1.2) {
      el.style.visibility = 'hidden'
      return
    }
    const x = (tmp.proj.x * 0.5 + 0.5) * size.width
    const y = (-tmp.proj.y * 0.5 + 0.5) * size.height
    el.style.visibility = 'visible'
    el.style.opacity = opacity.toFixed(3)
    el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%)`
  }

  useFrame((state, dt) => {
    const target = progress.get()
    sp.current += (target - sp.current) * (1 - Math.exp(-dt * 5.5))
    const p = sp.current
    const camera = state.camera as THREE.PerspectiveCamera

    // Camera path
    const aspect = size.width / Math.max(1, size.height)
    const path = aspect < 0.9 ? PATHS.portrait : PATHS.wide
    const K = path.keys
    let i = 0
    while (i < K.length - 2 && p > K[i + 1].p) i++
    const k0 = K[i]
    const k1 = K[i + 1]
    const lt = clamp01((p - k0.p) / (k1.p - k0.p))
    const u = (i + lt) / (K.length - 1)
    path.pos.getPoint(u, tmp.pos)
    path.tgt.getPoint(u, tmp.tgt)
    const t = smoother(lt)
    tmp.up.set(...(k0.up ?? [0, 1, 0])).lerp(tmp.a.set(...(k1.up ?? [0, 1, 0])), t).normalize()
    const widen = Math.max(1, 1.3 / aspect)
    const fovFor = (k: Key) => {
      if (k.fit && aspect < 0.9) {
        const dist = Math.hypot(k.pos[0] - k.tgt[0], k.pos[1] - k.tgt[1], k.pos[2] - k.tgt[2])
        return Math.max(k.fov, (2 * Math.atan(k.fit / 2 / (dist * aspect)) * 180) / Math.PI)
      }
      return (2 * Math.atan(Math.tan((k.fov * Math.PI) / 360) * widen) * 180) / Math.PI
    }
    const fov = Math.min(86, lerp(fovFor(k0), fovFor(k1), t))

    const inside = ss(0.4, 0.5, p)
    parallax.current.lerp(state.pointer, 1 - Math.exp(-dt * 2.5))
    tmp.right.subVectors(tmp.tgt, tmp.pos).cross(tmp.up).normalize()
    tmp.pos.addScaledVector(tmp.right, parallax.current.x * 0.22 * inside)
    tmp.pos.y += parallax.current.y * 0.1 * inside

    camera.position.copy(tmp.pos)
    camera.up.copy(tmp.up)
    camera.lookAt(tmp.tgt)
    if (Math.abs(camera.fov - fov) > 0.01) {
      camera.fov = fov
      camera.updateProjectionMatrix()
    }
    camera.updateMatrixWorld()

    // Stages
    const plan = 1 - ss(0.17, 0.27, p)
    const clay = ss(0.3, 0.35, p)
    const rise = ss(0.305, 0.43, p)
    const light = ss(0.69, 0.8, p)
    const final = ss(0.82, 0.95, p)
    // Lights switch on in sequence: wall washers, accents, niche and slot, then the light well
    const lWash = ss(0.68, 0.725, p)
    const lAccent = ss(0.7, 0.75, p)
    const lLine = ss(0.72, 0.77, p)
    const lWell = ss(0.735, 0.8, p)

    sketch.setDraw(ss(0.012, 0.27, p))
    sketch.setWidth(lerp(1.0, 1.45, plan))
    sketch.setOpacity(lerp(1, 0.22, ss(0.41, 0.46, p)) * (1 - ss(0.47, 0.56, p)))
    sketch.setResolution(size.width, size.height)
    build.capMaterial.opacity = plan * 0.8 * ss(0.02, 0.09, p)
    build.capMaterial.visible = build.capMaterial.opacity > 0.002
    const aboveCeiling = camera.position.y > 4.05
    if (build.meshes.plasterInner) build.meshes.plasterInner.visible = !aboveCeiling
    if (build.meshes.lightDiffuser) build.meshes.lightDiffuser.visible = !aboveCeiling

    globals.clay.value = clay
    globals.rise.value = rise >= 0.999 ? 100 : lerp(-0.05, build.height + 0.4, rise)
    globals.riseGlow.value = clay * (1 - ss(0.405, 0.435, p)) * 3.2
    if (build.meshes.lightStrip) build.meshes.lightStrip.visible = rise > 0.98
    globals.edge.value = 0.55 * ss(0.45, 0.49, p) * (1 - ss(0.66, 0.7, p))
    for (const key of Object.keys(SCHEDULE) as GroupKey[]) {
      const [a, b] = SCHEDULE[key]
      build.groups[key].reveal.value = ss(a, b, p)
    }

    tmp.bg.copy(PAPER_HDR).lerp(NIGHT, ss(0.44, 0.6, p))
    scene.environmentIntensity = clay * lerp(0.8, 0.42, light)

    const L = build.lights
    L.day.intensity = clay * lerp(2.6, 0.2, light)
    L.day.shadow.intensity = rise
    L.hemi.intensity = clay * lerp(0.7, 0.18, light)
    L.wellSpot.intensity = lWell * 150
    L.wellArea.intensity = lWell * 4.2
    for (const w of L.washers) w.intensity = lWash * 115
    L.accents.forEach((a, k) => {
      a.intensity = ss(0.7 + k * 0.01, 0.74 + k * 0.01, p) * 50
    })
    L.slot.intensity = lLine * 13
    L.niche.intensity = lLine * 20
    L.bounce.intensity = light * 0.9
    build.materials.lightDiffuser.emissiveIntensity = lerp(0.9, 2.5, lWell)
    build.materials.lightStrip.emissiveIntensity = lLine * 6
    build.materials.lightDisc.emissiveIntensity = Math.max(lWash, lAccent) * 9
    const shaft = lWell * (1 - final * 0.3)
    build.shaft.visible = shaft > 0.002
    ;(build.shaft.material as THREE.ShaderMaterial).uniforms.uIntensity.value = shaft * (mobile ? 0.2 : 0.17)

    if (ao.current) ao.current.configuration.intensity = clay * rise * (mobile ? 2.2 : 3.0)
    if (bloom.current) bloom.current.intensity = light * 0.65
    if (dof.current) {
      dof.current.bokehScale = final * (mobile ? 1.4 : 2.6)
      dof.current.target = FOCUS
    }
    if (vignette.current) vignette.current.darkness = lerp(0.0, 0.58, Math.max(clay * 0.35, final))
    if (noise.current) noise.current.blendMode.opacity.value = clay * 0.05

    // Labels
    const planO = ss(0.03, 0.08, p) * (1 - ss(0.14, 0.19, p))
    build.planLabels.forEach((l, idx) => placeLabel(planRefs.current[idx], l, planO, camera))
    build.materialLabels.forEach((l, idx) => {
      if (!l.group) return
      const end = SCHEDULE[l.group][1]
      const o = ss(end - 0.02, end + 0.02, p) * (1 - ss(0.675, 0.705, p))
      placeLabel(matRefs.current[idx], l, o, camera)
    })
  })

  return (
    <>
      <primitive object={build.root} />
      <primitive object={sketch.group} />
      <Environment resolution={mobile ? 128 : 256} frames={1}>
        <color attach="background" args={['#4a4139']} />
        <Lightformer form="circle" intensity={3.2} color="#fff1de" position={[0, 7, -5]} scale={6} />
        <Lightformer form="rect" intensity={1.6} color="#fff3e6" position={[0, 2.5, 10]} scale={[14, 5, 1]} />
        <Lightformer form="rect" intensity={0.6} color="#e6cfb0" position={[-10, 2, -4]} scale={[12, 4, 1]} />
        <Lightformer form="rect" intensity={0.45} color="#caa57d" position={[10, 2, -4]} scale={[12, 4, 1]} />
        <Lightformer form="rect" intensity={0.35} color="#8e6b4c" position={[0, 2, -14]} scale={[12, 4, 1]} />
      </Environment>
      <EffectComposer multisampling={mobile ? 0 : 4} enableNormalPass={false}>
        <N8AO
          ref={ao as never}
          aoRadius={0.75}
          distanceFalloff={0.9}
          intensity={0}
          quality={mobile ? 'low' : 'medium'}
          halfRes={mobile}
          color="#1c1612"
        />
        <Bloom ref={bloom} mipmapBlur luminanceThreshold={1.05} luminanceSmoothing={0.25} intensity={0} radius={0.75} />
        <DepthOfField ref={dof} focusDistance={5} focusRange={3.5} bokehScale={0} resolutionScale={0.5} />
        <ToneMapping mode={ToneMappingMode.NEUTRAL} />
        <Vignette ref={vignette} offset={0.32} darkness={0} />
        <Noise ref={noise} premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0} />
      </EffectComposer>
    </>
  )
}

function LabelOverlay({ labels, refs, kind }: { labels: Label[]; refs: LabelRefs; kind: 'plan' | 'material' }) {
  return (
    <>
      {labels.map((l, i) => (
        <div
          key={l.id}
          ref={(el) => {
            refs.current[i] = el
          }}
          className={`tf-label tf-label--${kind}`}
          style={{ visibility: 'hidden', opacity: 0 }}
        >
          {kind === 'material' && <i className="tf-label__dot" />}
          <span className="tf-label__title">{l.title}</span>
          {l.meta && <span className="tf-label__meta">{l.meta}</span>}
        </div>
      ))}
    </>
  )
}

export default function StoreCanvas({ progress, active }: { progress: MotionValue<number>; active: boolean }) {
  const mobile = useIsMobile()
  const build = useMemo<StoreBuild>(() => buildStore(), [])
  const planRefs = useRef<(HTMLDivElement | null)[]>([])
  const matRefs = useRef<(HTMLDivElement | null)[]>([])

  return (
    <>
      <Canvas
        className="studio__canvas"
        flat
        shadows="percentage"
        dpr={mobile ? [1, 1.25] : [1, 1.6]}
        frameloop={active ? 'always' : 'never'}
        gl={{ antialias: false, powerPreference: 'high-performance', stencil: false }}
        camera={{ fov: 15.5, near: 0.05, far: 140, position: [-2.2, 58, -4.52] }}
        onCreated={({ gl }) => {
          gl.shadowMap.type = THREE.PCFShadowMap
        }}
      >
        <Scene build={build} progress={progress} mobile={mobile} planRefs={planRefs} matRefs={matRefs} />
      </Canvas>
      <div className="tf-labels" aria-hidden="true">
        <LabelOverlay labels={build.planLabels} refs={planRefs} kind="plan" />
        <LabelOverlay labels={build.materialLabels} refs={matRefs} kind="material" />
      </div>
    </>
  )
}
