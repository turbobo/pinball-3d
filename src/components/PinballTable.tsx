import { useBox, usePlane } from '@react-three/cannon'
import { useRef } from 'react'
import * as THREE from 'three'

// 弹珠台边界
function TableWall({ position, rotation, args }: { 
  position: [number, number, number]
  rotation?: [number, number, number]
  args: [number, number, number]
}) {
  const [ref] = useBox(() => ({
    mass: 0,
    position,
    rotation: rotation || [0, 0, 0],
    args,
  }))

  return (
    <mesh ref={ref as any}>
      <boxGeometry args={args} />
      <meshStandardMaterial
        color="#1a2332"
        metalness={0.7}
        roughness={0.3}
      />
    </mesh>
  )
}

// 底部排水口
function Drain({ onDrain }: { onDrain?: () => void }) {
  const [ref] = useBox(() => ({
    mass: 0,
    position: [0, -4.5, 0],
    args: [4, 0.1, 2],
    userData: { type: 'drain' },
    onCollide: (e) => {
      if (e.body.userData?.type === 'ball') {
        onDrain?.()
      }
    },
  }))

  return (
    <mesh ref={ref as any}>
      <boxGeometry args={[4, 0.1, 2]} />
      <meshStandardMaterial
        color="#0a1628"
        metalness={0.6}
        roughness={0.5}
      />
    </mesh>
  )
}

interface PinballTableProps {
  onDrain?: () => void
}

export function PinballTable({ onDrain }: PinballTableProps) {
  return (
    <group>
      {/* 弹珠台底板 - Windows 弹球风格深蓝 */}
      <mesh position={[0, 0, -0.1]} receiveShadow>
        <boxGeometry args={[6, 10, 0.1]} />
        <meshStandardMaterial
          color="#0f1828"
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>

      {/* 左边界 */}
      <TableWall position={[-3, 0, 0]} args={[0.2, 10, 0.3]} />
      
      {/* 右边界 */}
      <TableWall position={[3, 0, 0]} args={[0.2, 10, 0.3]} />
      
      {/* 顶部边界 */}
      <TableWall position={[0, 5, 0]} args={[6, 0.2, 0.3]} />
      
      {/* 底部左斜坡 */}
      <TableWall 
        position={[-2, -4, 0]} 
        rotation={[0, 0, -0.3]}
        args={[2, 0.2, 0.3]} 
      />
      
      {/* 底部右斜坡 */}
      <TableWall 
        position={[2, -4, 0]} 
        rotation={[0, 0, 0.3]}
        args={[2, 0.2, 0.3]} 
      />

      {/* 排水口 */}
      <Drain onDrain={onDrain} />

      {/* 装饰边框 - 铬合金银色 */}
      <mesh position={[0, 0, 0.15]}>
        <boxGeometry args={[6.2, 10.2, 0.05]} />
        <meshStandardMaterial
          color="#e0e0e0"
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
    </group>
  )
}
