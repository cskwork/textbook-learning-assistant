// FormulaComboScene.ts
// 수식 조합 미니게임 Phaser 씬 — 떨어지는 숫자/연산자를 조합하여 목표 값 만들기
// Phase 19 게임화 퀴즈 엔진

import { EventBus } from '@/game/EventBus'
import Phaser from 'phaser'

// Phaser 타입은 dynamic import 시 로드됨
type PhaserText = import('phaser').GameObjects.Text
type PhaserGraphics = import('phaser').GameObjects.Graphics

// ─── 게임 상수 ──────────────────────────────────────────────────────────────

const GAME_DURATION = 30 // 30초
const SLOT_COUNT = 3 // 숫자-연산자-숫자
const SPAWN_INTERVAL = 1200 // ms
const BASE_SPEED = 50
const BG_COLOR = 0x1a0a2e

const NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9]
const OPERATORS = ['+', '-', 'x']

// ─── 떨어지는 요소 타입 ──────────────────────────────────────────────────────

interface FallingItem {
  value: string
  isOperator: boolean
  graphics: PhaserGraphics
  label: PhaserText
  y: number
  x: number
  speed: number
  alive: boolean
}

// ─── Phaser 씬 클래스 ──────────────────────────────────────────────────────

export default class FormulaComboScene extends Phaser.Scene {
  private score = 0
  private elapsed = 0
  private targetValue = 0
  private slots: (string | null)[] = [null, null, null] // [숫자, 연산자, 숫자]
  private fallingItems: FallingItem[] = []
  private spawnTimer: Phaser.Time.TimerEvent | null = null
  private gameTimer: Phaser.Time.TimerEvent | null = null

  // UI 요소
  private scoreText!: PhaserText
  private targetText!: PhaserText
  private timerText!: PhaserText
  private slotTexts: PhaserText[] = []
  private slotBgs: PhaserGraphics[] = []

  constructor(key: string = 'FormulaComboScene') {
    super({ key })
  }

  preload(): void {
    // 외부 에셋 불필요 — Phaser Graphics로 모든 시각 요소 생성
  }

  create(): void {
    const { width, height } = this.scale

    // 배경
    this.cameras.main.setBackgroundColor(BG_COLOR)

    // 목표값 생성
    this.generateTarget()

    // UI: 목표값 (좌상단)
    this.targetText = this.add.text(15, 15, `= ${this.targetValue}`, {
      fontSize: '24px',
      color: '#e879f9',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    })

    // UI: 점수 (우상단)
    this.scoreText = this.add.text(width - 15, 15, `${this.score}`, {
      fontSize: '20px',
      color: '#22d3ee',
      fontFamily: 'monospace',
      fontStyle: 'bold',
      align: 'right',
    }).setOrigin(1, 0)

    // UI: 타이머 (중앙 상단)
    this.timerText = this.add.text(width / 2, 15, `${GAME_DURATION}`, {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'monospace',
    }).setOrigin(0.5, 0)

    // UI: 슬롯 3개 (하단)
    const slotY = height - 60
    const slotWidth = 60
    const slotGap = 15
    const totalSlotWidth = SLOT_COUNT * slotWidth + (SLOT_COUNT - 1) * slotGap
    const slotStartX = (width - totalSlotWidth) / 2

    for (let i = 0; i < SLOT_COUNT; i++) {
      const sx = slotStartX + i * (slotWidth + slotGap) + slotWidth / 2

      // 슬롯 배경
      const bg = this.add.graphics()
      bg.fillStyle(0x2d1b69, 0.8)
      bg.fillRoundedRect(sx - slotWidth / 2, slotY - 20, slotWidth, 40, 8)
      bg.lineStyle(2, 0xa855f7, 0.6)
      bg.strokeRoundedRect(sx - slotWidth / 2, slotY - 20, slotWidth, 40, 8)
      this.slotBgs.push(bg)

      // 슬롯 텍스트
      const slotLabel = i === 1 ? 'op' : '?'
      const text = this.add.text(sx, slotY, slotLabel, {
        fontSize: '20px',
        color: '#6b7280',
        fontFamily: 'monospace',
        fontStyle: 'bold',
      }).setOrigin(0.5)
      this.slotTexts.push(text)
    }

    // 아이템 스폰 타이머
    this.spawnTimer = this.time.addEvent({
      delay: SPAWN_INTERVAL,
      callback: this.spawnItem,
      callbackScope: this,
      loop: true,
    })

    // 게임 타이머 (1초마다)
    this.gameTimer = this.time.addEvent({
      delay: 1000,
      callback: this.onTick,
      callbackScope: this,
      loop: true,
    })

    // Phaser 준비 완료 알림
    EventBus.emit('minigame-ready')
  }

  update(_time: number, delta: number): void {
    const speed = BASE_SPEED + this.elapsed * 2
    const { height } = this.scale

    // 떨어지는 아이템 업데이트
    for (const item of this.fallingItems) {
      if (!item.alive) continue

      item.y += speed * (delta / 1000)
      item.graphics.setPosition(item.x, item.y)
      item.label.setPosition(item.x, item.y)

      // 화면 밖으로 나가면 제거
      if (item.y > height + 30) {
        item.alive = false
        item.graphics.destroy()
        item.label.destroy()
      }
    }

    // 죽은 아이템 정리
    this.fallingItems = this.fallingItems.filter((i) => i.alive)
  }

  // ─── 아이템 스폰 ────────────────────────────────────────────────────────

  private spawnItem(): void {
    const { width } = this.scale
    const isOperator = Math.random() < 0.35

    let value: string
    if (isOperator) {
      value = OPERATORS[Math.floor(Math.random() * OPERATORS.length)]
    } else {
      value = String(NUMBERS[Math.floor(Math.random() * NUMBERS.length)])
    }

    const x = 40 + Math.random() * (width - 80)
    const y = -20
    const itemSpeed = 1

    // 원형 배경
    const graphics = this.add.graphics()
    const circleColor = isOperator ? 0xe879f9 : 0x22d3ee
    graphics.fillStyle(circleColor, 0.3)
    graphics.fillCircle(0, 0, 22)
    graphics.lineStyle(2, circleColor, 0.8)
    graphics.strokeCircle(0, 0, 22)
    graphics.setPosition(x, y)

    // 텍스트
    const label = this.add.text(x, y, value, {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    }).setOrigin(0.5)

    const item: FallingItem = {
      value,
      isOperator,
      graphics,
      label,
      y,
      x,
      speed: itemSpeed,
      alive: true,
    }

    // 클릭/터치 이벤트
    graphics.setInteractive(
      new Phaser.Geom.Circle(0, 0, 22),
      Phaser.Geom.Circle.Contains,
    )
    graphics.on('pointerdown', () => this.onItemClick(item))

    this.fallingItems.push(item)
  }

  // ─── 아이템 클릭 ────────────────────────────────────────────────────────

  private onItemClick(item: FallingItem): void {
    if (!item.alive) return

    // 빈 슬롯 찾기
    let slotIndex = -1
    if (item.isOperator) {
      // 연산자는 슬롯 1에만
      if (this.slots[1] === null) slotIndex = 1
    } else {
      // 숫자는 슬롯 0 또는 2에
      if (this.slots[0] === null) slotIndex = 0
      else if (this.slots[2] === null) slotIndex = 2
    }

    if (slotIndex === -1) return

    // 슬롯에 배치
    this.slots[slotIndex] = item.value
    this.slotTexts[slotIndex].setText(item.value)
    this.slotTexts[slotIndex].setColor('#ffffff')

    // 아이템 제거
    item.alive = false
    item.graphics.destroy()
    item.label.destroy()

    // 3슬롯 채워지면 자동 계산
    if (this.slots.every((s) => s !== null)) {
      this.evaluateSlots()
    }
  }

  // ─── 슬롯 평가 ─────────────────────────────────────────────────────────

  private evaluateSlots(): void {
    const num1 = parseInt(this.slots[0]!, 10)
    const op = this.slots[1]!
    const num2 = parseInt(this.slots[2]!, 10)

    let result: number
    switch (op) {
      case '+':
        result = num1 + num2
        break
      case '-':
        result = num1 - num2
        break
      case 'x':
        result = num1 * num2
        break
      default:
        result = 0
    }

    if (result === this.targetValue) {
      // 정답
      this.score += 100
      this.scoreText.setText(`${this.score}`)
      EventBus.emit('minigame-correct')

      // 슬롯 초록 플래시
      for (const text of this.slotTexts) {
        text.setColor('#22c55e')
      }

      // 새 목표값 생성
      this.time.delayedCall(300, () => {
        this.generateTarget()
        this.targetText.setText(`= ${this.targetValue}`)
        this.resetSlots()
      })
    } else {
      // 오답 — 슬롯 빨간 플래시 후 초기화
      EventBus.emit('minigame-wrong')
      for (const text of this.slotTexts) {
        text.setColor('#ef4444')
      }

      this.time.delayedCall(400, () => {
        this.resetSlots()
      })
    }
  }

  // ─── 유틸리티 ──────────────────────────────────────────────────────────

  private generateTarget(): void {
    // 1~18 범위의 목표값 (간단한 계산 가능)
    this.targetValue = Math.floor(Math.random() * 18) + 1
  }

  private resetSlots(): void {
    this.slots = [null, null, null]
    const labels = ['?', 'op', '?']
    for (let i = 0; i < SLOT_COUNT; i++) {
      this.slotTexts[i].setText(labels[i])
      this.slotTexts[i].setColor('#6b7280')
    }
  }

  private onTick(): void {
    this.elapsed++
    const remaining = GAME_DURATION - this.elapsed

    if (remaining <= 0) {
      this.endGame()
      return
    }

    this.timerText.setText(`${remaining}`)

    // 5초 이하 빨간색
    if (remaining <= 5) {
      this.timerText.setColor('#ef4444')
    }
  }

  private endGame(): void {
    // 타이머 정리
    this.spawnTimer?.destroy()
    this.gameTimer?.destroy()

    // 남은 아이템 제거
    for (const item of this.fallingItems) {
      if (item.alive) {
        item.graphics.destroy()
        item.label.destroy()
      }
    }
    this.fallingItems = []

    // 결과 전달
    if (this.score >= 300) {
      EventBus.emit('minigame-success')
    }
    EventBus.emit('minigame-complete', {
      score: this.score,
      xp: Math.round(this.score / 10),
      success: this.score >= 300,
    })
  }
}
