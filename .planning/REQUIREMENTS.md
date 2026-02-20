# Requirements: 수학 기출 학습 도우미

**Defined:** 2026-02-19
**Core Value:** 학생이 자신의 취약한 수학 유형을 정확히 파악하고, AI가 추천하는 맞춤 문제를 통해 효율적으로 실력을 향상시킬 수 있어야 한다.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### 인증 (Authentication)

- [x] **AUTH-01**: 사용자가 이메일과 비밀번호로 회원가입할 수 있다
- [x] **AUTH-02**: 사용자가 이메일과 비밀번호로 로그인할 수 있다
- [x] **AUTH-03**: 사용자의 로그인 세션이 브라우저 새로고침/재방문 시에도 유지된다
- [x] **AUTH-04**: 사용자가 모든 페이지에서 로그아웃할 수 있다
- [x] **AUTH-05**: 사용자가 학생 또는 강사 역할로 가입할 수 있다 (RBAC)

### 문제 DB (Question Bank)

- [x] **QBNK-01**: 관리자/강사가 LaTeX 에디터로 수학 문제를 등록할 수 있다
- [x] **QBNK-02**: 각 문제에 과목·단원·유형·난이도 메타데이터가 태깅된다
- [x] **QBNK-03**: 관리자/강사가 등록된 문제를 수정·삭제할 수 있다
- [x] **QBNK-04**: 각 문제에 텍스트+이미지 혼합 상세 해설이 포함된다
- [x] **QBNK-05**: 문제에 출처 정보(수능/모의고사/교육청, 연도, 번호)가 기록된다
- [x] **QBNK-06**: 수식이 LaTeX로 저장되고 KaTeX로 정확하게 렌더링된다
- [x] **QBNK-07**: 그래프/도형은 이미지 파일로 업로드되어 문제에 표시된다

### 문제 풀이 엔진 (Quiz Engine)

- [x] **QUIZ-01**: 학생이 객관식(5지선다) 문제를 풀 수 있다
- [x] **QUIZ-02**: 학생이 단답형(숫자/수식) 문제를 풀 수 있다
- [x] **QUIZ-03**: 문제 제출 시 즉시 자동 채점되어 정오답이 표시된다
- [x] **QUIZ-04**: 채점 후 해당 문제의 상세 해설을 볼 수 있다
- [x] **QUIZ-05**: 문제 풀이 중 타이머가 작동하여 소요 시간이 기록된다
- [x] **QUIZ-06**: 학생이 문제를 북마크(스크랩)할 수 있다
- [x] **QUIZ-07**: 모든 풀이 결과(정오답, 소요시간, 선택답)가 학습 이력에 저장된다

### 오답노트 (Error Notebook)

- [x] **ERRN-01**: 틀린 문제가 자동으로 오답노트에 수집된다
- [x] **ERRN-02**: 학생이 오답노트의 문제를 다시 풀 수 있다 (N회독)
- [x] **ERRN-03**: 오답노트를 단원별/유형별로 필터링하여 볼 수 있다
- [x] **ERRN-04**: 학생이 오답노트에서 완전 학습한 문제를 제거할 수 있다

### DIY 문제집 (Custom Worksheet)

- [x] **WKST-01**: 학생이 단원·유형·난이도를 조합하여 나만의 문제집을 생성할 수 있다
- [x] **WKST-02**: 문제집 생성 시 문제 수를 지정할 수 있다
- [x] **WKST-03**: 생성된 문제집을 저장하고 나중에 다시 풀 수 있다
- [x] **WKST-04**: 문제집 풀이 결과가 학습 이력에 반영된다

### AI 분석 및 추천 (AI Analytics)

- [x] **AIAN-01**: BKT 모델이 학생의 유형별 지식 상태를 추적한다
- [x] **AIAN-02**: 학습 이력 기반으로 취약 유형이 자동 판별된다
- [x] **AIAN-03**: 취약 유형 기반 맞춤 문제가 추천된다
- [x] **AIAN-04**: 초기 사용자(풀이 30회 미만)에게 단원별 정답률 기반 휴리스틱 분석이 제공된다
- [x] **AIAN-05**: 신규 사용자에게 온보딩 진단 퀴즈가 제공된다

### 학습 리포트 (Learning Report)

- [x] **REPT-01**: 유형별 정답률 시각화 차트를 볼 수 있다
- [x] **REPT-02**: 회차별(일별/주별) 학습 추이 그래프를 볼 수 있다
- [x] **REPT-03**: 취약 유형 클러스터가 시각적으로 표시된다
- [x] **REPT-04**: 전체 학습 통계(총 풀이 수, 정답률, 학습 시간)를 볼 수 있다

### 학습 플래너 (Study Planner)

- [x] **PLAN-01**: 문제 풀이 시 타이머가 작동하고 소요 시간이 표시된다
- [x] **PLAN-02**: 일일 학습 목표(문제 수)를 설정할 수 있다
- [x] **PLAN-03**: 학습 스트릭(연속 학습 일수)이 기록·표시된다

### 강사 관리 (Instructor Admin)

- [x] **INST-01**: 강사가 학생 그룹(반)을 생성·관리할 수 있다
- [x] **INST-02**: 강사가 학생을 그룹에 초대(초대 코드)할 수 있다
- [x] **INST-03**: 강사가 DIY 문제집으로 과제를 출제하여 그룹에 배정할 수 있다
- [x] **INST-04**: 강사가 그룹 학생들의 학습 리포트를 조회할 수 있다
- [x] **INST-05**: 강사가 학생별 취약 유형 분석 결과를 볼 수 있다

### 마이페이지 + 앱 설정 (MyPage & Settings)

- [ ] **MYPAGE-01**: 사용자가 이름과 프로필 아바타를 편집하면 즉시 앱 전체에 반영된다
- [ ] **MYPAGE-02**: 비밀번호를 변경하면 기존 비밀번호 확인 후 새 비밀번호로 로그인할 수 있다
- [ ] **MYPAGE-03**: 다크모드 전환 시 모든 페이지가 일관된 다크 테마로 표시되고 새로고침 후에도 유지된다
- [ ] **MYPAGE-04**: 수식 글꼴 크기를 조절하면 KaTeX 렌더링에 즉시 반영되고 설정이 저장된다
- [ ] **MYPAGE-05**: 계정 삭제 시 확인 절차를 거치며 삭제 후 모든 사용자 데이터가 제거되고 로그인 화면으로 이동한다

### UI/UX

- [x] **UIUX-01**: 태블릿·모바일·데스크톱에서 반응형으로 동작한다
- [x] **UIUX-02**: 수학 문제/해설의 수식이 모든 화면 크기에서 정확히 렌더링된다
- [x] **UIUX-03**: PWA로 설치하여 앱처럼 사용할 수 있다 (홈 화면 추가)

## v2 Requirements

### 결제/구독

- **PAY-01**: 무료 사용 제한 + 유료 구독 (월/3개월/수능패스)
- **PAY-02**: 결제 시스템 연동 (토스페이먼츠 등)

### 확장 기능

- **EXT-01**: PWA 오프라인 문제 풀이 지원 (Service Worker 캐시)
- **EXT-02**: 수학 외 과목 확장 (국어, 영어 등)
- **EXT-03**: DKT 모델 전환 (LSTM 기반, 1000+ 학생 데이터 확보 후)
- **EXT-04**: N회독 반복 학습 스케줄링 (에빙하우스 망각 곡선)
- **EXT-05**: 이메일 인증 + 비밀번호 재설정
- **EXT-06**: OAuth 소셜 로그인 (Google, Kakao)

### 강사/학원 고도화

- **ADM-01**: 학원 대시보드 (반별/학생별 통계)
- **ADM-02**: 학부모 리포트 발송
- **ADM-03**: 화이트라벨 (학원 브랜딩)

## Out of Scope

| Feature | Reason |
|---------|--------|
| eBook 교재 제공 | 저작권 확보 비용 + 법적 리스크; 문제 DB에 집중 |
| 실시간 1:1 질문답변 | 튜터 공급망 확보 필요, 핵심 가치와 무관 |
| 게이미피케이션 과잉 (뽑기/리그/포인트샵) | 외재적 보상으로 학습 동기 왜곡, 교육 신뢰도 하락 |
| 서술형 AI 채점 | 오채점 리스크 높음, 복잡도 과다 |
| 실시간 동시접속 모의고사 | WebSocket 인프라 + 부정행위 방지 = 별도 제품 |
| 네이티브 앱 (iOS/Android) | PWA로 대체, v1 범위 초과 |
| 사진 찍어 문제 인식 (OCR) | 콴다의 핵심이지만 우리 핵심 가치와 다름 |
| 소셜 피드/커뮤니티 | 콘텐츠 모더레이션 비용, 핵심 학습 UX와 무관 |
| 과도한 광고 노출 | 교육 앱 신뢰도 하락, v1 완전 무료 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Complete |
| AUTH-02 | Phase 1 | Complete |
| AUTH-03 | Phase 1 | Complete |
| AUTH-04 | Phase 1 | Complete |
| AUTH-05 | Phase 1 | Complete |
| UIUX-01 | Phase 1 | Complete |
| QBNK-01 | Phase 2 | Complete |
| QBNK-02 | Phase 2 | Complete |
| QBNK-03 | Phase 2 | Complete |
| QBNK-04 | Phase 2 | Complete |
| QBNK-05 | Phase 2 | Complete |
| QBNK-06 | Phase 2 | Complete |
| QBNK-07 | Phase 2 | Complete |
| UIUX-02 | Phase 2 | Complete |
| QUIZ-01 | Phase 3 | Complete |
| QUIZ-02 | Phase 3 | Complete |
| QUIZ-03 | Phase 3 | Complete |
| QUIZ-04 | Phase 3 | Complete |
| QUIZ-05 | Phase 3 | Complete |
| QUIZ-06 | Phase 3 | Complete |
| QUIZ-07 | Phase 3 | Complete |
| ERRN-01 | Phase 3 | Complete |
| ERRN-02 | Phase 3 | Complete |
| ERRN-03 | Phase 3 | Complete |
| ERRN-04 | Phase 3 | Complete |
| PLAN-01 | Phase 3 | Complete |
| WKST-01 | Phase 4 | Complete |
| WKST-02 | Phase 4 | Complete |
| WKST-03 | Phase 4 | Complete |
| WKST-04 | Phase 4 | Complete |
| AIAN-01 | Phase 5 | Complete |
| AIAN-02 | Phase 5 | Complete |
| AIAN-03 | Phase 5 | Complete |
| AIAN-04 | Phase 5 | Complete |
| AIAN-05 | Phase 5 | Complete |
| REPT-01 | Phase 5 | Complete |
| REPT-02 | Phase 5 | Complete |
| REPT-03 | Phase 5 | Complete |
| REPT-04 | Phase 5 | Complete |
| PLAN-02 | Phase 5 | Complete |
| PLAN-03 | Phase 5 | Complete |
| UIUX-03 | Phase 6 | Complete |
| INST-01 | Phase 7 | Complete |
| INST-02 | Phase 7 | Complete |
| INST-03 | Phase 7 | Complete |
| INST-04 | Phase 7 | Complete |
| INST-05 | Phase 7 | Complete |
| MYPAGE-01 | Phase 8 | Planned |
| MYPAGE-02 | Phase 8 | Planned |
| MYPAGE-03 | Phase 8 | Planned |
| MYPAGE-04 | Phase 8 | Planned |
| MYPAGE-05 | Phase 8 | Planned |

**Coverage:**
- v1 requirements: 47 total
- Mapped to phases: 47
- Unmapped: 0 ✓

**Phase assignment changes from initial traceability:**
- PLAN-01 moved from Phase 6 → Phase 3 (타이머는 퀴즈 엔진의 일부)
- PLAN-02, PLAN-03 moved from Phase 6 → Phase 5 (일일 목표·스트릭은 대시보드/AI 분석과 함께)
- UIUX-01 moved to Phase 1 (반응형 레이아웃은 기반 인프라 단계에서 구축)
- UIUX-02 assigned to Phase 2 (수식 렌더링은 문제 뱅크와 함께)

---
*Requirements defined: 2026-02-19*
*Last updated: 2026-02-19 after roadmap creation — traceability revised*
