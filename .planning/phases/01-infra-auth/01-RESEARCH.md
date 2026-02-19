# Phase 1: 기반 인프라 + 인증 - Research

**Researched:** 2026-02-19
**Domain:** 모노레포 세팅, 이메일 인증(JWT), RBAC, 반응형 앱 셸
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### 앱 레이아웃 구조
- 네비게이션: 모바일에서 하단 탭바 사용 (기출탭탭과 동일한 패턴)
- 반응형 기준: 태블릿 우선(tablet-first) 디자인 — 고등학생 태블릿 사용 비율이 높으므로 태블릿 기준으로 디자인 후 모바일/데스크톱으로 조정
- 비주얼 톤: 기출탭탭 스타일 — 파란색 계열 기반, 교육 앱 느낌, 깨끗하고 신뢰감 있는 디자인

#### 회원가입/로그인 흐름
- 가입 폼: 이메일 + 비밀번호만 수집 (최소한의 필드)
- 역할 선택: 가입 후 첫 로그인 시 온보딩 화면에서 학생/강사 역할 선택
- 비밀번호 규칙: 기본 수준 (8자 이상) — 학생들이 쉽게 설정 가능하도록
- 로그인 에러: 구체적 메시지 표시 ("비밀번호가 틀렸습니다", "가입되지 않은 이메일입니다" 등 사용성 우선)

### Claude's Discretion
- 학생/강사 레이아웃 분리 방식 (완전 분리 vs 공유 레이아웃 + 동적 메뉴)
- 데스크톱에서의 네비게이션 패턴 (하단 탭바 유지 vs 사이드바 전환)
- 정확한 breakpoint 수치 및 그리드 시스템
- JWT 토큰 전략 (access/refresh 토큰 구성)
- 세션 만료 시간 및 다중 기기 로그인 정책
- 프로젝트 구조 (모노레포 vs 분리) 및 폴더 컨벤션
- DB 마이그레이션 전략 및 초기 스키마 설계

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| AUTH-01 | 사용자가 이메일과 비밀번호로 회원가입할 수 있다 | bcrypt 해싱 + Drizzle users 테이블 + Express 5 POST /auth/register 엔드포인트 |
| AUTH-02 | 사용자가 이메일과 비밀번호로 로그인할 수 있다 | bcrypt.compare + JWT access/refresh 토큰 발급 패턴 |
| AUTH-03 | 사용자의 로그인 세션이 브라우저 새로고침/재방문 시에도 유지된다 | access token (15m) + refresh token (7d) + localStorage/httpOnly cookie 전략 |
| AUTH-04 | 사용자가 모든 페이지에서 로그아웃할 수 있다 | refresh token 무효화 + 클라이언트 토큰 삭제 + React Router redirect |
| AUTH-05 | 사용자가 학생 또는 강사 역할로 가입할 수 있다 (RBAC) | Drizzle pgEnum role + 온보딩 화면 + React Router role-based protected routes |
| UIUX-01 | 태블릿·모바일·데스크톱에서 반응형으로 동작한다 | Tailwind v4 breakpoints + tablet-first grid + 조건부 하단탭바/사이드바 |
</phase_requirements>

---

## Summary

Phase 1은 세 개의 독립적인 레이어로 구성된다: (1) 프로젝트 인프라(모노레포 + DB), (2) 이메일/JWT 인증 백엔드, (3) React 프론트엔드 라우팅 + UI 셸. 각 레이어는 명확히 분리 구현 가능하므로 병렬 태스크로 분해하기 좋다.

기술 스택은 모두 확정되어 있다: React 19 + Vite 7 + Tailwind v4 + shadcn/ui (프론트), Express 5 + Drizzle ORM + PostgreSQL (백엔드). Express 5는 2024년 10월 15일 안정 릴리즈됐으며, async 라우트 핸들러가 자동으로 오류를 catch하는 것이 핵심 변경사항이다. Tailwind v4는 CSS-first 설정 방식으로 전환되어 `tailwind.config.js` 파일이 필요 없고, Vite 플러그인 방식을 사용한다.

JWT 전략은 access token(15분) + refresh token(7일) 이중 토큰 방식으로 결정한다. refresh token은 DB에 저장하여 무효화 가능하게 하고, access token은 httpOnly cookie에 저장한다. React Router 7의 `loader` 기반 리디렉션 패턴이 보호 라우트 구현에 적합하다.

**Primary recommendation:** pnpm 워크스페이스 모노레포(apps/web + apps/api)로 구성하고, JWT access/refresh 이중 토큰 + bcrypt 해싱 + Drizzle pgEnum role 방식을 사용한다.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react | 19.x | UI 프레임워크 | 확정된 선택 |
| vite | 7.x | 빌드 도구 | 확정된 선택 |
| tailwindcss | 4.x | 유틸리티 CSS | 확정된 선택; v4는 Vite 플러그인 방식 |
| @tailwindcss/vite | 4.x | Tailwind v4 Vite 통합 | v4 전용 플러그인 (tailwind.config.js 불필요) |
| shadcn/ui | latest | UI 컴포넌트 | 확정된 선택; v4 완전 지원 |
| react-router | 7.x | SPA 라우팅 + 보호 라우트 | loader 기반 auth guard 지원 |
| express | 5.x | Node.js 백엔드 | 확정된 선택; async 오류 자동 처리 |
| drizzle-orm | latest | TypeScript ORM | 확정된 선택 |
| drizzle-kit | latest | 마이그레이션 CLI | Drizzle과 짝 |
| pg / postgres | latest | PostgreSQL 드라이버 | Drizzle node-postgres 어댑터용 |
| jsonwebtoken | 9.x | JWT 서명/검증 | Node.js 표준 JWT 라이브러리 (auth0) |
| bcrypt | 5.x | 비밀번호 해싱 | 브루트포스 방어에 최적화된 알고리즘 |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| vite-plugin-pwa | latest | PWA 서비스 워커 | 오프라인 지원, 앱 설치 가능 |
| cors | 2.x | Express CORS 미들웨어 | 프론트-백 분리 배포 시 |
| express-rate-limit | latest | 로그인 rate limiting | 브루트포스 방어 (로그인 5회/15분) |
| zod | 3.x | 요청 본문 검증 | 이메일/비밀번호 유효성 검사 |
| dotenv | latest | 환경변수 로드 | 개발 환경 설정 |
| @types/node | latest | Node.js 타입 | TypeScript 개발 환경 |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| jsonwebtoken | jose | jose는 Web Crypto API 기반으로 Edge 환경 지원; Node.js 전용이면 jsonwebtoken이 더 성숙 |
| bcrypt | argon2 | argon2가 더 최신이나 bcrypt가 Node.js 생태계에서 더 검증됨 |
| pnpm workspace | turborepo | v1 단계에선 turborepo 오버엔지니어링; pnpm workspace만으로 충분 |
| react-router v7 | TanStack Router | TanStack Router가 타입 안전성 더 강력하나 생태계 성숙도는 react-router가 높음 |

**Installation:**
```bash
# 프론트엔드
pnpm create vite@latest web -- --template react-ts
pnpm add react-router
pnpm add -D tailwindcss @tailwindcss/vite
pnpm dlx shadcn@latest init

# 백엔드
pnpm add express bcrypt jsonwebtoken drizzle-orm pg cors express-rate-limit zod dotenv
pnpm add -D @types/express @types/bcrypt @types/jsonwebtoken @types/pg drizzle-kit tsx typescript
```

---

## Architecture Patterns

### Recommended Project Structure
```
textbook-learning-assistant/          # 모노레포 루트
├── pnpm-workspace.yaml               # 워크스페이스 정의
├── package.json                      # 루트 공통 devDependencies
├── apps/
│   ├── web/                          # React 프론트엔드
│   │   ├── src/
│   │   │   ├── routes/               # React Router 라우트 모듈
│   │   │   │   ├── _layout.tsx       # 루트 레이아웃 (하단 탭바)
│   │   │   │   ├── login.tsx
│   │   │   │   ├── register.tsx
│   │   │   │   ├── onboarding.tsx    # 역할 선택 화면
│   │   │   │   ├── student/          # 학생 전용 라우트
│   │   │   │   └── instructor/       # 강사 전용 라우트
│   │   │   ├── components/
│   │   │   │   ├── ui/               # shadcn 컴포넌트 (자동 생성)
│   │   │   │   ├── layout/           # AppShell, BottomNav, Sidebar
│   │   │   │   └── auth/             # LoginForm, RegisterForm
│   │   │   ├── lib/
│   │   │   │   ├── auth.ts           # 토큰 관리 유틸리티
│   │   │   │   └── api.ts            # fetch wrapper with auth header
│   │   │   └── main.tsx
│   │   ├── vite.config.ts
│   │   └── package.json
│   └── api/                          # Express 백엔드
│       ├── src/
│       │   ├── db/
│       │   │   ├── schema.ts         # Drizzle 스키마 (users 테이블)
│       │   │   └── index.ts          # DB 연결
│       │   ├── middleware/
│       │   │   ├── auth.ts           # JWT 검증 미들웨어
│       │   │   └── rateLimit.ts      # rate limiting
│       │   ├── routes/
│       │   │   └── auth.ts           # /register, /login, /refresh, /logout
│       │   └── index.ts              # Express 앱 진입점
│       ├── drizzle.config.ts
│       └── package.json
└── .planning/
```

### Pattern 1: Drizzle ORM — Users 테이블 스키마 (RBAC)
**What:** pgEnum으로 학생/강사 역할을 타입 안전하게 정의
**When to use:** AUTH-05 요구사항 — 역할 기반 접근 제어

```typescript
// Source: https://orm.drizzle.team/docs/sql-schema-declaration
import { pgTable, pgEnum, integer, varchar, text, timestamp, boolean } from 'drizzle-orm/pg-core';

// 역할 enum — 마이그레이션에 포함됨
export const userRoleEnum = pgEnum('user_role', ['student', 'instructor']);

export const users = pgTable('users', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: userRoleEnum('role'),               // null = 온보딩 미완료
  isOnboarded: boolean('is_onboarded').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// refresh_tokens 테이블 — DB 저장으로 로그아웃 시 무효화 가능
export const refreshTokens = pgTable('refresh_tokens', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
```

**주의:** `role`을 nullable로 설계 — 가입 직후에는 NULL이며, 온보딩 화면에서 선택 후 업데이트. `isOnboarded` 플래그로 온보딩 완료 여부 추적.

### Pattern 2: Express 5 — JWT 인증 미들웨어 + 인증 라우터
**What:** Express 5의 async 자동 오류 처리 + JWT 검증 미들웨어
**When to use:** AUTH-02, AUTH-03, AUTH-04 구현

```typescript
// Source: https://context7.com/auth0/node-jsonwebtoken/llms.txt
// Source: https://expressjs.com/en/5x/api
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { Request, Response, NextFunction } from 'express';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

// JWT 인증 미들웨어 (Express 5 — async 오류 자동 처리)
export async function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.accessToken;  // httpOnly cookie에서 읽기
  if (!token) {
    return res.status(401).json({ error: '인증이 필요합니다' });
  }
  const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);  // Express 5에서 throw = 자동 500
  req.user = decoded as JwtPayload;
  next();
}

// 역할 기반 권한 미들웨어
export function authorize(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: '권한이 없습니다' });
    }
    next();
  };
}

// 로그인 라우트 (Express 5 — async 핸들러에서 try/catch 불필요)
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (!user[0]) {
    return res.status(401).json({ error: '가입되지 않은 이메일입니다' });
  }

  const isValid = await bcrypt.compare(password, user[0].passwordHash);
  if (!isValid) {
    return res.status(401).json({ error: '비밀번호가 틀렸습니다' });
  }

  const accessToken = jwt.sign(
    { userId: user[0].id, email: user[0].email, role: user[0].role },
    ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );

  const refreshToken = jwt.sign(
    { userId: user[0].id, tokenType: 'refresh' },
    REFRESH_TOKEN_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );

  // refresh token을 DB에 저장
  await db.insert(refreshTokens).values({
    userId: user[0].id,
    token: refreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  // httpOnly cookie로 전달 (XSS 방어)
  res.cookie('accessToken', accessToken, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 15 * 60 * 1000 });
  res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });

  res.json({ user: { id: user[0].id, email: user[0].email, role: user[0].role, isOnboarded: user[0].isOnboarded } });
});
```

**Express 5 핵심 변경사항:**
- async 라우트 핸들러에서 throw된 오류가 자동으로 `next(err)` 처리됨 — try/catch 불필요
- `bodyParser()`가 제거됨 — `express.json()`, `express.urlencoded()` 개별 사용
- 오류 핸들러는 반드시 `(err, req, res, next)` 4개 파라미터 필요

### Pattern 3: React Router v7 — 보호 라우트 + RBAC
**What:** React Router 7의 `loader` 함수에서 auth 체크 + `redirect` 반환
**When to use:** AUTH-05 — 역할별 라우트 보호

```typescript
// Source: https://reactrouter.com/7.10.0/start/framework/navigating
// Source: https://www.robinwieruch.de/react-router-private-routes/
import { redirect } from 'react-router';

// 앱 레이아웃 라우트의 loader — 모든 보호 라우트의 진입점
export async function loader({ request }: Route.LoaderArgs) {
  const user = await getAuthUser(request);  // cookie에서 토큰 검증 + API 호출

  if (!user) {
    return redirect('/login');
  }

  if (!user.isOnboarded) {
    return redirect('/onboarding');
  }

  return { user };
}

// 역할별 라우트 보호
export async function studentLoader({ request }: Route.LoaderArgs) {
  const user = await getAuthUser(request);
  if (!user || user.role !== 'student') {
    return redirect('/');
  }
  return { user };
}

// ProtectedRoute 컴포넌트 패턴 (단순 RBAC에 유용)
function ProtectedRoute({ isAllowed, redirectPath = '/', children }: {
  isAllowed: boolean;
  redirectPath?: string;
  children?: React.ReactNode;
}) {
  if (!isAllowed) {
    return <Navigate to={redirectPath} replace />;
  }
  return children ? children : <Outlet />;
}
```

### Pattern 4: Tailwind v4 — 태블릿 우선 반응형 + Vite 설정
**What:** Tailwind v4는 CSS-first 방식, Vite 플러그인으로 설정
**When to use:** UIUX-01 — 태블릿·모바일·데스크톱 반응형

```typescript
// Source: https://ui.shadcn.com/docs/installation/vite
// vite.config.ts
import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
});
```

```css
/* src/index.css — tailwind.config.js 불필요 */
@import "tailwindcss";

/* 커스텀 테마 (CSS @theme 지시자) */
@theme {
  --color-primary: oklch(55% 0.2 250);  /* 파란색 계열 */
  --breakpoint-tablet: 768px;
  --breakpoint-desktop: 1280px;
}
```

**태블릿 우선 breakpoint 전략:**
- 기본(base): 모바일 (< 768px) — 하단 탭바
- `md:` (768px+): 태블릿 — 기본 디자인 기준, 하단 탭바 유지
- `lg:` (1024px+): 데스크톱 — 사이드바로 전환

```typescript
// 조건부 네비게이션 컴포넌트 예시
function AppLayout() {
  return (
    <div className="min-h-screen">
      <main className="pb-16 lg:pb-0 lg:pl-64">  {/* 모바일: 하단 여백, 데스크톱: 사이드 여백 */}
        <Outlet />
      </main>
      {/* 모바일/태블릿: 하단 탭바, 데스크톱: 사이드바 */}
      <BottomNav className="lg:hidden fixed bottom-0 inset-x-0" />
      <Sidebar className="hidden lg:flex fixed left-0 inset-y-0 w-64" />
    </div>
  );
}
```

### Pattern 5: Drizzle Kit — 마이그레이션 설정
**What:** drizzle.config.ts + npx drizzle-kit migrate 워크플로우

```typescript
// Source: https://orm.drizzle.team/docs/drizzle-kit-migrate
// apps/api/drizzle.config.ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

```bash
# 마이그레이션 생성 및 적용
npx drizzle-kit generate --name=init
npx drizzle-kit migrate
```

### Pattern 6: shadcn/ui — Tailwind v4 설치
**What:** shadcn@latest init 명령으로 Tailwind v4 지원 자동 설정

```bash
# Source: https://ui.shadcn.com/docs/installation/vite
pnpm create vite@latest web -- --template react-ts
pnpm add tailwindcss @tailwindcss/vite
pnpm add -D @types/node
pnpm dlx shadcn@latest init
# 질문: Base color → Neutral (또는 Blue 계열 커스텀)
pnpm dlx shadcn@latest add button input label form card tabs
```

### Anti-Patterns to Avoid
- **Access Token을 localStorage에 저장:** XSS에 취약 — httpOnly cookie 사용
- **Refresh Token을 메모리에만 저장:** 서버 재시작 시 소멸, 로그아웃 불가 — DB 저장 필수
- **역할 확인을 클라이언트에서만:** UI가 숨겨져도 API가 뚫림 — 서버 미들웨어에서 반드시 검증
- **Express 5에서 try/catch 남발:** async 핸들러는 자동 오류 처리 — 불필요한 try/catch 제거
- **Tailwind v4에서 tailwind.config.js 생성:** v4는 CSS @theme 방식 — config 파일 불필요
- **역할 없는 상태를 빈 string으로 저장:** pgEnum의 null 허용이 더 명시적이고 타입 안전

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| 비밀번호 해싱 | 커스텀 해싱 함수 | `bcrypt` | 솔트 자동 생성, 적응형 비용 인자, 수십 년 검증 |
| JWT 서명/검증 | 커스텀 토큰 | `jsonwebtoken` | 알고리즘 취약점(None attack 등) 방어 내장 |
| DB 스키마 마이그레이션 | 수동 SQL | `drizzle-kit generate + migrate` | 타입 추론, diff 계산, 롤백 지원 |
| UI 컴포넌트 | 커스텀 input/button | `shadcn/ui` | 접근성(ARIA), 포커스 관리, 키보드 탐색 |
| Rate limiting | 커스텀 카운터 | `express-rate-limit` | 분산 요청 추적, IP별 제한, 메모리 스토어 |
| 폼 검증 | 커스텀 regex | `zod` | 타입 안전 스키마, 구체적 에러 메시지 |

**Key insight:** 인증은 보안에 민감한 영역이다. 작은 실수 하나(솔트 없이 해싱, alg:none 허용 등)가 전체 사용자 계정 노출로 이어진다. 검증된 라이브러리 사용이 절대적으로 중요하다.

---

## Common Pitfalls

### Pitfall 1: httpOnly Cookie vs Authorization Header 혼용
**What goes wrong:** 프론트엔드에서 `Authorization: Bearer` 헤더를 사용하면 localStorage에 token을 저장해야 하고, XSS 취약점에 노출됨
**Why it happens:** JWT 튜토리얼 대부분이 localStorage 방식을 사용
**How to avoid:** httpOnly cookie로 access/refresh token 모두 전달. 프론트에서는 `credentials: 'include'` 옵션으로 자동 포함
**Warning signs:** 클라이언트 JS에서 `localStorage.getItem('accessToken')` 코드가 보이면 위험

### Pitfall 2: refresh token 무효화 불가
**What goes wrong:** refresh token을 서버 메모리(Set)나 서명만으로 검증하면 로그아웃 후에도 기존 refresh token이 유효
**Why it happens:** "stateless JWT"의 순수 구현을 따라가면 발생
**How to avoid:** DB의 `refresh_tokens` 테이블에 token을 저장하고, 로그아웃 시 해당 행 삭제
**Warning signs:** 로그아웃 후에도 refresh token으로 새 access token 발급 가능하면 문제

### Pitfall 3: Tailwind v4 설정 파일 충돌
**What goes wrong:** `tailwind.config.js`를 만들고 v4 플러그인과 함께 쓰면 스타일 충돌 발생
**Why it happens:** v3 마이그레이션 문서를 따라가거나 AI가 v3 방식을 제안
**How to avoid:** v4에서는 `@tailwindcss/vite` 플러그인 + CSS `@theme` 지시자만 사용. `tailwind.config.js` 파일 생성 금지
**Warning signs:** `import tailwindcss from 'tailwindcss'`가 vite config에 있으면 v3 방식

### Pitfall 4: Express 5에서 오류 핸들러 파라미터 누락
**What goes wrong:** `(err, req, res)` 3개 파라미터로 오류 핸들러를 정의하면 Express 5가 일반 미들웨어로 인식
**Why it happens:** Express 4 코드 복붙
**How to avoid:** 오류 핸들러는 반드시 `(err, req, res, next)` 4개 파라미터
**Warning signs:** 오류가 catch되지 않고 클라이언트에 HTML 오류 페이지가 반환됨

### Pitfall 5: 역할 검증을 프론트에서만 수행
**What goes wrong:** React Router의 ProtectedRoute로만 역할 체크하면 API를 직접 호출하는 경우 뚫림
**Why it happens:** UI 레이어와 API 레이어를 분리해서 생각하지 못함
**How to avoid:** Express 미들웨어에서 `authorize('instructor')` 반드시 적용. 프론트 체크는 UX 목적으로만
**Warning signs:** `/api/admin` 같은 엔드포인트에 auth 미들웨어 없음

### Pitfall 6: pgEnum 마이그레이션 순서 오류
**What goes wrong:** enum을 사용하는 테이블보다 enum 타입이 나중에 생성되면 마이그레이션 실패
**Why it happens:** 스키마 파일에서 테이블 정의 순서가 잘못됨
**How to avoid:** enum 정의를 테이블보다 먼저 export. Drizzle Kit이 보통 자동 처리하지만 수동 마이그레이션 시 주의
**Warning signs:** `type "user_role" does not exist` 오류

### Pitfall 7: 온보딩 상태 불일치
**What goes wrong:** 사용자가 온보딩 완료 전에 새로고침하면 역할 없는 상태로 앱 내부 진입
**Why it happens:** 세션 유지와 온보딩 상태를 별도로 관리하지 않음
**How to avoid:** React Router loader에서 `!user.isOnboarded` 체크 → `/onboarding` 리디렉션. 모든 보호 라우트에 적용
**Warning signs:** `user.role === null`인 상태로 학생/강사 UI에 접근 가능

---

## Code Examples

### 완전한 JWT 인증 흐름 (토큰 발급 + 검증)
```typescript
// Source: https://context7.com/auth0/node-jsonwebtoken/llms.txt
// apps/api/src/middleware/auth.ts
import jwt from 'jsonwebtoken';

function generateTokens(user: { id: number; email: string; role: string | null }) {
  const accessToken = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.ACCESS_TOKEN_SECRET!,
    { expiresIn: '15m' }
  );
  const refreshToken = jwt.sign(
    { userId: user.id, tokenType: 'refresh' },
    process.env.REFRESH_TOKEN_SECRET!,
    { expiresIn: '7d' }
  );
  return { accessToken, refreshToken };
}
```

### Drizzle ORM PostgreSQL 연결 + 마이그레이션 적용
```typescript
// Source: https://github.com/drizzle-team/drizzle-orm-docs
// apps/api/src/db/index.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';

export const db = drizzle(process.env.DATABASE_URL!);

// 앱 시작 시 마이그레이션 자동 적용
await migrate(db, { migrationsFolder: './drizzle' });
```

### shadcn/ui 컴포넌트 추가 명령
```bash
# Source: https://ui.shadcn.com/docs/installation/vite
pnpm dlx shadcn@latest add button
pnpm dlx shadcn@latest add input
pnpm dlx shadcn@latest add form
pnpm dlx shadcn@latest add card
pnpm dlx shadcn@latest add tabs
```

### pnpm-workspace.yaml 설정
```yaml
# 루트 pnpm-workspace.yaml
packages:
  - 'apps/*'
```

### React Router loader 기반 auth + 역할 보호
```typescript
// Source: https://reactrouter.com/7.10.0/start/framework/navigating
// apps/web/src/routes/_layout.tsx
import { redirect } from 'react-router';

export async function loader({ request }: Route.LoaderArgs) {
  const res = await fetch('/api/auth/me', {
    headers: { Cookie: request.headers.get('Cookie') || '' },
    credentials: 'include',
  });

  if (!res.ok) return redirect('/login');

  const user = await res.json();
  if (!user.isOnboarded) return redirect('/onboarding');

  return { user };
}
```

---

## State of the Art (2025 기준)

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `serial` primary key | `generatedAlwaysAsIdentity()` | PostgreSQL 10+ / Drizzle 2024 | 표준 SQL 준수, 시퀀스 직접 접근 방지 |
| `tailwind.config.js` | CSS `@theme` 지시자 + `@tailwindcss/vite` | Tailwind v4 (2024) | 빌드 설정 단순화, tree-shaking 개선 |
| Express 4 async try/catch | Express 5 자동 오류 처리 | Express 5.0 (2024-10) | 보일러플레이트 코드 대폭 감소 |
| JWT in localStorage | JWT in httpOnly Cookie | OWASP 권장 (지속) | XSS 공격으로 토큰 탈취 방지 |
| Passport.js | 직접 JWT/bcrypt 구현 | 2023-2025 트렌드 | Passport.js 추상화가 불필요, 유지보수 단순화 |
| `React.forwardRef` in shadcn | 일반 함수 컴포넌트 + `data-slot` | shadcn v4 지원 (2025) | React 19 호환성, 코드 단순화 |

**Deprecated/outdated:**
- `bodyParser` 패키지: Express 5에서 제거됨 — `express.json()` 사용
- `tailwindcss-animate`: Tailwind v4에서 `tw-animate-css`로 교체 권장
- `serial`/`bigserial`: PostgreSQL 권장 사항에서 identity columns로 대체

---

## Open Questions

1. **httpOnly Cookie vs SPA 통신 방식**
   - What we know: httpOnly cookie는 XSS 방어에 유리하지만, SPA에서 CORS와 조합 시 `credentials: 'include'` 설정이 필요
   - What's unclear: 개발 환경에서 프론트(localhost:5173)와 백엔드(localhost:3000)가 다른 포트를 사용할 때 `SameSite: 'strict'`와 충돌 가능
   - Recommendation: 개발 환경에서 `SameSite: 'lax'` + `Secure: false` 사용, 프로덕션에서만 `strict` + `secure`

2. **학생/강사 레이아웃 완전 분리 vs 공유 레이아웃**
   - What we know: 두 역할 모두 하단 탭바를 사용하며, 탭 항목만 다름
   - What's unclear: 강사가 학생 화면을 미리보기 할 수 있는 기능이 나중에 필요할지
   - Recommendation: 공유 레이아웃 + 동적 메뉴 방식 채택. `user.role`에 따라 탭바 항목 조건부 렌더링 — 나중에 역할 전환이 더 쉬움

3. **다중 기기 로그인 정책**
   - What we know: `refresh_tokens` 테이블에 userId로 여러 행 저장 가능 → 다중 기기 기본 지원
   - What's unclear: 한 기기에서 로그아웃 시 다른 기기도 로그아웃시킬지 여부
   - Recommendation: v1에서는 해당 기기의 refresh token만 삭제 (단순화). "모든 기기 로그아웃" 기능은 향후 추가

4. **PWA 설정 우선순위**
   - What we know: `vite-plugin-pwa`로 서비스 워커 자동 생성 가능
   - What's unclear: Phase 1에서 PWA가 UIUX-01의 필수 요건인지, 아니면 반응형 레이아웃만으로 충분한지
   - Recommendation: Phase 1에서 기본 PWA manifest만 설정 (앱 설치 가능). 오프라인 캐싱은 Phase 2 이후

---

## Sources

### Primary (HIGH confidence)
- `/drizzle-team/drizzle-orm-docs` (Context7) — PostgreSQL 스키마, migrations, drizzle-kit 설정
- `/auth0/node-jsonwebtoken` (Context7) — JWT sign/verify API, access/refresh 토큰 패턴
- `/websites/expressjs_en_5x` (Context7) — Express 5 라우터, 미들웨어, 오류 처리
- `/websites/reactrouter` (Context7) — React Router 7 loader redirect, middleware, auth 패턴
- `https://ui.shadcn.com/docs/installation/vite` (Official) — Tailwind v4 + shadcn/ui 설치 단계
- `https://ui.shadcn.com/docs/tailwind-v4` (Official) — v3→v4 마이그레이션 차이점

### Secondary (MEDIUM confidence)
- `https://expressjs.com/2024/10/15/v5-release.html` (Official 릴리즈 노트) — Express 5 릴리즈 날짜, 변경사항
- `https://gist.github.com/productdevbook/7c9ce3bbeb96b3fabc3c7c2aa2abc717` (커뮤니티 + 공식 패턴) — Drizzle 2025 베스트 프랙티스 (identity columns, 부분 인덱스)
- `https://www.robinwieruch.de/react-router-private-routes/` (검증된 튜토리얼) — React Router 7 ProtectedRoute 패턴

### Tertiary (LOW confidence — 검증 필요)
- WebSearch 결과: 모노레포 pnpm workspace 구조 — 공식 pnpm docs로 검증 권장
- WebSearch 결과: `vite-plugin-pwa` 설정 — 공식 README 확인 필요

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — 모두 Context7 공식 소스 + 공식 릴리즈 노트로 확인
- Architecture: HIGH — Drizzle/Express 5/React Router 7 공식 패턴에서 직접 도출
- Pitfalls: HIGH — 공식 문서 + OWASP 보안 가이드라인 기반
- PWA 설정: MEDIUM — 공식 vite-plugin-pwa 문서 존재하나 세부 설정은 검증 필요

**Research date:** 2026-02-19
**Valid until:** 2026-03-19 (30일 — 스택이 안정적이나 Tailwind v4/shadcn이 빠르게 발전 중)
