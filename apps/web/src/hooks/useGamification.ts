// useGamification.ts
// Dexie useLiveQuery 기반 Reactive 훅 — DB 변경 시 자동 반응
// Phase 16 보상 시스템

import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect } from 'react'
import { db } from '@/lib/db'
import { calculateXPForNextLevel, calculateXPProgress } from '@/lib/gamification/xp-formula'
import { ensureGamificationProfile } from '@/lib/gamification/gamification.service'
import type { GamificationProfile, BadgeRecord } from '@/lib/db'

export interface UseGamificationReturn {
  /** 게이미피케이션 프로필 (null = 없음/미생성, loading 동안 undefined) */
  profile: GamificationProfile | null
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
  const profileResult = useLiveQuery<GamificationProfile | undefined, null>(
    () => {
      if (!studentId) return undefined
      return db.gamificationProfiles.where('studentId').equals(studentId).first()
    },
    [studentId],
    null,
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

  const isLoading = isProfileLoading(studentId, profileResult)
  const profile = profileResult ?? null

  // 프로필이 없으면 자동 생성하여 홈/대시보드가 즉시 렌더링되도록 보장
  useEffect(() => {
    if (!studentId) return
    if (profileResult !== undefined) return

    void ensureGamificationProfile(studentId).catch(() => {
      // 생성 실패는 조용히 무시 (다음 reactive 사이클에서 재시도 가능)
    })
  }, [studentId, profileResult])

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

export function isProfileLoading(
  studentId: string | null | undefined,
  profileResult: GamificationProfile | null | undefined,
) {
  return studentId != null && profileResult === null
}
