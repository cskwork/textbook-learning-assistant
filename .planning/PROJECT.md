# 수학 기출 학습 도우미 (가칭)

## What This Is

고등학생을 위한 수학 기출문제 학습 웹앱(PWA). 기출탭탭에서 영감을 받아, 단원별/유형별/난이도별 기출문제를 풀고 AI 기반 취약 유형 분석과 맞춤 추천을 제공하는 서비스. 학생뿐 아니라 강사도 학생 관리와 과제 출제를 할 수 있는 기본 관리 기능을 포함한다. v2.0에서 기출탭탭 스타일 디자인 시스템으로 전면 리뉴얼하여 프로페셔널한 교육 앱 UX를 완성했다.

## Core Value

학생이 자신의 취약한 수학 유형을 정확히 파악하고, AI가 추천하는 맞춤 문제를 통해 효율적으로 실력을 향상시킬 수 있어야 한다.

## Requirements

### Validated (v1.0)

- ✓ 문제 DB 구축 (과목/단원/유형/난이도 태깅 시스템) — Phase 2
- ✓ 문제 풀이 엔진 (객관식 5지선다 + 단답형) — Phase 3
- ✓ 수식 렌더링 (LaTeX 저장 + KaTeX 렌더링, 그래프/도형은 이미지) — Phase 2
- ✓ 자동 채점 시스템 — Phase 3
- ✓ 1초 오답노트 (틀린 문제 자동 수집, N회독 지원) — Phase 3
- ✓ DIY 문제집 (단원별/유형별/난이도별 나만의 문제집 구성) — Phase 4
- ✓ AI 취약유형 분석 (BKT 지식 추적 모델 기반) — Phase 5
- ✓ AI 맞춤 문제 추천 (학습 이력 기반 유사 문제 추천) — Phase 5
- ✓ 학습 리포트/대시보드 (성취도, 취약 패턴 시각화) — Phase 5
- ✓ 타이머/학습 플래너 — Phase 3/5
- ✓ 상세 해설 제공 (문제별 풀이 해설) — Phase 2
- ✓ 사용자 인증/회원 관리 (이메일 가입, 로그인, 세션 유지) — Phase 1
- ✓ 강사용 관리 페이지 (학생 관리, 과제 출제, 성적 분석) — Phase 7
- ✓ 관리자 문제 등록/편집 시스템 (LaTeX 에디터 포함) — Phase 2
- ✓ 반응형 디자인 (태블릿/모바일/데스크톱) — Phase 1
- ✓ PWA 지원 (오프라인 기본 기능, 앱 설치) — Phase 6
- ✓ AI 문제 생성 보조 (Gemini API) — Phase 9
- ✓ 마이페이지 + 앱 설정 (다크모드, 수식 글꼴) — Phase 8
- ✓ Electrobun 데스크톱 앱 래퍼 — Quick 6

### Validated (v2.0)

- ✓ 기출탭탭 스타일 디자인 시스템 (OKLCH 색상 토큰, Pretendard 폰트, 라이트/다크 모드) — Phase 10
- ✓ 컴포넌트 리뉴얼 (Button/Card/Input/Badge 둥근 모서리, 그림자, hover) — Phase 10
- ✓ Framer Motion 페이지 전환 + 마이크로 인터랙션 — Phase 11
- ✓ BottomNav/Sidebar 기출탭탭 스타일 네비게이션 — Phase 11
- ✓ 오답노트/문제집 카드 그리드 + 칩 필터 리디자인 — Phase 11
- ✓ 온보딩 플로우 리디자인 (스텝별 진행, 축하 애니메이션) — Phase 11
- ✓ 학생 홈 Swiper 대시보드 + 빠른 학습 시작 CTA — Phase 12
- ✓ 퀴즈 Swiper 전환 + 채점 애니메이션 (정답 체크, 오답 흔들림) — Phase 12
- ✓ 문제 목록 카드 그리드 + 난이도 뱃지 리디자인 — Phase 12
- ✓ 분석 차트 그라데이션 + DateRangeSelector — Phase 13
- ✓ 마스터리 맵 + 학습 경로 추천 + 히스토리 타임라인 — Phase 13
- ✓ 학습 플래너 (캘린더, 체크리스트, 알림, 주간 설정) — Phase 13
- ✓ 강사 홈 대시보드 리디자인 — Phase 14
- ✓ 강사 문제 관리 필터 사이드바 + 일괄 작업 — Phase 14
- ✓ 강사 학생 분석 + 반 비교 차트 리디자인 — Phase 14
- ✓ 강사 그룹/과제 관리 리디자인 — Phase 14

### Active

## Current Milestone: v3.0 반전 모드 — 게이미피케이션 학습 혁명

**Goal:** 커스터마이즈 버튼 클릭 시 전체 앱이 초재미 게이미피케이션 학습 환경으로 변신하는 "반전 모드" 구현

**Target features:**
- 반전 모드 토글 시스템 (커스터마이즈 버튼 → 전체 UI 변신)
- Phaser 기반 게이미피케이션 퀴즈 엔진 (타임어택, 콤보, 보스전)
- Three.js 3D 시각 효과 (배경, 파티클, 레벨업 연출)
- Canvas 인터랙티브 요소 (드로잉, 애니메이션, 미니게임)
- 사운드/음악 시스템 (BGM, 효과음, 정답/오답 사운드)
- 리워드/레벨업 시스템 (XP, 뱃지, 스트릭, 리더보드)
- 전체 화면 반전 디자인 (홈, 퀴즈, 분석, 오답노트, 강사 포털)

### Out of Scope

- eBook 교재 제공 — 저작권 문제 및 범위 초과
- 실시간 채팅/질문답변 — 핵심 가치와 무관, 복잡도 높음
- 결제/구독 시스템 — 현재 완전 무료
- 수학 외 과목 — 수학 전용 유지
- 학원 대시보드/화이트라벨 — 향후 확장
- 학부모 리포트 발송 — 향후 확장
- OAuth 소셜 로그인 — 이메일 로그인 충분
- 서술형 AI 채점 — 복잡도 높음
- 네이티브 앱 (iOS/Android) — PWA + Electrobun으로 대체

## Context

- **영감:** 비상교육 기출탭탭 — 고등 전 과목 기출문제 앱
- **타겟 사용자:** 고등학생 (수학), 수학 강사/과외 교사
- **MVP 과목:** 고등 수학 (수학I, 수학II, 미적분, 확률과통계, 기하)
- **문제 데이터:** 관리자가 직접 입력/수집 (수능, 모의고사, 교육청 기출 등)
- **AI 모델:** BKT(Bayesian Knowledge Tracing) 기반 학습자 능력 추적
- **수식 처리:** LaTeX로 저장, KaTeX로 클라이언트 렌더링
- **현재 코드베이스:** 17,013 LOC (TypeScript/TSX/CSS), React 19 + Vite 7 + Tailwind v4 + shadcn/ui
- **v2.0 신규 도입:** Swiper, Framer Motion, Pretendard 폰트, OKLCH 색상 토큰
- **아키텍처:** POC (localStorage + Dexie IndexedDB mock), 백엔드 연동은 향후

## Constraints

- **Tech Stack**: React 19 + Vite 7 + Tailwind v4 + shadcn/ui
- **Backend**: Express 5 + Drizzle ORM + PostgreSQL (현재 POC: localStorage mock)
- **DB**: Dexie IndexedDB (클라이언트 사이드 POC)
- **수식**: LaTeX + KaTeX
- **AI**: BKT 지식 추적 모델
- **수익**: 완전 무료
- **과목**: 수학만 (MVP)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| 웹앱 + PWA 선택 (네이티브 앱 대신) | 빠른 개발, 쉬운 배포, 크로스 플랫폼 | ✓ Good |
| 수학 전용 MVP | 수식 렌더링에 집중, 범위 축소로 빠른 출시 | ✓ Good |
| BKT 지식 추적 모델 | 교육 AI 분야에서 검증된 접근법 | ✓ Good |
| LaTeX + KaTeX 수식 렌더링 | 교육 업계 표준, 빠른 클라이언트 렌더링 | ✓ Good |
| v1/v2 완전 무료 | 사용자 확보 우선, 결제 복잡도 제거 | ✓ Good |
| 강사 기본 기능 v1 포함 | B2B 시장 진입점 확보 | ✓ Good |
| 객관식 + 단답형만 (서술형 제외) | 자동 채점 가능한 범위로 제한 | ✓ Good |
| 기출탭탭 스타일 디자인 리뉴얼 (v2.0) | 기존 기능 UI 전면 개선, 사용자 경험 향상 | ✓ Good |
| OKLCH 색상 + Pretendard 폰트 | 모던 색상 공간 + 한글 최적 가독성 | ✓ Good |
| Swiper + Framer Motion 도입 | 터치 인터랙션 + 애니메이션 전문 라이브러리 | ✓ Good |
| POC 아키텍처 유지 (v2.0) | 디자인 리뉴얼에 집중, 백엔드 연동은 v3 | ✓ Good |
| PDF 문제 풀이 v2.1 연기 | 디자인 리뉴얼 완료 후 진행 | — Deferred |
| 반전 모드 도입 (v3.0) | Phaser/Three.js/Canvas로 게이미피케이션 학습 혁명 | — Pending |

---
*Last updated: 2026-02-23 after v3.0 milestone start*
