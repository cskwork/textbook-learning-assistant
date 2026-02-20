---
phase: 07-instructor-portal
plan: "01"
subsystem: data-layer
tags: [dexie, indexeddb, group-management, instructor-portal, service-layer]
dependency_graph:
  requires: [apps/web/src/lib/db.ts@version4]
  provides: [db.ts@version5, group.service.ts]
  affects: [강사 포털 전체 Phase 7 플랜]
tech_stack:
  added: []
  patterns: [Dexie EntityTable version chain, composite index, idempotent seed]
key_files:
  created:
    - apps/web/src/services/group.service.ts
  modified:
    - apps/web/src/lib/db.ts
decisions:
  - "Group/GroupMember/Assignment 인터페이스를 db.ts에 정의 — 서비스 레이어 import 단순화"
  - "inviteCode 유니크 인덱스(&inviteCode) + 생성 루프 재시도 — DB 레벨과 앱 레벨 이중 보장"
  - "[groupId+studentId] 복합 인덱스 — joinGroup 멱등성을 count() 쿼리로 구현"
  - "seedMockStudentData에 groupId 파라미터 추가 — 시드와 동시에 그룹 멤버십 설정"
metrics:
  duration: 121s
  completed: 2026-02-20
  tasks: 2
  files: 2
---

# Phase 7 Plan 01: Dexie version(5) 스키마 확장 + 강사 그룹 관리 서비스 Summary

**One-liner:** Dexie version(5)로 groups/groupMembers/assignments 3개 테이블 추가 + 그룹 CRUD/멤버/과제/시드 함수 11개 서비스 레이어 구축

## What Was Built

Phase 7 강사 포털의 데이터 레이어 기반을 구축했다. 기존 version(4) 체인을 보존하면서 version(5)에 세 테이블을 추가하고, 모든 그룹 관련 비즈니스 로직을 담은 서비스 파일을 생성했다.

### Task 1: Dexie version(5) — groups/groupMembers/assignments 테이블

**파일:** `apps/web/src/lib/db.ts`

- `Group`, `GroupMember`, `Assignment` 인터페이스 추가 (UserSetting 다음)
- `db` Dexie 인스턴스에 `groups`, `groupMembers`, `assignments` EntityTable 3개 추가
- `version(5).stores()` 기존 6개 + 신규 3개 테이블 정의
- 인덱스: `&inviteCode`(유니크), `[groupId+studentId]`(복합)
- 기존 version(1)~(4) 일절 수정 없음

**Commit:** `649af53`

### Task 2: group.service.ts — CRUD + 모의 데이터 시드

**파일:** `apps/web/src/services/group.service.ts` (신규, 147줄)

Export 목록:
- `MOCK_STUDENTS` — 모의 학생 3명 (김민준, 이서연, 박지호)
- `createGroup(instructorId, name)` — 유니크 초대 코드 자동 생성
- `listGroups(instructorId)` — createdAt 역순 정렬
- `getGroup(groupId)` — 단일 조회
- `deleteGroup(groupId)` — 멤버/과제 cascade 삭제
- `findGroupByInviteCode(code)` — toUpperCase() 정규화 후 조회
- `joinGroup(groupId, studentId)` — 멱등 (복합 인덱스 count() 확인)
- `listGroupMembers(groupId)` — 그룹 멤버 목록
- `assignWorkbook(params)` — 과제 배정
- `listAssignments(groupId)` — assignedAt 역순 정렬
- `deleteAssignment(assignmentId)` — 단건 삭제
- `seedMockStudentData(groupId)` — 멱등 시드 + 그룹 멤버 자동 추가

**Commit:** `732754c`

## Verification Results

```
✓ version(5) 추가됨: grep "version(5)" apps/web/src/lib/db.ts
✓ Group/GroupMember/Assignment 인터페이스: grep "interface Group" apps/web/src/lib/db.ts
✓ group.service.ts 존재: ls apps/web/src/services/group.service.ts
✓ pnpm --filter web build: built in 3.57s (에러 없음)
```

## Deviations from Plan

None — 플랜 그대로 실행됨.

## Self-Check: PASSED

- `apps/web/src/lib/db.ts` — FOUND (version(5) 확인)
- `apps/web/src/services/group.service.ts` — FOUND (147줄)
- 커밋 `649af53` — FOUND (db.ts 수정)
- 커밋 `732754c` — FOUND (group.service.ts 신규)
- TypeScript 빌드 성공 — PASSED
