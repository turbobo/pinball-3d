import { useState, useCallback, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/cannon'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { Ball } from './Ball'
import { Flippers } from './Flippers'
import { Bumpers } from './Bumpers'
import { PinballTable } from './PinballTable'
import { ParticleSystem } from './ParticleSystem'
import { audioSystem } from '../utils/audio'
import { flowSystem } from '../utils/flowSystem'
import { achievementSystem, variableRewardSystem, type Achievement } from '../utils/achievementSystem'
import * as THREE from 'three'

export function PinballGame() {
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [combo, setCombo] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const comboRef = useRef(0)
  const comboTimerRef = useRef<NodeJS.Timeout | null>(null)
  const [particlePosition, setParticlePosition] = useState<THREE.Vector3 | null>(null)
  const [screenShake, setScreenShake] = useState(false)
  const [unlockedAchievement, setUnlockedAchievement] = useState<Achievement | null>(null)
  const [achievements, setAchievements] = useState<Achievement[]>(achievementSystem.getAll())
  const [maxCombo, setMaxCombo] = useState(0)
  const [totalBumperHits, setTotalBumperHits] = useState(0)

  // 设置成就解锁回调
  achievementSystem.setOnUnlock((achievement) => {
    setUnlockedAchievement(achievement)
    audioSystem.playAchievement()
    setAchievements(achievementSystem.getAll())
    setTimeout(() => setUnlockedAchievement(null), 3000)
  })

  const handleBumperHit = useCallback((points: number, position: THREE.Vector3) => {
    const newCombo = comboRef.current + 1
    comboRef.current = newCombo
    const multiplier = Math.min(newCombo, 5) // 最大 5 倍连击
    
    // 更新最高连击
    if (newCombo > maxCombo) {
      setMaxCombo(newCombo)
    }
    
    // 更新总碰撞次数
    setTotalBumperHits(prev => prev + 1)
    
    // 可变奖励：10% 概率触发超级弹珠台（原理79）
    let earnedPoints = points * multiplier
    if (variableRewardSystem.checkSuperBumper()) {
      earnedPoints *= 3
      achievementSystem.checkSuperBumper()
    }
    
    const newScore = score + earnedPoints
    setScore(newScore)
    setCombo(newCombo)
    
    // 心流系统记录（原理38：心流设计）
    flowSystem.recordScore(newScore)
    flowSystem.recordCombo(newCombo)
    flowSystem.resetDrainCount() // 成功得分时重置连续失去生命
    
    // 成就系统检查（原理96：成就感）
    achievementSystem.checkScore(newScore)
    achievementSystem.checkCombo(newCombo)
    achievementSystem.checkSurvivor(lives)
    
    // 音效反馈（原理6：反馈循环）
    audioSystem.playBumperHit()
    audioSystem.playScore(earnedPoints)
    if (newCombo > 1) {
      audioSystem.playCombo(newCombo)
    }
    
    // 视觉反馈：粒子效果 + 屏幕震动
    setParticlePosition(position.clone())
    setScreenShake(true)
    setTimeout(() => {
      setParticlePosition(null)
      setScreenShake(false)
    }, 300)
    
    // 清除之前的计时器
    if (comboTimerRef.current) {
      clearTimeout(comboTimerRef.current)
    }
    
    // 连击重置计时器
    comboTimerRef.current = setTimeout(() => {
      comboRef.current = 0
      setCombo(0)
    }, 2000)
  }, [score, lives, maxCombo])

  const handleDrain = useCallback(() => {
    audioSystem.playDrain()
    flowSystem.recordDrain() // 心流系统记录失去生命
    setLives(prev => {
      const newLives = prev - 1
      if (newLives <= 0) {
        setGameOver(true)
        audioSystem.playGameOver()
      }
      return newLives
    })
    setCombo(0) // 重置连击
  }, [])

  const handleFlip = useCallback((side: 'left' | 'right') => {
    audioSystem.playFlipper()
  }, [])

  const resetGame = useCallback(() => {
    setScore(0)
    setLives(3)
    setCombo(0)
    setGameOver(false)
    setGameStarted(true)
    setMaxCombo(0)
    setTotalBumperHits(0)
    flowSystem.reset() // 重置心流系统
    achievementSystem.reset() // 重置成就系统
    setAchievements(achievementSystem.getAll())
  }, [])

  const startGame = useCallback(() => {
    setGameStarted(true)
  }, [])

  // 获取心流系统调整后的物理参数
  const flowState = flowSystem.getState()
  const bumperForce = flowSystem.getBumperForce()
  const flipperWidth = flowSystem.getFlipperWidth()

  return (
    <div className={`w-full h-screen bg-gradient-to-b from-gray-900 to-black relative ${screenShake ? 'animate-shake' : ''}`}>
      {/* 开始界面 */}
      {!gameStarted && (
        <div className="absolute inset-0 z-30 bg-gradient-to-b from-gray-900 via-purple-900 to-black flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-white mb-4 animate-pulse">
              🎮 三维弹球
            </h1>
            <p className="text-xl text-gray-300 mb-8">太空弹珠台</p>
            <button
              onClick={startGame}
              className="px-12 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white text-2xl font-bold rounded-lg hover:from-orange-400 hover:to-red-400 transition-all transform hover:scale-105 shadow-lg"
            >
              开始游戏
            </button>
            <div className="mt-8 text-gray-400 text-sm space-y-2">
              <p><span className="text-white font-mono">A/←</span> 左挡板 | <span className="text-white font-mono">L/→</span> 右挡板 | <span className="text-white font-mono">Space</span> 发射</p>
              <p className="text-xs text-gray-500 mt-4">基于《游戏设计的100个原理》优化</p>
            </div>
          </div>
        </div>
      )}

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

      {/* 成就解锁提示 */}
      {unlockedAchievement && (
        <div className="absolute top-24 right-4 z-10 animate-slide-in">
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg px-6 py-4 border-2 border-yellow-300 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="text-4xl">{unlockedAchievement.icon}</div>
              <div>
                <div className="text-xs text-yellow-100 font-bold">成就解锁！</div>
                <div className="text-lg text-white font-bold">{unlockedAchievement.name}</div>
                <div className="text-xs text-yellow-100">{unlockedAchievement.description}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 成就统计 */}
      <div className="absolute top-4 right-4 z-10 bg-black/70 backdrop-blur-md rounded-lg px-4 py-2 border border-gray-700 pointer-events-none">
        <div className="text-xs text-gray-400 mb-1">成就</div>
        <div className="text-lg text-white font-bold">
          {achievements.filter(a => a.unlocked).length} / {achievements.length}
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
          <div className="bg-black/90 rounded-2xl p-8 border border-gray-700 text-center max-w-md">
            <h2 className="text-4xl font-bold text-white mb-4">GAME OVER</h2>
            <div className="text-2xl text-gray-300 mb-6">
              Final Score: <span className="text-yellow-400 font-bold">{score.toLocaleString()}</span>
            </div>
            
            {/* 游戏数据统计 */}
            <div className="grid grid-cols-2 gap-4 mb-6 text-left">
              <div className="bg-gray-800/50 rounded-lg p-3">
                <div className="text-xs text-gray-400">最高连击</div>
                <div className="text-xl text-orange-400 font-bold">×{maxCombo}</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3">
                <div className="text-xs text-gray-400">碰撞次数</div>
                <div className="text-xl text-blue-400 font-bold">{totalBumperHits}</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3">
                <div className="text-xs text-gray-400">解锁成就</div>
                <div className="text-xl text-yellow-400 font-bold">
                  {achievements.filter(a => a.unlocked).length} / {achievements.length}
                </div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3">
                <div className="text-xs text-gray-400">平均得分</div>
                <div className="text-xl text-green-400 font-bold">
                  {totalBumperHits > 0 ? Math.round(score / totalBumperHits) : 0}
                </div>
              </div>
            </div>

            {/* 成就列表 */}
            {achievements.filter(a => a.unlocked).length > 0 && (
              <div className="mb-6">
                <div className="text-sm text-gray-400 mb-2">已解锁成就</div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {achievements.filter(a => a.unlocked).map(a => (
                    <div key={a.id} className="text-2xl" title={a.name}>
                      {a.icon}
                    </div>
                  ))}
                </div>
              </div>
            )}

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
          <Flippers onFlip={handleFlip} width={flipperWidth} />
          
          {/* 弹珠台 */}
          <Bumpers onHit={handleBumperHit} force={bumperForce} />
          
          {/* 粒子效果 */}
          <ParticleSystem position={particlePosition} color="#ff6b35" particleCount={15} />
        </Physics>
      </Canvas>
    </div>
  )
}
