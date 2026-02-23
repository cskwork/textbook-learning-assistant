// xp-formula.ts
// XP 수식 순수 함수 모음 — Phase 16 보상 시스템 핵심 계산 로직
// 부작용 없음, DB 의존 없음, 모든 함수는 순수 함수

/** 최대 레벨 */
const MAX_LEVEL = 50

/** 레벨 1→2 기준 XP */
const BASE_LEVEL_XP = 100

/** 레벨 당 XP 증가율 (지수 곡선) */
const LEVEL_XP_MULTIPLIER = 1.15

/**
 * 누적 XP → 레벨 계산
 * - 레벨 1 시작 (0 XP)
 * - Lv1→2: 100 XP, 매 레벨 1.15배 증가
 * - 최대 레벨 50
 */
export function calculateLevel(totalXP: number): number {
  if (totalXP < 0) return 1

  let level = 1
  let accumulatedXP = 0

  while (level < MAX_LEVEL) {
    const xpForNext = Math.round(BASE_LEVEL_XP * Math.pow(LEVEL_XP_MULTIPLIER, level - 1))
    if (accumulatedXP + xpForNext > totalXP) break
    accumulatedXP += xpForNext
    level++
  }

  return level
}

/**
 * 현재 레벨에서 다음 레벨까지 필요한 XP
 * - 레벨 50(최대)에서는 Infinity 반환
 */
export function calculateXPForNextLevel(currentLevel: number): number {
  if (currentLevel >= MAX_LEVEL) return Infinity
  return Math.round(BASE_LEVEL_XP * Math.pow(LEVEL_XP_MULTIPLIER, currentLevel - 1))
}

/**
 * 현재 레벨 내 XP 진행률 (0~1)
 * - 현재 레벨 시작 XP ~ 다음 레벨 시작 XP 기준
 * - 최대 레벨 50에서는 항상 1 반환
 */
export function calculateXPProgress(totalXP: number, currentLevel: number): number {
  if (currentLevel >= MAX_LEVEL) return 1

  // 현재 레벨 시작 시점의 누적 XP 계산
  let levelStartXP = 0
  for (let l = 1; l < currentLevel; l++) {
    levelStartXP += Math.round(BASE_LEVEL_XP * Math.pow(LEVEL_XP_MULTIPLIER, l - 1))
  }

  const xpForNext = calculateXPForNextLevel(currentLevel)
  const xpIntoLevel = totalXP - levelStartXP

  return Math.min(1, Math.max(0, xpIntoLevel / xpForNext))
}

/**
 * 콤보 카운트 → XP 배수
 * - 0~1연속: 1x
 * - 2연속: 1.5x
 * - 3연속: 2x
 * - 4연속: 2.5x
 * - 5연속+: 3x (최대)
 */
export function getComboMultiplier(comboCount: number): number {
  if (comboCount <= 1) return 1
  if (comboCount === 2) return 1.5
  if (comboCount === 3) return 2
  if (comboCount === 4) return 2.5
  return 3 // 5연속 이상
}

/**
 * 문제 난이도 → 기본 XP
 * - 쉬움(1-2): 100 XP
 * - 보통(3): 200 XP
 * - 어려움(4-5): 300 XP
 */
export function getBaseXP(difficulty: 1 | 2 | 3 | 4 | 5): number {
  if (difficulty <= 2) return 100
  if (difficulty === 3) return 200
  return 300
}
