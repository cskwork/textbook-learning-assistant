// apps/web/src/lib/db.ts
// Dexie IndexedDB 스키마 — 문제 영구 저장 + 퀴즈 엔진 (version 2) + DIY 문제집 (version 3) + AI 분석 설정 (version 4) + 강사 관리 포털 (version 5) + 마이페이지 + 앱 설정 (version 6)
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

export interface UserSetting {
  id: number
  userId: string              // user email (유니크)
  dailyGoal: number           // 일일 목표 문제 수 (기본: 10)
  isDiagnosisCompleted: boolean  // 온보딩 진단 퀴즈 완료 여부
  displayName?: string        // 사용자 표시 이름 (마이페이지 — MYPAGE-01)
  avatarEmoji?: string        // 이모지 아바타 (마이페이지 — MYPAGE-01)
  isDarkMode?: boolean        // 다크모드 설정 (앱 설정 — MYPAGE-02)
  katexFontSize?: number      // 수식 글꼴 크기 0.8~1.5 (앱 설정 — MYPAGE-02)
}

export interface Group {
  id: number
  instructorId: string   // 강사 email
  name: string           // 반 이름 (예: "2025 수능반 A")
  inviteCode: string     // 6자리 대문자 영숫자 (예: "AB1C2D")
  createdAt: number      // Date.now()
}

export interface GroupMember {
  id: number
  groupId: number        // Group.id
  studentId: string      // 학생 email
  joinedAt: number       // Date.now()
}

export interface Assignment {
  id: number
  groupId: number        // Group.id
  workbookId: number     // Workbook.id
  title: string          // 과제 제목
  assignedAt: number     // Date.now()
  dueDate?: number       // 마감일 (ms, 선택)
}

const db = new Dexie('mathQuestionDB') as Dexie & {
  questions: EntityTable<Question, 'id'>
  quizSessions: EntityTable<QuizSession, 'id'>
  quizAttempts: EntityTable<QuizAttempt, 'id'>
  wrongNotes: EntityTable<WrongNote, 'id'>
  workbooks: EntityTable<Workbook, 'id'>
  userSettings: EntityTable<UserSetting, 'id'>
  groups: EntityTable<Group, 'id'>
  groupMembers: EntityTable<GroupMember, 'id'>
  assignments: EntityTable<Assignment, 'id'>
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

// version(4): AI 분석 + 일일 목표 + 온보딩 진단 설정 테이블 추가
// ⚠️ 기존 version(1)~(3) 절대 수정하지 말 것
db.version(4).stores({
  questions: '++id, subject, unit, questionCategory, difficulty, createdAt, createdBy',
  quizSessions: '++id, questionId, studentId, startedAt',
  quizAttempts: '++id, questionId, studentId, sessionId, attemptedAt, isCorrect',
  wrongNotes: '++id, questionId, studentId, [questionId+studentId], unit, questionCategory, lastWrongAt',
  workbooks: '++id, studentId, createdAt',
  userSettings: '++id, &userId',
})

// version(5): 강사 관리 포털 (groups, groupMembers, assignments)
// ⚠️ 기존 version(1)~(4) 절대 수정하지 말 것
db.version(5).stores({
  questions: '++id, subject, unit, questionCategory, difficulty, createdAt, createdBy',
  quizSessions: '++id, questionId, studentId, startedAt',
  quizAttempts: '++id, questionId, studentId, sessionId, attemptedAt, isCorrect',
  wrongNotes: '++id, questionId, studentId, [questionId+studentId], unit, questionCategory, lastWrongAt',
  workbooks: '++id, studentId, createdAt',
  userSettings: '++id, &userId',
  groups: '++id, instructorId, &inviteCode',
  groupMembers: '++id, groupId, studentId, [groupId+studentId]',
  assignments: '++id, groupId, workbookId',
})

// version(6): 마이페이지 + 앱 설정 (UserSetting 확장 — 인덱스 변경 없음, optional 필드만 추가)
// ⚠️ 기존 version(1)~(5) 절대 수정하지 말 것
db.version(6).stores({
  questions: '++id, subject, unit, questionCategory, difficulty, createdAt, createdBy',
  quizSessions: '++id, questionId, studentId, startedAt',
  quizAttempts: '++id, questionId, studentId, sessionId, attemptedAt, isCorrect',
  wrongNotes: '++id, questionId, studentId, [questionId+studentId], unit, questionCategory, lastWrongAt',
  workbooks: '++id, studentId, createdAt',
  userSettings: '++id, &userId',
  groups: '++id, instructorId, &inviteCode',
  groupMembers: '++id, groupId, studentId, [groupId+studentId]',
  assignments: '++id, groupId, workbookId',
})

// 앱 시작 시 DB가 비어있으면 시드 데이터 자동 삽입
// 순환 참조 안전: 런타임에는 모든 모듈 로드 완료 후 ready 이벤트 발생
import { seedIfEmpty } from './seed-data'
db.on('ready', () => seedIfEmpty())

export { db }
