# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-19)

**Core value:** 학생이 자신의 취약한 수학 유형을 정확히 파악하고, AI가 추천하는 맞춤 문제를 통해 효율적으로 실력을 향상시킬 수 있어야 한다
**Current focus:** Phase 1 — 기반 인프라 + 인증

## Current Position

Phase: 2 of 7 (문제 뱅크 + 수식 렌더링)
Plan: 0 of TBD in current phase
Status: Planning
Last activity: 2026-02-20 — Phase 1 완료, Phase 2 계획 시작

Progress: [█████░░░░░] 17% (5/5 plans in Phase 1 — 체크포인트 대기)

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
| Phase 01-infra-auth P04 | 6m | 2 tasks | 17 files |
| Phase 01-infra-auth P05 | 1m | 0 tasks | 0 files |
| Phase 02-question-bank P02 | 2m | 2 tasks | 6 files |

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
- [Phase 01-04]: AuthContext login/setRole이 User를 반환 — 호출자가 isOnboarded 기반 라우팅 직접 결정
- [Phase 01-04]: register 후 login 재호출로 AuthContext user 상태 동기화 (명시적 방법)
- [Phase 01-04]: BottomNav/Sidebar NavLink end prop 항상 true — 중첩 라우트 활성 상태 정확도
- [Phase 01-04]: AppShell 모바일 상단 헤더에 로그아웃 버튼 — BottomNav에는 로그아웃 없음
- [Phase 01-infra-auth]: Phase 1 통합 검증은 사용자 브라우저 직접 확인으로 완료 — 21개 테스트 항목
- [Architecture Pivot]: POC 목적으로 PostgreSQL/Express 백엔드 대신 localStorage + mock data 사용. 실제 백엔드는 나중에 구현. Vercel 프론트엔드 전용 배포 대상.
- [Architecture Pivot]: 기존 apps/api 코드는 유지하되 프론트엔드는 mock API 레이어(localStorage) 사용으로 전환
- [Architecture Pivot]: 서버사이드 채점 결정은 유지하되 POC에서는 클라이언트 mock으로 대체
- [Phase 02-question-bank]: katex 직접 사용 — react-katex wrapper 대신 (React 19 호환성 불확실)
- [Phase 02-question-bank]: $...$ → $...$ 파싱 순서 고정 — regex 처리 시 블록 수식 먼저, 인라인 나중
- [Phase 02-question-bank]: throwOnError: false — 에디터 미완성 입력 중 앱 크래시 방지
- [Phase 02-question-bank]: KaTeX CSS는 index.css에서 전역 import (컴포넌트 내 중복 import 방지)

### Pending Todos

None yet.

### Blockers/Concerns

- [Research]: 문제 태깅 스키마를 첫 문제 입력 전에 확장 가능한 형태로 확정해야 함 — Phase 2 진입 전 처리
- [Research]: BKT 콜드스타트 대응을 위한 온보딩 진단 퀴즈(5~10문제)를 Phase 5에서 함께 구현
- [Research]: Phase 4(DIY 문제집) 시작 전 Puppeteer+KaTeX PDF 생성 조합 검증 필요
- [Dev]: bcrypt 네이티브 바인딩은 pnpm approve-builds 또는 node-pre-gyp 수동 실행 필요 — 팀원 온보딩 시 문서화 필요

## Session Continuity

Last session: 2026-02-20
Stopped at: Completed 02-question-bank/02-02-PLAN.md
Resume file: .planning/phases/02-question-bank/02-02-SUMMARY.md
