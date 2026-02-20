---
phase: 01-infra-auth
plan: 02
subsystem: ui
tags: [react, vite, tailwindcss, shadcn, react-router, lucide-react, responsive]

# Dependency graph
requires:
  - phase: 01-infra-auth/01-01
    provides: pnpm 모노레포 + pnpm-workspace.yaml (apps/web 워크스페이스 인식)

provides:
  - React 19 + Vite 7 + Tailwind v4 + shadcn/ui 통합 프론트엔드 프로젝트 (apps/web)
  - 파란색 교육 앱 테마 (hue 250 oklch, shadcn :root 변수 커스텀)
  - 태블릿 우선 반응형 AppShell (BottomNav + Sidebar)
  - 루트 레이아웃 라우트 (_layout.tsx) + 임시 홈 페이지
  - shadcn/ui 컴포넌트 라이브러리 (button, input, label, card)

affects:
  - 01-infra-auth/01-04 (AuthContext + 보호 라우트 — AppShell navItems, _layout loader 연결)
  - 01-infra-auth/01-05 (통합 검증 — 반응형 레이아웃 확인)
  - phase 2+ (모든 프론트엔드 UI가 이 AppShell 위에 구축됨)

# Tech tracking
tech-stack:
  added:
    - react@19.2.4
    - react-dom@19.2.4
    - react-router@7.13.0
    - tailwindcss@4.2.0
    - "@tailwindcss/vite@4.2.0"
    - "@vitejs/plugin-react@4.7.0"
    - vite@7.3.1
    - lucide-react@0.511.0
    - clsx@2.1.1
    - tailwind-merge@3.5.0
    - shadcn/ui (button, input, label, card)
  patterns:
    - Tailwind v4 CSS-first 설정 (tailwind.config.js 없음, @tailwindcss/vite 플러그인)
    - shadcn/ui @theme inline 변수 + :root CSS 변수로 파란색 테마 커스텀
    - 반응형 AppShell (lg: 기준 하단탭바 ↔ 사이드바 전환)
    - navItems prop 주입으로 역할별 동적 메뉴 확장 가능한 구조

key-files:
  created:
    - apps/web/src/components/layout/AppShell.tsx
    - apps/web/src/components/layout/BottomNav.tsx
    - apps/web/src/components/layout/Sidebar.tsx
    - apps/web/src/routes/_layout.tsx
    - apps/web/src/routes/home.tsx
    - apps/web/src/index.css
    - apps/web/src/main.tsx
    - apps/web/src/lib/utils.ts
    - apps/web/vite.config.ts
    - apps/web/tsconfig.app.json
    - apps/web/tsconfig.node.json
    - apps/web/components.json
  modified:
    - apps/web/package.json
    - apps/web/tsconfig.json
    - apps/web/index.html

key-decisions:
  - "Tailwind v4 CSS-first 방식 — tailwind.config.js 생성 안 함, @tailwindcss/vite 플러그인 사용"
  - "shadcn init --defaults로 초기화 후 :root 변수를 파란색(hue 250) 교육 앱 테마로 덮어씀"
  - "AppShell navItems prop 구조 — Phase 01-04에서 user.role 기반 동적 메뉴 주입 포인트"
  - "BrowserRouter + Routes 방식 채택 (react-router v7 SPA 모드)"
  - "lg 브레이크포인트(1024px)에서 BottomNav/Sidebar 전환 — 태블릿까지 하단탭바 유지"

patterns-established:
  - "cn() 유틸리티: clsx + tailwind-merge 조합으로 className 병합"
  - "NavLink isActive 패턴: render prop({isActive}) => JSX로 아이콘/텍스트 색상 조건부 변경"
  - "AppShell children ?? Outlet 패턴: 레이아웃 컴포넌트를 직접 사용하거나 라우터 Outlet으로 사용"

requirements-completed: [UIUX-01]

# Metrics
duration: 6min
completed: 2026-02-20
---

# Phase 1 Plan 02: React + Vite + Tailwind v4 + shadcn/ui 반응형 앱 셸 Summary

**React 19 + Vite 7 + Tailwind v4 파란색 교육 앱 테마 + shadcn/ui + 태블릿 우선 반응형 AppShell(하단탭바 ↔ 사이드바 전환) 구축**

## Performance

- **Duration:** 6 min
- **Started:** 2026-02-20T10:05:16Z
- **Completed:** 2026-02-20T10:11:00Z
- **Tasks:** 2
- **Files modified:** 17

## Accomplishments

- Vite React-TS 프로젝트(apps/web) 생성, Tailwind v4 + shadcn/ui 통합 완료
- 파란색 계열 교육 앱 테마(oklch hue 250) — shadcn :root CSS 변수 전체 커스텀
- 태블릿 우선 반응형 AppShell 완성 — lg:hidden(BottomNav) + hidden lg:flex(Sidebar) 전환
- shadcn 컴포넌트(button, input, label, card) 추가 및 타입 체크 통과, 빌드 성공

## Task Commits

각 태스크를 원자적으로 커밋:

1. **Task 1: React + Vite + Tailwind v4 + shadcn/ui 프로젝트 초기화** - `74729a6` (chore)
2. **Task 2: 반응형 앱 셸 레이아웃 (하단 탭바 + 사이드바)** - `43193c9` (feat)

**Plan metadata:** (이 파일 커밋 후 해시 업데이트)

## Files Created/Modified

- `apps/web/src/components/layout/BottomNav.tsx` — 하단 고정 탭바 (lg:hidden, NavLink + lucide-react 아이콘)
- `apps/web/src/components/layout/Sidebar.tsx` — 데스크톱 사이드바 (hidden lg:flex, 앱 로고 + 로그아웃 버튼 자리)
- `apps/web/src/components/layout/AppShell.tsx` — 반응형 래퍼, pb-16/lg:pb-0 + lg:pl-64, navItems prop
- `apps/web/src/routes/_layout.tsx` — 루트 레이아웃 라우트 (AppShell + Outlet)
- `apps/web/src/routes/home.tsx` — 임시 홈 페이지 (shadcn Card + Button 사용)
- `apps/web/src/index.css` — Tailwind v4 @import + @theme 파란색 테마 + shadcn :root 변수
- `apps/web/src/main.tsx` — React 19 createRoot + BrowserRouter + Routes
- `apps/web/src/lib/utils.ts` — cn() 유틸리티 (clsx + tailwind-merge)
- `apps/web/vite.config.ts` — @tailwindcss/vite + @vitejs/plugin-react + @ alias
- `apps/web/components.json` — shadcn/ui 설정 파일
- `apps/web/package.json` — 의존성 정의
- `apps/web/tsconfig.json` / `tsconfig.app.json` / `tsconfig.node.json` — TypeScript 설정

## Decisions Made

- **Tailwind v4 CSS-first**: `tailwind.config.js` 생성 안 함. `@tailwindcss/vite` 플러그인 + `@theme` 지시자 사용.
- **shadcn 테마 커스텀**: `shadcn init --defaults` 후 `:root` CSS 변수를 파란색(hue 250) 교육 앱 테마로 덮어씀
- **BrowserRouter 방식**: react-router v7 라이브러리 모드(SPA) 사용, createBrowserRouter 대신 BrowserRouter + Routes
- **lg 브레이크포인트**: 태블릿(768px~1023px)까지 하단탭바 유지, 1024px+에서 사이드바로 전환
- **navItems prop 구조**: AppShell이 navItems를 받아 BottomNav/Sidebar에 전달 — Phase 01-04에서 user.role 기반 동적 메뉴 주입 포인트

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Vite create 명령이 react-ts 템플릿을 적용하지 않아 수동 설정**
- **Found during:** Task 1 (프로젝트 초기화)
- **Issue:** `pnpm create vite@latest apps/web -- --template react-ts` 명령이 vanilla TypeScript 템플릿으로 생성됨
- **Fix:** package.json, tsconfig, vite.config.ts, index.html, main.tsx를 수동으로 작성
- **Files modified:** apps/web/package.json, apps/web/tsconfig.json, apps/web/tsconfig.app.json, apps/web/tsconfig.node.json, apps/web/vite.config.ts, apps/web/index.html, apps/web/src/main.tsx
- **Verification:** `pnpm --filter web build` 성공, localhost:5173 응답 확인
- **Committed in:** 74729a6 (Task 1 커밋)

**2. [Rule 3 - Blocking] shadcn init 실패 — tsconfig.json에 path alias 없음**
- **Found during:** Task 1 (shadcn 초기화)
- **Issue:** tsconfig.json이 `files: []` + `references` 구조라 shadcn이 path alias를 못 찾음
- **Fix:** tsconfig.json에 `compilerOptions.paths` 추가 (shadcn이 참조하는 위치)
- **Files modified:** apps/web/tsconfig.json
- **Verification:** `pnpm dlx shadcn@latest init --defaults` 성공
- **Committed in:** 74729a6 (Task 1 커밋)

---

**Total deviations:** 2 auto-fixed (Rule 3 — 블로킹 이슈 2건)
**Impact on plan:** 모두 필수 수정. Vite 템플릿 미적용으로 수동 설정이 필요했으나 결과물은 동일. 스코프 변경 없음.

## Issues Encountered

- 구 보일러플레이트 파일들(main.ts, counter.ts, style.css, typescript.svg)이 main.tsx와 공존하여 빌드 오류 발생 — 내용을 비워서 해결 (파일 삭제 권한 없음)

## User Setup Required

없음 — 외부 서비스 설정 불필요.

## Next Phase Readiness

- React 19 + Vite 7 + Tailwind v4 + shadcn/ui 기반 완성 — Phase 01-03~04 인증 UI 즉시 구축 가능
- AppShell navItems prop 구조 준비 완료 — Phase 01-04에서 AuthContext + user.role 기반 메뉴 주입
- 남은 Phase 1 작업: 01-03 (JWT 인증 API), 01-04 (인증 UI + AuthContext), 01-05 (통합 검증)

---
*Phase: 01-infra-auth*
*Completed: 2026-02-20*

## Self-Check: PASSED

- apps/web/src/components/layout/AppShell.tsx — FOUND
- apps/web/src/components/layout/BottomNav.tsx — FOUND
- apps/web/src/components/layout/Sidebar.tsx — FOUND
- apps/web/src/routes/_layout.tsx — FOUND
- apps/web/src/index.css — FOUND
- apps/web/src/main.tsx — FOUND
- apps/web/src/lib/utils.ts — FOUND
- apps/web/vite.config.ts — FOUND
- apps/web/components.json — FOUND
- Commit 74729a6 — FOUND
- Commit 43193c9 — FOUND
