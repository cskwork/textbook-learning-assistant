---
phase: 03-quiz-engine
plan: 04
subsystem: wrong-notes-ui
tags: [wrong-notes, dexie, useLiveQuery, react, shadcn]
dependency_graph:
  requires: [03-01/wrongNote.service.ts, 03-01/db.ts(WrongNote), dexie-react-hooks]
  provides: [WrongNoteFilter, WrongNoteCard, WrongNoteList, WrongNotesPage, /student/wrong-notes route]
  affects: [main.tsx]
tech_stack:
  added: []
  patterns: [useLiveQuery reactive subscription, in-memory filter, skeleton loading, shadcn Select/Badge/Card]
key_files:
  created:
    - apps/web/src/components/wrong-notes/WrongNoteFilter.tsx
    - apps/web/src/components/wrong-notes/WrongNoteCard.tsx
    - apps/web/src/components/wrong-notes/WrongNoteList.tsx
    - apps/web/src/routes/student/wrong-notes/index.tsx
  modified:
    - apps/web/src/main.tsx
decisions:
  - "WrongNoteFilter useEffect에서 getWrongNoteUnits/Categories 비동기 로드 — 필터 옵션은 현재 studentId 기준 실시간 반영"
  - "lastWrongAt > 0 조건으로 순수 북마크(wrongCount=0, lastWrongAt=0) 날짜 표시 생략 — 잘못된 날짜 노출 방지"
metrics:
  duration: 116s
  completed: 2026-02-20
  tasks_completed: 2
  files_changed: 5
---

# Phase 3 Plan 04: 오답노트 UI 컴포넌트 + 페이지 Summary

**One-liner:** useLiveQuery 반응형 오답노트 UI — 필터 드롭다운 + 카드 + 목록 + WrongNotesPage 라우트 등록

## Completed Tasks

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | WrongNoteFilter + WrongNoteCard + WrongNoteList 컴포넌트 | e3d0171 | WrongNoteFilter.tsx, WrongNoteCard.tsx, WrongNoteList.tsx |
| 2 | 오답노트 페이지 + main.tsx 라우트 교체 | 2adbe1d | routes/student/wrong-notes/index.tsx, main.tsx |

## What Was Built

### Task 1: 오답노트 3개 컴포넌트

**WrongNoteFilter.tsx:**
- `studentId` 기반으로 `getWrongNoteUnits` / `getWrongNoteCategories` 비동기 로드 (useEffect)
- 단원 셀렉트 + 유형 셀렉트를 flex로 나란히 배치 (shadcn Select)
- `'__all__'` sentinel 값으로 "전체" 옵션 처리 — `undefined`로 변환해 상위 전달

**WrongNoteCard.tsx:**
- 과목/단원/유형 Badge 행 + isBookmarked 시 Bookmark 아이콘 표시
- XCircle 아이콘 + `${wrongCount}회 틀림` + `lastWrongAt` 날짜 (lastWrongAt > 0 조건)
- '다시 풀기' 버튼 (RotateCcw, default variant) → `onRetry(wrongNote.questionId)`
- '완전 학습' 버튼 (CheckCircle2, outline variant) → `window.confirm` 확인 후 `onMastered(wrongNote.id)`

**WrongNoteList.tsx:**
- `useLiveQuery(async () => {...}, [studentId, filterUnit, filterCategory])` — IndexedDB 변경 시 자동 리렌더
- `!n.isMastered` 필터로 완전 학습 항목 제외
- `filterUnit` / `filterCategory` 인메모리 필터 + `lastWrongAt` 역순 정렬
- `undefined` 상태: 스켈레톤 카드 3개
- 빈 배열: "오답노트가 비어있습니다. 계속 열심히 학습하세요!" 안내
- `onMastered={(id) => markAsMastered(id)}` — useLiveQuery가 자동으로 리렌더

### Task 2: WrongNotesPage + main.tsx 라우트 등록

**routes/student/wrong-notes/index.tsx:**
- `useAuth()` → `user.email`을 `studentId`로 사용
- `filterUnit` / `filterCategory` 로컬 state
- `handleRetry(questionId)` → `navigate('/student/quiz/${questionId}')`
- WrongNoteFilter + WrongNoteList 조합 렌더링

**main.tsx:**
- `WrongNotesPage` import 추가 (03-03이 이미 StudentProblemsPage, QuizPage를 추가한 상태에서 빌드)
- `/student/wrong-notes` 라우트: `ComingSoonPage` → `WrongNotesPage` 교체

## Decisions Made

1. **WrongNoteFilter 비동기 로드:** `useEffect`로 마운트 시 단원/유형 옵션을 로드. useLiveQuery를 쓰지 않은 이유는 필터 옵션 목록이 실시간 변경보다는 페이지 진입 시 스냅샷으로 충분하기 때문이다. (옵션 목록이 변경되면 사용자가 페이지를 재방문하면 된다.)

2. **lastWrongAt > 0 조건:** 순수 북마크 레코드(wrongCount=0, lastWrongAt=0)는 날짜 표시를 생략한다. `1970-01-01` 같은 잘못된 날짜가 노출되는 것을 방지.

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check

### Files exist:
- FOUND: apps/web/src/components/wrong-notes/WrongNoteFilter.tsx
- FOUND: apps/web/src/components/wrong-notes/WrongNoteCard.tsx
- FOUND: apps/web/src/components/wrong-notes/WrongNoteList.tsx
- FOUND: apps/web/src/routes/student/wrong-notes/index.tsx

### Commits exist:
- FOUND: e3d0171 (feat(03-04): WrongNoteFilter + WrongNoteCard + WrongNoteList 컴포넌트)
- FOUND: 2adbe1d (feat(03-04): 오답노트 페이지 + main.tsx 라우트 교체)

## Self-Check: PASSED
