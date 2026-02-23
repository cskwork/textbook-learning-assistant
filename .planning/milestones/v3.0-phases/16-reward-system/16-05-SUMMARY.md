---
phase: 16-reward-system
plan: "05"
subsystem: gamification-ui-integration
tags: [gamification, home-page, profile-page, fun-mode, badges, leaderboard, streak, challenge]
dependency_graph:
  requires:
    - 16-01 (게이미피케이션 비즈니스 로직 + XP/뱃지 서비스)
    - 16-02 (XPBar/ComboCounter/LevelUpOverlay/BadgeUnlockOverlay UI 컴포넌트)
    - 16-03 (StreakCounter/Leaderboard/DailyChallenge/WeeklyChallenge UI 컴포넌트)
  provides:
    - 홈 화면 게이미피케이션 위젯 4종 통합 (FunMode 조건부)
    - 프로필 뱃지 패널 (FunMode 조건부)
  affects:
    - apps/web/src/routes/student/index.tsx
    - apps/web/src/routes/student/profile/index.tsx
tech_stack:
  added: []
  patterns:
    - useFunMode() 조건부 섹션 렌더링
    - useLiveQuery studentGroupId 자동 조회
    - BADGE_DEFINITIONS 정적 import 카테고리 필터링
    - allBadges Set 기반 획득/미획득 구분
key_files:
  created: []
  modified:
    - apps/web/src/routes/student/index.tsx
    - apps/web/src/routes/student/profile/index.tsx
decisions:
  - "studentGroupId useLiveQuery undefined 처리: ?? null 을 사용하여 Leaderboard groupId?: number | null 타입에 안전하게 전달"
  - "StreakCounter bonusXP=0: 홈 화면에서는 스트릭 일수만 표시, 실시간 보너스는 퀴즈 세션에서 담당 (Phase 19)"
  - "handleStartDailyChallenge: Phase 19 챌린지 모드 구현 전까지 /student/problems로 리디렉션"
metrics:
  duration: "3 minutes"
  completed: "2026-02-23"
  tasks_completed: 2
  files_modified: 2
---

# Phase 16 Plan 05: 홈 화면 게이미피케이션 위젯 + 프로필 뱃지 패널 Summary

FunMode 게이미피케이션 위젯 4종을 학생 홈 화면에 배치하고, 마이페이지에 뱃지 패널을 추가하여 사용자가 게이미피케이션 현황(스트릭/챌린지/리더보드/뱃지)을 한눈에 확인할 수 있도록 통합 완료.

## Tasks Completed

### Task 1: 학생 홈 화면에 게이미피케이션 위젯 배치
**Commit:** `0c3a00d`
**Files:** `apps/web/src/routes/student/index.tsx`

- `useFunMode()`, `useGamification()` 훅 import 및 사용
- `useLiveQuery`로 학생 그룹 ID 자동 조회 → Leaderboard에 전달
- `handleStartDailyChallenge`: 문제 목록으로 이동 (Phase 19 챌린지 모드 전 임시)
- FunMode ON + profile 로드 완료 시에만 게이미피케이션 섹션 노출:
  - 스트릭 + 데일리 챌린지 2열 그리드
  - 주간 챌린지 전체 너비
  - 리더보드 전체 너비
- FunMode OFF 시 기존 홈 화면과 100% 동일

### Task 2: 마이페이지 프로필에 뱃지 패널 추가
**Commit:** `1263fd0`
**Files:** `apps/web/src/routes/student/profile/index.tsx`

- `useFunMode()`, `useGamification()` 훅 import 및 사용
- `BADGE_DEFINITIONS` 정적 import + `earnedBadgeIds` Set으로 획득 여부 판별
- 카테고리별(study/streak/achievement) 뱃지 그리드 렌더링
- 레벨/XP/스트릭 요약 바 상단 표시
- 획득 뱃지: 풀 컬러 + rarity 색상 뱃지 / 미획득: grayscale + opacity-40
- FunMode OFF 시 기존 프로필 페이지와 100% 동일

## Verification Results

1. `npx tsc --noEmit` — TypeScript 에러 0개 (두 Task 모두)
2. `npx vite build` — 프로덕션 빌드 성공 (5.44s)
3. RWRD-04: 홈 화면 StreakCounter 표시 — 완료
4. RWRD-05: 홈 화면 DailyChallenge 카드 표시 — 완료
5. RWRD-07: 홈 화면 Leaderboard 표시 — 완료
6. RWRD-08: 홈 화면 WeeklyChallenge 진행 바 표시 — 완료
7. RWRD-06 (프로필): 마이페이지 뱃지 목록 카테고리별 표시 — 완료

## Deviations from Plan

None — 계획대로 정확히 실행됨.

## Self-Check: PASSED

- `apps/web/src/routes/student/index.tsx` — FOUND
- `apps/web/src/routes/student/profile/index.tsx` — FOUND
- Commit `0c3a00d` — FOUND
- Commit `1263fd0` — FOUND
