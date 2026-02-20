// apps/web/src/services/wrongNote.service.ts
// 오답노트 CRUD 서비스 — 북마크 포함
import { db, type WrongNote, type Question } from '@/lib/db'

/** 오답노트 목록 조회 — 인메모리 필터 (POC 규모에서 적합) */
export async function listWrongNotes(params: {
  studentId: string
  filterUnit?: string
  filterCategory?: string
  includeMastered?: boolean  // 기본 false — 완전 학습 항목 제외
}): Promise<WrongNote[]> {
  const { studentId, filterUnit, filterCategory, includeMastered = false } = params

  let notes = await db.wrongNotes
    .where('studentId')
    .equals(studentId)
    .toArray()

  if (!includeMastered) {
    notes = notes.filter(n => !n.isMastered)
  }
  if (filterUnit) {
    notes = notes.filter(n => n.unit === filterUnit)
  }
  if (filterCategory) {
    notes = notes.filter(n => n.questionCategory === filterCategory)
  }

  // 마지막 틀린 시각 역순 정렬
  return notes.sort((a, b) => b.lastWrongAt - a.lastWrongAt)
}

/** 단원별 고유 목록 추출 (필터 드롭다운용) */
export async function getWrongNoteUnits(studentId: string): Promise<string[]> {
  const notes = await db.wrongNotes
    .where('studentId')
    .equals(studentId)
    .filter(n => !n.isMastered)
    .toArray()
  return [...new Set(notes.map(n => n.unit))].sort()
}

/** 유형별 고유 목록 추출 (필터 드롭다운용) */
export async function getWrongNoteCategories(studentId: string): Promise<string[]> {
  const notes = await db.wrongNotes
    .where('studentId')
    .equals(studentId)
    .filter(n => !n.isMastered)
    .toArray()
  return [...new Set(notes.map(n => n.questionCategory))].sort()
}

/** 완전 학습 처리 (ERRN-04) */
export async function markAsMastered(wrongNoteId: number): Promise<void> {
  await db.wrongNotes.update(wrongNoteId, { isMastered: true })
}

/** 북마크 토글 (QUIZ-06) — WrongNote 테이블 isBookmarked 필드 활용 */
export async function toggleBookmark(questionId: number, studentId: string, question: Question): Promise<boolean> {
  const existing = await db.wrongNotes
    .where('[questionId+studentId]')
    .equals([questionId, studentId])
    .first()

  if (existing) {
    const newBookmarked = !existing.isBookmarked
    await db.wrongNotes.update(existing.id, { isBookmarked: newBookmarked })
    return newBookmarked
  } else {
    // 오답 아닌 순수 북마크 레코드 생성
    await db.wrongNotes.add({
      questionId,
      studentId,
      subject: question.subject,
      unit: question.unit,
      questionCategory: question.questionCategory,
      wrongCount: 0,
      lastWrongAt: 0,
      addedAt: Date.now(),
      isMastered: false,
      isBookmarked: true,
    })
    return true
  }
}

/** 단일 WrongNote 조회 (북마크·완전 학습 상태 확인용) */
export async function getWrongNote(questionId: number, studentId: string): Promise<WrongNote | undefined> {
  return db.wrongNotes
    .where('[questionId+studentId]')
    .equals([questionId, studentId])
    .first()
}
