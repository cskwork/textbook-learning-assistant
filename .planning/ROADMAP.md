# Roadmap: 수학 기출 학습 도우미

## Milestones

- ✅ **v1.0 MVP** - Phases 1-9 (완료 2026-02-21)
- 🚧 **v2.0 기출탭탭 스타일 디자인 리뉴얼** - Phases 10-14 (진행 중)

## Phases

<details>
<summary>✅ v1.0 MVP (Phases 1-9) - 완료 2026-02-21</summary>

- [x] **Phase 1: 기반 인프라 + 인증** - 인증/인가 시스템, DB 스키마 확정, 반응형 레이아웃 기반 구축 (completed 2026-02-20)
- [x] **Phase 2: 문제 뱅크 + 수식 렌더링** - 문제 CRUD, 태깅 시스템, KaTeX 렌더링, 강사 문제 입력 UI (completed 2026-02-21)
- [x] **Phase 3: 퀴즈 엔진 + 오답노트** - 문제 풀이 세션, 자동 채점, 오답노트 자동 수집, 타이머 (completed 2026-02-21)
- [x] **Phase 4: DIY 문제집 생성기** - 조건 기반 문제집 구성, 저장, 풀이 이력 반영 (completed 2026-02-21)
- [x] **Phase 5: AI 분석 + 학습 리포트** - BKT 취약유형 분석, 맞춤 추천, 대시보드, 학습 플래너 (completed 2026-02-20)
- [x] **Phase 6: PWA 오프라인 지원** - Service Worker, 오프라인 문제 풀기, PWA 설치 (completed 2026-02-20)
- [x] **Phase 7: 강사 관리 포털** - 학생 그룹 관리, 과제 출제, 반별 학습 리포트 조회 (completed 2026-02-20)
- [x] **Phase 8: 마이페이지 + 앱 설정** - 프로필 편집, 비밀번호 변경, 계정 삭제, 다크모드, 수식 글꼴 크기, 앱 정보 (completed 2026-02-20)
- [x] **Phase 9: AI 문제 생성 보조** - Gemini API 기반 문제 자동 생성, 강사 학생별 상세 분석, 학생 홈 빈 상태 개선 (completed 2026-02-21)

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
- [x] 01-01-PLAN.md — 모노레포 세팅 + DB 스키마(users, refresh_tokens) + Express 5 서버 기초
- [x] 01-02-PLAN.md — React + Vite + Tailwind v4 + shadcn/ui 프론트엔드 + 반응형 앱 셸
- [x] 01-03-PLAN.md — JWT 인증 API 6개 엔드포인트 (register, login, refresh, logout, onboarding, me)
- [x] 01-04-PLAN.md — 인증 UI (회원가입/로그인/온보딩) + AuthContext + 보호 라우트 + RBAC
- [x] 01-05-PLAN.md — Phase 1 전체 통합 검증 (사용자 체크포인트)

### Phase 2: 문제 뱅크 + 수식 렌더링
**Goal**: 강사/관리자가 LaTeX 수식이 포함된 수학 문제를 등록·편집할 수 있고, 학생이 수식과 이미지가 정확히 렌더링된 문제를 볼 수 있다
**Depends on**: Phase 1
**Requirements**: QBNK-01, QBNK-02, QBNK-03, QBNK-04, QBNK-05, QBNK-06, QBNK-07, UIUX-02
**Success Criteria** (what must be TRUE):
  1. 강사가 LaTeX 에디터로 문제를 등록하면 수식이 KaTeX로 정확히 미리보기 렌더링된다
  2. 문제에 과목·단원·유형·난이도·출처 메타데이터를 태깅할 수 있다
  3. 등록된 문제를 수정·삭제할 수 있으며 변경사항이 즉시 반영된다
  4. 그래프/도형 이미지를 업로드하면 문제에 표시되고 모든 화면 크기에서 왜곡 없이 보인다
  5. 문제별 텍스트+이미지 혼합 상세 해설이 저장되고 조회된다
**Plans**: 5 plans
Plans:
- [x] 02-01-PLAN.md — Mock Auth 전환(localStorage) + Dexie IndexedDB 스키마 + 문제 CRUD 서비스
- [x] 02-02-PLAN.md — KaTeX 렌더링 컴포넌트 (LatexPreview, LatexEditor, ImageUpload)
- [x] 02-03-PLAN.md — 문제 등록/수정 폼 UI (QuestionForm + new/edit 라우트)
- [x] 02-04-PLAN.md — 문제 목록/상세 페이지 + 라우터 통합 + 홈 업데이트
- [x] 02-05-PLAN.md — Phase 2 통합 사용자 검증 체크포인트

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
- [x] 03-01-PLAN.md — Dexie version(2) 스키마 확장 + quiz.service.ts + wrongNote.service.ts
- [x] 03-02-PLAN.md — useTimer 훅 + 퀴즈 UI 컴포넌트 (QuizPlayer, 입력, 결과, 타이머)
- [x] 03-03-PLAN.md — 학생 문제 목록 페이지 + 퀴즈 라우트 + main.tsx 등록
- [x] 03-04-PLAN.md — 오답노트 UI (WrongNoteFilter, WrongNoteCard, WrongNoteList) + 라우트 등록
- [x] 03-05-PLAN.md — Phase 3 통합 사용자 검증 체크포인트

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
- [x] 04-01-PLAN.md — Dexie version(3) Workbook 스키마 + workbook.service.ts
- [x] 04-02-PLAN.md — WorkbookCreator(2단계 생성 UI) + WorkbookCard + WorkbookList 컴포넌트
- [x] 04-03-PLAN.md — 문제집 목록/생성/풀기 라우트 + nav 탭 + main.tsx 등록 + WorkbookPlayPage
- [x] 04-04-PLAN.md — Phase 4 통합 사용자 검증 체크포인트

### Phase 5: AI 분석 + 학습 리포트
**Goal**: 학생이 자신의 취약 유형을 시각적으로 파악하고, AI가 맞춤 문제를 추천하며, 학습 목표와 스트릭을 설정할 수 있다
**Depends on**: Phase 3
**Requirements**: AIAN-01, AIAN-02, AIAN-03, AIAN-04, AIAN-05, REPT-01, REPT-02, REPT-03, REPT-04, PLAN-02, PLAN-03
**Success Criteria** (what must be TRUE):
  1. BKT 모델이 풀이 이력을 기반으로 유형별 지식 상태를 추적하고 취약 유형을 판별한다
  2. 취약 유형 기반 맞춤 문제가 추천되고, 초기 사용자에게는 정답률 기반 휴리스틱 추천이 제공된다
  3. 신규 사용자에게 온보딩 진단 퀴즈가 제공되어 초기 BKT 상태를 초기화한다
  4. 유형별 정답률 차트, 일별/주별 학습 추이, 취약 유형 클러스터, 전체 학습 통계가 대시보드에 표시된다
  5. 일일 학습 목표를 설정할 수 있고 연속 학습 일수(스트릭)가 기록·표시된다
**Plans**: 5 plans
Plans:
- [x] 05-01-PLAN.md — Dexie version(4) + BKT 순수 함수 + analytics.service.ts + streak.service.ts
- [x] 05-02-PLAN.md — recharts + shadcn chart + 4종 분석 차트 컴포넌트
- [x] 05-03-PLAN.md — 온보딩 진단 퀴즈 페이지 + isDiagnosisCompleted 리디렉트
- [x] 05-04-PLAN.md — 분석 대시보드 페이지 + AI 추천 + 일일 목표 + 스트릭 + 홈 실데이터 연결
- [x] 05-05-PLAN.md — Phase 5 통합 사용자 검증 체크포인트

### Phase 6: PWA 오프라인 지원
**Goal**: 학생이 앱을 홈 화면에 설치하고 오프라인 상태에서도 기본 문제 풀이를 할 수 있다
**Depends on**: Phase 3
**Requirements**: UIUX-03
**Success Criteria** (what must be TRUE):
  1. 앱을 홈 화면에 추가(PWA 설치)할 수 있고 설치 후 앱처럼 실행된다
  2. 오프라인 상태에서 이미 로드한 문제를 풀고 제출할 수 있으며, 온라인 복귀 시 학습 이력이 동기화된다
**Plans**: 3 plans
Plans:
- [x] 06-01-PLAN.md — vite-plugin-pwa 설치 + manifest + 아이콘 + index.html 메타 태그 + vercel.json
- [x] 06-02-PLAN.md — PWAInstallBanner 컴포넌트 + main.tsx 통합
- [x] 06-03-PLAN.md — Phase 6 통합 사용자 검증 체크포인트

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
- [x] 07-01-PLAN.md — Dexie version(5) groups/groupMembers/assignments 스키마 + group.service.ts
- [x] 07-02-PLAN.md — 강사 그룹 관리 UI (목록/생성/상세/과제배정) + nav/라우트 등록
- [x] 07-03-PLAN.md — 학생 그룹 참여 UI (JoinGroupPage) + 강사 그룹 리포트 페이지
- [x] 07-04-PLAN.md — 강사/학생 홈 업데이트 + Phase 7 통합 사용자 검증 체크포인트

### Phase 8: 마이페이지 + 앱 설정
**Goal**: 학생과 강사가 자신의 프로필을 관리하고, 앱 테마·수식 글꼴 크기 등 개인 설정을 조절하며, 계정을 안전하게 관리할 수 있다
**Depends on**: Phase 1
**Requirements**: MYPAGE-01, MYPAGE-02, MYPAGE-03, MYPAGE-04, MYPAGE-05
**Success Criteria** (what must be TRUE):
  1. 사용자가 이름과 프로필 아바타를 편집하면 즉시 앱 전체에 반영된다
  2. 비밀번호를 변경하면 기존 비밀번호 확인 후 새 비밀번호로 로그인할 수 있다
  3. 다크모드 전환 시 모든 페이지가 일관된 다크 테마로 표시되고 새로고침 후에도 유지된다
  4. 수식 글꼴 크기를 조절하면 KaTeX 렌더링 문제에 즉시 반영되고 설정이 저장된다
  5. 계정 삭제 시 확인 절차를 거치며, 삭제 후 모든 사용자 데이터가 제거되고 로그인 화면으로 이동한다
**Plans**: 4 plans
Plans:
- [x] 08-01-PLAN.md — SettingsContext + 다크모드 인프라 + KaTeX 글꼴 크기 CSS + shadcn 컴포넌트 설치
- [x] 08-02-PLAN.md — auth.ts User 확장 + updateProfile/changePassword/deleteAccount + db.ts version(6)
- [x] 08-03-PLAN.md — 마이페이지 UI (프로필편집/비밀번호변경/다크모드/수식글꼴/계정삭제)
- [x] 08-04-PLAN.md — 라우트 연결 + AppShell 헤더 진입점 + 통합 사용자 검증

### Phase 9: AI 문제 생성 보조
**Goal**: 강사가 Gemini API를 통해 수학 문제를 자동 생성하여 QuestionForm 필드에 채울 수 있고, 강사가 학생별 상세 분석(차트, 오답노트)을 확인하며, 학생 홈 빈 상태가 개선된다
**Depends on**: Phase 8
**Requirements**: AIGEN-01, AIGEN-02, AIGEN-03, AIGEN-04, INSTRV-01, STUDHM-01
**Success Criteria** (what must be TRUE):
  1. 강사가 Gemini API 키를 등록하고 AI 생성 패널로 수학 문제를 자동 생성할 수 있다
  2. AI 생성된 문제 내용이 QuestionForm 필드에 자동으로 채워진다
  3. 강사가 학생별 상세 분석 페이지에서 차트와 오답노트를 조회할 수 있다
  4. 신규 학생 홈에 빈 상태 안내 메시지와 학습 시작 CTA가 표시된다
**Plans**: 3 plans
Plans:
- [x] 09-01-PLAN.md — Gemini 서비스 인프라 + UserSetting.geminiApiKey + settings.service.ts 확장
- [x] 09-02-PLAN.md — AIGeneratePanel 컴포넌트 + QuestionForm 통합 + 강사 프로필 API 키 섹션
- [x] 09-03-PLAN.md — 강사 학생별 상세 분석 페이지 + 학생 홈 빈 상태 개선

</details>

---

## v2.0 기출탭탭 스타일 디자인 리뉴얼 (진행 중)

**Milestone Goal:** 기출탭탭에서 영감받은 프로페셔널 교육 앱 디자인으로 전면 리뉴얼하여 사용자 경험을 대폭 개선한다.

### Phase Checklist

- [x] **Phase 10: 디자인 시스템** - 기출탭탭 스타일 색상·타이포그래피·컴포넌트·다크모드 전면 교체 (completed 2026-02-20)
- [x] **Phase 11: 공통 레이아웃 + 애니메이션** - 네비게이션 리디자인, 반응형 전면 검토, 페이지 전환·마이크로 인터랙션, 온보딩 플로우 (completed 2026-02-21)
- [x] **Phase 12: 학생 홈 + 문제 풀이 UX** - 학생 대시보드 리디자인, Swiper 슬라이더, 퀴즈 화면·목록·채점 결과 리뉴얼 (completed 2026-02-21)
- [x] **Phase 13: 분석 대시보드 + 학습 플래너** - 차트 리디자인, 취약 유형 시각화, 학습 히스토리 타임라인, 일간/주간 플래너, 리마인더 (completed 2026-02-21)
- [ ] **Phase 14: 강사 포털 리뉴얼** - 강사 홈·문제 관리·학생 분석·그룹 과제 관리 UI 전면 리디자인

## Phase Details

### Phase 10: 디자인 시스템
**Goal**: 앱 전체에서 기출탭탭 스타일 디자인 언어가 일관되게 작동하는 토큰·타이포그래피·컴포넌트 기반이 갖춰진다
**Depends on**: Phase 9 (v1.0 완료)
**Requirements**: DSGN-01, DSGN-02, DSGN-03, DSGN-04
**Success Criteria** (what must be TRUE):
  1. 앱 전체 색상이 기출탭탭 스타일 파란/남색 계열로 교체되고, 라이트·다크 모드 양쪽에서 일관된 색상 토큰이 적용된다
  2. 모든 텍스트가 Pretendard(또는 대체 한글 폰트)로 렌더링되고 크기 체계와 줄간격이 가독성 기준을 충족한다
  3. 카드·버튼·입력 컴포넌트가 둥근 모서리·그림자·hover·비활성 상태를 포함한 새 디자인으로 표시된다
  4. 다크모드 전환 시 모든 신규 디자인 토큰이 라이트 버전과 대응하는 다크 값으로 일관되게 적용된다
**Plans**: 3 plans
Plans:
- [x] 10-01-PLAN.md — Pretendard 폰트 CDN + 타이포그래피 시스템 + 색상 토큰 전면 교체 + 다크모드 토큰 (completed 2026-02-20)
- [x] 10-02-PLAN.md — Button/Card/Input/Badge 컴포넌트 기출탭탭 스타일 리뉴얼 (completed 2026-02-20)
- [x] 10-03-PLAN.md — Phase 10 통합 시각 검증 체크포인트 (completed 2026-02-20)

### Phase 11: 공통 레이아웃 + 애니메이션
**Goal**: 모든 페이지에서 공유하는 네비게이션·레이아웃 구조가 기출탭탭 스타일로 리뉴얼되고, 페이지 전환과 마이크로 인터랙션이 앱 전체에 일관되게 작동한다
**Depends on**: Phase 10
**Requirements**: LYOT-01, LYOT-02, LYOT-03, FLOW-01, FLOW-02, FLOW-03
**Success Criteria** (what must be TRUE):
  1. 탭바/사이드바 네비게이션이 기출탭탭 스타일 아이콘과 활성 상태 인디케이터로 표시된다
  2. 모바일에서 터치 타겟·여백·스크롤 영역이 검토 기준을 통과하고, 오답노트·문제집 페이지가 카드 그리드·정렬/필터 UI로 리디자인된다
  3. 페이지 간 이동 시 Framer Motion 기반 슬라이드/페이드 전환 애니메이션이 재생된다
  4. 버튼 ripple·카드 hover 확대·로딩 스켈레톤·토스트 애니메이션이 앱 전체에서 일관되게 작동한다
  5. 온보딩 플로우가 스텝별 진행 표시·역할 선택 카드·완료 축하 애니메이션을 포함한 새 디자인으로 표시된다
**Plans**: 5 plans
Plans:
- [x] 11-01-PLAN.md — Framer Motion 페이지 전환 + 마이크로 인터랙션 유틸리티 (RippleButton, AnimatedCard, FadeIn, Skeleton) (completed 2026-02-21)
- [x] 11-02-PLAN.md — BottomNav/Sidebar/AppShell 기출탭탭 스타일 네비게이션 리뉴얼 + 반응형 검토 (completed 2026-02-21)
- [x] 11-03-PLAN.md — 오답노트/문제집 페이지 카드 그리드 + 칩 필터 + 정렬 UI 리디자인 (completed 2026-02-21)
- [x] 11-04-PLAN.md — 온보딩 플로우 리디자인 (스텝 진행 + 카드 애니메이션 + 축하 효과) (completed 2026-02-21)
- [x] 11-05-PLAN.md — Phase 11 통합 빌드 검증 + 사용자 시각 검증 체크포인트 (completed 2026-02-21)

### Phase 12: 학생 홈 + 문제 풀이 UX
**Goal**: 학생이 홈 대시보드와 문제 풀이 화면에서 기출탭탭 스타일 인터페이스를 경험하고, Swiper 기반 탐색과 채점 애니메이션이 작동한다
**Depends on**: Phase 11
**Requirements**: HOME-01, HOME-02, HOME-03, QUIZ-01, QUIZ-02, QUIZ-03, QUIZ-04
**Success Criteria** (what must be TRUE):
  1. 학생 홈에 오늘의 학습 현황 카드·AI 추천 문제·스트릭·최근 학습 이력이 기출탭탭 스타일로 표시된다
  2. 홈 배너/카드 영역에서 Swiper 슬라이더가 작동하고 추천 문제·취약 유형 알림·이벤트 배너가 스와이프로 탐색된다
  3. 빠른 학습 시작 CTA(오답 복습, AI 추천, 문제집 이어풀기) 버튼 영역이 홈에서 바로 접근 가능하다
  4. 문제 풀이 화면이 넓은 수식 영역·직관적 선택지·문제 번호 인디케이터를 갖춘 새 디자인으로 표시된다
  5. 좌우 스와이프로 이전/다음 문제 이동이 되고, 채점 시 정답 체크 효과·오답 흔들림 효과·점수 카운트업 애니메이션이 재생된다
**Plans**: 4 plans (3 waves)
Plans:
- [ ] 12-01-PLAN.md — Swiper 설치 + 학생 홈 대시보드 기출탭탭 스타일 리디자인 (HOME-01, HOME-02, HOME-03) [Wave 1]
- [ ] 12-02-PLAN.md — 문제 풀이 화면 리디자인 + Swiper 문제 전환 + 채점 애니메이션 (QUIZ-01, QUIZ-02, QUIZ-03) [Wave 2]
- [ ] 12-03-PLAN.md — 문제 목록/선택 UI 카드 그리드 + 칩 필터 + 난이도 뱃지 리디자인 (QUIZ-04) [Wave 1]
- [x] 12-04-PLAN.md — Phase 12 통합 빌드 검증 + 사용자 시각 검증 체크포인트 [Wave 3] (completed 2026-02-21)

### Phase 13: 분석 대시보드 + 학습 플래너
**Goal**: 학생이 인터랙티브 차트와 타임라인으로 학습 현황을 직관적으로 파악하고, 일간/주간 플래너로 학습 계획을 세우고 리마인더를 받을 수 있다
**Depends on**: Phase 12
**Requirements**: ANLZ-01, ANLZ-02, ANLZ-03, PLAN-01, PLAN-02, PLAN-03
**Success Criteria** (what must be TRUE):
  1. 분석 대시보드 차트가 그라데이션·인터랙티브 인터랙션·날짜 범위 선택을 포함한 새 디자인으로 표시된다
  2. 유형별 마스터리 맵과 추천 학습 경로가 취약 유형 시각화 영역에 표시된다
  3. 일별 학습량·정답률 추이·주간 비교가 포함된 학습 히스토리 타임라인 UI가 작동한다
  4. 캘린더 뷰와 할 일 체크리스트가 포함된 일간/주간 플래너에서 학습 목표를 설정하고 진행률을 확인할 수 있다
  5. 일일 학습 미완료 시 브라우저 알림(Notification API)이 발송되고, 주간 목표 문제 수·과목별 시간 배분 설정이 저장된다
**Plans**: 5 plans (3 waves)
Plans:
- [ ] 13-01-PLAN.md — 분석 차트 그라데이션 리디자인 + DateRangeSelector + 기출탭탭 스타일 적용 (ANLZ-01) [Wave 1]
- [ ] 13-02-PLAN.md — 마스터리 맵 + 추천 학습 경로 + 학습 히스토리 타임라인 (ANLZ-02, ANLZ-03) [Wave 2]
- [ ] 13-03-PLAN.md — Dexie version(7) 스키마 확장 + planner.service + notification.service 데이터 레이어 (PLAN-01, PLAN-02, PLAN-03) [Wave 1]
- [ ] 13-04-PLAN.md — 학습 플래너 UI (캘린더 뷰 + 체크리스트 + 주간 설정 + 알림) + 라우트/탭바 연결 (PLAN-01, PLAN-02, PLAN-03) [Wave 2]
- [x] 13-05-PLAN.md — Phase 13 통합 빌드 검증 + 사용자 시각 검증 체크포인트 [Wave 3] (completed 2026-02-21)

### Phase 14: 강사 포털 리뉴얼
**Goal**: 강사가 학생 현황·문제 관리·학생 분석·그룹 과제 관리를 기출탭탭 스타일 인터페이스로 사용할 수 있다
**Depends on**: Phase 11
**Requirements**: INST-01, INST-02, INST-03, INST-04
**Success Criteria** (what must be TRUE):
  1. 강사 홈 대시보드에 학생 현황 카드·최근 과제·반별 성적 요약이 기출탭탭 스타일로 표시된다
  2. 문제 관리 화면에서 문제 카드 그리드·필터 사이드바·일괄 작업 UI가 작동한다
  3. 강사 학생 분석 대시보드에서 개별 학생 상세 보기와 반 전체 비교 차트가 리디자인된 UI로 표시된다
  4. 그룹/과제 관리 화면에서 과제 진행률과 미완료 학생 알림이 새 UI로 표시된다
**Plans**: 4 plans (2 waves)
Plans:
- [ ] 14-01-PLAN.md — 강사 홈 대시보드 기출탭탭 스타일 리디자인 (AnimatedCard/FadeIn + 반별 성적 요약 + 최근 과제) [Wave 1]
- [ ] 14-02-PLAN.md — 강사 문제 관리 UI 리디자인 (필터 사이드바/칩 + 일괄 선택/삭제 + QuestionList 선택 모드) [Wave 1]
- [ ] 14-03-PLAN.md — 그룹/과제 관리 + 학생 분석 리디자인 (과제 진행률 + 미완료 알림 + 반 비교 차트 + AnimatedCard/FadeIn) [Wave 1]
- [ ] 14-04-PLAN.md — Phase 14 통합 빌드 검증 + 사용자 시각 검증 체크포인트 [Wave 2]

## Progress

**Execution Order:**
Phases execute in numeric order: 10 → 11 → 12 → 13 → 14
(Phase 14는 Phase 11 완료 후 Phase 12와 병렬 진행 가능)

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. 기반 인프라 + 인증 | v1.0 | 5/5 | Complete | 2026-02-20 |
| 2. 문제 뱅크 + 수식 렌더링 | v1.0 | 5/5 | Complete | 2026-02-21 |
| 3. 퀴즈 엔진 + 오답노트 | v1.0 | 5/5 | Complete | 2026-02-21 |
| 4. DIY 문제집 생성기 | v1.0 | 4/4 | Complete | 2026-02-21 |
| 5. AI 분석 + 학습 리포트 | v1.0 | 5/5 | Complete | 2026-02-20 |
| 6. PWA 오프라인 지원 | v1.0 | 3/3 | Complete | 2026-02-20 |
| 7. 강사 관리 포털 | v1.0 | 4/4 | Complete | 2026-02-20 |
| 8. 마이페이지 + 앱 설정 | v1.0 | 4/4 | Complete | 2026-02-20 |
| 9. AI 문제 생성 보조 | v1.0 | 3/3 | Complete | 2026-02-21 |
| 10. 디자인 시스템 | v2.0 | 3/3 | Complete | 2026-02-20 |
| 11. 공통 레이아웃 + 애니메이션 | v2.0 | 5/5 | Complete | 2026-02-21 |
| 12. 학생 홈 + 문제 풀이 UX | 4/4 | Complete    | 2026-02-21 | - |
| 13. 분석 대시보드 + 학습 플래너 | 5/5 | Complete    | 2026-02-21 | - |
| 14. 강사 포털 리뉴얼 | v2.0 | 0/4 | Planning complete | - |
