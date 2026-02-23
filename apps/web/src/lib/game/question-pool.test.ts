import { describe, expect, it } from 'vitest'
import type { Question } from '@/lib/db'
import { buildGameQuestionPool } from './question-pool'

function createQuestion(id: number): Question {
  return {
    id,
    content: `문제 ${id}`,
    answer: '1',
    choices: ['1', '2', '3', '4', '5'],
    questionType: 'multiple',
    explanation: '해설',
    subject: '수학I',
    unit: '단원',
    questionCategory: '유형',
    difficulty: 2,
    source: { type: '기타' },
    createdAt: Date.now(),
    updatedAt: Date.now(),
    createdBy: 'tester@example.com',
  }
}

describe('buildGameQuestionPool', () => {
  it('primary를 우선 사용하고 부족분은 fallback으로 채운다', () => {
    const result = buildGameQuestionPool(
      [createQuestion(1)],
      [createQuestion(2), createQuestion(3)],
      3,
    )
    const ids = new Set(result.map((q) => q.id))

    expect(result).toHaveLength(3)
    expect(ids.has(1)).toBe(true)
    expect(ids.has(2) || ids.has(3)).toBe(true)
  })

  it('유니크 문제 수가 target보다 적으면 중복 허용으로 확장한다', () => {
    const result = buildGameQuestionPool([createQuestion(1)], [], 5)
    expect(result).toHaveLength(5)
    expect(result.every((q) => q.id === 1)).toBe(true)
  })
})
