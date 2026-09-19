import * as THREE from "three"
import { INTRO_SETTINGS } from "./settings"
import type { IntroTimeline } from "./timeline"
import { getHeroAnchorSnapshot, type HeroAnchorSnapshot } from "./hero-anchor"

const clamp = (value: number) => Math.min(1, Math.max(0, value))
const ease = (start: number, end: number, value: number) => {
  const t = clamp((value - start) / (end - start))
  return t * t * (3 - 2 * t)
}
const mix = THREE.MathUtils.lerp

// Every strip starts on the same projected limb. UV noise only sculpts that
// geometry: it cannot produce a covering plane or clouds elsewhere on screen.
const ribbonVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`

const ribbonFragment = /* glsl */ `
  uniform float uTime;
  uniform float uOpacity;
  uniform float uMorph;
  uniform float uMatch;
  uniform float uLayer;
  varying vec2 vUv;
  float hash(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * .1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1., 0.)), f.x),
      mix(hash(i + vec2(0., 1.)), hash(i + vec2(1., 1.)), f.x), f.y);
  }
  float fbm(vec2 p) {
    float value = 0., weight = .55;
    for (int i = 0; i < CLOUD_OCTAVES; i++) {
      value += noise(p) * weight;
      p = mat2(.8, -.6, .6, .8) * p * 2.05 + vec2(9.2, 13.7);
      weight *= .47;
    }
    return value;
  }
  void main() {
    float across = vUv.y * 2.0 - 1.0;
    vec2 p = vec2(vUv.x * 13., across * 2.8) + vec2(uLayer * 3.71, uTime * .025);
    float broad = fbm(p);
    float detail = fbm(p * vec2(3.8, 1.6) + broad * 2.1);
    float warp = (broad - .48) * .7;
    float body = exp(-pow((across + warp) * 1.7, 2.0));
    float filaments = pow(max(0., 1.0 - abs(sin((across + warp) * 15. + detail * 5.))), 7.);
    float dust = smoothstep(.25, .64, detail + broad * .2);
    float fragmented = smoothstep(uMatch * .94, uMatch * .94 + .19, broad + detail * .28);
    float edge = 1.0 - smoothstep(.48, 1., abs(across));
    float ends = smoothstep(0., .09, vUv.x) * (1.0 - smoothstep(.84, 1., vUv.x));
    float luminous = exp(-pow((vUv.x - mix(.52, .30, uMorph)) * 6., 2.)) * .55;
    float strands = body * (dust * .72 + filaments * .6);
    float youngArc = exp(-across * across * 15.) * (.5 + detail * .5);
    float density = mix(youngArc, strands, smoothstep(.0, .42, uMorph));
    vec3 violet = vec3(.15, .062, .31);
    vec3 blue = vec3(.07, .26, .53);
    vec3 cyan = vec3(.22, .66, .83);
    vec3 color = mix(violet, blue, smoothstep(.22, .73, broad + vUv.x * .14));
    color = mix(color, cyan, clamp(filaments * .6 + luminous * .45, 0., .73));
    color += vec3(.025, .09, .13) * luminous;
    gl_FragColor = vec4(color, density * edge * ends * fragmented * uOpacity);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`

const pointVertex = /* glsl */ `
  attribute float aSize;
  attribute float aAlpha;
  attribute vec3 aColor;
  uniform float uDpr;
  varying float vAlpha;
  varying vec3 vColor;
  varying vec2 vScreen;
  void main() {
    vAlpha = aAlpha;
    vColor = aColor;
    vScreen = position.xy;
    gl_PointSize = aSize * uDpr;
    gl_Position = vec4(position, 1.0);
  }
`
const pointFragment = /* glsl */ `
  uniform float uMatch;
  uniform float uHomeExposure;
  uniform vec4 uHeroBounds;
  varying float vAlpha;
  varying vec3 vColor;
  varying vec2 vScreen;
  void main() {
    float radius = length(gl_PointCoord - .5) * 2.;
    float glow = exp(-radius * radius * 4.) * (1. - smoothstep(.65, 1., radius));
    vec2 xy = gl_PointCoord * 2. - 1.;
    float r = dot(xy, xy), delta = fwidth(r);
    float disk = 1. - smoothstep(1. - delta, 1. + delta, r);
    vec3 initialColor = linearToOutputTexel(vec4(vColor, 1.)).rgb;
    // Match the installed Drei PointMaterial shader, which applies its
    // injected tone/color chunks and Three's existing chunks consecutively.
    vec3 finalColor = vColor;
    #ifdef TONE_MAPPING
      finalColor = toneMapping(finalColor * uHomeExposure / max(toneMappingExposure, .001));
    #endif
    finalColor = linearToOutputTexel(vec4(finalColor, 1.)).rgb;
    #ifdef TONE_MAPPING
      finalColor = toneMapping(finalColor * uHomeExposure / max(toneMappingExposure, .001));
    #endif
    finalColor = linearToOutputTexel(vec4(finalColor, 1.)).rgb;
    vec2 heroUv = (vScreen - uHeroBounds.xy) / (uHeroBounds.zw - uHeroBounds.xy);
    float heroMask = max(0., 1. - abs(heroUv.y * 2. - 1.)) * max(0., 1. - .5 * abs(heroUv.x * 2. - 1.));
    heroMask *= step(0., heroUv.x) * step(heroUv.x, 1.);
    gl_FragColor = vec4(mix(initialColor, finalColor, uMatch), mix(glow, disk, uMatch) * vAlpha * mix(1., heroMask, uMatch));
  }
`

/** One continuous contour, from the real Earth limb to real homepage nodes. */
export function createContourNebula(
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  lowPower: boolean,
) {
  const group = new THREE.Group()
  group.name = "earth-contour-nebula"
  scene.add(group)
  const segments = lowPower ? 96 : 144
  const layers = lowPower ? 2 : 3
  const ribbonBuffers: { geometry: THREE.BufferGeometry; positions: Float32Array; material: THREE.ShaderMaterial; mesh: THREE.Mesh }[] = []
  for (let layer = 0; layer < layers; layer++) {
    const positions = new Float32Array((segments + 1) * 6)
    const uv = new Float32Array((segments + 1) * 4)
    const indices = new Uint16Array(segments * 6)
    for (let i = 0; i <= segments; i++) {
      uv.set([i / segments, 0, i / segments, 1], i * 4)
      if (i < segments) indices.set([i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 2, i * 2 + 1, i * 2 + 3], i * 6)
    }
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage))
    geometry.setAttribute("uv", new THREE.BufferAttribute(uv, 2))
    geometry.setIndex(new THREE.BufferAttribute(indices, 1))
    const material = new THREE.ShaderMaterial({
      defines: { CLOUD_OCTAVES: lowPower ? 3 : 4 },
      uniforms: { uTime: { value: 0 }, uOpacity: { value: 0 }, uMorph: { value: 0 }, uMatch: { value: 0 }, uLayer: { value: layer } },
      vertexShader: ribbonVertex,
      fragmentShader: ribbonFragment,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.frustumCulled = false
    mesh.renderOrder = 5 + layer
    group.add(mesh)
    ribbonBuffers.push({ geometry, positions, material, mesh })
  }

  const count = lowPower ? 600 : 700
  const positions = new Float32Array(count * 3)
  const sizes = new Float32Array(count)
  const alphas = new Float32Array(count)
  const colors = new Float32Array(count * 3)
  const parameters = new Float32Array(count * 4)
  let seed = 60819
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) | 0
    return (seed >>> 0) / 4294967296
  }
  for (let i = 0; i < count; i++) parameters.set([random(), random() * 2 - 1, random(), random()], i * 4)
  const pointGeometry = new THREE.BufferGeometry()
  pointGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage))
  pointGeometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1).setUsage(THREE.DynamicDrawUsage))
  pointGeometry.setAttribute("aAlpha", new THREE.BufferAttribute(alphas, 1).setUsage(THREE.DynamicDrawUsage))
  pointGeometry.setAttribute("aColor", new THREE.BufferAttribute(colors, 3).setUsage(THREE.DynamicDrawUsage))
  const pointMaterial = new THREE.ShaderMaterial({
    uniforms: { uDpr: { value: 1 }, uMatch: { value: 0 }, uHomeExposure: { value: 1 }, uHeroBounds: { value: new THREE.Vector4(-1, -1, 1, 1) } },
    vertexShader: pointVertex,
    fragmentShader: pointFragment,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.NormalBlending,
  })
  const particles = new THREE.Points(pointGeometry, pointMaterial)
  particles.frustumCulled = false
  particles.renderOrder = 10
  group.add(particles)

  const lineGeometry = new THREE.BufferGeometry()
  // A fixed bounded buffer avoids reallocating resources during the handoff.
  const linePositions = new Float32Array(1800 * 6)
  lineGeometry.setAttribute("position", new THREE.BufferAttribute(linePositions, 3).setUsage(THREE.DynamicDrawUsage))
  lineGeometry.setDrawRange(0, 0)
  const lineMaterial = new THREE.ShaderMaterial({
    uniforms: { uOpacity: { value: 0 }, uColor: { value: new THREE.Color("#3b82f6") }, uHomeExposure: { value: 1 }, uMatch: { value: 0 }, uHeroBounds: { value: new THREE.Vector4(-1, -1, 1, 1) } },
    vertexShader: `varying vec2 vScreen; void main() { vScreen = position.xy; gl_Position = vec4(position, 1.); }`,
    fragmentShader: /* glsl */ `
      uniform float uOpacity;
      uniform float uHomeExposure;
      uniform float uMatch;
      uniform vec4 uHeroBounds;
      uniform vec3 uColor;
      varying vec2 vScreen;
      void main() {
        vec2 heroUv = (vScreen - uHeroBounds.xy) / (uHeroBounds.zw - uHeroBounds.xy);
        float heroMask = max(0., 1. - abs(heroUv.y * 2. - 1.)) * max(0., 1. - .5 * abs(heroUv.x * 2. - 1.));
        heroMask *= step(0., heroUv.x) * step(heroUv.x, 1.);
        gl_FragColor = vec4(uColor, uOpacity * mix(1., heroMask, uMatch));
        #ifdef TONE_MAPPING
          gl_FragColor.rgb *= uHomeExposure / max(toneMappingExposure, .001);
        #endif
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
    transparent: true,
    depthWrite: false,
    depthTest: false,
  })
  const connections = new THREE.LineSegments(lineGeometry, lineMaterial)
  connections.frustumCulled = false
  connections.renderOrder = 9
  group.add(connections)

  const curvePoint = new THREE.Vector2()
  const curveBefore = new THREE.Vector2()
  const curveAfter = new THREE.Vector2()
  const cyanNode = new THREE.Color("#06b6d4")
  const purpleNode = new THREE.Color("#a855f7")
  const heroContour = new Float32Array(18)
  let contourSnapshot: HeroAnchorSnapshot | null = null
  let contourWidth = 0
  let contourHeight = 0
  let disposed = false

  function refreshHeroContour(snapshot: HeroAnchorSnapshot) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    const points = snapshot.points
    for (let i = 0; i < points.length; i += 2) {
      minX = Math.min(minX, points[i]); maxX = Math.max(maxX, points[i])
      minY = Math.min(minY, points[i + 1]); maxY = Math.max(maxY, points[i + 1])
    }
    const cx = (minX + maxX) * .5, cy = (minY + maxY) * .5
    for (let sample = 0; sample < 9; sample++) {
      const angle = (75 + sample / 8 * 160) * Math.PI / 180
      const x = cx + (maxX - minX) * .44 * Math.cos(angle)
      const y = cy + (maxY - minY) * .44 * Math.sin(angle)
      let nearest = 0, distance = Infinity
      for (let i = 0; i < points.length; i += 2) {
        const d = (points[i] - x) ** 2 + (points[i + 1] - y) ** 2
        if (d < distance) { distance = d; nearest = i }
      }
      heroContour[sample * 2] = points[nearest]
      heroContour[sample * 2 + 1] = points[nearest + 1]
    }
    contourSnapshot = snapshot
    contourWidth = snapshot.width
    contourHeight = snapshot.height
  }

  function sampleCurve(u: number, morph: number, match: number, time: number, center: THREE.Vector2, radius: number, aspect: number, target: THREE.Vector2) {
    const theta = (75 + u * 160) * Math.PI / 180
    const initialX = center.x + Math.cos(theta) * radius / aspect
    const initialY = center.y + Math.sin(theta) * radius
    // Two C1-continuous cubic Beziers turn the crescent into an asymmetric S.
    // Their shared tangent keeps the ribbon from folding into angular wedges.
    // The upper left bend carries the original limb; a thin tail leaves it
    // diagonally rather than following the lower half of a planetary circle.
    const responsiveWidth = Math.min(1, aspect / .94)
    const responsiveHeight = Math.min(1, Math.max(.62, aspect / .85))
    const first = u <= .5
    const t = first ? u * 2 : (u - .5) * 2
    const a = (1 - t) ** 3, b = 3 * (1 - t) ** 2 * t, c = 3 * (1 - t) * t * t, d = t ** 3
    const resolvedCurveX = first
      ? a * .48 + b * -.30 + c * -.70 + d * -.15
      : a * -.15 + b * .40 + c * .29 + d * .70
    const resolvedCurveY = first
      ? a * .73 + b * .93 + c * .15 + d * .02
      : a * .02 + b * -.11 + c * -.43 + d * -.68
    const resolvedX = center.x + resolvedCurveX * responsiveWidth / aspect
    const resolvedY = center.y + resolvedCurveY * responsiveHeight
    const open = ease(.22, .98, morph)
    const drift = time * .009 * morph
    let x = mix(initialX, resolvedX, open) + drift / aspect
    let y = mix(initialY, resolvedY, open) + Math.sin(time * .45 + u * 2.5) * .011 * morph
    if (contourSnapshot && match > 0) {
      const index = Math.min(7, Math.floor(u * 8)), part = u * 8 - index
      const hx = mix(heroContour[index * 2], heroContour[(index + 1) * 2], part)
      const hy = mix(heroContour[index * 2 + 1], heroContour[(index + 1) * 2 + 1], part)
      x = mix(x, hx, match)
      y = mix(y, hy, match)
    }
    return target.set(x, y)
  }

  function update(timeline: IntroTimeline, earthCenter: THREE.Vector2, earthRadiusY: number, aspect: number) {
    if (disposed) return
    const time = timeline.motionTime
    const { morph, match } = timeline
    group.visible = morph > .0001
    if (!group.visible) return
    const snapshot = getHeroAnchorSnapshot()
    if (snapshot?.points.length && (snapshot !== contourSnapshot || snapshot.width !== contourWidth || snapshot.height !== contourHeight || (match > 0 && match < 1))) refreshHeroContour(snapshot)
    const hasAnchor = Boolean(snapshot?.points.length)
    const cloudOpacity = ease(0, .16, morph) * (1 - ease(.13, .96, match))
    const widthScale = Math.min(1, aspect / .95)
    for (let layer = 0; layer < layers; layer++) {
      const ribbon = ribbonBuffers[layer]
      ribbon.mesh.visible = cloudOpacity > .001
      if (!ribbon.mesh.visible) continue
      for (let i = 0; i <= segments; i++) {
        const u = i / segments
        sampleCurve(u, morph, match * .83, time, earthCenter, earthRadiusY, aspect, curvePoint)
        sampleCurve(Math.max(0, u - .002), morph, match * .83, time, earthCenter, earthRadiusY, aspect, curveBefore)
        sampleCurve(Math.min(1, u + .002), morph, match * .83, time, earthCenter, earthRadiusY, aspect, curveAfter)
        const dx = (curveAfter.x - curveBefore.x) * aspect, dy = curveAfter.y - curveBefore.y
        const length = Math.max(.0001, Math.hypot(dx, dy)), nx = -dy / length, ny = dx / length
        const fan = ease(.06, .87, morph)
        const head = Math.exp(-(((u - .30) * 4.5) ** 2))
        const width = (.018 + fan * (.037 + .078 * head)) * (1 + layer * .28) * widthScale * (1 - match * .85)
        const strandOffset = Math.sin(u * 12 + layer * 2.6 + time * .12) * .024 * fan * layer
        const parallax = Math.sin(time * .17 + u * 3) * .006 * layer * fan
        for (let side = 0; side < 2; side++) {
          const offset = ((side * 2 - 1) * width + strandOffset) * Math.sin(Math.PI * Math.max(.035, Math.min(.965, u))) ** .38
          const at = i * 6 + side * 3
          ribbon.positions[at] = curvePoint.x + (nx * offset + parallax) / aspect
          ribbon.positions[at + 1] = curvePoint.y + ny * offset
          ribbon.positions[at + 2] = .2 - layer * .04
        }
      }
      ribbon.geometry.attributes.position.needsUpdate = true
      ribbon.material.uniforms.uTime.value = time
      ribbon.material.uniforms.uMorph.value = morph
      ribbon.material.uniforms.uMatch.value = match
      ribbon.material.uniforms.uOpacity.value = cloudOpacity * INTRO_SETTINGS.nebulaIntensity * (layer === 0 ? 1.2 : .64) * (1 - morph * .2)
    }

    const anchorCount = hasAnchor ? Math.min(snapshot!.points.length / 2, Math.floor(count / 3)) : 0
    for (let i = 0; i < count; i++) {
      const at = i * 4, u = parameters[at], radial = parameters[at + 1], variance = parameters[at + 2]
      sampleCurve(u, morph, match * .5, time, earthCenter, earthRadiusY, aspect, curvePoint)
      sampleCurve(Math.min(1, u + .003), morph, match * .5, time, earthCenter, earthRadiusY, aspect, curveAfter)
      const dx = (curveAfter.x - curvePoint.x) * aspect, dy = curveAfter.y - curvePoint.y
      const length = Math.max(.0001, Math.hypot(dx, dy))
      const spread = radial * (.007 + morph * .11) * Math.sin(u * Math.PI) ** .6 * widthScale
      let x = curvePoint.x - dy / length * spread / aspect
      let y = curvePoint.y + dx / length * spread
      let alpha = ease(.015, .3, morph) * (.24 + variance * .53)
      let size = .75 + variance * 1.15
      let r = .2 + variance * .15, g = .45 + variance * .2, b = .82
      if (i < anchorCount * 3) {
        const nodeIndex = i % anchorCount
        // Preserve the real draw order: cyan, purple, then the white pinpoints.
        const kind = Math.floor(i / anchorCount)
        const destination = kind === 0 ? snapshot!.corePoints : snapshot!.points
        const destinationSizes = kind === 0 ? snapshot!.coreSizes : kind === 1 ? snapshot!.glowSizes : snapshot!.pointSizes
        const destinationAlpha = kind === 0 ? snapshot!.coreOpacity : kind === 1 ? snapshot!.glowOpacity : snapshot!.pointOpacity
        const migrate = ease(.015 + parameters[at + 3] * .1, .93, match)
        x = mix(x, destination[nodeIndex * 2], migrate)
        y = mix(y, destination[nodeIndex * 2 + 1], migrate)
        alpha = mix(alpha, destinationAlpha, migrate)
        size = mix(size, destinationSizes[nodeIndex], migrate)
        r = mix(r, kind === 0 ? cyanNode.r : kind === 1 ? purpleNode.r : 1, migrate)
        g = mix(g, kind === 0 ? cyanNode.g : kind === 1 ? purpleNode.g : 1, migrate)
        b = mix(b, kind === 0 ? cyanNode.b : kind === 1 ? purpleNode.b : 1, migrate)
      } else {
        alpha *= 1 - ease(.03, .85, match)
      }
      if (!hasAnchor) alpha *= 1 - ease(.1, .95, match)
      positions[i * 3] = x
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = .01
      alphas[i] = alpha
      sizes[i] = size
      colors[i * 3] = r
      colors[i * 3 + 1] = g
      colors[i * 3 + 2] = b
    }
    pointGeometry.attributes.position.needsUpdate = true
    pointGeometry.attributes.aSize.needsUpdate = true
    pointGeometry.attributes.aAlpha.needsUpdate = true
    pointGeometry.attributes.aColor.needsUpdate = true
    pointMaterial.uniforms.uDpr.value = Math.min(typeof window === "undefined" ? 1 : window.devicePixelRatio || 1, lowPower ? INTRO_SETTINGS.mobileDpr : INTRO_SETTINGS.maxDpr)
    pointMaterial.uniforms.uMatch.value = ease(.12, .96, match)
    pointMaterial.uniforms.uHomeExposure.value = snapshot?.toneMappingExposure ?? 1
    if (snapshot) pointMaterial.uniforms.uHeroBounds.value.fromArray(snapshot.ndcBounds)

    const linesVisible = hasAnchor && match > .52
    connections.visible = linesVisible
    if (linesVisible) {
      const source = snapshot!.lines
      const vertexCount = Math.min(source.length / 2, linePositions.length / 3)
      for (let i = 0; i < vertexCount; i++) {
        linePositions[i * 3] = source[i * 2]
        linePositions[i * 3 + 1] = source[i * 2 + 1]
        linePositions[i * 3 + 2] = .04
      }
      lineGeometry.attributes.position.needsUpdate = true
      lineGeometry.setDrawRange(0, vertexCount - vertexCount % 2)
      lineMaterial.uniforms.uOpacity.value = snapshot!.lineOpacity * ease(.52, 1, match)
      lineMaterial.uniforms.uHomeExposure.value = snapshot!.toneMappingExposure
      lineMaterial.uniforms.uMatch.value = ease(.12, .96, match)
      lineMaterial.uniforms.uHeroBounds.value.fromArray(snapshot!.ndcBounds)
    }
    // Keep screen-space geometry bounded and camera-independent on resize.
    // The supplied perspective camera still owns the actual 3D Earth and stars.
    group.userData.cameraAspect = camera.aspect
  }

  function dispose() {
    if (disposed) return
    disposed = true
    scene.remove(group)
    for (const ribbon of ribbonBuffers) { ribbon.geometry.dispose(); ribbon.material.dispose() }
    pointGeometry.dispose()
    pointMaterial.dispose()
    lineGeometry.dispose()
    lineMaterial.dispose()
    group.clear()
  }

  return { update, dispose }
}
