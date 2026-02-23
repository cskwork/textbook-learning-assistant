// game-records.service.ts
// 게임 기록 서비스 — 게임 모드 결과 저장, 개인 최고기록 조회, 최근 기록 조회
// Phase 19 게임화 퀴즈 엔진

import { db, type GameRecord, type GameMode } from '@/lib/db'

/**
 * 게임 기록 저장
 * - 저장 전 getPersonalBest로 기존 최고 기록과 비교
 * - 새 최고기록이면 isPersonalBest = true 자동 설정
 *
 * @param record - 저장할 게임 기록 (id, isPersonalBest, playedAt 제외)
 * @returns 저장된 기록의 id와 isPersonalBest 여부
 */
export async function saveGameRecord(
  record: Omit<GameRecord, 'id' | 'isPersonalBest' | 'playedAt'>,
): Promise<{ id: number; isPersonalBest: boolean }> {
  const existingBest = await getPersonalBest(record.studentId, record.mode)
  const isPersonalBest = !existingBest || record.score > existingBest.score

  const id = await db.gameRecords.add({
    ...record,
    isPersonalBest,
    playedAt: Date.now(),
  })

  return { id: id as number, isPersonalBest }
}

/**
 * 개인 최고기록 조회
 * - [studentId+mode] 복합 인덱스로 조회 후 score 내림차순 첫 번째
 *
 * @param studentId - 학생 이메일
 * @param mode - 게임 모드
 * @returns 최고기록 GameRecord 또는 undefined (기록 없음)
 */
export async function getPersonalBest(
  studentId: string,
  mode: GameMode,
): Promise<GameRecord | undefined> {
  const records = await db.gameRecords
    .where('[studentId+mode]')
    .equals([studentId, mode])
    .toArray()

  if (records.length === 0) return undefined

  // score 내림차순 정렬 후 첫 번째 반환
  records.sort((a, b) => b.score - a.score)
  return records[0]
}

/**
 * 최근 게임 기록 조회
 * - playedAt 내림차순으로 최근 기록 반환
 *
 * @param studentId - 학생 이메일
 * @param limit - 최대 조회 건수 (기본 10)
 * @returns GameRecord 배열 (최신순)
 */
export async function getRecentRecords(
  studentId: string,
  limit: number = 10,
): Promise<GameRecord[]> {
  const records = await db.gameRecords
    .where('studentId')
    .equals(studentId)
    .toArray()

  // playedAt 내림차순 정렬 후 limit만큼 슬라이스
  records.sort((a, b) => b.playedAt - a.playedAt)
  return records.slice(0, limit)
}
