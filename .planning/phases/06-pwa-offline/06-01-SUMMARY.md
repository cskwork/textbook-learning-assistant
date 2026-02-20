---
phase: 06-pwa-offline
plan: 01
subsystem: infra
tags: [pwa, vite-plugin-pwa, workbox, service-worker, manifest, vercel]

# Dependency graph
requires:
  - phase: 01-infra-auth
    provides: Vite 7 + React 19 기반 웹 앱 셸
provides:
  - vite-plugin-pwa ^1.2.0 설치 + VitePWA() 플러그인 설정
  - 빌드 시 manifest.webmanifest + sw.js 자동 생성 (Workbox generateSW 전략)
  - PWA 아이콘 3종 (192×192, 512×512 maskable, 180×180 apple-touch)
  - index.html PWA 메타 태그 (theme-color, apple-mobile-web-app)
  - vercel.json SPA rewrites + sw.js Cache-Control 헤더
affects: [06-pwa-offline plan 02]

# Tech tracking
tech-stack:
  added: [vite-plugin-pwa ^1.2.0, workbox 7.x (내장)]
  patterns: [generateSW 전략 — 커스텀 SW 불필요 zero-config, registerType autoUpdate — 자동 SW 업데이트]

key-files:
  created:
    - apps/web/public/pwa-192x192.png
    - apps/web/public/pwa-512x512.png
    - apps/web/public/apple-touch-icon.png
    - apps/web/vercel.json
  modified:
    - apps/web/vite.config.ts
    - apps/web/package.json
    - apps/web/index.html

key-decisions:
  - "vite-plugin-pwa ^1.2.0 — Vite 7 지원 확인된 최신 버전"
  - "generateSW 전략 + registerType autoUpdate — POC에서 커스텀 SW 불필요, 자동 precache"
  - "devOptions.enabled false — 개발 환경 HMR과 SW 캐시 충돌 방지"
  - "navigateFallback index.html — SPA 딥 링크 오프라인 새로고침 지원"
  - "vercel.json을 apps/web/에 위치 — Vercel Root Directory를 apps/web으로 설정 전제"

patterns-established:
  - "PWA Pattern: VitePWA() 플러그인이 manifest + sw.js 빌드 시 자동 생성"
  - "아이콘 Pattern: Node.js 내장 모듈(zlib + fs)만으로 단색 PNG 파일 직접 생성"

requirements-completed: [UIUX-03]

# Metrics
duration: 3min
completed: 2026-02-20
---

# Phase 6 Plan 01: PWA 인프라 구축 Summary

**vite-plugin-pwa ^1.2.0 + Workbox generateSW 전략으로 manifest.webmanifest + sw.js 자동 생성, PWA 아이콘 3종 + iOS 메타 태그 + Vercel SPA rewrites 완성**

## Performance

- **Duration:** 3min
- **Started:** 2026-02-20T13:25:23Z
- **Completed:** 2026-02-20T13:27:55Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments

- vite-plugin-pwa 설치 + VitePWA() 플러그인으로 빌드 시 `dist/manifest.webmanifest` + `dist/sw.js` 자동 생성 확인
- PWA 아이콘 3종(192×192, 512×512 maskable, 180×180) Node.js 내장 모듈로 생성 — #2563eb 파란색 단색
- index.html PWA 메타 태그 5개 추가 + vercel.json SPA rewrites + sw.js Cache-Control 헤더 설정

## Task Commits

각 태스크가 원자적으로 커밋됨:

1. **Task 1: vite-plugin-pwa 설치 + vite.config.ts 업데이트** - `1356524` (feat)
2. **Task 2: PWA 아이콘 생성 + index.html 메타 태그 + vercel.json 추가** - `ab419d7` (feat)

## Files Created/Modified

- `apps/web/vite.config.ts` - VitePWA() 플러그인 설정 추가 (registerType, manifest, workbox)
- `apps/web/package.json` - vite-plugin-pwa ^1.2.0 devDependency 추가
- `apps/web/public/pwa-192x192.png` - PWA 아이콘 192×192 (파란색 #2563eb)
- `apps/web/public/pwa-512x512.png` - PWA 아이콘 512×512 maskable (파란색 #2563eb)
- `apps/web/public/apple-touch-icon.png` - iOS 홈 화면 아이콘 180×180 (파란색 #2563eb)
- `apps/web/index.html` - theme-color, apple-touch-icon, apple-mobile-web-app 메타 태그 추가
- `apps/web/vercel.json` - SPA rewrites + sw.js Cache-Control: no-cache 헤더

## Decisions Made

- `generateSW` 전략 선택 — POC 수준에서 커스텀 SW 로직 불필요, Workbox가 전체 앱 에셋 precache 자동 처리
- `registerType: 'autoUpdate'` — 새 버전 감지 시 자동 skipWaiting + clientsClaim, 사용자 개입 없이 SW 업데이트
- `devOptions.enabled: false` — 개발 중 HMR과 SW 캐시 충돌 방지 (표준 안티패턴 회피)
- `navigateFallback: 'index.html'` — SPA 딥 링크 오프라인 새로고침 지원 필수 설정
- `vercel.json`을 `apps/web/` 루트에 위치 — Vercel 대시보드에서 Root Directory를 `apps/web`으로 설정 시 올바르게 인식

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- `pnpm run build --filter web` 명령이 루트에서 동작하지 않아 `pnpm web:build`로 대체 (루트 package.json 스크립트 확인 후 수정)

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- PWA 인프라 완성: manifest.webmanifest + sw.js 빌드 출력 확인됨
- 다음 플랜(06-02)에서 PWAInstallBanner 컴포넌트 구현 가능
- Vercel 배포 시 Root Directory를 `apps/web`으로 설정 필요 (vercel.json 인식을 위해)

## Self-Check: PASSED

- FOUND: apps/web/vite.config.ts
- FOUND: apps/web/public/pwa-192x192.png
- FOUND: apps/web/public/pwa-512x512.png
- FOUND: apps/web/public/apple-touch-icon.png
- FOUND: apps/web/index.html
- FOUND: apps/web/vercel.json
- FOUND: .planning/phases/06-pwa-offline/06-01-SUMMARY.md
- FOUND commit 1356524 (Task 1)
- FOUND commit ab419d7 (Task 2)

---
*Phase: 06-pwa-offline*
*Completed: 2026-02-20*
