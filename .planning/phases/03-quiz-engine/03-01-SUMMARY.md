---
phase: 03-quiz-engine
plan: 01
subsystem: data-layer
tags: [dexie, indexeddb, quiz-engine, wrong-notes, service-layer]
dependency_graph:
  requires: [02-question-bank/db.ts(version1), dexie@4.x]
  provides: [db.ts(version2), quiz.service.ts, wrongNote.service.ts]
  affects: [03-02-quiz-ui, 03-03-wrong-notes-ui]
tech_stack:
  added: []
  patterns: [Dexie version migration, compound-index upsert, in-memory filter, denormalized WrongNote]
key_files:
  created:
    - apps/web/src/services/quiz.service.ts
    - apps/web/src/services/wrongNote.service.ts
  modified:
    - apps/web/src/lib/db.ts
decisions:
  - "isBookmarked 필드를 WrongNote에 통합 — 별도 bookmarks 테이블 없이 단일 테이블로 처리"
  - "정답 시 isMastered 자동 설정 — 오답노트 재풀이 완료를 수동 버튼 없이도 자동 처리"
  - "submitQuizAttempt에 attemptCount 파라미터 추가 — 오답노트 재풀이 시 N회독 추적 지원"
metrics:
  duration: 99s
  completed: 2026-02-20
  tasks_completed: 2
  files_changed: 3
---

# Phase 3 Plan 01: Dexie version(2) 스키마 확장 + 퀴즈 서비스 레이어 Summary

**One-liner:** Dexie version(2) 스키마 확장(3개 테이블 + 복합 인덱스) + 클라이언트 채점·오답노트 CRUD 서비스 구현

## Completed Tasks

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Dexie version(2) 스키마 확장 | 4b8f371 | apps/web/src/lib/db.ts |
| 2 | quiz.service.ts + wrongNote.service.ts 구현 | 146b929 | apps/web/src/services/quiz.service.ts, apps/web/src/services/wrongNote.service.ts |

## What Was Built

### Task 1: db.ts version(2) 스키마 확장

`apps/web/src/lib/db.ts`에 version(2) 스키마를 추가했다:

- **QuizSession** 인터페이스: studentId, questionId, startedAt, completedAt?, timeSpent?
- **QuizAttempt** 인터페이스: sessionId?(선택적), questionId, studentId, userAnswer, isCorrect, timeSpent, attemptedAt, attemptCount
- **WrongNote** 인터페이스: questionId, studentId, 비정규화 필드(subject/unit/questionCategory), wrongCount, lastWrongAt, addedAt, isMastered, isBookmarked

version(1) 선언은 절대 제거하지 않고 유지했다. version(2) stores에 `[questionId+studentId]` 복합 인덱스를 포함했다.

### Task 2: 서비스 레이어 구현

**quiz.service.ts:**
- `gradeAnswer`: 답 정규화(`trim().replace(/\s+/g, '').toLowerCase()`) 비교 — 객관식/단답형 공통
- `submitQuizAttempt`: 채점 → QuizAttempt 저장 → 오답이면 WrongNote upsert → 정답이면 기존 WrongNote의 isMastered 자동 설정
- `getAttemptCount`: 이전 시도 횟수 조회 (N회독 추적용)

**wrongNote.service.ts:**
- `listWrongNotes`: studentId 기반 목록 조회 + 인메모리 필터(unit/category/mastered) + lastWrongAt 역순 정렬
- `getWrongNoteUnits` / `getWrongNoteCategories`: 필터 드롭다운용 고유 목록 추출
- `markAsMastered`: 완전 학습 처리 (ERRN-04)
- `toggleBookmark`: isBookmarked 토글 — 오답 아닌 순수 북마크도 WrongNote 레코드로 생성 (QUIZ-06)
- `getWrongNote`: 단일 조회 (북마크·완전 학습 상태 확인용)

## Decisions Made

1. **isBookmarked를 WrongNote에 통합:** 별도 Bookmark 테이블 생성 없이 WrongNote의 `isBookmarked: boolean` 필드로 처리. version(2) 테이블 수를 최소화하고, 오답/북마크 두 기능이 같은 questionId를 참조하므로 단일 레코드로 관리가 자연스럽다.

2. **정답 시 isMastered 자동 설정:** `submitQuizAttempt`에서 정답 맞춤 시 기존 WrongNote의 `isMastered`를 true로 자동 설정. 수동 버튼 없이도 오답노트 재풀이 완료가 자동 처리된다.

3. **submitQuizAttempt의 attemptCount 파라미터:** 기본값 1, 오답노트 재풀이 시 호출자가 `getAttemptCount() + 1`을 전달. N회독 추적을 서비스 레이어가 아닌 UI 레이어에서 제어하도록 분리.

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check

### Files exist:
- FOUND: apps/web/src/lib/db.ts
- FOUND: apps/web/src/services/quiz.service.ts
- FOUND: apps/web/src/services/wrongNote.service.ts

### Commits exist:
- FOUND: 4b8f371 (feat(03-01): Dexie version(2) 스키마 확장)
- FOUND: 146b929 (feat(03-01): 퀴즈 채점·오답노트 서비스 레이어 구현)

## Self-Check: PASSED
