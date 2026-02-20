---
phase: 04-workbook-generator
plan: 01
subsystem: database
tags: [dexie, indexeddb, typescript, workbook, crud]

# Dependency graph
requires:
  - phase: 03-quiz-engine
    provides: db.ts version(2) 스키마, quiz.service.ts submitQuizAttempt 패턴
provides:
  - Workbook 인터페이스 (db.ts export)
  - Dexie version(3) workbooks 테이블 스키마
  - workbook.service.ts — 6개 서비스 함수 (CRUD + 필터 쿼리)
affects: [04-02, 04-03, 04-workbook-generator]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Dexie version 업그레이드: version(1), version(2) 유지 + version(3) 신규 테이블 추가 패턴"
    - "인메모리 필터 패턴: db.questions.toArray() 후 Array.filter() 체이닝 (Phase 3 WrongNoteList 패턴 재사용)"
    - "listWorkbooks: where().toArray() 후 인메모리 sort — where().reverse().sortBy() 조합 오류 방지"
    - "questionIds 배열만 저장 — Question 객체 전체 저장 금지 (데이터 중복 방지)"

key-files:
  created:
    - apps/web/src/services/workbook.service.ts
  modified:
    - apps/web/src/lib/db.ts

key-decisions:
  - "listWorkbooks는 where().toArray() 후 인메모리 sort 사용 — Dexie reverse().sortBy() + where() 조합 오류 방지"
  - "getFilterOptions의 filter(Boolean) — unit/questionCategory 빈 문자열 제거"
  - "createWorkbook에서 questionIds만 저장 — Question 객체 전체 저장 금지 (데이터 중복 방지)"

patterns-established:
  - "Dexie version 확장: 이전 버전 선언 유지 + 신규 버전에 기존 테이블 모두 재선언 + 신규 테이블 추가"
  - "서비스 함수: WorkbookFilters 인터페이스 별도 export — UI 컴포넌트에서 직접 import 가능"

requirements-completed: [WKST-01, WKST-02, WKST-03, WKST-04]

# Metrics
duration: 1min
completed: 2026-02-20
---

# Phase 4 Plan 01: Workbook 데이터 레이어 Summary

**Dexie version(3) workbooks 테이블 추가 + 6개 서비스 함수(필터 쿼리/CRUD/옵션 추출)로 DIY 문제집 데이터 레이어 완성**

## Performance

- **Duration:** 1 min
- **Started:** 2026-02-20T12:26:39Z
- **Completed:** 2026-02-20T12:27:50Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Dexie version(3) 스키마 확장 — workbooks 테이블 추가, version(1)/(2) 선언 보존
- Workbook 인터페이스 정의 (studentId, title, filters, questionIds, createdAt 등)
- workbook.service.ts 6개 함수 구현 — getFilteredQuestions, createWorkbook, listWorkbooks, getWorkbook, deleteWorkbook, getFilterOptions
- TypeScript 컴파일 에러 없음 확인

## Task Commits

각 태스크 원자적 커밋:

1. **Task 1: db.ts version(3) 스키마 확장 — Workbook 테이블 추가** - `57f99bc` (feat)
2. **Task 2: workbook.service.ts 생성 — 문제집 CRUD + 필터 쿼리 서비스** - `abc0f72` (feat)

## Files Created/Modified

- `apps/web/src/lib/db.ts` - Workbook 인터페이스 추가 + EntityTable 선언 + version(3).stores() 선언
- `apps/web/src/services/workbook.service.ts` - 6개 서비스 함수 신규 생성

## Decisions Made

- listWorkbooks: Dexie `where().reverse().sortBy()` 조합이 에러를 유발할 수 있으므로 `toArray()` 후 인메모리 `Array.sort()` 사용
- getFilterOptions: `filter(Boolean)` 으로 빈 문자열 unit/questionCategory 제거 — Phase 2에서 unit/questionCategory는 자유 텍스트로 결정됨
- createWorkbook: questionIds 배열만 저장, Question 객체 전체 저장 금지 — 데이터 중복 및 스키마 변경 시 불일치 방지

## Deviations from Plan

없음 — 계획대로 정확히 실행됨.

## Issues Encountered

없음.

## User Setup Required

없음 — 외부 서비스 설정 불필요.

## Next Phase Readiness

- 04-02 (WorkbookCreator UI 컴포넌트)가 즉시 실행 가능
- 04-03 (WorkbookList + WorkbookPlayer)가 이 서비스를 소비할 준비 완료
- workbook.service.ts의 모든 함수가 TypeScript 타입 안전 상태로 export됨

---
*Phase: 04-workbook-generator*
*Completed: 2026-02-20*
