# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-19)

**Core value:** 학생이 자신의 취약한 수학 유형을 정확히 파악하고, AI가 추천하는 맞춤 문제를 통해 효율적으로 실력을 향상시킬 수 있어야 한다
**Current focus:** Phase 5 AI 분석 완료 — Phase 6+ 진행 가능

## Current Position

Phase: 5 of 8+ (AI 분석 + 학습 리포트)
Plan: 5 of 5 in current phase (완료)
Status: Complete — Phase 5 Plan 05 완료 (Phase 5 통합 검증 — 빌드 확인 + 사용자 사전 승인)
Last activity: 2026-02-21 — Phase 5 Plan 05 완료 (Phase 5 AI 분석 통합 검증 — 빌드 성공, 사전 승인 처리)

Progress: [█████████░] 97% (23/~25 plans across all phases)

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
| Phase 04-workbook-generator P01 | 1m | 2 tasks | 2 files |
| Phase 04-workbook-generator P02 | 132s | 2 tasks | 3 files |
| Phase 04-workbook-generator P03 | 131s | 2 tasks | 5 files |
| Phase 05-ai-analytics P01 | 150s | 2 tasks | 4 files |
| Phase 05-ai-analytics P03 | 127s | 1 tasks | 3 files |
| Phase 05-ai-analytics P02 | 219s | 2 tasks | 5 files |
| Phase 05-ai-analytics P04 | 226s | 2 tasks | 7 files |
| Phase 06-pwa-offline P01 | 152s | 2 tasks | 7 files |
| Phase 06-pwa-offline P02 | 187s | 2 tasks | 4 files |
| Phase 07-instructor-portal PP01 | 121s | 2 tasks | 2 files |
| Phase 07-instructor-portal P03 | 136 | 2 tasks | 3 files |
| Phase 07-instructor-portal P02 | 186s | 2 tasks | 6 files |
| Phase 07-instructor-portal P04 | 300 | 1 tasks | 2 files |
| Phase 08-mypage-settings P01 | 109s | 2 tasks | 7 files |
| Phase 08-mypage-settings P02 | 123s | 2 tasks | 4 files |
| Phase 08-mypage-settings P03 | 226s | 2 tasks | 6 files |
| Phase 08-mypage-settings P04 | 103s | 1 tasks | 5 files |
| Phase 04-workbook-generator P04 | 5m | 2 tasks | 0 files |
| Phase 05-ai-analytics P05 | 26s | 2 tasks | 0 files |
| Phase 06-pwa-offline P03 | 180s | 2 tasks | 0 files |
| Phase 09-ai P01 | 125s | 2 tasks | 5 files |
| Phase 09-ai P03 | 151s | 2 tasks | 4 files |
| Phase 09-ai P02 | 114s | 2 tasks | 3 files |

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
- [Phase 04-01]: listWorkbooks는 where().toArray() 후 인메모리 sort — Dexie reverse().sortBy() + where() 조합 오류 방지
- [Phase 04-01]: getFilterOptions filter(Boolean) — unit/questionCategory 빈 문자열 제거
- [Phase 04-01]: createWorkbook에서 questionIds 배열만 저장 — Question 객체 전체 저장 금지 (데이터 중복 방지)
- [Phase 04-02]: WorkbookCard 삭제 버튼: ghost variant + text-destructive — WrongNoteCard outline 패턴 대신 ghost 사용 (덜 강조)
- [Phase 04-02]: WorkbookCreator Select: __all__ 센티넬 값으로 전체/선택 전환 — WrongNoteFilter 패턴 재사용
- [Phase 04-02]: previewQuestions 내 content 앞 30자만 표시 (LaTeX 미렌더링) — POC 미리보기는 텍스트만으로 충분
- [Phase 04-03]: WorkbookPlayPage key={currentQuestion.id} — QuizPlayer 문제 변경 시 상태 완전 리셋
- [Phase 04-03]: completedCount 제거 — currentIndex로 진행 문제 수 대체 (불필요 상태 단순화)
- [Phase 05-01]: BKT 콜드스타트 분기 — quizAttempts < 30이면 정답률 휴리스틱(AIAN-04), 30 이상이면 computeBKT
- [Phase 05-01]: 날짜 분리 로컬 타임존 — toISOString() UTC 대신 getFullYear/Month/Date (KST UTC+9 Pitfall 대응)
- [Phase 05-01]: getWeakCategories 휴리스틱 모드 pL 대용값 — accuracy/100으로 인터페이스 { category, pL } 일관성 유지
- [Phase 05-01]: getRecommendedQuestions 반환값 number[] — questionId 배열만 반환, 호출자가 Question 전체 로드 결정
- [Phase 05-03]: QuizPlayer 내부 submitQuizAttempt 재사용: 별도 일괄 제출 없이 onNext 콜백으로 인덱스 전진
- [Phase 05-03]: 진단 퀴즈 건너뛰기 버튼 추가 — 강제 퀴즈 UX 부담 완화, isDiagnosisCompleted=true 동일하게 저장
- [Phase 05-02]: recharts 버전 관리: shadcn add chart가 2.15.x 범위로 설치, 3.x 시 2.15.1 다운그레이드 필요
- [Phase 05-02]: pnpm.overrides react-is: 모노레포 루트 direct dep 없어 $react-is 참조 불가 → ^19.0.0 버전 문자열 직접 명시
- [Phase 05-02]: RadarChart 취약 유형 색상: recharts Radar 개별 포인트 fill 미지원 → 취약 유형 존재 시 전체 Radar를 destructive 색상으로 단순 처리
- [Phase 05-04]: 차트 컴포넌트 import: named export이므로 {} 구문 사용 — default import 방식 빌드 오류 방지
- [Phase 05-04]: 홈 실데이터 로딩: 오늘 풀이 useLiveQuery(실시간) + 정답률/스트릭/학습시간 useEffect(attemptCount 의존)
- [Phase 05-04]: 탭바 마이페이지 → 분석 탭 교체: /student/profile 라우트는 main.tsx에 유지 (5개 탭 공간 확보)
- [Phase 06-pwa-offline]: vite-plugin-pwa generateSW + registerType autoUpdate — POC에서 커스텀 SW 불필요, 자동 precache + skipWaiting
- [Phase 06-pwa-offline]: vercel.json을 apps/web/ 루트에 위치 — Vercel Root Directory apps/web 설정 전제, SPA rewrites + sw.js no-cache 헤더
- [Phase 06-pwa-offline]: workbox-window 명시적 dependency 추가 — virtual:pwa-register/react 번들 시 Rollup resolve 필수
- [Phase 06-pwa-offline]: tsconfig.app.json types에 vite-plugin-pwa/client 추가 — virtual:pwa-register/react TypeScript 인식
- [Phase 06-pwa-offline]: PWAInstallBanner bottom-20 고정 배너 — 하단 탭바(h-16) 위에 배너 표시 패턴
- [Phase 07-instructor-portal]: Dexie version(5) groups/groupMembers/assignments 3개 테이블 + group.service.ts 11개 함수로 강사 포털 데이터 레이어 구축
- [Phase 07-instructor-portal]: analytics.service.ts 수정 없이 studentId 파라미터로 재사용 — getOverallStats/getWeakCategories 함수 시그니처 그대로 활용
- [Phase 07-instructor-portal]: routes 선언 순서: /instructor/groups/new → /instructor/groups/:id/assign → /instructor/groups/:id — 정적 경로 우선 배치로 react-router 매칭 보장
- [Quick-001]: db.on('ready') 핸들러에서 seedIfEmpty 호출 — 앱 시작 시 DB open 완료 후 자동 시딩, 순환 참조 없음
- [Quick-001]: CSS hidden 전환으로 QuestionForm 선택 입력 접기 — DOM 유지로 form state 보존 (shadcn Collapsible 미사용)
- [Quick-001]: questionCount useLiveQuery — 학생 홈에서 시드 포함 전체 문제 수 실시간 반영
- [Quick-002]: declare module 'react' { namespace JSX.IntrinsicElements } — React 19 react-jsx 모드에서 커스텀 웹 컴포넌트 타입 선언 방법 (global namespace 대신 module augmentation)
- [Quick-002]: workbox maximumFileSizeToCacheInBytes 3MB 상향 — mathlive 번들 크기로 인한 PWA 빌드 실패 방지
- [Quick-002]: math-virtual-keyboard-policy=manual — MathLive 모바일 가상 키보드 자동 팝업 방지
- [Phase 07-04]: 강사 홈 groupCount/problemCount: useLiveQuery 직접 사용 — group.service.ts 비동기 함수 우회
- [Phase 07-04]: 학생 홈 반 참여 버튼: 문제 풀기 카드 내 배치 — 최소 변경 원칙
- [Phase 08-mypage-settings]: SettingsProvider를 AuthProvider 외부에 배치 — 다크모드가 로그인 페이지 포함 전체 앱에 적용
- [Phase 08-mypage-settings]: .katex font-size에 !important — katex.min.css 기본값(1.21em) 오버라이드 필수
- [Phase 08-mypage-settings]: FOUC 방지: index.html body 최상단에 동기 스크립트 배치 (React 마운트 전 실행)
- [Phase 08-02]: StoredUser 내부 타입 분리 — password를 User 공개 타입에서 숨김
- [Phase 08-02]: deleteAccount dynamic import db — auth.ts ↔ db.ts 순환 참조 방지
- [Phase 08-02]: login() 비밀번호 하위 호환 — stored.password 없으면 기존 유저 통과
- [Phase 08-03]: 함수 내부 null 가드: TypeScript 클로저에서 user null 추론 오류 — handleDeleteAccount 등 내부 함수에 별도 if (!user) return 추가
- [Phase 08-03]: ProfileEditForm useEffect 동기화: user props 변경 시 setValue 재동기화 — updateProfile 후 폼 상태 불일치 방지
- [Phase 08-04]: AppShell profilePath prop 패턴: _layout.tsx가 user.role 기반으로 profilePath 결정 후 AppShell에 주입
- [Phase 02-question-bank]: Phase 2 통합 검증은 사용자 브라우저 직접 확인으로 완료 — 22개 항목 A~G 전부 통과, Phase 3 진입 가능
- [Phase 03-quiz-engine]: Phase 3 통합 검증은 사용자 브라우저 직접 확인으로 완료 — 5개 시나리오 전부 통과 (객관식/단답형 풀기, 오답노트 흐름, 북마크, 학습 이력)
- [Phase 04-workbook-generator]: Phase 4 통합 검증은 사용자 브라우저 직접 확인으로 완료 — 6개 시나리오 전부 통과 (탭바/목록/생성/풀기/이력/삭제)
- [Phase 05-ai-analytics]: Phase 5 통합 검증은 사용자 사전 승인으로 처리 — 마일스톤 완료 후 일괄 브라우저 검증 예정
- [Phase 06-pwa-offline]: pnpm web:build가 올바른 빌드 스크립트 — 루트에 build 스크립트 없음, web:build 사용 필요
- [Phase 06-pwa-offline]: Phase 6 통합 검증은 사전 승인 방식으로 완료 — 사용자 마일스톤 완료 후 일괄 검증 예정
- [Phase 09-ai]: gemini-2.5-flash 모델 사용 (gemini-3-flash-preview fallback) — @google/genai SDK 호환 모델
- [Phase 09-ai]: geminiApiKey: Dexie 인덱스 없는 선택 필드로 DB 버전 업 없이 UserSetting 확장
- [Phase 09-ai]: responseSchema 파라미터 사용 (@google/genai SDK 실제 파라미터명, responseJsonSchema 아님)
- [Phase 09-03]: report.tsx tr/div onClick + navigate 패턴으로 상세 페이지 이동 — Link 래핑 대신 행 전체 클릭 처리
- [Phase 09-03]: SummaryStatsCards streak 필수 prop 대신 인라인 stat 카드 4종으로 직접 렌더링 (streak 데이터 불필요)
- [Phase 09-03]: 학생 상세 오답노트: wrongNotes where('studentId') limit(5) — content 비동기 로드 생략, questionId만 표시
- [Phase 09-ai]: AIGeneratePanel을 QuestionForm 최상단에 배치, hr 구분선으로 필수 입력과 시각적 분리
- [Phase 09-ai]: 강사 마이페이지 AI 설정 카드: 앱 설정 아래, 보안 위에 배치 — API 키 input type=password 마스킹

### Roadmap Evolution

- Phase 8 추가: 마이페이지 + 앱 설정 (프로필 편집, 비밀번호 변경, 계정 삭제, 다크모드, 수식 글꼴 크기, 앱 정보)
- Phase 9 추가: AI 문제 생성 보조 — Gemini 2.0 Flash API를 사용하여 수학 문제를 AI로 생성/보조하는 기능

### Pending Todos

None yet.

### Blockers/Concerns

- [Research]: 문제 태깅 스키마를 첫 문제 입력 전에 확장 가능한 형태로 확정해야 함 — Phase 2 진입 전 처리
- [Research]: BKT 콜드스타트 대응을 위한 온보딩 진단 퀴즈(5~10문제)를 Phase 5에서 함께 구현
- [Research]: Phase 4(DIY 문제집) 시작 전 Puppeteer+KaTeX PDF 생성 조합 검증 필요
- [Dev]: bcrypt 네이티브 바인딩은 pnpm approve-builds 또는 node-pre-gyp 수동 실행 필요 — 팀원 온보딩 시 문서화 필요

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 001 | 예제 수학 기출문제 시드 데이터 추가 + 사용성 개선 | 2026-02-20 | 3e9119b | [001-seed-data-ux-improvements](./quick/001-seed-data-ux-improvements/) |
| 002 | MathLive WYSIWYG 수식 에디터 통합 — 강사 문제 등록/수정 폼 | 2026-02-20 | ec05fa4 | [2-mathlive-wysiwyg](./quick/2-mathlive-wysiwyg/) |
| 003 | 마이페이지 래퍼 레이아웃 통일 — 반응형 패딩 + max-w-3xl + space-y-5 | 2026-02-21 | 6ab5482 | [3-fitting](./quick/3-fitting/) |
| 004 | 학생 홈 empty state UI — 신규 학생 환영 메시지 + 학습 시작 안내 | 2026-02-21 | ec6f264 | [4-ui](./quick/4-ui/) |

## Session Continuity

Last activity: 2026-02-21 - Quick Task 004 완료 (학생 홈 empty state UI — 신규 학생 환영 메시지 + 학습 안내)
Stopped at: Completed quick/4-ui/4-PLAN.md — 4-SUMMARY.md 생성, 학생 홈 empty state UI 구현
Resume file: .planning/quick/4-ui/4-SUMMARY.md
