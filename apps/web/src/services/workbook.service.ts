// apps/web/src/services/workbook.service.ts
// 문제집 CRUD + 필터 기반 문제 선택 서비스
import { db, type Question, type Workbook } from '@/lib/db'

export interface WorkbookFilters {
  subject?: string
  unit?: string
  questionCategory?: string
  difficulty?: number
  count: number
}

/** 필터 조건에 맞는 문제 선택 — 인메모리 필터 + 랜덤 셔플 후 count 반환 */
export async function getFilteredQuestions(filters: WorkbookFilters): Promise<Question[]> {
  let questions = await db.questions.toArray()

  if (filters.subject) {
    questions = questions.filter((q) => q.subject === filters.subject)
  }
  if (filters.unit) {
    questions = questions.filter((q) => q.unit === filters.unit)
  }
  if (filters.questionCategory) {
    questions = questions.filter((q) => q.questionCategory === filters.questionCategory)
  }
  if (filters.difficulty) {
    questions = questions.filter((q) => q.difficulty === filters.difficulty)
  }

  // 랜덤 셔플 (POC 수준, Fisher-Yates 완전 균등 아니지만 충분)
  const shuffled = [...questions].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, filters.count)
}

/** 문제집 저장 — questionIds 배열만 저장 (Question 객체 전체 저장 금지) */
export async function createWorkbook(params: {
  studentId: string
  title: string
  filters: WorkbookFilters
  questionIds: number[]
}): Promise<number> {
  return db.workbooks.add({
    studentId: params.studentId,
    title: params.title,
    filters: params.filters,
    questionIds: params.questionIds,
    createdAt: Date.now(),
  } as Workbook)
}

/** 학생의 문제집 목록 — createdAt 역순 (최신 먼저) */
export async function listWorkbooks(studentId: string): Promise<Workbook[]> {
  const all = await db.workbooks
    .where('studentId')
    .equals(studentId)
    .toArray()
  return all.sort((a, b) => b.createdAt - a.createdAt)
}

/** 단일 문제집 조회 */
export async function getWorkbook(workbookId: number): Promise<Workbook | undefined> {
  return db.workbooks.get(workbookId)
}

/** 문제집 삭제 */
export async function deleteWorkbook(workbookId: number): Promise<void> {
  return db.workbooks.delete(workbookId)
}

/** 필터 드롭다운용 옵션 목록 — questions 테이블에서 동적 추출 */
export async function getFilterOptions(): Promise<{
  units: string[]
  categories: string[]
}> {
  const questions = await db.questions.toArray()
  return {
    units: [...new Set(questions.map((q) => q.unit).filter(Boolean))].sort(),
    categories: [...new Set(questions.map((q) => q.questionCategory).filter(Boolean))].sort(),
  }
}
