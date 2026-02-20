---
phase: 01-infra-auth
plan: 04
subsystem: ui
tags: [react, react-router, authcontext, jwt, protected-routes, rbac, fetch-wrapper, responsive]

# Dependency graph
requires:
  - phase: 01-infra-auth/01-02
    provides: React 19 + Vite 7 + Tailwind v4 + shadcn/ui AppShell + BottomNav + Sidebar
  - phase: 01-infra-auth/01-03
    provides: JWT 인증 API 6개 엔드포인트 (register/login/refresh/logout/onboarding/me) + httpOnly 쿠키

provides:
  - api.ts fetch 래퍼 (credentials include, 401 자동 refresh, JSON 처리)
  - auth.ts 인증 API 함수 (register/login/logout/getMe/setRole/refreshToken)
  - AuthContext (user/isLoading/login/logout/setRole) + useAuth 훅
  - 세션 자동 복원 (마운트 시 getMe() — AUTH-03)
  - 로그인/회원가입/온보딩 UI 3페이지 (shadcn Card 기반 반응형)
  - 보호 라우트 (_layout.tsx) + 공개 라우트 가드 (public-route.tsx)
  - 역할별 리디렉트 (role-redirect.tsx)
  - 학생/강사 홈 페이지 플레이스홀더
  - 역할별 동적 메뉴 (학생 4개, 강사 4개)
  - 모바일 상단 헤더 (로그아웃 버튼 포함)

affects:
  - 01-infra-auth/01-05 (통합 검증 — 전체 플로우 테스트)
  - phase 2+ (모든 보호 라우트 + 인증 상태는 이 AuthContext 기반으로 확장)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - AuthContext + useAuth 훅 패턴 (createContext + useContext + 커스텀 훅)
    - fetch 래퍼: credentials include + 401 시 자동 refresh + 재시도 1회
    - 공개/보호 라우트 분리 (PublicRoute + Layout 래퍼)
    - 역할 기반 동적 메뉴 주입 (navItems prop)
    - 모바일 로그아웃 접근: AppShell 상단 헤더 아이콘 버튼

key-files:
  created:
    - apps/web/src/lib/api.ts
    - apps/web/src/lib/auth.ts
    - apps/web/src/contexts/AuthContext.tsx
    - apps/web/src/routes/login.tsx
    - apps/web/src/routes/register.tsx
    - apps/web/src/routes/onboarding.tsx
    - apps/web/src/routes/student/index.tsx
    - apps/web/src/routes/instructor/index.tsx
    - apps/web/src/routes/coming-soon.tsx
    - apps/web/src/routes/public-route.tsx
    - apps/web/src/routes/role-redirect.tsx
  modified:
    - apps/web/src/routes/_layout.tsx
    - apps/web/src/components/layout/AppShell.tsx
    - apps/web/src/components/layout/BottomNav.tsx
    - apps/web/src/components/layout/Sidebar.tsx
    - apps/web/src/main.tsx
    - apps/web/tsconfig.app.json

key-decisions:
  - "AuthContext.login/setRole가 User를 반환 — 호출자(LoginPage, OnboardingPage)가 isOnboarded 기반 라우팅 직접 결정"
  - "register 후 login 재호출로 AuthContext user 상태 동기화 — getMe() 대신 명시적 login 호출로 user 객체 즉시 확보"
  - "isRefreshing 플래그로 refresh 중복 요청 방지 — 동시 다발적 401에서 refresh API를 1회만 호출"
  - "AppShell 상단 헤더(모바일)에 로그아웃 아이콘 추가 — BottomNav에는 로그아웃 없음"
  - "BottomNav/Sidebar NavLink end prop — 중첩 라우트(/student/problems 등)에서 /student 탭이 비활성화되지 않도록"

patterns-established:
  - "isApiError 타입 가드: error 프로퍼티로 ApiError 타입 좁힘 (catch 블록에서 서버 에러 메시지 추출)"
  - "공개 라우트 가드 패턴: PublicRoute Outlet 래퍼로 인증 상태별 리디렉트 처리"
  - "역할 리디렉트 패턴: RoleRedirect 컴포넌트가 role에 따라 Navigate 반환"
  - "AuthContext isLoading 중 전체 화면 스피너 — _layout 등 소비자는 null 반환으로 중복 처리 방지"

requirements-completed: [AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, UIUX-01]

# Metrics
duration: 6min
completed: 2026-02-20
---

# Phase 1 Plan 04: 인증 UI + AuthContext + 보호 라우트 + RBAC Summary

**AuthContext(getMe 세션 복원) + fetch 래퍼(401 자동 refresh) + 로그인/회원가입/온보딩 3페이지 + 역할별 보호 라우트 + 동적 메뉴 + 모바일 로그아웃 접근 완성**

## Performance

- **Duration:** 6 min
- **Started:** 2026-02-20T10:48:17Z
- **Completed:** 2026-02-20T10:54:09Z
- **Tasks:** 2
- **Files modified:** 17

## Accomplishments

- fetch 래퍼(`api.ts`) 완성 — credentials include, 401 시 자동 refresh 1회, JSON 직렬화
- AuthContext 완성 — getMe()로 마운트 시 세션 복원(AUTH-03), login/logout/setRole User 반환
- 인증 UI 3페이지 — 회원가입(클라이언트+서버 검증), 로그인(한국어 구체적 에러), 온보딩(학생/강사 카드)
- 보호 라우트 완성 — 비인증→/login, 미온보딩→/onboarding, 로그인→공개 라우트 차단
- 역할별 동적 메뉴 — 학생 4개 탭, 강사 4개 탭, 모바일 상단 헤더 로그아웃 버튼

## Task Commits

각 태스크를 원자적으로 커밋:

1. **Task 1: API 클라이언트 + AuthContext + 인증 폼 UI** - `8daa966` (feat)
2. **Task 2: 보호 라우트 + RBAC + 역할별 동적 메뉴 + 로그아웃** - `01df1c3` (feat)

**Plan metadata:** (이 파일 커밋 후 해시 업데이트)

## Files Created/Modified

**신규 생성:**
- `apps/web/src/lib/api.ts` — fetch 래퍼 (credentials include, 401 자동 refresh, JSON 처리)
- `apps/web/src/lib/auth.ts` — 인증 API 함수 (register/login/logout/getMe/setRole/refreshToken)
- `apps/web/src/contexts/AuthContext.tsx` — 전역 인증 상태 (user/isLoading/login/logout/setRole + useAuth 훅)
- `apps/web/src/routes/login.tsx` — 로그인 페이지 (에러 메시지 + isOnboarded 기반 라우팅)
- `apps/web/src/routes/register.tsx` — 회원가입 페이지 (클라이언트+서버 검증)
- `apps/web/src/routes/onboarding.tsx` — 역할 선택 페이지 (학생/강사 카드)
- `apps/web/src/routes/student/index.tsx` — 학생 홈 (대시보드 스켈레톤)
- `apps/web/src/routes/instructor/index.tsx` — 강사 홈 (관리 패널 스켈레톤)
- `apps/web/src/routes/coming-soon.tsx` — 준비 중 페이지 (미구현 라우트)
- `apps/web/src/routes/public-route.tsx` — 공개 라우트 가드 (로그인 상태 접근 차단)
- `apps/web/src/routes/role-redirect.tsx` — / → 역할별 홈 리디렉트

**수정:**
- `apps/web/src/routes/_layout.tsx` — AuthContext 기반 보호 라우트 + 역할별 navItems
- `apps/web/src/components/layout/AppShell.tsx` — 모바일 상단 헤더 + 로그아웃 버튼
- `apps/web/src/components/layout/BottomNav.tsx` — NavLink end prop 수정
- `apps/web/src/components/layout/Sidebar.tsx` — NavLink end prop 수정
- `apps/web/src/main.tsx` — 전체 라우터 구조 (AuthProvider + 공개/보호/역할 라우트)
- `apps/web/tsconfig.app.json` — vite/client 타입 추가 (import.meta.env 지원)

## Decisions Made

- **AuthContext login/setRole User 반환**: `Promise<void>` 대신 `Promise<User>` 반환 — 로그인 후 isOnboarded 여부를 호출자가 알아서 라우팅 결정 가능
- **register 후 login 재호출**: 가입 직후 `login(email, password)` 호출로 AuthContext user 동기화 — `getMe()` 대신 명시적 방법 채택
- **isRefreshing 플래그**: 동시 다발적 401 응답에서 refresh API 중복 호출 방지
- **BottomNav/Sidebar end prop**: `end={item.path === '/'}` → `end` (항상 end)로 변경 — 중첩 라우트에서 탭 활성 상태 정확도 향상
- **vite/client types**: `tsconfig.app.json`에 `"types": ["vite/client"]` 추가 — `import.meta.env` 타입 오류 수정

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] AuthContext login/setRole 반환 타입 void → User로 변경**
- **발견 시점:** Task 1 (login.tsx 구현 중)
- **문제:** AuthContext.login이 `void`를 반환해 호출자가 isOnboarded 여부를 알 수 없음. 로그인 후 라우팅 결정이 불가능.
- **수정:** `login`, `setRole` 함수가 `User`를 반환하도록 변경
- **수정 파일:** apps/web/src/contexts/AuthContext.tsx
- **Committed in:** 8daa966 (Task 1 커밋)

**2. [Rule 3 - Blocking] vite/client 타입 미포함으로 빌드 오류**
- **발견 시점:** Task 2 빌드 검증 중
- **문제:** `import.meta.env`에 대한 타입 정의가 없어 `tsc -b` 오류 발생
- **수정:** `tsconfig.app.json`에 `"types": ["vite/client"]` 추가
- **수정 파일:** apps/web/tsconfig.app.json
- **Committed in:** 01df1c3 (Task 2 커밋)

**3. [Rule 3 - Blocking] BottomNav/Sidebar end prop 미수정으로 중첩 라우트 활성 상태 오류**
- **발견 시점:** Task 2 (라우터 구조 검토 중)
- **문제:** `end={item.path === '/'}` 조건은 `/student` 등 루트 라우트에서만 end=true — 중첩 라우트(/student/problems)에서 /student 탭이 여전히 활성 표시됨
- **수정:** `end` prop을 항상 true로 설정 (정확한 경로 매칭)
- **수정 파일:** apps/web/src/components/layout/BottomNav.tsx, apps/web/src/components/layout/Sidebar.tsx
- **Committed in:** 01df1c3 (Task 2 커밋)

---

**Total deviations:** 3 auto-fixed (Rule 1 × 1, Rule 3 × 2)
**Impact on plan:** 모두 필수 수정. 반환 타입 변경은 라우팅 정확성을 위한 핵심 수정. 빌드 오류와 NavLink 활성 상태는 블로킹 이슈. 스코프 변경 없음.

## Issues Encountered

없음 — 모든 TypeScript 오류와 빌드 이슈는 데비에이션 Rule 1/3으로 처리됨.

## User Setup Required

없음 — 외부 서비스 설정 불필요. (API 서버와 PostgreSQL 컨테이너는 01-03에서 이미 실행 중)

## Next Phase Readiness

- 전체 인증 UI + AuthContext + 보호 라우트 완성 — Phase 01-05 통합 검증 즉시 진행 가능
- 남은 Phase 1 작업: 01-05 (통합 사용자 검증 체크포인트)
- Phase 2 진입 조건: 역할별 홈 페이지에 실제 기능 추가 — 현재는 플레이스홀더 스켈레톤

---
*Phase: 01-infra-auth*
*Completed: 2026-02-20*

## Self-Check: PASSED

파일 존재 확인:
- apps/web/src/lib/api.ts — FOUND
- apps/web/src/lib/auth.ts — FOUND
- apps/web/src/contexts/AuthContext.tsx — FOUND
- apps/web/src/routes/login.tsx — FOUND
- apps/web/src/routes/register.tsx — FOUND
- apps/web/src/routes/onboarding.tsx — FOUND
- apps/web/src/routes/student/index.tsx — FOUND
- apps/web/src/routes/instructor/index.tsx — FOUND
- apps/web/src/routes/_layout.tsx — FOUND
- apps/web/src/main.tsx — FOUND
- .planning/phases/01-infra-auth/01-04-SUMMARY.md — FOUND

커밋 존재 확인:
- 8daa966 (Task 1) — FOUND
- 01df1c3 (Task 2) — FOUND

빌드 검증: TypeScript tsc --noEmit PASS, vite build PASS
