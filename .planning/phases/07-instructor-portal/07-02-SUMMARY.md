---
phase: 07-instructor-portal
plan: "02"
subsystem: instructor-groups-ui
tags: [react, instructor-portal, group-management, dexie, useLiveQuery, routing]
dependency_graph:
  requires: [apps/web/src/services/group.service.ts, apps/web/src/lib/db.ts@version5]
  provides: [GroupListPage, GroupNewPage, GroupDetailPage, AssignWorkbookPage]
  affects: [강사 탭바 nav, main.tsx 라우트 트리]
tech_stack:
  added: []
  patterns: [useLiveQuery 실시간 반응, useEffect 비동기 로드, React state 폼 제출 흐름]
key_files:
  created:
    - apps/web/src/routes/instructor/groups/index.tsx
    - apps/web/src/routes/instructor/groups/new.tsx
    - apps/web/src/routes/instructor/groups/detail.tsx
    - apps/web/src/routes/instructor/groups/assign.tsx
  modified:
    - apps/web/src/routes/_layout.tsx
    - apps/web/src/main.tsx
decisions:
  - "routes 선언 순서: /instructor/groups/new → /instructor/groups/:id/assign → /instructor/groups/:id — 정적 경로 우선 배치로 react-router 매칭 보장"
  - "assign.tsx listWorkbooks(user.email) — 강사 자신이 만든 문제집을 studentId=email로 조회 (Workbook.studentId는 문제집 생성자 이메일)"
  - "GroupDetailPage: useEffect [groupId] 의존성 — useLiveQuery 대신 useState+loadData 패턴 (멤버/과제 삭제 후 수동 갱신 필요)"
metrics:
  duration: 186s
  completed: 2026-02-20
  tasks: 2
  files: 6
---

# Phase 7 Plan 02: 강사 그룹 관리 UI Summary

**One-liner:** 강사가 반을 만들고 초대 코드를 발급·공유하고 과제를 배정할 수 있는 4개 페이지 + 라우트/nav 등록

## What Was Built

Phase 7 강사 포털의 UI 레이어를 구축했다. 07-01에서 구축한 group.service.ts를 소비하는 4개 React 페이지와 라우트 등록, 강사 탭바 nav 업데이트를 완료했다.

### Task 1: 그룹 목록/생성/상세 페이지

**파일:** 3개 신규 생성

**GroupListPage** (`apps/web/src/routes/instructor/groups/index.tsx`, 74줄):
- `useLiveQuery`로 `db.groups.where('instructorId').equals(user.email)` 실시간 반응
- 빈 상태: 첫 번째 반 만들기 빈 상태 UI
- 목록: 반 이름 + 초대 코드 Badge + 생성일 표시, 클릭 시 상세 이동

**GroupNewPage** (`apps/web/src/routes/instructor/groups/new.tsx`, 87줄):
- 반 이름 Input 폼 → 제출 → `createGroup` + `getGroup` 호출
- 성공 시: 초대 코드를 큰 Badge로 표시 + 상세 보기/목록으로 버튼

**GroupDetailPage** (`apps/web/src/routes/instructor/groups/detail.tsx`, 116줄):
- 멤버 목록: `listGroupMembers` + `MOCK_STUDENTS` 이름 매핑
- 과제 목록: `listAssignments` + 개별 삭제 버튼
- 모의 학생 추가: `seedMockStudentData` (멤버 0명일 때만 표시)
- 리포트 링크: `/instructor/groups/:id/report` (07-03 구현)
- 반 삭제: `deleteGroup` + confirm 다이얼로그

**Commit:** `a4071ee`

### Task 2: 과제 배정 페이지 + _layout.tsx + main.tsx 등록

**파일:** assign.tsx 신규 + 2개 수정

**AssignWorkbookPage** (`apps/web/src/routes/instructor/groups/assign.tsx`, 90줄):
- `getGroup` → 강사 소유 확인
- `listWorkbooks(user.email)` → 강사가 만든 문제집 목록
- `Select` 컴포넌트로 문제집 선택 → `assignWorkbook` 호출 → 상세 페이지로 이동
- 문제집 없음 빈 상태 UI + 문제집 만들기 링크

**_layout.tsx** 업데이트:
- `instructorNavItems`: `/instructor/students` + `'학생관리'` → `/instructor/groups` + `'반관리'`

**main.tsx** 업데이트:
- 4개 import 추가 (GroupListPage, GroupNewPage, GroupDetailPage, AssignWorkbookPage)
- 4개 Route 등록: `/instructor/groups`, `/instructor/groups/new`, `/instructor/groups/:id/assign`, `/instructor/groups/:id`
- 선언 순서: `new` → `:id/assign` → `:id` (정적 먼저, 동적 나중)

**Commit:** `7659ad7`

## Verification Results

```
✓ groups 디렉터리 4파일: index.tsx, new.tsx, detail.tsx, assign.tsx
✓ 반관리 nav: grep "반관리" apps/web/src/routes/_layout.tsx
✓ 4개 그룹 라우트: grep "instructor/groups" apps/web/src/main.tsx
✓ pnpm --filter web build: ✓ 2518 modules transformed. ✓ built in 3.61s
```

## Deviations from Plan

**main.tsx 선행 수정 발견**

07-03 플랜이 병렬로 실행되어 main.tsx에 이미 `JoinGroupPage`, `GroupReportPage` import와 라우트가 등록되어 있었다. 이 변경을 보존하면서 4개 그룹 관리 라우트를 추가했다. 빌드에 영향 없음.

## Self-Check: PASSED

- `apps/web/src/routes/instructor/groups/index.tsx` — FOUND (74줄)
- `apps/web/src/routes/instructor/groups/new.tsx` — FOUND (87줄)
- `apps/web/src/routes/instructor/groups/detail.tsx` — FOUND (116줄)
- `apps/web/src/routes/instructor/groups/assign.tsx` — FOUND (90줄)
- `apps/web/src/routes/_layout.tsx` — FOUND (반관리 nav 확인)
- `apps/web/src/main.tsx` — FOUND (4개 그룹 라우트 등록 확인)
- 커밋 `a4071ee` — FOUND (Task 1)
- 커밋 `7659ad7` — FOUND (Task 2)
- TypeScript 빌드 성공 — PASSED
