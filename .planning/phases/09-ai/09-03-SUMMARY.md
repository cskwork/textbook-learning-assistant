---
phase: 09-ai
plan: 03
subsystem: ui
tags: [react, analytics, instructor, student, dexie, recharts]

# Dependency graph
requires:
  - phase: 07-instructor-portal
    provides: GroupReportPage, group.service.ts, MOCK_STUDENTS
  - phase: 05-ai-analytics
    provides: getCategoryAccuracy, getWeakCategories, getOverallStats, AccuracyBarChart, WeakTypeRadarChart

provides:
  - 강사 학생별 상세 분석 페이지 (AccuracyBarChart + WeakTypeRadarChart + 오답노트 목록 + 통계 카드 4종)
  - GroupReportPage 학생 행 클릭 → 상세 분석 페이지 이동
  - /instructor/groups/:id/student/:studentId 라우트 등록
  - 학생 홈 빈 상태 안내 개선 (questionCount === 0 조건부 메시지)

affects: [instructor-portal, student-home, analytics]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "강사 드릴다운 패턴: 그룹 리포트 → 학생 상세 분석 (row onClick + navigate)"
    - "인라인 stat 카드 4종: stat-accent-blue/emerald/amber/rose 재사용 패턴"

key-files:
  created:
    - apps/web/src/routes/instructor/groups/student-detail.tsx
  modified:
    - apps/web/src/routes/instructor/groups/report.tsx
    - apps/web/src/main.tsx
    - apps/web/src/routes/student/index.tsx

key-decisions:
  - "report.tsx tr/div onClick + navigate 패턴으로 상세 페이지 이동 — Link 래핑 대신 행 전체 클릭 처리"
  - "SummaryStatsCards streak 필수 prop 대신 인라인 stat 카드 4종으로 직접 렌더링 (streak 데이터 불필요)"
  - "학생 상세 오답노트: wrongNotes where('studentId') limit(5) — content 비동기 로드 생략, questionId만 표시"

patterns-established:
  - "드릴다운 페이지: useParams로 groupId + studentId 동시 추출 → getGroup 소유 확인 후 병렬 데이터 로드"

requirements-completed:
  - INSTRV-01
  - STUDHM-01

# Metrics
duration: 151s
completed: 2026-02-21
---

# Phase 09 Plan 03: 학생 상세 분석 드릴다운 + 홈 빈 상태 개선 Summary

**강사가 그룹 리포트에서 학생 행을 클릭하면 AccuracyBarChart + WeakTypeRadarChart + 오답노트 + 통계 카드 4종이 있는 상세 분석 페이지로 이동하고, 학생 홈의 questionCount === 0 빈 상태 안내가 개선됨**

## Performance

- **Duration:** 151s
- **Started:** 2026-02-20T17:09:09Z
- **Completed:** 2026-02-20T17:11:40Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- 강사 학생별 상세 분석 페이지(student-detail.tsx) 신규 생성 — 통계 카드 4종 + AccuracyBarChart + WeakTypeRadarChart + 오답노트 최근 5개
- 그룹 리포트 학생 행에 클릭 이벤트 추가 (데스크톱 tr + 모바일 div 모두 처리)
- main.tsx에 `/instructor/groups/:id/student/:studentId` 라우트 등록 (`:id/assign` 뒤, `:id` 앞 배치)
- 학생 홈 CTA 카드 하단 questionCount === 0 안내 섹션 추가 + AI 추천 빈 상태 메시지 조건부 변경

## Task Commits

각 태스크를 원자적으로 커밋:

1. **Task 1: 강사 학생별 상세 분석 페이지 생성 + 라우트 등록** - `2f52977` (feat)
2. **Task 2: 학생 홈 빈 상태 개선** - `4c19a95` (feat)

**Plan metadata:** (docs 커밋 — 이 SUMMARY.md 포함)

## Files Created/Modified

- `apps/web/src/routes/instructor/groups/student-detail.tsx` — 신규: 강사 학생별 상세 분석 페이지 (통계 4종 + 차트 2개 + 오답노트)
- `apps/web/src/routes/instructor/groups/report.tsx` — 수정: tr/div에 onClick + navigate 추가, ChevronRight 아이콘 추가
- `apps/web/src/main.tsx` — 수정: StudentAnalyticsDetailPage import + 라우트 등록
- `apps/web/src/routes/student/index.tsx` — 수정: questionCount === 0 안내 섹션 + AI 추천 빈 상태 메시지 조건 분기

## Decisions Made

- `SummaryStatsCards` prop에 `streak` (todayCount 포함)이 필수이므로 해당 컴포넌트 대신 인라인 stat 카드 4종으로 직접 렌더링 — 총 풀이, 정답률, 학습 시간, 오답 수 표시
- `report.tsx` 학생 행 클릭: `<Link>` 래핑 대신 `onClick={() => navigate(...)}` 패턴으로 tr/div 전체 클릭 처리 — 테이블 레이아웃 유지에 유리
- 오답노트 섹션: `questionId`만 표시하고 `db.questions.get(note.questionId)` 비동기 로드 생략 — POC 수준에서 충분

## Deviations from Plan

None - 플랜대로 정확히 실행됨.

## Issues Encountered

None.

## User Setup Required

None - 외부 서비스 설정 불필요.

## Next Phase Readiness

- Phase 09 Plan 03 완료 — 강사 드릴다운 페이지 + 학생 홈 빈 상태 개선 완료
- Phase 09의 다음 플랜 진행 가능

---
*Phase: 09-ai*
*Completed: 2026-02-21*
