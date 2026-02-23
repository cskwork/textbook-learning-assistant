---
phase: 16-reward-system
plan: "03"
subsystem: gamification
tags: [leaderboard, daily-challenge, weekly-challenge, framer-motion, dexie, react, ui-components]

# Dependency graph
requires:
  - phase: 16-reward-system
    plan: "01"
    provides: "GamificationService, ChallengeService, useGamification, 뱃지 정의"

provides:
  - "getClassLeaderboard() — GroupMember 기반 반 내 XP 리더보드 조회 (TOP3 + 내 주변 ±2명)"
  - "Leaderboard 컴포넌트 — TOP3 하이라이트 + 내 주변 ±2명 + 빈 상태 처리"
  - "DailyChallenge 컴포넌트 — 오늘의 문제 수 + 완료 상태 + 도전하기 버튼"
  - "WeeklyChallenge 컴포넌트 — 주간 목표 진행 바 + 격려 메시지 + 완료 보너스"
  - "9개 컴포넌트 barrel export (index.ts 완성)"

affects:
  - 17-sound-system (챌린지 완료 시 효과음 연동)
  - 19-gamified-quiz (챌린지 시작 시 onStartChallenge 콜백 연동)
  - 20-full-redesign (홈 화면 리더보드/챌린지 카드 배치)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "getClassLeaderboard 패턴: groupId null → 본인만, groupId 있음 → GroupMember 기반 필터링"
    - "surrounding ±2명 슬라이싱: sorted.slice(myIdx-2, myIdx+3) + top3 중복 제거"
    - "useEffect + setState 패턴: challenge.service 비동기 함수 → useState로 UI 상태 관리"
    - "Framer Motion animate 진행 바: initial={{ width: 0 }} → animate={{ width: progressRatio*100+'%' }}"

key-files:
  created:
    - apps/web/src/components/gamification/Leaderboard.tsx
    - apps/web/src/components/gamification/DailyChallenge.tsx
    - apps/web/src/components/gamification/WeeklyChallenge.tsx
  modified:
    - apps/web/src/lib/gamification/gamification.service.ts
    - apps/web/src/components/gamification/index.ts

key-decisions:
  - "리더보드 surrounding 중복 제거: top3 studentId Set으로 필터 — TOP3와 내 주변이 겹치는 경우(4등 이내) 중복 행 방지"
  - "displayName fallback: userSettings.displayName 없으면 email 앞부분(@이전) 사용"
  - "주간 챌린지 보너스 XP: 1000 XP (데일리 500 XP의 2배 — plan 스펙 없음, Claude 재량)"
  - "DailyChallenge 난이도 표시: '★'.repeat(difficulty) + '☆'.repeat(5-difficulty) — 직관적 별점 표시"

# Metrics
duration: 4min
completed: 2026-02-23
---

# Phase 16 Plan 03: 리더보드 + 챌린지 UI 컴포넌트 Summary

**getClassLeaderboard() 서비스 함수 + Leaderboard/DailyChallenge/WeeklyChallenge 3개 UI 컴포넌트를 구현하여 사회적 경쟁(리더보드)과 목표 기반 동기(챌린지)로 지속적인 학습 동기 제공**

## Performance

- **Duration:** 4분
- **Started:** 2026-02-23T13:40:22Z
- **Completed:** 2026-02-23T13:44:00Z
- **Tasks:** 2
- **Files modified:** 5 (2 수정 + 3 신규 생성)

## Accomplishments

- getClassLeaderboard(): GroupMember 기반 반원 필터링 → gamificationProfiles XP 정렬 → TOP3/surrounding/myRank/total 반환
- Leaderboard.tsx: TOP3 금/은/동 하이라이트 + 내 주변 ±2명 + 현재 사용자 행 강조 + 학생 1명 빈 상태 처리 + FadeIn 애니메이션
- DailyChallenge.tsx: getDailyChallengeConfig + isDailyChallengeCompleted 호출 → 오늘 날짜/문제 수/완료 상태/도전 버튼/+500XP 보너스 미리보기
- WeeklyChallenge.tsx: getWeeklyChallengeProgress 호출 → 주간 기간/Framer Motion 진행 바/격려 메시지/완료 보너스 표시
- index.ts barrel export 9개 완성 (XPBar/XPFloatingText/ComboCounter/LevelUpOverlay/BadgeUnlockOverlay/StreakCounter/Leaderboard/DailyChallenge/WeeklyChallenge)

## Task Commits

각 태스크는 원자적으로 커밋됨:

1. **Task 1: Leaderboard 리더보드 컴포넌트** - `2dbe196` (feat)
2. **Task 2: DailyChallenge + WeeklyChallenge + barrel export 업데이트** - `2e569e4` (feat)

## Files Created/Modified

- `apps/web/src/lib/gamification/gamification.service.ts` — LeaderboardEntry/ClassLeaderboardResult 타입 + getClassLeaderboard() 함수 추가
- `apps/web/src/components/gamification/Leaderboard.tsx` — 반 내 XP 리더보드 컴포넌트 (신규, 265줄)
- `apps/web/src/components/gamification/DailyChallenge.tsx` — 데일리 챌린지 카드 컴포넌트 (신규, 122줄)
- `apps/web/src/components/gamification/WeeklyChallenge.tsx` — 주간 챌린지 진행 바 컴포넌트 (신규, 140줄)
- `apps/web/src/components/gamification/index.ts` — Leaderboard/DailyChallenge/WeeklyChallenge 3개 추가 → 9개 barrel export

## Decisions Made

- **surrounding 중복 제거**: TOP3와 내 주변 ±2명이 겹치는 경우(예: 2등인 학생이 내 주변에도 포함) top3 studentId Set으로 필터링하여 중복 행 방지
- **displayName fallback**: userSettings.displayName 없으면 email의 @ 앞부분을 사용 — POC 환경에서 데이터 없는 경우 대비
- **주간 챌린지 완료 보너스 1000 XP**: plan 스펙에 명시 없어 데일리(500XP)의 2배로 설정 (주간 목표가 약 16.7일 데일리 분량 = 합리적 보상)
- **난이도 별점 표시**: `'★'.repeat(difficulty)+'☆'.repeat(5-difficulty)` — 숫자보다 직관적

## Deviations from Plan

### Auto-fixed Issues

없음 — 계획에서 명시된 모든 내용을 그대로 구현.

**참고:** Plan 02의 6개 컴포넌트(XPFloatingText, ComboCounter, LevelUpOverlay, BadgeUnlockOverlay, StreakCounter + index.ts)가 이미 존재하고 있었음. Plan 03 실행 시 이를 그대로 활용하여 index.ts에 3개 export만 추가.

## Verification Results

1. `npx tsc --noEmit` — TypeScript 에러 0개 (Task 1, Task 2 각각 확인)
2. `npx vite build` — 프로덕션 빌드 성공 (5.56초, 청크 크기 경고는 STATE.md 등록된 기존 이슈)
3. barrel export 9개 컴포넌트 모두 확인

## Issues Encountered

- 청크 크기 경고 (2844KB) — STATE.md에 등록된 기존 이슈, Phase 16 범위 밖

## Next Phase Readiness

- Phase 16 3개 Plan 모두 완료 (Plan 02 컴포넌트는 이미 존재)
- 9개 gamification UI 컴포넌트 barrel export로 어느 화면에서나 즉시 import 가능
- Leaderboard: groupId + currentStudentId props만 전달하면 즉시 반 리더보드 표시
- DailyChallenge: onStartChallenge 콜백으로 Phase 19 퀴즈 엔진과 연동 가능
- WeeklyChallenge: studentId만 전달하면 주간 진행 자동 표시

---

*Phase: 16-reward-system*
*Completed: 2026-02-23*

## Self-Check: PASSED
