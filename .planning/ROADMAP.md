# Roadmap: 수학 기출 학습 도우미

## Overview

인증과 데이터 모델 기반(Phase 1)에서 시작해 문제 DB와 수식 렌더링(Phase 2), 핵심 학습 UX인 퀴즈 엔진과 오답노트(Phase 3), DIY 문제집 생성기(Phase 4), AI 취약유형 분석 및 학습 리포트(Phase 5), PWA 오프라인 지원(Phase 6), 강사 관리 포털(Phase 7) 순으로 전달한다. 각 Phase는 이전 Phase의 데이터와 기능에 의존하며, Phase 5의 AI 분석은 Phase 3에서 쌓인 풀이 이력을 소비한다.

## Phases

**Phase numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [x] **Phase 1: 기반 인프라 + 인증** - 인증/인가 시스템, DB 스키마 확정, 반응형 레이아웃 기반 구축 (completed 2026-02-20)
- [ ] **Phase 2: 문제 뱅크 + 수식 렌더링** - 문제 CRUD, 태깅 시스템, KaTeX 렌더링, 강사 문제 입력 UI
- [ ] **Phase 3: 퀴즈 엔진 + 오답노트** - 문제 풀이 세션, 자동 채점, 오답노트 자동 수집, 타이머
- [ ] **Phase 4: DIY 문제집 생성기** - 조건 기반 문제집 구성, 저장, 풀이 이력 반영
- [ ] **Phase 5: AI 분석 + 학습 리포트** - BKT 취약유형 분석, 맞춤 추천, 대시보드, 학습 플래너
- [ ] **Phase 6: PWA 오프라인 지원** - Service Worker, 오프라인 문제 풀기, PWA 설치
- [x] **Phase 7: 강사 관리 포털** - 학생 그룹 관리, 과제 출제, 반별 학습 리포트 조회 (completed 2026-02-20)
- [x] **Phase 8: 마이페이지 + 앱 설정** - 프로필 편집, 비밀번호 변경, 계정 삭제, 다크모드, 수식 글꼴 크기, 앱 정보 (completed 2026-02-20)

## Phase Details

### Phase 1: 기반 인프라 + 인증
**Goal**: 학생과 강사가 이메일로 회원가입/로그인하고 역할별로 구분된 앱에 안정적으로 접근할 수 있다
**Depends on**: Nothing (first phase)
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, UIUX-01
**Success Criteria** (what must be TRUE):
  1. 사용자가 이메일+비밀번호로 회원가입하고 학생/강사 역할을 선택할 수 있다
  2. 로그인한 사용자의 세션이 브라우저 새로고침 및 재방문 후에도 유지된다
  3. 모든 페이지에서 로그아웃 버튼이 작동하고 즉시 로그인 화면으로 이동한다
  4. 강사 계정으로 로그인하면 강사용 UI가, 학생 계정으로 로그인하면 학생용 UI가 표시된다
  5. 앱이 태블릿·모바일·데스크톱 화면에서 레이아웃 깨짐 없이 표시된다
**Plans**: 5 plans
Plans:
- [ ] 01-01-PLAN.md — 모노레포 세팅 + DB 스키마(users, refresh_tokens) + Express 5 서버 기초
- [ ] 01-02-PLAN.md — React + Vite + Tailwind v4 + shadcn/ui 프론트엔드 + 반응형 앱 셸
- [ ] 01-03-PLAN.md — JWT 인증 API 6개 엔드포인트 (register, login, refresh, logout, onboarding, me)
- [ ] 01-04-PLAN.md — 인증 UI (회원가입/로그인/온보딩) + AuthContext + 보호 라우트 + RBAC
- [ ] 01-05-PLAN.md — Phase 1 전체 통합 검증 (사용자 체크포인트)

### Phase 2: 문제 뱅크 + 수식 렌더링
**Goal**: 강사/관리자가 LaTeX 수식이 포함된 수학 문제를 등록·편집할 수 있고, 학생이 수식과 이미지가 정확히 렌더링된 문제를 볼 수 있다
**Depends on**: Phase 1
**Requirements**: QBNK-01, QBNK-02, QBNK-03, QBNK-04, QBNK-05, QBNK-06, QBNK-07, UIUX-02
**Success Criteria** (what must be TRUE):
  1. 강사가 LaTeX 에디터로 문제를 등록하면 수식이 KaTeX로 정확히 미리보기 렌더링된다
  2. 문제에 과목·단원·유형·난이도·출처(수능/모의고사, 연도, 번호) 메타데이터를 태깅할 수 있다
  3. 등록된 문제를 수정·삭제할 수 있으며 변경사항이 즉시 반영된다
  4. 그래프/도형 이미지를 업로드하면 문제에 표시되고 모든 화면 크기에서 왜곡 없이 보인다
  5. 문제별 텍스트+이미지 혼합 상세 해설이 저장되고 조회된다
**Plans**: 5 plans
Plans:
- [ ] 02-01-PLAN.md — Mock Auth 전환(localStorage) + Dexie IndexedDB 스키마 + 문제 CRUD 서비스
- [ ] 02-02-PLAN.md — KaTeX 렌더링 컴포넌트 (LatexPreview, LatexEditor, ImageUpload)
- [ ] 02-03-PLAN.md — 문제 등록/수정 폼 UI (QuestionForm + new/edit 라우트)
- [ ] 02-04-PLAN.md — 문제 목록/상세 페이지 + 라우터 통합 + 홈 업데이트
- [ ] 02-05-PLAN.md — Phase 2 통합 사용자 검증 체크포인트

### Phase 3: 퀴즈 엔진 + 오답노트
**Goal**: 학생이 문제를 풀면 즉시 채점되고, 틀린 문제는 자동으로 오답노트에 수집되어 반복 학습할 수 있다
**Depends on**: Phase 2
**Requirements**: QUIZ-01, QUIZ-02, QUIZ-03, QUIZ-04, QUIZ-05, QUIZ-06, QUIZ-07, ERRN-01, ERRN-02, ERRN-03, ERRN-04, PLAN-01
**Success Criteria** (what must be TRUE):
  1. 학생이 객관식(5지선다)과 단답형 문제를 풀고 제출하면 정오답이 즉시 표시된다
  2. 채점 후 해당 문제의 상세 해설을 볼 수 있다
  3. 문제 풀이 중 타이머가 작동하며 소요 시간이 학습 이력에 기록된다
  4. 틀린 문제가 오답노트에 자동 수집되고, 단원별/유형별 필터로 조회하고 다시 풀 수 있다
  5. 완전히 학습한 오답 문제를 노트에서 제거하고, 모든 풀이 결과가 학습 이력에 저장된다
**Plans**: 5 plans
Plans:
- [ ] 03-01-PLAN.md — Dexie version(2) 스키마 확장 + quiz.service.ts + wrongNote.service.ts
- [ ] 03-02-PLAN.md — useTimer 훅 + 퀴즈 UI 컴포넌트 (QuizPlayer, 입력, 결과, 타이머)
- [ ] 03-03-PLAN.md — 학생 문제 목록 페이지 + 퀴즈 라우트 + main.tsx 등록
- [ ] 03-04-PLAN.md — 오답노트 UI (WrongNoteFilter, WrongNoteCard, WrongNoteList) + 라우트 등록
- [ ] 03-05-PLAN.md — Phase 3 통합 사용자 검증 체크포인트

### Phase 4: DIY 문제집 생성기
**Goal**: 학생이 원하는 단원·유형·난이도 조건으로 나만의 문제집을 만들고 저장하여 반복 활용할 수 있다
**Depends on**: Phase 3
**Requirements**: WKST-01, WKST-02, WKST-03, WKST-04
**Success Criteria** (what must be TRUE):
  1. 학생이 단원·유형·난이도 조합과 문제 수를 지정하여 맞춤 문제집을 생성할 수 있다
  2. 생성된 문제집이 저장되어 나중에 다시 접근하고 풀 수 있다
  3. 문제집 풀이 결과가 학습 이력에 반영되어 AI 분석에 활용된다
**Plans**: 4 plans
Plans:
- [ ] 04-01-PLAN.md — Dexie version(3) Workbook 스키마 + workbook.service.ts (6개 CRUD 함수)
- [ ] 04-02-PLAN.md — WorkbookCreator(2단계 생성 UI) + WorkbookCard + WorkbookList 컴포넌트
- [ ] 04-03-PLAN.md — 문제집 목록/생성/풀기 라우트 + nav 탭 + main.tsx 등록 + WorkbookPlayPage
- [ ] 04-04-PLAN.md — Phase 4 통합 사용자 검증 체크포인트

### Phase 5: AI 분석 + 학습 리포트
**Goal**: 학생이 자신의 취약 유형을 시각적으로 파악하고, AI가 맞춤 문제를 추천하며, 학습 목표와 스트릭을 설정할 수 있다
**Depends on**: Phase 3
**Requirements**: AIAN-01, AIAN-02, AIAN-03, AIAN-04, AIAN-05, REPT-01, REPT-02, REPT-03, REPT-04, PLAN-02, PLAN-03
**Success Criteria** (what must be TRUE):
  1. BKT 모델이 풀이 이력을 기반으로 유형별 지식 상태를 추적하고 취약 유형을 판별한다
  2. 취약 유형 기반 맞춤 문제가 추천되고, 30회 미만 초기 사용자에게는 정답률 기반 휴리스틱 추천이 제공된다
  3. 신규 사용자에게 온보딩 진단 퀴즈(5~10문제)가 제공되어 초기 BKT 상태를 초기화한다
  4. 유형별 정답률 차트, 일별/주별 학습 추이, 취약 유형 클러스터, 전체 학습 통계가 대시보드에 표시된다
  5. 일일 학습 목표를 설정할 수 있고 연속 학습 일수(스트릭)가 기록·표시된다
**Plans**: 5 plans
Plans:
- [ ] 05-01-PLAN.md — Dexie version(4) + BKT 순수 함수 + analytics.service.ts + streak.service.ts
- [ ] 05-02-PLAN.md — recharts 2.15.x + shadcn chart + 4종 분석 차트 컴포넌트 (BarChart, LineChart, RadarChart, SummaryCards)
- [ ] 05-03-PLAN.md — 온보딩 진단 퀴즈 페이지 (/student/onboarding-quiz) + isDiagnosisCompleted 리디렉트
- [ ] 05-04-PLAN.md — 분석 대시보드 페이지 + AI 추천 + 일일 목표 + 스트릭 + 탭바 '분석' 탭 + 홈 실데이터 연결
- [ ] 05-05-PLAN.md — Phase 5 통합 사용자 검증 체크포인트

### Phase 6: PWA 오프라인 지원
**Goal**: 학생이 앱을 홈 화면에 설치하고 오프라인 상태에서도 기본 문제 풀이를 할 수 있다
**Depends on**: Phase 3
**Requirements**: UIUX-03
**Success Criteria** (what must be TRUE):
  1. 앱을 홈 화면에 추가(PWA 설치)할 수 있고 설치 후 앱처럼 실행된다
  2. 오프라인 상태에서 이미 로드한 문제를 풀고 제출할 수 있으며, 온라인 복귀 시 학습 이력이 동기화된다
**Plans**: 3 plans
Plans:
- [ ] 06-01-PLAN.md — vite-plugin-pwa 설치 + manifest + 아이콘 + index.html 메타 태그 + vercel.json
- [ ] 06-02-PLAN.md — PWAInstallBanner 컴포넌트 + main.tsx 통합
- [ ] 06-03-PLAN.md — Phase 6 통합 사용자 검증 체크포인트

### Phase 7: 강사 관리 포털
**Goal**: 강사가 학생 그룹(반)을 만들고, 과제를 출제하며, 학생별 학습 리포트를 조회할 수 있다
**Depends on**: Phase 5
**Requirements**: INST-01, INST-02, INST-03, INST-04, INST-05
**Success Criteria** (what must be TRUE):
  1. 강사가 학생 그룹(반)을 생성하고 초대 코드로 학생을 초대할 수 있다
  2. 강사가 DIY 문제집을 과제로 그룹에 배정할 수 있다
  3. 강사가 그룹 학생들의 학습 리포트와 학생별 취약 유형 분석 결과를 조회할 수 있다
**Plans**: 4 plans
Plans:
- [ ] 07-01-PLAN.md — Dexie version(5) groups/groupMembers/assignments 스키마 + group.service.ts
- [ ] 07-02-PLAN.md — 강사 그룹 관리 UI (목록/생성/상세/과제배정) + nav/라우트 등록
- [ ] 07-03-PLAN.md — 학생 그룹 참여 UI (JoinGroupPage) + 강사 그룹 리포트 페이지
- [x] 07-04-PLAN.md — 강사/학생 홈 업데이트 + Phase 7 통합 사용자 검증 체크포인트 (completed 2026-02-20)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. 기반 인프라 + 인증 | 5/5 | Complete   | 2026-02-20 |
| 2. 문제 뱅크 + 수식 렌더링 | 4/5 | In Progress|  |
| 3. 퀴즈 엔진 + 오답노트 | 4/5 | In Progress|  |
| 4. DIY 문제집 생성기 | 3/4 | In Progress|  |
| 5. AI 분석 + 학습 리포트 | 4/5 | In Progress|  |
| 6. PWA 오프라인 지원 | 2/3 | In Progress|  |
| 7. 강사 관리 포털 | 4/4 | Complete   | 2026-02-20 |
| 8. 마이페이지 + 앱 설정 | 4/4 | Complete   | 2026-02-20 |

### Phase 8: 마이페이지 + 앱 설정
**Goal**: 학생과 강사가 자신의 프로필을 관리하고, 앱 테마·수식 글꼴 크기 등 개인 설정을 조절하며, 계정을 안전하게 관리(비밀번호 변경·삭제)할 수 있다
**Depends on**: Phase 1 (인증 시스템)
**Requirements**: MYPAGE-01, MYPAGE-02, MYPAGE-03, MYPAGE-04, MYPAGE-05
**Success Criteria** (what must be TRUE):
  1. 사용자가 이름과 프로필 아바타를 편집하면 즉시 앱 전체(탭바, 헤더 등)에 반영된다
  2. 비밀번호를 변경하면 기존 비밀번호 확인 후 새 비밀번호로 로그인할 수 있다
  3. 다크모드 전환 시 모든 페이지가 일관된 다크 테마로 표시되고 새로고침 후에도 유지된다
  4. 수식 글꼴 크기를 조절하면 KaTeX 렌더링 문제에 즉시 반영되고 설정이 저장된다
  5. 계정 삭제 시 확인 절차를 거치며, 삭제 후 모든 사용자 데이터가 제거되고 로그인 화면으로 이동한다
**Plans**: 4 plans
Plans:
- [ ] 08-01-PLAN.md — SettingsContext + 다크모드 인프라 + KaTeX 글꼴 크기 CSS + shadcn 컴포넌트 설치
- [ ] 08-02-PLAN.md — auth.ts User 확장 + updateProfile/changePassword/deleteAccount + db.ts version(6)
- [ ] 08-03-PLAN.md — 마이페이지 UI (프로필편집/비밀번호변경/다크모드/수식글꼴/계정삭제)
- [ ] 08-04-PLAN.md — 라우트 연결 + AppShell 헤더 진입점 + 통합 사용자 검증
