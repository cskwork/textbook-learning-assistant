---
phase: 04-workbook-generator
plan: 02
subsystem: ui-components
tags: [react, shadcn-ui, dexie, useLiveQuery, react-hook-form, zod, workbook]

# Dependency graph
requires:
  - phase: 04-01
    provides: workbook.service.ts (getFilteredQuestions, createWorkbook, deleteWorkbook, getFilterOptions), Workbook 인터페이스
provides:
  - WorkbookCard 컴포넌트 (문제집 카드 UI)
  - WorkbookList 컴포넌트 (useLiveQuery 반응형 목록)
  - WorkbookCreator 컴포넌트 (2단계 문제집 생성 UI)
affects: [04-03]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "react-hook-form + zod: useForm({ resolver: zodResolver(schema) }) 조합 — Phase 2 QuestionForm 패턴 재사용"
    - "useLiveQuery 반응형 목록: undefined(로딩)/length===0(빈상태)/정상 3단계 분기 — WrongNoteList 패턴 재사용"
    - "2단계 CreatorPhase('setup' | 'preview') 상태 관리 — useState로 단계 전환"
    - "스켈레톤 로딩: animate-pulse h-24 rounded-lg bg-muted — WrongNoteList 패턴 단순화"

key-files:
  created:
    - apps/web/src/components/workbook/WorkbookCard.tsx
    - apps/web/src/components/workbook/WorkbookList.tsx
    - apps/web/src/components/workbook/WorkbookCreator.tsx
  modified: []

key-decisions:
  - "WorkbookCard 삭제 버튼: ghost variant + text-destructive — WrongNoteCard outline 패턴 대신 ghost 사용 (덜 강조)"
  - "WorkbookCreator Select: __all__ 센티넬 값으로 '전체' 선택 처리 — WrongNoteFilter 패턴 재사용"
  - "previewQuestions 내 content 앞 30자만 표시 (LaTeX 미렌더링) — POC에서 미리보기는 텍스트만으로 충분"

patterns-established:
  - "Select 컴포넌트: value='__all__' 센티넬로 전체/선택 전환, onValueChange에서 '__all__' 판별"
  - "2단계 폼 UI: setup 필터 → preview 목록+이름입력 → 저장, 각 단계가 독립 JSX 반환"

requirements-completed: [WKST-01, WKST-02, WKST-03]

# Metrics
duration: 132s
completed: 2026-02-20
---

# Phase 4 Plan 02: Workbook UI 컴포넌트 Summary

**WorkbookCreator(setup/preview 2단계 필터+저장 UI) + WorkbookCard(카드) + WorkbookList(useLiveQuery 반응형 목록) 3개 컴포넌트로 DIY 문제집 생성 UI 레이어 완성**

## Performance

- **Duration:** 132s (~2분 12초)
- **Started:** 2026-02-20T12:30:56Z
- **Completed:** 2026-02-20T12:33:08Z
- **Tasks:** 2
- **Files modified:** 3 (신규 생성)

## Accomplishments

- WorkbookCard.tsx 구현: 제목, 문제수 뱃지, 과목/단원 필터 뱃지, 생성일/마지막풀이일, 풀기/삭제 버튼
- WorkbookList.tsx 구현: useLiveQuery 반응형 구독, 로딩 스켈레톤/빈상태/목록 3단계 분기, deleteWorkbook 연동
- WorkbookCreator.tsx 구현: setup→preview 2단계 전환, 5종 필터 Select, 0개 에러/수부족 경고, react-hook-form+zod 이름 유효성, createWorkbook() 호출
- TypeScript 컴파일 에러 없음 확인

## Task Commits

각 태스크 원자적 커밋:

1. **Task 1: WorkbookCard + WorkbookList 컴포넌트** - `2858de4` (feat)
2. **Task 2: WorkbookCreator 2단계 문제집 생성 UI** - `70b7453` (feat)

## Files Created/Modified

- `apps/web/src/components/workbook/WorkbookCard.tsx` - 문제집 카드 UI 컴포넌트 (신규)
- `apps/web/src/components/workbook/WorkbookList.tsx` - useLiveQuery 반응형 목록 컴포넌트 (신규)
- `apps/web/src/components/workbook/WorkbookCreator.tsx` - 2단계 문제집 생성 UI 컴포넌트 (신규, 353줄)

## Decisions Made

- WorkbookCard 삭제 버튼: `ghost` variant + `text-destructive` 클래스 사용 — WrongNoteCard의 `outline` 패턴과 달리 덜 강조되는 스타일 채택
- WorkbookCreator Select의 전체 선택: `__all__` 센티넬 값 방식 — WrongNoteFilter 기존 패턴 그대로 재사용
- previewQuestions 내 content 앞 30자만 표시: LaTeX 미렌더링 텍스트로 충분 (POC)

## Deviations from Plan

없음 — 계획대로 정확히 실행됨.

## Issues Encountered

없음.

## User Setup Required

없음 — 외부 서비스 설정 불필요.

## Next Phase Readiness

- 04-03 (WorkbookPlayer + 라우트 통합)이 즉시 실행 가능
- WorkbookCreator/WorkbookList가 studentId + onPlay/onCreated Props로 04-03 라우트에서 조합 가능
- 3개 컴포넌트 모두 TypeScript 타입 안전 상태

---
*Phase: 04-workbook-generator*
*Completed: 2026-02-20*
