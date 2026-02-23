// useCombo.ts
// 세션 내 콤보 카운터 훅 — DB 저장 없음, 메모리 전용
// Phase 16 보상 시스템

import { useState, useCallback } from 'react'
import { getComboMultiplier } from '@/lib/gamification/xp-formula'

export interface UseComboReturn {
  /** 현재 콤보 카운트 */
  comboCount: number
  /** 현재 콤보에 해당하는 XP 배수 (1x ~ 3x) */
  multiplier: number
  /** 정답 시 호출 — 콤보 증가, 증가 후 배수 반환 */
  onCorrect: () => number
  /** 오답 시 호출 — 콤보 리셋 */
  onWrong: () => void
  /** 콤보 수동 리셋 (세션 초기화 등) */
  resetCombo: () => void
}

/**
 * useCombo — 세션 내 콤보 카운터 관리
 *
 * - 정답(onCorrect): 콤보 카운트 증가, 새 배수 반환
 * - 오답(onWrong): 콤보 카운트 0으로 리셋
 * - DB 저장 없음 — 페이지 리로드 시 초기화
 */
export function useCombo(): UseComboReturn {
  const [comboCount, setComboCount] = useState(0)

  const onCorrect = useCallback((): number => {
    let newMultiplier = 1
    setComboCount((prev) => {
      const newCount = prev + 1
      // 클로저 주의: prev+1로 계산 (최신 상태 반영)
      newMultiplier = getComboMultiplier(newCount)
      return newCount
    })
    // NOTE: newMultiplier는 setComboCount 동기 콜백에서 설정됨
    // React의 setState 콜백은 동기적으로 실행되므로 반환값이 올바름
    return newMultiplier
  }, [])

  const onWrong = useCallback((): void => {
    setComboCount(0)
  }, [])

  const resetCombo = useCallback((): void => {
    setComboCount(0)
  }, [])

  const multiplier = getComboMultiplier(comboCount)

  return {
    comboCount,
    multiplier,
    onCorrect,
    onWrong,
    resetCombo,
  }
}
