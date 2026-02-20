---
phase: 07-instructor-portal
plan: "03"
subsystem: ui-pages
tags: [student-join-group, group-report, analytics, instructor-portal]
dependency_graph:
  requires: [group.service.ts, analytics.service.ts, db.ts@version5]
  provides: [JoinGroupPage, GroupReportPage]
  affects: [main.tsx, 강사 포털 학습 리포트 기능]
tech_stack:
  added: []
  patterns: [Promise.all 병렬 집계, analytics.service 재사용, MOCK_STUDENTS 이름 매핑]
key_files:
  created:
    - apps/web/src/routes/student/join-group/index.tsx
    - apps/web/src/routes/instructor/groups/report.tsx
  modified:
    - apps/web/src/main.tsx
decisions:
  - "analytics.service.ts 수정 없이 studentId 파라미터로 재사용 — getOverallStats/getWeakCategories 함수 시그니처 그대로 활용"
  - "GroupReportPage useEffect에서 Promise.all로 멤버별 통계 병렬 집계 — N명 학생 데이터를 동시에 로드"
  - "/instructor/groups/:id/report 라우트는 07-02 그룹 라우트 없이도 독립 등록 — 07-02 실행 후 동일 :id 패턴으로 자연스럽게 통합"
metrics:
  duration: 136s
  completed: 2026-02-20
  tasks: 2
  files: 3
---

# Phase 7 Plan 03: 학생 그룹 참여 UI + 강사 그룹 학습 리포트 Summary

**One-liner:** 6자리 초대 코드 기반 그룹 참여 UI + 멤버별 풀이 통계·취약 유형 집계 리포트 페이지 구축 (analytics.service.ts 무수정 재사용)

## What Was Built

Phase 7 강사 포털의 학생 사이드와 강사 리포트 UI를 구축했다. 학생은 초대 코드를 입력해 반에 가입하고, 강사는 반 멤버 전체의 학습 통계를 한눈에 확인할 수 있다.

### Task 1: JoinGroupPage + GroupReportPage 생성

**파일:** `apps/web/src/routes/student/join-group/index.tsx` (75줄)

- 6자리 초대 코드 입력 필드 (font-mono + tracking-widest + text-center)
- 입력값 자동 대문자 변환 (`toUpperCase()`) — 대소문자 무관 처리
- `findGroupByInviteCode` → `joinGroup` 순서로 가입 처리
- 성공 시 그룹 이름 표시 + 홈으로 이동 버튼, 실패 시 한국어 오류 메시지

**파일:** `apps/web/src/routes/instructor/groups/report.tsx` (146줄)

- `getGroup` 권한 확인 (instructorId !== user.email 시 목록으로 리다이렉트)
- `listGroupMembers` → `Promise.all(getOverallStats + getWeakCategories)` 병렬 집계
- `MOCK_STUDENTS.find(s => s.email === m.studentId)?.name` 이름 표시
- 요약 통계 카드 3개 (학생 수, 평균 정답률, 총 풀이 수)
- 학생별 테이블: 이름/이메일, 총 풀이, 정답률(색상 분기), 학습시간, 취약 유형 Badge
- 빈 상태 UI: 모의 학생 추가 안내

**Commit:** `7b35760`

### Task 2: main.tsx 라우트 등록

**파일:** `apps/web/src/main.tsx`

- `JoinGroupPage` import + `/student/join-group` 라우트 추가
- `GroupReportPage` import + `/instructor/groups/:id/report` 라우트 추가
- 07-02 그룹 라우트 미등록 상태에서도 독립 동작 가능하도록 구성

**Commit:** `1477c13`

## Verification Results

```
빌드 검증:
✓ pnpm --filter web build: built in 3.65s (에러 없음)

라우트 확인:
✓ /student/join-group → JoinGroupPage 등록 확인
✓ /instructor/groups/:id/report → GroupReportPage 등록 확인

파일 존재 확인:
✓ apps/web/src/routes/student/join-group/index.tsx — FOUND (75줄)
✓ apps/web/src/routes/instructor/groups/report.tsx — FOUND (146줄)
```

## Deviations from Plan

### 자동 수정 사항

None.

### 계획 변경 사항

**07-02 라우트 미등록 상태에서 07-03 실행**

07-02 플랜이 아직 실행되지 않아 `/instructor/groups`, `/instructor/groups/new`, `/instructor/groups/:id`, `/instructor/groups/:id/assign` 라우트가 main.tsx에 없는 상태였다. 07-03 플랜은 `depends_on: [07-01]`로 명시되어 있으므로, 07-03 스코프에 해당하는 2개 라우트만 등록했다. 07-02 실행 시 나머지 4개 라우트가 추가된다.

## Self-Check: PASSED

- `apps/web/src/routes/student/join-group/index.tsx` — FOUND
- `apps/web/src/routes/instructor/groups/report.tsx` — FOUND
- `apps/web/src/main.tsx` (join-group + groups/:id/report 등록) — VERIFIED
- 커밋 `7b35760` — FOUND (Task 1)
- 커밋 `1477c13` — FOUND (Task 2)
- TypeScript 빌드 성공 — PASSED
