// useGamification.ts
// Dexie useLiveQuery 기반 Reactive 훅 — DB 변경 시 자동 반응
// Phase 16 보상 시스템

import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { calculateXPForNextLevel, calculateXPProgress } from '@/lib/gamification/xp-formula'
import type { GamificationProfile, BadgeRecord } from '@/lib/db'

export interface UseGamificationReturn {
  /** 게이미피케이션 프로필 (undefined = 로딩 중) */
  profile: GamificationProfile | undefined
  /** 다음 레벨까지 필요한 XP (최대 레벨이면 Infinity) */
  xpForNextLevel: number
  /** 현재 레벨 내 XP 진행률 (0~1) */
  xpProgress: number
  /** 획득한 모든 뱃지 목록 */
  allBadges: BadgeRecord[]
  /** 데이터 로딩 중 여부 */
  isLoading: boolean
}

/**
 * useGamification — 게이미피케이션 상태를 reactive하게 구독
 *
 * Dexie useLiveQuery를 사용하여 DB 변경 시 자동으로 리렌더링됩니다.
 * dependency에 studentId를 포함하여 유저 전환 시에도 올바르게 동작합니다.
 *
 * @param studentId - 학생 이메일 (없으면 null/undefined)
 */
export function useGamification(studentId: string | null | undefined): UseGamificationReturn {
  // 프로필 구독 — dependency [studentId] 필수 (Pitfall 2 방지)
  const profile = useLiveQuery(
    () => {
      if (!studentId) return undefined
      return db.gamificationProfiles.where('studentId').equals(studentId).first()
    },
    [studentId],
  )

  // 뱃지 목록 구독
  const allBadges = useLiveQuery(
    () => {
      if (!studentId) return []
      return db.badges.where('studentId').equals(studentId).toArray()
    },
    [studentId],
    [],
  )

  // 로딩 상태: profile이 undefined이고 studentId가 있으면 로딩 중
  const isLoading = studentId != null && profile === undefined

  // XP 진행률 계산
  const currentLevel = profile?.level ?? 1
  const totalXP = profile?.totalXP ?? 0
  const xpForNextLevel = calculateXPForNextLevel(currentLevel)
  const xpProgress = calculateXPProgress(totalXP, currentLevel)

  return {
    profile,
    xpForNextLevel,
    xpProgress,
    allBadges: allBadges ?? [],
    isLoading,
  }
}
