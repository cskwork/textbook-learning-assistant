---
phase: 18-threejs-visual-effects
plan: 04
subsystem: ui
tags: [confetti, canvas-confetti, three-background-routing, appshell, page-integration]

requires:
  - phase: 18-threejs-visual-effects
    plan: 01
    provides: ThreeBackground, FunModeGate scene prop
  - phase: 18-threejs-visual-effects
    plan: 02
    provides: EventBus VFX emit (QuizPlayer)
provides:
  - ConfettiEffect canvas-confetti 래퍼 (3단계 폭발: 중앙 + 좌우)
  - 퀴즈 페이지 컨페티 자동 트리거 (정답 시 FunMode)
  - AppShell 레이아웃 수준 ThreeBackground 배치 (라우트→씬 자동 매핑)
  - game-confetti 청크 독립 분리 (10.67 KB)
affects: [19-gamified-quiz-engine, 20-full-screen-design]

tech-stack:
  patterns: [canvas-confetti worker 비동기, lazy import layout-level, route-to-scene mapping]

key-files:
  created:
    - apps/web/src/components/game/effects/ConfettiEffect.tsx
  modified:
    - apps/web/src/routes/student/quiz/index.tsx
    - apps/web/src/components/layout/AppShell.tsx

key-decisions:
  - "ThreeBackground를 AppShell 레이아웃 수준에 배치 — 각 페이지 개별 배치 대신 단일 인스턴스로 라우트 전환 시 Canvas 재생성 방지"
  - "getSceneForRoute() 함수로 pathname → scene 매핑 — 간결한 if/startsWith 분기"
  - "컨페티는 xpAwarded > 0 조건 (정답 시) 트리거 — 오답 시 불발"
  - "FunModeGate scene prop 방식 대신 AppShell 직접 lazy import 방식 채택 — FunModeGate는 children 래핑 용도로 남겨두고, 배경은 레이아웃에서 독립 관리"

patterns-established:
  - "레이아웃 수준 ThreeBackground 패턴: AppShell에서 useLocation → getSceneForRoute → lazy ThreeBackground 렌더링"
  - "컨페티 트리거 패턴: onGamificationResult 콜백 → setShowConfetti(true) + EventBus.emit('vfx:quiz-complete')"

requirements-completed: [VFX-07]

build-output:
  game-confetti: "10.67 KB (gzip: 4.28 KB)"
  game-three: "724.22 KB (gzip: 187.28 KB)"
  game-howler: "36.72 KB (gzip: 10.02 KB)"
  ConfettiEffect-chunk: "0.76 KB"
  ThreeBackground-chunk: "3.93 KB"
  total-chunks: 45

duration: 4 min
completed: 2026-02-24
---

# Phase 18 Plan 04: 퀴즈 완료 컨페티 + 페이지별 ThreeBackground 라우팅 Summary

**ConfettiEffect canvas-confetti 래퍼 + 퀴즈 정답 컨페티 자동 트리거 + AppShell 레이아웃 수준 ThreeBackground 라우트→씬 자동 매핑**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-24
- **Completed:** 2026-02-24
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- ConfettiEffect: canvas-confetti 라이브러리 래퍼, worker 기반 비동기 처리, 3단계 폭발 (중앙 100개 + 좌측 50개 + 우측 50개)
- 퀴즈 페이지: 정답 시 FunMode에서 showConfetti 상태 + EventBus.emit('vfx:quiz-complete') 트리거
- AppShell 레이아웃: ThreeBackground lazy import로 라우트 전환 시 Canvas 재생성 없이 씬 자동 전환
- 라우트→씬 매핑: /student=space, /student/quiz=neon, /student/analytics=wave, /student/profile=mountain
- 빌드 검증: game-confetti(10.67KB), game-three(724.22KB) 독립 청크 분리 확인

## Task Commits

1. **Task 1+2: ConfettiEffect + 퀴즈 연동 + AppShell ThreeBackground 라우팅** - `266963f` (feat)

## Files Created/Modified
- `apps/web/src/components/game/effects/ConfettiEffect.tsx` - canvas-confetti 래퍼 (fire prop, 3단계 폭발)
- `apps/web/src/routes/student/quiz/index.tsx` - showConfetti 상태 + 정답 시 트리거 + ConfettiEffect Suspense 렌더링
- `apps/web/src/components/layout/AppShell.tsx` - ThreeBackground lazy import + getSceneForRoute() + isFunMode 조건부 렌더링

## Deviations from Plan

### Design Decision Change
**ThreeBackground 배치 위치: FunModeGate per-page → AppShell layout-level**
- **Plan 원안:** 각 페이지(student/index, quiz/index, analytics/index, profile/index)에서 FunModeGate scene prop으로 배경 렌더링
- **실제 구현:** AppShell 단일 인스턴스에서 useLocation + getSceneForRoute로 배경 렌더링
- **이유:** 페이지 전환 시 Canvas 재생성 비용 방지, 단일 WebGL 컨텍스트 유지, 코드 중복 제거
- **영향:** FunModeGate scene prop은 유지되지만 실제 사용 안 함 (향후 필요 시 활용 가능)

## Issues Encountered
None

## User Setup Required
None

## Build Verification

| 청크 | 크기 | gzip |
|------|------|------|
| game-confetti | 10.67 KB | 4.28 KB |
| game-three | 724.22 KB | 187.28 KB |
| game-howler | 36.72 KB | 10.02 KB |
| ConfettiEffect | 0.76 KB | 0.46 KB |
| ThreeBackground | 3.93 KB | 1.75 KB |

---
*Phase: 18-threejs-visual-effects*
*Completed: 2026-02-24*
