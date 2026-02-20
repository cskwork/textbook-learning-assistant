---
phase: 03-quiz-engine
plan: 03
subsystem: ui
tags: [react, typescript, react-router, shadcn-ui, quiz, student, bookmark]

# Dependency graph
requires:
  - phase: 03-quiz-engine/03-01
    provides: "wrongNote.service.ts (getWrongNote, toggleBookmark), quiz.service.ts, db.ts v2 스키마"
  - phase: 03-quiz-engine/03-02
    provides: "QuizPlayer 컴포넌트 (question/studentId/onBack props)"
  - phase: 02-question-bank
    provides: "QuestionList 컴포넌트 (filterSubject/basePath props), QuestionCard"
provides:
  - "StudentProblemsPage — QuestionList basePath=/student/quiz 재사용, 과목 필터 셀렉트"
  - "QuizPage — useParams(:id), db.questions.get()로 문제 로드, QuizPlayer 렌더링, 북마크 버튼"
  - "main.tsx: /student/problems → StudentProblemsPage, /student/quiz/:id → QuizPage 라우트 등록"
affects: [03-quiz-engine/03-04, 03-quiz-engine/03-05]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "useEffect 분리 패턴 — 문제 로드와 북마크 상태 로드를 별도 useEffect로 분리"
    - "useParams + db.questions.get() 패턴 — :id 파라미터로 IndexedDB 직접 조회"
    - "undefined/null 구분 로딩 상태 — undefined=로딩중, null=없음, Question=정상"

key-files:
  created:
    - apps/web/src/routes/student/problems/index.tsx
    - apps/web/src/routes/student/quiz/index.tsx
  modified:
    - apps/web/src/main.tsx

key-decisions:
  - "QuizPage에서 question 상태를 undefined/null/Question 3단계로 구분 — 로딩중/없음/정상 UI 분기 명확화"
  - "북마크 useEffect를 문제 로드 useEffect와 분리 — question 로드 완료 후 user.email 의존성 명시"

patterns-established:
  - "학생 라우트 페이지: basePath prop으로 QuestionList 재사용 — 강사/학생 다른 상세 경로 지원"
  - "QuizPage 3-state 로딩: undefined(스피너) → null(에러UI) → Question(QuizPlayer)"

requirements-completed: [QUIZ-01, QUIZ-02, QUIZ-03, QUIZ-04, QUIZ-05, QUIZ-06, QUIZ-07, PLAN-01]

# Metrics
duration: 118s
completed: 2026-02-20
---

# Phase 3 Plan 03: 학생 문제 목록 + 퀴즈 플레이어 라우트 Summary

**QuestionList basePath 재사용으로 학생 문제 목록 페이지 구현 + QuizPlayer + 북마크 버튼을 갖춘 /student/quiz/:id 라우트 연결**

## Performance

- **Duration:** 118s (약 2분)
- **Started:** 2026-02-20T12:07:45Z
- **Completed:** 2026-02-20T12:09:43Z
- **Tasks:** 2
- **Files modified:** 3 (2 신규 + 1 수정)

## Accomplishments

- StudentProblemsPage: QuestionList를 `basePath="/student/quiz"`로 재사용, shadcn Select 과목 필터 드롭다운 (6개 옵션)
- QuizPage: useParams로 :id 추출, db.questions.get()으로 문제 로드, 3-state 로딩(undefined/null/Question) UI 분기
- QuizPage: 페이지 헤더에 Bookmark(lucide-react) 버튼 — getWrongNote 초기 로드 + toggleBookmark 클릭 토글
- main.tsx: /student/problems → StudentProblemsPage 교체, /student/quiz/:id → QuizPage 신규 등록

## Task Commits

각 task를 원자적으로 커밋:

1. **Task 1: 학생 문제 목록 페이지 + 퀴즈 페이지** - `07816ac` (feat)
2. **Task 2: main.tsx 라우트 등록** - `9e22aca` (feat)

## Files Created/Modified

- `apps/web/src/routes/student/problems/index.tsx` - 학생 문제 목록 페이지, QuestionList basePath="/student/quiz", 과목 필터 셀렉트
- `apps/web/src/routes/student/quiz/index.tsx` - 퀴즈 플레이어 페이지, useParams(:id), 문제 로드, QuizPlayer, 북마크 버튼
- `apps/web/src/main.tsx` - /student/problems + /student/quiz/:id 라우트 등록

## Decisions Made

- **question 상태 3단계 구분:** undefined(초기/로딩), null(문제 없음), Question(정상 로드) — 스피너/fallback/QuizPlayer UI를 if 분기로 명확하게 처리
- **북마크 useEffect 분리:** 문제 로드 useEffect([id])와 북마크 상태 로드 useEffect([question, user?.email])를 분리하여 의존성 명확화

## Deviations from Plan

없음 — 계획대로 정확히 실행됨.

## Issues Encountered

없음 — TypeScript 에러 0개, 빌드 성공.

## User Setup Required

없음 — 외부 서비스 설정 불필요.

## Next Phase Readiness

- 학생 퀴즈 플로우 완성 — /student/problems에서 문제 선택 → /student/quiz/:id에서 QuizPlayer 실행
- 03-04(오답노트 페이지)에서 wrong-notes 라우트 구현 가능
- ComingSoonPage는 /student/wrong-notes, /student/profile에 여전히 사용 중

## Self-Check

### Files exist:
- FOUND: apps/web/src/routes/student/problems/index.tsx
- FOUND: apps/web/src/routes/student/quiz/index.tsx

### Commits exist:
- FOUND: 07816ac (feat(03-03): 학생 문제 목록 페이지 + 퀴즈 플레이어 페이지 구현)
- FOUND: 9e22aca (feat(03-03): main.tsx에 학생 퀴즈 라우트 2개 등록)

### Build verification:
- TypeScript: 0 errors (tsc --noEmit)
- Build: ✓ built in 2.37s

## Self-Check: PASSED

---
*Phase: 03-quiz-engine*
*Completed: 2026-02-20*
