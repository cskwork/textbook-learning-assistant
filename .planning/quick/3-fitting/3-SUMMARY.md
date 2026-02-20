---
phase: quick
plan: 3
subsystem: ui-layout
tags: [layout, responsive, consistency, mypage]
key-files:
  modified:
    - apps/web/src/routes/student/profile/index.tsx
    - apps/web/src/routes/instructor/profile/index.tsx
decisions:
  - "마이페이지 래퍼 max-w-3xl 채택 — 폼 기반 레이아웃에 max-w-6xl 과도, max-w-2xl 너무 좁음"
metrics:
  duration: 40s
  completed: 2026-02-21
  tasks: 1
  files: 2
---

# Quick Task 3: 마이페이지 래퍼 레이아웃 통일 Summary

**One-liner:** 학생/강사 마이페이지 루트 래퍼를 반응형 패딩(p-4/md:p-6/lg:p-8) + max-w-3xl + space-y-5로 통일하여 다른 페이지와 시각적 일관성 확보

## What Was Done

두 마이페이지 파일의 루트 래퍼 `<div>` className을 수정했습니다.

**변경 내용:**

| 항목 | 변경 전 | 변경 후 |
|------|---------|---------|
| 패딩 | `px-4 py-6` (비반응형) | `p-4 md:p-6 lg:p-8` (반응형) |
| 최대 너비 | `max-w-2xl` (672px) | `max-w-3xl` (768px) |
| 수직 간격 | `space-y-6` | `space-y-5` |

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | 학생/강사 마이페이지 래퍼 className 통일 | 6ab5482 | student/profile/index.tsx, instructor/profile/index.tsx |

## Verification

- pnpm --filter web build 성공 (4.79s)
- `student/profile/index.tsx` line 87: `p-4 md:p-6 lg:p-8 max-w-3xl mx-auto space-y-5` 확인
- `instructor/profile/index.tsx` line 91: `p-4 md:p-6 lg:p-8 max-w-3xl mx-auto space-y-5` 확인

## Deviations from Plan

없음 — 플랜대로 정확히 실행됨.

## Self-Check: PASSED

- [x] `apps/web/src/routes/student/profile/index.tsx` 수정 완료
- [x] `apps/web/src/routes/instructor/profile/index.tsx` 수정 완료
- [x] 커밋 6ab5482 존재
- [x] 빌드 성공
