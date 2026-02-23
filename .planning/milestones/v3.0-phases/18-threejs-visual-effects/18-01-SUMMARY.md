---
phase: 18-threejs-visual-effects
plan: 01
subsystem: ui
tags: [three.js, react-three-fiber, drei, webgl, canvas, 3d-background, gpu-detection]

requires:
  - phase: 15-infra-fun-mode
    provides: FunModeGate Suspense 인프라, manualChunks 설정, FunModeContext
provides:
  - ThreeBackground R3F Canvas 컴포넌트 (scene prop 기반 배경 렌더링)
  - useGpuTier GPU 티어 감지 훅 (VfxQuality 4단계)
  - CssFallbackBg CSS gradient fallback 배경
  - 4개 배경 씬 (SpaceBg, NeonGridBg, WaveBg, MountainBg)
  - FunModeGate scene prop 활성화
affects: [18-02, 18-03, 18-04, 20-full-screen-design]

tech-stack:
  added: [three 0.183.x, @react-three/fiber 9.x, @react-three/drei 10.x, canvas-confetti 1.9.x, @types/three, @types/canvas-confetti]
  patterns: [R3F Canvas background overlay, PerformanceMonitor DPR 조절, useGpuTier GPU 감지, CSS gradient fallback]

key-files:
  created:
    - apps/web/src/components/game/ThreeBackground.tsx
    - apps/web/src/components/game/vfx/useGpuTier.ts
    - apps/web/src/components/game/vfx/CssFallbackBg.tsx
    - apps/web/src/components/game/backgrounds/SpaceBg.tsx
    - apps/web/src/components/game/backgrounds/NeonGridBg.tsx
    - apps/web/src/components/game/backgrounds/WaveBg.tsx
    - apps/web/src/components/game/backgrounds/MountainBg.tsx
  modified:
    - apps/web/src/components/game/FunModeGate.tsx
    - apps/web/package.json
    - apps/web/src/index.css

key-decisions:
  - "useGpuTier는 Canvas 외부에서 호출되므로 drei useDetectGPU 대신 WebGL feature detection + navigator.hardwareConcurrency 기반 간이 감지 구현"
  - "WaveBg는 vertex shader 대신 useFrame 내 positions array 직접 변형으로 구현 — 복잡도 최소화"
  - "MountainBg는 ConeGeometry 기반 다중 레이어 — 셰이더 기반 높이맵 대신 간단한 지오메트리 접근"

patterns-established:
  - "R3F 배경 패턴: fixed inset-0 -z-10 pointer-events-none 래퍼 + Canvas"
  - "GPU 티어 패턴: useGpuTier() → VfxQuality → 조건부 렌더링/파라미터 조절"
  - "배경 씬 패턴: default export + quality prop + useFrame ref 직접 조작"

requirements-completed: [VFX-01]

duration: 5 min
completed: 2026-02-24
---

# Phase 18 Plan 01: R3F Canvas 인프라 + 화면별 4개 3D 배경 씬 Summary

**Three.js R3F Canvas 배경 인프라 + SpaceBg/NeonGridBg/WaveBg/MountainBg 4개 씬 + GPU 감지 + CSS fallback + FunModeGate 활성화**

## Performance

- **Duration:** 5 min
- **Started:** 2026-02-24T00:00:00Z
- **Completed:** 2026-02-24T00:08:00Z
- **Tasks:** 2
- **Files modified:** 11

## Accomplishments
- Three.js 생태계 의존성 설치 (three, @react-three/fiber, @react-three/drei, canvas-confetti)
- ThreeBackground 컴포넌트: scene prop에 따라 R3F Canvas 또는 CSS fallback 자동 선택
- PerformanceMonitor로 FPS 기반 DPR 자동 조절 (저성능 시 0.5, 고성능 시 1.5)
- 4개 고유 배경 씬: 우주/별(Stars+유성), 네온 격자(무한 스크롤), 파도/물결(sin/cos wave), 산/자연(다중 레이어)
- 모든 배경에 마우스 parallax 반응 구현
- FunModeGate에서 ThreeBackground lazy import 활성화

## Task Commits

1. **Task 1: 의존성 설치 + R3F Canvas 인프라 + GPU 감지 + FunModeGate 활성화** - `fe4d35e` (feat)
2. **Task 2: 화면별 4개 3D 배경 씬 구현** - `d19d838` (feat)

## Files Created/Modified
- `apps/web/src/components/game/ThreeBackground.tsx` - R3F Canvas + 씬 라우터 + PerformanceMonitor
- `apps/web/src/components/game/vfx/useGpuTier.ts` - GPU 티어 감지 훅 (4단계: high/medium/low/css-only)
- `apps/web/src/components/game/vfx/CssFallbackBg.tsx` - WebGL 미지원 CSS gradient 배경
- `apps/web/src/components/game/backgrounds/SpaceBg.tsx` - drei Stars + ShootingStar 유성
- `apps/web/src/components/game/backgrounds/NeonGridBg.tsx` - GridHelper 무한 스크롤 + Sparkles
- `apps/web/src/components/game/backgrounds/WaveBg.tsx` - PlaneGeometry wave 변형 wireframe
- `apps/web/src/components/game/backgrounds/MountainBg.tsx` - ConeGeometry 다중 레이어 산
- `apps/web/src/components/game/FunModeGate.tsx` - ThreeBackground lazy import + scene prop 추가
- `apps/web/package.json` - three, r3f, drei, canvas-confetti 의존성 추가
- `apps/web/src/index.css` - VFX CSS keyframes (css-fallback-pulse, wrong-flash, wrong-shake)

## Decisions Made
- useGpuTier: Canvas 외부 호출이므로 drei useDetectGPU 대신 WebGL canvas context 생성 시도 + hardwareConcurrency 기반 간이 판별
- WaveBg: shader 대신 useFrame 내 positions array 직접 변형 — 간단하고 디버깅 용이
- MountainBg: 각 레이어가 별도 parallaxFactor를 받아 깊이감 제공 — 뒤쪽 느리게, 앞쪽 빠르게

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] 기존 빌드 에러 3건 수정**
- **Found during:** Task 1 (빌드 검증)
- **Issue:** QuizPlayer resetCombo 미사용, useSoundSettings SoundSettings 미사용 import, vite.config.ts vitest reference 위치 오류
- **Fix:** resetCombo → _resetCombo 접두사, SoundSettings → export type로 변경, vitest/config reference로 변경
- **Files modified:** QuizPlayer.tsx, useSoundSettings.ts, vite.config.ts
- **Verification:** 빌드 성공 (TS 0 에러)
- **Committed in:** fe4d35e (Task 1 커밋에 포함)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** 기존 빌드 에러 수정. Phase 18 변경사항과 무관한 pre-existing 이슈.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- R3F Canvas 인프라 완비 → Plan 02/03/04 모두 ThreeBackground 기반으로 VFX 구현 가능
- FunModeGate scene prop 활성화 → Plan 04에서 각 페이지 연동 시 즉시 사용 가능
- game-three 청크는 FunModeGate가 실제 페이지에 import될 때 (Plan 04) Vite가 자동 분리

---
*Phase: 18-threejs-visual-effects*
*Completed: 2026-02-24*
