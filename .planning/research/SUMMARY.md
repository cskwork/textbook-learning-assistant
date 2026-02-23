# Research Summary — v4.0 PDF 2-Way 학습 시스템

**프로젝트:** 수학 기출문제 학습 도우미
**마일스톤:** v4.0 PDF 2-Way 학습 시스템
**합성일:** 2026-02-24
**합성 대상:** STACK.md, FEATURES.md, ARCHITECTURE.md, PITFALLS.md

> **참고:** v3.0 반전 모드 게이미피케이션 리서치 요약은 이전 버전 SUMMARY.md에 있음 (git 이력 참조).
> 이 문서는 v4.0 PDF 2-Way 관련 내용만 다룬다.

---

## Executive Summary

v4.0은 기존 수학 학습 앱(React 19 + Vite 7 + Tailwind v4 + Dexie)에 PDF 양방향 연동을 추가하는 마일스톤이다. 핵심 방향은 두 가지다. 첫째, 강사가 기출문제 PDF를 업로드하면 Gemini 2.5 Flash가 수식을 LaTeX로 자동 추출하고, 강사가 검수 후 1-클릭으로 문제 DB에 등록하는 "PDF → 앱" 파이프라인. 둘째, 앱의 문제를 시험지 또는 학습지 스타일 PDF로 내보내고, PDF 뷰어에서 풀이 오버레이(정답 가리기)를 제공하는 "앱 → PDF" 파이프라인. 기존 코드베이스(gemini.service, question.service, Dexie, KaTeX)를 최대한 재활용하며, 신규 라이브러리는 react-pdf(뷰어), @react-pdf/renderer(생성), @google/genai(AI)만 추가한다.

핵심 기술적 도전은 세 가지다. (1) Gemini Vision의 수식 환각(hallucination) — 강사 검수 UI가 필수이며, AI 결과를 검수 없이 DB에 직접 저장하는 것은 절대 피해야 한다. (2) PDF 뷰어의 메모리 관리 — 대용량 PDF 전체 렌더링은 태블릿 탭 크래시를 일으키므로 Canvas 가상화(뷰포트 앞뒤 3페이지만 유지)가 필수다. (3) PDF 내보내기의 KaTeX → PDF 변환 — @react-pdf/renderer가 HTML을 직접 해석하지 못하므로 KaTeX → PNG/SVG → Image 변환 파이프라인을 구축해야 한다.

경쟁사(콴다, Flexcil, Goodnotes)와 비교할 때 이 앱의 고유한 차별점은 수식 LaTeX 변환 + DB 자동 등록 + 기존 BKT 취약 분석 연동이다. 단순 PDF 뷰어나 퀴즈 생성이 아닌, 강사의 문제 DB 구축 파이프라인을 자동화하는 것이 v4.0의 실질적 가치다.

---

## Key Findings

### STACK.md — v4.0 신규 라이브러리 결정

**신규 추가 라이브러리:**

| 라이브러리 | 버전 | 역할 | 신뢰도 |
|-----------|------|------|--------|
| react-pdf | 10.4.0 | PDF 뷰어 (PDF.js 5.3.31 탑재, ESM-only) | HIGH |
| react-pdf-highlighter-plus | 1.1.3 | PDF 위 annotation 오버레이 (React 19 명시) | HIGH |
| @react-pdf/renderer | 4.3.2 | 시험지/학습지 PDF 생성 (React 19.2.x 지원) | HIGH |
| @google/genai | 1.x | Gemini API 공식 통합 SDK | HIGH |
| react-dropzone | 14.x | 파일 업로드 UI | HIGH |
| vite-plugin-static-copy | latest | pdfjs-dist CMap 에셋 복사 | HIGH |

**핵심 버전 결정:**
- `@google/generative-ai` (구 SDK)는 반드시 `@google/genai`로 교체 — 2025-11-30 공식 지원 종료
- Gemini 모델: `gemini-2.5-flash` 사용 — `gemini-2.0-flash`는 2026-03-31 지원 종료 예정
- react-pdf v10은 ESM-only이며 worker 파일 확장자가 `.mjs`로 변경됨 (v10 breaking change)
- @react-pdf/renderer + 한글: Variable 폰트 미지원 → 굵기별 개별 TTF 파일(Pretendard-Regular.ttf, Pretendard-Bold.ttf) 등록 필수
- react-pdf와 react-pdf-highlighter-plus는 내부 PDF.js 인스턴스가 충돌할 수 있으므로 용도별 페이지 분리 필요

**번들 전략 (기존 v3.0 패턴과 동일):**
```
pdf-viewer   chunk (pdfjs-dist)           → ~1.2MB min / gzip ~400KB
pdf-renderer chunk (@react-pdf/renderer)  → ~500KB min / gzip ~180KB
```
두 청크 모두 React.lazy + Suspense로 해당 라우트 진입 시에만 로드.

**vite.config.ts 추가 설정:**
```typescript
// manualChunks 확장 (기존 game-phaser 등 수정하지 말 것)
if (id.includes('node_modules/pdfjs-dist')) return 'pdf-viewer'
if (id.includes('node_modules/@react-pdf/renderer')) return 'pdf-renderer'

// vite-plugin-static-copy
viteStaticCopy({ targets: [{ src: 'node_modules/pdfjs-dist/cmaps', dest: 'cmaps' }] })
```

---

### FEATURES.md — v4.0 기능 우선순위

**Table Stakes (없으면 v4.0 자체가 없음):**
- PDF 파일 업로드 (drag-and-drop + 버튼, 50MB 한도 검증)
- AI 파싱 진행 상태 UI (단계별: "분석 중" → "추출 중" → "검수 준비 완료")
- 추출 결과 검수/수정 UI (인라인 LaTeX 편집, 카드별 승인/거절)
- 신뢰도 시각화 (빨간색 강조 — 검수 효율 최대화)
- 강사용 1-클릭 DB 등록 (검수 완료 항목 일괄 등록)
- PDF 뷰어 (기본 렌더링, 페이지 전환, 줌)
- 풀이 오버레이 (정답 가리기/보이기 토글)
- 파싱 실패/오류 명확한 안내 + 수동 입력 fallback

**Differentiators (v4.0 핵심 정체성):**
- Gemini Vision 수식 → LaTeX 자동 변환 (수학 앱에서 유일한 차별화)
- AI 추출 결과 신뢰도 시각화 (빨간 70% 미만 항목 자동 강조)
- 시험지 스타일 + 학습지 스타일 PDF 내보내기 (강사 출력 workflow 완결)
- 페이지 범위 선택 파싱 (Gemini API 비용 최적화, 최대 50페이지/회)
- PDF 뷰어 + 즉석 문제 풀기 (기존 채점 엔진 재사용)

**Anti-Features (의도적 제외):**
- 손글씨 필기 OCR — 수식 정확도 미보장, v5.0 이후 검토
- 서버사이드 PDF 렌더링 — POC 아키텍처 위반 (Puppeteer 불필요)
- PDF 내 자유 필기/Apple Pencil 입력 — 구현 복잡도 폭증, 오버레이로 충분
- 보안(비밀번호) PDF 지원 — 저작권/보안 우회 법적 리스크
- 무제한 페이지 파싱 — Gemini API 비용 제어 위해 최대 50페이지/회 제한
- PDF 편집 기능 — 완전히 다른 제품 영역

**기능 우선순위:**

| 기능 | 우선순위 | Phase |
|------|---------|-------|
| PDF 업로드 + AI 파싱 파이프라인 전체 | P1 | Phase 1-2 |
| PDF 뷰어 + 풀이 오버레이 | P1 | Phase 1-2 |
| 페이지 범위 선택 | P1 | Phase 2 |
| PDF 내보내기 (시험지 + 학습지) | P2 | Phase 3 |
| 즉석 문제 풀기 | P2 | Phase 4 |
| 양방향 PDF-문제카드 네비게이션 (bbox 기반) | P3 | Phase 5 (검증 후) |

---

### ARCHITECTURE.md — 핵심 아키텍처 패턴

**기존 아키텍처와의 관계:**
v4.0은 기존 코드베이스를 확장하는 방식. 신규 컴포넌트(`/components/pdf/`)와 라우트 3개, `gemini.service.ts`에 `parsePDFDocument()` 추가, `lib/db.ts`에 `version(11)` 추가가 전부다. 기존 코드는 `routes/_layout.tsx`에 메뉴 항목 추가, 문제집/오답노트에 "내보내기" 버튼 추가 정도만 수정한다.

**신규 라우트:**
- `/student/pdf-viewer/:id` — PDF 뷰어 + 풀이 오버레이
- `/instructor/pdf-upload` — PDF 업로드 → AI 파싱 → 검수 → DB 등록
- `/instructor/pdf-export` — 문제 선택 → PDF 내보내기 (강사 + 학생 공용)

**신규 컴포넌트 (`/components/pdf/`):**
- `PDFViewerLazy.tsx` — react-pdf lazy 래퍼 + pdfjs 워커 설정
- `FileDropZone.tsx` — 파일 드래그앤드롭 UI (PDF 유효성 검사 포함)
- `PDFParseReviewer.tsx` — AI 파싱 결과 검수 UI (수정/승인/거절)
- `PDFParseProgress.tsx` — Gemini 호출 진행 상태 UI
- `PDFOverlayViewer.tsx` — 뷰어 + 풀이 오버레이 합성 컴포넌트
- `templates/ExamPDFTemplate.tsx` — 시험지 스타일 (@react-pdf/renderer)
- `templates/StudySheetTemplate.tsx` — 학습지 스타일 (@react-pdf/renderer)

**데이터 흐름 3개:**

1. **PDF → 앱 (업로드 파이프라인):**
   ```
   FileDropZone → File 객체 (메모리 only, DB 저장 안 함)
   → API 키 사전 확인 게이트
   → gemini.service.parsePDFDocument() [20MB 기준 inline/Files API 분기]
   → PDFParseProgress UI
   → PDFParseReviewer (강사 검수/수정)
   → question.service.bulkCreate() → db.questions
   → pdf.service.markImported()
   ```

2. **PDF 뷰어 + 오버레이:**
   ```
   PDFOverlayViewer
   ├─ [하단 레이어] PDFViewerLazy (react-pdf + PDF.js canvas)
   └─ [상단 레이어] position:absolute div 오버레이
         풀이 단계 KaTeX 렌더링 + 정답/오답 인터랙션
   ```

3. **앱 → PDF (내보내기):**
   ```
   question.service.getByIds() [부모에서 미리 로드, Template에 props 전달]
   → KaTeX.renderToString() → PNG DataURL (html-to-image, scale: 2)
   → ExamPDFTemplate / StudySheetTemplate (@react-pdf/renderer)
   → PDFDownloadLink → 브라우저 다운로드
   ```

**핵심 결정사항 (HIGH confidence):**
- PDF 원본 Blob은 IndexedDB에 저장하지 않음 — Firefox/Chrome 대용량 blob 트랜잭션 블로킹 버그(Mozilla Bugzilla #837141)
- File 객체는 컴포넌트 state(메모리)에만 보관, 파싱 완료 후 메타데이터만 Dexie에 저장
- PDF.js Canvas 위에 `position: absolute` div 오버레이 (Annotation Layer API 수정 없음)
- KaTeX → PDF 변환: canvas → PNG 접근 B로 시작, 출력 품질 부족 시 SVG 변환 접근 A로 전환
- API 키 확인을 FileDropZone 진입 전에 수행 (기존 NewQuestionPage 패턴 동일)

**업로드 플로우 상태 머신:**
```typescript
type UploadFlowStep = 'idle' | 'uploading' | 'parsing' | 'reviewing' | 'importing' | 'done' | 'error'
```

**Dexie version(11) 스키마 (기존 version 1~10 절대 수정 금지):**
```typescript
pdfDocuments:       '++id, uploadedBy, parseStatus, uploadedAt'
pdfExtractedItems:  '++id, pdfDocumentId, reviewStatus, pageNumber'
```

---

### PITFALLS.md — v4.0 핵심 함정

**Critical Pitfalls (7개):**

| 함정 | 예방 전략 | 방지 Phase |
|------|-----------|-----------|
| P1: PDF.js 대용량 메모리 폭발 (탭 크래시) | 뷰포트 앞뒤 3페이지만 렌더링, 벗어난 Canvas `canvas.width=0` 즉시 해제, `renderTask.cancel()` 활용 | PDF 뷰어 POC 단계 |
| P2: iOS Safari PDF.js 렌더링 완전 실패 | iPad 실기기 테스트 필수 (에뮬레이터 재현 불가), workerSrc 명시 설정, 실패 시 `<iframe>` fallback | 뷰어 Phase 첫 POC |
| P3: Gemini Vision 수식 환각(Hallucination) | 검수 UI 필수(AI 결과 직접 DB 저장 금지), structured output 강제, KaTeX 파싱 오류율 5% 초과 시 알림 | AI 파싱 Phase |
| P4: IndexedDB Base64 메모리 폭발 | Blob 타입 직접 저장 필수 (`Base64` 절대 금지) | 업로드 Phase 첫 구현 |
| P5: Gemini Files API 48시간 만료 | 원본 PDF 로컬 저장 후 파싱 직전 업로드, `files.get()` 상태 확인 후 만료 시 재업로드 | AI 파싱 Phase |
| P6: 한글 폰트 누락 → 빈 사각형 출력 | `Font.register()`로 Pretendard TTF 임베딩, 첫 "Hello World" PDF에서 즉시 검증 | 내보내기 Phase 첫 구현 |
| P7: LaTeX 수식 PDF 내보내기 렌더링 실패 | KaTeX → canvas → PNG → `<Image>`, html2canvas `useCORS: true` + KaTeX 폰트 self-hosting | 내보내기 Phase |

**Moderate Pitfalls (5개):**
- P8: 한국어 PDF 인코딩 오류 — NFC 정규화 + Vision AI OCR 경로 우선
- P9: iPad 터치/펜 이벤트 충돌 — `PointerEvent.pointerType`으로 'pen'/'touch' 구분
- P10: PDF 뷰어 + v3.0 WebGL 컨텍스트 경쟁 — PDF 뷰어 진입 시 Phaser 씬 `scene.pause()`, 뷰어 종료 시 `scene.resume()`
- P11: iOS IndexedDB 50MB 한도 — `StorageManager.estimate()` 사전 확인 + LRU 정책 + `QuotaExceededError` 핸들러
- P12: 그래프/도형 이미지 인식 오류 — 파싱 스키마에 `image_regions: [{page, x, y, width, height}]` 포함, 강사 검수 UI에서 도형 미리보기

**절대 하지 말 것 (Technical Debt Never):**
- PDF.js 페이지 가상화 없이 전체 렌더링 — 탭 크래시 확실
- PDF를 Base64로 IndexedDB 저장 — 메모리 10배 폭발
- AI 파싱 결과 검수 없이 DB 직접 저장 — 데이터 오염
- 한글 폰트 임베딩 없이 PDF 내보내기 테스트 — 한국어 전체 누락
- iOS Safari 테스트를 배포 직전에만 수행 — 전체 뷰어 재구현 위험

---

## Implications for Roadmap

### 권장 Phase 구조

v4.0은 5개 Phase로 구성한다. Phase 1-2는 병렬 진행 가능(뷰어와 AI 파싱 파이프라인은 독립적). Phase 3도 Phase 2와 병렬 가능(기존 question.service만 의존). Phase 4는 1+2 완료 후, Phase 5는 검증 후 결정.

```
Phase 1 (뷰어 인프라)  ─────────────────────────────────> Phase 4 (오버레이 통합) ─> Phase 5 (즉석 풀기)
Phase 2 (AI 파싱)     ──────────────────────────────────/
Phase 3 (내보내기)    ← 2와 병렬 가능, 기존 서비스만 의존
```

---

**Phase 1: PDF 뷰어 기반 인프라**

**근거:** 다른 모든 Phase의 기반. 뷰어 없이는 오버레이도, AI 파싱 결과 미리보기도 불가능. iOS Safari 검증이 가장 시급하며 여기서 블로킹 이슈가 있으면 전체 일정에 영향을 준다.

**내용:**
- react-pdf + pdfjs-dist lazy 청크 설정 (`pdf-viewer` 청크)
- `PDFViewerLazy` 컴포넌트 (워커 설정, `.mjs` 확장자 주의)
- vite-plugin-static-copy 설정 (CMap 파일 복사)
- `PDFOverlayViewer` 기본 구조 (뷰어만, 오버레이 없이)
- iOS Safari iPad 실기기 테스트 (P2 함정 방지 — 에뮬레이터 불가)
- Canvas 가상화 구현 (P1 함정 방지 — 뷰포트 앞뒤 3페이지)

**회피 함정:** P1(메모리 폭발), P2(iOS Safari 실패)

**리서치 플래그:** 표준적인 react-pdf Vite 패턴, 별도 리서치 불필요. 단 iOS 실기기 검증 결과에 따라 fallback 구현 필요 여부 결정.

---

**Phase 2: Gemini PDF 파싱 + 강사 업로드 플로우**

**근거:** v4.0의 핵심 파이프라인. Gemini Vision 수식 추출이 이 마일스톤 전체의 핵심 가치이며, 강사 검수 UI는 AI 환각 대응의 필수 안전망이다. Phase 1과 병렬 진행 가능.

**내용:**
- Dexie version(11) — pdfDocuments + pdfExtractedItems
- `gemini.service.ts` — `parsePDFDocument()` 추가 (20MB 기준 inline/Files API 분기)
- `pdf.service.ts` 신규 생성 (메타데이터 CRUD)
- `FileDropZone` + `PDFParseProgress` 컴포넌트
- `PDFParseReviewer` (인라인 LaTeX 편집 + 신뢰도 시각화 + 승인/거절)
- 강사용 1-클릭 DB 등록 + 등록 결과 요약
- `/instructor/pdf-upload` 라우트
- API 키 사전 확인 게이트 (기존 NewQuestionPage 패턴)
- 페이지 범위 선택 UI (최대 50페이지/회)
- 수동 입력 fallback 안내 (기존 LaTeX 에디터 링크)

**회피 함정:** P3(Gemini 환각 — 검수 UI 필수), P4(Blob 저장), P5(Files API 만료 관리)

**리서치 플래그:** Gemini Files API CORS 허용 여부를 Phase 구현 초반에 브라우저에서 직접 검증해야 한다. CORS 차단 시 20MB+ PDF는 Express 5 프록시 라우트로 우회 필요.

---

**Phase 3: PDF 내보내기 (시험지 + 학습지)**

**근거:** Phase 1, 2와 독립적. 기존 question.service만 의존하므로 Phase 2와 병렬 가능. KaTeX → PDF 변환 파이프라인 복잡도가 높아 별도 Phase로 분리.

**내용:**
- @react-pdf/renderer 설치 및 `pdf-renderer` lazy 청크 설정
- Pretendard TTF 폰트 임베딩 (`Font.register()`) — 첫 구현에서 검증
- `lib/pdf-utils.ts` — KaTeX → canvas → PNG 변환 유틸 (html-to-image, scale: 2)
- `ExamPDFTemplate` (시험지: A4 세로, 헤더, 문제 번호, 수식 이미지)
- `StudySheetTemplate` (학습지: 해설 포함)
- `/instructor/pdf-export` 라우트
- 문제집/오답노트 페이지에 "PDF로 내보내기" 버튼 추가
- 한글 폰트 + 수식 렌더링 육안 검수 (실제 수능 문제로 테스트)

**회피 함정:** P6(한글 폰트 누락), P7(LaTeX→PDF 수식 실패)

**리서치 플래그:** canvas PNG vs SVG 접근 중 최적 방법은 POC로 결정. 인쇄 해상도 부족 시 SVG 변환 접근으로 전환 준비.

---

**Phase 4: PDF 뷰어 풀이 오버레이 통합**

**근거:** Phase 1 + 2 완료 후 가능 (뷰어 기반 + 파싱된 문제 메타데이터 필요). "iPad 시험지 느낌"의 핵심 사용자 가치.

**내용:**
- `PDFOverlayViewer` 풀이 레이어 완성 (정답 가리기/보이기 토글)
- PDF.js 좌표 → DOM 좌표 변환 공식: `y_dom = page_height - (y_pdf + height)`
- `/student/pdf-viewer/:id` 라우트
- 기존 quiz.service 재사용 (채점 엔진 연동)
- 정답 확인 후 오답노트 자동 등록 (기존 로직 재사용)
- iPad 터치 vs 펜 이벤트 구분 처리 (P9 함정)

**회피 함정:** P9(iPad 터치/펜 충돌), P10(WebGL 컨텍스트 경쟁 — Phaser 씬 pause)

**리서치 플래그:** 별도 Phase 리서치 불필요. PDF.js canvas 오버레이 패턴은 표준적.

---

**Phase 5: 즉석 문제 풀기 + 고급 기능 (검증 후 결정)**

**근거:** Phase 4 완료 후. Gemini bbox 좌표 정확도가 실제 수능 PDF에서 검증된 후에야 양방향 네비게이션 구현 여부를 결정할 수 있다.

**내용 (검증 후):**
- PDF 뷰어 내 즉석 문제 풀기 (채점 엔진 연동 + 오답노트 자동 등록)
- 양방향 PDF-문제카드 네비게이션 (bbox 기반, Gemini 정확도 검증 필수)
- 문제 번호 자동 정렬 (2단 레이아웃 감지)

**회피 함정:** bbox 좌표 오류 시 fallback (문제 번호 기반 텍스트 검색)

**리서치 플래그:** Gemini bbox 좌표 추출 정확도가 실제 수능 PDF에서 얼마나 신뢰할 수 있는지 Phase 2 완료 후 데이터로 평가 필요. 필요 시 `/gsd:research-phase` 적용.

---

### 종속성 요약

```
Phase 1 (뷰어 인프라)  ─────────────────────────────────> Phase 4 (오버레이 통합)
Phase 2 (AI 파싱)     ──────────────────────────────────/      └────────────> Phase 5
Phase 3 (내보내기)    ← 독립적 (기존 question.service만 의존)
```

Phase 1-2-3은 모두 병렬 진행 가능. Phase 4는 1+2 완료 후. Phase 5는 4 완료 + bbox 정확도 검증 후.

---

## Confidence Assessment

| 영역 | 신뢰도 | 근거 |
|------|--------|------|
| PDF 뷰어 스택 (react-pdf 10) | HIGH | GitHub 릴리즈 직접 확인, React 19 호환 검증, ESM-only 변경 사항 확인 |
| Gemini AI SDK (@google/genai) | HIGH | Google 공식 문서에서 GA 확인, 구 SDK 지원 종료 공식 발표 |
| PDF 생성 (@react-pdf/renderer) | HIGH | React 19.2.x 지원 PR #3224 공식 확인, 한글 폰트 등록 방법 확인 |
| KaTeX → PDF 변환 파이프라인 | MEDIUM | 두 가지 접근(PNG/SVG) 중 최적 방법은 POC로 결정 필요 |
| iOS Safari PDF.js 호환성 | MEDIUM | WebKit 버그 실제 보고 있음, 최신 PDF.js로 해결 여부 POC 필요 |
| Gemini Files API CORS 허용 | MEDIUM-LOW | 브라우저 직접 호출 시 CORS 허용 여부 미검증 (Phase 2 POC 필수) |
| Gemini bbox 좌표 정확도 | MEDIUM | 실제 수능 PDF에서 좌표 추출 품질 실측 필요 |
| Gemini 수식 LaTeX 변환 정확도 | MEDIUM | 수능 수식 밀도에서 환각 빈도 실측 필요 |

**전체 신뢰도: MEDIUM-HIGH**

리서치 품질은 높으나, Gemini Files API CORS, iOS PDF.js 동작, bbox 정확도는 실제 환경 검증이 필요하다. 모두 Phase 1-2 POC 단계에서 즉시 확인 가능한 수준이며, 대안(fallback) 경로가 모두 설계되어 있어 블로킹 위험은 낮다.

---

## Gaps to Address

1. **Gemini Files API CORS 브라우저 호환성** — Phase 2 구현 시 첫 번째 검증 과제. 차단 시 20MB+ PDF는 Express 5 프록시 라우트로 우회.

2. **KaTeX → PDF 수식 품질** — canvas→PNG 방식의 인쇄 해상도 검증 필요. `scale: 2.0` 이상으로 고해상도 캡처 + 육안 검수로 최종 결정.

3. **실제 수능 PDF에서 Gemini 환각 빈도** — KaTeX 파싱 오류율이 5%를 초과하는지 측정. 초과 시 페이지 단위 대신 문제 단위(크롭 이미지) 파싱으로 전환 검토.

4. **iOS Safari + iPad 실기기 테스트** — Phase 1 완료 즉시 iPad에서 실제 수능 PDF 렌더링 검증. 에뮬레이터로는 재현 불가.

5. **저작권 처리 방침** — KICE 수능 기출문제 저작권(PITFALLS.md Pitfall 4). v4.0은 강사가 직접 소유한 자료만 업로드한다는 이용 조건을 명시 필요. 개발 착수 전 정책 확정 필요.

6. **Gemini API 비용 모니터링** — 100페이지 PDF ≈ 50K 토큰 ≈ $0.005 (gemini-2.5-flash 기준). 무제한 허용 시 비용 폭증 위험. 사용량 로깅 + 페이지 제한(최대 50페이지/회) 필수.

---

## Research Flags

**별도 Phase 리서치 필요:**
- **Phase 5 (bbox 기반 양방향 네비게이션)** — Gemini 좌표 추출 실제 정확도에 따라 구현 방향이 달라짐. Phase 2 완료 후 실제 파싱 결과 데이터를 확보한 후 `/gsd:research-phase`로 검증.

**표준 패턴, 추가 리서치 불필요:**
- Phase 1 (react-pdf Vite 설정): 공식 문서 + 예제 충분
- Phase 2 (Gemini structured output): 공식 문서 확인됨
- Phase 3 (@react-pdf/renderer 레이아웃): 예제 충분
- Phase 4 (CSS overlay): 표준 패턴

---

## Sources (통합)

**PRIMARY (HIGH confidence):**
- react-pdf GitHub Releases — v10.4.0 (2026-02-21), PDF.js 5.3.31, ESM-only (HIGH)
- react-pdf-highlighter-plus Demo — v1.1.3, React 19 명시 (HIGH)
- @react-pdf/renderer npm — v4.3.2, React 19.2.x 지원 PR #3224 (HIGH)
- Google AI for Developers — @google/genai GA 2025-05, 구 SDK 지원 종료 2025-11-30 (HIGH)
- Google AI Document Processing 공식 문서 — PDF 한도 50MB/1000페이지, Files API 48h 캐싱 (HIGH)
- Gemini Structured Output 공식 문서 — JSON Schema, responseMimeType (HIGH)
- Mozilla Bugzilla #837141 — IndexedDB 대용량 blob 성능 버그 (HIGH)

**SECONDARY (MEDIUM confidence):**
- Gemini API 파일 크기 업데이트 (2026-01-12) — inline 100MB (MEDIUM)
- react-pdf-highlighter-extended GitHub — 업데이트 비교 (-plus 10일 전 vs -extended 9개월 전) (MEDIUM)
- npm-compare: @react-pdf/renderer vs jsPDF vs pdfmake (MEDIUM)
- html2canvas + KaTeX CORS 이슈 커뮤니티 보고 (MEDIUM)
- PDF.js 메모리 최적화 실측 보고 (MEDIUM)
- iOS Safari WebKit PDF.js 실패 사례 (MEDIUM)
- Gemini Vision 수식 환각 패턴 실측 보고 (MEDIUM)

---

*Research synthesis for: v4.0 PDF 2-Way 학습 시스템 — 수학 기출문제 학습 도우미*
*Synthesized: 2026-02-24*
*Ready for roadmap: yes*
