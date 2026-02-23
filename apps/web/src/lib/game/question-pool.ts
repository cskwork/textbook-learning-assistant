import type { Question } from '@/lib/db'

/** Fisher-Yates 셔플 */
export function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * 게임 모드용 문제 풀 생성
 * - 1순위(primary)를 우선 사용
 * - 부족하면 fallback으로 보강
 * - 그래도 targetCount 미만이면 반복 채움(중복 허용)
 */
export function buildGameQuestionPool(
  primary: Question[],
  fallback: Question[],
  targetCount: number = 50,
): Question[] {
  const byId = new Map<number, Question>()

  for (const q of primary) {
    byId.set(q.id, q)
  }

  for (const q of fallback) {
    if (!byId.has(q.id)) byId.set(q.id, q)
  }

  const uniquePool = shuffleArray(Array.from(byId.values()))
  if (uniquePool.length === 0) return []
  if (uniquePool.length >= targetCount) return uniquePool.slice(0, targetCount)

  const expanded: Question[] = []
  for (let i = 0; i < targetCount; i++) {
    expanded.push(uniquePool[i % uniquePool.length])
  }
  return expanded
}
