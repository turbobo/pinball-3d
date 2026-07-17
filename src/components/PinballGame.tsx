import { useState, useCallback, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/cannon'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { Ball } from './Ball'
import { Flippers } from './Flippers'
import { Bumpers } from './Bumpers'
import { PinballTable } from './PinballTable'
import * as THREE from 'three'

export function PinballGame() {
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [combo, setCombo] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const comboRef = useRef(0)
  const comboTimerRef = useRef<NodeJS.Timeout | null>(null)

  const handleBumperHit = useCallback((points: number, position: THREE.Vector3) => {
    const newCombo = comboRef.current + 1
    comboRef.current = newCombo
    const multiplier = Math.min(newCombo, 5) // 最大 5 倍连击
    const earnedPoints = points * multiplier
    
    setScore(prev => prev + earnedPoints)
    setCombo(newCombo)
    
    // 清除之前的计时器
    if (comboTimerRef.current) {
      clearTimeout(comboTimerRef.current)
    }
    
    // 连击重置计时器
    comboTimerRef.current = setTimeout(() => {
      comboRef.current = 0
      setCombo(0)
    }, 2000)
  }, [])

  const handleDrain = useCallback(() => {
    setLives(prev => {
      const newLives = prev - 1
      if (newLives <= 0) {
        setGameOver(true)
      }
      return newLives
    })
    setCombo(0) // 重置连击
  }, [])

  const handleFlip = useCallback((side: 'left' | 'right') => {
    // 挡板击打音效可以在这里添加
    console.log(`Flipper ${side} activated`)
  }, [])

  const resetGame = useCallback(() => {
    setScore(0)
    setLives(3)
    setCombo(0)
    setGameOver(false)
  }, [])

  return (
    <div className="w-full h-screen relative" style={{ 
      background: 'linear-gradient(180deg, #0a1628 0%, #1a2332 50%, #0f1419 100%)'
    }}>
      {/* UI 覆盖层 */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 pointer-events-none">
        <div className="flex justify-between items-start">
          {/* 得分 */}
          <div className="bg-black/70 backdrop-blur-md rounded-lg px-6 py-3 border border-gray-700">
            <div className="text-xs text-gray-400 mb-1">SCORE</div>
            <div className="text-3xl font-bold text-white font-mono">
              {score.toLocaleString()}
            </div>
            {combo > 1 && (
              <div className="text-xs text-yellow-400 mt-1">
                COMBO ×{combo}
              </div>
            )}
          </div>

          {/* 生命 */}
          <div className="bg-black/70 backdrop-blur-md rounded-lg px-6 py-3 border border-gray-700">
            <div className="text-xs text-gray-400 mb-1">LIVES</div>
            <div className="flex gap-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full ${
                    i < lives ? 'bg-red-500' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 控制提示 */}
      <div className="absolute bottom-4 left-4 z-10 bg-black/70 backdrop-blur-md rounded-lg px-4 py-2 border border-gray-700 pointer-events-none">
        <div className="text-xs text-gray-400 space-y-1">
          <div><span className="text-white font-mono">A/←</span> 左挡板</div>
          <div><span className="text-white font-mono">L/→</span> 右挡板</div>
          <div><span className="text-white font-mono">Space</span> 发射</div>
        </div>
      </div>

      {/* 发射提示 */}
      {!gameOver && lives > 0 && (
        <div className="absolute bottom-4 right-4 z-10 pointer-events-none">
          <div className="bg-orange-500/80 backdrop-blur-md rounded-lg px-4 py-2 border border-orange-400 animate-pulse">
            <div className="text-sm text-white font-bold">按 SPACE 发射弹珠</div>
          </div>
        </div>
      )}

      {/* 游戏结束覆盖层 */}
      {gameOver && (
        <div className="absolute inset-0 z-20 bg-black/80 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-black/90 rounded-2xl p-8 border border-gray-700 text-center">
            <h2 className="text-4xl font-bold text-white mb-4">GAME OVER</h2>
            <div className="text-2xl text-gray-300 mb-6">
              Final Score: <span className="text-yellow-400 font-bold">{score.toLocaleString()}</span>
            </div>
            <button
              onClick={resetGame}
              className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-lg hover:from-orange-400 hover:to-red-400 transition-all transform hover:scale-105 pointer-events-auto"
            >
              PLAY AGAIN
            </button>
          </div>
        </div>
      )}

      {/* 3D 场景 */}
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={60} />
        <OrbitControls 
          enablePan={false}
          minDistance={6}
          maxDistance={12}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2}
        />

        {/* 光照 */}
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} intensity={1} castShadow />
        <pointLight position={[-5, 5, 5]} intensity={0.5} />
        <spotLight
          position={[0, 8, 4]}
          angle={0.5}
          penumbra={0.5}
          intensity={1.5}
          castShadow
        />

        {/* 物理世界 */}
        <Physics gravity={[0, -9.82, 0]}>
          {/* 弹珠台 */}
          <PinballTable onDrain={handleDrain} />
          
          {/* 弹珠 */}
          <Ball 
            position={[0, -3, 0]}
            onDrain={handleDrain}
            onBumperHit={handleBumperHit}
          />
          
          {/* 挡板 */}
          <Flippers onFlip={handleFlip} />
          
          {/* 弹珠台 */}
          <Bumpers onHit={handleBumperHit} />
        </Physics>
      </Canvas>
    </div>
  )
}
