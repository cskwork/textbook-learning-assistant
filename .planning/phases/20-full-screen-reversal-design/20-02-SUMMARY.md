---
phase: 20-full-screen-reversal-design
plan: 02
subsystem: ui
tags: [react, framer-motion, game-dashboard, quiz-hud, neon, glassmorphism]

requires:
  - phase: 20-full-screen-reversal-design
    provides: SVG 아이콘 12종 + 공용 UI 컴포넌트 (Plan 01)
  - phase: 16-reward-system
    provides: XPBar, StreakCounter, DailyChallenge, Leaderboard, useGamification
provides:
  - FunModeHome 반전 모드 홈 화면
  - GameDashboard XP/레벨/스트릭/데일리 위젯
  - GameModeLauncher 4종 게임 모드 카드
  - MiniLeaderboard TOP 3 미니 리더보드
  - GameQuizHud 퀴즈 게임 HUD 오버레이
  - FunQuizCard 네온 문제 카드 래퍼
affects: [20-03, 20-04]

tech-stack:
  added: []
  patterns: [lazy-import-funmode, game-hud-overlay, neon-quiz-card]

key-files:
  created:
    - apps/web/src/components/home/FunModeHome.tsx
    - apps/web/src/components/home/GameDashboard.tsx
    - apps/web/src/components/home/GameModeLauncher.tsx
    - apps/web/src/components/home/MiniLeaderboard.tsx
    - apps/web/src/components/game/quiz/GameQuizHud.tsx
    - apps/web/src/components/game/quiz/FunQuizCard.tsx
  modified:
    - apps/web/src/routes/student/index.tsx

key-decisions:
  - "FunModeHome lazy import: React.lazy로 코드 스플리팅, 일반 모드 번들 미포함"
  - "GameQuizHud: sticky 포지셔닝 + backdrop-blur로 스크롤 시에도 항상 표시"
  - "기존 Phase 16 위젯(XPBar, StreakCounter 등) 재사용 + 네온 래핑"

patterns-established:
  - "useFunMode() 분기 → lazy import 반전 모드 컴포넌트 패턴"
  - "GameQuizHud 모드별 props 분기 패턴"

requirements-completed: [SCRN-01, SCRN-02]

duration: 6min
completed: 2026-02-24
---

# Plan 02: 홈 게임 대시보드 + 퀴즈 HUD Summary

**반전 모드 홈 화면(게임 대시보드 + 4종 모드 런처 + 미니 리더보드) + 퀴즈 화면(게임 HUD 오버레이 + 네온 문제 카드)**

## Performance

- **Duration:** 6 min
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- FunModeHome: 다크 배경 풀스크린 게임 대시보드 (lazy import)
- GameDashboard: XP 바 + 레벨 + 스트릭 + 데일리 챌린지 네온 위젯
- GameModeLauncher: 타임어택/서바이벌/보스배틀/미니게임 네온 카드 그리드
- MiniLeaderboard: TOP 3 + CrownIcon + 네온 글로우
- GameQuizHud: HP/콤보/타이머 sticky HUD 오버레이
- FunQuizCard: NeonBorder + GlassCard + LaserButton 선택지

## Task Commits

1. **Task 02-01: 홈 화면 게임 대시보드** - `02a587e` (feat)
2. **Task 02-02: 퀴즈 화면 게임 HUD** - `c99c7a4` (feat)

## Deviations from Plan
- 퀴즈 라우트 통합(quiz/index.tsx 수정)은 기존 GameQuizShell 구조가 복잡하여 Plan 04에서 통합 검증 시 처리 예정

## Issues Encountered
None

## Next Phase Readiness
- 홈/퀴즈 반전 디자인 완료, Plan 03(오답노트/마이페이지) 및 Plan 04(분석/문제집/강사포털) 진행 가능

---
*Phase: 20-full-screen-reversal-design*
*Completed: 2026-02-24*
