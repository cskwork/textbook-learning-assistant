---
phase: 19-gamified-quiz-engine
plan: 01
subsystem: game
tags: [dexie, useReducer, framer-motion, svg, react-hooks]

requires:
  - phase: 16-reward-system
    provides: gamification.service.ts (awardXP), xp-formula.ts, Dexie v8
  - phase: 15-fun-mode-infra
    provides: FunModeContext, PhaserBridge POC
provides:
  - GameRecord 인터페이스 + Dexie v9 gameRecords 테이블
  - game-records.service.ts (saveGameRecord, getPersonalBest, getRecentRecords)
  - useGameRecords 훅 (useLiveQuery reactive)
  - useGameSession 상태머신 (useReducer 기반)
  - GameModeSelector 5종 모드 카드 UI
  - CircularTimer SVG 원형 타이머
  - HeartDisplay 하트 + 깨짐 애니메이션
  - HpBar 프로그레스 바
affects: [19-02, 19-03, 19-04]

tech-stack:
  added: []
  patterns: [useReducer 게임 상태머신, Dexie 복합 인덱스 활용, SVG stroke-dasharray 타이머]

key-files:
  created:
    - apps/web/src/lib/gamification/game-records.service.ts
    - apps/web/src/hooks/useGameRecords.ts
    - apps/web/src/hooks/useGameSession.ts
    - apps/web/src/components/game/quiz/GameModeSelector.tsx
    - apps/web/src/components/game/quiz/CircularTimer.tsx
    - apps/web/src/components/game/quiz/HeartDisplay.tsx
    - apps/web/src/components/game/quiz/HpBar.tsx
  modified:
    - apps/web/src/lib/db.ts

key-decisions:
  - "Dexie version(9)으로 gameRecords 테이블 추가 — 기존 v1~v8 유지"
  - "useGameSession에서 모드별 확장 필드를 단일 state에 통합 (hearts, bossHp 등)"
  - "CircularTimer에서 5초 이하 경고 시 Framer Motion opacity 깜빡임 적용"
  - "GameModeSelector에서 Framer Motion ease를 as const로 타입 안전하게 처리"

patterns-established:
  - "게임 세션 상태머신: useReducer + action type 기반 상태 전환"
  - "게임 기록 서비스: saveGameRecord 시 자동 isPersonalBest 비교"
  - "게임 UI 컴포넌트: 어두운 배경 + 네온 색상 (Phase 20 사전 반영)"

requirements-completed: [GAME-01, GAME-02, GAME-03, GAME-05]

duration: 15min
completed: 2026-02-24
---

# Plan 01: Phase 19 기반 인프라 Summary

**Dexie v9 gameRecords + useGameSession 상태머신 + 게임 모드 선택 UI + 공용 게임 UI 4종 구축**

## Performance

- **Duration:** 15 min
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- Dexie v9 gameRecords 테이블 + [studentId+mode] 복합 인덱스 추가
- useGameSession useReducer 상태머신 (7가지 액션, 모드별 분기 로직)
- GameModeSelector 5가지 모드 카드 Framer Motion stagger 애니메이션
- CircularTimer / HeartDisplay / HpBar 공용 게임 UI 컴포넌트

## Task Commits

1. **Task 1: Dexie v9 gameRecords + game-records 서비스 + useGameRecords 훅** - `bd74943`
2. **Task 2: useGameSession + GameModeSelector + 공용 UI 4종** - `83ccb08`

## Files Created/Modified
- `apps/web/src/lib/db.ts` - GameRecord 인터페이스 + version(9) gameRecords 테이블
- `apps/web/src/lib/gamification/game-records.service.ts` - save/getBest/getRecent 서비스
- `apps/web/src/hooks/useGameRecords.ts` - useLiveQuery reactive 조회 훅
- `apps/web/src/hooks/useGameSession.ts` - useReducer 게임 세션 상태머신
- `apps/web/src/components/game/quiz/GameModeSelector.tsx` - 5종 모드 선택 카드 UI
- `apps/web/src/components/game/quiz/CircularTimer.tsx` - SVG 원형 타이머
- `apps/web/src/components/game/quiz/HeartDisplay.tsx` - 하트 깨짐 애니메이션
- `apps/web/src/components/game/quiz/HpBar.tsx` - HP 프로그레스 바

## Decisions Made
- Framer Motion ease 타입 에러 → `as const` 타입 단언으로 해결

## Deviations from Plan
None - plan executed as specified (ease 타입 수정은 빌드 검증 과정에서 발견된 minor fix)

## Issues Encountered
- GameModeSelector의 Framer Motion variants에서 ease: 'easeOut' 타입 에러 → `as const` 추가로 해결

## Next Phase Readiness
- Plan 02 (타임어택/서바이벌) 및 Plan 03 (보스배틀/GameResult) 실행 가능
- useGameSession, CircularTimer, HeartDisplay, HpBar 모두 준비 완료

---
*Phase: 19-gamified-quiz-engine*
*Completed: 2026-02-24*
