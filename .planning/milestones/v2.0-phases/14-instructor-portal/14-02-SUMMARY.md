---
phase: 14-instructor-portal
plan: "02"
subsystem: ui
tags: [react, framer-motion, dexie, tailwind, filter, bulk-action]

# Dependency graph
requires:
  - phase: 14-instructor-portal/14-01
    provides: 강사 포털 홈 + 기출탭탭 스타일 기반
  - phase: 12-student-home-quiz-ux
    provides: QuestionCard/QuestionList 컴포넌트, AnimatedCard 패턴
provides:
  - QuestionList 선택 모드(selectionMode/selectedIds/onToggleSelect) — 기존 사용처 하위호환
  - InstructorProblemsPage 기출탭탭 스타일 리디자인 (필터 사이드바/칩 바 + 일괄 삭제)
affects: [instructor-portal, student-quiz]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "selectionMode optional props 패턴 — 기존 컴포넌트에 선택 모드 추가 시 optional props로 하위호환 유지"
    - "필터 사이드바/칩 바 동기화 패턴 — 같은 filterSubject/filterDifficulty 상태를 lg:hidden vs hidden lg:block으로 두 뷰가 공유"
    - "하단 고정 액션 바 패턴 — fixed bottom-20(탭바 위) + backdrop-blur-xl + rounded-2xl"
    - "useLiveQuery 필터 동기화 패턴 — 부모 컴포넌트에서 allQuestions useLiveQuery로 전체 선택용 ID 목록 관리"

key-files:
  created: []
  modified:
    - apps/web/src/components/questions/QuestionList.tsx
    - apps/web/src/routes/instructor/problems/index.tsx
    - apps/web/src/routes/instructor/groups/detail.tsx

key-decisions:
  - "QuestionList 선택 모드 props를 optional로 설계 — selectionMode 미전달 시 기존 동작 100% 유지"
  - "일괄 삭제: db.questions.bulkDelete([...selectedIds]) 사용 — Dexie 내장 bulkDelete API 활용"
  - "전체 선택 ID 목록: 부모 컴포넌트의 allQuestions useLiveQuery로 관리 — QuestionList에 콜백 prop 불필요"
  - "하단 액션 바 위치: fixed bottom-20 — 탭바(bottom-0 h-16+safe-area) 위에 겹치지 않도록"

patterns-established:
  - "선택 모드 체크박스 오버레이: absolute top-3 left-3 z-10 + relative 래퍼 패턴"
  - "필터 초기화 패턴: hasActiveFilter 변수로 리셋 버튼 조건부 표시"

requirements-completed: [INST-02]

# Metrics
duration: 2min
completed: 2026-02-21
---

# Phase 14 Plan 02: 강사 문제 관리 페이지 Summary

**기출탭탭 스타일 문제 관리 페이지: 과목/난이도 필터 칩 바(모바일) + 사이드바(데스크톱) + QuestionList 다중 선택/일괄 삭제**

## Performance

- **Duration:** 2min 26s
- **Started:** 2026-02-21T01:20:16Z
- **Completed:** 2026-02-21T01:22:42Z
- **Tasks:** 1
- **Files modified:** 3

## Accomplishments

- QuestionList에 selectionMode/selectedIds/onToggleSelect optional props 추가 — 기존 학생 문제 목록 사용처 영향 없음
- 선택 모드 시 좌상단 체크박스 오버레이(absolute top-3 left-3 z-10) + 선택 카드 ring-2 ring-primary/50 하이라이트
- InstructorProblemsPage 기출탭탭 스타일 전면 리디자인: FadeIn delay stagger, text-[1.65rem] font-extrabold 헤더
- 과목 5개(수학I/II/미적분/확률과통계/기하) + 난이도 5단계 필터: 모바일 가로 스크롤 칩 바(lg:hidden) + 데스크톱 사이드바(hidden lg:block w-52)
- 일괄 선택 모드: 하단 고정 액션 바(fixed bottom-20) — 전체선택/선택해제/bulkDelete 버튼
- db.questions.bulkDelete([...selectedIds]) 일괄 삭제 구현

## Task Commits

각 task가 원자적으로 커밋됨:

1. **Task 1: QuestionList 선택 모드 확장 + 문제 관리 페이지 전면 리디자인** - `914e984` (feat)

**Plan metadata:** 추후 docs commit

## Files Created/Modified

- `apps/web/src/components/questions/QuestionList.tsx` — selectionMode/selectedIds/onToggleSelect optional props 추가, 체크박스 오버레이 렌더링
- `apps/web/src/routes/instructor/problems/index.tsx` — 기출탭탭 스타일 전면 리디자인: FadeIn, 필터 사이드바/칩 바, 일괄 선택 액션 바
- `apps/web/src/routes/instructor/groups/detail.tsx` — [Rule 1] AnimatedCard 미사용 import 제거

## Decisions Made

- QuestionList 선택 모드 props를 optional로 설계 — selectionMode 미전달 시 기존 동작 100% 유지
- 일괄 삭제: db.questions.bulkDelete([...selectedIds]) 사용 — Dexie 내장 bulkDelete API 활용
- 전체 선택 ID 목록: 부모 컴포넌트의 allQuestions useLiveQuery로 관리 — QuestionList에 콜백 prop 불필요
- 하단 액션 바 위치: fixed bottom-20 — 탭바(bottom-0) 위에 겹치지 않도록

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] groups/detail.tsx AnimatedCard 미사용 import 제거**
- **Found during:** Task 1 (빌드 검증)
- **Issue:** `AnimatedCard`가 import되었으나 파일에서 사용되지 않음 — TS6133 에러 발생
- **Fix:** `import { AnimatedCard } from '@/components/motion/AnimatedCard'` 라인 제거
- **Files modified:** apps/web/src/routes/instructor/groups/detail.tsx
- **Verification:** pnpm --filter web build 성공 (0 에러)
- **Committed in:** 914e984 (Task 1 커밋에 포함)

---

**Total deviations:** 1 auto-fixed (Rule 1 - Bug)
**Impact on plan:** 빌드 블로킹 에러 해소. 스코프 외 파일(groups/detail.tsx)의 기존 미사용 import 제거.

## Issues Encountered

없음.

## User Setup Required

없음 — 외부 서비스 설정 불필요.

## Next Phase Readiness

- INST-02 요구사항 충족 완료 — 문제 카드 그리드, 필터 사이드바/칩 바, 일괄 작업
- Phase 14 Plan 03 (강사 분석) 진행 가능
- QuestionList 선택 모드 재사용 가능 — 다른 목록 컴포넌트에 동일 패턴 적용 가능

---
*Phase: 14-instructor-portal*
*Completed: 2026-02-21*
