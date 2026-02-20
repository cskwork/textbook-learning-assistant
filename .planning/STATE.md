# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-19)

**Core value:** 학생이 자신의 취약한 수학 유형을 정확히 파악하고, AI가 추천하는 맞춤 문제를 통해 효율적으로 실력을 향상시킬 수 있어야 한다
**Current focus:** Phase 1 — 기반 인프라 + 인증

## Current Position

Phase: 1 of 7 (기반 인프라 + 인증)
Plan: 3 of 5 in current phase
Status: In progress
Last activity: 2026-02-20 — 01-03 완료 (JWT 인증 API 6개 엔드포인트 + 미들웨어 + Rate Limiter)

Progress: [███░░░░░░░] 11% (3/5 plans in Phase 1)

## Performance Metrics

**Velocity:**
- Total plans completed: 0
- Average duration: -
- Total execution time: -

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| - | - | - | - |

**Recent Trend:**
- Last 5 plans: -
- Trend: -

*Updated after each plan completion*
| Phase 01-infra-auth P01 | 3m 31s | 2 tasks | 12 files |
| Phase 01-infra-auth P03 | 30m 14s | 2 tasks | 5 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Init]: React 19 + Vite 7 + Tailwind v4 + shadcn/ui PWA 프론트엔드 확정
- [Init]: Node.js(Express 5) + PostgreSQL + Drizzle ORM 백엔드 확정
- [Init]: BKT 모델 Node.js 인라인 구현 (v1), Python FastAPI 마이크로서비스는 v2로 연기
- [Init]: 문제 태깅 스키마는 Phase 1에서 확정 필수 (나중에 변경 시 전체 재작업)
- [Init]: 서버사이드 채점 강제 (클라이언트 채점 절대 금지 — 정답 노출 방지)
- [Phase 01-infra-auth]: apps/api ESM 설정 + Express 명시적 타입 어노테이션으로 pnpm 가상 저장소 타입 참조 오류 방지
- [Phase 01-infra-auth]: SameSite 쿠키: 개발 환경 lax, 프로덕션 strict — 01-03 JWT 구현 시 적용
- [Phase 01-02]: Tailwind v4 CSS-first 방식 — tailwind.config.js 생성 안 함, @tailwindcss/vite 플러그인
- [Phase 01-02]: AppShell navItems prop 구조 — Phase 01-04에서 user.role 기반 동적 메뉴 주입 포인트
- [Phase 01-02]: lg 브레이크포인트(1024px) 기준 하단탭바/사이드바 전환 — 태블릿까지 하단탭바 유지
- [Phase 01-03]: IRouter 명시적 타입 어노테이션으로 Router() TS2742 해결 — 모든 router 파일에 동일 패턴 적용
- [Phase 01-03]: Refresh token 로테이션 적용 지점: /refresh와 /onboarding — /login은 여러 기기 로그인 허용
- [Phase 01-03]: Onboarding 역할 변경 불가 (isOnboarded 후 400) — 관리자 변경은 v2

### Pending Todos

None yet.

### Blockers/Concerns

- [Research]: 문제 태깅 스키마를 첫 문제 입력 전에 확장 가능한 형태로 확정해야 함 — Phase 2 진입 전 처리
- [Research]: BKT 콜드스타트 대응을 위한 온보딩 진단 퀴즈(5~10문제)를 Phase 5에서 함께 구현
- [Research]: Phase 4(DIY 문제집) 시작 전 Puppeteer+KaTeX PDF 생성 조합 검증 필요
- [Dev]: bcrypt 네이티브 바인딩은 pnpm approve-builds 또는 node-pre-gyp 수동 실행 필요 — 팀원 온보딩 시 문서화 필요

## Session Continuity

Last session: 2026-02-20
Stopped at: Completed 01-infra-auth/01-03-PLAN.md (JWT 인증 API 6개 엔드포인트 + JWT 미들웨어 + Rate Limiter)
Resume file: .planning/phases/01-infra-auth/01-03-SUMMARY.md
