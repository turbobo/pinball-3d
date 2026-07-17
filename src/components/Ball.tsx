import { useBox, useSphere } from '@react-three/cannon'
import { useFrame } from '@react-three/fiber'
import { useRef, useState } from 'react'
import * as THREE from 'three'

interface BallProps {
  position?: [number, number, number]
  onDrain?: () => void
  onBumperHit?: (position: THREE.Vector3) => void
}

export function Ball({ position = [0, 5, 0], onDrain, onBumperHit }: BallProps) {
  const [ref, api] = useSphere(() => ({
    mass: 0.1,
    position,
    args: [0.2],
    restitution: 0.8,
    onCollide: (e) => {
      // 检测碰撞对象
      const body = e.body as any
      if (body.userData?.type === 'bumper') {
        // 弹珠台碰撞
        onBumperHit?.(new THREE.Vector3(...body.position))
        // 施加弹开力
        const force = new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          3,
          (Math.random() - 0.5) * 2
        )
        api.applyImpulse(force.toArray(), [0, 0, 0])
      } else if (body.userData?.type === 'drain') {
        // 排水口碰撞
        onDrain?.()
      }
    },
  }))

  // 检测弹珠是否落入底部
  useFrame(() => {
    if (ref.current) {
      const pos = ref.current.position
      if (pos.y < -5) {
        // 重置弹珠位置
        api.position.set(0, 5, 0)
        api.velocity.set(0, 0, 0)
      }
    }
  })

  return (
    <mesh ref={ref as any} castShadow>
      <sphereGeometry args={[0.2, 32, 32]} />
      <meshStandardMaterial
        color="#c0c0c0"
        metalness={0.9}
        roughness={0.1}
        emissive="#404040"
        emissiveIntensity={0.2}
      />
    </mesh>
  )
}
