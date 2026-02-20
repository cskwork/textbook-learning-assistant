# Phase 3: 퀴즈 엔진 + 오답노트 — 리서치

**Researched:** 2026-02-20
**Domain:** 클라이언트 사이드 퀴즈 엔진 + Dexie.js 스키마 확장 + 오답노트 필터 UI
**Confidence:** HIGH

---

## Summary

Phase 3의 핵심 도전은 세 가지다: (1) 기존 Dexie `questions` 테이블 위에 `quizSessions`, `quizAttempts`, `wrongNotes` 세 테이블을 추가하는 스키마 버전 업그레이드, (2) 객관식(5지선다) + 단답형 채점을 클라이언트에서 수행하는 퀴즈 플로우 구현, (3) 오답노트 필터링과 재풀이 UI.

**아키텍처 전제:** POC 목적이므로 채점은 완전 클라이언트에서 수행한다. Dexie 스키마를 `version(2)`로 올려 세 테이블을 추가한다. 타이머는 React `useEffect` + `setInterval` 패턴 또는 `useInterval` 커스텀 훅으로 구현한다. 정답 비교는 `answer.trim().toLowerCase() === userAnswer.trim().toLowerCase()` 수준의 간단한 문자열 비교로 충분하다(단답형 숫자 비교).

Phase 2에서 구축한 자산(`db.ts`의 `Question` 인터페이스, `LatexPreview`, `QuestionCard`, `useLiveQuery` 패턴)을 그대로 재사용한다.

**Primary recommendation:** Dexie `version(2)` 스키마 확장 + 클라이언트 채점 + `useInterval` 타이머 + `useLiveQuery` 기반 오답노트 필터로 구현하라. 별도 상태 관리 라이브러리(Zustand/XState) 없이 `useReducer`로 퀴즈 세션 상태를 관리하라.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| QUIZ-01 | 학생이 객관식(5지선다) 문제를 풀 수 있다 | 5개 버튼 선택 UI + 선택 상태 관리 (useState/useReducer), 선택 후 제출 버튼 |
| QUIZ-02 | 학생이 단답형(숫자/수식) 문제를 풀 수 있다 | input[type=text] + 숫자 normalize 비교 (trim + 공백 제거) |
| QUIZ-03 | 문제 제출 시 즉시 자동 채점되어 정오답이 표시된다 | 클라이언트 채점 함수: answer.trim() === userAnswer.trim(), 정오답 UI 상태 전환 |
| QUIZ-04 | 채점 후 해당 문제의 상세 해설을 볼 수 있다 | 채점 후 해설 섹션 표시 (LatexPreview 재사용), Phase 2 QuestionDetailPage 패턴 |
| QUIZ-05 | 문제 풀이 중 타이머가 작동하여 소요 시간이 기록된다 | useInterval(callback, 1000) — delay:null로 일시정지, Date.now()로 경과 시간 계산 |
| QUIZ-06 | 학생이 문제를 북마크(스크랩)할 수 있다 | WrongNote/Bookmark 테이블에 questionId 저장, useLiveQuery로 북마크 상태 반응형 구독 |
| QUIZ-07 | 모든 풀이 결과(정오답, 소요시간, 선택답)가 학습 이력에 저장된다 | QuizAttempt Dexie 테이블 — questionId, isCorrect, userAnswer, timeSpent, attemptedAt |
| ERRN-01 | 틀린 문제가 자동으로 오답노트에 수집된다 | 채점 후 isCorrect=false이면 WrongNote 테이블에 upsert |
| ERRN-02 | 학생이 오답노트의 문제를 다시 풀 수 있다 (N회독) | WrongNote → Question 조인, 동일 퀴즈 UI로 재풀이 |
| ERRN-03 | 오답노트를 단원별/유형별로 필터링하여 볼 수 있다 | Dexie WrongNote.where('unit').equals() + filter(), useLiveQuery 의존성 배열 |
| ERRN-04 | 학생이 오답노트에서 완전 학습한 문제를 제거할 수 있다 | WrongNote 레코드 delete, useLiveQuery 자동 리렌더 |
| PLAN-01 | 문제 풀이 시 타이머가 작동하고 소요 시간이 표시된다 | QUIZ-05와 동일 구현 — mm:ss 포맷, 경과 시간 표시 |
</phase_requirements>

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| dexie | ^4.3.0 (설치됨) | 퀴즈 세션/시도/오답노트 저장 | 이미 사용 중 — version(2) 스키마 확장만 필요 |
| dexie-react-hooks | ^4.2.0 (설치됨) | useLiveQuery로 오답노트 반응형 목록 | 이미 사용 중 |
| react-hook-form | ^7.71.1 (설치됨) | 단답형 입력 폼 | 이미 사용 중, shadcn 표준 |
| zod | ^3.25.76 (설치됨) | 단답형 입력 유효성 검사 | 이미 사용 중 |
| katex | ^0.16.28 (설치됨) | 문제 본문 수식 렌더링 | Phase 2에서 구축됨 |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| usehooks-ts | ^3.x | useInterval 커스텀 훅 | 타이머 구현 시 — 직접 구현해도 무방 |
| lucide-react | ^0.511.0 (설치됨) | 아이콘 (타이머, 정답/오답 아이콘) | 이미 사용 중 |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| useReducer (퀴즈 상태) | Zustand | Zustand는 별도 패키지 설치 필요, POC에서는 useReducer로 충분 |
| 직접 setInterval + useRef | usehooks-ts useInterval | 직접 구현 5줄이면 충분 — 외부 의존성 없이 동일 기능 |
| 클라이언트 채점 | 서버사이드 채점 | POC에서는 클라이언트 채점 허용 (STATE.md 아키텍처 피벗 결정) |
| WrongNote 별도 테이블 | Question에 isWrong 플래그 | 별도 테이블이 오답 날짜/횟수/상태 추적에 적합 |

**추가 패키지 설치 불필요:** Phase 2 패키지로 Phase 3 전체 구현 가능. usehooks-ts useInterval은 직접 구현으로 대체.

---

## Architecture Patterns

### Recommended Project Structure
```
apps/web/src/
├── lib/
│   └── db.ts                    # version(2) — quizSessions, quizAttempts, wrongNotes 추가
├── services/
│   ├── question.service.ts      # 기존 유지
│   ├── quiz.service.ts          # QuizSession/QuizAttempt CRUD
│   └── wrongNote.service.ts     # WrongNote CRUD (upsert, delete, filter)
├── hooks/
│   └── useTimer.ts              # setInterval 기반 경과 시간 타이머 훅
├── components/
│   └── quiz/
│       ├── QuizPlayer.tsx       # 문제 표시 + 답 입력 + 타이머 + 제출 (퀴즈 엔진 핵심)
│       ├── MultipleChoiceInput.tsx  # 5지선다 선택 UI
│       ├── ShortAnswerInput.tsx     # 단답형 텍스트 입력 UI
│       ├── QuizResult.tsx       # 채점 결과 + 해설 표시
│       └── TimerDisplay.tsx     # mm:ss 타이머 표시
├── components/
│   └── wrong-notes/
│       ├── WrongNoteList.tsx    # useLiveQuery 반응형 오답노트 목록
│       ├── WrongNoteCard.tsx    # 오답 문제 카드 (재풀이/제거 버튼)
│       └── WrongNoteFilter.tsx  # 단원별/유형별 필터 드롭다운
└── routes/
    └── student/
        ├── problems/
        │   └── index.tsx        # /student/problems — 전체 문제 목록 (QuestionList 재사용)
        ├── quiz/
        │   └── [id].tsx         # /student/quiz/:id — 퀴즈 플레이어
        └── wrong-notes/
            └── index.tsx        # /student/wrong-notes — 오답노트
```

### Pattern 1: Dexie version(2) 스키마 확장
**What:** 기존 `version(1)` questions 테이블은 유지하고 `version(2)`에서 세 테이블 추가
**When to use:** Phase 3 진입 시 db.ts 첫 번째 작업

```typescript
// Source: https://dexie.org/docs/Dexie/Dexie.version()
// lib/db.ts 수정 — version(1) 유지 + version(2) 추가

export interface QuizSession {
  id: number
  studentId: string          // user email
  questionId: number         // db.questions.id
  startedAt: number          // Date.now()
  completedAt?: number       // 제출 시각
  timeSpent?: number         // 소요 시간 (초)
}

export interface QuizAttempt {
  id: number
  sessionId: number          // QuizSession.id
  questionId: number
  studentId: string
  userAnswer: string         // 학생이 입력한 답 ('1'~'5' 또는 숫자 문자열)
  isCorrect: boolean
  timeSpent: number          // 초 단위
  attemptedAt: number        // Date.now()
  attemptCount: number       // 같은 문제 몇 번째 시도 (오답노트 재풀이)
}

export interface WrongNote {
  id: number
  questionId: number
  studentId: string
  // 필터용 비정규화 필드 (Question에서 복사 — 조인 없이 직접 쿼리)
  subject: string
  unit: string
  questionCategory: string
  // 통계
  wrongCount: number         // 틀린 횟수
  lastWrongAt: number        // 마지막으로 틀린 시각
  addedAt: number            // 처음 추가된 시각
  isMastered: boolean        // 완전 학습 여부 (true면 제거 대상)
}

// version(1) 유지 — 기존 questions 테이블
db.version(1).stores({
  questions: '++id, subject, unit, questionCategory, difficulty, createdAt, createdBy',
})

// version(2) 추가 — 퀴즈 엔진 테이블 3개
db.version(2).stores({
  questions: '++id, subject, unit, questionCategory, difficulty, createdAt, createdBy',
  quizSessions: '++id, questionId, studentId, startedAt',
  quizAttempts: '++id, questionId, studentId, sessionId, attemptedAt, isCorrect',
  wrongNotes: '++id, questionId, studentId, unit, questionCategory, lastWrongAt',
})
```

**CRITICAL:** `version(1)` 선언을 절대 제거하지 말 것. 기존 브라우저 사용자의 IndexedDB가 version 1로 저장되어 있으므로, version(1)이 없으면 VersionError 발생.

### Pattern 2: 클라이언트 채점 함수
**What:** 답 문자열 정규화 후 비교, 객관식/단답형 분기 처리
**When to use:** QuizPlayer에서 제출 버튼 클릭 시

```typescript
// services/quiz.service.ts
export function gradeAnswer(
  question: Question,
  userAnswer: string,
): boolean {
  const normalize = (s: string) => s.trim().replace(/\s+/g, '').toLowerCase()

  if (question.questionType === 'multiple') {
    // 객관식: '1'~'5' 정수 비교
    return normalize(userAnswer) === normalize(question.answer)
  }

  // 단답형: 숫자 문자열 정규화 비교
  // 예: ' 3 ' === '3', '12' === '12'
  return normalize(userAnswer) === normalize(question.answer)
}

// 퀴즈 시도 저장 + 오답노트 upsert
export async function submitQuizAttempt(params: {
  question: Question
  studentId: string
  userAnswer: string
  timeSpent: number
  attemptCount?: number
}): Promise<{ isCorrect: boolean; attemptId: number }> {
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

  // 오답이면 WrongNote upsert
  if (!isCorrect) {
    const existing = await db.wrongNotes
      .where('[questionId+studentId]')
      .equals([question.id, studentId])
      .first()

    if (existing) {
      await db.wrongNotes.update(existing.id, {
        wrongCount: existing.wrongCount + 1,
        lastWrongAt: Date.now(),
        isMastered: false,
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
      } as WrongNote)
    }
  }

  return { isCorrect, attemptId }
}
```

**주의:** WrongNote를 복합 인덱스 `[questionId+studentId]`로 조회한다. `version(2)` stores에 `'[questionId+studentId]'` 인덱스를 추가해야 한다.

### Pattern 3: useTimer 훅 (경과 시간 측정)
**What:** setInterval 기반 업카운트 타이머 — 문제 풀이 시작 시 카운트 시작, 제출 시 정지
**When to use:** QuizPlayer 컴포넌트에서 QUIZ-05/PLAN-01 충족

```typescript
// hooks/useTimer.ts
import { useState, useEffect, useRef, useCallback } from 'react'

export function useTimer() {
  const [seconds, setSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const start = useCallback(() => {
    setIsRunning(true)
  }, [])

  const stop = useCallback(() => {
    setIsRunning(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    return seconds  // 최종 경과 시간 반환
  }, [seconds])

  const reset = useCallback(() => {
    setSeconds(0)
    setIsRunning(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => s + 1)
      }, 1000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning])

  const formatted = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`

  return { seconds, formatted, isRunning, start, stop, reset }
}
```

### Pattern 4: QuizPlayer 상태 머신 (useReducer)
**What:** 퀴즈 세션의 단계별 상태 전환 — idle → playing → submitted
**When to use:** /student/quiz/:id 페이지 핵심 상태 관리

```typescript
// components/quiz/QuizPlayer.tsx 내부 상태 타입
type QuizPhase = 'playing' | 'submitted'

interface QuizState {
  phase: QuizPhase
  selectedAnswer: string  // 객관식: '1'~'5', 단답형: 입력값
  isCorrect: boolean | null
  timeSpent: number
}

type QuizAction =
  | { type: 'SELECT_ANSWER'; answer: string }
  | { type: 'SUBMIT'; isCorrect: boolean; timeSpent: number }
  | { type: 'RETRY' }

function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'SELECT_ANSWER':
      return { ...state, selectedAnswer: action.answer }
    case 'SUBMIT':
      return {
        ...state,
        phase: 'submitted',
        isCorrect: action.isCorrect,
        timeSpent: action.timeSpent,
      }
    case 'RETRY':
      return {
        phase: 'playing',
        selectedAnswer: '',
        isCorrect: null,
        timeSpent: 0,
      }
    default:
      return state
  }
}

// QuizPlayer 컴포넌트 구조
export function QuizPlayer({ question, studentId, onComplete }: QuizPlayerProps) {
  const [state, dispatch] = useReducer(quizReducer, {
    phase: 'playing',
    selectedAnswer: '',
    isCorrect: null,
    timeSpent: 0,
  })
  const { seconds, formatted, start, stop } = useTimer()

  useEffect(() => {
    start()
    return () => stop()
  }, [question.id])

  async function handleSubmit() {
    const timeSpent = stop()
    const { isCorrect } = await submitQuizAttempt({
      question,
      studentId,
      userAnswer: state.selectedAnswer,
      timeSpent,
    })
    dispatch({ type: 'SUBMIT', isCorrect, timeSpent })
  }

  // phase === 'playing' → 문제 + 답 입력 UI
  // phase === 'submitted' → QuizResult (정오답 + 해설)
}
```

### Pattern 5: 오답노트 필터 (useLiveQuery + 비정규화)
**What:** WrongNote 테이블에 unit/questionCategory 비정규화 저장 → 조인 없이 직접 필터
**When to use:** /student/wrong-notes 오답노트 페이지

```typescript
// Source: https://dexie.org/docs/dexie-react-hooks/useLiveQuery()
// components/wrong-notes/WrongNoteList.tsx
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'

interface WrongNoteListProps {
  studentId: string
  filterUnit?: string
  filterCategory?: string
}

export function WrongNoteList({ studentId, filterUnit, filterCategory }: WrongNoteListProps) {
  const wrongNotes = useLiveQuery(
    async () => {
      let notes = await db.wrongNotes
        .where('studentId')
        .equals(studentId)
        .toArray()

      // 인메모리 필터 (IndexedDB 인덱스로 커버 불가한 복합 조건)
      if (filterUnit) {
        notes = notes.filter(n => n.unit === filterUnit)
      }
      if (filterCategory) {
        notes = notes.filter(n => n.questionCategory === filterCategory)
      }

      // 마지막 틀린 시각 역순 정렬
      return notes.sort((a, b) => b.lastWrongAt - a.lastWrongAt)
    },
    [studentId, filterUnit, filterCategory],
  )

  // ... 렌더링
}
```

**왜 비정규화인가:** WrongNote에서 unit/questionCategory를 필터하려면 Question을 조인해야 한다. IndexedDB는 SQL JOIN 미지원이므로, 저장 시 Question의 메타데이터를 WrongNote에 복사(비정규화)하면 단순 where() 쿼리로 처리 가능.

### Pattern 6: 북마크(QUIZ-06) 구현
**What:** WrongNote 테이블을 북마크로도 활용하거나, 별도 Bookmark 로직
**When to use:** 문제 상세/퀴즈 화면에서 북마크 버튼

```typescript
// services/wrongNote.service.ts
// 북마크 토글: WrongNote에 isMastered 플래그 또는 별도 bookmark 필드 추가 방법

// 방법 A (권장): WrongNote 테이블에 isBookmarked 필드 추가
// QuizAttempt 없이도 수동으로 북마크 추가 가능
export async function toggleBookmark(questionId: number, studentId: string, question: Question) {
  const existing = await db.wrongNotes
    .where('[questionId+studentId]')
    .equals([questionId, studentId])
    .first()

  if (existing?.isBookmarked) {
    // 북마크 해제 (오답이 아니면 레코드 삭제)
    if (existing.wrongCount === 0) {
      await db.wrongNotes.delete(existing.id)
    } else {
      await db.wrongNotes.update(existing.id, { isBookmarked: false })
    }
  } else if (existing) {
    await db.wrongNotes.update(existing.id, { isBookmarked: true })
  } else {
    // 새 레코드 생성 (오답 아닌 순수 북마크)
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
    } as WrongNote)
  }
}
```

### Anti-Patterns to Avoid
- **version(1) 제거:** 기존 사용자 데이터 손실 + VersionError. 반드시 version(1)과 version(2) 모두 선언.
- **QuizAttempt에 Question 전체 복사:** questionId 참조만 저장, 필요한 필드(unit/category)는 WrongNote에만 비정규화.
- **타이머에 Date.now() 대신 React state만 사용:** state 업데이트는 배치 처리로 정확도 손실. `useRef`로 시작 시각 기록 후 `Date.now() - startRef.current`로 경과 시간 계산이 더 정확.
- **오답 판정 즉시 WrongNote insert (중복 방지 미처리):** where('[questionId+studentId]').first()로 기존 레코드 확인 후 update/insert 분기 필수.
- **단답형 입력에 input[type=number] 사용:** 분수, 음수, 수식 표현 불가. `input[type=text]` + 정규화 비교 사용.
- **`isCorrect: false`인 경우만 WrongNote 추가, 정답 후 제거 안 함:** 오답노트에서 다시 풀어 정답 맞추면 wrongCount는 유지하되 isMastered 플래그를 올리는 패턴 사용.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| IndexedDB 버전 마이그레이션 | window.indexedDB 직접 조작 | Dexie.version().stores() | 트랜잭션 롤백, 멱등성 보장 |
| 수식 렌더링 | 커스텀 파서 | KaTeX (Phase 2 구축됨) | 이미 완성됨, 재사용 |
| 타이머 로직 | 글로벌 변수 setInterval | useTimer 훅 (위 Pattern 3) | 컴포넌트 언마운트 시 자동 정리 |
| 오답노트 필터 조인 | Question 테이블 full scan | WrongNote 비정규화 필드 | IndexedDB는 SQL JOIN 없음 |
| 정답 비교 알고리즘 | 복잡한 수식 파서 | 문자열 정규화 비교 | POC에서 trim() 수준으로 충분 |

**Key insight:** IndexedDB는 관계형 DB가 아니다. 복합 쿼리는 인메모리 filter()로 처리하거나, 비정규화로 단일 테이블 쿼리를 유지하라.

---

## Common Pitfalls

### Pitfall 1: Dexie version(1) 제거로 기존 사용자 VersionError
**What goes wrong:** version(2)만 선언하면 version(1) DB를 가진 브라우저에서 "The requested version (2) is less than the existing version (1)" 오류 발생
**Why it happens:** IndexedDB는 버전 다운그레이드를 허용하지 않으며, Dexie는 모든 이전 버전 선언이 코드에 있어야 마이그레이션 경로를 계산
**How to avoid:** db.ts에 version(1).stores({...}) + version(2).stores({...}) 두 선언 모두 유지
**Warning signs:** `Dexie.js: Failed to open database: VersionError: The requested version (2) is less than the existing version (2)`

### Pitfall 2: WrongNote 중복 insert
**What goes wrong:** 같은 문제를 여러 번 틀리면 WrongNote 레코드가 중복 생성됨
**Why it happens:** upsert를 직접 구현해야 함 (Dexie의 put()은 id 기반, questionId+studentId 기반 upsert 없음)
**How to avoid:** 항상 where('[questionId+studentId]').equals([qid, sid]).first()로 기존 레코드 확인 후 update/add 분기
**Warning signs:** 오답노트에 같은 문제가 여러 개 표시됨

### Pitfall 3: 타이머 메모리 누수
**What goes wrong:** QuizPlayer 언마운트(뒤로가기, 라우트 이동) 시 setInterval이 계속 실행됨
**Why it happens:** useEffect cleanup 미구현
**How to avoid:** useEffect의 return 함수에서 반드시 clearInterval(intervalRef.current)
**Warning signs:** 브라우저 개발자 도구에서 메모리 사용량 증가, 콘솔 "Can't perform a React state update on an unmounted component"

### Pitfall 4: 복합 인덱스 누락으로 WrongNote where() 실패
**What goes wrong:** `db.wrongNotes.where('[questionId+studentId]').equals(...)` 호출 시 "The multi-entry key path `[questionId+studentId]` is not indexed" 오류
**Why it happens:** version(2).stores() 선언에 `'[questionId+studentId]'` 포함 안 됨
**How to avoid:** stores 선언: `wrongNotes: '++id, questionId, studentId, [questionId+studentId], unit, questionCategory, lastWrongAt'`
**Warning signs:** Dexie.js 콘솔 에러 "The multi-entry key path ... is not indexed"

### Pitfall 5: 단답형 입력 type=number로 인한 빈 값 처리 오류
**What goes wrong:** input[type=number]에서 빈 값('')이 NaN으로 처리되어 비교 실패
**Why it happens:** Phase 2에서 이미 겪은 문제 (z.coerce.number().optional() 패턴)
**How to avoid:** input[type=text] 사용 + 정답 비교 시 trim() 정규화
**Warning signs:** 답이 비어있어도 제출 버튼이 활성화되거나 오류 없이 오답 처리됨

### Pitfall 6: 문제 목록에서 퀴즈 진입 경로 누락
**What goes wrong:** /student/problems는 ComingSoonPage로 등록되어 있어 실제 문제 목록 없음
**Why it happens:** Phase 2에서 main.tsx의 `/student/problems`가 ComingSoonPage로 설정됨
**How to avoid:** Phase 3 첫 작업으로 main.tsx에서 `/student/problems` → StudentProblemsPage로 교체, 퀴즈 라우트 추가
**Warning signs:** 학생이 /student/problems 접속 시 "Coming Soon" 페이지만 표시

---

## Code Examples

### Dexie version(2) 전체 스키마 선언
```typescript
// Source: https://dexie.org/docs/Dexie/Dexie.version()
// lib/db.ts 완성 형태

const db = new Dexie('mathQuestionDB') as Dexie & {
  questions: EntityTable<Question, 'id'>
  quizSessions: EntityTable<QuizSession, 'id'>
  quizAttempts: EntityTable<QuizAttempt, 'id'>
  wrongNotes: EntityTable<WrongNote, 'id'>
}

// version(1): 절대 수정/삭제하지 말 것
db.version(1).stores({
  questions: '++id, subject, unit, questionCategory, difficulty, createdAt, createdBy',
})

// version(2): Phase 3 퀴즈 엔진 테이블 추가
db.version(2).stores({
  questions: '++id, subject, unit, questionCategory, difficulty, createdAt, createdBy',
  quizSessions: '++id, questionId, studentId, startedAt',
  quizAttempts: '++id, questionId, studentId, sessionId, attemptedAt, isCorrect',
  wrongNotes: '++id, questionId, studentId, [questionId+studentId], unit, questionCategory, lastWrongAt',
})
```

### 오답노트 마스터 처리 (ERRN-04)
```typescript
// services/wrongNote.service.ts
export async function markAsMastered(wrongNoteId: number): Promise<void> {
  await db.wrongNotes.update(wrongNoteId, { isMastered: true })
  // 또는 완전 삭제:
  // await db.wrongNotes.delete(wrongNoteId)
}

// 단원별 고유 목록 추출 (필터 드롭다운용)
export async function getWrongNoteUnits(studentId: string): Promise<string[]> {
  const notes = await db.wrongNotes.where('studentId').equals(studentId).toArray()
  return [...new Set(notes.map(n => n.unit))]
}
```

### MultipleChoiceInput 컴포넌트 패턴
```typescript
// components/quiz/MultipleChoiceInput.tsx
const OPTIONS = ['1', '2', '3', '4', '5'] as const

interface MultipleChoiceInputProps {
  selected: string
  onSelect: (answer: string) => void
  disabled?: boolean  // 제출 후 선택 잠금
}

export function MultipleChoiceInput({ selected, onSelect, disabled }: MultipleChoiceInputProps) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {OPTIONS.map((opt) => (
        <button
          key={opt}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(opt)}
          className={cn(
            'h-12 rounded-lg border-2 text-lg font-bold transition-colors',
            selected === opt
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border hover:border-primary/50',
            disabled && 'cursor-not-allowed opacity-70',
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}
```

### 학생 문제 목록 → 퀴즈 진입 라우트
```typescript
// main.tsx 추가 라우트
import StudentProblemsPage from './routes/student/problems/index'
import QuizPage from './routes/student/quiz/index'
import WrongNotesPage from './routes/student/wrong-notes/index'

// Layout 내부:
<Route path="/student/problems" element={<StudentProblemsPage />} />
<Route path="/student/quiz/:id" element={<QuizPage />} />
<Route path="/student/wrong-notes" element={<WrongNotesPage />} />
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| XState 상태 머신 | useReducer (내장) | 2022년 이후 | 외부 의존성 없이 퀴즈 플로우 관리 |
| 서버사이드 채점 | 클라이언트 채점 (POC) | 아키텍처 피벗 결정 | 백엔드 없이 Vercel 배포 가능 |
| localStorage 직접 조작 | Dexie.js version() 마이그레이션 | 이미 Phase 2에서 확정 | 스키마 진화 안전 처리 |
| 개별 컴포넌트 setInterval | useTimer 훅 추출 | 현재 표준 | cleanup 보장, 재사용 가능 |

**Deprecated/outdated:**
- XState/Zustand (POC 레벨에서): 이 규모에서는 useReducer로 충분
- 서버사이드 채점: STATE.md 아키텍처 피벗으로 POC에서는 클라이언트 채점 허용

---

## Open Questions

1. **WrongNote vs 별도 Bookmark 테이블**
   - What we know: QUIZ-06(북마크)과 ERRN-01(오답노트)이 요구사항 상 구분됨
   - What's unclear: WrongNote 테이블에 `isBookmarked` 필드 추가 vs 별도 `bookmarks` 테이블 분리 여부
   - Recommendation: WrongNote에 `isBookmarked: boolean` 필드 추가 (단일 테이블). 두 기능 모두 같은 문제를 저장하며 version(2) 테이블 수를 최소화

2. **학생 문제 목록 구현 방식**
   - What we know: /student/problems는 현재 ComingSoonPage로 연결됨. QuestionList 컴포넌트는 `basePath` prop 지원
   - What's unclear: 강사용 QuestionList를 그대로 재사용 가능한지, 아니면 학생용 뷰(답 숨김)가 필요한지
   - Recommendation: QuestionList 컴포넌트 재사용 (답 미표시는 QuizPlayer에서 처리). 학생 문제 목록은 문제 선택 → 퀴즈 페이지로 이동만 하면 됨

3. **오답노트 재풀이 시 attemptCount 추적**
   - What we know: ERRN-02에서 "N회독" 지원 필요. QuizAttempt에 attemptCount 필드 포함
   - What's unclear: 같은 문제의 이전 시도 횟수를 자동으로 계산해야 하는지
   - Recommendation: submitQuizAttempt 호출 전 `db.quizAttempts.where('questionId').equals(qid).count()` + 1 계산

4. **오답노트 정답 맞춤 후 처리**
   - What we know: 오답노트에서 재풀이하여 정답 맞추면 ERRN-04의 "제거" 기능과 연동 필요
   - What's unclear: 자동으로 isMastered = true 설정 vs 사용자 수동 제거만 지원
   - Recommendation: 재풀이에서 정답 맞추면 isMastered = true 자동 설정 + 수동 제거 버튼 모두 지원

---

## Sources

### Primary (HIGH confidence)
- Dexie.js version() 공식 문서 (https://dexie.org/docs/Dexie/Dexie.version()) — 스키마 버전 업그레이드 패턴
- Dexie.js Version.upgrade() 공식 문서 (https://dexie.org/docs/Version/Version.upgrade()) — 마이그레이션 함수 패턴
- Dexie.js Compound Index 공식 문서 (https://dexie.org/docs/Compound-Index) — [questionId+studentId] 복합 인덱스
- useLiveQuery 공식 문서 (https://dexie.org/docs/dexie-react-hooks/useLiveQuery()) — 반응형 필터 패턴
- usehooks-ts useInterval (https://usehooks-ts.com/react-hook/use-interval) — 타이머 훅 패턴
- Phase 2 02-RESEARCH.md — 기존 스택 결정사항 (KaTeX, Dexie 4.x EntityTable, useLiveQuery)

### Secondary (MEDIUM confidence)
- WebSearch "Dexie.js multiple tables quiz session IndexedDB React 2025" — 다중 테이블 패턴 확인
- WebSearch "React useReducer quiz state machine 2025" — useReducer 퀴즈 상태 관리 표준 확인
- WebSearch "React quiz timer useRef setInterval cleanup pattern TypeScript 2025" — 타이머 구현 패턴 확인
- GeeksForGeeks Quiz Timer App — useEffect + setInterval 패턴 검증

### Tertiary (LOW confidence)
- WebSearch "short answer math grading client side normalize trim" — 문자열 정규화 채점 패턴 (커뮤니티 패턴)
- WebSearch "React quiz bookmark scrap toggle IndexedDB 2025" — 북마크 구현 패턴 (단일 소스)

---

## Metadata

**Confidence breakdown:**
- Standard Stack: HIGH — Phase 2에서 이미 사용 중인 패키지, 추가 설치 불필요. Dexie version() 공식 문서 확인
- Architecture (스키마 설계): HIGH — Dexie 공식 문서 기반 복합 인덱스, 비정규화 패턴
- Pitfalls: HIGH — Dexie VersionError는 공식 문서 확인, 타이머 cleanup은 React 공식 패턴
- 채점 로직: MEDIUM — 클라이언트 문자열 비교는 표준 패턴이나 수식 표현 edge case 미검증

**Research date:** 2026-02-20
**Valid until:** 2026-03-20 (안정적 라이브러리, 30일 유효)

---

## Phase 3 실행 체크리스트 (Plan 작성 전 확인)

1. **db.ts version(2) 우선:** 모든 플랜이 의존하는 스키마 먼저 확장
2. **기존 라우트 교체:** main.tsx의 `/student/problems` (ComingSoonPage → StudentProblemsPage)
3. **QuestionList basePath 재사용:** 학생 문제 목록은 `basePath="/student/quiz"` 전달로 재사용
4. **WrongNote 복합 인덱스:** `[questionId+studentId]` 인덱스 누락 시 upsert 불가
5. **타이머 cleanup:** QuizPlayer 언마운트 시 반드시 interval 정리
