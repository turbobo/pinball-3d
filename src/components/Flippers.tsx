import { useBox, useCylinder } from '@react-three/cannon'
import { useFrame } from '@react-three/fiber'
import { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'

interface FlipperProps {
  position: [number, number, number]
  side: 'left' | 'right'
  width?: number
  onFlip?: () => void
}

export function Flipper({ position, side, width = 0.8, onFlip }: FlipperProps) {
  const [isPressed, setIsPressed] = useState(false)
  const targetRotation = useRef(side === 'left' ? 0.3 : -0.3)
  
  const [ref, api] = useBox(() => ({
    mass: 0,
    position,
    args: [width, 0.15, 0.15],
    rotation: [0, 0, side === 'left' ? 0.3 : -0.3],
    type: 'Kinematic',
  }))

  // 键盘控制
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (side === 'left' && (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft')) {
        setIsPressed(true)
        onFlip?.()
        targetRotation.current = -0.5
      }
      if (side === 'right' && (e.key === 'l' || e.key === 'L' || e.key === 'ArrowRight')) {
        setIsPressed(true)
        onFlip?.()
        targetRotation.current = 0.5
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (side === 'left' && (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft')) {
        setIsPressed(false)
        targetRotation.current = 0.3
      }
      if (side === 'right' && (e.key === 'l' || e.key === 'L' || e.key === 'ArrowRight')) {
        setIsPressed(false)
        targetRotation.current = -0.3
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [side, api, onFlip])

  // 平滑旋转动画
  useFrame(() => {
    api.rotation.set(0, 0, targetRotation.current)
  })

  return (
    <mesh ref={ref as any} castShadow>
      <boxGeometry args={[width, 0.15, 0.15]} />
      <meshStandardMaterial
        color={isPressed ? '#ff6b35' : '#c0c0c0'}
        metalness={0.7}
        roughness={0.3}
        emissive={isPressed ? '#ff6b35' : '#404040'}
        emissiveIntensity={isPressed ? 0.5 : 0.2}
      />
    </mesh>
  )
}

interface FlippersProps {
  onFlip?: (side: 'left' | 'right') => void
  width?: number
}

export function Flippers({ onFlip, width = 0.8 }: FlippersProps) {
  return (
    <>
      <Flipper
        position={[-1.5, -3, 0]}
        side="left"
        width={width}
        onFlip={() => onFlip?.('left')}
      />
      <Flipper
        position={[1.5, -3, 0]}
        side="right"
        width={width}
        onFlip={() => onFlip?.('right')}
      />
    </>
  )
}
