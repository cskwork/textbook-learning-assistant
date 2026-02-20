// apps/web/src/services/question.service.ts
// 문제 CRUD 서비스 — Dexie IndexedDB 레이어 래핑
import { db, type Question } from '@/lib/db'

export type CreateQuestionInput = Omit<Question, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateQuestionInput = Partial<Omit<Question, 'id' | 'createdAt' | 'updatedAt'>>

export interface QuestionFilters {
  subject?: Question['subject']
  difficulty?: Question['difficulty']
  questionCategory?: string
}

/** 문제 등록 — id, createdAt, updatedAt 자동 생성 */
export async function createQuestion(data: CreateQuestionInput): Promise<number> {
  return db.questions.add({
    ...data,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  } as Question)
}

/** 문제 수정 — updatedAt 자동 갱신 */
export async function updateQuestion(id: number, data: UpdateQuestionInput): Promise<void> {
  await db.questions.update(id, { ...data, updatedAt: Date.now() })
}

/** 문제 삭제 */
export async function deleteQuestion(id: number): Promise<void> {
  await db.questions.delete(id)
}

/** 문제 단건 조회 */
export async function getQuestion(id: number): Promise<Question | undefined> {
  return db.questions.get(id)
}

/** 문제 목록 조회 — 최신순, 선택적 필터 */
export async function listQuestions(filters?: QuestionFilters): Promise<Question[]> {
  if (filters?.subject) {
    const result = await db.questions
      .where('subject')
      .equals(filters.subject)
      .toArray()
    return result.sort((a, b) => b.createdAt - a.createdAt)
  }
  return db.questions.orderBy('createdAt').reverse().toArray()
}
