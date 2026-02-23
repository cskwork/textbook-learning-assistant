# Architecture Research

**Domain:** PDF 2-Way 학습 시스템 — 기존 React 19 SPA 통합 (v4.0)
**Researched:** 2026-02-24
**Confidence:** HIGH (기존 코드베이스 직접 분석 + 공식 문서 검증)

---

## 현재 아키텍처 개요 (v3.0 기준)

```
┌──────────────────────────────────────────────────────────────────┐
│                     React 19 SPA (Vite 7)                        │
├──────────────────────────────────────────────────────────────────┤
│  Context Layer                                                   │
│  ┌────────────┐  ┌────────────────┐  ┌─────────────────────┐    │
│  │ AuthContext│  │ SettingsContext │  │  FunModeContext     │    │
│  └────────────┘  └────────────────┘  └─────────────────────┘    │
├──────────────────────────────────────────────────────────────────┤
│  Route Layer (React Router v7)                                   │
│  /student/*          /instructor/*          /public/*            │
├──────────────────────────────────────────────────────────────────┤
│  Component Layer                                                 │
│  layout/  quiz/  game/  gamification/  analytics/  workbook/     │
├──────────────────────────────────────────────────────────────────┤
│  Service Layer (POC: all client-side)                            │
│  gemini.service  question.service  quiz.service  workbook.service│
├──────────────────────────────────────────────────────────────────┤
│  Storage Layer                                                   │
│  ┌──────────────────────┐  ┌────────────────────────────────┐   │
│  │  Dexie v4 IndexedDB  │  │  localStorage (auth + funMode) │   │
│  │  (10 schema versions)│  └────────────────────────────────┘   │
│  └──────────────────────┘                                        │
└──────────────────────────────────────────────────────────────────┘
```

### 핵심 아키텍처 패턴 (기존 — 확장 대상)

| 패턴 | 구현 위치 | 설명 |
|------|-----------|------|
| Lazy loading | `React.lazy + Suspense` | Phaser / Three.js / Howler.js는 동적 임포트 |
| Manual chunks | `vite.config.ts` rollupOptions | game-phaser / game-three / game-howler / game-confetti |
| FunMode gate | `FunModeContext + data-fun-mode attr` | CSS 변수 오버라이드로 즉시 테마 전환 |
| DB versioning | `Dexie v1~v10` | 신규 테이블은 새 version() 추가, 기존 수정 금지 |
| Service layer | `services/*.service.ts` | 모든 Dexie 쿼리는 서비스 레이어에서 처리 |
| Gemini 호출 | `services/gemini.service.ts` | 사용자 개인 API 키, 직접 클라이언트 호출 |

---

## PDF 2-Way 시스템 통합 아키텍처 (v4.0 신규)

### 신규 시스템 전체 개요

```
┌────────────────────────────────────────────────────────────────────┐
│                 PDF 2-Way 학습 시스템 (v4.0)                        │
├─────────────────────────────┬──────────────────────────────────────┤
│  Upload Path (PDF → App)    │  Export Path (App → PDF)             │
│                             │                                      │
│  PDFUploadPage              │  PDFExportPage                       │
│  ├─ FileDropZone            │  ├─ ExamStyleTemplate                │
│  ├─ PDFParseProgress        │  ├─ StudySheetTemplate               │
│  └─ PDFParseReviewer        │  └─ (lazy) @react-pdf/renderer       │
│         ↓                   │                                      │
│  gemini.service (확장)      │  PDFViewerPage                       │
│  └─ parsePDFDocument()      │  └─ PDFOverlayViewer                 │
│         ↓                   │      ├─ (lazy) react-pdf 뷰어         │
│  pdf.service (신규)         │      └─ 풀이 오버레이 div 레이어       │
│  ├─ savePDFDocument()       │                                      │
│  └─ saveParsedItems()       │                                      │
│         ↓                   │                                      │
│  question.service (기존)    │                                      │
│  └─ bulkAdd() — 검수 후     │                                      │
├─────────────────────────────┴──────────────────────────────────────┤
│                  Dexie v11 (신규 테이블)                            │
│            pdfDocuments        pdfExtractedItems                   │
└────────────────────────────────────────────────────────────────────┘
```

---

## 컴포넌트 책임 경계

### 신규 컴포넌트 (NEW)

| 컴포넌트 | 위치 | 책임 | 기존 연동 |
|----------|------|------|-----------|
| `PDFViewerLazy` | `components/pdf/PDFViewerLazy.tsx` | react-pdf + pdfjs-dist 렌더링, lazy 래퍼 + 워커 설정 | `GameLoadingSpinner` 재사용 (Suspense fallback) |
| `FileDropZone` | `components/pdf/FileDropZone.tsx` | 파일 드래그앤드롭 + 클릭 선택, PDF 유효성 검사(50MB 한도) | shadcn/ui + Framer Motion |
| `PDFParseReviewer` | `components/pdf/PDFParseReviewer.tsx` | AI 추출 결과 표시 + 인라인 수정 + 승인/거절 | 기존 QuestionCard 레이아웃 패턴 재사용 |
| `PDFParseProgress` | `components/pdf/PDFParseProgress.tsx` | Gemini API 호출 중 진행 상태 UI | shadcn/ui Progress |
| `PDFOverlayViewer` | `components/pdf/PDFOverlayViewer.tsx` | PDF 뷰어 + 풀이 오버레이 합성 컴포넌트 | `PDFViewerLazy` + 기존 QuizAttempt 로직 |
| `ExamPDFTemplate` | `components/pdf/templates/ExamPDFTemplate.tsx` | 시험지 스타일 PDF 생성 컴포넌트 | `@react-pdf/renderer` |
| `StudySheetTemplate` | `components/pdf/templates/StudySheetTemplate.tsx` | 학습지 스타일 PDF 생성 컴포넌트 | `@react-pdf/renderer` |

### 신규 라우트 (NEW)

| 라우트 | 대상 사용자 | 역할 |
|--------|------------|------|
| `/student/pdf-viewer/:id` | 학생 | PDF 뷰어 + 풀이 오버레이 |
| `/instructor/pdf-upload` | 강사 | PDF 업로드 → AI 파싱 → 검수 → DB 등록 |
| `/instructor/pdf-export` | 강사 + 학생 공용 | 선택한 문제 → PDF 내보내기 |

### 수정 대상 기존 파일 (MODIFY)

| 파일 | 변경 내용 |
|------|-----------|
| `routes/_layout.tsx` | 강사 navItems에 PDF 업로드 메뉴 항목 추가 |
| `routes/instructor/problems/new.tsx` | PDF 파싱 결과를 문제 등록 폼에 자동 채우기 통합 (선택적) |
| `routes/student/workbooks/index.tsx` | "PDF로 내보내기" 버튼 추가 |
| `routes/student/wrong-notes/index.tsx` | "PDF로 내보내기" 버튼 추가 |
| `vite.config.ts` | `pdf-viewer` / `pdf-renderer` manual chunks 추가 |
| `lib/db.ts` | `version(11)` — pdfDocuments + pdfExtractedItems 테이블 추가 |
| `services/gemini.service.ts` | `parsePDFDocument()` 함수 추가 |
| `main.tsx` | 신규 라우트 등록 |

---

## 데이터 흐름

### 흐름 1: PDF 업로드 → AI 파싱 → 검수 → DB 저장

```
강사 (사용자)
    ↓ PDF 파일 선택 (드래그앤드롭 또는 클릭)
FileDropZone
    ↓ File 객체 — 컴포넌트 state에만 보관 (DB 저장 안 함)
    ↓ 파일 크기 검사 (> 50MB 거부)
[API 키 사전 확인] — UserSetting.geminiApiKey 없으면 설정 안내 모달
    ↓
gemini.service.parsePDFDocument(apiKey, file)
    ↓ 20MB 미만: ArrayBuffer → base64 → inline 요청
    ↓ 20MB 이상: Files API 업로드 → fileUri 참조 요청
    ↓ Gemini Flash 2.5 호출 (responseSchema: ParsedPDFQuestion 배열)
PDFParseProgress (진행 UI 표시)
    ↓
AI 응답 (구조화된 JSON — ParsedPDFQuestion[])
    ↓
pdf.service.savePDFDocument() — 메타데이터만 Dexie 저장
pdf.service.saveExtractedItems() — ParsedPDFQuestion[] Dexie 저장
    ↓
PDFParseReviewer — 강사 검수/수정/승인/거절
    ↓ 승인된 항목만
question.service.bulkCreate(approvedItems)
    ↓
db.questions.bulkAdd() — 기존 문제 DB에 편입
pdf.service.markImported(pdfDocumentId)
```

**핵심 결정 (HIGH confidence):**
Gemini에 PDF를 inline base64로 전달한다. 20MB 기준으로 inline / Files API를 분기한다. 공식 문서 기준 PDF 처리 한도는 50MB / 1,000페이지다. 클라이언트 직접 호출을 유지한다 (POC 아키텍처 일관성 + 기존 gemini.service 패턴 동일).

### 흐름 2: PDF 뷰어 + 풀이 오버레이

```
PDFOverlayViewer (props: File | pdfUrl, questionId)
    ├─ [하단 레이어] PDFViewerLazy (react-pdf + pdfjs-dist)
    │      └─ 페이지 canvas 렌더링
    └─ [상단 레이어] position:absolute div 오버레이
           ├─ 풀이 스텝 표시 (KaTeX 렌더링)
           ├─ 문제 위치 마킹 (사용자 정의 좌표)
           └─ 정답/오답 인터랙션 (기존 quiz.service 재사용)
```

**핵심 결정 (HIGH confidence):**
pdfjs-dist canvas layer 위에 `position: absolute` CSS 오버레이 div를 추가한다. pdf.js의 Annotation Layer API를 직접 수정하지 않는다 — 복잡도 대비 이점 없음. 오버레이는 순수 React/CSS로 구현한다.

### 흐름 3: 앱 → PDF 내보내기

```
WorkbooksPage 또는 WrongNotesPage
    ↓ "PDF로 내보내기" 버튼 클릭 (선택한 questionIds 전달)
PDFExportPage (query params: questionIds[], style: exam|study)
    ↓ question.service.getByIds(questionIds) — Dexie 쿼리
    ↓ 각 문제의 LaTeX 수식 처리
    ↓ KaTeX.renderToString(latex) → HTML 문자열
    ↓ html-to-image 또는 canvas 렌더링 → PNG DataURL
    ↓ (또는 KaTeX SVG 출력 → @react-pdf/renderer <Svg>)
ExamPDFTemplate 또는 StudySheetTemplate
    ↓ @react-pdf/renderer PDFDownloadLink 또는 BlobProvider
브라우저 PDF 다운로드
```

**핵심 결정 (MEDIUM confidence):**
@react-pdf/renderer를 사용한다. jsPDF는 복잡한 레이아웃 처리가 불편하고, pdfmake는 JSON 기반으로 React 패러다임과 맞지 않는다. KaTeX 수식 처리는 두 가지 접근 중 Phase 구현 시 POC 테스트가 필요하다: (A) KaTeX → SVG → `<Svg>` 컴포넌트 변환, (B) KaTeX → canvas → PNG → `<Image>` 임베드. B가 구현 단순하나 래스터화로 해상도 저하 가능성 있음.

---

## 스토리지 설계 (Dexie version 11)

### 신규 인터페이스

```typescript
// lib/db.ts 에 추가할 신규 인터페이스

// 업로드된 PDF 원본 메타데이터 (blob 자체는 저장하지 않음)
export interface PDFDocument {
  id?: number
  uploadedBy: string          // user email
  originalFilename: string
  fileSizeBytes: number
  pageCount: number
  parseStatus: 'pending' | 'parsed' | 'reviewed' | 'imported'
  uploadedAt: number          // Date.now()
  parsedAt?: number
  importedAt?: number
}

// AI가 파싱한 개별 문제 후보 (검수 전 임시 저장)
export interface PDFExtractedItem {
  id?: number
  pdfDocumentId: number       // PDFDocument.id
  pageNumber: number
  rawText: string             // AI가 추출한 원문 텍스트
  parsedQuestion?: Partial<Question>  // AI 파싱 결과
  reviewStatus: 'pending' | 'approved' | 'rejected' | 'modified'
  importedQuestionId?: number // 승인 후 생성된 Question.id
  createdAt: number
}
```

### version(11) 추가

```typescript
// lib/db.ts — 기존 version(10) 이후 추가
// ⚠️ 기존 version(1)~(10) 절대 수정하지 말 것
db.version(11).stores({
  pdfDocuments: '++id, uploadedBy, parseStatus, uploadedAt',
  pdfExtractedItems: '++id, pdfDocumentId, reviewStatus, pageNumber',
})
```

**핵심 결정 (HIGH confidence):**
PDF 원본 blob은 IndexedDB에 저장하지 않는다. 50MB PDF를 IndexedDB에 blob으로 저장하면 Firefox/Chrome 모두 트랜잭션 블로킹 성능 문제가 발생한다 (Mozilla Bugzilla #837141 확인). File 객체는 파싱 세션 중 메모리(React state)에만 보관하고, 처리 완료 후 GC에 맡긴다. 뷰어 재접근 시 사용자가 파일을 다시 선택한다.

---

## 번들 전략 (Vite 청크 추가)

기존 `vite.config.ts`에 신규 청크 추가:

```typescript
// vite.config.ts — manualChunks 확장
manualChunks(id: string) {
  // 기존 v3.0 청크 (수정하지 말 것)
  if (id.includes('node_modules/phaser')) return 'game-phaser'
  if (id.includes('node_modules/three')) return 'game-three'
  if (id.includes('node_modules/howler')) return 'game-howler'
  if (id.includes('node_modules/canvas-confetti')) return 'game-confetti'
  // v4.0 신규 청크
  if (id.includes('node_modules/pdfjs-dist')) return 'pdf-viewer'
  if (id.includes('node_modules/@react-pdf/renderer')) return 'pdf-renderer'
}
```

**예상 청크 크기:**
- `pdf-viewer` (pdfjs-dist): ~1.2MB / gzip 후 약 400KB
- `pdf-renderer` (@react-pdf/renderer): ~500KB / gzip 후 약 180KB

두 청크 모두 React.lazy + Suspense로 해당 라우트 진입 시에만 로드된다.

### pdfjs-dist 워커 설정 (Vite 필수 사항)

```typescript
// PDFViewerLazy.tsx 내부 (lazy로 로드되는 컴포넌트 안에서 설정)
import { pdfjs } from 'react-pdf'

// ⚠️ 이 설정이 없으면 "Missing PDF.js worker" 에러 발생
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()
```

vite-plugin-static-copy로 pdfjs-dist 리소스 복사 필요:

```typescript
// vite.config.ts 추가
import { viteStaticCopy } from 'vite-plugin-static-copy'

plugins: [
  // ... 기존 플러그인들
  viteStaticCopy({
    targets: [
      {
        src: 'node_modules/pdfjs-dist/cmaps',
        dest: 'cmaps',
      },
    ],
  }),
]
```

---

## Gemini API 통합 (gemini.service.ts 확장)

### PDF 파싱용 스키마 및 함수

```typescript
// services/gemini.service.ts — 신규 추가 (기존 generateMathQuestion 유지)

export interface ParsedPDFQuestion {
  pageNumber: number
  content: string                         // LaTeX 포함 문제 본문
  answer?: string
  choices?: string[]
  questionType: 'multiple' | 'short' | 'unknown'
  difficulty?: 1 | 2 | 3 | 4 | 5
  subject?: string
  unit?: string
  confidence: 'high' | 'medium' | 'low'  // AI 자체 확신도
}

export interface PDFParseResult {
  questions: ParsedPDFQuestion[]
  totalPagesProcessed: number
  warnings: string[]
}

const PDF_PARSE_SCHEMA = {
  type: 'object',
  properties: {
    questions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          pageNumber: { type: 'integer' },
          content: { type: 'string' },
          answer: { type: 'string' },
          choices: { type: 'array', items: { type: 'string' } },
          questionType: { type: 'string', enum: ['multiple', 'short', 'unknown'] },
          difficulty: { type: 'integer', minimum: 1, maximum: 5 },
          confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
        },
        required: ['pageNumber', 'content', 'questionType', 'confidence'],
      },
    },
    totalPagesProcessed: { type: 'integer' },
    warnings: { type: 'array', items: { type: 'string' } },
  },
  required: ['questions', 'totalPagesProcessed', 'warnings'],
}

const INLINE_THRESHOLD = 20 * 1024 * 1024  // 20MB 기준 분기

export async function parsePDFDocument(
  apiKey: string,
  pdfFile: File,
): Promise<PDFParseResult> {
  if (!apiKey.trim()) {
    throw new Error('Gemini API 키가 설정되지 않았습니다')
  }

  const ai = new GoogleGenAI({ apiKey })

  // 20MB 미만: inline base64
  if (pdfFile.size <= INLINE_THRESHOLD) {
    const arrayBuffer = await pdfFile.arrayBuffer()
    const bytes = new Uint8Array(arrayBuffer)
    const base64 = btoa(bytes.reduce((s, b) => s + String.fromCharCode(b), ''))

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{
        role: 'user',
        parts: [
          { inlineData: { mimeType: 'application/pdf', data: base64 } },
          { text: '이 PDF에서 수학 문제를 모두 추출하고 구조화된 JSON으로 반환하세요.' },
        ],
      }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: PDF_PARSE_SCHEMA,
      },
    })

    return JSON.parse(response.text!) as PDFParseResult
  }

  // 20MB 이상: Files API 사용
  // ⚠️ MEDIUM confidence: Files API 클라이언트 직접 호출은
  // CORS 제약이 있을 수 있음 — Phase 구현 시 브라우저에서 검증 필요
  throw new Error('20MB 이상 PDF는 현재 지원하지 않습니다. 파일을 분할하여 업로드하세요.')
}
```

**파일 크기 제한 (HIGH confidence — 공식 문서 확인):**
- Gemini PDF 처리 한도: 50MB / 1,000페이지
- inline base64 안전 기준: 20MB (브라우저 메모리 고려. 실제 API 한도는 100MB이나 클라이언트 측 처리 부담으로 보수적 설정)
- Files API CORS 허용 여부: Phase 구현 시 브라우저에서 직접 테스트 필요 (LOW confidence)

---

## 추천 디렉토리 구조

```
apps/web/src/
├── components/
│   └── pdf/                            # v4.0 신규 디렉토리
│       ├── FileDropZone.tsx             # 파일 업로드 드래그앤드롭 UI
│       ├── PDFViewerLazy.tsx            # react-pdf lazy 래퍼 + pdfjs 워커 설정
│       ├── PDFOverlayViewer.tsx         # 뷰어 + 풀이 오버레이 합성
│       ├── PDFParseReviewer.tsx         # AI 파싱 결과 검수 UI (수정/승인/거절)
│       ├── PDFParseProgress.tsx         # Gemini 호출 진행 상태 UI
│       └── templates/
│           ├── ExamPDFTemplate.tsx      # 시험지 스타일 (@react-pdf/renderer)
│           └── StudySheetTemplate.tsx   # 학습지 스타일 (@react-pdf/renderer)
│
├── routes/
│   ├── student/
│   │   └── pdf-viewer/
│   │       └── index.tsx                # /student/pdf-viewer/:id
│   └── instructor/
│       ├── pdf-upload/
│       │   └── index.tsx                # /instructor/pdf-upload
│       └── pdf-export/
│           └── index.tsx                # /instructor/pdf-export (강사+학생 공용)
│
├── services/
│   ├── gemini.service.ts                # 수정: parsePDFDocument() 추가
│   └── pdf.service.ts                   # 신규: PDFDocument + PDFExtractedItem CRUD
│
└── lib/
    ├── db.ts                            # 수정: version(11) 추가
    └── pdf-utils.ts                     # 신규: KaTeX→PDF 변환 유틸
```

---

## 아키텍처 패턴

### 패턴 1: Lazy Chunk 격리 (기존 패턴 확장)

**설명:** PDF 라이브러리(pdfjs-dist ~1.2MB, @react-pdf/renderer ~500KB)는 무거우므로 기존 game-phaser 패턴과 동일하게 별도 청크로 분리한다. PDF 기능을 쓰지 않는 일반 학습 사용자에게는 비용이 없다.

**구현:**

```typescript
// 뷰어 라우트 진입 시에만 로드
const PDFViewerPage = React.lazy(
  () => import('@/routes/student/pdf-viewer/index')
)

// 내보내기 라우트 진입 시에만 로드
const PDFExportPage = React.lazy(
  () => import('@/routes/instructor/pdf-export/index')
)
```

### 패턴 2: 메모리-전용 PDF Blob (대용량 파일 안전 처리)

**설명:** PDF 원본 File 객체는 Dexie에 저장하지 않는다. 업로드 세션 동안 컴포넌트 state에만 보관하고, 파싱 완료 후 메타데이터만 DB에 저장한다.

**이유:** 50MB PDF를 IndexedDB blob 컬럼에 저장하면 Firefox/Chrome에서 트랜잭션 블로킹 발생 (실제 버그 보고 있음). 사용자는 PDF 재조회 시 파일을 다시 선택해야 하는 UX 비용이 있지만, POC 단계에서는 이것이 더 안전하다.

```typescript
// PDFUploadPage 상태 관리 패턴
function PDFUploadPage() {
  // File 객체: 메모리에만 보관
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [parseResult, setParseResult] = useState<PDFParseResult | null>(null)

  // 메타데이터만 Dexie에 저장
  async function handleParseComplete(result: PDFParseResult) {
    const docId = await pdfService.savePDFDocument({
      originalFilename: pdfFile!.name,
      fileSizeBytes: pdfFile!.size,
      pageCount: result.totalPagesProcessed,
      parseStatus: 'parsed',
      uploadedBy: user.email,
    })
    // pdfFile은 계속 state에 보관 (PDFViewerLazy에 넘기기 위해)
    setParseResult(result)
  }
}
```

### 패턴 3: 업로드 플로우 상태 머신

**설명:** PDF 업로드 → 파싱 → 검수 → 등록까지 여러 단계를 거치는 복잡한 플로우는 명시적인 상태 머신으로 관리한다. 중간 상태가 명확해야 에러 복구와 UX 일관성을 유지할 수 있다.

```typescript
type UploadFlowStep =
  | 'idle'
  | 'uploading'
  | 'parsing'
  | 'reviewing'
  | 'importing'
  | 'done'
  | 'error'

type UploadFlowState =
  | { step: 'idle' }
  | { step: 'uploading'; file: File }
  | { step: 'parsing'; file: File }
  | { step: 'reviewing'; file: File; result: PDFParseResult; docId: number }
  | { step: 'importing'; approvedItems: ParsedPDFQuestion[] }
  | { step: 'done'; importedCount: number }
  | { step: 'error'; message: string; canRetry: boolean }

// 유효한 전이만 허용
function transition(
  state: UploadFlowState,
  action: UploadFlowAction,
): UploadFlowState { ... }
```

### 패턴 4: KaTeX → PDF 수식 변환 파이프라인

**설명:** @react-pdf/renderer는 브라우저 DOM/HTML을 직접 렌더링할 수 없어 KaTeX HTML 출력을 그대로 쓸 수 없다. 두 가지 접근 중 하나를 Phase 구현 단계에서 선택한다.

**접근 A — KaTeX SVG (품질 우선):**
```typescript
// lib/pdf-utils.ts
import katex from 'katex'

export function renderLatexToSvgString(latex: string): string {
  // KaTeX의 SVG 출력 모드 사용 (HTML이 아닌 MathML+SVG)
  return katex.renderToString(latex, {
    throwOnError: false,
    output: 'htmlAndMathml',
  })
  // → SVG 문자열 파싱 후 @react-pdf/renderer <Svg> 컴포넌트로 변환 필요
  // ⚠️ SVG 파싱 로직이 복잡할 수 있음 — 구현 난이도 높음
}
```

**접근 B — canvas → PNG (구현 단순, 권장):**
```typescript
// lib/pdf-utils.ts
import katex from 'katex'

export async function renderLatexToPng(latex: string): Promise<string> {
  // 숨김 div에 KaTeX 렌더링 후 html-to-image로 캡처
  const container = document.createElement('div')
  container.style.cssText = 'position:absolute;left:-9999px;font-size:20px'
  document.body.appendChild(container)

  katex.render(latex, container, { throwOnError: false })

  const { toPng } = await import('html-to-image')
  const dataUrl = await toPng(container)

  document.body.removeChild(container)
  return dataUrl  // @react-pdf/renderer <Image src={dataUrl} /> 에 사용
}
```

**권장:** 접근 B로 시작해서 출력 품질을 검증하고, 인쇄 해상도가 부족하면 접근 A로 전환.

---

## 통합 지점

### 외부 서비스

| 서비스 | 통합 패턴 | 주의사항 |
|--------|-----------|---------|
| Gemini API (PDF 파싱) | 기존 `gemini.service.ts` 확장 | 20MB 기준 inline/Files API 분기. Files API CORS 허용 여부 Phase 시 검증 필요 |
| pdfjs-dist (뷰어) | `react-pdf` 래퍼, lazy 청크 | Vite에서 workerSrc 수동 설정 필수, vite-plugin-static-copy 추가 필요 |
| @react-pdf/renderer (생성) | lazy 청크 + `PDFDownloadLink` | KaTeX 수식은 canvas→PNG 또는 SVG 변환 파이프라인 필요 |

### 내부 경계

| 경계 | 통신 방식 | 고려사항 |
|------|-----------|---------|
| PDFUploadPage ↔ gemini.service | 직접 async 함수 호출 | API 키는 `UserSetting.geminiApiKey`에서 읽음 (기존 NewQuestionPage 패턴 동일) |
| PDFParseReviewer ↔ question.service | 직접 함수 호출 | `bulkAdd()` 사용해 승인된 항목 일괄 등록 |
| PDFOverlayViewer ↔ quiz.service | 기존 QuizAttempt 생성 | PDF 뷰어에서도 기존 채점 로직 재사용 |
| ExamPDFTemplate ↔ question.service | Dexie 쿼리 후 prop 전달 | @react-pdf/renderer는 비동기 Dexie 쿼리 직접 불가 — 부모에서 데이터 미리 로드 필요 |

---

## 빌드 순서 권장사항 (Phase 의존성)

```
Phase 1: PDF 뷰어 기반 인프라
  ├── react-pdf + pdfjs-dist 설치 및 lazy 청크 설정
  ├── PDFViewerLazy 컴포넌트 (워커 설정 포함)
  ├── vite-plugin-static-copy 설정
  └── PDFOverlayViewer 기본 구조 (오버레이 없이 뷰어만)
  → 의존: 없음. 독립적으로 시작 가능.

Phase 2: Gemini PDF 파싱 + DB 스키마
  ├── Dexie version(11) — pdfDocuments + pdfExtractedItems
  ├── gemini.service.ts — parsePDFDocument() 추가
  ├── pdf.service.ts 신규 생성
  └── FileDropZone + PDFParseProgress 컴포넌트
  → 의존: Phase 1과 병렬 가능 (뷰어와 파싱은 독립).

Phase 3: 강사 업로드 플로우 (검수 + 등록)
  ├── PDFParseReviewer 컴포넌트 (인라인 수정 UI)
  ├── /instructor/pdf-upload 라우트
  └── 네비게이션 메뉴 추가
  → 의존: Phase 1 + 2 완료 후.

Phase 4: PDF 내보내기
  ├── @react-pdf/renderer 설치 및 lazy 청크 설정
  ├── KaTeX→PNG 변환 유틸 (lib/pdf-utils.ts)
  ├── ExamPDFTemplate + StudySheetTemplate
  └── /instructor/pdf-export 라우트, 문제집/오답노트 내보내기 버튼
  → 의존: Phase 3과 병렬 가능 (내보내기는 기존 question.service만 의존).

Phase 5: PDF 뷰어 풀이 오버레이 통합
  ├── PDFOverlayViewer 풀이 레이어 완성
  └── /student/pdf-viewer/:id 라우트
  → 의존: Phase 1 + 3 완료 후 (뷰어 + 파일 메타데이터 필요).
```

---

## 안티 패턴

### 안티 패턴 1: PDF Blob을 IndexedDB에 저장

**무엇을 하는가:** 업로드된 PDF File 객체를 `db.pdfDocuments` blob 컬럼에 저장.

**왜 잘못됐는가:** 50MB PDF를 IndexedDB에 저장하면 Firefox/Chrome에서 트랜잭션 블로킹이 발생한다. Mozilla Bugzilla #837141, #945281에서 실제 버그로 보고된 문제다. 사용자 경험 심각 저하.

**대신:** File 객체는 메모리(state)에만 보관. 파싱 완료 후 메타데이터만 Dexie에 저장. 뷰어 재진입 시 사용자가 파일 재선택.

### 안티 패턴 2: pdfjs-dist 직접 설치로 버전 충돌

**무엇을 하는가:** `npm install pdfjs-dist`로 직접 설치해 react-pdf 내부 pdfjs-dist 버전과 불일치 발생.

**왜 잘못됐는가:** "The API version X does not match the Worker version Y" 에러. PDF 렌더링 전체 실패. 프로젝트에 무거운 중복 패키지 포함 (~1.2MB 두 번 번들링).

**대신:** `pdfjs-dist`를 별도로 설치하지 않는다. `react-pdf`가 내부적으로 관리하는 pdfjs-dist 버전을 사용한다. workerSrc만 `import.meta.url` 패턴으로 설정하면 충분하다.

### 안티 패턴 3: 초기 번들에 PDF 라이브러리 포함

**무엇을 하는가:** `PDFViewerLazy`나 `@react-pdf/renderer`를 `main.tsx`에서 정적 import.

**왜 잘못됐는가:** 초기 번들에 ~1.7MB 추가. 앱 로딩 시간 대폭 증가. PDF 기능을 한 번도 쓰지 않는 학생에게도 다운로드 비용 전가.

**대신:** 기존 Phaser/Three.js 패턴과 동일하게 `React.lazy` + `manualChunks` 사용. 라우트 진입 시에만 로드.

### 안티 패턴 4: API 키 없이 PDF 파싱 UI 진입 허용

**무엇을 하는가:** `UserSetting.geminiApiKey` 확인 없이 파일 업로드 → 파싱 단계까지 진입 후 실패.

**왜 잘못됐는가:** 강사가 긴 파싱 워크플로우를 진행하다가 마지막에 API 키 오류로 처음부터 재시작해야 한다. UX 최악.

**대신:** `/instructor/pdf-upload` 라우트 또는 FileDropZone 진입 시점에 `geminiApiKey` 유무를 먼저 확인한다. 없으면 마이페이지 API 키 설정으로 안내하는 모달 표시. 기존 `NewQuestionPage`의 API 키 확인 패턴과 동일하게 구현.

### 안티 패턴 5: @react-pdf/renderer 컴포넌트 내에서 비동기 Dexie 쿼리

**무엇을 하는가:** ExamPDFTemplate 또는 StudySheetTemplate 내부에서 `await db.questions.get()` 직접 호출.

**왜 잘못됐는가:** @react-pdf/renderer는 React의 일반적인 비동기 데이터 패칭 흐름(useEffect/Suspense)을 지원하지 않는 자체 렌더 엔진을 사용한다. 비동기 호출이 무시되거나 예측 불가능하게 동작한다.

**대신:** 부모 컴포넌트(PDFExportPage)에서 모든 문제 데이터를 미리 로드하고, Template 컴포넌트에는 완전히 준비된 데이터를 props로 전달한다.

---

## 스케일 고려사항

현재 POC 아키텍처 기준:

| 관심사 | 현재 (POC) | 백엔드 연동 후 |
|--------|-----------|--------------|
| PDF 원본 저장 | 메모리 only (세션 중) | S3/GCS 업로드 후 presigned URL 저장 |
| Gemini API 키 | 사용자 개인 키 (UserSetting) | 서버사이드 프록시로 키 보호 |
| PDF 파일 크기 한도 | 20MB (inline), 50MB (Gemini 한도) | 서버에서 PDF 분할 처리로 확장 가능 |
| PDF 생성 | 클라이언트 사이드 (@react-pdf/renderer) | 서버사이드 전환 가능 (Node.js + puppeteer) |
| 파싱 속도 | Gemini API 응답 시간 (3~15초) | 서버 큐 처리 + 진행 상태 폴링 |

---

## Sources

- [Gemini API Document Processing 공식 문서](https://ai.google.dev/gemini-api/docs/document-processing) — PDF 처리 한도 50MB/1000페이지, inline vs Files API (HIGH confidence)
- [Gemini API 파일 크기 업데이트 2026-01-12](https://blog.google/innovation-and-ai/technology/developers-tools/gemini-api-new-file-limits/) — inline 100MB, PDF 한도 50MB (HIGH confidence)
- [react-pdf GitHub 공식 저장소](https://github.com/wojtekmaj/react-pdf) — Vite workerSrc 설정, React 16.8+ 호환 (HIGH confidence)
- [pdfjs-dist Vite workerSrc 설정 토론](https://github.com/vitejs/vite/discussions/16501) — import.meta.url 패턴 (MEDIUM confidence)
- [IndexedDB Blob 성능 버그 보고](https://bugzilla.mozilla.org/show_bug.cgi?id=837141) — 대용량 blob 저장 비권장 근거 (HIGH confidence)
- [@react-pdf/renderer npm](https://www.npmjs.com/package/@react-pdf/renderer) — v4.3.2, SVG 지원, React 컴포넌트 기반 (HIGH confidence)
- [KaTeX API 공식 문서](https://katex.org/docs/api) — renderToString, output 옵션 (HIGH confidence)
- [react-pdf-viewer 캔버스 오버레이 예제](https://react-pdf-viewer.dev/examples/draw-on-top-of-the-canvas-layer/) — PDF 위 canvas 드로잉 패턴 (MEDIUM confidence)
- [jsPDF vs pdfmake vs @react-pdf/renderer 비교](https://npm-compare.com/@react-pdf/renderer,jspdf,pdfmake,react-pdf) — PDF 생성 라이브러리 선택 근거 (MEDIUM confidence)

---

*Architecture research for: PDF 2-Way 학습 시스템 — 수학 기출 학습 도우미 v4.0*
*Researched: 2026-02-24*
