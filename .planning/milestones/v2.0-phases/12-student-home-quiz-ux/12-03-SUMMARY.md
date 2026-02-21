---
phase: 12-student-home-quiz-ux
plan: "03"
subsystem: ui
tags: [react, framer-motion, tailwind, grid, card, filter, animation]

# 의존성 그래프
requires:
  - phase: 11-layout-animation
    plan: "01"
    provides: "AnimatedCard hover scale/y 마이크로 인터랙션 컴포넌트, FadeIn 범용 래퍼, Skeleton shimmer 컴포넌트"
  - phase: 11-layout-animation
    plan: "03"
    provides: "칩 필터 토글 패턴, 카드 그리드 레이아웃 패턴 (grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3)"

provides:
  - "학생 문제 목록 페이지 반응형 카드 그리드 레이아웃 (1/2/3열)"
  - "과목 + 난이도 칩 버튼 토글 필터 (Select 드롭다운 대체)"
  - "QuestionCard AnimatedCard hover 마이크로 인터랙션"
  - "난이도 시맨틱 색상 뱃지 (emerald/green/yellow/orange/red)"
  - "FadeIn 진입 애니메이션"

affects:
  - 14-instructor-portal

# 기술 스택
tech-stack:
  added: []
  patterns:
    - "AnimatedCard 래퍼 패턴: 기존 Card → AnimatedCard 교체로 hover scale/y 인터랙션 적용"
    - "칩 필터 그룹: 과목/난이도 그룹 레이블 + flex flex-wrap 칩 배열, 재클릭 시 undefined 해제"
    - "그리드 레이아웃: grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
    - "FadeIn 래퍼: 페이지 최상위 + 빈 목록 상태 양쪽에 적용"
    - "Skeleton 그리드 스켈레톤: 로딩 중 동일 grid 구조 유지 (레이아웃 점프 방지)"

key-files:
  created: []
  modified:
    - apps/web/src/components/questions/QuestionCard.tsx
    - apps/web/src/components/questions/QuestionList.tsx
    - apps/web/src/routes/student/problems/index.tsx

key-decisions:
  - "QuestionCard의 Card 완전 제거 — AnimatedCard가 외부 래퍼 역할, 내부 div 구조로 레이아웃 재구성"
  - "난이도 색상 코딩: 1(emerald)/2(green)/3(yellow)/4(orange)/5(red) + 다크모드 시맨틱 색상"
  - "filterDifficulty 인메모리 필터 방식 — DB 쿼리 변경 없이 .filter()로 클라이언트 측 필터링"
  - "basePath prop 유지 — 강사 페이지(/instructor/problems)에서도 QuestionCard 재사용 가능"

patterns-established:
  - "칩 필터 그룹: 그룹 레이블(text-xs text-muted-foreground font-semibold) + flex flex-wrap gap-2 칩 배열"
  - "칩 활성 상태: bg-primary text-primary-foreground shadow-sm / 비활성: bg-muted/50 hover:bg-muted"
  - "이미 선택된 칩 재클릭 시 undefined 해제 — 11-03 패턴 동일"

requirements-completed: [QUIZ-04]

# 메트릭
duration: 3min
completed: 2026-02-21
---

# Phase 12 Plan 03: 문제 목록/선택 UI 리디자인 Summary

**QuestionCard를 AnimatedCard 래퍼로 교체하고 난이도 색상 뱃지 적용, QuestionList를 1/2/3열 반응형 그리드로 전환, StudentProblemsPage의 Select 드롭다운을 과목+난이도 칩 버튼 토글로 완전 교체 — QUIZ-04 충족**

## Performance

- **Duration:** 3min
- **Started:** 2026-02-21T08:26:07Z
- **Completed:** 2026-02-21T08:28:16Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- QuestionCard: Card → AnimatedCard 교체로 hover scale 1.02/y -2px 마이크로 인터랙션 적용, 레이아웃 재구성(상단 과목+유형 / 본문 LatexPreview line-clamp-2 / 하단 단원+출처+난이도)
- 난이도 뱃지: emerald/green/yellow/orange/red 시맨틱 색상 + 다크모드 대응 + rounded-full 스타일
- QuestionList: space-y-3 → grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 반응형 그리드, Skeleton 6개 로딩 스켈레톤, FadeIn 래퍼 적용
- StudentProblemsPage: Select 드롭다운 → 과목 6개 + 난이도 6개 칩 버튼 토글 방식으로 전환, max-w-4xl → max-w-6xl, FadeIn 래퍼, 총 문제 수 헤더 표시

## Task Commits

각 태스크는 원자적으로 커밋되었다:

1. **Task 1: QuestionCard AnimatedCard 래퍼 + 난이도 색상 뱃지 + QuestionList 카드 그리드** — `5b35a14` (feat)
2. **Task 2: StudentProblemsPage 칩 필터(과목+난이도) + FadeIn 리디자인** — `ca720cc` (feat)

## Files Created/Modified

- `apps/web/src/components/questions/QuestionCard.tsx` — Card 완전 제거 → AnimatedCard 외부 래퍼 교체, 레이아웃 3구역 재구성, 난이도 시맨틱 색상 뱃지
- `apps/web/src/components/questions/QuestionList.tsx` — space-y-3 → 반응형 그리드, Skeleton 스켈레톤 교체, FadeIn 래퍼, filterDifficulty prop 추가
- `apps/web/src/routes/student/problems/index.tsx` — Select 드롭다운 완전 제거, 과목/난이도 칩 필터 그룹 추가, max-w-6xl, FadeIn 래퍼, 총 문제 수 표시

## Decisions Made

- **QuestionCard 내부 구조 재구성**: 기존 CardContent 내부 단순 flex → 3구역(상단/본문/하단)으로 명확히 분리, 가독성 향상
- **난이도 색상 코딩**: 1(emerald) → 2(green) → 3(yellow) → 4(orange) → 5(red) 스펙트럼 — 직관적 난이도 인지
- **filterDifficulty 인메모리 방식**: DB 쿼리에 difficulty 조건 추가 대신 `.filter()` 클라이언트 측 처리 — POC 규모에서 단순하고 충분

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- 학생 문제 목록 페이지 카드 그리드 리디자인 완료 — QUIZ-04 충족
- QuestionCard AnimatedCard/난이도 색상 뱃지 패턴 확립 — 강사 포털(Phase 14)에서 동일 컴포넌트 재사용 가능
- 칩 필터 그룹 패턴 정착 — Phase 12 나머지 플랜에서 계속 적용

---
*Phase: 12-student-home-quiz-ux*
*Completed: 2026-02-21*

## Self-Check: PASSED

- FOUND: apps/web/src/components/questions/QuestionCard.tsx
- FOUND: apps/web/src/components/questions/QuestionList.tsx
- FOUND: apps/web/src/routes/student/problems/index.tsx
- FOUND: .planning/phases/12-student-home-quiz-ux/12-03-SUMMARY.md
- COMMIT 5b35a14: feat(12-03) QuestionCard AnimatedCard 래퍼 + 난이도 색상 뱃지 + QuestionList 카드 그리드 확인
- COMMIT ca720cc: feat(12-03) StudentProblemsPage 칩 필터(과목+난이도) + FadeIn 리디자인 확인
