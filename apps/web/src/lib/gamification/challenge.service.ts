// challenge.service.ts
// 데일리 / 주간 챌린지 서비스
// Phase 16 보상 시스템

import { db } from '@/lib/db'

/** 데일리 챌린지 설정 */
export interface DailyChallengeConfig {
  date: string        // YYYY-MM-DD
  questionCount: number
  difficulty: 1 | 2 | 3 | 4 | 5
  isWeekend: boolean
}

/** 데일리 챌린지 완료 여부 */
export interface DailyChallengeSummary {
  config: DailyChallengeConfig
  isCompleted: boolean
}

/** 주간 챌린지 진행 현황 */
export interface WeeklyChallengeProgress {
  weekStartDate: string  // 이번 주 월요일 YYYY-MM-DD
  correctCount: number   // 이번 주 정답 수
  targetCount: number    // 목표 문제 수 (50)
  isCompleted: boolean
}

/**
 * 데일리 챌린지 설정 반환
 * - 주말(토일): 5문제 난이도 3
 * - 평일: 3문제, 요일별 난이도 변동
 *   - 월(1): 난이도 2, 화(2): 난이도 2, 수(3): 난이도 3
 *   - 목(4): 난이도 3, 금(5): 난이도 4
 */
export function getDailyChallengeConfig(date: Date = new Date()): DailyChallengeConfig {
  const dayOfWeek = date.getDay() // 0=일, 1=월, ..., 6=토
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

  const dateString = date.toISOString().slice(0, 10) // YYYY-MM-DD

  if (isWeekend) {
    return {
      date: dateString,
      questionCount: 5,
      difficulty: 3,
      isWeekend: true,
    }
  }

  // 평일 난이도 매핑 (월=1, 화=2, 수=3, 목=4, 금=5)
  const weekdayDifficulty: Record<number, 1 | 2 | 3 | 4 | 5> = {
    1: 2, // 월요일
    2: 2, // 화요일
    3: 3, // 수요일
    4: 3, // 목요일
    5: 4, // 금요일
  }

  return {
    date: dateString,
    questionCount: 3,
    difficulty: weekdayDifficulty[dayOfWeek] ?? 3,
    isWeekend: false,
  }
}

/**
 * 날짜 시드 기반 데일리 챌린지 문제 선정
 * - DB에서 전체 문제 로드 후 날짜 시드로 셔플
 * - 챌린지 설정에 맞는 난이도 필터링
 * - 없으면 전체에서 선정
 *
 * @param date - 챌린지 날짜 (기본: 오늘)
 * @returns 선정된 문제 ID 배열
 */
export async function getDailyChallengeQuestions(date: Date = new Date()): Promise<number[]> {
  const config = getDailyChallengeConfig(date)

  // 해당 난이도 문제 조회
  let questions = await db.questions.where('difficulty').equals(config.difficulty).toArray()

  // 해당 난이도 문제가 부족하면 전체에서 보충
  if (questions.length < config.questionCount) {
    questions = await db.questions.toArray()
  }

  if (questions.length === 0) return []

  // 날짜 시드 생성 (YYYYMMDD 숫자)
  const seed = parseInt(config.date.replace(/-/g, ''), 10)

  // 시드 기반 셔플
  const shuffled = seededShuffle(
    questions.map((q) => q.id),
    seed,
  )

  return shuffled.slice(0, config.questionCount)
}

/**
 * 데일리 챌린지 완료 여부 확인
 * - xpEvents에서 당일 'daily_challenge' reason 존재 여부
 */
export async function isDailyChallengeCompleted(
  studentId: string,
  date: Date = new Date(),
): Promise<boolean> {
  const dateString = date.toDateString() // 로컬 타임존 기준

  const events = await db.xpEvents
    .where('studentId')
    .equals(studentId)
    .filter((e) => {
      return (
        e.reason === 'daily_challenge' &&
        new Date(e.timestamp).toDateString() === dateString
      )
    })
    .toArray()

  return events.length > 0
}

/**
 * 주간 챌린지 진행 현황 조회
 * - 이번 주 월요일 00:00 ~ 현재 사이 'quiz_correct' xpEvents 집계
 * - 목표: 50문제
 * - 완료 여부: xpEvents에 'weekly_challenge' reason 존재 체크
 */
export async function getWeeklyChallengeProgress(studentId: string): Promise<WeeklyChallengeProgress> {
  const now = new Date()
  const weekStart = getThisMonday(now)
  const weekStartTimestamp = weekStart.getTime()

  // 이번 주 정답 이벤트 집계
  const correctEvents = await db.xpEvents
    .where('studentId')
    .equals(studentId)
    .filter(
      (e) =>
        e.reason === 'quiz_correct' && e.timestamp >= weekStartTimestamp,
    )
    .toArray()

  const correctCount = correctEvents.length
  const targetCount = 50

  // 주간 챌린지 완료 여부 확인
  const weeklyCompletionEvents = await db.xpEvents
    .where('studentId')
    .equals(studentId)
    .filter(
      (e) =>
        e.reason === 'weekly_challenge' && e.timestamp >= weekStartTimestamp,
    )
    .toArray()

  return {
    weekStartDate: weekStart.toISOString().slice(0, 10),
    correctCount,
    targetCount,
    isCompleted: weeklyCompletionEvents.length > 0,
  }
}

/**
 * 이번 주 월요일 00:00:00 Date 객체 반환
 * (로컬 타임존 기준)
 */
function getThisMonday(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay() // 0=일, 1=월, ..., 6=토
  // 일요일(0)은 -6, 나머지는 -(day-1)
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * 시드 기반 Fisher-Yates 셔플 (순수 함수)
 * LCG(선형 합동 생성기) 사용 — 동일 시드 = 동일 결과 보장
 *
 * @param array - 셔플할 배열
 * @param seed - 정수 시드
 * @returns 셔플된 새 배열
 */
export function seededShuffle<T>(array: T[], seed: number): T[] {
  const result = [...array]
  let currentSeed = seed

  // LCG 파라미터 (Numerical Recipes 기준)
  const LCG_A = 1664525
  const LCG_C = 1013904223
  const LCG_M = Math.pow(2, 32)

  function nextRandom(): number {
    currentSeed = (LCG_A * currentSeed + LCG_C) % LCG_M
    return currentSeed / LCG_M
  }

  // Fisher-Yates 셔플
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(nextRandom() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }

  return result
}
