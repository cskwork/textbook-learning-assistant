---
phase: 19-gamified-quiz-engine
plan: 02
subsystem: game
tags: [react, framer-motion, useReducer, timer, heart-display]

requires:
  - phase: 19-gamified-quiz-engine
    provides: useGameSession, CircularTimer, HeartDisplay, GameQuizShell
provides:
  - TimeAttackMode (10문제 카운트다운 타이머)
  - SurvivalMode (하트 3개 생존)
  - GameQuizShell (공통 문제 표시 쉘)
affects: [19-04]

tech-stack:
  added: []
  patterns: [GameQuizShell headerSlot 패턴, 객관식 선택 즉시 제출]

key-files:
  created:
    - apps/web/src/components/game/quiz/GameQuizShell.tsx
    - apps/web/src/components/game/quiz/TimeAttackMode.tsx
    - apps/web/src/components/game/quiz/SurvivalMode.tsx
  modified: []

key-decisions:
  - "GameQuizShell에서 객관식 선택 시 즉시 onAnswer 호출 (게임 모드 속도감)"
  - "타임어택 시간 보너스 XP = baseXP * (남은시간/전체시간) * 0.5"

patterns-established:
  - "GameQuizShell headerSlot으로 모드별 HUD 삽입"
  - "answerProcessingRef로 중복 답안 제출 방지"

requirements-completed: [GAME-01, GAME-02]

duration: 10min
completed: 2026-02-24
---

# Plan 02: 타임어택 + 서바이벌 모드 Summary

**GameQuizShell 공통 쉘 + 타임어택(카운트다운 10문제) + 서바이벌(하트 3개 생존) 게임 모드 완성**

## Performance
- **Duration:** 10 min
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- GameQuizShell 공통 문제 표시 쉘 (headerSlot/footerSlot 패턴)
- TimeAttackMode: 난이도별 제한 시간, 시간 보너스 XP, 자동 오답 처리
- SurvivalMode: 하트 3개, 10문제마다 회복, shake 효과

## Task Commits
1. **Task 1: GameQuizShell + TimeAttackMode** - `617d064`
2. **Task 2: SurvivalMode** - `617d064` (동일 커밋)

## Deviations from Plan
None

## Issues Encountered
- SurvivalMode에서 unused `multiplier` 변수 TS 에러 → 구조분해에서 제거

---
*Phase: 19-gamified-quiz-engine*
*Completed: 2026-02-24*
