// xp-formula.test.ts
// XP 수식 순수 함수 단위 테스트 — TDD RED 단계
import { describe, it, expect } from 'vitest'
import {
  calculateLevel,
  calculateXPForNextLevel,
  calculateXPProgress,
  getComboMultiplier,
  getBaseXP,
} from './xp-formula'

// ─────────────────────────────────────────
// calculateLevel(totalXP)
// ─────────────────────────────────────────
describe('calculateLevel', () => {
  it('0 XP는 레벨 1', () => {
    expect(calculateLevel(0)).toBe(1)
  })

  it('음수 XP는 레벨 1', () => {
    expect(calculateLevel(-100)).toBe(1)
  })

  it('99 XP는 레벨 1 (100XP 미달)', () => {
    expect(calculateLevel(99)).toBe(1)
  })

  it('100 XP는 레벨 2', () => {
    expect(calculateLevel(100)).toBe(2)
  })

  it('레벨 2→3 문턱 직전: 레벨 2', () => {
    // Lv2→3 필요 XP = 100 * 1.15 = 115
    // 누적: 100 + 115 - 1 = 214 XP → 레벨 2
    expect(calculateLevel(214)).toBe(2)
  })

  it('레벨 2→3 문턱: 레벨 3', () => {
    // 누적: 100 + 115 = 215 XP → 레벨 3
    expect(calculateLevel(215)).toBe(3)
  })

  it('매우 큰 XP는 최대 레벨 50', () => {
    expect(calculateLevel(9_999_999)).toBe(50)
  })

  it('레벨 50 경계 이후에도 50을 초과하지 않음', () => {
    expect(calculateLevel(1_000_000)).toBeLessThanOrEqual(50)
  })
})

// ─────────────────────────────────────────
// calculateXPForNextLevel(level)
// ─────────────────────────────────────────
describe('calculateXPForNextLevel', () => {
  it('레벨 1 → 2: 100 XP 필요', () => {
    expect(calculateXPForNextLevel(1)).toBe(100)
  })

  it('레벨 2 → 3: 115 XP 필요 (100 * 1.15^1)', () => {
    expect(calculateXPForNextLevel(2)).toBe(115)
  })

  it('레벨 3 → 4: 132 XP 필요 (100 * 1.15^2 ≈ 132.25 → 정수 반올림)', () => {
    // 100 * 1.15^2 = 132.25 → Math.round → 132
    expect(calculateXPForNextLevel(3)).toBe(132)
  })

  it('레벨 10의 다음 레벨 XP는 양수', () => {
    expect(calculateXPForNextLevel(10)).toBeGreaterThan(0)
  })

  it('최대 레벨 50에서는 Infinity 반환 (다음 레벨 없음)', () => {
    expect(calculateXPForNextLevel(50)).toBe(Infinity)
  })
})

// ─────────────────────────────────────────
// calculateXPProgress(totalXP, level)
// ─────────────────────────────────────────
describe('calculateXPProgress', () => {
  it('레벨 1 시작: 진행률 0', () => {
    expect(calculateXPProgress(0, 1)).toBe(0)
  })

  it('레벨 1에서 절반 진행: 0~1 범위 반환', () => {
    const progress = calculateXPProgress(50, 1)
    expect(progress).toBeGreaterThanOrEqual(0)
    expect(progress).toBeLessThanOrEqual(1)
  })

  it('레벨 경계(다음 레벨 직전)는 1에 가까운 값', () => {
    const progress = calculateXPProgress(99, 1)
    expect(progress).toBeGreaterThan(0.9)
    expect(progress).toBeLessThanOrEqual(1)
  })

  it('진행률은 항상 0~1 범위', () => {
    const progress = calculateXPProgress(50, 2)
    expect(progress).toBeGreaterThanOrEqual(0)
    expect(progress).toBeLessThanOrEqual(1)
  })

  it('레벨 50(최대)에서는 1 반환', () => {
    expect(calculateXPProgress(9_999_999, 50)).toBe(1)
  })
})

// ─────────────────────────────────────────
// getComboMultiplier(comboCount)
// ─────────────────────────────────────────
describe('getComboMultiplier', () => {
  it('0 연속: 1x (배수 없음)', () => {
    expect(getComboMultiplier(0)).toBe(1)
  })

  it('1 연속: 1x (배수 없음)', () => {
    expect(getComboMultiplier(1)).toBe(1)
  })

  it('2 연속: 1.5x', () => {
    expect(getComboMultiplier(2)).toBe(1.5)
  })

  it('3 연속: 2x', () => {
    expect(getComboMultiplier(3)).toBe(2)
  })

  it('4 연속: 2.5x', () => {
    expect(getComboMultiplier(4)).toBe(2.5)
  })

  it('5 연속: 3x (최대)', () => {
    expect(getComboMultiplier(5)).toBe(3)
  })

  it('10 연속: 3x (최대 상한선)', () => {
    expect(getComboMultiplier(10)).toBe(3)
  })

  it('100 연속도 3x를 초과하지 않음', () => {
    expect(getComboMultiplier(100)).toBe(3)
  })
})

// ─────────────────────────────────────────
// getBaseXP(difficulty)
// ─────────────────────────────────────────
describe('getBaseXP', () => {
  it('난이도 1 (쉬움): 100 XP', () => {
    expect(getBaseXP(1)).toBe(100)
  })

  it('난이도 2 (쉬움): 100 XP', () => {
    expect(getBaseXP(2)).toBe(100)
  })

  it('난이도 3 (보통): 200 XP', () => {
    expect(getBaseXP(3)).toBe(200)
  })

  it('난이도 4 (어려움): 300 XP', () => {
    expect(getBaseXP(4)).toBe(300)
  })

  it('난이도 5 (어려움): 300 XP', () => {
    expect(getBaseXP(5)).toBe(300)
  })
})
