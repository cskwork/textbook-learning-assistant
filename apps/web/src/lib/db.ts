// apps/web/src/lib/db.ts
// Dexie IndexedDB 스키마 — 문제 영구 저장 + 퀴즈 엔진 (version 2) + DIY 문제집 (version 3) + AI 분석 설정 (version 4) + 강사 관리 포털 (version 5) + 마이페이지 + 앱 설정 (version 6) + 학습 플래너 (version 7) + 게이미피케이션 (version 8)
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
  choices?: string[]        // 객관식 선택지 텍스트 (5개, LaTeX 포함 가능)
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
  // Phase 9: geminiApiKey 필드 추가 (인덱스 없는 선택 필드, db.version 변경 불필요)
  geminiApiKey?: string       // Gemini API 키 (Phase 9 — 인덱스 없음, 버전 업 불필요)
  // Phase 13: 학습 플래너 설정 (인덱스 없는 선택 필드 — version 변경 불필요)
  weeklyGoal?: number         // 주간 목표 문제 수 (기본: 50)
  subjectTimeAllocation?: Record<string, number>  // 과목별 시간 배분 비율 (예: { '수학I': 30, '미적분': 40 })
  notificationEnabled?: boolean  // 알림 활성화 여부
  notificationTime?: string   // 알림 시간 (예: "20:00")
  // Phase 17: 사운드 설정 (인덱스 없는 선택 필드 — version 변경 불필요)
  bgmVolume?: number          // BGM 볼륨 0~1 (기본 0.5)
  sfxVolume?: number          // SFX 볼륨 0~1 (기본 0.7)
  isSoundMuted?: boolean      // 전체 음소거 (기본 false)
  bgmEnabled?: boolean        // BGM ON/OFF (기본 false — 유저 결정: 기본 OFF)
}

// Phase 13: 학습 플래너 — 일간/주간 학습 계획
export interface StudyPlan {
  id: number
  studentId: string          // user email
  date: string               // YYYY-MM-DD (로컬 타임존)
  type: 'daily' | 'weekly'   // 일간/주간 구분
  weekStartDate?: string     // 주간 플랜인 경우 해당 주 월요일 날짜
  targetCount: number        // 목표 문제 수
  createdAt: number          // Date.now()
  updatedAt: number
}

// Phase 13: 학습 플래너 — 플랜 내 개별 할 일
export interface StudyTask {
  id: number
  planId: number             // StudyPlan.id
  studentId: string          // user email
  title: string              // 할 일 제목 (예: "미적분 5문제 풀기")
  subject?: string           // 과목 (선택)
  targetCount: number        // 목표 문제 수
  completedCount: number     // 완료 문제 수
  isCompleted: boolean       // 완료 여부
  order: number              // 정렬 순서
  createdAt: number
  completedAt?: number
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

// v3.0 게임 기록 스키마 (Phase 19 게임화 퀴즈 엔진)
export type GameMode = 'timeAttack' | 'survival' | 'bossBattle' | 'miniGame'

export interface GameRecord {
  id?: number
  studentId: string
  mode: GameMode
  score: number
  correctCount: number
  totalQuestions: number
  xpEarned: number
  timeElapsed: number            // 초 단위
  isPersonalBest: boolean
  metadata?: Record<string, unknown>  // 모드별 추가 데이터 (보스이름, 미니게임키 등)
  playedAt: number               // Date.now()
}

// v3.0 Gamification 스키마 (Phase 16 사용)
export interface GamificationProfile {
  id?: number
  studentId: string
  totalXP: number
  level: number
  streakDays: number
  lastStudyDate: number // timestamp
  updatedAt: number    // timestamp
}

export interface XPEvent {
  id?: number
  studentId: string
  amount: number
  reason: string       // 'quiz_correct' | 'combo_bonus' | 'streak_bonus' | 'daily_challenge'
  comboMultiplier: number
  timestamp: number
}

export interface BadgeRecord {
  id?: number
  studentId: string
  badgeId: string
  unlockedAt: number
}

const db = new Dexie('mathQuestionDB') as Dexie & {
  gameRecords: EntityTable<GameRecord, 'id'>
  questions: EntityTable<Question, 'id'>
  quizSessions: EntityTable<QuizSession, 'id'>
  quizAttempts: EntityTable<QuizAttempt, 'id'>
  wrongNotes: EntityTable<WrongNote, 'id'>
  workbooks: EntityTable<Workbook, 'id'>
  userSettings: EntityTable<UserSetting, 'id'>
  groups: EntityTable<Group, 'id'>
  groupMembers: EntityTable<GroupMember, 'id'>
  assignments: EntityTable<Assignment, 'id'>
  studyPlans: EntityTable<StudyPlan, 'id'>
  studyTasks: EntityTable<StudyTask, 'id'>
  gamificationProfiles: EntityTable<GamificationProfile, 'id'>
  xpEvents: EntityTable<XPEvent, 'id'>
  badges: EntityTable<BadgeRecord, 'id'>
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

// version(7): 학습 플래너 테이블 추가 (studyPlans, studyTasks)
// ⚠️ 기존 version(1)~(6) 절대 수정하지 말 것
db.version(7).stores({
  questions: '++id, subject, unit, questionCategory, difficulty, createdAt, createdBy',
  quizSessions: '++id, questionId, studentId, startedAt',
  quizAttempts: '++id, questionId, studentId, sessionId, attemptedAt, isCorrect',
  wrongNotes: '++id, questionId, studentId, [questionId+studentId], unit, questionCategory, lastWrongAt',
  workbooks: '++id, studentId, createdAt',
  userSettings: '++id, &userId',
  groups: '++id, instructorId, &inviteCode',
  groupMembers: '++id, groupId, studentId, [groupId+studentId]',
  assignments: '++id, groupId, workbookId',
  studyPlans: '++id, studentId, date, type, [studentId+date]',
  studyTasks: '++id, planId, studentId, isCompleted, order',
})

// version(8): v3.0 게이미피케이션 테이블 추가 (gamificationProfiles, xpEvents, badges)
// ⚠️ 기존 version(1)~(7) 절대 수정하지 말 것
// 기존 테이블은 자동 상속됨. 신규 테이블만 정의.
db.version(8).stores({
  gamificationProfiles: '++id, &studentId',
  xpEvents: '++id, studentId, reason, timestamp',
  badges: '++id, studentId, badgeId, unlockedAt',
})

// version(9): v3.0 게임 기록 테이블 추가 (Phase 19 게임화 퀴즈 엔진)
// ⚠️ 기존 version(1)~(8) 절대 수정하지 말 것
// 기존 테이블은 자동 상속됨. 신규 테이블만 정의.
db.version(9).stores({
  gameRecords: '++id, studentId, mode, score, playedAt, [studentId+mode]',
})

// 앱 시작 시 DB가 비어있으면 시드 데이터 자동 삽입
// 순환 참조 안전: 런타임에는 모든 모듈 로드 완료 후 ready 이벤트 발생
import { seedIfEmpty } from './seed-data'
db.on('ready', () => seedIfEmpty())

export { db }
