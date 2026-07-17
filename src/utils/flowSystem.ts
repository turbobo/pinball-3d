// 心流系统 - 动态难度调整（原理38 + 原理82：巴斯特原则）

export interface FlowState {
  consecutiveDrains: number  // 连续失去生命次数
  maxCombo: number           // 最高连击
  scoreRate: number          // 得分速率（每秒得分）
  difficultyMultiplier: number // 难度系数（0.8-1.2）
}

export class FlowSystem {
  private state: FlowState = {
    consecutiveDrains: 0,
    maxCombo: 0,
    scoreRate: 0,
    difficultyMultiplier: 1.0
  }
  
  private lastScore: number = 0
  private lastTime: number = Date.now()
  private scoreHistory: number[] = []

  // 记录得分
  recordScore(score: number) {
    const now = Date.now()
    const deltaTime = (now - this.lastTime) / 1000 // 转换为秒
    
    if (deltaTime > 0) {
      const scoreGain = score - this.lastScore
      this.scoreRate = scoreGain / deltaTime
      
      // 保留最近10个得分速率
      this.scoreHistory.push(this.scoreRate)
      if (this.scoreHistory.length > 10) {
        this.scoreHistory.shift()
      }
    }
    
    this.lastScore = score
    this.lastTime = now
  }

  // 记录连击
  recordCombo(combo: number) {
    if (combo > this.state.maxCombo) {
      this.state.maxCombo = combo
    }
  }

  // 记录失去生命
  recordDrain() {
    this.state.consecutiveDrains++
    this.updateDifficulty()
  }

  // 重置连续失去生命计数（成功得分时）
  resetDrainCount() {
    this.state.consecutiveDrains = 0
  }

  // 更新难度系数
  private updateDifficulty() {
    const { consecutiveDrains, maxCombo } = this.state
    
    // 玩家表现差：降低难度（巴斯特原则）
    if (consecutiveDrains >= 3) {
      this.state.difficultyMultiplier = Math.max(0.8, this.state.difficultyMultiplier - 0.05)
    }
    
    // 玩家表现好：增加难度（保持心流）
    if (maxCombo >= 5) {
      this.state.difficultyMultiplier = Math.min(1.2, this.state.difficultyMultiplier + 0.05)
    }
    
    // 平均得分速率过高：增加难度
    const avgScoreRate = this.scoreHistory.reduce((a, b) => a + b, 0) / this.scoreHistory.length
    if (avgScoreRate > 500) {
      this.state.difficultyMultiplier = Math.min(1.2, this.state.difficultyMultiplier + 0.02)
    }
    
    // 平均得分速率过低：降低难度
    if (avgScoreRate < 100 && this.scoreHistory.length >= 5) {
      this.state.difficultyMultiplier = Math.max(0.8, this.state.difficultyMultiplier - 0.02)
    }
  }

  // 获取弹珠台弹开力调整
  getBumperForce(): number {
    return 5 * this.state.difficultyMultiplier
  }

  // 获取挡板宽度调整
  getFlipperWidth(): number {
    // 难度越低，挡板越宽
    return 0.8 * (2 - this.state.difficultyMultiplier)
  }

  // 获取弹珠速度调整
  getBallSpeed(): number {
    return 8 * this.state.difficultyMultiplier
  }

  // 获取当前状态
  getState(): FlowState {
    return { ...this.state }
  }

  // 重置系统
  reset() {
    this.state = {
      consecutiveDrains: 0,
      maxCombo: 0,
      scoreRate: 0,
      difficultyMultiplier: 1.0
    }
    this.lastScore = 0
    this.lastTime = Date.now()
    this.scoreHistory = []
  }
}

export const flowSystem = new FlowSystem()
