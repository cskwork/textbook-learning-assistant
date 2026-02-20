// apps/web/src/services/streak.service.ts
// 연속 학습 스트릭 계산 서비스
import { db } from '@/lib/db'

/** 로컬 타임존 기준 오늘 날짜 YYYY-MM-DD */
function getTodayLocal(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** 로컬 타임존 기준 어제 날짜 YYYY-MM-DD */
function getYesterdayLocal(): string {
  const d = new Date(Date.now() - 86400000)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** 타임스탬프 → 로컬 타임존 YYYY-MM-DD */
function toLocalDateKey(timestamp: number): string {
  const d = new Date(timestamp)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/**
 * 현재 및 최대 연속 학습 일수 계산 — PLAN-03
 * quizAttempts.attemptedAt 기반, 로컬 타임존 날짜 분리 (Pitfall 6 대응)
 *
 * - attempts가 없으면 { current: 0, max: 0 }
 * - 마지막 학습일이 오늘도 어제도 아니면 current=0 (스트릭 끊김)
 */
export async function getStreak(
  studentId: string,
): Promise<{ current: number; max: number }> {
  const attempts = await db.quizAttempts
    .where('studentId')
    .equals(studentId)
    .toArray()

  if (attempts.length === 0) return { current: 0, max: 0 }

  // 학습한 날짜 유니크 집합 추출 (로컬 타임존 YYYY-MM-DD)
  const dateSet = new Set(attempts.map((a) => toLocalDateKey(a.attemptedAt)))
  const sortedDates = [...dateSet].sort()

  // 마지막 학습일이 오늘 또는 어제인지 확인 (스트릭 유효성)
  const today = getTodayLocal()
  const yesterday = getYesterdayLocal()
  const lastDate = sortedDates[sortedDates.length - 1]

  if (lastDate !== today && lastDate !== yesterday) {
    return { current: 0, max: 0 }
  }

  // 역방향 순회로 current + max 계산
  // current: 마지막 날짜부터 연속된 일수
  // max: 전체 기간 중 최대 연속 일수
  let current = 1
  let max = 1
  let tempStreak = 1

  for (let i = sortedDates.length - 2; i >= 0; i--) {
    const prevDate = new Date(sortedDates[i]).getTime()
    const nextDate = new Date(sortedDates[i + 1]).getTime()
    const diffMs = nextDate - prevDate

    if (diffMs === 86400000) {
      // 정확히 1일 차이 — 연속
      tempStreak++
      if (i === sortedDates.length - 2) {
        // 마지막 연속 구간 → current 업데이트
        current = tempStreak
      }
    } else {
      // 연속 끊김
      tempStreak = 1
    }
    max = Math.max(max, tempStreak)
  }

  return { current, max }
}
