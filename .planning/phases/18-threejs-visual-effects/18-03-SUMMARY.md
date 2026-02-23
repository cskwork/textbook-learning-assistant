---
phase: 18-threejs-visual-effects
plan: 03
subsystem: ui
tags: [level-up-vfx, streak-flame, r3f-ring, framer-motion, cinematic-overlay]

requires:
  - phase: 18-threejs-visual-effects
    plan: 01
    provides: ThreeBackground R3F 인프라
  - phase: 16-reward-system
    provides: LevelUpOverlay, StreakCounter, useFunMode
provides:
  - LevelUpVfx R3F 독립 Canvas 레벨업 파티클 (ring expand + Sparkles)
  - StreakFlame CSS gradient + Framer Motion 불꽃 애니메이션 (4단계 인텐시티)
  - LevelUpOverlay에 LevelUpVfx 통합 (FunMode only)
  - 학생 홈 StreakCounter 옆 StreakFlame 배치
affects: [20-full-screen-design]

tech-stack:
  patterns: [독립 R3F Canvas (LevelUpVfx), TorusGeometry ring expand, drei Sparkles, CSS radial-gradient flame, Framer Motion oscillation loop]

key-files:
  created:
    - apps/web/src/components/game/effects/LevelUpVfx.tsx
    - apps/web/src/components/game/effects/StreakFlame.tsx
  modified:
    - apps/web/src/components/gamification/LevelUpOverlay.tsx
    - apps/web/src/routes/student/index.tsx

key-decisions:
  - "LevelUpVfx는 독립 R3F Canvas — LevelUpOverlay 전체가 z-[100]이므로 ThreeBackground(z=-10)와 별개의 Canvas 필요"
  - "StreakFlame은 CSS gradient + Framer Motion — Three.js 불필요, 항상 화면에 표시되므로 경량 CSS 접근"
  - "스트릭 4단계: weak(3-6d), medium(7-13d), strong(14-29d), max(30+d) — max 시 파란/보라 신비로운 색상"

patterns-established:
  - "독립 R3F Canvas 패턴: 모달/오버레이 전용 Canvas는 visible prop으로 마운트/언마운트 제어 (WebGL 컨텍스트 절약)"
  - "CSS flame 패턴: radial-gradient + Framer Motion y/scale/opacity 루프 — absolute 배치로 아이콘 뒤에 위치"

requirements-completed: [VFX-04, VFX-05]

duration: 3 min
completed: 2026-02-24
---

# Phase 18 Plan 03: 레벨업 시네마틱 VFX + 스트릭 불꽃 이펙트 Summary

**LevelUpVfx 독립 R3F Canvas (ring expand + Sparkles) + StreakFlame CSS/Framer Motion 불꽃 (4단계) + LevelUpOverlay/StudentHome 통합**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-24
- **Completed:** 2026-02-24
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- LevelUpVfx: 독립 R3F Canvas에서 TorusGeometry ring expand (scale 0→15, opacity 1→0) + drei Sparkles
- StreakFlame: CSS radial-gradient + Framer Motion 떨림 애니메이션, 4단계 인텐시티 (weak/medium/strong/max)
- 30일+ 스트릭 시 파란/보라 신비로운 불꽃 + 3겹 레이어
- LevelUpOverlay에 FunMode 조건부 LevelUpVfx lazy import 통합
- 학생 홈 StreakCounter 주변에 StreakFlame absolute 배치

## Task Commits

1. **Task 1: LevelUpVfx + StreakFlame 생성** - `212bd3b` (feat)
2. **Task 2: LevelUpOverlay + StudentHome 통합** - `212bd3b` (같은 커밋에 포함)

## Files Created/Modified
- `apps/web/src/components/game/effects/LevelUpVfx.tsx` - R3F ring expand + Sparkles
- `apps/web/src/components/game/effects/StreakFlame.tsx` - CSS gradient + Framer Motion 불꽃
- `apps/web/src/components/gamification/LevelUpOverlay.tsx` - LevelUpVfx lazy import + isFunMode 가드 추가
- `apps/web/src/routes/student/index.tsx` - StreakFlame import + StreakCounter 옆 배치

## Deviations from Plan
None

## Issues Encountered
None

## User Setup Required
None

---
*Phase: 18-threejs-visual-effects*
*Completed: 2026-02-24*
