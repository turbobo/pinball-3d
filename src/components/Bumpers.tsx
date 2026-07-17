import { useSphere, useCylinder } from '@react-three/cannon'
import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface BumperProps {
  position: [number, number, number]
  radius?: number
  points?: number
  force?: number
  onHit?: (points: number, position: THREE.Vector3) => void
}

export function Bumper({ position, radius = 0.4, points = 100, force = 5, onHit }: BumperProps) {
  const [isHit, setIsHit] = useState(false)
  const meshRef = useRef<THREE.Mesh>(null)

  const [ref, api] = useCylinder(() => ({
    mass: 0,
    position,
    args: [radius, radius, 0.3, 16],
    userData: { type: 'bumper', points },
    onCollide: (e) => {
      if (e.body.userData?.type === 'ball') {
        setIsHit(true)
        onHit?.(points, new THREE.Vector3(...position))
        
        // 施加弹开力（应用心流系统调整）
        const ballBody = e.body as any
        const forceMagnitude = force
        const forceVec = new THREE.Vector3(
          (Math.random() - 0.5) * 3,
          2,
          (Math.random() - 0.5) * 3
        ).normalize().multiplyScalar(forceMagnitude)
        ballBody.applyImpulse(forceVec.toArray(), [0, 0, 0])
        
        // 重置高亮
        setTimeout(() => setIsHit(false), 200)
      }
    },
  }))

  // 动画效果
  useFrame(() => {
    if (meshRef.current && isHit) {
      meshRef.current.scale.setScalar(1.1)
    } else if (meshRef.current) {
      meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1)
    }
  })

  return (
    <group>
      {/* 物理体 */}
      <mesh ref={ref as any}>
        <cylinderGeometry args={[radius, radius, 0.3, 16]} />
        <meshStandardMaterial transparent opacity={0} />
      </mesh>
      
      {/* 视觉模型 - Windows 弹球风格彩色弹珠台 */}
      <mesh ref={meshRef} position={position} castShadow>
        <cylinderGeometry args={[radius, radius, 0.3, 16]} />
        <meshStandardMaterial
          color={isHit ? hitColor : color}
          metalness={0.7}
          roughness={0.2}
          emissive={isHit ? hitColor : color}
          emissiveIntensity={isHit ? 1.0 : 0.4}
        />
      </mesh>
      
      {/* 顶部装饰 - 金属质感 */}
      <mesh position={[position[0], position[1] + 0.2, position[2]]}>
        <cylinderGeometry args={[radius * 0.6, radius * 0.6, 0.1, 16]} />
        <meshStandardMaterial
          color={isHit ? '#ffd700' : '#d0d0d0'}
          metalness={0.9}
          roughness={0.1}
          emissive={isHit ? '#ffd700' : '#808080'}
          emissiveIntensity={isHit ? 1.0 : 0.3}
        />
      </mesh>
    </group>
  )
}

interface BumpersProps {
  onHit?: (points: number, position: THREE.Vector3) => void
  force?: number
}

export function Bumpers({ onHit, force = 5 }: BumpersProps) {
  // Windows 弹球风格：红、黄、绿彩色弹珠台
  const bumperPositions: Array<{ 
    pos: [number, number, number]
    radius: number
    points: number
    color: string
    hitColor: string
  }> = [
    // 顶部三角形布局 - 红色高分区
    { pos: [0, 2, 0], radius: 0.5, points: 100, color: '#ff3b30', hitColor: '#ff6b35' },
    { pos: [-1.2, 1.2, 0], radius: 0.4, points: 100, color: '#ff3b30', hitColor: '#ff6b35' },
    { pos: [1.2, 1.2, 0], radius: 0.4, points: 100, color: '#ff3b30', hitColor: '#ff6b35' },
    
    // 中部弹珠台 - 黄色中分区
    { pos: [-2, 0, 0], radius: 0.35, points: 50, color: '#ffcc00', hitColor: '#ffed4e' },
    { pos: [2, 0, 0], radius: 0.35, points: 50, color: '#ffcc00', hitColor: '#ffed4e' },
    
    // 特殊高分目标 - 绿色超高分
    { pos: [0, 3.5, 0], radius: 0.6, points: 500, color: '#34c759', hitColor: '#30d158' },
  ]

  return (
    <>
      {bumperPositions.map((bumper, index) => (
        <Bumper
          key={index}
          position={bumper.pos}
          radius={bumper.radius}
          points={bumper.points}
          force={force}
          onHit={onHit}
        />
      ))}
    </>
  )
}
