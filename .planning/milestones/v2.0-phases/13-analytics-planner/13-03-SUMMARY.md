---
phase: 13-analytics-planner
plan: "03"
subsystem: data-layer
tags: [dexie, planner, notification, indexeddb, service-layer]
dependency_graph:
  requires: []
  provides: [studyPlans-table, studyTasks-table, planner-service, notification-service]
  affects: [13-04-planner-ui]
tech_stack:
  added: []
  patterns: [dexie-version-migration, bulkAdd-pattern, upsert-pattern, setInterval-cleanup]
key_files:
  modified:
    - apps/web/src/lib/db.ts
  created:
    - apps/web/src/services/planner.service.ts
    - apps/web/src/services/notification.service.ts
decisions:
  - "Dexie version(7) 패턴: 기존 version(1)~(6) 무수정 + 신규 테이블 추가 (studyPlans, studyTasks)"
  - "UserSetting 확장: weeklyGoal/subjectTimeAllocation/notificationEnabled/notificationTime 인덱스 없는 선택 필드 추가 — version 업 없이 TypeScript 인터페이스만 확장"
  - "planner.service.ts: getPlanTasks 추가(11번째 함수) — 플랜 UI가 태스크 목록 조회 시 반드시 필요한 기능"
  - "notification.service.ts: scheduleNotificationCheck에 lastFired 중복 방지 로직 추가 — 같은 분에 여러 번 발동하는 setInterval 버그 예방"
metrics:
  duration: 177
  completed_date: "2026-02-21"
  tasks_completed: 2
  files_changed: 3
---

# Phase 13 Plan 03: 학습 플래너 데이터 레이어 Summary

**One-liner:** Dexie version(7) studyPlans/studyTasks 스키마 + 플래너 CRUD 서비스(11개 함수) + 브라우저 Notification API 래퍼(4개 함수)

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Dexie version(7) 스키마 확장 + StudyPlan/StudyTask 인터페이스 | 9a1f26d | apps/web/src/lib/db.ts |
| 2 | planner.service.ts + notification.service.ts 생성 | e94ad2e | apps/web/src/services/planner.service.ts, apps/web/src/services/notification.service.ts |

## What Was Built

### Task 1: db.ts 스키마 확장

**StudyPlan 인터페이스** (일간/주간 학습 계획):
- `studentId`, `date`(YYYY-MM-DD), `type`('daily'|'weekly')
- `weekStartDate`(주간 플랜용 월요일 날짜), `targetCount`
- `createdAt`, `updatedAt`

**StudyTask 인터페이스** (플랜 내 개별 할 일):
- `planId`, `studentId`, `title`, `subject?`
- `targetCount`, `completedCount`, `isCompleted`, `order`
- `createdAt`, `completedAt?`

**UserSetting 확장** (인덱스 없는 선택 필드 — version 변경 불필요):
- `weeklyGoal?: number` — 주간 목표 문제 수 (기본: 50)
- `subjectTimeAllocation?: Record<string, number>` — 과목별 시간 배분
- `notificationEnabled?: boolean`, `notificationTime?: string`

**Dexie version(7)**:
- `studyPlans: '++id, studentId, date, type, [studentId+date]'` — 복합 인덱스 포함
- `studyTasks: '++id, planId, studentId, isCompleted, order'`
- 기존 9개 테이블 모두 재선언 (Dexie 마이그레이션 패턴)

### Task 2: 서비스 파일 2개 신규 생성

**planner.service.ts** (297줄, 11개 함수):
1. `getTodayPlan(studentId)` — [studentId+date] 복합 인덱스 활용
2. `getWeekPlan(studentId, weekStartDate)` — weekStartDate 기준 필터
3. `createDailyPlan(studentId, targetCount, tasks)` — bulkAdd 패턴
4. `createWeeklyPlan(studentId, targetCount, tasks)` — getThisWeekMonday() 내부 사용
5. `toggleTask(taskId)` — isCompleted 토글 + completedAt 자동 설정
6. `updateTaskProgress(taskId, completedCount)` — 자동 완료 처리
7. `getPlanProgress(planId)` — { total, completed, percent } 반환
8. `getWeeklyScheduleSettings(userId)` — 기본값 포함 설정 읽기
9. `saveWeeklyScheduleSettings(userId, settings)` — upsert 패턴
10. `getThisWeekMonday()` — 로컬 타임존 월요일 계산 헬퍼
11. `getPlanTasks(planId)` — order 정렬 태스크 목록 조회

**notification.service.ts** (106줄, 4개 함수):
1. `requestNotificationPermission()` — 브라우저 미지원 시 'denied' 반환
2. `sendStudyReminder(title, body)` — tag='study-reminder' 중복 방지
3. `checkAndNotify(studentId)` — 플랜 미완료 시 리마인더 자동 발송
4. `scheduleNotificationCheck(studentId, timeStr)` — setInterval + lastFired 중복 방지 + cleanup 반환

## Verification

- `pnpm --filter web build` TypeScript 0 에러, Vite 프로덕션 빌드 성공
- db.ts version(7) studyPlans + studyTasks 테이블 확인
- UserSetting weeklyGoal/subjectTimeAllocation/notificationEnabled/notificationTime 필드 확인
- planner.service.ts 11개 함수 (297줄)
- notification.service.ts 4개 함수 (106줄)

## Deviations from Plan

### Auto-added Missing Functionality

**1. [Rule 2 - Missing] getPlanTasks 함수 추가**
- **Found during:** Task 2
- **Issue:** 플래너 UI가 특정 플랜의 태스크 목록을 조회하는 함수가 필요하나 플랜에 없었음. order 정렬 조회는 Phase 13 Plan 04 UI에서 필수적
- **Fix:** `getPlanTasks(planId)` 함수 추가 — `db.studyTasks.where('planId').equals(planId).sortBy('order')`
- **Files modified:** apps/web/src/services/planner.service.ts

**2. [Rule 1 - Bug] scheduleNotificationCheck lastFired 중복 방지**
- **Found during:** Task 2
- **Issue:** setInterval 60초마다 실행 시 같은 분(HH:mm) 내 여러 번 발동 가능 — 동일 알림 중복 발송
- **Fix:** `lastFired` 변수로 이미 발송한 분을 추적하여 중복 방지
- **Files modified:** apps/web/src/services/notification.service.ts

## Self-Check: PASSED

- FOUND: apps/web/src/lib/db.ts
- FOUND: apps/web/src/services/planner.service.ts
- FOUND: apps/web/src/services/notification.service.ts
- FOUND: commit 9a1f26d (Task 1)
- FOUND: commit e94ad2e (Task 2)
