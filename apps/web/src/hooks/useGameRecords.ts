// useGameRecords.ts
// Dexie useLiveQuery 기반 게임 기록 Reactive 조회 훅
// Phase 19 게임화 퀴즈 엔진

import { useLiveQuery } from 'dexie-react-hooks'
import { db, type GameRecord, type GameMode } from '@/lib/db'

export interface UseGameRecordsReturn {
  /** 해당 모드의 개인 최고기록 (undefined = 로딩 중 또는 기록 없음) */
  personalBest: GameRecord | undefined
  /** 최근 기록 목록 (최신순, 기본 10건) */
  recentRecords: GameRecord[]
  /** 데이터 로딩 중 여부 */
  isLoading: boolean
}

/**
 * useGameRecords — 게임 기록을 reactive하게 구독
 *
 * Dexie useLiveQuery를 사용하여 DB 변경 시 자동으로 리렌더링됩니다.
 * dependency에 studentId, mode를 포함하여 변경 시 올바르게 재조회합니다.
 *
 * @param studentId - 학생 이메일 (없으면 null/undefined)
 * @param mode - 게임 모드 필터 (없으면 전체 모드)
 */
export function useGameRecords(
  studentId: string | null | undefined,
  mode?: GameMode,
): UseGameRecordsReturn {
  // 개인 최고기록 구독
  const personalBest = useLiveQuery(
    async () => {
      if (!studentId || !mode) return undefined
      const records = await db.gameRecords
        .where('[studentId+mode]')
        .equals([studentId, mode])
        .toArray()
      if (records.length === 0) return undefined
      records.sort((a, b) => b.score - a.score)
      return records[0]
    },
    [studentId, mode],
  )

  // 최근 기록 구독
  const recentRecords = useLiveQuery(
    async () => {
      if (!studentId) return []
      let records: GameRecord[]
      if (mode) {
        records = await db.gameRecords
          .where('[studentId+mode]')
          .equals([studentId, mode])
          .toArray()
      } else {
        records = await db.gameRecords
          .where('studentId')
          .equals(studentId)
          .toArray()
      }
      records.sort((a, b) => b.playedAt - a.playedAt)
      return records.slice(0, 10)
    },
    [studentId, mode],
    [],
  )

  const isLoading = studentId != null && personalBest === undefined && mode != null

  return {
    personalBest,
    recentRecords: recentRecords ?? [],
    isLoading,
  }
}
