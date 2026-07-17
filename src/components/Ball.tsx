import { useBox, useSphere } from '@react-three/cannon'
import { useFrame } from '@react-three/fiber'
import { useRef, useState, useEffect } from 'react'
import { Environment } from '@react-three/drei'
import * as THREE from 'three'

interface BallProps {
  position?: [number, number, number]
  onDrain?: () => void
  onBumperHit?: (points: number, position: THREE.Vector3) => void
}

export function Ball({ position = [0, -3, 0], onDrain, onBumperHit }: BallProps) {
  const [isLaunched, setIsLaunched] = useState(false)
  const [ref, api] = useSphere(() => ({
    mass: 0.1,
    position,
    args: [0.2],
    restitution: 0.8,
    onCollide: (e) => {
      // 检测碰撞对象
      const body = e.body as any
      if (body.userData?.type === 'bumper') {
        // 弹珠台碰撞 - 由 Bumper 组件处理弹开力
        const points = body.userData.points || 100
        onBumperHit?.(points, new THREE.Vector3(...body.position))
      } else if (body.userData?.type === 'drain') {
        // 排水口碰撞
        onDrain?.()
      }
    },
  }))

  // 空格键发射（向上发射）
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isLaunched) {
        e.preventDefault()
        setIsLaunched(true)
        api.velocity.set(0, 8, 0) // 向上发射
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isLaunched, api])

  // 检测弹珠是否落入底部
  useFrame(() => {
    if (ref.current) {
      const pos = ref.current.position
      if (pos.y < -4.5) {
        // 重置弹珠位置到底部
        setIsLaunched(false)
        api.position.set(0, -3, 0)
        api.velocity.set(0, 0, 0)
      }
    }
  })

  return (
    <group>
      {/* 环境贴图提供真实反射 */}
      <Environment preset="studio" />
      
      {/* 弹珠主体 - Windows 弹球风格 */}
      <mesh ref={ref as any} castShadow>
        <sphereGeometry args={[0.2, 64, 64]} />
        <meshStandardMaterial
          color="#d4d4d4"
          metalness={0.95}
          roughness={0.05}
          envMapIntensity={1.5}
        />
      </mesh>
    </group>
  )
}
