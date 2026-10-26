import * as THREE from 'three'

export type RevealGroup = {
  reveal: { value: number }
  origin: { value: THREE.Vector3 }
  dir: { value: THREE.Vector3 }
  scale: { value: number }
}

export const globals = {
  clay: { value: 0 },
  paper: { value: new THREE.Color('#f2ede5') },
  clayColor: { value: new THREE.Color('#e9e4dc') },
  edge: { value: 0 },
  // Height the solid model has filled up to; above it surfaces stay paper (100 = all solid).
  rise: { value: 100 },
  riseGlow: { value: 0 },
}

export function revealGroup(origin: [number, number, number], dir: [number, number, number], length: number): RevealGroup {
  return {
    reveal: { value: 0 },
    origin: { value: new THREE.Vector3(...origin) },
    dir: { value: new THREE.Vector3(...dir).normalize() },
    scale: { value: 1 / length },
  }
}

const NOISE = /* glsl */ `
varying vec3 vTFWorld;
uniform float uTFClay;
uniform vec3 uTFPaper;
uniform vec3 uTFClayColor;
uniform float uTFReveal;
uniform vec3 uTFOrigin;
uniform vec3 uTFDir;
uniform float uTFScale;
uniform float uTFEdge;
uniform float uTFRise;
uniform float uTFRiseGlow;
float tfHash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
float tfNoise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(tfHash(i), tfHash(i + vec3(1, 0, 0)), f.x), mix(tfHash(i + vec3(0, 1, 0)), tfHash(i + vec3(1, 1, 0)), f.x), f.y),
    mix(mix(tfHash(i + vec3(0, 0, 1)), tfHash(i + vec3(1, 0, 1)), f.x), mix(tfHash(i + vec3(0, 1, 1)), tfHash(i + vec3(1, 1, 1)), f.x), f.y),
    f.z
  );
}
`

export function patchMaterial(material: THREE.MeshStandardMaterial, group: RevealGroup, rise = true) {
  if (rise) material.defines = { ...material.defines, TF_RISE: '' }
  material.polygonOffset = true
  material.polygonOffsetFactor = 1
  material.polygonOffsetUnits = 1
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTFClay = globals.clay
    shader.uniforms.uTFPaper = globals.paper
    shader.uniforms.uTFClayColor = globals.clayColor
    shader.uniforms.uTFEdge = globals.edge
    shader.uniforms.uTFReveal = group.reveal
    shader.uniforms.uTFOrigin = group.origin
    shader.uniforms.uTFDir = group.dir
    shader.uniforms.uTFScale = group.scale
    shader.uniforms.uTFRise = globals.rise
    shader.uniforms.uTFRiseGlow = globals.riseGlow

    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vTFWorld;')
      .replace(
        '#include <project_vertex>',
        `#include <project_vertex>
        vec4 tfWorld = vec4(transformed, 1.0);
        #ifdef USE_INSTANCING
          tfWorld = instanceMatrix * tfWorld;
        #endif
        vTFWorld = (modelMatrix * tfWorld).xyz;`,
      )

    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\n${NOISE}`)
      .replace(
        '#include <map_fragment>',
        `#include <map_fragment>
        float tfCoord = dot(vTFWorld - uTFOrigin, uTFDir) * uTFScale;
        tfCoord += (tfNoise(vTFWorld * 2.3) - 0.5) * 0.2 + (tfNoise(vTFWorld * 11.0) - 0.5) * 0.05;
        float tfM = clamp((uTFReveal * 1.4 - 0.2 - tfCoord) / 0.08, 0.0, 1.0);
        diffuseColor.rgb = mix(uTFClayColor, diffuseColor.rgb, tfM);`,
      )
      .replace(
        '#include <roughnessmap_fragment>',
        `#include <roughnessmap_fragment>
        roughnessFactor = mix(0.86, roughnessFactor, tfM);`,
      )
      .replace(
        '#include <metalnessmap_fragment>',
        `#include <metalnessmap_fragment>
        metalnessFactor = mix(0.0, metalnessFactor, tfM);`,
      )
      .replace(
        '#include <normal_fragment_begin>',
        `#include <normal_fragment_begin>
        vec3 tfBaseNormal = normal;`,
      )
      .replace(
        '#include <normal_fragment_maps>',
        `#include <normal_fragment_maps>
        normal = normalize(mix(tfBaseNormal, normal, tfM));`,
      )
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
        totalEmissiveRadiance *= tfM;`,
      )
      .replace(
        '#include <lights_physical_fragment>',
        `#include <lights_physical_fragment>
        #ifdef USE_CLEARCOAT
          material.clearcoat *= tfM;
        #endif
        #ifdef USE_SHEEN
          material.sheenColor *= tfM;
        #endif`,
      )
      .replace(
        '#include <opaque_fragment>',
        `float tfBand = 1.0 - abs(tfM * 2.0 - 1.0);
        tfBand *= step(0.002, tfM) * step(tfM, 0.998);
        outgoingLight += vec3(1.0, 0.88, 0.72) * tfBand * uTFEdge;
        #ifdef TF_RISE
          float tfFill = 1.0 - smoothstep(uTFRise - 0.004, uTFRise + 0.004, vTFWorld.y);
          float tfCut = pow(smoothstep(uTFRise - 0.14, uTFRise - 0.002, vTFWorld.y), 2.0) * tfFill;
          outgoingLight += vec3(1.0, 0.84, 0.62) * tfCut * uTFRiseGlow;
        #else
          float tfFill = 1.0;
        #endif
        outgoingLight = mix(uTFPaper, outgoingLight, uTFClay * tfFill);
        #include <opaque_fragment>`,
      )
  }
  material.customProgramCacheKey = () => (rise ? 'materialab-reveal-2-rise' : 'materialab-reveal-2')
  return material
}
