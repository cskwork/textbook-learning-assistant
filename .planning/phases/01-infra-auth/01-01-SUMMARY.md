---
phase: 01-infra-auth
plan: 01
subsystem: backend-infra
tags: [monorepo, pnpm, drizzle, express5, postgresql, typescript]
dependency_graph:
  requires: []
  provides:
    - pnpm 모노레포 워크스페이스 (apps/api)
    - Drizzle ORM PostgreSQL 스키마 (users + refresh_tokens)
    - Express 5 서버 기반 (/health 엔드포인트)
    - Drizzle 마이그레이션 SQL 파일 (0000_init.sql)
  affects:
    - 01-02 (React 프론트엔드 — 같은 모노레포 워크스페이스)
    - 01-03 (JWT 인증 API — 이 DB 스키마 위에 구축됨)
tech_stack:
  added:
    - express@5.2.1
    - drizzle-orm@0.44.7
    - drizzle-kit@0.30.4
    - pg@8.13.3
    - bcrypt@5.1.1
    - jsonwebtoken@9.0.3
    - cors@2.8.5
    - cookie-parser@1.4.7
    - express-rate-limit@7.5.1
    - zod@3.24.2
    - dotenv@16.4.7
    - tsx@4.21.0
    - typescript@5.7.3
  patterns:
    - pnpm 워크스페이스 모노레포
    - Drizzle v1 간결 연결 방식 (drizzle(DATABASE_URL))
    - Express 5 async 자동 에러 처리 (try/catch 불필요)
    - pgEnum으로 역할 타입 안전성 확보 (nullable role — 온보딩 전 null)
key_files:
  created:
    - pnpm-workspace.yaml
    - package.json
    - .gitignore
    - .env.example
    - apps/api/package.json
    - apps/api/tsconfig.json
    - apps/api/drizzle.config.ts
    - apps/api/src/db/schema.ts
    - apps/api/src/db/index.ts
    - apps/api/src/middleware/errorHandler.ts
    - apps/api/src/index.ts
    - apps/api/drizzle/0000_init.sql
  modified: []
decisions:
  - "apps/api type: module (ESM) — tsx가 NodeNext 모듈 해석 방식과 일치하도록"
  - "Express 타입에 Express 명시적 타입 어노테이션 추가 — pnpm 가상 저장소 경로 참조 오류 방지"
  - "SameSite 쿠키 전략: 개발 환경 lax, 프로덕션 strict (01-RESEARCH.md 오픈 질문 해결)"
metrics:
  duration: "3m 31s"
  completed_date: "2026-02-20"
  tasks_completed: 2
  files_created: 12
  files_modified: 0
---

# Phase 1 Plan 01: 모노레포 + DB 스키마 + Express 5 서버 요약

**한 줄 요약:** pnpm 모노레포(apps/api) 구축, Drizzle pgEnum 기반 users/refresh_tokens 스키마 정의, Express 5 서버 /health 엔드포인트 구현 완료

## 완료된 작업

| 작업 | 이름 | 커밋 | 주요 파일 |
|------|------|------|----------|
| 1 | 모노레포 프로젝트 구조 + 백엔드 패키지 초기화 | 5e4b82c | pnpm-workspace.yaml, package.json, .gitignore, .env.example, apps/api/package.json, apps/api/tsconfig.json |
| 2 | Drizzle DB 스키마 + Express 5 서버 기초 | 46ebf3a | apps/api/src/db/schema.ts, apps/api/src/db/index.ts, apps/api/src/middleware/errorHandler.ts, apps/api/src/index.ts, apps/api/drizzle/0000_init.sql |

## 검증 결과

1. `pnpm install --frozen-lockfile` 성공 (204개 패키지)
2. `pnpm --filter api exec tsc --noEmit` 타입 체크 통과
3. `drizzle-kit generate --name=init` 마이그레이션 SQL 생성 성공 (drizzle/0000_init.sql)
4. `curl http://localhost:3000/health` → HTTP 200, `{"status":"ok","timestamp":"..."}` 반환

## 핵심 스키마 구조

```sql
-- user_role enum (온보딩 완료 후 설정)
CREATE TYPE "user_role" AS ENUM('student', 'instructor');

-- users 테이블 (role nullable — 온보딩 전 NULL)
CREATE TABLE "users" (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role user_role,           -- NULL = 온보딩 미완료
  is_onboarded BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- refresh_tokens 테이블 (cascade 삭제)
CREATE TABLE "refresh_tokens" (
  id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);
```

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Express 타입 추론 오류 수정**
- **발견 시점:** Task 2 TypeScript 타입 체크 중
- **문제:** `const app = express()`의 타입이 pnpm 가상 저장소 내부 경로(`@types/express-serve-static-core`)를 참조해 이식성 없는 타입이라는 TS2742 오류 발생
- **수정:** `const app: Express = express()`로 명시적 타입 어노테이션 추가
- **수정 파일:** apps/api/src/index.ts
- **커밋:** 46ebf3a (Task 2 커밋에 포함)

## 결정 사항

- **apps/api `type: "module"` (ESM):** tsx와 NodeNext 모듈 해석 방식 정합성을 위해 ESM으로 설정. `.js` 확장자 import 방식 사용.
- **SameSite 쿠키 전략 결정 (RESEARCH.md 오픈 질문 해결):** 개발 환경에서 `SameSite: 'lax'` + `Secure: false`, 프로덕션에서 `SameSite: 'strict'` + `Secure: true` 사용 권장 — 01-03 JWT 인증 구현 시 적용 예정.

## 다음 단계

이 기반 위에 구축될 내용:
- **01-03:** JWT 인증 API 6개 엔드포인트 (register, login, refresh, logout, me, update-role)
- DB 마이그레이션 적용 (`drizzle-kit migrate`)은 PostgreSQL 실행 중일 때 가능 — 01-05 통합 검증 체크포인트에서 실행

## Self-Check: PASSED

모든 12개 파일 존재 확인, 두 커밋(5e4b82c, 46ebf3a) 모두 존재 확인.
