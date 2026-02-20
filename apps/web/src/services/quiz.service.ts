// apps/web/src/services/quiz.service.ts
// 퀴즈 채점 + 학습 이력 저장 서비스
import { db, type Question, type QuizAttempt } from '@/lib/db'

/** 답 정규화 비교 — 객관식/단답형 공통 */
export function gradeAnswer(question: Question, userAnswer: string): boolean {
  const normalize = (s: string) => s.trim().replace(/\s+/g, '').toLowerCase()
  return normalize(userAnswer) === normalize(question.answer)
}

export interface SubmitAttemptParams {
  question: Question
  studentId: string
  userAnswer: string
  timeSpent: number          // 초 단위 (useTimer.seconds)
  attemptCount?: number      // 기본값 1, 오답노트 재풀이 시 이전 시도 수 + 1
}

export interface SubmitAttemptResult {
  isCorrect: boolean
  attemptId: number
}

/** 퀴즈 시도 저장 + 오답이면 WrongNote upsert */
export async function submitQuizAttempt(params: SubmitAttemptParams): Promise<SubmitAttemptResult> {
  const { question, studentId, userAnswer, timeSpent, attemptCount = 1 } = params
  const isCorrect = gradeAnswer(question, userAnswer)

  const attemptId = await db.quizAttempts.add({
    questionId: question.id,
    studentId,
    userAnswer,
    isCorrect,
    timeSpent,
    attemptedAt: Date.now(),
    attemptCount,
  } as QuizAttempt)

  if (!isCorrect) {
    // 중복 방지: 기존 WrongNote 확인 후 update/add 분기
    const existing = await db.wrongNotes
      .where('[questionId+studentId]')
      .equals([question.id, studentId])
      .first()

    if (existing) {
      await db.wrongNotes.update(existing.id, {
        wrongCount: existing.wrongCount + 1,
        lastWrongAt: Date.now(),
        isMastered: false,  // 다시 틀렸으므로 미숙련으로 되돌림
      })
    } else {
      await db.wrongNotes.add({
        questionId: question.id,
        studentId,
        subject: question.subject,
        unit: question.unit,
        questionCategory: question.questionCategory,
        wrongCount: 1,
        lastWrongAt: Date.now(),
        addedAt: Date.now(),
        isMastered: false,
        isBookmarked: false,
      })
    }
  } else {
    // 오답노트에서 재풀이하여 정답 맞추면 isMastered 자동 설정
    const existing = await db.wrongNotes
      .where('[questionId+studentId]')
      .equals([question.id, studentId])
      .first()
    if (existing && !existing.isMastered) {
      await db.wrongNotes.update(existing.id, { isMastered: true })
    }
  }

  return { isCorrect, attemptId }
}

/** 같은 문제의 이전 시도 횟수 조회 (오답노트 재풀이 attemptCount 계산용) */
export async function getAttemptCount(questionId: number, studentId: string): Promise<number> {
  return db.quizAttempts
    .where('questionId')
    .equals(questionId)
    .filter(a => a.studentId === studentId)
    .count()
}
