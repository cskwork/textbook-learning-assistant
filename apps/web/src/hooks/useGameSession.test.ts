import { describe, expect, it } from 'vitest'
import { createInitialState, createQuestionsSignature, gameReducer } from './useGameSession'
import type { Question } from '@/lib/db'

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

describe('useGameSession helpers', () => {
  it('questions 시그니처를 id 순서대로 생성한다', () => {
    const signature = createQuestionsSignature([createQuestion(10), createQuestion(20)])
    expect(signature).toBe('10,20')
  })

  it('RESET_SESSION 액션으로 문제 세트를 교체하고 ready 상태로 초기화한다', () => {
    const emptyState = createInitialState('timeAttack', [])
    const nextState = gameReducer(emptyState, {
      type: 'RESET_SESSION',
      mode: 'timeAttack',
      questions: [createQuestion(1), createQuestion(2)],
    })

    expect(nextState.phase).toBe('ready')
    expect(nextState.questions.length).toBe(2)
    expect(nextState.currentQuestionIndex).toBe(0)
  })

  it('survival 모드 NEXT_QUESTION은 문제 인덱스를 순환한다', () => {
    const q1 = createQuestion(1)
    const q2 = createQuestion(2)
    const state = createInitialState('survival', [q1, q2])

    const next1 = gameReducer(state, { type: 'NEXT_QUESTION' })
    const next2 = gameReducer(next1, { type: 'NEXT_QUESTION' })

    expect(next1.currentQuestionIndex).toBe(1)
    expect(next2.currentQuestionIndex).toBe(0)
    expect(next2.phase).toBe('ready')
  })
})
