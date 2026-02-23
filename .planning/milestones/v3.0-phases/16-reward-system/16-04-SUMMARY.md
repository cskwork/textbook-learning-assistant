---
phase: 16-reward-system
plan: "04"
subsystem: gamification-integration
tags: [gamification, quiz, xpbar, funmode, react, dexie]
dependency_graph:
  requires:
    - 16-01-SUMMARY.md  # gamification.service.ts, xp-formula.ts, badge-definitions.ts
    - 16-02-SUMMARY.md  # XPBar, XPFloatingText, ComboCounter, LevelUpOverlay, BadgeUnlockOverlay
  provides:
    - QuizPlayer 게이미피케이션 연동 (FunMode 정답 → awardXP + 콤보 + 피드백 UI)
    - QuizPage 오버레이 렌더링 (LevelUpOverlay + BadgeUnlockOverlay)
    - AppShell XPBar 상시 표시 (FunMode 조건부)
  affects:
    - 16-05-SUMMARY.md  # 홈 화면 게이미피케이션 위젯 (별도 plan)
tech_stack:
  patterns:
    - onGamificationResult 콜백 패턴으로 QuizPlayer → QuizPage 이벤트 버블링
    - isFunMode 단일 게이트로 모든 게이미피케이션 로직 조건 분기
    - Dexie useLiveQuery 기반 reactive XPBar 자동 업데이트
key_files:
  modified:
    - apps/web/src/components/quiz/QuizPlayer.tsx
    - apps/web/src/routes/student/quiz/index.tsx
    - apps/web/src/components/layout/AppShell.tsx
decisions:
  - "onGamificationResult 콜백 패턴: QuizPlayer → QuizPage 레벨업/뱃지 이벤트 전달, 오버레이는 페이지 레벨에서 렌더링"
  - "XPBar FocusMode 숨김: 퀴즈 풀기 중 XPBar 미표시로 집중 방해 방지"
  - "question.difficulty는 1|2|3|4|5 필수 타입 — ?? 3 fallback 불필요"
metrics:
  duration: "2분"
  completed_date: "2026-02-23"
  tasks_completed: 2
  files_modified: 3
---

# Phase 16 Plan 04: 퀴즈 플로우 게이미피케이션 연동 + AppShell XPBar 배치 Summary

**한 줄 요약:** QuizPlayer에 awardXP + useCombo 연동 및 XP/콤보 피드백 UI 추가, AppShell에 FunMode 조건부 XPBar 헤더 하단 배치

## 구현된 기능

### Task 1: QuizPlayer + QuizPage 게이미피케이션 연동

**QuizPlayer.tsx 변경:**
- `useCombo`, `useFunMode`, `awardXP`, `updateStreak`, `getBaseXP` import 추가
- `GamificationResult` 인터페이스 export (QuizPage에서 타입 재사용)
- `onGamificationResult?: (result: GamificationResult) => void` prop 추가
- `handleSubmit` 확장: FunMode ON + 정답 시 `comboOnCorrect()` → `awardXP()` → `updateStreak()` → `setXpFloat()` → `onGamificationResult?.()` 순서 실행
- FunMode ON + 오답 시 `comboOnWrong()` 호출로 콤보 리셋
- 렌더링 추가: `<ComboCounter>` (fixed 화면 중앙) + `<XPFloatingText>` (제출 버튼 위)
- FunMode OFF 시 기존 동작 100% 동일 보장

**QuizPage(routes/student/quiz/index.tsx) 변경:**
- `useFunMode`, `LevelUpOverlay`, `BadgeUnlockOverlay`, `BADGE_DEFINITIONS` import 추가
- `levelUpInfo`, `unlockedBadge` 상태 추가
- `handleGamificationResult` 핸들러: 레벨업 시 `setLevelUpInfo`, 뱃지 달성 시 `setUnlockedBadge` (레벨업 동시 발생 시 3초 딜레이)
- `QuizPlayer`에 `onGamificationResult={handleGamificationResult}` prop 전달
- `isFunMode && <LevelUpOverlay ... /> + <BadgeUnlockOverlay ... />` 조건부 렌더링

### Task 2: AppShell에 FunMode 조건부 XPBar 렌더링

**AppShell.tsx 변경:**
- `useFunMode`, `useGamification`, `useAuth`, `XPBar` import 추가
- `isFunMode && !isFocusMode && profile` 조건 하에 XPBar 렌더링
- 위치: `fixed z-[39] top-14 inset-x-0`, 데스크톱 `lg:top-0 lg:left-64` (사이드바 오른쪽)
- XPBar 배경: `bg-background/80 backdrop-blur-sm border-b border-border/10`
- `main` 패딩 조정: FunMode ON 시 `pt-[calc(3.5rem+2.5rem)]` (기존 3.5rem + XPBar 2.5rem)
- 데스크톱 FunMode: `lg:pt-10 lg:pb-0 lg:pl-64`

## 검증 결과

1. `npx tsc --noEmit` — TypeScript 에러 0개
2. `vite build` — 프로덕션 빌드 성공 (5.38s)
3. 청크 사이즈 경고 — 기존 알려진 문제(STATE.md 등록), 이번 변경과 무관

## Deviations from Plan

None - 플랜 그대로 실행됨.

`question.difficulty` 타입 관련: 플랜은 `?? 3` fallback을 제안했으나 `db.ts` 확인 결과 `difficulty: 1 | 2 | 3 | 4 | 5` 필수 타입이므로 fallback 불필요. TypeScript 타입 안전성 향상을 위해 제거.

## Self-Check: PASSED

- [x] `apps/web/src/components/quiz/QuizPlayer.tsx` — 존재 확인
- [x] `apps/web/src/routes/student/quiz/index.tsx` — 존재 확인
- [x] `apps/web/src/components/layout/AppShell.tsx` — 존재 확인
- [x] 커밋 `290ddbf` — feat(16-04): 퀴즈 플로우 게이미피케이션 연동
- [x] 커밋 `bf90cfc` — feat(16-04): AppShell에 FunMode 조건부 XPBar 렌더링
