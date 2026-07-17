import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface Particle {
  position: THREE.Vector3
  velocity: THREE.Vector3
  life: number
  maxLife: number
}

interface ParticleSystemProps {
  position: THREE.Vector3 | null
  color?: string
  particleCount?: number
}

export function ParticleSystem({ position, color = '#ff6b35', particleCount = 20 }: ParticleSystemProps) {
  const particlesRef = useRef<Particle[]>([])
  const [visible, setVisible] = useState(false)
  const meshRefs = useRef<(THREE.Mesh | null)[]>([])

  // 初始化粒子
  if (position && particlesRef.current.length === 0) {
    const particles: Particle[] = []
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount
      const speed = 2 + Math.random() * 3
      particles.push({
        position: position.clone(),
        velocity: new THREE.Vector3(
          Math.cos(angle) * speed,
          Math.sin(angle) * speed,
          (Math.random() - 0.5) * 2
        ),
        life: 0,
        maxLife: 0.5 + Math.random() * 0.3
      })
    }
    particlesRef.current = particles
    setVisible(true)
  }

  useFrame((_, delta) => {
    if (!visible) return

    let allDead = true
    particlesRef.current.forEach((particle, index) => {
      particle.life += delta
      if (particle.life < particle.maxLife) {
        allDead = false
        particle.position.add(particle.velocity.clone().multiplyScalar(delta))
        particle.velocity.y -= 9.8 * delta // 重力

        const mesh = meshRefs.current[index]
        if (mesh) {
          mesh.position.copy(particle.position)
          const scale = 1 - particle.life / particle.maxLife
          mesh.scale.setScalar(scale * 0.1)
        }
      }
    })

    if (allDead) {
      particlesRef.current = []
      setVisible(false)
    }
  })

  if (!visible) return null

  return (
    <>
      {particlesRef.current.map((_, index) => (
        <mesh
          key={index}
          ref={(el) => { meshRefs.current[index] = el }}
        >
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={2}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}
    </>
  )
}
