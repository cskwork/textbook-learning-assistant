# Phase 4: DIY 문제집 생성기 — 리서치

**Researched:** 2026-02-20
**Domain:** Dexie.js version(3) 스키마 확장 + 필터 기반 문제 선택 UI + 문제집 저장 및 풀이 흐름
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| WKST-01 | 학생이 단원·유형·난이도를 조합하여 나만의 문제집을 생성할 수 있다 | 다중 필터 조건 UI (subject/unit/questionCategory/difficulty) + Dexie 인메모리 필터 패턴 (Phase 3 WrongNoteList 방식 재사용) |
| WKST-02 | 문제집 생성 시 문제 수를 지정할 수 있다 | questionIds 배열 저장 + 무작위 샘플링 또는 사용자 수동 선택, Dexie `db.questions.where(...).toArray()` 후 slice |
| WKST-03 | 생성된 문제집을 저장하고 나중에 다시 풀 수 있다 | Dexie version(3) Workbook 테이블 추가 — title, filters 메타데이터 + questionIds 배열 저장 |
| WKST-04 | 문제집 풀이 결과가 학습 이력에 반영된다 | 기존 `submitQuizAttempt()` 재사용 — workbookId를 QuizSession에 연결하거나 QuizAttempt에 context 필드 추가 |
</phase_requirements>

---

## Summary

Phase 4의 핵심 도전은 두 가지다: (1) 학생이 원하는 조건(과목·단원·유형·난이도·문제 수)을 지정하면 조건에 맞는 문제들이 자동으로 선택되어 저장 가능한 문제집으로 묶이는 생성 플로우, (2) 저장된 문제집을 나중에 불러와 퀴즈 세션처럼 순차적으로 풀 수 있는 플레이어.

**아키텍처 전제:** Phase 3과 동일한 POC 아키텍처 — 완전 클라이언트 사이드, IndexedDB(Dexie), 서버 없음. 기존 `submitQuizAttempt()` 서비스를 그대로 재사용하여 문제집 풀이 결과를 학습 이력(`quizAttempts`, `wrongNotes`)에 저장한다. Dexie를 `version(3)`으로 올려 `workbooks` 테이블을 추가한다.

**생성 플로우 설계:** 단일 페이지 필터 폼(useState로 간단 관리) → 조건에 맞는 문제 목록 미리보기 → 문제집 이름 입력 → 저장. 별도 "멀티스텝 마법사(Wizard)" 라이브러리는 불필요하다. `useReducer` 또는 `useState` 여러 개로 충분하다. 조건 → 미리보기 → 저장 3단계를 단일 컴포넌트 내 `phase` 상태로 전환한다.

**Primary recommendation:** Dexie `version(3)` Workbook 테이블 추가 + 필터 기반 인메모리 쿼리 + 기존 QuizPlayer/submitQuizAttempt 재사용으로 구현하라. 새로운 외부 라이브러리 설치는 불필요하다.

---

## Standard Stack

### Core (모두 이미 설치됨 — 추가 설치 없음)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| dexie | ^4.3.0 | Workbook 테이블 저장, 문제 필터 쿼리 | 이미 사용 중 — version(3) 스키마 확장만 필요 |
| dexie-react-hooks | ^4.2.0 | useLiveQuery로 문제집 목록 반응형 구독 | 이미 사용 중 |
| react-hook-form | ^7.71.1 | 문제집 이름 입력 폼 | 이미 사용 중, shadcn 표준 |
| zod | ^3.25.76 | 문제집 이름 유효성 검사 | 이미 사용 중 |

### Supporting (이미 설치됨)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react | ^0.511.0 | BookMarked, Plus, Play 아이콘 | 문제집 목록 / 생성 버튼 |
| shadcn Select, Badge, Card | 설치됨 | 필터 드롭다운, 난이도 배지, 문제집 카드 | 전체 UI |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| useState 다중 필터 상태 | react-hook-form Controller | 폼 제출이 아닌 필터 조건은 일반 useState가 더 단순, react-hook-form은 저장 폼(이름 입력)에만 사용 |
| 인메모리 Array.filter() | Dexie compound index 쿼리 | POC 규모(수백 문제)에서 인메모리 필터로 충분. 복합 필터는 IndexedDB compound index 설계가 복잡하므로 Phase 3 패턴 그대로 재사용 |
| 순차 페이지 라우팅 (/workbook/create/step1, /step2) | 단일 페이지 phase 상태 | 단일 페이지가 뒤로가기 처리 단순, URL 상태 관리 불필요 |
| 별도 WorkbookQuizPlayer | 기존 QuizPlayer 재사용 | QuizPlayer는 `question` prop 기반 — 순서 인덱스 관리를 외부 페이지에서 처리하면 그대로 재사용 가능 |

**추가 패키지 설치 불필요:** Phase 3 패키지로 Phase 4 전체 구현 가능.

---

## Architecture Patterns

### Recommended Project Structure

```
apps/web/src/
├── lib/
│   └── db.ts                              # version(3) — workbooks 테이블 추가
├── services/
│   ├── workbook.service.ts                # Workbook CRUD + 문제 필터 쿼리
│   └── quiz.service.ts                    # 기존 유지 (재사용)
├── components/
│   └── workbook/
│       ├── WorkbookCreator.tsx            # 필터 조건 설정 + 미리보기 + 저장 (3단계 phase 상태 머신)
│       ├── WorkbookCard.tsx               # 저장된 문제집 카드 (제목, 문제 수, 생성일, 풀기 버튼)
│       └── WorkbookList.tsx               # useLiveQuery 반응형 문제집 목록
└── routes/
    └── student/
        ├── workbooks/
        │   ├── index.tsx                  # /student/workbooks — 문제집 목록
        │   └── create.tsx                 # /student/workbooks/create — 새 문제집 생성
        └── workbooks/
            └── [id]/
                └── play/
                    └── index.tsx          # /student/workbooks/:id/play — 문제집 풀기
```

### Pattern 1: Dexie version(3) 스키마 확장

**What:** 기존 version(1), version(2) 선언은 유지하고, version(3)에서 workbooks 테이블만 추가 선언

**Key finding:** Dexie 3.x에서는 version(3).stores()에 변경이 필요한 테이블만 선언하면 된다. 이전 버전에 있는 기존 테이블(questions, quizSessions, quizAttempts, wrongNotes)은 자동으로 유지된다. 단, 기존 코드에서는 version(2)에 모든 테이블을 명시적으로 재선언했으므로 일관성을 위해 동일 패턴을 따른다.

**When to use:** Phase 4 진입 시 db.ts 첫 번째 작업

```typescript
// Source: https://dexie.org/docs/Version/Version.stores()
// lib/db.ts 수정 — version(1), version(2) 유지 + version(3) 추가

export interface Workbook {
  id: number
  studentId: string           // user email
  title: string               // 사용자 지정 문제집 이름 (예: "미적분 극값 집중 연습")
  // 생성 시 사용된 필터 조건 저장 (참고용 메타데이터)
  filters: {
    subject?: string          // 과목 필터
    unit?: string             // 단원 필터
    questionCategory?: string // 유형 필터
    difficulty?: number       // 난이도 필터 (1~5)
    count: number             // 요청한 문제 수
  }
  questionIds: number[]       // 선택된 문제 ID 배열 (순서 포함)
  createdAt: number           // Date.now()
  // 풀이 진행 상태 (WKST-03 — 나중에 다시 풀기)
  lastPlayedAt?: number
  completedAt?: number
}

// version(3): workbooks 테이블 추가
// 기존 테이블은 version(2)에 그대로 선언되어 있으므로 version(3)에는 새 테이블만 추가
db.version(3).stores({
  questions: '++id, subject, unit, questionCategory, difficulty, createdAt, createdBy',
  quizSessions: '++id, questionId, studentId, startedAt',
  quizAttempts: '++id, questionId, studentId, sessionId, attemptedAt, isCorrect',
  wrongNotes: '++id, questionId, studentId, [questionId+studentId], unit, questionCategory, lastWrongAt',
  workbooks: '++id, studentId, createdAt',
})

// 타입 타입을 db 선언에 추가
const db = new Dexie('mathQuestionDB') as Dexie & {
  questions: EntityTable<Question, 'id'>
  quizSessions: EntityTable<QuizSession, 'id'>
  quizAttempts: EntityTable<QuizAttempt, 'id'>
  wrongNotes: EntityTable<WrongNote, 'id'>
  workbooks: EntityTable<Workbook, 'id'>
}
```

**CRITICAL:** version(1)과 version(2) 선언을 절대 제거하지 말 것. 기존 브라우저 IndexedDB가 version 2로 저장되어 있으므로, 낮은 버전이 없으면 VersionError 발생.

### Pattern 2: 필터 기반 문제 선택 서비스

**What:** 사용자가 지정한 조건으로 문제를 필터링하고 지정 수만큼 랜덤 샘플링

```typescript
// services/workbook.service.ts

export interface WorkbookFilters {
  subject?: string
  unit?: string
  questionCategory?: string
  difficulty?: number
  count: number
}

/** 필터 조건에 맞는 문제 미리보기 (저장 전) */
export async function getFilteredQuestions(filters: WorkbookFilters): Promise<Question[]> {
  let questions = await db.questions.toArray()

  // 인메모리 필터 — POC 규모에서 충분 (Phase 3 WrongNoteList 동일 패턴)
  if (filters.subject) {
    questions = questions.filter(q => q.subject === filters.subject)
  }
  if (filters.unit) {
    questions = questions.filter(q => q.unit === filters.unit)
  }
  if (filters.questionCategory) {
    questions = questions.filter(q => q.questionCategory === filters.questionCategory)
  }
  if (filters.difficulty) {
    questions = questions.filter(q => q.difficulty === filters.difficulty)
  }

  // 랜덤 셔플 후 count만큼 반환
  const shuffled = [...questions].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, filters.count)
}

/** 문제집 저장 */
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

/** 학생의 문제집 목록 조회 */
export async function listWorkbooks(studentId: string): Promise<Workbook[]> {
  return db.workbooks
    .where('studentId')
    .equals(studentId)
    .reverse()
    .sortBy('createdAt')
}

/** 단일 문제집 조회 */
export async function getWorkbook(workbookId: number): Promise<Workbook | undefined> {
  return db.workbooks.get(workbookId)
}

/** 문제집 삭제 */
export async function deleteWorkbook(workbookId: number): Promise<void> {
  return db.workbooks.delete(workbookId)
}

/** 필터 옵션 목록 추출 (드롭다운용) — questions 테이블에서 직접 추출 */
export async function getFilterOptions(): Promise<{
  units: string[]
  categories: string[]
}> {
  const questions = await db.questions.toArray()
  return {
    units: [...new Set(questions.map(q => q.unit))].sort(),
    categories: [...new Set(questions.map(q => q.questionCategory))].sort(),
  }
}
```

### Pattern 3: WorkbookCreator 3단계 phase 상태 머신

**What:** 단일 컴포넌트 내 3단계 UI 전환 — 필터 설정(setup) → 미리보기(preview) → 완료(saved)

**Why no wizard library:** 3단계이며 뒤로가기만 지원하면 됨. useState로 충분, 외부 라이브러리 불필요.

```typescript
// components/workbook/WorkbookCreator.tsx

type CreatorPhase = 'setup' | 'preview' | 'saving'

interface CreatorState {
  phase: CreatorPhase
  subject: string
  unit: string
  questionCategory: string
  difficulty: string  // '' | '1'~'5'
  count: number       // 5~30
  previewQuestions: Question[]
  title: string
}

// setup 단계: 필터 조건 설정 폼
//   - Subject Select (전체/수학I/수학II/미적분/확률과통계/기하)
//   - Unit Select (questions 테이블에서 동적 추출)
//   - Category Select (questions 테이블에서 동적 추출)
//   - Difficulty Select (전체/1~5)
//   - Count Slider/Select (5, 10, 15, 20, 30)
//   - "문제 미리보기" 버튼 → getFilteredQuestions() 호출 → preview 단계

// preview 단계: 선택된 문제 목록 표시
//   - "N개 문제가 선택되었습니다" (조건을 만족하는 문제 수)
//   - 문제 제목(content 앞부분) 목록 (QuestionCard 경량 버전)
//   - 문제집 이름 입력 input (react-hook-form, zod 검증)
//   - "저장하기" 버튼 → createWorkbook() → saving 상태
//   - "← 조건 변경" 버튼 → setup 단계로 복귀

// saving 단계: 저장 성공 후 /student/workbooks로 navigate

// 미리보기 문제 부족 시 처리:
//   - 조건에 맞는 문제가 count보다 적으면: "N개 문제만 찾았습니다. 계속하시겠어요?" 안내
//   - 조건에 맞는 문제가 0개면: "조건에 맞는 문제가 없습니다" 안내 + 조건 변경 유도
```

### Pattern 4: WorkbookPlayer — 순차 문제 풀기

**What:** 저장된 questionIds 배열을 순서대로 풀어가는 플레이어. 기존 QuizPlayer를 재사용.

```typescript
// routes/student/workbooks/[id]/play/index.tsx

export default function WorkbookPlayPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [workbook, setWorkbook] = useState<Workbook | null | undefined>(undefined)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [results, setResults] = useState<Array<{ isCorrect: boolean }>>([])

  // workbook 및 문제 로드
  useEffect(() => {
    const workbookId = Number(id)
    getWorkbook(workbookId).then(async (wb) => {
      if (!wb) { setWorkbook(null); return }
      setWorkbook(wb)
      // questionIds 순서로 문제 로드
      const qs = await Promise.all(
        wb.questionIds.map(qid => db.questions.get(qid))
      )
      setQuestions(qs.filter(Boolean) as Question[])
    })
  }, [id])

  // QuizPlayer의 onComplete 콜백 → 다음 문제로 이동
  function handleQuestionComplete(isCorrect: boolean) {
    setResults(prev => [...prev, { isCorrect }])
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else {
      // 모든 문제 완료 → 결과 요약 표시
      navigate(`/student/workbooks/${id}/result`, {
        state: { results, total: questions.length }
      })
    }
  }

  // 진행 표시: "3 / 10" + 프로그레스 바
  // currentIndex 기반 QuizPlayer 렌더링
  // QuizPlayer에 question={questions[currentIndex]} 전달
}
```

**Key insight:** QuizPlayer는 `question`, `studentId`, `onBack` prop만 받는다. `onComplete` 콜백이 없으므로, QuizPlayer 컴포넌트에 `onComplete?: (isCorrect: boolean) => void` prop을 추가하거나, 현재 QuizPlayer에 이미 있는 "다시 풀기" 버튼을 "다음 문제" 버튼으로 교체하는 방식으로 확장한다. 가장 단순한 방법은 **WorkbookPlayer에서 QuizResult의 "다음 문제" 버튼을 감지하는 방식** — QuizPlayer에 `onNext?: () => void` prop 추가.

### Pattern 5: 문제 수 부족 시 처리 (중요 엣지 케이스)

```typescript
// getFilteredQuestions 결과에서 처리
const previewQuestions = await getFilteredQuestions(filters)

if (previewQuestions.length === 0) {
  // 조건에 맞는 문제 없음 → 오류 메시지 표시, setup 단계 유지
  setError('선택한 조건에 맞는 문제가 없습니다. 조건을 변경해보세요.')
  return
}

if (previewQuestions.length < filters.count) {
  // 문제 수 부족 → 경고 메시지 + 계속 진행 옵션
  // "요청한 N개 중 M개만 찾았습니다. M개로 문제집을 만드시겠어요?"
  // → 사용자가 확인하면 previewQuestions 전체로 진행
}
```

### Pattern 6: 학습 이력 연동 (WKST-04)

**What:** 기존 `submitQuizAttempt()` 그대로 재사용 — workbook 문제 풀이도 `quizAttempts` 테이블에 저장

**Options:**
- **Option A (권장):** `submitQuizAttempt()`를 변경 없이 재사용. 모든 풀이가 동일한 quizAttempts 테이블에 기록되므로 Phase 5 AI 분석이 자동으로 workbook 풀이 데이터를 포함.
- **Option B:** QuizAttempt에 `workbookId?: number` 필드를 추가하여 출처 추적. 이 경우 db.ts에 `quizAttempts` 스키마에 `workbookId` 인덱스 추가 필요.

**권장:** Option A로 시작. workbookId 추적이 필요하면 Workbook 테이블에 `completedAttemptIds: number[]`를 별도 저장하는 방식으로 역방향 추적 가능.

### Anti-Patterns to Avoid

- **version(1), version(2) 제거:** 기존 사용자 VersionError. 반드시 세 버전 모두 선언 유지.
- **QuizPlayer 대신 WorkbookPlayer 전체 재작성:** QuizPlayer 재사용이 핵심. `onNext` prop 하나 추가로 충분.
- **questionIds 대신 Question 객체 전체를 workbooks에 저장:** questionIds 배열만 저장, 실제 문제 데이터는 questions 테이블에서 조회. 데이터 중복 + 스키마 변경 시 불일치 발생.
- **복잡한 멀티스텝 라이브러리 도입:** 3단계 phase 상태를 useReducer/useState로 관리. react-step-wizard 등 외부 의존성 불필요.
- **필터를 Dexie compound index로만 처리:** unit + questionCategory + difficulty 조합 인덱스는 Dexie에서 설계가 복잡하고 POC 규모에서 불필요. 인메모리 filter() 사용.
- **WorkbookPlayer에서 퀴즈 결과를 localStorage에만 저장:** 반드시 `submitQuizAttempt()`로 IndexedDB에 저장 (WKST-04 요구사항).
- **nav에 '문제집' 탭 추가 없이 구현:** 학생 하단탭바에 '문제집' 탭을 추가해야 사용자가 접근 가능. `_layout.tsx`의 `studentNavItems` 수정 필요.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| 문제 필터링 | 커스텀 SQL-like 쿼리 엔진 | Dexie `toArray()` + 인메모리 `Array.filter()` | POC 규모(수백 문제)에서 충분, Phase 3에서 검증된 패턴 |
| 순차 문제 풀기 플레이어 | 새 WorkbookPlayer 컴포넌트 | 기존 QuizPlayer에 `onNext` prop 추가 | 채점/WrongNote/타이머 로직 이미 검증됨 |
| 학습 이력 저장 | 별도 workbook 풀이 기록 테이블 | 기존 `submitQuizAttempt()` + quizAttempts 테이블 | QUIZ-07과 동일 테이블에 저장 → Phase 5 AI 분석 자동 포함 |
| 랜덤 문제 선택 | 복잡한 정렬 알고리즘 | `Array.sort(() => Math.random() - 0.5).slice(0, count)` | Fisher-Yates 완전하진 않지만 POC에서 충분 |
| 필터 드롭다운 옵션 | 하드코딩된 단원/유형 목록 | `questions` 테이블에서 동적 추출 (`getFilterOptions()`) | Phase 2에서 unit/questionCategory는 자유 텍스트로 결정됨 |

**Key insight:** Phase 4는 Phase 3의 부품들을 조합하는 단계다. 새로 만들어야 하는 것은 Workbook 스키마, 필터 서비스, 생성 UI, 목록 페이지뿐이다.

---

## Common Pitfalls

### Pitfall 1: version(3)에서 이전 버전 선언 제거

**What goes wrong:** `version(3).stores()` 만 선언하면 version 1 또는 2 IndexedDB를 가진 브라우저에서 VersionError 또는 데이터 손실
**Why it happens:** Phase 3 코드에서는 version(2)에 모든 테이블을 재선언함. version(3)에도 동일하게 전체 테이블을 재선언하거나, 기존 버전 선언을 유지해야 함
**How to avoid:** version(1), version(2), version(3) 세 선언 모두 db.ts에 유지. version(3).stores()에 모든 기존 테이블 + workbooks 포함
**Warning signs:** 브라우저 콘솔 `Dexie.js: Failed to open database: VersionError`

### Pitfall 2: questionIds 배열에 삭제된 문제 ID 포함

**What goes wrong:** 강사가 문제를 삭제한 후, 해당 questionId를 포함한 문제집 풀기 시 `db.questions.get(qid)` 가 undefined 반환
**Why it happens:** questionIds 배열이 questions 테이블과 외래키 관계 없이 단순 number[] 저장
**How to avoid:** WorkbookPlayer에서 `Promise.all(wb.questionIds.map(qid => db.questions.get(qid)))` 후 `filter(Boolean)`으로 null/undefined 제거. 문제가 없으면 "일부 문제가 삭제되었습니다" 안내.
**Warning signs:** WorkbookPlayer에서 빈 화면 또는 QuizPlayer에 undefined question 전달

### Pitfall 3: QuizPlayer에 onNext prop 없이 문제집 순서 제어 불가

**What goes wrong:** QuizPlayer 내부에서 "다시 풀기" 버튼만 있고 "다음 문제" 버튼 없음 → 문제집 플레이어에서 다음 문제로 이동 불가
**Why it happens:** 현재 QuizPlayer는 단일 문제 독립 풀이용으로 설계됨
**How to avoid:** QuizPlayer에 `onNext?: () => void` prop 추가 → `phase === 'submitted'`일 때 "다음 문제" 버튼 표시. `onNext`가 없으면 현재와 동일하게 "다시 풀기" 버튼 표시
**Warning signs:** 문제집 풀기 중 다음 문제로 이동 불가, 또는 QuizResult 컴포넌트에서 네비게이션 없음

### Pitfall 4: 필터 옵션 목록이 비어있음 (문제 없는 초기 상태)

**What goes wrong:** questions 테이블이 비어있을 때 단원/유형 드롭다운이 아무 옵션도 없음
**Why it happens:** `getFilterOptions()`가 빈 배열 반환
**How to avoid:** 조건을 지정하지 않고 필터를 빈 상태로 설정하면 "전체 문제" 중에서 선택 가능. 드롭다운에는 "전체(기본값)" 옵션을 반드시 포함.
**Warning signs:** 사용자가 드롭다운을 열었을 때 "전체" 옵션만 있고 선택 불가 상태

### Pitfall 5: 학생 네비게이션에 문제집 탭 미추가

**What goes wrong:** /student/workbooks 라우트는 등록했지만 탭바에 링크 없어 사용자가 접근 불가
**Why it happens:** `_layout.tsx`의 `studentNavItems` 배열 수정 누락
**How to avoid:** Phase 4 첫 작업으로 `studentNavItems`에 `{ path: '/student/workbooks', label: '문제집', icon: BookMarked }` 추가 + `main.tsx`에 라우트 등록
**Warning signs:** /student/workbooks 직접 URL 입력은 동작하지만 탭바에서 접근 불가

### Pitfall 6: count 입력값이 0 또는 음수

**What goes wrong:** 사용자가 문제 수를 0으로 입력하면 빈 문제집 생성됨
**Why it happens:** 입력 유효성 검사 누락
**How to avoid:** zod 스키마에 `count: z.number().int().min(1).max(50)` 적용. UI에서는 Select로 고정값(5, 10, 15, 20, 30) 제공 — 자유 입력보다 안전.
**Warning signs:** 문제집에 questionIds가 빈 배열로 저장됨

---

## Code Examples

### Dexie version(3) 전체 스키마 선언

```typescript
// Source: https://dexie.org/docs/Dexie/Dexie.version()
// lib/db.ts 완성 형태 — version(3) 추가

const db = new Dexie('mathQuestionDB') as Dexie & {
  questions: EntityTable<Question, 'id'>
  quizSessions: EntityTable<QuizSession, 'id'>
  quizAttempts: EntityTable<QuizAttempt, 'id'>
  wrongNotes: EntityTable<WrongNote, 'id'>
  workbooks: EntityTable<Workbook, 'id'>
}

// version(1): 절대 수정/삭제하지 말 것
db.version(1).stores({
  questions: '++id, subject, unit, questionCategory, difficulty, createdAt, createdBy',
})

// version(2): 퀴즈 엔진 테이블 3개 추가
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
```

### 문제집 생성 UI 상태 관리 (WorkbookCreator)

```typescript
// components/workbook/WorkbookCreator.tsx
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { getFilteredQuestions, createWorkbook, getFilterOptions } from '@/services/workbook.service'
import type { Question } from '@/lib/db'

type CreatorPhase = 'setup' | 'preview'

const titleSchema = z.object({
  title: z.string().min(1, '문제집 이름을 입력하세요').max(50, '50자 이내로 입력하세요'),
})

export function WorkbookCreator({ studentId, onCreated }: { studentId: string; onCreated: () => void }) {
  const [phase, setPhase] = useState<CreatorPhase>('setup')
  const [subject, setSubject] = useState<string>('')
  const [unit, setUnit] = useState<string>('')
  const [questionCategory, setQuestionCategory] = useState<string>('')
  const [difficulty, setDifficulty] = useState<string>('')
  const [count, setCount] = useState<number>(10)
  const [previewQuestions, setPreviewQuestions] = useState<Question[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [filterWarning, setFilterWarning] = useState<string>('')

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(titleSchema),
  })

  async function handlePreview() {
    setIsLoading(true)
    setFilterWarning('')
    const filters = {
      subject: subject || undefined,
      unit: unit || undefined,
      questionCategory: questionCategory || undefined,
      difficulty: difficulty ? Number(difficulty) : undefined,
      count,
    }
    const questions = await getFilteredQuestions(filters)
    setPreviewQuestions(questions)

    if (questions.length === 0) {
      setFilterWarning('조건에 맞는 문제가 없습니다. 조건을 변경해보세요.')
      setIsLoading(false)
      return
    }
    if (questions.length < count) {
      setFilterWarning(`요청한 ${count}개 중 ${questions.length}개만 찾았습니다.`)
    }

    setIsLoading(false)
    setPhase('preview')
  }

  async function handleSave(data: { title: string }) {
    setIsLoading(true)
    await createWorkbook({
      studentId,
      title: data.title,
      filters: { subject: subject || undefined, unit: unit || undefined, questionCategory: questionCategory || undefined, difficulty: difficulty ? Number(difficulty) : undefined, count },
      questionIds: previewQuestions.map(q => q.id),
    })
    setIsLoading(false)
    onCreated()
  }

  // phase === 'setup' → 필터 조건 폼
  // phase === 'preview' → 선택된 문제 목록 + 이름 입력 폼
}
```

### WorkbookList (useLiveQuery)

```typescript
// components/workbook/WorkbookList.tsx
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { WorkbookCard } from './WorkbookCard'

export function WorkbookList({ studentId }: { studentId: string }) {
  const workbooks = useLiveQuery(
    () => db.workbooks
      .where('studentId')
      .equals(studentId)
      .reverse()
      .sortBy('createdAt'),
    [studentId],
  )

  if (workbooks === undefined) {
    // 로딩 스켈레톤
  }

  if (workbooks?.length === 0) {
    return <p>아직 만든 문제집이 없습니다. 새 문제집을 만들어보세요!</p>
  }

  return (
    <div className="space-y-3">
      {workbooks?.map((wb) => (
        <WorkbookCard key={wb.id} workbook={wb} />
      ))}
    </div>
  )
}
```

### QuizPlayer onNext prop 확장

```typescript
// components/quiz/QuizPlayer.tsx — onNext prop 추가
interface QuizPlayerProps {
  question: Question
  studentId: string
  onBack: () => void
  onNext?: () => void  // 문제집 순차 풀기 시 다음 문제로 이동 (없으면 단일 문제 모드)
}

// QuizResult 렌더링 시:
// phase === 'submitted' && onNext:
//   → "다음 문제" 버튼 (onNext 호출)
// phase === 'submitted' && !onNext:
//   → "다시 풀기" 버튼 (기존 동작 유지)
```

### 네비게이션 탭 추가 (\_layout.tsx)

```typescript
// routes/_layout.tsx
import { Home, BookOpen, BookOpenCheck, BookMarked, User } from 'lucide-react'

const studentNavItems: NavItem[] = [
  { path: '/student', label: '홈', icon: Home },
  { path: '/student/problems', label: '문제풀기', icon: BookOpenCheck },
  { path: '/student/wrong-notes', label: '오답노트', icon: BookOpen },
  { path: '/student/workbooks', label: '문제집', icon: BookMarked },  // Phase 4 추가
  { path: '/student/profile', label: '마이페이지', icon: User },
]
```

**주의:** 탭바는 4개 기준으로 디자인되어 있음. 5개 탭으로 늘어나면 하단 탭바의 아이콘 크기와 레이블 표시를 확인해야 함. 5개가 너무 많다면 '마이페이지' 탭을 제거하거나 BottomNav 컴포넌트에서 max 탭 수 처리 확인 필요.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| 서버사이드 문제집 저장 (DB) | IndexedDB Workbook 테이블 (클라이언트) | 아키텍처 피벗 결정 | 백엔드 없이 Vercel 배포 가능, 영속성은 브라우저에 종속 |
| 별도 멀티스텝 마법사 라이브러리 | useState phase 상태 (내장) | 현재 표준 | 외부 의존성 없이 동일 기능 |
| Fisher-Yates 완전 랜덤 셔플 | Array.sort(() => Math.random() - 0.5) | POC 표준 | 완전 균등 분포 아니지만 POC에서 충분 |

**Deprecated/outdated:**
- react-step-wizard, rhf-wizard: POC 3단계에서 useState로 충분, 외부 패키지 불필요

---

## Phase 4 기존 코드 재사용 체크리스트

Phase 4는 Phase 3 부품을 조합하는 단계다. 새로 작성해야 하는 파일은 최소화한다.

| 재사용 컴포넌트/서비스 | 수정 필요? | 수정 내용 |
|---------------------|-----------|----------|
| `lib/db.ts` | 필수 수정 | version(3) + Workbook 인터페이스 + EntityTable 추가 |
| `components/quiz/QuizPlayer.tsx` | 소폭 수정 | `onNext?: () => void` prop 추가, QuizResult에 "다음 문제" 버튼 추가 |
| `routes/_layout.tsx` | 소폭 수정 | studentNavItems에 '문제집' 탭 추가 |
| `main.tsx` | 소폭 수정 | /student/workbooks, /student/workbooks/:id/play 라우트 등록 |
| `services/quiz.service.ts` | 변경 없음 | submitQuizAttempt() 그대로 재사용 |
| `services/wrongNote.service.ts` | 변경 없음 | 그대로 재사용 |
| `hooks/useTimer.ts` | 변경 없음 | QuizPlayer 내부에서 그대로 사용 |
| `components/questions/QuestionCard.tsx` | 변경 없음 | WorkbookCreator 미리보기 목록에 재사용 가능 |

**신규 작성 파일:**
- `services/workbook.service.ts`
- `components/workbook/WorkbookCreator.tsx`
- `components/workbook/WorkbookCard.tsx`
- `components/workbook/WorkbookList.tsx`
- `routes/student/workbooks/index.tsx`
- `routes/student/workbooks/create.tsx`
- `routes/student/workbooks/[id]/play/index.tsx` (또는 `routes/student/workbook-play/index.tsx`)

---

## Open Questions

1. **5개 탭바 레이아웃 처리**
   - What we know: 현재 학생 탭바는 4개 항목(홈, 문제풀기, 오답노트, 마이페이지). Phase 4에서 '문제집' 추가 시 5개
   - What's unclear: BottomNav 컴포넌트가 5개를 지원하는지, 아이콘+레이블이 깨지는지
   - Recommendation: BottomNav 구현을 먼저 확인. 5개가 너무 밀리면 '마이페이지'를 탭에서 제거하고 홈 또는 문제풀기 페이지에 프로필 링크 이동 고려. 또는 '마이페이지' 탭은 그대로 두고 '문제집' 탭을 추가하되 아이콘만 표시(레이블 없음)로 처리.

2. **문제집 풀이 결과 요약 페이지**
   - What we know: WKST-04는 학습 이력 반영을 요구. submitQuizAttempt()로 각 문제 풀이 결과 저장은 자명
   - What's unclear: 문제집 전체 풀기 완료 후 "X/N 맞음, 정답률 Y%" 요약 화면이 필요한지
   - Recommendation: 간단한 인라인 결과 요약 카드를 WorkbookPlayer 페이지 자체에서 표시 (별도 결과 라우트 불필요). 마지막 문제 이후 `phase === 'completed'` 상태로 전환하여 동일 페이지에서 표시.

3. **문제집 삭제 UI**
   - What we know: WKST-03은 저장/재접근만 요구. 삭제는 명시적 요구사항 없음
   - What's unclear: 삭제 기능이 없으면 문제집이 무한정 쌓임
   - Recommendation: WorkbookCard에 삭제 버튼 추가 (확인 다이얼로그 포함). 구현 공수 최소, UX 필수.

4. **QuizPlayer에서 이미 풀었던 workbook 재풀이 시 attemptCount 처리**
   - What we know: `getAttemptCount()` 함수가 quiz.service.ts에 있음
   - What's unclear: 문제집 재풀이 시 attemptCount를 올바르게 증가시켜야 하는지
   - Recommendation: WorkbookPlayer에서 각 문제 풀이 시 `getAttemptCount()` 호출 후 `submitQuizAttempt({ ..., attemptCount: prevCount + 1 })`로 전달. 기존 단일 문제 풀기와 동일한 패턴.

---

## Sources

### Primary (HIGH confidence)
- Dexie.js version() 공식 문서 (https://dexie.org/docs/Dexie/Dexie.version()) — 스키마 버전 업그레이드 패턴
- Dexie.js Version.stores() 공식 문서 (https://dexie.org/docs/Version/Version.stores()) — 새 버전에서 이전 테이블 상속 패턴 확인
- Phase 3 03-RESEARCH.md — Dexie version(2) 패턴, submitQuizAttempt, useLiveQuery 검증 패턴
- 기존 codebase 실제 파일 (db.ts, quiz.service.ts, wrongNote.service.ts, QuizPlayer.tsx) — 재사용 가능한 부품 확인

### Secondary (MEDIUM confidence)
- WebSearch "Dexie.js version 3 schema upgrade add new table keep existing tables 2025" — version(3)에서 이전 테이블 자동 상속 패턴 확인
- ClarityDev "Build a Multistep Form With React Hook Form" — 멀티스텝 폼 상태 관리 패턴 (React Context vs useState)
- WebSearch "React multi-step form wizard filter criteria UX pattern 2025" — 3단계 phase 상태 패턴 확인

### Tertiary (LOW confidence)
- WebSearch "quiz app workbook named collection save IndexedDB filtering criteria metadata typescript" — WorkbookPlayer 설계 패턴 (단일 소스, 직접 적용 검증 미완)

---

## Metadata

**Confidence breakdown:**
- Standard Stack: HIGH — Phase 3 동일 패키지, 추가 설치 불필요. 기존 코드베이스 확인.
- Architecture (Workbook 스키마): HIGH — Dexie version() 공식 문서 패턴 + Phase 3 기존 패턴 연장
- Architecture (WorkbookPlayer): MEDIUM — QuizPlayer 재사용 전략은 합리적이나 `onNext` prop 추가 후 QuizResult 컴포넌트 동작 검증 필요
- Pitfalls: HIGH — version 선언 패턴, questionIds null 처리는 Phase 3 경험 기반

**Research date:** 2026-02-20
**Valid until:** 2026-03-20 (안정적 라이브러리, 30일 유효)

---

## Phase 4 실행 체크리스트 (Plan 작성 전 확인)

1. **db.ts version(3) 우선:** version(1), version(2) 유지 + version(3) Workbook 테이블 추가
2. **QuizPlayer onNext prop 추가:** WorkbookPlayer가 순차 제어를 위해 필요
3. **nav 탭 추가:** `_layout.tsx` studentNavItems + main.tsx 라우트 등록
4. **필터 옵션 동적 추출:** questions 테이블에서 unit/questionCategory 추출 (`getFilterOptions()`)
5. **0개 문제 엣지 케이스 처리:** 조건에 맞는 문제 없음 + 요청 수보다 적은 경우 모두 처리
6. **학습 이력 연동:** submitQuizAttempt() 변경 없이 재사용 (WKST-04)
