---
phase: 04-workbook-generator
plan: 03
subsystem: ui
tags: [react, react-router, dexie, lucide-react, quiz-player, workbook]

# Dependency graph
requires:
  - phase: 04-01
    provides: workbook.service.ts (getWorkbook, listWorkbooks, createWorkbook, deleteWorkbook), Workbook 인터페이스, db
  - phase: 04-02
    provides: WorkbookCard, WorkbookList, WorkbookCreator 컴포넌트
  - phase: 03-02
    provides: QuizPlayer (onNext/onComplete/onBack Props 지원)
provides:
  - WorkbooksPage 라우트 (/student/workbooks) — WorkbookList + 새 문제집 버튼
  - CreateWorkbookPage 라우트 (/student/workbooks/create) — WorkbookCreator + 뒤로가기
  - WorkbookPlayPage 라우트 (/student/workbooks/:id/play) — 순차 문제 풀기 + 결과 요약
  - 학생 탭바 '문제집' 탭 (BookMarked 아이콘) — 5번째 탭
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "WorkbookPlayPage 5단계 상태 분기: undefined(로딩)/null(없음)/빈문제/진행중/완료 — question 라우트(03-03) 패턴 확장"
    - "QuizPlayer key={currentQuestion.id} 패턴 — 문제 변경 시 컴포넌트 상태 완전 리셋"
    - "Promise.all + filter((q): q is Question => q !== undefined) — 삭제된 문제 ID 안전 제거"

key-files:
  created:
    - apps/web/src/routes/student/workbooks/index.tsx
    - apps/web/src/routes/student/workbooks/create.tsx
    - apps/web/src/routes/student/workbooks/play.tsx
  modified:
    - apps/web/src/routes/_layout.tsx
    - apps/web/src/main.tsx

key-decisions:
  - "WorkbookPlayPage completedCount 제거 — handleComplete에서 isCorrect만 집계, completedCount는 currentIndex로 대체 (단순화)"
  - "questions.length === 0 체크: workbook !== undefined 중복 조건 제거 — null 체크 후 도달 시 항상 workbook 존재"

patterns-established:
  - "WorkbookPlayer 진행 바: (currentIndex / questions.length) * 100 — 현재 문제 시작 전 채워진 비율"

requirements-completed: [WKST-01, WKST-02, WKST-03, WKST-04]

# Metrics
duration: 131s
completed: 2026-02-20
---

# Phase 4 Plan 03: 라우트 통합 + WorkbookPlayer Summary

**3개 문제집 라우트(목록/생성/풀기) + 학생 탭바 '문제집' 탭 추가 + WorkbookPlayer(QuizPlayer 순차 제어 + 완료 결과 요약)로 WKST-01~04 전체 완성**

## Performance

- **Duration:** 131s (~2분 11초)
- **Started:** 2026-02-20T12:35:51Z
- **Completed:** 2026-02-20T12:37:57Z
- **Tasks:** 2
- **Files modified:** 5 (신규 3 + 수정 2)

## Accomplishments

- WorkbooksPage, CreateWorkbookPage, WorkbookPlayPage 3개 라우트 파일 생성
- _layout.tsx studentNavItems에 '문제집' 탭(BookMarked 아이콘) 추가 — 4개에서 5개 탭으로 확장
- WorkbookPlayPage: 5단계 상태 분기(로딩/없음/빈문제/진행중/완료), QuizPlayer onNext/onComplete 연동, 완료 결과 요약(전체/정답/정답률)
- WKST-04: submitQuizAttempt() QuizPlayer 내부 자동 호출로 학습 이력(quizAttempts + wrongNotes) 자동 연동
- TypeScript 에러 없음, 빌드 성공

## Task Commits

각 태스크 원자적 커밋:

1. **Task 1: 문제집 목록/생성 라우트 + nav 탭 + main.tsx 등록** - `5b576e0` (feat)
2. **Task 2: WorkbookPlayPage — 순차 문제 풀기 + 결과 요약 (WKST-04)** - `f66135c` (feat)

## Files Created/Modified

- `apps/web/src/routes/student/workbooks/index.tsx` - 문제집 목록 페이지 (WorkbookList + 새 문제집 버튼, 신규)
- `apps/web/src/routes/student/workbooks/create.tsx` - 문제집 생성 페이지 (WorkbookCreator + 뒤로가기, 신규)
- `apps/web/src/routes/student/workbooks/play.tsx` - 문제집 순차 풀기 페이지 (WorkbookPlayer, 신규 161줄)
- `apps/web/src/routes/_layout.tsx` - studentNavItems에 '문제집' 탭(BookMarked) 추가 (수정)
- `apps/web/src/main.tsx` - 3개 workbooks 라우트 import + Route 등록 (수정)

## Decisions Made

- WorkbookPlayPage completedCount 상태 제거: handleComplete에서 isCorrect만 집계하고 완료 문제 수는 currentIndex로 계산 — 불필요한 상태 제거로 단순화
- `questions.length === 0` 체크에서 `&& workbook !== undefined` 조건 제거: null 가드 통과 후 workbook은 항상 존재 (TypeScript 타입 좁힘 활용)

## Deviations from Plan

없음 — 계획대로 정확히 실행됨.

## Issues Encountered

없음.

## User Setup Required

없음 — 외부 서비스 설정 불필요.

## Next Phase Readiness

- Phase 4 전체 완료: DIY 문제집 서비스(04-01) + UI 컴포넌트(04-02) + 라우트 통합(04-03)
- WKST-01~04 requirements 모두 충족
- Phase 5 (AI 추천 엔진) 또는 다음 Phase 진입 가능

## Self-Check: PASSED

- workbooks/index.tsx: FOUND
- workbooks/create.tsx: FOUND
- workbooks/play.tsx: FOUND (161줄, min_lines 80 충족)
- _layout.tsx '문제집' 탭: FOUND
- main.tsx 3개 라우트: FOUND
- Commit 5b576e0: FOUND (feat(04-03): 문제집 목록/생성 라우트)
- Commit f66135c: FOUND (feat(04-03): WorkbookPlayPage)
- 빌드 성공: PASSED
- TypeScript 에러: 없음

---
*Phase: 04-workbook-generator*
*Completed: 2026-02-20*
