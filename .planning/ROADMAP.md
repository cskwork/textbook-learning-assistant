# Roadmap: 수학 기출 학습 도우미

## Milestones

- ✅ **v1.0 MVP** — Phases 1-9 (shipped 2026-02-21) → [archive](milestones/v1.0-ROADMAP.md)
- ✅ **v2.0 기출탭탭 스타일 디자인 리뉴얼** — Phases 10-14 (shipped 2026-02-21) → [archive](milestones/v2.0-ROADMAP.md)
- ✅ **v3.0 반전 모드 게이미피케이션** — Phases 15-20 (shipped 2026-02-24) → [archive](milestones/v3.0-ROADMAP.md)
- 🚧 **v4.0 PDF 2-Way 학습 시스템** — Phases 21-26 (in progress)

## Phases

<details>
<summary>✅ v1.0 MVP (Phases 1-9) — SHIPPED 2026-02-21</summary>

- [x] Phase 1: 기반 인프라 + 인증 (5/5 plans) — completed 2026-02-20
- [x] Phase 2: 문제 뱅크 + 수식 렌더링 (5/5 plans) — completed 2026-02-21
- [x] Phase 3: 퀴즈 엔진 + 오답노트 (5/5 plans) — completed 2026-02-21
- [x] Phase 4: DIY 문제집 생성기 (4/4 plans) — completed 2026-02-21
- [x] Phase 5: AI 분석 + 학습 리포트 (5/5 plans) — completed 2026-02-20
- [x] Phase 6: PWA 오프라인 지원 (3/3 plans) — completed 2026-02-20
- [x] Phase 7: 강사 관리 포털 (4/4 plans) — completed 2026-02-20
- [x] Phase 8: 마이페이지 + 앱 설정 (4/4 plans) — completed 2026-02-20
- [x] Phase 9: AI 문제 생성 보조 (3/3 plans) — completed 2026-02-21

</details>

<details>
<summary>✅ v2.0 기출탭탭 스타일 디자인 리뉴얼 (Phases 10-14) — SHIPPED 2026-02-21</summary>

- [x] Phase 10: 디자인 시스템 (3/3 plans) — completed 2026-02-20
- [x] Phase 11: 공통 레이아웃 + 애니메이션 (5/5 plans) — completed 2026-02-21
- [x] Phase 12: 학생 홈 + 문제 풀이 UX (4/4 plans) — completed 2026-02-21
- [x] Phase 13: 분석 대시보드 + 학습 플래너 (5/5 plans) — completed 2026-02-21
- [x] Phase 14: 강사 포털 리뉴얼 (4/4 plans) — completed 2026-02-21

</details>

<details>
<summary>✅ v3.0 반전 모드 게이미피케이션 (Phases 15-20) — SHIPPED 2026-02-24</summary>

- [x] Phase 15: 반전 모드 기반 인프라 + 번들 전략 (3/3 plans) — completed 2026-02-23
- [x] Phase 16: 보상 시스템 (5/5 plans) — completed 2026-02-23
- [x] Phase 17: 사운드 시스템 (2/2 plans) — completed 2026-02-23
- [x] Phase 18: Three.js 시각 효과 (4/4 plans) — completed 2026-02-24
- [x] Phase 19: 게임화 퀴즈 엔진 (4/4 plans) — completed 2026-02-24
- [x] Phase 20: 전체 화면 반전 디자인 (4/4 plans) — completed 2026-02-24

</details>

### 🚧 v4.0 PDF 2-Way 학습 시스템 (In Progress)

**Milestone Goal:** PDF ↔ 앱 양방향 연동 — Gemini Vision AI 문제 자동 추출, 강사 검수, PDF 뷰어 풀이 오버레이, 시험지/학습지 PDF 내보내기, 문제 DB 자동 등록.
**접근 방식:** POC 우선 (Vercel static + serverless, 메모리 상태만 사용, DB 없이 핵심 파이프라인 검증)

- [ ] **Phase 21: Vercel 인프라 + PDF 뷰어 기반** — Vercel 배포 설정, react-pdf/PDF.js 뷰어 컴포넌트 구축
- [ ] **Phase 22: Gemini AI 파싱 파이프라인** — PDF 업로드 플로우, Gemini Vision 수식 추출, 진행 상태 UI
- [ ] **Phase 23: 강사 검수 UI** — AI 추출 결과 인라인 편집, 신뢰도 시각화, 수동 입력 fallback
- [ ] **Phase 24: PDF 내보내기** — 시험지/학습지 스타일 PDF 생성, KaTeX → PDF 변환 파이프라인
- [ ] **Phase 25: PDF 뷰어 풀이 오버레이 통합** — 정답 가리기 오버레이, 즉석 문제 풀기, 양방향 네비게이션
- [ ] **Phase 26: DB 연동** — 검수 완료 문항 기존 DB 1-클릭 등록, 자동 분류 제안

## Phase Details

### Phase 21: Vercel 인프라 + PDF 뷰어 기반
**Goal**: Vercel 배포 환경이 작동하고, 앱 내에서 PDF를 렌더링할 수 있다
**Depends on**: Nothing (v4.0 첫 번째 Phase)
**Requirements**: VIEWER-01
**Success Criteria** (what must be TRUE):
  1. 앱이 Vercel에 배포되고 URL로 접근할 수 있다
  2. Vercel serverless function에서 Gemini API를 호출할 수 있다 (API 키 서버사이드 보호)
  3. PDF 파일을 앱에서 불러와 페이지 전환, 줌 인/아웃이 동작한다
  4. iOS Safari iPad 실기기에서 PDF 렌더링이 정상 동작한다 (iframe fallback 여부 결정)
  5. 대용량 PDF(50페이지 이상)를 열어도 탭이 크래시되지 않는다 (Canvas 가상화 동작)
**Plans**: TBD

Plans:
- [ ] 21-01: Vercel 배포 설정 (vercel.json, serverless API route 구조)
- [ ] 21-02: react-pdf + PDF.js 뷰어 컴포넌트 구축 (lazy 청크, vite 설정, CMap 복사)
- [ ] 21-03: Canvas 가상화 + iOS Safari 검증

### Phase 22: Gemini AI 파싱 파이프라인
**Goal**: 강사가 PDF를 업로드하면 Gemini Vision이 수학 문제를 LaTeX로 자동 추출한다
**Depends on**: Phase 21
**Requirements**: UPLOAD-01, UPLOAD-02, UPLOAD-03, UPLOAD-05, UPLOAD-06, UPLOAD-07
**Success Criteria** (what must be TRUE):
  1. 강사가 드래그앤드롭 또는 버튼 클릭으로 PDF를 업로드할 수 있다 (50MB 이하, PDF만)
  2. 파싱할 페이지 범위를 선택할 수 있다 (최대 50페이지/회)
  3. AI 파싱 진행 상태가 단계별로 표시된다 (PDF 분석 중 → 문제 추출 중 → 검수 준비 완료)
  4. 추출된 문제가 LaTeX 수식과 함께 문제 번호 순서대로 표시된다
  5. 파싱 실패 시 명확한 오류 메시지와 수동 입력 안내가 표시된다
**Plans**: TBD

Plans:
- [ ] 22-01: @google/genai SDK + Vercel serverless Gemini 프록시 구축
- [ ] 22-02: FileDropZone + PDFParseProgress 컴포넌트
- [ ] 22-03: 페이지 범위 선택 UI + 파싱 결과 상태 머신 (UploadFlowStep)
- [ ] 22-04: 파싱 오류 핸들링 + 수동 입력 fallback 안내

### Phase 23: 강사 검수 UI
**Goal**: 강사가 AI 추출 결과를 검토하고 수정할 수 있다
**Depends on**: Phase 22
**Requirements**: REVIEW-01, UPLOAD-04
**Success Criteria** (what must be TRUE):
  1. AI 추출된 문항별로 신뢰도가 시각화된다 (70% 미만 항목은 빨간색으로 강조)
  2. 강사가 각 문항의 LaTeX를 인라인으로 직접 편집할 수 있다
  3. KaTeX 미리보기가 편집과 동시에 실시간으로 렌더링된다
**Plans**: TBD

Plans:
- [ ] 23-01: PDFParseReviewer 컴포넌트 (신뢰도 배지, 인라인 LaTeX 편집, KaTeX 실시간 미리보기)

### Phase 24: PDF 내보내기
**Goal**: 선택한 문제를 시험지 또는 학습지 스타일 PDF로 내보낼 수 있다
**Depends on**: Phase 21 (독립적 — Phase 22/23과 병렬 가능)
**Requirements**: EXPORT-01, EXPORT-02
**Success Criteria** (what must be TRUE):
  1. 선택한 문제를 A4 시험지 스타일 PDF로 다운로드할 수 있다 (헤더, 문제 번호, 수식 포함)
  2. 해설이 포함된 학습지 스타일 PDF로 다운로드할 수 있다
  3. PDF에 한글과 수식(LaTeX)이 깨지지 않고 출력된다
**Plans**: TBD

Plans:
- [ ] 24-01: @react-pdf/renderer + Pretendard TTF 폰트 임베딩 + pdf-renderer 청크 설정
- [ ] 24-02: KaTeX → canvas → PNG 변환 유틸 (lib/pdf-utils.ts)
- [ ] 24-03: ExamPDFTemplate + StudySheetTemplate 템플릿 구현
- [ ] 24-04: /instructor/pdf-export 라우트 + 문제집/오답노트 "PDF로 내보내기" 버튼 연동

### Phase 25: PDF 뷰어 풀이 오버레이 통합
**Goal**: PDF 뷰어에서 정답 영역을 가리고 문제를 풀 수 있다
**Depends on**: Phase 21, Phase 22
**Requirements**: VIEWER-02, VIEWER-03, VIEWER-04
**Success Criteria** (what must be TRUE):
  1. PDF 위에 정답 영역을 가리는 오버레이가 탭으로 보이기/가리기 토글된다
  2. PDF 뷰어에서 문제를 바로 풀고 채점 결과를 확인할 수 있다
  3. 오답 발생 시 오답노트에 자동 등록된다
  4. PDF 문제와 앱 문제카드 간 양방향 네비게이션이 가능하다 (bbox 기반, 정확도 검증 후)
**Plans**: TBD

Plans:
- [ ] 25-01: PDFOverlayViewer 풀이 레이어 완성 (정답 가리기/보이기 토글, PDF.js 좌표 변환)
- [ ] 25-02: 기존 채점 엔진 연동 + 오답노트 자동 등록 (/student/pdf-viewer/:id 라우트)
- [ ] 25-03: bbox 기반 양방향 PDF-문제카드 네비게이션 (Phase 22 bbox 정확도 검증 후)

### Phase 26: DB 연동
**Goal**: 검수 완료된 문항을 기존 문제 DB에 등록할 수 있다
**Depends on**: Phase 23 (POC 파이프라인 검증 완료 후)
**Requirements**: DB-REG-01, DB-REG-02
**Success Criteria** (what must be TRUE):
  1. 강사가 검수 완료된 문항을 1-클릭으로 기존 문제 DB에 등록할 수 있다
  2. 등록 시 과목/단원/유형이 자동 분류 제안되고 강사가 확인/수정할 수 있다
  3. 등록 결과 요약이 표시된다 (성공 N건, 중복 M건)
**Plans**: TBD

Plans:
- [ ] 26-01: question.service.bulkCreate() 연동 + 등록 결과 요약 UI
- [ ] 26-02: 과목/단원/유형 자동 분류 제안 (Gemini 분류 + 강사 확인/수정 UI)

## Progress

**Execution Order:**
Phases 21 → 22 → 23 (파싱 파이프라인 순서)
Phase 24 병렬 진행 가능 (Phase 21 완료 후, Phase 22/23과 독립)
Phase 25 (Phase 21 + 22 완료 후)
Phase 26 (Phase 23 완료 + POC 검증 후)

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1-9. MVP | v1.0 | 38/38 | Complete | 2026-02-21 |
| 10-14. 디자인 리뉴얼 | v2.0 | 21/21 | Complete | 2026-02-21 |
| 15-20. 반전 모드 | v3.0 | 22/22 | Complete | 2026-02-24 |
| 21. Vercel 인프라 + PDF 뷰어 기반 | v4.0 | 0/3 | Not started | - |
| 22. Gemini AI 파싱 파이프라인 | v4.0 | 0/4 | Not started | - |
| 23. 강사 검수 UI | v4.0 | 0/1 | Not started | - |
| 24. PDF 내보내기 | v4.0 | 0/4 | Not started | - |
| 25. PDF 뷰어 풀이 오버레이 통합 | v4.0 | 0/3 | Not started | - |
| 26. DB 연동 | v4.0 | 0/2 | Not started | - |
