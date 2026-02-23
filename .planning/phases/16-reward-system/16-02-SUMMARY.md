---
phase: 16-reward-system
plan: "02"
subsystem: ui
tags: [gamification, framer-motion, xp-bar, combo-counter, level-up, badge, streak, react, animation]

# Dependency graph
requires:
  - phase: 16-reward-system
    provides: "Plan 01: useGamification/useCombo 훅, BadgeDefinition 타입, XP 수식 순수 함수"

provides:
  - "XPBar — 헤더 아래 그라데이션 XP 진행 바 (Framer Motion easeOut, 레벨/XP 수치 표시)"
  - "XPFloatingText — +NNN XP 플로팅 텍스트 애니메이션 (AnimatePresence, y:-60 scale:1.2)"
  - "ComboCounter — 격투 게임 스타일 콤보 팝업 (spring 물리, 콤보 수에 따라 색상/글로우 강화)"
  - "LevelUpOverlay — 풀스크린 레벨업 시네마틱 (fixed z-[100], spring scale 0.3→1, 2.5초 자동 닫힘)"
  - "BadgeUnlockOverlay — 희귀도별 차등 연출 뱃지 획득 오버레이 (common/rare/epic 1.5/2/3초)"
  - "StreakCounter — 컴팩트 스트릭 위젯 (불꽃 색상/크기 강화, 보너스 XP 뱃지)"
  - "gamification/index.ts barrel export"

affects:
  - 16-reward-system-03 (리더보드/챌린지 UI — 같은 barrel export에서 import)
  - 17-sound-system (XP 지급/레벨업/뱃지 획득 시 사운드 연동)
  - 18-visual-effects (레벨업 시네마틱 Three.js 파티클로 교체 예정)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "AnimatePresence + key prop 패턴 — key={comboCount}로 매 콤보마다 새 애니메이션 트리거"
    - "희귀도별 설정 Record 패턴 — Record<BadgeRarity, T>로 rarity별 색상/타이밍/물리 일괄 관리"
    - "useEffect + useRef 타이머 패턴 — 자동 닫힘 오버레이에서 setTimeout을 useRef로 cleanup 보장"
    - "Framer Motion fixed 오버레이 패턴 — fixed inset-0 z-[100] + AnimatePresence로 진입/퇴장 애니메이션"

key-files:
  created:
    - apps/web/src/components/gamification/XPBar.tsx
    - apps/web/src/components/gamification/XPFloatingText.tsx
    - apps/web/src/components/gamification/ComboCounter.tsx
    - apps/web/src/components/gamification/LevelUpOverlay.tsx
    - apps/web/src/components/gamification/BadgeUnlockOverlay.tsx
    - apps/web/src/components/gamification/StreakCounter.tsx
    - apps/web/src/components/gamification/index.ts
  modified: []

key-decisions:
  - "XPBar 디자인: 그라데이션(blue-500→purple-500) + boxShadow glow, 반짝이는 하이라이트 오버레이 추가"
  - "LevelUpOverlay 회전 광선: conic-gradient + Framer Motion rotate:360 무한 루프로 빛 효과"
  - "BadgeUnlockOverlay epic 전용 pulse glow: scale/opacity 루프 애니메이션으로 epic 희귀도 강조"
  - "StreakCounter 7일+ 흔들림: 7일 이상이면 불꽃 아이콘에 scale+rotate 무한 루프 적용"
  - "ComboCounter 화면 위 오버레이: fixed inset-0 + justify-center/items-center로 정중앙 배치"

patterns-established:
  - "Record<BadgeRarity, T> 설정 패턴: 희귀도별 색상/타이밍/물리 설정을 Record 타입으로 분리 → 코드 반복 제거"
  - "useRef 타이머 cleanup 패턴: useEffect에서 setTimeout을 useRef에 저장 → cleanup에서 clearTimeout 보장"
  - "key={comboCount} 재마운트 패턴: AnimatePresence 자식에 key prop 변경으로 매 이벤트마다 새 애니메이션"

requirements-completed: [RWRD-01, RWRD-02, RWRD-03, RWRD-04, RWRD-06]

# Metrics
duration: 3min
completed: 2026-02-23
---

# Phase 16 Plan 02: 보상 피드백 UI 컴포넌트 Summary

**Framer Motion 기반 보상 피드백 UI 6종 — XPBar(그라데이션 진행 바), XPFloatingText(플로팅 텍스트), ComboCounter(격투 게임 스프링), LevelUpOverlay(풀스크린 시네마틱), BadgeUnlockOverlay(희귀도별 차등 연출), StreakCounter(불꽃 강화 위젯)**

## Performance

- **Duration:** 3분
- **Started:** 2026-02-23T13:39:40Z
- **Completed:** 2026-02-23T13:42:44Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments

- XPBar: 헤더 아래 그라데이션(blue→purple) 진행 바, Framer Motion easeOut(0.8초), 레벨/XP 수치 + 반짝임 하이라이트
- XPFloatingText + ComboCounter: AnimatePresence 플로팅 텍스트(1.2초), spring 물리 콤보 팝업(5단계 색상/글로우 강화)
- LevelUpOverlay + BadgeUnlockOverlay: fixed z-[100] 풀스크린 오버레이, 희귀도 3단계 차등 연출, useRef 타이머 cleanup
- StreakCounter: 컴팩트 위젯, 3/7/14/30일 색상 단계, 7일+ 불꽃 흔들림 루프, 보너스 XP 뱃지
- barrel export (index.ts) — Plan 03에서 즉시 import 가능

## Task Commits

각 태스크는 원자적으로 커밋됨:

1. **Task 1: XPBar + XPFloatingText + ComboCounter 컴포넌트** - `ae2818d` (feat)
2. **Task 2: LevelUpOverlay + BadgeUnlockOverlay + StreakCounter + barrel export** - `0255547` (feat)

**Plan 메타데이터:** (다음 커밋)

## Files Created/Modified

- `apps/web/src/components/gamification/XPBar.tsx` — 헤더 아래 그라데이션 XP 진행 바 (Framer Motion easeOut)
- `apps/web/src/components/gamification/XPFloatingText.tsx` — +NNN XP 플로팅 텍스트 애니메이션 (AnimatePresence)
- `apps/web/src/components/gamification/ComboCounter.tsx` — 격투 게임 스타일 콤보 팝업 (spring 물리, 5단계 강화)
- `apps/web/src/components/gamification/LevelUpOverlay.tsx` — 풀스크린 레벨업 시네마틱 (z-[100], 2.5초 자동 닫힘)
- `apps/web/src/components/gamification/BadgeUnlockOverlay.tsx` — 희귀도별 차등 뱃지 획득 오버레이 (common/rare/epic)
- `apps/web/src/components/gamification/StreakCounter.tsx` — 컴팩트 스트릭 카운터 위젯 (불꽃 강화, 보너스 XP)
- `apps/web/src/components/gamification/index.ts` — barrel export 6개 컴포넌트

## Decisions Made

- **XPBar 하이라이트**: 진행 바 위에 반투명 흰색 그라데이션 오버레이 추가 — 유리 느낌(glassmorphism)으로 게임 UI 질감
- **LevelUpOverlay 회전 광선**: conic-gradient + rotate:360 무한 루프 — setTimeout 없이 CSS+Framer Motion으로 빛 효과
- **BadgeUnlockOverlay epic 전용 pulse**: epic만 scale/opacity 루프 추가 — common/rare는 단순 scale로 차별화
- **StreakCounter 7일+ 흔들림**: rotate:[-5,5,-5] + scale:[1,1.15,1] 2초 루프 — 7일 달성의 특별함 시각화
- **ComboCounter fixed 포지션**: fixed inset-0으로 항상 화면 정중앙 — 콤보 놓치지 않도록 강제 시선 유도

## Deviations from Plan

없음 — 플랜이 정확히 명시한 대로 실행됨.

## Issues Encountered

없음 — TypeScript 컴파일 에러 0개, 프로덕션 빌드 성공.

chunk size 경고(2844KB)는 STATE.md에 이미 등록된 기존 이슈 — Phase 16 범위 밖.

## Next Phase Readiness

- 6개 gamification UI 컴포넌트 모두 barrel export에서 바로 import 가능
- Plan 03(리더보드/챌린지/뱃지 패널)에서 `import { XPBar, LevelUpOverlay, BadgeUnlockOverlay, ... } from '@/components/gamification'` 즉시 사용 가능
- 모든 컴포넌트가 props 기반 독립 동작 — 퀴즈 페이지 연동 시 onCorrect/onWrong 콜백에 hook

## Self-Check: PASSED

- XPBar.tsx: FOUND
- XPFloatingText.tsx: FOUND
- ComboCounter.tsx: FOUND
- LevelUpOverlay.tsx: FOUND
- BadgeUnlockOverlay.tsx: FOUND
- StreakCounter.tsx: FOUND
- index.ts: FOUND
- ae2818d: FOUND (Task 1 commit)
- 0255547: FOUND (Task 2 commit)
- TypeScript 에러: 0개
- 프로덕션 빌드: 성공

---
*Phase: 16-reward-system*
*Completed: 2026-02-23*
