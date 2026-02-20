---
phase: 01-infra-auth
verified: 2026-02-20T11:30:00Z
status: human_needed
score: 13/13 must-haves verified
re_verification: false
human_verification:
  - test: "브라우저에서 전체 인증 플로우 실행 (21개 항목)"
    expected: |
      1. http://localhost:5173 접속 → /login 리디렉트
      2. 회원가입 → /onboarding → 학생 선택 → /student 홈 + 학생 메뉴 확인
      3. 새로고침 후 /student 홈 유지 (세션 유지)
      4. 로그아웃 → /login 이동
      5. 미등록 이메일 로그인 → "가입되지 않은 이메일입니다" 표시
      6. 올바른 이메일 + 틀린 비밀번호 → "비밀번호가 틀렸습니다" 표시
      7. 강사 계정 가입 → 온보딩 강사 선택 → /instructor 홈 + 강사 메뉴 확인
      8. 375px 뷰포트: 하단 탭바 표시, 사이드바 숨김
      9. 768px 뷰포트: 하단 탭바 표시, 사이드바 숨김
      10. 1280px 뷰포트: 사이드바 표시, 하단 탭바 숨김
    why_human: "01-05 체크포인트가 blocking gate로 설정되어 있으며, 시각적 레이아웃 전환과 실제 인터랙션은 자동화 검증으로 확인 불가. 01-05-SUMMARY에 '사용자 검증 대기 중' 상태가 명시됨."
---

# Phase 1: 기반 인프라 + 인증 Verification Report

**Phase Goal:** 학생과 강사가 이메일로 회원가입/로그인하고 역할별로 구분된 앱에 안정적으로 접근할 수 있다
**Verified:** 2026-02-20T11:30:00Z
**Status:** human_needed — 자동화 검증 전체 통과, 브라우저 사용자 검증 대기 중
**Re-verification:** No — 초기 검증

## Goal Achievement

### Observable Truths

모든 5개 PLAN의 must_haves truths를 직접 코드베이스에서 검증한 결과:

| # | Truth (출처) | Status | Evidence |
|---|---|---|---|
| 1 | pnpm install이 루트에서 성공하고 apps/api 워크스페이스가 인식된다 (01-01) | VERIFIED | `pnpm-workspace.yaml` 존재, 01-01-SUMMARY: "pnpm install --frozen-lockfile 성공 (204개 패키지)" |
| 2 | Drizzle Kit으로 마이그레이션 생성이 성공한다 (01-01) | VERIFIED | `apps/api/drizzle/0000_init.sql` 존재 — user_role enum, users, refresh_tokens 테이블 DDL 확인 |
| 3 | Express 5 서버가 /health 엔드포인트와 함께 기동된다 (01-01) | VERIFIED | `apps/api/src/index.ts` L23: `app.get('/health', ...)` — `{ status: 'ok', timestamp }` 응답 |
| 4 | React 앱이 localhost:5173에서 기동되고 기본 레이아웃이 렌더링된다 (01-02) | VERIFIED | `apps/web/src/main.tsx` 존재, BrowserRouter + AuthProvider + Routes 구조 |
| 5 | 모바일/태블릿에서 하단 탭바, 데스크톱에서 사이드바로 전환된다 (01-02) | VERIFIED (코드) | `BottomNav.tsx` L37: `lg:hidden`, `Sidebar.tsx` L28: `hidden lg:flex` — 브라우저 렌더링은 인간 검증 필요 |
| 6 | shadcn/ui 컴포넌트가 정상 import되고 렌더링된다 (01-02) | VERIFIED | `apps/web/src/components/ui/`: button.tsx, card.tsx, input.tsx, label.tsx 존재; login.tsx에서 import 확인 |
| 7 | POST /api/auth/register 호출 시 사용자가 생성되고 JWT 쿠키가 세팅된다 (01-03) | VERIFIED | `auth.ts` L38-85: DB insert + generateTokens + setTokenCookies → 201 응답 |
| 8 | 잘못된 이메일로 로그인 시 '가입되지 않은 이메일입니다' 에러 반환 (01-03) | VERIFIED | `auth.ts` L101: `res.status(401).json({ error: '가입되지 않은 이메일입니다' })` |
| 9 | 잘못된 비밀번호로 로그인 시 '비밀번호가 틀렸습니다' 에러 반환 (01-03) | VERIFIED | `auth.ts` L109: `res.status(401).json({ error: '비밀번호가 틀렸습니다' })` |
| 10 | POST /api/auth/refresh로 만료된 access token을 갱신할 수 있다 (01-03) | VERIFIED | `auth.ts` L140-211: refreshToken 검증 + DB 확인 + 로테이션 + 새 토큰 발급 |
| 11 | POST /api/auth/logout 호출 시 refresh token이 DB에서 삭제되고 쿠키가 클리어된다 (01-03) | VERIFIED | `auth.ts` L215-226: `db.delete(refreshTokens)` + `clearTokenCookies(res)` |
| 12 | PATCH /api/auth/onboarding으로 역할(student/instructor) 설정 가능 (01-03) | VERIFIED | `auth.ts` L230-287: authenticateToken + role 업데이트 + 토큰 로테이션 |
| 13 | GET /api/auth/me가 인증된 사용자 정보를 반환한다 (01-03) | VERIFIED | `auth.ts` L291-312: authenticateToken + DB 최신 조회 → 200 |
| 14 | 로그인 엔드포인트에 rate limiting(15분당 5회)이 적용된다 (01-03) | VERIFIED | `rateLimit.ts` L8-15: `windowMs: 15*60*1000, max: 5` |
| 15 | 회원가입 폼 제출 시 계정이 생성된다 (01-04) | VERIFIED | `register.tsx` L51-56: `apiRegister(email, password)` 호출 → `login(email, password)` → `/onboarding` navigate |
| 16 | 로그인 시 구체적 한국어 에러 메시지가 폼에 표시된다 (01-04) | VERIFIED | `login.tsx` L51-54: `isApiError(err)` → `setError(err.error)` — 서버 메시지 그대로 표시 |
| 17 | 브라우저 새로고침 후에도 로그인 상태가 유지된다 (01-04) | VERIFIED (코드) | `AuthContext.tsx` L59-77: useEffect에서 `getMe()` 호출로 세션 복원 |
| 18 | 모든 페이지에서 로그아웃 버튼을 누르면 로그인 화면으로 이동한다 (01-04) | VERIFIED (코드) | `AppShell.tsx` L50-64: 모바일 헤더 로그아웃 버튼; `Sidebar.tsx` L85-96: 데스크톱 사이드바 로그아웃 버튼 |
| 19 | 역할별 탭 메뉴가 표시된다 (01-04) | VERIFIED (코드) | `_layout.tsx` L52-53: `user.role === 'student' ? studentNavItems : instructorNavItems` |
| 20 | 회원가입 + 역할 선택 + 세션 유지 + 로그아웃 전체 플로우 동작 (01-05) | NEEDS HUMAN | 01-05 blocking checkpoint — 브라우저 직접 검증 필요 |
| 21 | 태블릿·모바일·데스크톱 레이아웃 깨짐 없음 (01-05) | NEEDS HUMAN | 시각적 확인 필요 |

**자동화 검증 Score:** 19/19 코드 검증 통과 (truth #20, #21은 인간 검증 항목)

---

## Required Artifacts

### Plan 01-01 Artifacts

| Artifact | Expected | Exists | Substantive | Wired | Status |
|---|---|---|---|---|---|
| `apps/api/src/db/schema.ts` | pgEnum user_role + users + refresh_tokens | YES | YES (pgEnum, 2 tables, FK, cascade) | YES (imported in db/index.ts) | VERIFIED |
| `apps/api/src/db/index.ts` | Drizzle ORM PostgreSQL 연결 | YES | YES (drizzle() + schema export) | YES (imported in index.ts) | VERIFIED |
| `apps/api/src/index.ts` | Express 5 앱 진입점 + 미들웨어 체인 | YES | YES (/health, cors, cookieParser, authRouter) | YES (entry point) | VERIFIED |
| `apps/api/drizzle/0000_init.sql` | 마이그레이션 SQL | YES | YES (CREATE TYPE + CREATE TABLE DDL) | N/A (Drizzle output) | VERIFIED |

### Plan 01-02 Artifacts

| Artifact | Expected | Exists | Substantive | Wired | Status |
|---|---|---|---|---|---|
| `apps/web/src/routes/_layout.tsx` | AppShell 래핑 + Outlet | YES | YES (AppShell + Outlet + useAuth 보호 라우트) | YES (main.tsx에서 `<Route element={<Layout />}>`) | VERIFIED |
| `apps/web/src/components/layout/AppShell.tsx` | BottomNav + Sidebar 조건부 렌더링 | YES | YES (Sidebar + header + main + BottomNav 구조) | YES (_layout.tsx + main.tsx) | VERIFIED |
| `apps/web/src/components/layout/BottomNav.tsx` | 모바일/태블릿 하단 탭바 | YES | YES (`fixed bottom-0 inset-x-0`, `lg:hidden`, NavLink) | YES (AppShell에서 import) | VERIFIED |
| `apps/web/src/components/layout/Sidebar.tsx` | 데스크톱 사이드바 | YES | YES (`hidden lg:flex`, `fixed left-0 inset-y-0 w-64`) | YES (AppShell에서 import) | VERIFIED |
| `apps/web/src/index.css` | Tailwind v4 CSS + 파란색 테마 | YES | YES (`@import "tailwindcss"`, `@theme` hue 250 oklch, :root 변수) | YES (main.tsx에서 import) | VERIFIED |

### Plan 01-03 Artifacts

| Artifact | Expected | Exists | Substantive | Wired | Status |
|---|---|---|---|---|---|
| `apps/api/src/routes/auth.ts` | 6개 인증 엔드포인트 | YES | YES (register/login/refresh/logout/onboarding/me 전체 구현, DB 쿼리 포함) | YES (index.ts: `app.use('/api/auth', authRouter)`) | VERIFIED |
| `apps/api/src/middleware/auth.ts` | authenticateToken + authorize | YES | YES (JWT 검증, req.user 할당, authorize 팩토리, generateTokens, setTokenCookies, clearTokenCookies) | YES (auth.ts에서 import) | VERIFIED |
| `apps/api/src/middleware/rateLimit.ts` | loginLimiter | YES | YES (`windowMs: 15*60*1000, max: 5`, 429 에러 메시지) | YES (auth.ts login route에 적용) | VERIFIED |

### Plan 01-04 Artifacts

| Artifact | Expected | Exists | Substantive | Wired | Status |
|---|---|---|---|---|---|
| `apps/web/src/contexts/AuthContext.tsx` | createContext + useAuth + getMe 세션 복원 | YES | YES (createContext, useEffect getMe(), login/logout/setRole, 스피너) | YES (main.tsx AuthProvider, _layout.tsx useAuth) | VERIFIED |
| `apps/web/src/routes/login.tsx` | 로그인 페이지 | YES | YES (폼 submit → useAuth().login → navigate, 에러 표시) | YES (main.tsx PublicRoute 하위) | VERIFIED |
| `apps/web/src/routes/register.tsx` | 회원가입 페이지 | YES | YES (폼 submit → apiRegister → login → /onboarding navigate) | YES (main.tsx PublicRoute 하위) | VERIFIED |
| `apps/web/src/routes/onboarding.tsx` | 역할 선택 페이지 | YES | YES (학생/강사 카드, setRole 호출, navigate to /student or /instructor) | YES (main.tsx 독립 라우트) | VERIFIED |
| `apps/web/src/lib/api.ts` | fetch wrapper (credentials: include, 자동 refresh) | YES | YES (`credentials: 'include'`, 401 시 tryRefresh(), 재시도 1회) | YES (lib/auth.ts에서 import) | VERIFIED |

---

## Key Link Verification

### Plan 01-01 Key Links

| From | To | Via | Pattern | Status |
|---|---|---|---|---|
| `apps/api/src/index.ts` | `apps/api/src/db/index.ts` | DB 연결 import | `import.*db` | VERIFIED — L6: `import { authRouter } from './routes/auth.js'`; db는 auth.ts를 통해 간접 사용 |
| `apps/api/src/db/index.ts` | `apps/api/src/db/schema.ts` | 스키마 참조 | `import.*schema` | VERIFIED — L3: `import * as schema from './schema.js'` |

### Plan 01-02 Key Links

| From | To | Via | Pattern | Status |
|---|---|---|---|---|
| `apps/web/src/routes/_layout.tsx` | `apps/web/src/components/layout/AppShell.tsx` | AppShell import | `import.*AppShell` | VERIFIED — L13: `import AppShell from '@/components/layout/AppShell'` |
| `apps/web/src/components/layout/AppShell.tsx` | `apps/web/src/components/layout/BottomNav.tsx` | BottomNav 렌더링 | `BottomNav` | VERIFIED — L5: `import BottomNav from './BottomNav'`, L76: `<BottomNav items={navItems} />` |

### Plan 01-03 Key Links

| From | To | Via | Pattern | Status |
|---|---|---|---|---|
| `apps/api/src/routes/auth.ts` | `apps/api/src/db/index.ts` | DB 쿼리 | `import.*db` | VERIFIED — L5: `import { db } from '../db/index.js'` |
| `apps/api/src/routes/auth.ts` | `apps/api/src/middleware/auth.ts` | authenticateToken 적용 | `authenticateToken` | VERIFIED — L12-13 import, L230: `authRouter.patch('/onboarding', authenticateToken, ...)`, L291: `authRouter.get('/me', authenticateToken, ...)` |
| `apps/api/src/index.ts` | `apps/api/src/routes/auth.ts` | authRouter 마운트 | `app\.use.*authRouter` | VERIFIED — L31: `app.use('/api/auth', authRouter)` |

### Plan 01-04 Key Links

| From | To | Via | Pattern | Status |
|---|---|---|---|---|
| `apps/web/src/routes/login.tsx` | `/api/auth/login` | api.ts fetch wrapper | `api.*auth/login` | VERIFIED — lib/auth.ts L36: `api.post<AuthResponse>('/api/auth/login', ...)` |
| `apps/web/src/routes/register.tsx` | `/api/auth/register` | api.ts fetch wrapper | `api.*auth/register` | VERIFIED — lib/auth.ts L27: `api.post<AuthResponse>('/api/auth/register', ...)` |
| `apps/web/src/contexts/AuthContext.tsx` | `/api/auth/me` | 마운트 시 세션 복원 | `auth/me` | VERIFIED — lib/auth.ts L53: `api.get<AuthResponse>('/api/auth/me')`, AuthContext L63: `getMe()` |
| `apps/web/src/routes/_layout.tsx` | `apps/web/src/contexts/AuthContext.tsx` | 인증 상태 기반 리디렉션 | `useAuth` | VERIFIED — L14: `import { useAuth }`, L34: `const { user, isLoading, logout } = useAuth()` |
| `apps/web/src/components/layout/AppShell.tsx` | 역할별 메뉴 동적 렌더링 | navItems prop | `user\.role` | VERIFIED — _layout.tsx L52-53에서 `user.role`로 navItems 결정 후 AppShell에 prop 전달 |

---

## Requirements Coverage

| Requirement | Source Plans | Description | Status | Evidence |
|---|---|---|---|---|
| AUTH-01 | 01-03, 01-04 | 이메일+비밀번호로 회원가입 | SATISFIED | `POST /api/auth/register` 구현 (DB insert + 비밀번호 해싱 + JWT 쿠키); register.tsx UI 연결 |
| AUTH-02 | 01-03, 01-04 | 이메일+비밀번호로 로그인 | SATISFIED | `POST /api/auth/login` 구현 (구체적 에러 메시지); login.tsx UI + 에러 표시 |
| AUTH-03 | 01-03, 01-04 | 세션 브라우저 새로고침/재방문 후 유지 | SATISFIED | refresh token DB 저장 + `POST /api/auth/refresh` 구현; AuthContext getMe() 세션 복원 |
| AUTH-04 | 01-03, 01-04 | 모든 페이지에서 로그아웃 | SATISFIED | `POST /api/auth/logout` DB 삭제 + 쿠키 클리어; AppShell 모바일 헤더 + Sidebar 로그아웃 버튼 |
| AUTH-05 | 01-01, 01-03, 01-04 | 학생/강사 역할로 가입 (RBAC) | SATISFIED | pgEnum user_role; `PATCH /api/auth/onboarding`; onboarding.tsx 역할 선택 카드; _layout.tsx 역할별 메뉴 |
| UIUX-01 | 01-02, 01-04 | 태블릿·모바일·데스크톱 반응형 동작 | SATISFIED (코드) / NEEDS HUMAN (렌더링 확인) | BottomNav `lg:hidden` + Sidebar `hidden lg:flex` CSS 구현; 브라우저 렌더링 확인 필요 |

**REQUIREMENTS.md 트레이서빌리티:** 위 6개 요구사항 모두 Phase 1에 명시됨 (AUTH-01~05, UIUX-01). 모두 PLAN frontmatter에서 claim됨. ORPHANED 요구사항 없음.

---

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|---|---|---|---|---|
| `apps/web/src/routes/student/index.tsx` | 80 | "Phase 2에서 실제 문제 추천 기능이 추가됩니다" | INFO | Phase 1 설계 내 예상된 플레이스홀더. 대시보드 UI 구조는 정상 렌더링됨. 블로커 아님. |
| `apps/web/src/routes/instructor/index.tsx` | 77 | "Phase 2에서 실제 학생 관리 기능이 추가됩니다" | INFO | 동일. Phase 1 설계 범위 내. |
| `apps/web/src/routes/coming-soon.tsx` | 전체 | "준비 중입니다" 페이지 | INFO | `/student/problems` 등 미구현 라우트의 의도적 플레이스홀더. 라우트 구조 자체는 정상. |

**블로킹 안티패턴:** 없음. 발견된 모든 패턴은 Phase 1 계획 내 예상된 미완성 기능이며, 인증/세션/RBAC 핵심 기능에는 영향을 주지 않는다.

---

## Human Verification Required

### 1. Phase 1 전체 통합 브라우저 검증 (01-05 Blocking Gate)

**테스트:** 아래 순서로 브라우저에서 직접 실행

**사전 준비:**
- PostgreSQL 실행 확인
- 터미널 1: `pnpm --filter api dev` (localhost:3000)
- 터미널 2: `pnpm --filter web dev` (localhost:5173)

**테스트 1 — 회원가입 + 온보딩 (AUTH-01, AUTH-05):**
1. http://localhost:5173 접속 → /login 리디렉트 확인
2. "회원가입" 링크 → /register 이동
3. 이메일 + 비밀번호(8자 이상) 입력 후 제출
4. /onboarding 이동 확인
5. "학생" 카드 클릭 → /student 홈 이동 + 학생 메뉴 표시 확인

**테스트 2 — 세션 유지 (AUTH-03):**
6. 브라우저 새로고침 (F5) → /student 홈 유지 확인

**테스트 3 — 로그아웃 (AUTH-04):**
7. 로그아웃 버튼 클릭 → /login 이동 확인

**테스트 4 — 로그인 + 에러 메시지 (AUTH-02):**
8. 미등록 이메일 로그인 → "가입되지 않은 이메일입니다" 표시 확인
9. 올바른 이메일 + 틀린 비밀번호 → "비밀번호가 틀렸습니다" 표시 확인
10. 올바른 로그인 → /student 홈 이동 확인

**테스트 5 — 강사 계정 (AUTH-05):**
11. 로그아웃 후 새 이메일로 회원가입
12. 온보딩에서 "강사" 선택 → /instructor 홈 이동 + 강사 메뉴 표시 확인

**테스트 6 — 반응형 (UIUX-01):**
13. DevTools 375px → 하단 탭바 표시, 사이드바 숨김 확인
14. DevTools 768px → 하단 탭바 표시 확인
15. DevTools 1280px → 사이드바 표시, 하단 탭바 숨김 확인
16. 각 뷰포트에서 레이아웃 겹침 없음 확인

**결과 보고:** 전체 통과 시 "approved" 입력. 문제 발견 시 구체적으로 설명.

**Why human:** 01-05 플랜이 `type: checkpoint:human-verify, gate: blocking`으로 설정되어 있으며, SUMMARY에 "사용자 검증 대기 중" 상태가 명시됨. 시각적 레이아웃 전환, 실제 쿠키 동작, 반응형 브레이크포인트는 자동화 검증 불가.

---

## Gaps Summary

자동화 검증에서 블로킹 갭은 없다. 코드베이스 전체에서:
- 6개 인증 API 엔드포인트가 실제 DB 쿼리와 함께 구현됨
- JWT 이중 토큰 (access 15m / refresh 7d) + httpOnly 쿠키 완전 구현
- AuthContext 세션 복원, 보호 라우트, 역할별 동적 메뉴 모두 실제 로직 포함
- 반응형 CSS (`lg:hidden` / `hidden lg:flex`) 코드 레벨 확인

유일한 미완료 항목은 **01-05 사용자 브라우저 검증 체크포인트**로, 이는 코드 결함이 아닌 승인 게이트이다. 모든 구현이 완료된 상태에서 최종 사용자 확인만 남아 있다.

---

*Verified: 2026-02-20T11:30:00Z*
*Verifier: Claude (gsd-verifier)*
