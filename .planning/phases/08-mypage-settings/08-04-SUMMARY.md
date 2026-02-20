---
phase: 08-mypage-settings
plan: "04"
subsystem: ui
tags: [react, routing, navigation, appshell]

# Dependency graph
requires:
  - phase: 08-03
    provides: 학생/강사 마이페이지 UI 컴포넌트 (StudentProfilePage, InstructorProfilePage)
provides:
  - AppShell 모바일 헤더에 마이페이지 진입 아이콘 (User 아이콘 버튼)
  - main.tsx에서 /student/profile → StudentProfilePage, /instructor/profile → InstructorProfilePage 라우트 연결
  - _layout.tsx에서 profilePath prop을 AppShell에 전달
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns: [AppShell에 profilePath prop 패턴 — 역할별 진입 경로를 상위에서 주입]

key-files:
  created: []
  modified:
    - apps/web/src/components/layout/AppShell.tsx
    - apps/web/src/routes/_layout.tsx
    - apps/web/src/routes/instructor/groups/detail.tsx
    - apps/web/src/routes/instructor/groups/report.tsx
    - apps/web/src/routes/instructor/groups/new.tsx

key-decisions:
  - "AppShell profilePath prop 패턴 — _layout.tsx가 user.role 기반으로 경로 결정 후 주입"
  - "모바일 헤더에서 User 아이콘 버튼 로그아웃 버튼 왼쪽에 배치"

patterns-established:
  - "AppShell에 선택적 prop을 추가하여 레이아웃 계층에서 역할별 기능 주입"

requirements-completed: [MYPAGE-01, MYPAGE-02, MYPAGE-03, MYPAGE-04, MYPAGE-05]

# Metrics
duration: 103s
completed: "2026-02-21"
---

# Phase 8 Plan 04: 라우트 연결 + AppShell 헤더 마이페이지 진입점 Summary

**AppShell 모바일 헤더에 User 아이콘 버튼 추가 + main.tsx 마이페이지 라우트 연결로 앱 전체 네비게이션 통합 완료**

## Performance

- **Duration:** 103s
- **Started:** 2026-02-20T16:05:13Z
- **Completed:** 2026-02-20T16:06:56Z
- **Tasks:** 1/2 (Task 2는 checkpoint:human-verify — 사용자 검증 대기 중)
- **Files modified:** 5

## Accomplishments
- AppShell 모바일 헤더에 마이페이지 User 아이콘 버튼 추가 (user.role에 따라 /student/profile 또는 /instructor/profile로 navigate)
- _layout.tsx에서 profilePath prop을 AppShell에 전달 (학생: /student/profile, 강사: /instructor/profile)
- main.tsx의 /student/profile, /instructor/profile 라우트가 실제 ProfilePage 컴포넌트를 렌더링 확인
- instructor/groups 파일들의 미사용 import 제거로 빌드 오류 수정

## Task Commits

각 태스크는 원자적으로 커밋되었습니다:

1. **Task 1: main.tsx 라우트 연결 + AppShell 헤더 진입점 + 빌드 검증** - `5f00a79` (feat)
2. **Task 2: Phase 8 전체 통합 사용자 검증** - 사용자 검증 대기 중 (checkpoint:human-verify)

**Plan metadata:** (docs 커밋 예정)

## Files Created/Modified
- `apps/web/src/components/layout/AppShell.tsx` - profilePath prop 추가 + 모바일 헤더 User 아이콘 버튼
- `apps/web/src/routes/_layout.tsx` - user.role 기반 profilePath 계산 및 AppShell에 전달
- `apps/web/src/routes/instructor/groups/detail.tsx` - 미사용 ChevronRight, Copy import 제거
- `apps/web/src/routes/instructor/groups/report.tsx` - 미사용 ChevronRight import 제거
- `apps/web/src/routes/instructor/groups/new.tsx` - 미사용 Badge import 제거

## Decisions Made
- AppShell profilePath prop 패턴: `_layout.tsx`가 user.role 기반으로 profilePath 결정 후 AppShell에 주입 (useAuth() 직접 호출 대신)
- 모바일 헤더에서 마이페이지 아이콘을 로그아웃 버튼 왼쪽에 배치하여 우선순위 명확화

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] instructor/groups 파일 미사용 import 제거**
- **Found during:** Task 1 (빌드 검증)
- **Issue:** detail.tsx, report.tsx, new.tsx에 미사용 import (ChevronRight, Copy, Badge)가 있어 TypeScript 빌드 오류 발생
- **Fix:** 세 파일에서 미사용 import 각각 제거
- **Files modified:** apps/web/src/routes/instructor/groups/detail.tsx, report.tsx, new.tsx
- **Verification:** pnpm build 성공
- **Committed in:** 5f00a79 (Task 1 커밋에 포함)

---

**Total deviations:** 1 auto-fixed (Rule 1 빌드 오류)
**Impact on plan:** 빌드 통과를 위한 필수 수정. 기능 범위 변경 없음.

## Issues Encountered
- main.tsx의 라우트 연결(StudentProfilePage, InstructorProfilePage)은 이미 Phase 8-03 이전에 완료되어 있었음 — Task 1은 profilePath prop 추가에 집중

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 8 마이페이지 기능 구현 완료 (Phase 8-01~03)
- 라우트 연결 + 헤더 진입점 추가 완료 (Phase 8-04 Task 1)
- 사용자 통합 검증(Phase 8-04 Task 2)만 남음 — checkpoint:human-verify 통과 시 Phase 8 완료

---
*Phase: 08-mypage-settings*
*Completed: 2026-02-21*
