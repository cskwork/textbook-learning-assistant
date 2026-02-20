# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-19)

**Core value:** 학생이 자신의 취약한 수학 유형을 정확히 파악하고, AI가 추천하는 맞춤 문제를 통해 효율적으로 실력을 향상시킬 수 있어야 한다
**Current focus:** Phase 3 — 퀴즈 엔진 + 오답노트

## Current Position

Phase: 3 of 7 (퀴즈 엔진 + 오답노트)
Plan: 4 of 5 in current phase
Status: Executing
Last activity: 2026-02-20 — Phase 3 Plan 04 완료 (오답노트 UI 컴포넌트 + WrongNotesPage 라우트 등록)

Progress: [████████░░] 40% (10/~25 plans across all phases)

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
| Phase 02-question-bank P01 | 161s | 2 tasks | 6 files |
| Phase 02-question-bank P03 | 158s | 2 tasks | 7 files |
| Phase 02-question-bank P04 | 155s | 2 tasks | 7 files |
| Phase 03-quiz-engine P01 | 99s | 2 tasks | 3 files |
| Phase 03-quiz-engine P02 | 3m | 2 tasks | 6 files |
| Phase 03-quiz-engine P03 | 118s | 2 tasks | 3 files |
| Phase 03-quiz-engine P04 | 116s | 2 tasks | 5 files |

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
- [Phase 02-question-bank]: lib/auth.ts 자체 교체 방식 — mock-auth.ts 별도 파일 생성 없이 auth.ts를 직접 교체하여 AuthContext 변경 최소화
- [Phase 02-question-bank]: Dexie 4.x EntityTable 패턴 채택 — TypeScript 타입 안전 IndexedDB 스키마
- [Phase 02-question-bank]: unit/questionCategory 자유 텍스트(string) — POC에서 hardcode 목록 불필요, 향후 Phase에서 구조화
- [Phase 02-03]: z.coerce.number().optional().or(z.literal('')) — HTML input[type=number] 빈 값 '' 처리
- [Phase 02-03]: sourceYear/sourceNumber: Question 저장 시 data.sourceYear ? Number(data.sourceYear) : undefined 변환 적용
- [Phase Phase 02-04]: /instructor/problems/new 라우트를 /:id 보다 앞에 선언 — react-router v7 선언 순서 기반 매칭
- [Phase Phase 02-04]: 학생 홈에 /student/problems 링크 버튼 추가 — Phase 3 학생 문제 목록 구현 전 라우트 연결 준비
- [Phase 03-quiz-engine]: isBookmarked 필드를 WrongNote에 통합 — 별도 bookmarks 테이블 없이 단일 테이블로 처리
- [Phase 03-quiz-engine]: 정답 시 isMastered 자동 설정 — 오답노트 재풀이 완료를 자동 처리 (submitQuizAttempt)
- [Phase 03-02]: timer.seconds 직접 참조로 timeSpent 캡처 — stop() 비동기 상태 업데이트 우회
- [Phase 03-02]: RETRY 시 timer.reset() + timer.start() 순서 — QuizResult onRetry 콜백에서 처리
- [Phase 03-02]: ShortAnswerInput type=text 고정 — type=number 빈 값 NaN 오류 방지 (Phase 2 패턴 재적용)
- [Phase 03-03]: question 상태 undefined/null/Question 3단계 구분 — 로딩중/없음/정상 UI 분기 명확화
- [Phase 03-03]: 북마크 useEffect를 문제 로드 useEffect와 분리 — question 로드 완료 후 user.email 의존성 명시
- [Phase 03-04]: WrongNoteFilter useEffect에서 getWrongNoteUnits/Categories 비동기 로드 — 필터 옵션은 현재 studentId 기준 스냅샷으로 충분
- [Phase 03-04]: lastWrongAt > 0 조건으로 순수 북마크(wrongCount=0) 날짜 표시 생략 — 1970-01-01 잘못된 날짜 노출 방지

### Pending Todos

None yet.

### Blockers/Concerns

- [Research]: 문제 태깅 스키마를 첫 문제 입력 전에 확장 가능한 형태로 확정해야 함 — Phase 2 진입 전 처리
- [Research]: BKT 콜드스타트 대응을 위한 온보딩 진단 퀴즈(5~10문제)를 Phase 5에서 함께 구현
- [Research]: Phase 4(DIY 문제집) 시작 전 Puppeteer+KaTeX PDF 생성 조합 검증 필요
- [Dev]: bcrypt 네이티브 바인딩은 pnpm approve-builds 또는 node-pre-gyp 수동 실행 필요 — 팀원 온보딩 시 문서화 필요

## Session Continuity

Last session: 2026-02-20
Stopped at: Completed 03-quiz-engine/03-04-PLAN.md
Resume file: .planning/phases/03-quiz-engine/03-04-SUMMARY.md
