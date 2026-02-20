---
phase: 07-instructor-portal
verified: 2026-02-21T00:30:00Z
status: passed
score: 3/3 success criteria verified
re_verification: false
gaps: []
human_verification:
  - test: "강사 반 생성 + 초대 코드 확인 (INST-01, INST-02)"
    expected: "6자리 초대 코드가 표시되고 학생이 해당 코드로 반에 가입할 수 있다"
    why_human: "사용자 승인 완료 (07-04-SUMMARY.md — 시나리오 1, 4 통과 기록)"
  - test: "과제 배정 플로우 (INST-03)"
    expected: "강사가 문제집을 선택하여 반에 배정하면 반 상세 페이지 과제 목록에 표시된다"
    why_human: "사용자 승인 완료 (07-04-SUMMARY.md — 시나리오 3 통과 기록)"
  - test: "그룹 리포트 취약 유형 표시 (INST-04, INST-05)"
    expected: "학생별 풀이 수, 정답률, 학습시간, 취약 유형 3개가 리포트 페이지에 표시된다"
    why_human: "사용자 승인 완료 (07-04-SUMMARY.md — 시나리오 2 통과 기록)"
---

# Phase 7: 강사 관리 포털 Verification Report

**Phase Goal:** 강사가 학생 그룹(반)을 만들고, 과제를 출제하며, 학생별 학습 리포트를 조회할 수 있다
**Verified:** 2026-02-21T00:30:00Z
**Status:** PASSED
**Re-verification:** No — 초기 검증

## Goal Achievement

### Observable Truths (Success Criteria from ROADMAP.md)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | 강사가 학생 그룹(반)을 생성하고 초대 코드로 학생을 초대할 수 있다 | VERIFIED | `groups/new.tsx` — createGroup 호출 후 inviteCode 표시; `join-group/index.tsx` — findGroupByInviteCode+joinGroup 완전 구현 |
| 2 | 강사가 DIY 문제집을 과제로 그룹에 배정할 수 있다 | VERIFIED | `groups/assign.tsx` — listWorkbooks+assignWorkbook 완전 구현; 라우트 `/instructor/groups/:id/assign` 등록 확인 |
| 3 | 강사가 그룹 학생들의 학습 리포트와 학생별 취약 유형 분석 결과를 조회할 수 있다 | VERIFIED | `groups/report.tsx` — getOverallStats+getWeakCategories Promise.all 병렬 집계; 학생별 테이블+취약 유형 Badge 렌더링 구현 |

**Score:** 3/3 truths verified

---

## Required Artifacts

### Plan 07-01 Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `apps/web/src/lib/db.ts` | version(5) + Group/GroupMember/Assignment 인터페이스 + EntityTable 3개 | VERIFIED | 185줄, version(5).stores() 확인, 3개 인터페이스 + EntityTable 3개 (`groups`, `groupMembers`, `assignments`) 정의됨 |
| `apps/web/src/services/group.service.ts` | createGroup/listGroups/getGroup/deleteGroup/findGroupByInviteCode/joinGroup/listGroupMembers/assignWorkbook/listAssignments/deleteAssignment/seedMockStudentData/MOCK_STUDENTS export | VERIFIED | 147줄, 12개 export 전체 확인 (MOCK_STUDENTS 포함) |

### Plan 07-02 Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `apps/web/src/routes/instructor/groups/index.tsx` | GroupListPage — 그룹 목록 + 생성 버튼 | VERIFIED | 77줄, useLiveQuery로 instructorId 기준 실시간 그룹 목록 표시 |
| `apps/web/src/routes/instructor/groups/new.tsx` | GroupNewPage — 그룹 이름 입력 폼 + 생성 후 초대 코드 표시 | VERIFIED | 97줄, createGroup+getGroup 호출, inviteCode Badge 표시 |
| `apps/web/src/routes/instructor/groups/detail.tsx` | GroupDetailPage — 멤버 목록 + 과제 목록 + 모의 데이터 시드 버튼 | VERIFIED | 164줄, 멤버/과제/시드/삭제 모두 구현 |
| `apps/web/src/routes/instructor/groups/assign.tsx` | AssignWorkbookPage — 강사 문제집 선택 + 배정 | VERIFIED | 119줄, listWorkbooks+assignWorkbook 완전 구현 |
| `apps/web/src/routes/_layout.tsx` | instructorNavItems `/instructor/groups` + `반관리` | VERIFIED | `{ path: '/instructor/groups', label: '반관리', icon: Users }` 확인 |
| `apps/web/src/main.tsx` | 4개 그룹 라우트 등록 | VERIFIED | `/instructor/groups`, `/instructor/groups/new`, `/instructor/groups/:id/assign`, `/instructor/groups/:id` 등록 확인 |

### Plan 07-03 Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `apps/web/src/routes/student/join-group/index.tsx` | JoinGroupPage — 초대 코드 입력 + 그룹 가입 | VERIFIED | 87줄, findGroupByInviteCode+joinGroup, 대소문자 무관 처리(toUpperCase) 구현 |
| `apps/web/src/routes/instructor/groups/report.tsx` | GroupReportPage — 학생별 통계 테이블 + 취약 유형 | VERIFIED | 186줄, Promise.all 병렬 집계, 취약 유형 Badge, 요약 통계 카드 3종 구현 |

### Plan 07-04 Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `apps/web/src/routes/instructor/index.tsx` | InstructorHomePage — 실데이터 통계 카드 (groupCount, problemCount, recentGroups) | VERIFIED | 131줄, useLiveQuery 3개 쿼리 (groupCount/problemCount/recentGroups), animate-pulse 없음 |
| `apps/web/src/routes/student/index.tsx` | StudentHomePage — `반 참여` 버튼 추가 | VERIFIED | 264줄, `/student/join-group` 링크 버튼 Line 226 확인 |

---

## Key Link Verification

### Plan 07-01 Key Links

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `group.service.ts` | `db.ts` | `import { db, type Group, type GroupMember, type Assignment, type QuizAttempt } from '@/lib/db'` | WIRED | Line 3 직접 확인 |
| `group.service.ts` | `db.ts` | Group/GroupMember/Assignment 타입 import | WIRED | 동일 import 문에서 4개 타입 import 확인 |

### Plan 07-02 Key Links

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `groups/index.tsx` | `group.service.ts` | useLiveQuery + db.groups 직접 쿼리 | WIRED | useLiveQuery 및 `db.groups.where('instructorId')` 확인 (직접 db import 패턴) |
| `groups/detail.tsx` | `group.service.ts` | listGroupMembers, listAssignments, seedMockStudentData import | WIRED | Line 12-14: 6개 함수 + MOCK_STUDENTS import 확인 |
| `groups/assign.tsx` | `group.service.ts` | assignWorkbook, getGroup import | WIRED | Line 18: `assignWorkbook, getGroup` import + handleSubmit에서 실제 호출 확인 |
| `groups/assign.tsx` | `workbook.service.ts` | listWorkbooks import | WIRED | Line 19: `listWorkbooks` import + useEffect에서 `listWorkbooks(user.email)` 호출 확인 |

### Plan 07-03 Key Links

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `join-group/index.tsx` | `group.service.ts` | findGroupByInviteCode, joinGroup import | WIRED | Line 12: import 확인, handleSubmit에서 순서대로 호출 확인 |
| `groups/report.tsx` | `analytics.service.ts` | getOverallStats, getWeakCategories import | WIRED | Line 14: import 확인, Promise.all에서 병렬 호출 확인 |
| `groups/report.tsx` | `group.service.ts` | listGroupMembers, MOCK_STUDENTS import | WIRED | Line 13: import 확인, 실제 사용 확인 |

### Plan 07-04 Key Links

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `instructor/index.tsx` | `db.ts` | useLiveQuery — db.groups.where('instructorId').count() 등 | WIRED | Line 18-36: 3개 useLiveQuery 쿼리 확인 |
| `student/index.tsx` | `/student/join-group` | Link to="/student/join-group" | WIRED | Line 226: `<Link to="/student/join-group">` 확인 |

---

## Requirements Coverage

| Requirement | Source Plans | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| INST-01 | 07-01, 07-02, 07-04 | 강사가 학생 그룹(반)을 생성·관리할 수 있다 | SATISFIED | `groups/index.tsx` 목록, `groups/new.tsx` 생성, `groups/detail.tsx` 상세+삭제, `instructor/index.tsx` 실데이터 카드 |
| INST-02 | 07-01, 07-02, 07-03, 07-04 | 강사가 학생을 그룹에 초대(초대 코드)할 수 있다 | SATISFIED | `groups/new.tsx` inviteCode 생성+표시, `join-group/index.tsx` 학생 가입 플로우, `student/index.tsx` 반 참여 버튼 |
| INST-03 | 07-01, 07-02, 07-03 | 강사가 DIY 문제집으로 과제를 출제하여 그룹에 배정할 수 있다 | SATISFIED | `assignWorkbook()` 서비스 함수, `groups/assign.tsx` 배정 UI, `groups/detail.tsx` 과제 목록 표시 |
| INST-04 | 07-03, 07-04 | 강사가 그룹 학생들의 학습 리포트를 조회할 수 있다 | SATISFIED | `groups/report.tsx` 학생별 통계(풀이 수, 정답률, 학습시간) 테이블 + 요약 통계 카드 3종 |
| INST-05 | 07-03, 07-04 | 강사가 학생별 취약 유형 분석 결과를 볼 수 있다 | SATISFIED | `groups/report.tsx` — `getWeakCategories` 상위 3개를 `<Badge>` 로 표시 |

**REQUIREMENTS.md 확인:** INST-01~INST-05 모두 Phase 7 완료 표시됨. 플랜 declared 요구사항과 REQUIREMENTS.md 간 불일치 없음.

---

## Anti-Patterns Found

| File | Pattern | Severity | Assessment |
|------|---------|----------|------------|
| `groups/report.tsx:70` | `return null` | Info | 적절한 null-guard — 권한 미충족 시 navigate 후 null 반환 (실질적 플레이스홀더 아님) |
| `groups/assign.tsx:95` | `placeholder="과제로 배정할..."` | Info | HTML Input placeholder — 코드 스텁 아님 |
| `groups/new.tsx:80` | `placeholder="예: 2025..."` | Info | HTML Input placeholder — 코드 스텁 아님 |

**블로커 anti-pattern 없음.** 모든 패턴은 정상 UI 텍스트 또는 적절한 null-guard임.

---

## Human Verification Results

Phase 7 Plan 04의 Task 2(체크포인트)에서 사용자가 직접 브라우저 검증 후 "approved" 승인 완료.

07-04-SUMMARY.md 기록:
- 시나리오 1: 강사 반 생성 + 초대 코드 확인 (INST-01, INST-02) — 통과
- 시나리오 2: 모의 학생 데이터 시드 + 리포트 (INST-04, INST-05) — 통과
- 시나리오 3: 과제 배정 (INST-03) — 통과
- 시나리오 4: 학생 반 참여 (INST-02) — 통과
- 시나리오 5: 강사 홈 실데이터 — 통과

---

## TypeScript Build

```
pnpm --filter web build
✓ 2518 modules transformed.
✓ built in 4.72s
```

빌드 에러 없음.

---

## Gaps Summary

갭 없음. 모든 must-haves가 충족되었다.

- db.ts version(5): 3개 테이블(groups/groupMembers/assignments) + 인터페이스 + EntityTable 완전 구현
- group.service.ts: 12개 export (11개 함수 + MOCK_STUDENTS 상수) 완전 구현
- UI 라우트 6개: GroupListPage/GroupNewPage/GroupDetailPage/AssignWorkbookPage/JoinGroupPage/GroupReportPage 실체 있고 연결됨
- 네비게이션: `반관리` nav item `/instructor/groups` 정상 등록
- 라우트 등록: main.tsx 6개 신규 라우트 등록, 순서 올바름 (static > dynamic)
- 강사 홈: animate-pulse 스켈레톤 제거, useLiveQuery 실데이터 완전 대체
- 학생 홈: 반 참여 버튼(/student/join-group) 추가됨
- 사용자 검증: INST-01~INST-05 5개 시나리오 모두 "approved"

---

_Verified: 2026-02-21T00:30:00Z_
_Verifier: Claude (gsd-verifier)_
