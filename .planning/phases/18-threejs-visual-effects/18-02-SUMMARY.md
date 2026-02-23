---
phase: 18-threejs-visual-effects
plan: 02
subsystem: ui
tags: [vfx-events, eventbus, particle-burst, wrong-answer-fx, instanced-mesh]

requires:
  - phase: 18-threejs-visual-effects
    plan: 01
    provides: ThreeBackground, useGpuTier, CSS keyframes (wrong-flash, wrong-shake)
provides:
  - useVfxEvents 훅 (EventBus VFX 이벤트 → ref-based 트리거)
  - WrongAnswerFx CSS-only 오답 플래시/쉐이크
  - ParticleBurst R3F InstancedMesh 파티클 시스템
  - QuizPlayer EventBus VFX emit 연동
affects: [18-04, 19-gamified-quiz-engine]

tech-stack:
  patterns: [EventBus VFX subscription, ref-based trigger for R3F useFrame, InstancedMesh single draw call, CSS-only wrong answer effect]

key-files:
  created:
    - apps/web/src/components/game/vfx/useVfxEvents.ts
    - apps/web/src/components/game/vfx/WrongAnswerFx.tsx
    - apps/web/src/components/game/effects/ParticleBurst.tsx
  modified:
    - apps/web/src/components/quiz/QuizPlayer.tsx

key-decisions:
  - "VFX 이벤트는 EventBus.on/off 패턴으로 구독 — React useState 대신 ref로 트리거 전달하여 R3F useFrame에서 직접 읽기"
  - "WrongAnswerFx는 CSS-only (shake + flash) — Three.js 리소스 불필요, 300ms 자동 완료"
  - "ParticleBurst는 InstancedMesh로 MAX_PARTICLES=150 단일 드로우콜 — 콤보 배수에 따라 파티클 수/색상 변화"

patterns-established:
  - "VFX 이벤트 패턴: QuizPlayer → EventBus.emit('vfx:xxx') → useVfxEvents ref → R3F useFrame 소비"
  - "InstancedMesh 파티클 패턴: dummy Object3D matrix 업데이트 + setMatrixAt + needsUpdate"

requirements-completed: [VFX-03]

duration: 4 min
completed: 2026-02-24
---

# Phase 18 Plan 02: VFX 이벤트 시스템 + 정답/오답 이펙트 Summary

**EventBus VFX 이벤트 구독 시스템 + 오답 CSS 플래시/쉐이크 + 정답 InstancedMesh 파티클 폭발 + QuizPlayer VFX emit 연동**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-24
- **Completed:** 2026-02-24
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- useVfxEvents 훅: EventBus 'vfx:correct/wrong/combo/levelup/quiz-complete/streak' 이벤트 구독 → ref-based 트리거
- WrongAnswerFx: CSS-only 오답 효과 (animate-wrong-flash + animate-wrong-shake), 300ms 후 자동 해제
- ParticleBurst: InstancedMesh 기반 파티클 시스템, 콤보 단계별 파티클 수(30~130)/색상 변화, 중력+생명주기 시뮬레이션
- QuizPlayer에서 정답/오답/콤보/레벨업 시 EventBus.emit('vfx:xxx') 호출 추가

## Task Commits

1. **Task 1: useVfxEvents + WrongAnswerFx + ParticleBurst** - `d740f41` (feat)
2. **Task 2: QuizPlayer VFX emit 연동** - `d740f41` (같은 커밋에 포함)

## Files Created/Modified
- `apps/web/src/components/game/vfx/useVfxEvents.ts` - EventBus VFX 이벤트 구독 훅
- `apps/web/src/components/game/vfx/WrongAnswerFx.tsx` - CSS-only 오답 플래시/쉐이크
- `apps/web/src/components/game/effects/ParticleBurst.tsx` - InstancedMesh 파티클 버스트
- `apps/web/src/components/quiz/QuizPlayer.tsx` - VFX emit 호출 추가 (vfx:correct/wrong/combo/levelup)

## Deviations from Plan
None

## Issues Encountered
None

## User Setup Required
None

---
*Phase: 18-threejs-visual-effects*
*Completed: 2026-02-24*
