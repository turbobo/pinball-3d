# 三维弹球 (3D Pinball)

基于 Three.js + React Three Fiber + Cannon-es 的经典三维弹球游戏。

## 技术栈

- **框架**: React 18 + TypeScript + Vite
- **3D 渲染**: Three.js + React Three Fiber v8
- **物理引擎**: Cannon-es + @react-three/cannon
- **UI**: Tailwind CSS
- **部署**: EdgeOne Pages (静态站点)

## 核心玩法

### 游戏规则
- 使用左右挡板（Flippers）击打弹珠
- 弹珠撞击得分区（Bumpers）获得分数
- 弹珠落入底部排水口（Drain）则失去一条命
- 初始 3 条命，用完游戏结束

### 操作控制
- **左挡板**: A 键 / 左方向键
- **右挡板**: L 键 / 右方向键
- **发射弹珠**: 空格键

### 得分系统
- 圆形弹珠台 (Bumper): +100 分
- 三角形弹珠台 (Slingshot): +50 分
- 特殊目标 (Target): +500 分
- 连续击中连击加成: ×1.5, ×2, ×3...

## 核心组件

1. **PinballTable**: 弹珠台主体（包含边界、得分区布局）
2. **Ball**: 弹珠（球体物理 + 重力）
3. **Flippers**: 左右挡板（旋转物理 + 键盘控制）
4. **Bumpers**: 得分弹珠台（碰撞检测 + 弹开力）
5. **Drain**: 底部排水口（碰撞检测 + 生命扣除）
6. **ScoreBoard**: 得分显示 UI

## 物理引擎配置

```typescript
// 重力
gravity: [0, -9.82, 0]

// 弹珠
mass: 0.1
radius: 0.2
restitution: 0.8 (弹性)

// 挡板
mass: 0 (静态)
rotation: 受限旋转轴

// 弹珠台
restitution: 1.2 (超弹性弹开)
force: 5 (弹开力)
```

## 开发进度

- [x] 项目初始化
- [x] 依赖安装
- [ ] 物理引擎配置
- [ ] 弹珠组件
- [ ] 挡板组件
- [ ] 弹珠台组件
- [ ] 得分系统
- [ ] UI 界面
- [ ] 音效系统
- [ ] 关卡系统

## 参考资源

- [React Three Fiber 官方文档](https://r3f.docs.pmnd.rs/)
- [Cannon-es 文档](https://pmndrs.github.io/cannon-es/)
- [Pinball XR 参考实现](https://github.com/patrick-s-young/pinball-xr)
- [弹球机维基百科](https://en.wikipedia.org/wiki/Pinball)

## 运行

```bash
npm install
npm run dev
```

访问 http://localhost:5173
