// 成就系统 - 里程碑奖励（原理96：成就感 + 原理79：可变奖励）

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt?: number
}

export class AchievementSystem {
  private achievements: Map<string, Achievement> = new Map()
  private onUnlock?: (achievement: Achievement) => void

  constructor() {
    this.initAchievements()
  }

  private initAchievements() {
    const defs: Omit<Achievement, 'unlocked' | 'unlockedAt'>[] = [
      { id: 'first_score', name: '初次得分', description: '获得第一个分数', icon: '🎯' },
      { id: 'score_1000', name: '新手弹球手', description: '累计得分达到 1,000', icon: '⭐' },
      { id: 'score_5000', name: '弹球高手', description: '累计得分达到 5,000', icon: '🌟' },
      { id: 'score_10000', name: '弹球大师', description: '累计得分达到 10,000', icon: '👑' },
      { id: 'combo_3', name: '连击新星', description: '达成 3 连击', icon: '🔥' },
      { id: 'combo_5', name: '连击大师', description: '达成 5 连击', icon: '💥' },
      { id: 'super_bumper', name: '幸运一击', description: '触发超级弹珠台', icon: '🍀' },
      { id: 'survivor', name: '幸存者', description: '在 1 条生命时存活并得分', icon: '🛡️' },
    ]

    defs.forEach(def => {
      this.achievements.set(def.id, { ...def, unlocked: false })
    })
  }

  setOnUnlock(callback: (achievement: Achievement) => void) {
    this.onUnlock = callback
  }

  private tryUnlock(id: string) {
    const achievement = this.achievements.get(id)
    if (achievement && !achievement.unlocked) {
      achievement.unlocked = true
      achievement.unlockedAt = Date.now()
      this.onUnlock?.(achievement)
    }
  }

  // 检查得分相关成就
  checkScore(score: number) {
    if (score > 0) this.tryUnlock('first_score')
    if (score >= 1000) this.tryUnlock('score_1000')
    if (score >= 5000) this.tryUnlock('score_5000')
    if (score >= 10000) this.tryUnlock('score_10000')
  }

  // 检查连击相关成就
  checkCombo(combo: number) {
    if (combo >= 3) this.tryUnlock('combo_3')
    if (combo >= 5) this.tryUnlock('combo_5')
  }

  // 检查超级弹珠台
  checkSuperBumper() {
    this.tryUnlock('super_bumper')
  }

  // 检查幸存者
  checkSurvivor(lives: number) {
    if (lives === 1) this.tryUnlock('survivor')
  }

  // 获取所有成就
  getAll(): Achievement[] {
    return Array.from(this.achievements.values())
  }

  // 获取已解锁数量
  getUnlockedCount(): number {
    return this.getAll().filter(a => a.unlocked).length
  }

  // 重置
  reset() {
    this.achievements.forEach(a => {
      a.unlocked = false
      a.unlockedAt = undefined
    })
  }
}

// 可变奖励系统（原理79：斯金纳箱）
export class VariableRewardSystem {
  // 10% 概率触发超级弹珠台（分数×3）
  checkSuperBumper(): boolean {
    return Math.random() < 0.1
  }

  // 连续击中同一弹珠台，奖励递增
  getStreakBonus(hitCount: number): number {
    return 1 + Math.min(hitCount * 0.2, 1.0) // 最高 +100%
  }
}

export const achievementSystem = new AchievementSystem()
export const variableRewardSystem = new VariableRewardSystem()
