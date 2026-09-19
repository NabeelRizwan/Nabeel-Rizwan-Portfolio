"use client"

import { Component, useCallback, useRef, useMemo, useState, useEffect, type ReactNode } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Points, PointMaterial } from "@react-three/drei"
import * as THREE from "three"
import { clearHeroAnchorSnapshot, publishHeroAnchorSnapshot, type HeroAnchorSnapshot } from "@/components/intro/hero-anchor"

function NeuralNodes({ active }: { active: boolean }) {
  const groupRef = useRef<THREE.Group>(null)
  const pointsRef = useRef<THREE.Points>(null)
  const originalPointsRef = useRef<THREE.Points>(null)
  const glowPointsRef = useRef<THREE.Points>(null)
  const linesRef = useRef<THREE.LineSegments>(null)
  const animationTime = useRef(0)
  const { gl, size, invalidate } = useThree()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  
  // Store original positions for attraction effect
  const nodeData = useMemo(() => {
    const nodeCount = 180
    const originalPositions: number[] = []
    const currentPositions: number[] = []
    const velocities: number[] = []
    const nodes: THREE.Vector3[] = []
    const lines: number[] = []

    // Create sphere-like distribution with more nodes
    for (let i = 0; i < nodeCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / nodeCount)
      const theta = Math.sqrt(nodeCount * Math.PI) * phi
      
      const radius = 2.3 + Math.random() * 0.7
      const x = radius * Math.cos(theta) * Math.sin(phi)
      const y = radius * Math.sin(theta) * Math.sin(phi)
      const z = radius * Math.cos(phi)

      originalPositions.push(x, y, z)
      currentPositions.push(x, y, z)
      velocities.push(0, 0, 0)
      nodes.push(new THREE.Vector3(x, y, z))
    }

    // Create connections between nearby nodes
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dist = nodes[i].distanceTo(nodes[j])
        if (dist < 1.5 && Math.random() > 0.35) {
          lines.push(
            nodes[i].x, nodes[i].y, nodes[i].z,
            nodes[j].x, nodes[j].y, nodes[j].z
          )
        }
      }
    }

    return {
      original: new Float32Array(originalPositions),
      current: new Float32Array(currentPositions),
      velocities: new Float32Array(velocities),
      connections: new Float32Array(lines),
      nodeCount
    }
  }, [])

  const anchor = useMemo<HeroAnchorSnapshot>(() => ({
    points: new Float32Array(nodeData.nodeCount * 2),
    corePoints: new Float32Array(nodeData.nodeCount * 2),
    pointSizes: new Float32Array(nodeData.nodeCount),
    coreSizes: new Float32Array(nodeData.nodeCount),
    glowSizes: new Float32Array(nodeData.nodeCount),
    pointOpacity: 0.7,
    coreOpacity: 1,
    glowOpacity: 0.85,
    lineOpacity: 0.25,
    toneMappingExposure: 1,
    ndcBounds: new Float32Array(4),
    lines: new Float32Array(nodeData.connections.length / 3 * 2),
    width: 0,
    height: 0,
  }), [nodeData])
  const projectionPoint = useMemo(() => new THREE.Vector3(), [])
  const canvasBounds = useRef({ left: 0, top: 0, width: 0, height: 0, dirty: true })

  useEffect(() => {
    const markProjectionDirty = () => {
      canvasBounds.current.dirty = true
      invalidate()
    }
    markProjectionDirty()
    window.addEventListener("resize", markProjectionDirty)
    window.addEventListener("scroll", markProjectionDirty, { passive: true })
    return () => {
      window.removeEventListener("resize", markProjectionDirty)
      window.removeEventListener("scroll", markProjectionDirty)
    }
  }, [size.width, size.height, invalidate])

  useEffect(() => () => clearHeroAnchorSnapshot(anchor), [anchor])

  const projectAnchorPositions = (
    positions: Float32Array,
    matrix: THREE.Matrix4,
    target: Float32Array,
    camera: THREE.Camera,
    projectedSizes?: Float32Array,
    material?: THREE.PointsMaterial,
  ) => {
    const bounds = canvasBounds.current
    const perspectiveSizes = material?.sizeAttenuation && camera instanceof THREE.PerspectiveCamera
    for (let source = 0, destination = 0; source < positions.length; source += 3, destination += 2) {
      projectionPoint.fromArray(positions, source).applyMatrix4(matrix).applyMatrix4(camera.matrixWorldInverse)
      if (projectedSizes && material) {
        projectedSizes[destination / 2] = material.size * (perspectiveSizes ? bounds.height / (2 * Math.max(0.001, -projectionPoint.z)) : 1)
      }
      projectionPoint.applyMatrix4(camera.projectionMatrix)
      target[destination] = (bounds.left + (projectionPoint.x + 1) * 0.5 * bounds.width) / anchor.width * 2 - 1
      target[destination + 1] = 1 - (bounds.top + (1 - projectionPoint.y) * 0.5 * bounds.height) / anchor.height * 2
    }
  }

  const captureAnchor = (camera: THREE.Camera) => {
    const group = groupRef.current
    const nodes = pointsRef.current
    const originals = originalPointsRef.current
    const glowNodes = glowPointsRef.current
    const lines = linesRef.current
    if (!group || !nodes || !originals || !glowNodes || !lines) return
    const nodeMaterial = nodes.material as THREE.PointsMaterial
    const originalMaterial = originals.material as THREE.PointsMaterial
    const glowMaterial = glowNodes.material as THREE.PointsMaterial

    const bounds = canvasBounds.current
    if (bounds.dirty) {
      const rect = gl.domElement.getBoundingClientRect()
      bounds.left = rect.left
      bounds.top = rect.top
      bounds.width = rect.width
      bounds.height = rect.height
      bounds.dirty = false
      anchor.width = window.innerWidth
      anchor.height = window.innerHeight
      anchor.ndcBounds[0] = bounds.left / anchor.width * 2 - 1
      anchor.ndcBounds[1] = 1 - (bounds.top + bounds.height) / anchor.height * 2
      anchor.ndcBounds[2] = (bounds.left + bounds.width) / anchor.width * 2 - 1
      anchor.ndcBounds[3] = 1 - bounds.top / anchor.height * 2
    }
    if (!anchor.width || !anchor.height || !bounds.width || !bounds.height) return

    // useFrame precedes Three's render, so explicitly refresh the real meshes'
    // world matrices before projecting this frame's positions.
    group.updateWorldMatrix(true, true)
    camera.updateMatrixWorld()
    projectAnchorPositions(nodeData.original, originals.matrixWorld, anchor.points, camera, anchor.pointSizes, originalMaterial)
    projectAnchorPositions(nodes.geometry.attributes.position.array as Float32Array, nodes.matrixWorld, anchor.corePoints, camera, anchor.coreSizes, nodeMaterial)
    // The white and purple meshes share positions and transforms. Preserve the
    // real purple diameter as well as the bright centre at every depth.
    const glowSizeRatio = glowMaterial.size / Math.max(0.000001, originalMaterial.size)
    for (let i = 0; i < nodeData.nodeCount; i++) anchor.glowSizes[i] = anchor.pointSizes[i] * glowSizeRatio
    anchor.pointOpacity = originalMaterial.opacity
    anchor.coreOpacity = nodeMaterial.opacity
    anchor.glowOpacity = glowMaterial.opacity
    anchor.lineOpacity = (lines.material as THREE.LineBasicMaterial).opacity
    anchor.toneMappingExposure = gl.toneMappingExposure
    projectAnchorPositions(nodeData.connections, lines.matrixWorld, anchor.lines, camera)
    publishHeroAnchorSnapshot(anchor)
  }

  useEffect(() => {
    if (!active) return

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: -(e.clientY / window.innerHeight - 0.5) * 2,
      })
    }
    
    const handleMouseEnter = () => setIsHovering(true)
    const handleMouseLeave = () => setIsHovering(false)
    
    window.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseenter", handleMouseEnter)
    document.addEventListener("mouseleave", handleMouseLeave)
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseenter", handleMouseEnter)
      document.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [active])

  useFrame((state, delta) => {
    if (!active) {
      // Demand renders still refresh the projection on first mount and resize,
      // while preserving the exact destination shape throughout the handoff.
      captureAnchor(state.camera)
      return
    }
    animationTime.current += Math.min(delta, 0.1)
    const time = animationTime.current
    
    // Smooth group rotation following mouse
    if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        mousePosition.x * 0.5 + time * 0.08,
        0.03
      )
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        mousePosition.y * 0.3 + Math.sin(time * 0.15) * 0.15,
        0.03
      )
      
      // Subtle breathing/pulsing scale effect
      const breathe = 1 + Math.sin(time * 0.8) * 0.03
      groupRef.current.scale.setScalar(breathe)
    }
    
    // Animate individual nodes with attraction and organic movement
    if (pointsRef.current) {
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array
      const { original, velocities, nodeCount } = nodeData
      
      // Convert mouse position to 3D space (approximate)
      const mouseX = mousePosition.x * 4
      const mouseY = mousePosition.y * 3
      
      for (let i = 0; i < nodeCount; i++) {
        const i3 = i * 3
        
        // Get current position
        const x = positions[i3]
        const y = positions[i3 + 1]
        const z = positions[i3 + 2]
        
        // Original position
        const ox = original[i3]
        const oy = original[i3 + 1]
        const oz = original[i3 + 2]
        
        // Calculate distance to mouse (in 2D projection)
        const dx = mouseX - x
        const dy = mouseY - y
        const distToMouse = Math.sqrt(dx * dx + dy * dy)
        
        // Attraction force (stronger when closer)
        const attractionRadius = 3.5
        const attractionStrength = 0.15
        let fx = 0, fy = 0, fz = 0
        
        if (distToMouse < attractionRadius) {
          const force = (1 - distToMouse / attractionRadius) * attractionStrength
          fx = dx * force
          fy = dy * force
          fz = (Math.random() - 0.5) * force * 0.3 // Slight z movement
        }
        
        // Spring force back to original position
        const springStrength = 0.02
        const springX = (ox - x) * springStrength
        const springY = (oy - y) * springStrength
        const springZ = (oz - z) * springStrength
        
        // Organic floating movement
        const floatX = Math.sin(time * 0.5 + i * 0.1) * 0.008
        const floatY = Math.cos(time * 0.4 + i * 0.15) * 0.008
        const floatZ = Math.sin(time * 0.3 + i * 0.2) * 0.005
        
        // Update velocities with damping
        const damping = 0.92
        velocities[i3] = (velocities[i3] + fx + springX + floatX) * damping
        velocities[i3 + 1] = (velocities[i3 + 1] + fy + springY + floatY) * damping
        velocities[i3 + 2] = (velocities[i3 + 2] + fz + springZ + floatZ) * damping
        
        // Update positions
        positions[i3] += velocities[i3]
        positions[i3 + 1] += velocities[i3 + 1]
        positions[i3 + 2] += velocities[i3 + 2]
      }
      
      pointsRef.current.geometry.attributes.position.needsUpdate = true
    }
    
    // Animate connection lines opacity based on time
    if (linesRef.current && linesRef.current.material instanceof THREE.LineBasicMaterial) {
      linesRef.current.material.opacity = 0.2 + Math.sin(time * 0.5) * 0.1
    }
    captureAnchor(state.camera)
  })

  return (
    <group ref={groupRef}>
      {/* Neural connections */}
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[nodeData.connections, 3]}
            count={nodeData.connections.length / 3}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#3b82f6" transparent opacity={0.25} />
      </lineSegments>

      {/* Main neural nodes - outer glow */}
      <Points ref={pointsRef} positions={nodeData.current} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#06b6d4"
          size={0.12}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>

      {/* Inner glow nodes */}
      <Points ref={glowPointsRef} positions={nodeData.original} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#a855f7"
          size={0.06}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.85}
        />
      </Points>

      {/* Core bright nodes */}
      <Points ref={originalPointsRef} positions={nodeData.original} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#ffffff"
          size={0.03}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.7}
        />
      </Points>
    </group>
  )
}

function FloatingParticles({ active }: { active: boolean }) {
  const ref = useRef<THREE.Points>(null)
  const ref2 = useRef<THREE.Points>(null)
  const ref3 = useRef<THREE.Points>(null)
  const animationTime = useRef(0)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (!active) return

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: -(e.clientY / window.innerHeight - 0.5) * 2,
      })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [active])

  const [particles, particles2, particles3] = useMemo(() => {
    const positions = new Float32Array(500 * 3)
    const positions2 = new Float32Array(300 * 3)
    const positions3 = new Float32Array(150 * 3)

    for (let i = 0; i < 500; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20
    }

    for (let i = 0; i < 300; i++) {
      positions2[i * 3] = (Math.random() - 0.5) * 14
      positions2[i * 3 + 1] = (Math.random() - 0.5) * 14
      positions2[i * 3 + 2] = (Math.random() - 0.5) * 14
    }
    
    // Orbiting particles closer to center
    for (let i = 0; i < 150; i++) {
      const angle = (i / 150) * Math.PI * 2
      const radius = 3.5 + Math.random() * 1.5
      positions3[i * 3] = Math.cos(angle) * radius
      positions3[i * 3 + 1] = (Math.random() - 0.5) * 2
      positions3[i * 3 + 2] = Math.sin(angle) * radius
    }

    return [positions, positions2, positions3]
  }, [])

  useFrame((_state, delta) => {
    if (!active) return
    animationTime.current += Math.min(delta, 0.1)
    const time = animationTime.current
    
    if (ref.current) {
      ref.current.rotation.y = time * 0.012 + mousePosition.x * 0.1
      ref.current.rotation.x = Math.sin(time * 0.04) * 0.08 + mousePosition.y * 0.05
    }
    if (ref2.current) {
      ref2.current.rotation.y = -time * 0.018 + mousePosition.x * 0.15
      ref2.current.rotation.z = Math.cos(time * 0.06) * 0.06
    }
    if (ref3.current) {
      // Faster orbiting particles
      ref3.current.rotation.y = time * 0.3
      ref3.current.rotation.x = Math.sin(time * 0.2) * 0.1
    }
  })

  return (
    <>
      {/* Distant stars */}
      <Points ref={ref} positions={particles} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#3b82f6"
          size={0.018}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.6}
        />
      </Points>
      
      {/* Mid-range particles */}
      <Points ref={ref2} positions={particles2} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#a855f7"
          size={0.015}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.5}
        />
      </Points>
      
      {/* Orbiting particles */}
      <Points ref={ref3} positions={particles3} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#06b6d4"
          size={0.025}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.7}
        />
      </Points>
    </>
  )
}

// Animated pulse rings around the brain
function PulseRings({ active }: { active: boolean }) {
  const ringRef1 = useRef<THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>>(null)
  const ringRef2 = useRef<THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>>(null)
  const ringRef3 = useRef<THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>>(null)
  const animationTime = useRef(0)

  useFrame((_state, delta) => {
    if (!active) return
    animationTime.current += Math.min(delta, 0.1)
    const time = animationTime.current
    
    if (ringRef1.current) {
      const scale = 1 + (time % 2) * 0.8
      ringRef1.current.scale.setScalar(scale)
      ringRef1.current.material.opacity = Math.max(0, 0.4 - (time % 2) * 0.2)
    }
    if (ringRef2.current) {
      const scale = 1 + ((time + 0.66) % 2) * 0.8
      ringRef2.current.scale.setScalar(scale)
      ringRef2.current.material.opacity = Math.max(0, 0.3 - ((time + 0.66) % 2) * 0.15)
    }
    if (ringRef3.current) {
      const scale = 1 + ((time + 1.33) % 2) * 0.8
      ringRef3.current.scale.setScalar(scale)
      ringRef3.current.material.opacity = Math.max(0, 0.25 - ((time + 1.33) % 2) * 0.125)
    }
  })

  return (
    <>
      <mesh ref={ringRef1} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.8, 2.85, 64]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={ringRef2} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.8, 2.85, 64]} />
        <meshBasicMaterial color="#a855f7" transparent opacity={0.25} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={ringRef3} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.8, 2.85, 64]} />
        <meshBasicMaterial color="#06b6d4" transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>
    </>
  )
}

class NeuralCanvasBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}

function ContextLossGuard({ onLost }: { onLost: () => void }) {
  const gl = useThree((state) => state.gl)

  useEffect(() => {
    const canvas = gl.domElement
    const handleContextLost = (event: Event) => {
      event.preventDefault()
      onLost()
    }

    canvas.addEventListener("webglcontextlost", handleContextLost)
    if (gl.getContext().isContextLost()) onLost()

    return () => canvas.removeEventListener("webglcontextlost", handleContextLost)
  }, [gl, onLost])

  return null
}

export function NeuralBrain({ active = true }: { active?: boolean }) {
  const [canRender, setCanRender] = useState(false)
  const disableCanvas = useCallback(() => setCanRender(false), [])

  useEffect(() => {
    // Three requires WebGL2. Keep the decorative background optional.
    const canvas = document.createElement("canvas")
    try {
      const context = canvas.getContext("webgl2", { antialias: true, alpha: true })
      setCanRender(Boolean(context))
      context?.getExtension("WEBGL_lose_context")?.loseContext()
    } catch {
      setCanRender(false)
    }
  }, [])

  return (
    <div className="absolute inset-0 -z-10">
      {canRender && (
        <NeuralCanvasBoundary>
          <Canvas
            camera={{ position: [0, 0, 8], fov: 50 }}
            dpr={[1, 2]}
            frameloop={active ? "always" : "demand"}
            fallback={null}
            gl={{ antialias: true, alpha: true }}
          >
            <ContextLossGuard onLost={disableCanvas} />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={0.4} color="#3b82f6" />
            <pointLight position={[-10, -10, -10]} intensity={0.3} color="#a855f7" />
            <pointLight position={[0, 10, 5]} intensity={0.2} color="#06b6d4" />
            <NeuralNodes active={active} />
            <FloatingParticles active={active} />
            <PulseRings active={active} />
          </Canvas>
        </NeuralCanvasBoundary>
      )}
    </div>
  )
}
