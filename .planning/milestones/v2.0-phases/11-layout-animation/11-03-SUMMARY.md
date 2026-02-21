---
phase: 11-layout-animation
plan: "03"
subsystem: ui
tags: [react, framer-motion, tailwind, grid, card, filter, sort]

# 의존성 그래프
requires:
  - phase: 11-layout-animation
    plan: "01"
    provides: "AnimatedCard hover scale/y 마이크로 인터랙션 컴포넌트, FadeIn 범용 래퍼, Skeleton shimmer 컴포넌트"

provides:
  - "오답노트 페이지 반응형 카드 그리드 레이아웃 (1/2/3열)"
  - "오답노트 필터 칩 버튼 토글 방식 (단원/유형 그룹 레이블)"
  - "오답 카드 AnimatedCard hover 마이크로 인터랙션"
  - "문제집 페이지 반응형 카드 그리드 레이아웃 (1/2/3열)"
  - "문제집 최신순/이름순 칩 토글 정렬 UI"
  - "문제집 카드 AnimatedCard hover 마이크로 인터랙션"

affects:
  - 12-student-home
  - 13-analytics-dashboard

# 기술 스택
tech-stack:
  added: []
  patterns:
    - "AnimatedCard 래퍼 패턴: 기존 Card 컴포넌트를 AnimatedCard로 감싸 hover 인터랙션 적용"
    - "칩 필터 토글: Select 드롭다운 → 인라인 button 칩 (flex flex-wrap gap-2, rounded-full, primary/10 활성 상태)"
    - "정렬 칩 토글: 최신순/이름순 상태를 useState로 관리, useLiveQuery 의존성 배열에 포함"
    - "그리드 레이아웃: grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 — 모바일 1열/태블릿 2열/데스크톱 3열"
    - "FadeIn 래퍼: 페이지 최상위 레벨에서 전체 콘텐츠를 FadeIn으로 감싸는 패턴"

key-files:
  created: []
  modified:
    - apps/web/src/routes/student/wrong-notes/index.tsx
    - apps/web/src/components/wrong-notes/WrongNoteCard.tsx
    - apps/web/src/components/wrong-notes/WrongNoteList.tsx
    - apps/web/src/components/wrong-notes/WrongNoteFilter.tsx
    - apps/web/src/routes/student/workbooks/index.tsx
    - apps/web/src/components/workbook/WorkbookCard.tsx
    - apps/web/src/components/workbook/WorkbookList.tsx

key-decisions:
  - "칩 토글 필터 선택 상태 토글: 이미 선택된 칩 재클릭 시 undefined로 해제 (cat === filterCategory ? undefined : cat)"
  - "sortBy를 useLiveQuery 의존성 배열에 포함 — IndexedDB 쿼리 자체는 미변경, .then() 정렬로 반응성 확보"
  - "AnimatedCard는 Card 컴포넌트 대체 래퍼로 사용 — CardHeader/CardContent/CardFooter 내부 구조 유지"

patterns-established:
  - "칩 필터 그룹 패턴: 그룹 레이블(text-xs text-muted-foreground) + flex flex-wrap gap-2 칩 배열"
  - "그리드 스켈레톤: 로딩 중에도 동일한 grid 구조 유지하여 레이아웃 점프 방지"
  - "정렬 UI: 상단 헤더 영역에 칩 토글 + 액션 버튼 함께 배치 (flex flex-wrap items-center gap-3)"

requirements-completed: [LYOT-03]

# 메트릭
duration: 4min
completed: 2026-02-21
---

# Phase 11 Plan 03: 오답노트/문제집 페이지 카드 그리드 리디자인 Summary

**리스트형 UI를 기출탭탭 스타일 반응형 카드 그리드(1/2/3열)로 전환 — 오답노트 칩 필터 + 문제집 정렬 토글 + AnimatedCard hover 마이크로 인터랙션 적용**

## Performance

- **Duration:** 4min
- **Started:** 2026-02-21T00:02:44Z
- **Completed:** 2026-02-21T00:06:40Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments

- 오답노트 필터 UI를 Select 드롭다운에서 인라인 칩 버튼 토글로 전환 — 단원/유형 그룹 레이블 포함, 선택 해제 토글 지원
- 오답노트/문제집 목록을 `grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4` 반응형 카드 그리드로 전환
- WrongNoteCard, WorkbookCard에 AnimatedCard 래퍼 적용 — hover 시 scale 1.02/y -2px 마이크로 인터랙션 재생
- 문제집 페이지에 최신순/이름순 칩 토글 정렬 UI 추가 — `sortBy` 상태를 WorkbookList에 prop 전달, `localeCompare('ko')` 한국어 정렬 지원

## Task Commits

각 태스크는 원자적으로 커밋되었다:

1. **Task 1: 오답노트 페이지 카드 그리드 + 칩 필터 리디자인** — `addc6d7` (feat)
2. **Task 2: 문제집 페이지 카드 그리드 + 정렬 UI 리디자인** — `9ccad88` (feat)

## Files Created/Modified

- `apps/web/src/components/wrong-notes/WrongNoteFilter.tsx` — Select 드롭다운 → 칩 버튼 토글 방식으로 완전 교체 (단원/유형 그룹 레이블, 선택 해제 토글)
- `apps/web/src/components/wrong-notes/WrongNoteCard.tsx` — AnimatedCard 래퍼로 감싸기, CardContent 내부 구조 유지
- `apps/web/src/components/wrong-notes/WrongNoteList.tsx` — space-y-3 → 그리드, Skeleton 컴포넌트 기반 스켈레톤 교체
- `apps/web/src/routes/student/wrong-notes/index.tsx` — max-w-4xl → max-w-6xl, FadeIn 래퍼 적용
- `apps/web/src/routes/student/workbooks/index.tsx` — max-w-2xl → max-w-6xl, 정렬 칩 토글 UI 추가, FadeIn 래퍼 적용
- `apps/web/src/components/workbook/WorkbookList.tsx` — space-y-3 → 그리드, sortBy prop 추가 (최신순/이름순 정렬), Skeleton 스켈레톤 교체
- `apps/web/src/components/workbook/WorkbookCard.tsx` — AnimatedCard 래퍼로 감싸기, flex flex-col 구조 유지

## Decisions Made

- **칩 토글 해제 패턴**: 이미 선택된 칩 재클릭 시 `undefined`로 해제하는 토글 방식 채택 — UX 일관성 유지
- **sortBy를 useLiveQuery 의존성 배열에 포함**: DB 쿼리 자체는 변경 없고 `.then()` 체인에서 정렬 처리 — 간단하고 반응성 보장
- **AnimatedCard는 Card 컴포넌트 완전 대체**: CardHeader/CardContent/CardFooter 내부 구조 유지하되 외부 래퍼만 교체 — 기존 스타일 최대 보존

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- `pnpm --filter web build` 첫 실행 시 `src/routes/onboarding.tsx`의 `useMemo` 미사용 에러 발생 — 실제로는 TypeScript incremental build 캐시 오염 문제였음. `git stash`로 확인한 결과 우리 변경 전에 이미 빌드 성공 상태였고, `npx tsc -b --force`로 캐시 초기화 후 재빌드 성공.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- 오답노트/문제집 페이지 카드 그리드 리디자인 완료 — 11-04(온보딩 흐름 리디자인), 11-05(통합 검증) 진입 가능
- AnimatedCard/FadeIn/Skeleton 패턴 정착 — Phase 12 학생 홈/문제풀이 UX에서 동일 패턴 재사용 가능

---
*Phase: 11-layout-animation*
*Completed: 2026-02-21*

## Self-Check: PASSED

- FOUND: apps/web/src/routes/student/wrong-notes/index.tsx
- FOUND: apps/web/src/components/wrong-notes/WrongNoteCard.tsx
- FOUND: apps/web/src/components/wrong-notes/WrongNoteFilter.tsx
- FOUND: apps/web/src/routes/student/workbooks/index.tsx
- FOUND: apps/web/src/components/workbook/WorkbookCard.tsx
- FOUND: .planning/phases/11-layout-animation/11-03-SUMMARY.md
- COMMIT addc6d7: feat(11-03) 오답노트 페이지 카드 그리드 + 칩 필터 리디자인 확인
- COMMIT 9ccad88: feat(11-03) 문제집 페이지 카드 그리드 + 정렬 UI 리디자인 확인
