// 音效系统 - 使用 Web Audio API 生成音效

class AudioSystem {
  private audioContext: AudioContext | null = null
  private enabled: boolean = true

  constructor() {
    // 延迟初始化 AudioContext（需要用户交互）
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
  }

  private getContext(): AudioContext | null {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    // 如果上下文被挂起，恢复它
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume()
    }
    return this.audioContext
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled
  }

  // 发射音效 - 弹簧发射声
  playLaunch() {
    if (!this.enabled) return
    const ctx = this.getContext()
    if (!ctx) return

    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    // 快速上升音阶
    oscillator.frequency.setValueAtTime(200, ctx.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1)
    oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.2)

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.2)
  }

  // 碰撞音效 - 金属撞击声
  playBumperHit(bumperType: 'red' | 'yellow' | 'green' = 'red') {
    if (!this.enabled) return
    const ctx = this.getContext()
    if (!ctx) return

    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    // 根据弹珠台类型变化音调
    const baseFreq = bumperType === 'red' ? 440 : 
                     bumperType === 'yellow' ? 330 : 220

    oscillator.frequency.setValueAtTime(baseFreq, ctx.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(
      baseFreq * 2, 
      ctx.currentTime + 0.05
    )
    oscillator.frequency.exponentialRampToValueAtTime(
      baseFreq * 0.5, 
      ctx.currentTime + 0.1
    )

    gainNode.gain.setValueAtTime(0.4, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)

    oscillator.type = 'square'
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.1)
  }

  // 挡板击打音效 - 木质击打声
  playFlipper() {
    if (!this.enabled) return
    const ctx = this.getContext()
    if (!ctx) return

    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.frequency.setValueAtTime(150, ctx.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.15)

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15)

    oscillator.type = 'triangle'
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.15)
  }

  // 得分音效 - 上升音阶
  playScore(points: number) {
    if (!this.enabled) return
    const ctx = this.getContext()
    if (!ctx) return

    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    // 根据分数调整音调
    const baseFreq = 300 + Math.min(points / 10, 400)

    oscillator.frequency.setValueAtTime(baseFreq, ctx.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(
      baseFreq * 1.5, 
      ctx.currentTime + 0.15
    )
    oscillator.frequency.exponentialRampToValueAtTime(
      baseFreq * 2, 
      ctx.currentTime + 0.3
    )

    gainNode.gain.setValueAtTime(0.25, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)

    oscillator.type = 'sine'
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.3)
  }

  // 连击音效 - 递进音阶
  playCombo(combo: number) {
    if (!this.enabled) return
    const ctx = this.getContext()
    if (!ctx) return

    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    // 连击越高，音调越高
    const baseFreq = 400 + combo * 50

    oscillator.frequency.setValueAtTime(baseFreq, ctx.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(
      baseFreq * 1.5, 
      ctx.currentTime + 0.15
    )
    oscillator.frequency.exponentialRampToValueAtTime(
      baseFreq * 2, 
      ctx.currentTime + 0.3
    )

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)

    oscillator.type = 'sawtooth'
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.3)
  }

  // 排水音效 - 下沉音效
  playDrain() {
    if (!this.enabled) return
    const ctx = this.getContext()
    if (!ctx) return

    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.frequency.setValueAtTime(400, ctx.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.5)

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)

    oscillator.type = 'sine'
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.5)
  }

  // 游戏结束音效 - 下降音阶
  playGameOver() {
    if (!this.enabled) return
    const ctx = this.getContext()
    if (!ctx) return

    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.frequency.setValueAtTime(600, ctx.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.5)
    oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 1.0)

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.0)

    oscillator.type = 'sawtooth'
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 1.0)
  }

  // 成就解锁音效
  playAchievement() {
    if (!this.enabled) return
    const ctx = this.getContext()
    if (!ctx) return

    // 三音和弦
    const frequencies = [523, 659, 784] // C5, E5, G5
    
    frequencies.forEach((freq, index) => {
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.1)

      gainNode.gain.setValueAtTime(0, ctx.currentTime + index * 0.1)
      gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + index * 0.1 + 0.05)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + index * 0.1 + 0.4)

      oscillator.type = 'sine'
      oscillator.start(ctx.currentTime + index * 0.1)
      oscillator.stop(ctx.currentTime + index * 0.1 + 0.4)
    })
  }
}

// 导出单例
export const audioSystem = new AudioSystem()
