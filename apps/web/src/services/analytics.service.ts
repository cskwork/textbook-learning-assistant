// apps/web/src/services/analytics.service.ts
// AI 분석 집계 서비스 — quizAttempts 기반 통계 계산
import { db } from '@/lib/db'
import { computeBKT, DEFAULT_BKT_PARAMS, WEAK_THRESHOLD } from '@/lib/bkt'

/** 로컬 타임존 기준 YYYY-MM-DD 날짜 문자열 반환 */
function toLocalDateKey(timestamp: number): string {
  const d = new Date(timestamp)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/**
 * 유형별 정답률 집계 — REPT-01, AIAN-02
 * quizAttempts + questions 인메모리 조인 (Map 패턴)
 */
export async function getCategoryAccuracy(
  studentId: string,
): Promise<{ category: string; accuracy: number; total: number }[]> {
  const attempts = await db.quizAttempts
    .where('studentId')
    .equals(studentId)
    .toArray()

  const questions = await db.questions.toArray()
  const categoryMap = new Map(questions.map((q) => [q.id, q.questionCategory]))

  const grouped = new Map<string, { correct: number; total: number }>()
  for (const attempt of attempts) {
    const cat = categoryMap.get(attempt.questionId) ?? '기타'
    const current = grouped.get(cat) ?? { correct: 0, total: 0 }
    grouped.set(cat, {
      correct: current.correct + (attempt.isCorrect ? 1 : 0),
      total: current.total + 1,
    })
  }

  return Array.from(grouped.entries()).map(([category, { correct, total }]) => ({
    category,
    accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
    total,
  }))
}

/**
 * 날짜별 풀이 수 집계 — REPT-02
 * 로컬 타임존 기준 날짜 분리 (Pitfall 6 대응)
 * 빈 날짜도 포함하여 days일치 배열 반환
 */
export async function getDailyStats(
  studentId: string,
  days = 14,
): Promise<{ date: string; count: number; correct: number }[]> {
  const since = Date.now() - days * 24 * 60 * 60 * 1000
  const attempts = await db.quizAttempts
    .where('studentId')
    .equals(studentId)
    .filter((a) => a.attemptedAt >= since)
    .toArray()

  const dayMap = new Map<string, { count: number; correct: number }>()
  for (const attempt of attempts) {
    const dateKey = toLocalDateKey(attempt.attemptedAt)
    const current = dayMap.get(dateKey) ?? { count: 0, correct: 0 }
    dayMap.set(dateKey, {
      count: current.count + 1,
      correct: current.correct + (attempt.isCorrect ? 1 : 0),
    })
  }

  // 빈 날짜 채우기 (days일치 배열, 과거 → 현재 순)
  const result: { date: string; count: number; correct: number }[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const stats = dayMap.get(dateKey) ?? { count: 0, correct: 0 }
    result.push({ date: dateKey, ...stats })
  }
  return result
}

/**
 * 전체 학습 통계 — REPT-04
 * 총 풀이 수, 정답 수, 정답률, 총 학습 시간
 */
export async function getOverallStats(studentId: string): Promise<{
  total: number
  correct: number
  accuracy: number
  totalTimeSeconds: number
}> {
  const attempts = await db.quizAttempts.where('studentId').equals(studentId).toArray()
  const sessions = await db.quizSessions.where('studentId').equals(studentId).toArray()
  const totalTimeSpent = sessions.reduce((sum, s) => sum + (s.timeSpent ?? 0), 0)
  const correctCount = attempts.filter((a) => a.isCorrect).length

  return {
    total: attempts.length,
    correct: correctCount,
    accuracy: attempts.length > 0 ? Math.round((correctCount / attempts.length) * 100) : 0,
    totalTimeSeconds: totalTimeSpent,
  }
}

/**
 * 취약 유형 목록 반환 — AIAN-02, AIAN-04
 * quizAttempts < 30이면 AIAN-04 휴리스틱: getCategoryAccuracy 기반 정답률 낮은 순 반환
 * BKT 모드: P(L) < WEAK_THRESHOLD인 유형 (pL 오름차순)
 */
export async function getWeakCategories(
  studentId: string,
): Promise<{ category: string; pL: number }[]> {
  const attempts = await db.quizAttempts.where('studentId').equals(studentId).toArray()

  // AIAN-04 휴리스틱: 시도 횟수 30회 미만이면 정답률 기반 단순 분석
  if (attempts.length < 30) {
    const categoryAccuracy = await getCategoryAccuracy(studentId)
    return categoryAccuracy
      .map((item) => ({
        category: item.category,
        pL: item.accuracy / 100, // 정답률을 pL 대용으로 사용
      }))
      .sort((a, b) => a.pL - b.pL)
  }

  // BKT 모드: questionCategory별 시도 기록 그루핑 후 computeBKT 실행
  const questions = await db.questions.toArray()
  const categoryMap = new Map(questions.map((q) => [q.id, q.questionCategory]))

  const grouped = new Map<string, { isCorrect: boolean }[]>()
  for (const attempt of attempts) {
    const cat = categoryMap.get(attempt.questionId) ?? '기타'
    const list = grouped.get(cat) ?? []
    list.push({ isCorrect: attempt.isCorrect })
    grouped.set(cat, list)
  }

  const bktResults: { category: string; pL: number }[] = []
  for (const [category, categoryAttempts] of grouped) {
    const pL = computeBKT(categoryAttempts, DEFAULT_BKT_PARAMS)
    if (pL < WEAK_THRESHOLD) {
      bktResults.push({ category, pL })
    }
  }

  return bktResults.sort((a, b) => a.pL - b.pL)
}

/**
 * 모든 유형별 마스터리 수준 계산 — ANLZ-02
 * BKT pL 또는 정답률 기반으로 각 유형의 숙련도 레벨 반환
 * level 판별: pL >= 0.95 → mastery, >= 0.7 → proficient, >= 0.4 → learning, < 0.4 → weak
 */
export async function getAllCategoryMastery(
  studentId: string,
): Promise<
  {
    category: string
    pL: number
    total: number
    correct: number
    level: 'mastery' | 'proficient' | 'learning' | 'weak'
  }[]
> {
  const attempts = await db.quizAttempts.where('studentId').equals(studentId).toArray()

  const questions = await db.questions.toArray()
  const categoryMap = new Map(questions.map((q) => [q.id, q.questionCategory]))

  // 유형별 시도 기록 그루핑
  const grouped = new Map<string, { isCorrect: boolean }[]>()
  const countMap = new Map<string, { correct: number; total: number }>()

  for (const attempt of attempts) {
    const cat = categoryMap.get(attempt.questionId) ?? '기타'

    const list = grouped.get(cat) ?? []
    list.push({ isCorrect: attempt.isCorrect })
    grouped.set(cat, list)

    const counts = countMap.get(cat) ?? { correct: 0, total: 0 }
    countMap.set(cat, {
      correct: counts.correct + (attempt.isCorrect ? 1 : 0),
      total: counts.total + 1,
    })
  }

  const useBKT = attempts.length >= 30

  const results: {
    category: string
    pL: number
    total: number
    correct: number
    level: 'mastery' | 'proficient' | 'learning' | 'weak'
  }[] = []

  for (const [category, categoryAttempts] of grouped) {
    const counts = countMap.get(category) ?? { correct: 0, total: 0 }

    const pL = useBKT
      ? computeBKT(categoryAttempts, DEFAULT_BKT_PARAMS)
      : counts.total > 0
        ? counts.correct / counts.total
        : 0

    const level: 'mastery' | 'proficient' | 'learning' | 'weak' =
      pL >= 0.95 ? 'mastery' : pL >= 0.7 ? 'proficient' : pL >= 0.4 ? 'learning' : 'weak'

    results.push({
      category,
      pL,
      total: counts.total,
      correct: counts.correct,
      level,
    })
  }

  // pL 내림차순 (숙달 수준 높은 순)
  return results.sort((a, b) => b.pL - a.pL)
}

/**
 * 이번 주 vs 지난 주 통계 비교 — ANLZ-03
 * 로컬 타임존 월요일 기준 주 계산
 */
export async function getWeeklyComparison(studentId: string): Promise<{
  thisWeek: { count: number; correct: number; accuracy: number }
  lastWeek: { count: number; correct: number; accuracy: number }
  changePercent: number
}> {
  const now = new Date()

  // 로컬 타임존 이번 주 월요일 자정
  const dayOfWeek = now.getDay() // 0=일, 1=월, ..., 6=토
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  const thisMonday = new Date(now)
  thisMonday.setHours(0, 0, 0, 0)
  thisMonday.setDate(now.getDate() - daysFromMonday)

  const thisWeekStart = thisMonday.getTime()
  const lastWeekStart = thisWeekStart - 7 * 24 * 60 * 60 * 1000

  const attempts = await db.quizAttempts
    .where('studentId')
    .equals(studentId)
    .filter((a) => a.attemptedAt >= lastWeekStart)
    .toArray()

  const thisWeekAttempts = attempts.filter((a) => a.attemptedAt >= thisWeekStart)
  const lastWeekAttempts = attempts.filter(
    (a) => a.attemptedAt >= lastWeekStart && a.attemptedAt < thisWeekStart,
  )

  const calcStats = (list: typeof attempts) => {
    const count = list.length
    const correct = list.filter((a) => a.isCorrect).length
    return {
      count,
      correct,
      accuracy: count > 0 ? Math.round((correct / count) * 100) : 0,
    }
  }

  const thisWeek = calcStats(thisWeekAttempts)
  const lastWeek = calcStats(lastWeekAttempts)

  // 변화량: 정답률 기준 (lastWeek 정답률이 0이면 count 기준)
  let changePercent = 0
  if (lastWeek.accuracy > 0) {
    changePercent = Math.round(((thisWeek.accuracy - lastWeek.accuracy) / lastWeek.accuracy) * 100)
  } else if (lastWeek.count > 0) {
    changePercent = Math.round(((thisWeek.count - lastWeek.count) / lastWeek.count) * 100)
  }

  return { thisWeek, lastWeek, changePercent }
}

/**
 * 맞춤 문제 추천 — AIAN-03
 * 취약 유형 상위 3개 → 해당 questions 중 최근 7일 isCorrect=true 제외 → limit개 반환
 * questions 테이블이 비어있으면 []
 */
export async function getRecommendedQuestions(
  studentId: string,
  limit = 5,
): Promise<number[]> {
  const questionCount = await db.questions.count()
  if (questionCount === 0) return []

  const weakCategories = await getWeakCategories(studentId)
  if (weakCategories.length === 0) return []

  // 취약 유형 상위 3개 선택
  const topWeakCategories = weakCategories.slice(0, 3).map((w) => w.category)

  // 최근 7일 내 isCorrect=true인 questionId 제외
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const recentCorrectAttempts = await db.quizAttempts
    .where('studentId')
    .equals(studentId)
    .filter((a) => a.isCorrect && a.attemptedAt >= sevenDaysAgo)
    .toArray()
  const recentCorrectIds = new Set(recentCorrectAttempts.map((a) => a.questionId))

  // 취약 유형 questions 중 최근 정답 제외 후 limit개 반환
  const candidateQuestions = await db.questions
    .filter(
      (q) =>
        topWeakCategories.includes(q.questionCategory) &&
        !recentCorrectIds.has(q.id),
    )
    .toArray()

  // 최대 limit개 반환 (question id 배열)
  return candidateQuestions.slice(0, limit).map((q) => q.id)
}
