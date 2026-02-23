---
phase: 15-infra-fun-mode
plan: 02
subsystem: infra
tags: [vite, code-splitting, react-lazy, suspense, event-bus, bundle-optimization, phaser, game]

# 의존 그래프
requires:
  - phase: 15-infra-fun-mode/15-01
    provides: FunModeContext, useFunMode 훅, FunModeToggleButton

provides:
  - "Vite manualChunks로 game-phaser/game-three/game-howler/game-confetti 청크 분리 규칙"
  - "EventBus 싱글턴 (Phaser-React 통신 채널)"
  - "GameLoadingSpinner (Suspense fallback 로딩 UI)"
  - "FunModeGate (React.lazy + Suspense 래퍼 인프라)"

affects: [15-03, 16, 17, 18, 19, 20]

# 기술 추적
tech-stack:
  added: []
  patterns:
    - "manualChunks(id) 함수로 node_modules 경로 패턴 매칭 → 청크 이름 반환"
    - "SimpleEventEmitter 싱글턴 패턴 (외부 의존성 없는 경량 EventBus)"
    - "Suspense fallback으로 로딩 스피너 사용"

key-files:
  created:
    - apps/web/vite.config.ts (build.rollupOptions.output.manualChunks 추가)
    - apps/web/src/game/EventBus.ts
    - apps/web/src/components/game/GameLoadingSpinner.tsx
    - apps/web/src/components/game/FunModeGate.tsx
  modified:
    - apps/web/src/main.tsx (FunModeProvider 닫기 태그 누락 수정)

key-decisions:
  - "eventemitter3 대신 경량 SimpleEventEmitter 직접 구현 — Phase 19에서 Phaser.Events.EventEmitter로 교체 예정"
  - "FunModeGate는 Phase 15에서 Suspense 인프라만 구축, lazy import는 Phase 18/19에서 활성화"
  - "chunkSizeWarningLimit 1500KB 상향 — 게임 청크는 크기가 클 수밖에 없는 특성 반영"

patterns-established:
  - "게임 번들 분리 패턴: manualChunks + React.lazy + Suspense 3단계 조합"
  - "EventBus.on/off/emit 패턴으로 Phaser 씬과 React 컴포넌트 간 통신"
  - "Suspense fallback에서 EventBus 'load-progress' 이벤트로 진행률 수신"

requirements-completed: [INFRA-04, INFRA-05]

# 측정
duration: 3min
completed: 2026-02-23
---

# Phase 15 Plan 02: Vite manualChunks + Lazy Loading 인프라 Summary

**Vite manualChunks로 Phaser/Three.js/Howler.js를 별도 청크로 분리하고, React.lazy + Suspense + EventBus 기반 반전 모드 로딩 게이트 인프라 구축**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-23T12:45:15Z
- **Completed:** 2026-02-23T12:47:53Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- `vite.config.ts`에 `manualChunks(id)` 함수 추가 — Phaser/Three.js/Howler.js/canvas-confetti를 별도 청크로 분리 (INFRA-04)
- `EventBus.ts` 경량 싱글턴 생성 — 외부 의존성 없는 SimpleEventEmitter, Phaser-React 통신 채널
- `GameLoadingSpinner.tsx` 생성 — 반전 모드 진입 시 Suspense fallback 로딩 화면, EventBus 'load-progress' 이벤트 수신 (INFRA-05)
- `FunModeGate.tsx` 생성 — React Suspense 래퍼 인프라, Phase 18/19 lazy import 연결 준비 완료

## Task Commits

각 태스크는 원자적으로 커밋됨:

1. **Task 1: Vite manualChunks 설정 + EventBus 싱글턴** - `84517f7` (feat)
2. **Task 2: GameLoadingSpinner + FunModeGate 컴포넌트** - `6a5ae3c` (feat)

**Plan metadata:** 최종 커밋 예정

## Files Created/Modified

- `apps/web/vite.config.ts` - build.rollupOptions.output.manualChunks 추가, chunkSizeWarningLimit 1500KB
- `apps/web/src/game/EventBus.ts` - SimpleEventEmitter 싱글턴 (on/off/emit)
- `apps/web/src/components/game/GameLoadingSpinner.tsx` - 반전 모드 로딩 화면 (진행률 바, 애니메이션)
- `apps/web/src/components/game/FunModeGate.tsx` - Suspense 래퍼 (Phase 18/19 연결 준비)
- `apps/web/src/main.tsx` - FunModeProvider 닫기 태그 수정 (Rule 3 auto-fix)

## Decisions Made

- **eventemitter3 미사용**: 외부 의존성 추가보다 경량 SimpleEventEmitter 직접 구현 선호. Phase 19에서 Phaser.Events.EventEmitter로 교체 예정이므로 과투자 불필요.
- **FunModeGate Phase 15 범위**: 현재는 Suspense 인프라만 구축. ThreeBackground(Phase 18), PhaserBridge(Phase 19) lazy import는 해당 Phase에서 활성화.
- **chunkSizeWarningLimit 1500**: 기존 기본값 500KB 대비 상향. 게임 청크(Phaser ~980KB)는 구조적으로 큰 특성 반영.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] main.tsx FunModeProvider 닫기 태그 누락**
- **Found during:** Task 2 (빌드 검증)
- **Issue:** Plan 01에서 추가된 `<FunModeProvider>` 열기 태그에 대응하는 닫기 태그가 main.tsx에 없어 Vite 빌드 실패
- **Fix:** `</FunModeProvider>` 닫기 태그 추가 (AuthProvider 닫기 태그 다음)
- **Files modified:** `apps/web/src/main.tsx`
- **Verification:** `npm run build` 성공, TypeScript 오류 없음
- **Committed in:** `6a5ae3c` (Task 2 커밋에 포함)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** 빌드 블로커 수정 — 범위 내 수정, 사이드 이펙트 없음

## Issues Encountered

- `tsc --noEmit` 단독 실행 시 타입 오류 없었으나 `npm run build`(`tsc -b && vite build`) 실행 시 JSX 파싱 오류 발생 — main.tsx의 FunModeProvider 닫기 태그 누락이 원인 (Plan 01 pre-existing issue)

## User Setup Required

없음 — 외부 서비스 설정 불필요

## Next Phase Readiness

- INFRA-04, INFRA-05 완료 — 번들 분리 인프라 구축 완료
- Phaser/Three.js/Howler.js 설치 시 즉시 manualChunks 분리 적용됨
- EventBus 싱글턴 — Phase 19 Phaser 씬 연결 준비 완료
- FunModeGate — Phase 18 ThreeBackground, Phase 19 PhaserBridge lazy import 연결 대기 중
- Plan 03(FunModeContext 통합 테스트)으로 진행 가능

## Self-Check: PASSED

- [x] `apps/web/vite.config.ts` — 존재 확인
- [x] `apps/web/src/game/EventBus.ts` — 존재 확인
- [x] `apps/web/src/components/game/GameLoadingSpinner.tsx` — 존재 확인
- [x] `apps/web/src/components/game/FunModeGate.tsx` — 존재 확인
- [x] `.planning/phases/15-infra-fun-mode/15-02-SUMMARY.md` — 존재 확인
- [x] 커밋 `84517f7` — git log 확인 완료
- [x] 커밋 `6a5ae3c` — git log 확인 완료
- [x] TypeScript 컴파일 오류 없음
- [x] `npm run build` 성공

---
*Phase: 15-infra-fun-mode*
*Completed: 2026-02-23*
