# Stack Research

**Domain:** 수학 기출문제 학습 웹앱 (Math Exam Question Learning PWA)
**Researched:** 2026-02-19
**Confidence:** HIGH (core stack), MEDIUM (AI/ML dimension)

---

## Recommended Stack

### Core Technologies — Frontend

| Technology | Version | Purpose | Why Recommended | Confidence |
|------------|---------|---------|-----------------|------------|
| React | 19.2.4 | UI 프레임워크 | 압도적인 생태계. KaTeX 렌더링, 수식 컴포넌트 구성에 최적. PWA와 완벽 호환 | HIGH |
| TypeScript | 5.9.3 | 타입 안전성 | 프론트+백엔드 공유 타입 (문제/답안 스키마). 수식 파라미터 오류 방지 | HIGH |
| Vite | 7.3.1 | 빌드 도구 | React 19 공식 지원. vite-plugin-pwa 내장. HMR 속도 최고. CRA 대안으로 사실상 표준 | HIGH |
| vite-plugin-pwa | 1.2.0 | PWA Service Worker | Workbox 자동 통합. generateSW/injectManifest 두 방식 지원. 오프라인 문제 캐싱 필수 | HIGH |
| React Router | 7.13.0 | 클라이언트 라우팅 | v7 SPA 모드는 Vite 기반 앱에 충분. TanStack Router보다 학습 곡선 낮음. 강사/학생 라우트 분리 용이 | HIGH |
| Tailwind CSS | 4.2.0 | 스타일링 | v4 2025-01-22 정식 출시. CSS-first 설정. Vite 플러그인 공식 지원. shadcn/ui 호환 | HIGH |
| shadcn/ui | latest CLI | UI 컴포넌트 | Tailwind v4 + React 19 완전 호환(2025-02 업데이트). Radix UI 기반 접근성 보장. 문제 카드·모달에 최적 | HIGH |
| KaTeX | 0.16.28 | 수식 렌더링 | MathJax 대비 렌더링 속도 10x 빠름. 브라우저 의존 없음. 수학 기출문제 TeX 렌더링에 필수 | HIGH |

### Core Technologies — Backend

| Technology | Version | Purpose | Why Recommended | Confidence |
|------------|---------|---------|-----------------|------------|
| Node.js | 22 LTS | 서버 런타임 | 프론트와 언어 통일(TypeScript). 강사/학생 관리 API에 충분 | HIGH |
| Express | 5.2.1 | HTTP 프레임워크 | v5 안정화. 팀 학습 부담 최소. 풍부한 미들웨어 생태계. 간단한 REST API에 검증됨 | HIGH |
| PostgreSQL | 16+ | 주 데이터베이스 | 문제·단원·유형·난이도·BKT 상태를 관계형으로 모델링 최적. JSONB로 BKT 파라미터 저장 가능 | HIGH |
| Drizzle ORM | 0.45.1 | DB ORM | Prisma 대비 번들 90% 작음. TypeScript 스키마 → 즉시 타입 추론. 마이그레이션 SQL 직접 확인 가능. 교육 앱 쿼리 복잡도에 충분 | MEDIUM |

### Supporting Libraries — Frontend

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @tanstack/react-query | 5.90.21 | 서버 상태 관리 | 문제 목록/분석 결과 fetching. 캐시·재시도·백그라운드 갱신 자동화. API 호출 마다 useEffect 작성 방지 | HIGH |
| Zustand | 5.0.11 | 클라이언트 전역 상태 | 풀이 세션 진행 상태, 선택 답안, 오답 목록 등 UI 전용 상태. Redux보다 보일러플레이트 90% 적음 | HIGH |
| react-hook-form | 7.71.1 | 폼 관리 | 로그인·회원가입·문제 업로드 폼. 비제어 컴포넌트로 렌더 최소화 | HIGH |
| Zod | 4.3.6 | 스키마 검증 | 프론트·백 공유 유효성 검사 스키마. react-hook-form과 @hookform/resolvers로 통합 | HIGH |
| @tanstack/react-table | 8.21.3 | 테이블 UI | 강사용 학생 성적 테이블. 정렬·필터·페이지네이션 헤드리스 구현 | MEDIUM |
| Recharts | 3.7.0 | 차트/시각화 | 취약 유형 분석 그래프, 단원별 정답률 시각화 | MEDIUM |
| axios | 1.13.5 | HTTP 클라이언트 | TanStack Query queryFn에서 사용. fetch 대비 인터셉터·오류 처리 편의성 | MEDIUM |
| date-fns | 4.1.0 | 날짜 처리 | 풀이 시간 기록, 학습 이력 표시. moment.js 대비 tree-shakeable | HIGH |

### Supporting Libraries — Backend

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| jose | 6.1.3 | JWT 인증 | ES Module 완전 지원. jsonwebtoken 대비 최신 표준 준수. 학생/강사 역할별 토큰 | HIGH |
| bcryptjs | 3.0.3 | 비밀번호 해싱 | 비밀번호 저장. native bcrypt 대비 Node.js 바이너리 의존 없음 | HIGH |
| zod | 4.3.6 | 요청 검증 | Express 미들웨어에서 req.body 유효성 검사. 프론트 스키마 재사용 | HIGH |
| multer | 2.0.2 | 파일 업로드 | 강사용 문제 이미지(그림 포함 수학 문제) 업로드 처리 | MEDIUM |
| redis | 5.11.0 | 캐싱/세션 | JWT 블랙리스트, 세션 캐싱. v1에서는 선택적. 사용자 수 증가 시 도입 | LOW |

### AI/ML 컴포넌트 — BKT/DKT

| Approach | Rationale | Confidence |
|----------|-----------|------------|
| Python FastAPI 마이크로서비스 | pyBKT(CAHLR/pyBKT)는 Python 전용. DKT LSTM도 PyTorch/Keras 기반. Node.js에서 직접 구현 불가능. FastAPI → HTTP로 Node.js 백엔드와 통신 | MEDIUM |
| pyBKT 라이브러리 | BKT 표준 구현체. pip install pyBKT. 단원·유형별 마스터리 확률 계산 | MEDIUM |
| PostgreSQL JSONB | BKT 파라미터(L0, T, G, S), 학생별 마스터리 확률 저장. 별도 NoSQL 불필요 | HIGH |

> **v1 단순화 전략:** BKT 규칙 기반 단순 버전을 Node.js에서 직접 구현 가능 (정답률 임계값 기반). v2에서 Python 마이크로서비스로 고도화.

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| ESLint 10 | 코드 품질 | flat config 사용. TypeScript ESLint 플러그인 필수 |
| Prettier 3 | 코드 포매팅 | ESLint와 충돌 방지 위해 eslint-config-prettier 함께 설정 |
| Vitest 4 | 유닛/통합 테스트 | Vite 네이티브. Jest API 호환. 수식 파싱 로직 테스트 |
| drizzle-kit | DB 마이그레이션 | drizzle-orm과 쌍으로 사용. `drizzle-kit push` / `drizzle-kit generate` |
| tsx | TypeScript Node.js 실행 | ts-node 대체. Node.js 22 ESM 환경에서 더 안정적 |

---

## Installation

```bash
# 프론트엔드 프로젝트 생성
npm create vite@latest frontend -- --template react-ts

# Frontend Core
npm install react-router-dom @tanstack/react-query zustand
npm install react-hook-form @hookform/resolvers zod
npm install katex
npm install axios date-fns
npm install @tanstack/react-table recharts

# Frontend UI
npm install tailwindcss @tailwindcss/vite
npx shadcn@latest init

# PWA
npm install -D vite-plugin-pwa

# Frontend Dev
npm install -D typescript eslint prettier vitest @vitejs/plugin-react

# 백엔드 프로젝트 생성
mkdir backend && cd backend && npm init -y

# Backend Core
npm install express
npm install drizzle-orm pg
npm install jose bcryptjs
npm install zod multer

# Backend Dev
npm install -D typescript tsx drizzle-kit @types/node @types/express @types/pg
```

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| 빌드 도구 | Vite 7 | Create React App | CRA 공식 deprecated. eject 지옥. 번들 크기 큼 |
| 빌드 도구 | Vite 7 | Next.js | SSR 불필요. v1은 순수 SPA. 서버 컴포넌트 학습 비용 과다 |
| ORM | Drizzle 0.45 | Prisma 7 | Prisma 7은 driver adapter 필수화로 설정 복잡도 증가. 번들 크기 90% 더 큼. 교육 앱 수준에서 오버엔지니어링 |
| ORM | Drizzle 0.45 | TypeORM | 데코레이터 의존. TypeScript strict 모드와 마찰. 활발성 낮음 |
| HTTP 프레임워크 | Express 5 | Hono 4 | Hono는 성능 우위이나 Express 생태계(미들웨어)가 v1 개발 속도 보장. 팀 기존 지식 활용 |
| 상태관리 | Zustand 5 + TanStack Query 5 | Redux Toolkit | 보일러플레이트 과다. 교육 앱 복잡도 수준에서 불필요 |
| 라우팅 | React Router 7 | TanStack Router | TanStack Router는 type-safety 우수하나 학습 비용 높음. React Router v7 SPA 모드로 충분 |
| 수식 렌더링 | KaTeX 0.16 | MathJax 3 | MathJax는 렌더링 속도 10x 느림. 모바일 PWA 성능 저하 명확 |
| UI 컴포넌트 | shadcn/ui | Ant Design / MUI | shadcn/ui는 소유 가능한 코드(node_modules 없음). Tailwind v4 네이티브. 번들 크기 최소 |
| 차트 | Recharts 3 | Chart.js | React 네이티브. 선언적 JSX API. 취약 유형 시각화에 충분 |
| AI/ML | Python FastAPI (v2) | Node.js 직접 구현 | Node.js ML 라이브러리 생태계 빈약. pyBKT/PyTorch는 Python 전용. v1은 규칙 기반으로 대체 |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Create React App | 공식 deprecated (2023). 빌드 속도 극도로 느림. 유지보수 없음 | Vite |
| MathJax | 모바일 렌더링 10x 느림. PWA 초기 로드 시간 과다 | KaTeX |
| Moment.js | 번들 크기 큼(67kb). tree-shaking 불가. 프로젝트 아카이브 상태 | date-fns |
| Sequelize | TypeScript 지원 약함. 데코레이터 없이 타입 추론 불가. 활발한 개발 축소 | Drizzle ORM |
| jsonwebtoken | CommonJS 전용. ESM + TypeScript 환경에서 타입 문제. 업데이트 지연 | jose |
| Redux | 교육 앱 상태 복잡도 대비 과도한 보일러플레이트. 팀 생산성 저하 | Zustand + TanStack Query |
| MongoDB | 문제-단원-유형-학생-성적 관계 데이터에 관계형 DB가 명백히 적합 | PostgreSQL |
| Prisma 7 | v7 major break: driver adapter 필수화. 설정 복잡도 증가. 번들 큼 | Drizzle ORM |

---

## Stack Patterns by Variant

**v1 (무료, 단순 AI 분석):**
- BKT를 Node.js 규칙 기반으로 구현 (정답률 < 60% → 취약 유형 표시)
- Python 마이크로서비스 없이 단일 Node.js 백엔드
- PostgreSQL에 학생별 단원·유형 정답률 집계 테이블 추가

**v2 (고도화 AI 분석):**
- Python FastAPI 마이크로서비스 추가 (pyBKT or DKT)
- Node.js 백엔드 → `/api/ml/analyze` → FastAPI 호출
- BKT 파라미터를 PostgreSQL JSONB 컬럼에 저장

**오프라인 우선 PWA 전략:**
- `vite-plugin-pwa` generateSW 모드로 정적 자산 사전 캐싱
- 문제 데이터는 IndexedDB(idb-keyval)에 로컬 저장
- 답안 제출은 오프라인 큐 → 온라인 복귀 시 sync

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| React 19.x | shadcn/ui (2025-02 업데이트) | forwardRef 제거됨. shadcn/ui v0.x는 React 18용이므로 최신 CLI 사용 필수 |
| Tailwind CSS 4.x | @tailwindcss/vite | PostCSS 설정 불필요. Vite 플러그인으로 직접 통합 |
| Drizzle ORM 0.45 | drizzle-kit 0.31.9 | 항상 동일 minor 버전 유지. mismatche 시 마이그레이션 오류 발생 |
| Vite 7.x | vite-plugin-pwa 1.2.0 | Workbox 7 내장. Node.js 18+ 필요 |
| TanStack Query 5.x | React 18/19 | v4에서 v5 마이그레이션 시 `cacheTime` → `gcTime` 이름 변경 주의 |
| jose 6.x | Node.js 20+ | ESM only. CJS 환경에서는 dynamic import 필요 |

---

## Sources

- npm registry (실시간 조회, 2026-02-19) — React 19.2.4, Vite 7.3.1, Prisma 7.4.0, Express 5.2.1, KaTeX 0.16.28, vite-plugin-pwa 1.2.0, drizzle-orm 0.45.1, Zustand 5.0.11, TanStack Query 5.90.21, React Router 7.13.0, Tailwind 4.2.0, Zod 4.3.6 확인
- [Tailwind CSS v4.0 Release](https://tailwindcss.com/blog/tailwindcss-v4) — 2025-01-22 정식 출시, Vite 플러그인 지원 확인 (HIGH)
- [shadcn/ui Tailwind v4 Changelog](https://ui.shadcn.com/docs/changelog/2025-02-tailwind-v4) — React 19 + Tailwind v4 호환성 확인 (HIGH)
- [Prisma ORM 7.2.0 Release](https://www.prisma.io/blog/announcing-prisma-orm-7-2-0) — v7 driver adapter 필수화 확인 (HIGH)
- [TanStack Router vs React Router v7 (Jan 2026)](https://medium.com/ekino-france/tanstack-router-vs-react-router-v7-32dddc4fcd58) — React Router SPA 모드 충분성 확인 (MEDIUM)
- [Drizzle vs Prisma 2025](https://thedataguy.pro/blog/2025/12/nodejs-orm-comparison-2025/) — Drizzle 번들 크기 및 성능 우위 확인 (MEDIUM)
- [pyBKT GitHub](https://github.com/CAHLR/pyBKT) — Python 전용 BKT 구현체 확인 (MEDIUM)
- [KaTeX Official](https://katex.org/) — 최신 버전 0.16.28, 속도 우위 확인 (HIGH)
- [Zustand v5.0.10 Release](https://github.com/pmndrs/zustand/releases) — React 18/19 useSyncExternalStore 기반 (HIGH)
- [vite-pwa-org Documentation](https://vite-pwa-org.netlify.app/) — Workbox 통합 전략 확인 (HIGH)

---

*Stack research for: 수학 기출문제 학습 웹앱 (PWA)*
*Researched: 2026-02-19*
