"use client"

import { useRef, useMemo, useState, useEffect } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Points, PointMaterial } from "@react-three/drei"
import * as THREE from "three"

function NeuralNodes() {
  const groupRef = useRef<THREE.Group>(null)
  const pointsRef = useRef<THREE.Points>(null)
  const linesRef = useRef<THREE.LineSegments>(null)
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

  useEffect(() => {
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
  }, [])

  useFrame((state) => {
    const time = state.clock.elapsedTime
    
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
  })

  return (
    <group ref={groupRef}>
      {/* Neural connections */}
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={nodeData.connections.length / 3}
            array={nodeData.connections}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#3b82f6" transparent opacity={0.25} />
      </lineSegments>

      {/* Main neural nodes - outer glow */}
      <Points ref={pointsRef} positions={nodeData.current.slice()} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#06b6d4"
          size={0.12}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>

      {/* Inner glow nodes */}
      <Points positions={nodeData.original} stride={3} frustumCulled={false}>
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
      <Points positions={nodeData.original} stride={3} frustumCulled={false}>
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

function FloatingParticles() {
  const ref = useRef<THREE.Points>(null)
  const ref2 = useRef<THREE.Points>(null)
  const ref3 = useRef<THREE.Points>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: -(e.clientY / window.innerHeight - 0.5) * 2,
      })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

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

  useFrame((state) => {
    const time = state.clock.elapsedTime
    
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
function PulseRings() {
  const ringRef1 = useRef<THREE.Mesh>(null)
  const ringRef2 = useRef<THREE.Mesh>(null)
  const ringRef3 = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    const time = state.clock.elapsedTime
    
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

export function NeuralBrain() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={0.4} color="#3b82f6" />
        <pointLight position={[-10, -10, -10]} intensity={0.3} color="#a855f7" />
        <pointLight position={[0, 10, 5]} intensity={0.2} color="#06b6d4" />
        <NeuralNodes />
        <FloatingParticles />
        <PulseRings />
      </Canvas>
    </div>
  )
}
