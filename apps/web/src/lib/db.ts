// apps/web/src/lib/db.ts
// Dexie IndexedDB 스키마 — 문제 영구 저장 + 퀴즈 엔진 (version 2) + DIY 문제집 (version 3)
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

export interface QuizSession {
  id: number
  studentId: string          // user email
  questionId: number         // db.questions.id
  startedAt: number          // Date.now()
  completedAt?: number
  timeSpent?: number         // 소요 시간 (초)
}

export interface QuizAttempt {
  id: number
  sessionId?: number         // QuizSession.id (선택적 — 단일 문제 풀기 시 없을 수 있음)
  questionId: number
  studentId: string
  userAnswer: string         // 객관식: '1'~'5', 단답형: 숫자 문자열
  isCorrect: boolean
  timeSpent: number          // 초 단위
  attemptedAt: number        // Date.now()
  attemptCount: number       // 같은 문제 몇 번째 시도 (오답노트 재풀이 추적)
}

export interface WrongNote {
  id: number
  questionId: number
  studentId: string
  // 필터용 비정규화 필드 (Question에서 복사 — 조인 없이 직접 쿼리 가능)
  subject: string
  unit: string
  questionCategory: string
  // 통계
  wrongCount: number
  lastWrongAt: number
  addedAt: number
  isMastered: boolean        // 완전 학습 여부
  isBookmarked: boolean      // 북마크 (QUIZ-06) — WrongNote와 북마크를 단일 테이블로 통합
}

export interface Workbook {
  id: number
  studentId: string           // user email
  title: string               // 사용자 지정 문제집 이름
  filters: {
    subject?: string
    unit?: string
    questionCategory?: string
    difficulty?: number       // 1~5
    count: number             // 요청한 문제 수
  }
  questionIds: number[]       // 선택된 문제 ID 배열 (순서 포함)
  createdAt: number           // Date.now()
  lastPlayedAt?: number
  completedAt?: number
}

const db = new Dexie('mathQuestionDB') as Dexie & {
  questions: EntityTable<Question, 'id'>
  quizSessions: EntityTable<QuizSession, 'id'>
  quizAttempts: EntityTable<QuizAttempt, 'id'>
  wrongNotes: EntityTable<WrongNote, 'id'>
  workbooks: EntityTable<Workbook, 'id'>
}

// version(1): 절대 수정/삭제하지 말 것 — 기존 브라우저 IndexedDB 마이그레이션 경로
db.version(1).stores({
  questions: '++id, subject, unit, questionCategory, difficulty, createdAt, createdBy',
})

// version(2): 퀴즈 엔진 테이블 3개 추가
// wrongNotes에 [questionId+studentId] 복합 인덱스 필수 — upsert 조회에 사용
db.version(2).stores({
  questions: '++id, subject, unit, questionCategory, difficulty, createdAt, createdBy',
  quizSessions: '++id, questionId, studentId, startedAt',
  quizAttempts: '++id, questionId, studentId, sessionId, attemptedAt, isCorrect',
  wrongNotes: '++id, questionId, studentId, [questionId+studentId], unit, questionCategory, lastWrongAt',
})

// version(3): DIY 문제집 테이블 추가
db.version(3).stores({
  questions: '++id, subject, unit, questionCategory, difficulty, createdAt, createdBy',
  quizSessions: '++id, questionId, studentId, startedAt',
  quizAttempts: '++id, questionId, studentId, sessionId, attemptedAt, isCorrect',
  wrongNotes: '++id, questionId, studentId, [questionId+studentId], unit, questionCategory, lastWrongAt',
  workbooks: '++id, studentId, createdAt',
})

export { db }
