import * as THREE from "three"
import { INTRO_SETTINGS } from "./settings"
import { sampleIntroTimeline } from "./timeline"
import { createContourNebula } from "./contour-nebula"

type SpaceScene = {
  render: (elapsedSeconds: number) => void
  resize: (width: number, height: number) => void
  dispose: () => void
}

const clamp = THREE.MathUtils.clamp

// Surface, clouds and atmosphere share a ragged erosion from night side to limb.
const erosionShader = /* glsl */ `
  uniform float uMorph;
  uniform vec2 uResolution;
  uniform vec2 uEarthCenter;
  uniform float uEarthRadius;
  uniform float uAspect;
  float erosionHash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float erosionNoise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(erosionHash(i), erosionHash(i + vec2(1., 0.)), f.x),
      mix(erosionHash(i + vec2(0., 1.)), erosionHash(i + vec2(1., 1.)), f.x), f.y);
  }
  float earthMask() {
    vec2 screen = gl_FragCoord.xy / uResolution * 2.0 - 1.0;
    vec2 p = (screen - uEarthCenter) * vec2(uAspect, 1.) / uEarthRadius;
    float roughness = erosionNoise(p * 11.) * .24 + erosionNoise(p * 39.) * .11;
    float score = p.x * .72 - p.y * .15 + roughness;
    float threshold = mix(1.45, -1.25, uMorph);
    float directional = 1.0 - smoothstep(threshold - .12, threshold + .12, score);
    // Open the solid interior while the luminous edge still has substance.
    // This exposes space within the contour instead of fading an intact globe.
    float innerEdge = mix(-.25, 1.18, smoothstep(0., .85, uMorph));
    float opened = smoothstep(innerEdge - .12, innerEdge + .12, length(p) + roughness * .25);
    return directional * opened;
  }
`

const atmosphereVertex = /* glsl */ `
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;
  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`

const atmosphereFragment = /* glsl */ `
  uniform vec3 uSun;
  ${erosionShader}
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;
  void main() {
    vec3 normal = normalize(vWorldNormal);
    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
    float rim = pow(1.0 - abs(dot(normal, viewDirection)), 4.5);
    float sunlight = smoothstep(-0.45, 0.65, dot(normal, uSun));
    vec3 color = mix(vec3(0.04, 0.16, 0.55), vec3(0.19, 0.56, 1.0), sunlight);
    gl_FragColor = vec4(color, rim * (0.08 + 0.6 * sunlight) * earthMask());
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`

const starVertex = /* glsl */ `
  attribute float aSize;
  attribute float aBrightness;
  attribute vec3 aColor;
  uniform float uDpr;
  varying float vBrightness;
  varying vec3 vColor;
  void main() {
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    vBrightness = aBrightness * smoothstep(0.5, 6.0, -viewPosition.z);
    vColor = aColor;
    gl_PointSize = clamp(aSize * 105.0 / max(5.0, -viewPosition.z), 0.65, 2.25) * uDpr;
    gl_Position = projectionMatrix * viewPosition;
  }
`

const starFragment = /* glsl */ `
  uniform float uOpacity;
  varying float vBrightness;
  varying vec3 vColor;
  void main() {
    float distanceToCenter = length(gl_PointCoord - vec2(0.5));
    float shape = 1.0 - smoothstep(0.06, 0.49, distanceToCenter);
    gl_FragColor = vec4(vColor, shape * vBrightness * uOpacity);
    #include <colorspace_fragment>
  }
`

/** One self-contained renderer. The overlay owns the clock and every exit path. */
export async function createSpaceScene(
  canvas: HTMLCanvasElement,
  { lowPower, signal }: { lowPower: boolean; signal: AbortSignal },
): Promise<SpaceScene> {
  const geometries: THREE.BufferGeometry[] = []
  const materials: THREE.Material[] = []
  const textures: THREE.Texture[] = []
  const bitmaps: ImageBitmap[] = []
  const loading = new AbortController()
  let renderer: THREE.WebGLRenderer | null = null
  let disposed = false
  let shaderError: Error | null = null
  let width = Math.max(1, canvas.clientWidth || window.innerWidth)
  let height = Math.max(1, canvas.clientHeight || window.innerHeight)
  let contour: ReturnType<typeof createContourNebula> | undefined

  function dispose() {
    if (disposed) return
    disposed = true
    loading.abort()
    signal.removeEventListener("abort", dispose)
    contour?.dispose()
    geometries.forEach((geometry) => geometry.dispose())
    materials.forEach((material) => material.dispose())
    textures.forEach((texture) => texture.dispose())
    bitmaps.forEach((bitmap) => bitmap.close())
    renderer?.renderLists.dispose()
    renderer?.dispose()
    renderer?.forceContextLoss()
    renderer = null
  }

  function assertActive() {
    if (disposed || signal.aborted) {
      throw new DOMException("The introduction was cancelled", "AbortError")
    }
  }

  async function loadTexture(path: string, color: boolean) {
    const response = await fetch(path, { signal: loading.signal })
    if (!response.ok) throw new Error(`Could not load intro texture: ${path}`)
    const blob = await response.blob()
    assertActive()
    const bitmap = await createImageBitmap(blob, {
      imageOrientation: "flipY",
      premultiplyAlpha: "none",
      colorSpaceConversion: "none",
    })
    if (disposed || signal.aborted) {
      bitmap.close()
      assertActive()
    }
    bitmaps.push(bitmap)
    const texture = new THREE.Texture(bitmap)
    texture.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace
    texture.anisotropy = lowPower ? 2 : 4
    texture.needsUpdate = true
    textures.push(texture)
    return texture
  }

  signal.addEventListener("abort", dispose, { once: true })

  try {
    assertActive()
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: false,
      antialias: !lowPower,
      powerPreference: lowPower ? "low-power" : "high-performance",
      failIfMajorPerformanceCaveat: true,
    })
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.05
    renderer.setClearColor(0x02050b, 1)
    renderer.debug.onShaderError = () => {
      shaderError = new Error("The introduction shader could not be compiled")
    }

    const suffix = lowPower ? "-mobile" : ""
    const [dayTexture, cloudTexture] = await Promise.all([
      loadTexture(`/intro/earth-day${suffix}.webp`, true),
      loadTexture(`/intro/earth-clouds${suffix}.webp`, false),
    ])
    assertActive()

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(44, width / height, 0.1, 360)
    const sunDirection = new THREE.Vector3(-3.5, 1.8, 2.2).normalize()
    const sunlight = new THREE.DirectionalLight(0xfff3e3, 2.65)
    sunlight.position.copy(sunDirection).multiplyScalar(8)
    scene.add(sunlight)
    scene.add(new THREE.HemisphereLight(0x496c9f, 0x02040b, 0.23))

    const projectedCenter = new THREE.Vector3()
    const earthCenter = new THREE.Vector2()
    const morphUniforms = {
      uMorph: { value: 0 }, uResolution: { value: new THREE.Vector2(width, height) },
      uEarthCenter: { value: earthCenter }, uEarthRadius: { value: 1 }, uAspect: { value: width / height },
    }
    function dissolveSurface(material: THREE.MeshPhongMaterial, softenTexture: boolean) {
      material.onBeforeCompile = (shader) => {
        Object.assign(shader.uniforms, morphUniforms)
        shader.fragmentShader = erosionShader + shader.fragmentShader
        if (softenTexture) shader.fragmentShader = shader.fragmentShader.replace(
          "#include <map_fragment>",
          `#include <map_fragment>
           #ifdef USE_MAP
             vec2 blurStep = vec2(.0035, .005) * uMorph;
             vec3 softened = (texture2D(map, vMapUv + blurStep).rgb + texture2D(map, vMapUv - blurStep).rgb
               + texture2D(map, vMapUv + vec2(blurStep.x, -blurStep.y)).rgb
               + texture2D(map, vMapUv + vec2(-blurStep.x, blurStep.y)).rgb) * .25;
             diffuseColor.rgb = mix(diffuseColor.rgb, softened, uMorph * .8);
             diffuseColor.rgb = mix(diffuseColor.rgb, vec3(.05, .19, .31), uMorph * .5);
           #endif`,
        )
        shader.fragmentShader = shader.fragmentShader.replace(
          "#include <alphatest_fragment>",
          `float survival = earthMask();
           if (survival < .015) discard;
           diffuseColor.a *= survival;
           #include <alphatest_fragment>`,
        )
      }
      material.customProgramCacheKey = () => `contour-erosion-${softenTexture}`
    }

    const globe = new THREE.Group()
    globe.rotation.z = 0.12
    globe.rotation.x = -0.08
    scene.add(globe)

    const earthGeometry = new THREE.SphereGeometry(1, lowPower ? 48 : 80, lowPower ? 32 : 64)
    geometries.push(earthGeometry)
    const earthMaterial = new THREE.MeshPhongMaterial({
      map: dayTexture,
      specular: new THREE.Color(0x203d58),
      shininess: 14,
      transparent: true,
    })
    dissolveSurface(earthMaterial, true)
    materials.push(earthMaterial)
    const earth = new THREE.Mesh(earthGeometry, earthMaterial)
    globe.add(earth)

    const cloudMaterial = new THREE.MeshPhongMaterial({
      color: 0xe6f1ff,
      alphaMap: cloudTexture,
      transparent: true,
      opacity: 0.44,
      depthWrite: false,
      shininess: 0,
    })
    dissolveSurface(cloudMaterial, false)
    materials.push(cloudMaterial)
    const clouds = new THREE.Mesh(earthGeometry, cloudMaterial)
    clouds.scale.setScalar(1.009)
    globe.add(clouds)

    const atmosphereMaterial = new THREE.ShaderMaterial({
      uniforms: { uSun: { value: sunDirection }, ...morphUniforms },
      vertexShader: atmosphereVertex,
      fragmentShader: atmosphereFragment,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false,
    })
    materials.push(atmosphereMaterial)
    const atmosphere = new THREE.Mesh(earthGeometry, atmosphereMaterial)
    atmosphere.scale.setScalar(1.023)
    globe.add(atmosphere)

    // A seeded distribution keeps the composition stable across desktop and mobile.
    let seed = 1947
    const random = () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) | 0
      return (seed >>> 0) / 4294967296
    }
    const count = lowPower ? INTRO_SETTINGS.mobileStars : INTRO_SETTINGS.stars
    const positions = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    const brightness = new Float32Array(count)
    const colors = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const angle = random() * Math.PI * 2
      const radius = 5 + Math.sqrt(random()) * 118
      positions[i * 3] = Math.cos(angle) * radius
      positions[i * 3 + 1] = Math.sin(angle) * radius * 0.72
      positions[i * 3 + 2] = random() * 235 - 170
      sizes[i] = 0.5 + random() * 0.95
      brightness[i] = 0.24 + Math.pow(random(), 2) * 0.66
      const warmth = random()
      colors[i * 3] = 0.69 + warmth * 0.29
      colors[i * 3 + 1] = 0.77 + warmth * 0.18
      colors[i * 3 + 2] = 0.97
    }
    const starGeometry = new THREE.BufferGeometry()
    starGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    starGeometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1))
    starGeometry.setAttribute("aBrightness", new THREE.BufferAttribute(brightness, 1))
    starGeometry.setAttribute("aColor", new THREE.BufferAttribute(colors, 3))
    geometries.push(starGeometry)
    const starMaterial = new THREE.ShaderMaterial({
      uniforms: { uDpr: { value: 1 }, uOpacity: { value: 1 } },
      vertexShader: starVertex,
      fragmentShader: starFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    materials.push(starMaterial)
    const stars = new THREE.Points(starGeometry, starMaterial)
    stars.frustumCulled = false
    scene.add(stars)

    contour = createContourNebula(scene, camera, lowPower)
    const openingColor = new THREE.Color(0x02050b)
    const homepageColor = openingColor.clone()
    // Resolve the actual CSS color, including oklch, for a seamless background.
    const colorCanvas = document.createElement("canvas")
    colorCanvas.width = colorCanvas.height = 1
    const colorContext = colorCanvas.getContext("2d")
    if (colorContext) {
      colorContext.fillStyle = getComputedStyle(document.body).backgroundColor
      colorContext.fillRect(0, 0, 1, 1)
      const rgba = colorContext.getImageData(0, 0, 1, 1).data
      homepageColor.setRGB(rgba[0] / 255, rgba[1] / 255, rgba[2] / 255, THREE.SRGBColorSpace)
    }
    const clearColor = openingColor.clone()
    const timeline = sampleIntroTimeline(0)

    function resize(nextWidth: number, nextHeight: number) {
      if (disposed || !renderer) return
      width = Math.max(1, nextWidth)
      height = Math.max(1, nextHeight)
      const pixelRatio = Math.min(
        window.devicePixelRatio || 1,
        lowPower ? INTRO_SETTINGS.mobileDpr : INTRO_SETTINGS.maxDpr,
      )
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setPixelRatio(pixelRatio)
      renderer.setSize(width, height, false)
      starMaterial.uniforms.uDpr.value = pixelRatio
      morphUniforms.uAspect.value = camera.aspect
      renderer.getDrawingBufferSize(morphUniforms.uResolution.value)
    }

    function render(elapsedSeconds: number) {
      if (disposed || !renderer) return
      if (renderer.getContext().isContextLost()) throw new Error("The introduction lost its WebGL context")
      if (shaderError) throw shaderError
      const time = clamp(elapsedSeconds, 0, INTRO_SETTINGS.duration)
      sampleIntroTimeline(time, timeline)
      const initialDistance = 3.8 * Math.max(1, 0.86 / camera.aspect)
      camera.position.set(
        0.32 + timeline.travel * .38,
        0.12 + timeline.travel * .15,
        initialDistance + timeline.travel,
      )
      camera.lookAt(0.08 + timeline.travel * .04, 0.02 + timeline.travel * .01, 0)
      camera.updateMatrixWorld()
      projectedCenter.set(0, 0, 0).project(camera)
      earthCenter.set(projectedCenter.x, projectedCenter.y)
      const distance = camera.position.length()
      const earthRadiusY = 1.023 / Math.sqrt(distance * distance - 1.023 * 1.023)
        / Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2)
      morphUniforms.uMorph.value = timeline.morph
      morphUniforms.uEarthRadius.value = earthRadiusY

      // Detach the entire planet, including clouds and atmosphere. It receives
      // no traversal, rotation updates, or draw calls during the nebula passage.
      // Reattaching only supports backward seeking in the development preview.
      if (timeline.earthVisible) {
        if (!globe.parent) scene.add(globe)
        earth.rotation.y = -1.45 + time * INTRO_SETTINGS.earthRotation
        clouds.rotation.y = earth.rotation.y + 0.028 + time * 0.006
      } else if (globe.parent) {
        scene.remove(globe)
      }
      if (process.env.NODE_ENV === "development") canvas.dataset.earthVisible = String(globe.parent === scene)
      starMaterial.uniforms.uOpacity.value = 1 - timeline.match
      stars.visible = timeline.match < .999
      contour!.update(timeline, earthCenter, earthRadiusY, camera.aspect)
      renderer.setClearColor(clearColor.copy(openingColor).lerp(homepageColor, timeline.match), 1)
      renderer.render(scene, camera)
      if (shaderError) throw shaderError
    }

    resize(width, height)
    // All contour/point/line materials are present here, before the clock starts.
    renderer.compile(scene, camera)
    if (shaderError) throw shaderError
    render(0)
    return { render, resize, dispose }
  } catch (error) {
    dispose()
    throw error
  }
}
