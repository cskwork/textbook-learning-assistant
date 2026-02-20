---
phase: 07-instructor-portal
plan: 04
subsystem: ui
tags: [react, dexie, dexie-react-hooks, useLiveQuery, instructor-portal]

# Dependency graph
requires:
  - phase: 07-instructor-portal
    provides: "group.service.ts, Dexie version(5) groups/groupMembers/assignments 테이블"
  - phase: 07-instructor-portal
    provides: "GroupListPage/GroupNewPage/GroupDetailPage/AssignWorkbookPage/GroupReportPage"
provides:
  - "강사 홈 실데이터 통계 카드 (groupCount, problemCount, recentGroups via useLiveQuery)"
  - "학생 홈 반 참여 버튼 (/student/join-group 진입점)"
  - "Phase 7 전체 기능 사용자 검증 체크포인트"
affects: [phase-08]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "useLiveQuery로 Dexie 실시간 집계 쿼리 (count + toArray + sort + slice)"
    - "강사 홈 실데이터 패턴: user.email 기준 instructorId/createdBy 인덱스 쿼리"

key-files:
  created: []
  modified:
    - apps/web/src/routes/instructor/index.tsx
    - apps/web/src/routes/student/index.tsx

key-decisions:
  - "강사 홈 groupCount: instructorId 인덱스 count(), problemCount: createdBy 인덱스 count() — 별도 service 함수 없이 컴포넌트 내 useLiveQuery 직접 사용"
  - "학생 홈 반 참여 버튼: 문제 풀기 카드 내 기존 버튼 영역 배치 — 별도 카드 추가 없이 최소 변경"

patterns-established:
  - "useLiveQuery 집계: where(index).equals(value).count() 패턴"
  - "useLiveQuery 정렬+슬라이스: toArray().then(arr => arr.sort().slice()) 패턴"

requirements-completed: [INST-01, INST-02, INST-03, INST-04, INST-05]

# Metrics
duration: 5min
completed: 2026-02-21
---

# Phase 7 Plan 04: 강사 홈 실데이터 업데이트 + 학생 홈 반 참여 버튼 Summary

**강사 홈 animate-pulse 스켈레톤을 Dexie useLiveQuery 실데이터(그룹 수, 문제 수, 최근 반 목록)로 교체 + 학생 홈에 /student/join-group 진입 버튼 추가**

## Performance

- **Duration:** 5 min
- **Started:** 2026-02-21T00:00:00Z
- **Completed:** 2026-02-21T00:05:00Z
- **Tasks:** 1 (Task 2는 checkpoint:human-verify — 사용자 검증 대기)
- **Files modified:** 2

## Accomplishments

- 강사 홈: 3개 animate-pulse 스켈레톤 → useLiveQuery 실데이터 카드로 완전 교체
- 강사 홈: 최근 반 섹션 추가 (최대 3개, 빈 상태 안내 포함)
- 학생 홈: '반 참여' 버튼 추가 — 문제 풀기 카드 내 배치, /student/join-group 링크
- TypeScript 빌드 에러 없음 (✓ built in 4.84s)

## Task Commits

각 Task는 원자적으로 커밋됨:

1. **Task 1: 강사 홈 실데이터 업데이트 + 학생 홈 '반 참여' 버튼** - `6f64356` (feat)

**Plan metadata:** (docs 커밋 예정)

## Files Created/Modified

- `apps/web/src/routes/instructor/index.tsx` — animate-pulse 스켈레톤 제거, useLiveQuery 3개(groupCount/problemCount/recentGroups), 최근 반 섹션 추가
- `apps/web/src/routes/student/index.tsx` — Users 아이콘 import + 반 참여 버튼(/student/join-group) 추가

## Decisions Made

- 강사 홈 실데이터: group.service.ts 별도 함수 호출 없이 컴포넌트 내 useLiveQuery 직접 사용 (listGroups는 비동기 함수라 useLiveQuery와 다름)
- 학생 홈 반 참여 버튼: 기존 문제 풀기 카드 내 랜덤 문제 버튼 아래 배치 — 별도 카드 추가 없이 최소 변경 원칙

## Deviations from Plan

없음 — 계획대로 정확히 실행됨.

## Issues Encountered

없음.

## User Setup Required

없음 — 외부 서비스 설정 불필요.

## Next Phase Readiness

- Phase 7 전체 기능 구현 완료 (Task 2 checkpoint:human-verify 사용자 확인 대기 중)
- 강사 홈: 실데이터 연동 완료
- 학생 홈: 반 참여 진입점 추가 완료
- Phase 8 진입 가능

---
*Phase: 07-instructor-portal*
*Completed: 2026-02-21*
