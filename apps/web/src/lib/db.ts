// apps/web/src/lib/db.ts
// Dexie IndexedDB 스키마 — 문제 영구 저장 (localStorage 5MB 한계 극복)
import Dexie, { type EntityTable } from 'dexie'

export interface QuestionSource {
  type: '수능' | '모의고사' | '교육청' | '기타'
  year?: number    // 예: 2024
  number?: number  // 예: 30
  month?: number   // 모의고사/교육청용 (예: 6, 9)
}

export interface Question {
  id: number
  // 내용
  content: string           // LaTeX 포함 문제 본문
  imageDataUrl?: string     // base64 이미지 (그래프/도형) — QBNK-07
  answer: string            // 정답 (객관식: '1'~'5', 단답형: 숫자 문자열)
  questionType: 'multiple' | 'short'
  // 해설 — QBNK-04
  explanation: string       // LaTeX 포함 해설 본문
  explanationImageDataUrl?: string
  // 메타데이터 — QBNK-02
  subject: '수학I' | '수학II' | '미적분' | '확률과통계' | '기하'
  unit: string              // 단원명 (자유 텍스트 — POC)
  questionCategory: string  // 유형 (자유 텍스트 — POC)
  difficulty: 1 | 2 | 3 | 4 | 5
  source: QuestionSource    // QBNK-05
  // 시스템
  createdAt: number         // Date.now()
  updatedAt: number
  createdBy: string         // user email
}

const db = new Dexie('mathQuestionDB') as Dexie & {
  questions: EntityTable<Question, 'id'>
}

db.version(1).stores({
  questions: '++id, subject, unit, questionCategory, difficulty, createdAt, createdBy',
})

export { db }
