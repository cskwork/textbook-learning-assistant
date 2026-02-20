---
phase: 06-pwa-offline
plan: 02
subsystem: ui
tags: [pwa, vite-plugin-pwa, service-worker, workbox-window, react, install-banner]

# Dependency graph
requires:
  - phase: 06-pwa-offline plan 01
    provides: vite-plugin-pwa + manifest + sw.js + VitePWA() 플러그인 설정
provides:
  - PWAInstallBanner 컴포넌트 (useRegisterSW 훅 기반 SW 생명주기 관리)
  - beforeinstallprompt 캡처로 Android/Chrome PWA 설치 배너
  - 오프라인 준비 알림 토스트 (3초 자동 닫힘)
  - 새 버전 업데이트 배너 (서비스워커 업데이트 버튼)
  - main.tsx 최상위 렌더링 통합
affects: [06-pwa-offline plan 03]

# Tech tracking
tech-stack:
  added: [workbox-window ^7.4.0]
  patterns: [useRegisterSW — vite-plugin-pwa React 훅으로 SW 생명주기 needRefresh/offlineReady 관리, BeforeInstallPromptEvent 커스텀 인터페이스 — TypeScript에서 미지원 이벤트 직접 선언]

key-files:
  created:
    - apps/web/src/components/pwa/PWAInstallBanner.tsx
  modified:
    - apps/web/src/main.tsx
    - apps/web/package.json
    - apps/web/tsconfig.app.json

key-decisions:
  - "workbox-window을 명시적 dependency로 추가 — virtual:pwa-register/react 번들 시 Rollup 해결 필요"
  - "tsconfig.app.json types에 vite-plugin-pwa/client 추가 — virtual:pwa-register/react 모듈 TypeScript 인식"
  - "PWAInstallBanner를 BrowserRouter 내부 AuthProvider 자식으로 배치 — 라우터 외부에서도 동작하며 StrictMode 적용"

patterns-established:
  - "PWA 배너 Pattern: needRefresh > offlineReady > installPrompt 우선순위로 단일 배너 표시 (중복 배너 방지)"
  - "bottom-20 Pattern: 하단 탭바(h-16) 위에 배너가 뜨도록 fixed bottom-20 사용"

requirements-completed: [UIUX-03]

# Metrics
duration: 5min
completed: 2026-02-20
---

# Phase 6 Plan 02: PWAInstallBanner 컴포넌트 Summary

**useRegisterSW 훅으로 SW 생명주기 관리 + beforeinstallprompt 캡처로 업데이트/오프라인준비/설치유도 3-상태 통합 PWA 배너 구현**

## Performance

- **Duration:** 5min
- **Started:** 2026-02-20T13:30:47Z
- **Completed:** 2026-02-20T13:35:30Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- PWAInstallBanner 컴포넌트 구현 — needRefresh/offlineReady/installPrompt 3가지 상태 분기, 하단 탭바 위 fixed 배너
- 오프라인 준비 알림 3초 자동 닫힘 + Android/Chrome 설치 프롬프트 캡처 (BeforeInstallPromptEvent 커스텀 타입)
- main.tsx 최상위에 PWAInstallBanner 통합, workbox-window 의존성 추가로 빌드 성공

## Task Commits

각 태스크가 원자적으로 커밋됨:

1. **Task 1: PWAInstallBanner 컴포넌트 구현** - `a17fa67` (feat)
2. **Task 2: main.tsx에 PWAInstallBanner 통합 + workbox-window 의존성 추가** - `d756960` (feat)

**Plan metadata:** (docs commit 예정)

## Files Created/Modified

- `apps/web/src/components/pwa/PWAInstallBanner.tsx` - useRegisterSW 훅 기반 3-상태 PWA 배너 컴포넌트
- `apps/web/src/main.tsx` - PWAInstallBanner import + AuthProvider 내 JSX 렌더링 추가
- `apps/web/package.json` - workbox-window ^7.4.0 dependency 추가
- `apps/web/tsconfig.app.json` - types에 vite-plugin-pwa/client 추가

## Decisions Made

- `workbox-window` 명시적 dependency 추가: `virtual:pwa-register/react` 번들 시 Rollup이 `workbox-window`를 resolve하지 못하는 문제 해결 (pnpm 엄격 격리로 인해 내부 peer dep 자동 노출 안 됨)
- `tsconfig.app.json` types 필드에 `vite-plugin-pwa/client` 추가: `virtual:pwa-register/react` 모듈 TypeScript 인식을 위해 필요
- `PWAInstallBanner`를 `BrowserRouter` 내 `AuthProvider` 자식으로 배치: AuthContext 미사용이지만 StrictMode 내에 포함되어 개발 중 useEffect 이중 실행 검증 가능

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] workbox-window 의존성 누락으로 빌드 실패**
- **Found during:** Task 2 (main.tsx에 PWAInstallBanner 통합 후 빌드)
- **Issue:** `virtual:pwa-register/react` 모듈이 `workbox-window`를 import하는데, pnpm strict isolation으로 인해 `vite-plugin-pwa` 내부 dep이 자동 노출되지 않아 Rollup resolve 실패
- **Fix:** `pnpm add workbox-window` 실행으로 `apps/web/package.json`에 명시적 dependency 추가
- **Files modified:** apps/web/package.json
- **Verification:** `pnpm web:build` 완전 성공 확인
- **Committed in:** d756960 (Task 2 커밋에 포함)

**2. [Rule 3 - Blocking] tsconfig에 vite-plugin-pwa/client 타입 누락**
- **Found during:** Task 1 (PWAInstallBanner.tsx 작성)
- **Issue:** `virtual:pwa-register/react` 모듈 TypeScript 미인식 가능성 — tsconfig.app.json에 `vite/client`만 있어 `vite-plugin-pwa/client` 타입 미포함
- **Fix:** tsconfig.app.json `types` 배열에 `vite-plugin-pwa/client` 추가
- **Files modified:** apps/web/tsconfig.app.json
- **Verification:** `pnpm web:build` (tsc -b 포함) 에러 없이 성공
- **Committed in:** a17fa67 (Task 1 커밋에 포함)

---

**Total deviations:** 2 auto-fixed (2 blocking)
**Impact on plan:** 두 수정 모두 빌드 완전 성공을 위해 필수적인 수정. 범위 확장 없음.

## Issues Encountered

없음 — 위 두 가지 blocking issue는 deviation으로 문서화됨.

## User Setup Required

없음 — 외부 서비스 설정 불필요.

## Next Phase Readiness

- PWAInstallBanner 완성: SW 생명주기 알림 + 설치 배너 구현됨
- 다음 플랜(06-03)에서 오프라인 데이터 동기화 또는 추가 PWA 기능 구현 가능
- Vercel 배포 시 Root Directory를 `apps/web`으로 설정 필요 (06-01에서 확인된 전제 조건 유지)

## Self-Check: PASSED

- FOUND: apps/web/src/components/pwa/PWAInstallBanner.tsx
- FOUND: apps/web/src/main.tsx (PWAInstallBanner import + JSX 렌더링 확인)
- FOUND: apps/web/dist/manifest.webmanifest
- FOUND: apps/web/dist/sw.js
- FOUND: apps/web/dist/pwa-192x192.png
- FOUND: apps/web/dist/pwa-512x512.png
- FOUND commit a17fa67 (Task 1)
- FOUND commit d756960 (Task 2)

---
*Phase: 06-pwa-offline*
*Completed: 2026-02-20*
