# Phase 9: AI 문제 생성 보조 - Research

**Researched:** 2026-02-21
**Domain:** Google Gemini API + React 브라우저 통합, AI 프롬프트 엔지니어링 (수학 문제 생성), UI/UX 패턴
**Confidence:** HIGH (API 스펙), MEDIUM (CORS 해결책), HIGH (통합 패턴)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **모델:** `gemini-3-flash-preview` (Google Gemini API)
- **API 키:** 사용자가 Google AI Studio에서 발급한 키 사용
- **API 엔드포인트:** Google AI Studio (Generative Language API)
- **통합 위치:** 강사 문제 등록/수정 폼 (QuestionForm)
- **플로우:** AI 생성 버튼 → 프롬프트 입력 → Gemini API 호출 → 수식 포함 문제 텍스트 생성

### Claude's Discretion

- UI/UX 세부 구현 (버튼 위치, 모달 vs. 인라인, 로딩 상태 디자인)
- API 키 저장 방식 (localStorage vs. 세션 vs. 매번 입력)
- 응답 파싱 → QuestionForm 필드 매핑 방식
- 에러 처리 상세 구현
- 프롬프트 템플릿 설계

### Deferred Ideas (OUT OF SCOPE)

- 백엔드 프록시 구현 (이 프로젝트는 프론트엔드 전용 POC)
- 스트리밍 응답 (streaming response)
- 여러 AI 생성 결과 비교/선택
- AI 채점 기능
</user_constraints>

---

## Summary

Gemini API (`gemini-3-flash-preview` 모델)를 브라우저에서 직접 호출하는 것은 CORS 제약이 존재하지만, 공식 `@google/genai` SDK를 사용하면 브라우저에서도 직접 API 호출이 가능하다. SDK의 `genai-web` 번들이 브라우저 환경을 지원하며, API 키를 런타임에 주입하는 패턴으로 POC에 적합하다.

이 POC에서는 사용자(강사)가 자신의 Google AI Studio API 키를 앱 설정에서 입력하고, 그 키가 `UserSetting` Dexie 테이블에 저장된다. `QuestionForm` 내부에 "AI 생성" 패널을 추가하여 강사가 간단한 프롬프트를 입력하면 Gemini가 수학 문제 전체(content, answer, explanation)를 JSON으로 구조화하여 반환하고, 이를 폼 필드에 자동으로 채워준다.

핵심 기술 결정: `responseJsonSchema`를 사용한 구조화된 JSON 출력(structured output)으로 파싱 불확실성을 제거하고, LaTeX 수식은 `$...$`와 `$$...$$` 형식으로 명시적으로 지시한다.

**Primary recommendation:** `@google/genai` SDK + `responseMimeType: 'application/json'` + `responseJsonSchema` 조합으로 파싱 없이 구조화된 문제 데이터를 직접 수신한다.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@google/genai` | latest (>=1.0.0) | Google Gemini API 공식 JS/TS SDK | Context7 확인, 구/deprecated `@google/generative-ai` 대체 |
| `gemini-3-flash-preview` | (모델 ID) | AI 문제 생성 모델 | Context.md 결정, 공식 docs 확인 |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `zod` | 이미 설치됨 (^3.x) | AI 응답 스키마 런타임 검증 | AI 응답이 예상 구조와 다를 때 방어 |
| (없음) | - | 별도 파싱 라이브러리 불필요 | `responseJsonSchema`로 구조 보장 |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `@google/genai` | 네이티브 `fetch` REST 직접 호출 | SDK가 헤더/인증/에러를 추상화하므로 더 안전, SDK 권장 |
| `@google/genai` | `@google/generative-ai` (구버전) | 구버전은 2025-08-31 지원 종료 예정, 신버전 사용 필수 |
| `responseJsonSchema` | 텍스트 파싱 | 텍스트 파싱은 불안정, structured output이 훨씬 신뢰성 높음 |

**Installation:**
```bash
pnpm --filter web add @google/genai
```

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── services/
│   └── gemini.service.ts        # Gemini API 호출 서비스 (새로 생성)
├── components/
│   └── questions/
│       ├── QuestionForm.tsx     # AI 생성 패널 추가 (기존 수정)
│       └── AIGeneratePanel.tsx  # AI 생성 UI 컴포넌트 (새로 생성)
└── routes/
    └── instructor/
        └── profile/
            └── index.tsx        # API 키 입력 설정 추가 (기존 수정)
```

또는 마이페이지 설정에 API 키 입력을 추가하는 대신, `AIGeneratePanel` 내부에 API 키 입력을 포함시키는 인라인 패턴도 가능하다 (Claude 재량).

### Pattern 1: Gemini API 직접 브라우저 호출

**What:** `@google/genai` SDK로 브라우저에서 `generativelanguage.googleapis.com`에 직접 POST
**When to use:** POC, 백엔드 없는 프론트엔드 전용 앱, 사용자가 자신의 API 키 사용 시

```typescript
// Source: Context7 /googleapis/js-genai
import { GoogleGenAI } from '@google/genai'

async function generateMathQuestion(
  apiKey: string,
  prompt: string,
): Promise<GeneratedQuestion> {
  const ai = new GoogleGenAI({ apiKey })

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseJsonSchema: MATH_QUESTION_SCHEMA,
      temperature: 0.7,
      maxOutputTokens: 2048,
    },
  })

  return JSON.parse(response.text!) as GeneratedQuestion
}
```

### Pattern 2: CORS 우회 — SDK 사용 vs 네이티브 fetch

**상황:** `generativelanguage.googleapis.com`은 브라우저에서 직접 `fetch`로 호출 시 CORS 오류 발생.

**해결책:** `@google/genai` SDK는 내부적으로 `genai-web` 번들을 사용하며, 브라우저 환경에서 CORS 헤더를 적절히 처리한다. 구글 공식 예제들이 브라우저에서 SDK를 직접 사용하는 패턴을 보여준다.

**주의:** `fetch`로 직접 호출하면 CORS 오류 발생 가능. SDK 사용으로 해결.

```typescript
// 잘못된 패턴 (CORS 오류 발생 가능)
const response = await fetch(
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent',
  { method: 'POST', headers: { 'x-goog-api-key': apiKey }, body: JSON.stringify(...) }
)

// 올바른 패턴 (SDK 사용)
const ai = new GoogleGenAI({ apiKey })
const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', ... })
```

**Confidence:** MEDIUM — SDK 브라우저 지원은 문서에서 확인됨. 실제 CORS 허용 여부는 SDK 내부 구현에 의존. 빌드 시 확인 필요.

### Pattern 3: Structured Output (responseJsonSchema) 패턴

**What:** JSON 스키마를 사전 정의하여 Gemini가 파싱 없이 구조화된 JSON을 직접 반환하도록 함

```typescript
// Source: Context7 /websites/ai_google_dev_gemini-api
const MATH_QUESTION_SCHEMA = {
  type: 'object',
  properties: {
    content: {
      type: 'string',
      description: '수학 문제 본문 (LaTeX 수식은 $...$ 또는 $$...$$ 형식)',
    },
    answer: {
      type: 'string',
      description: '정답 (객관식: 1~5, 단답형: 숫자 문자열)',
    },
    explanation: {
      type: 'string',
      description: '단계별 풀이 해설 (LaTeX 수식 포함)',
    },
    questionType: {
      type: 'string',
      enum: ['multiple', 'short'],
      description: '문제 유형',
    },
    difficulty: {
      type: 'integer',
      minimum: 1,
      maximum: 5,
      description: '난이도 (1: 매우 쉬움 ~ 5: 매우 어려움)',
    },
  },
  required: ['content', 'answer', 'explanation', 'questionType', 'difficulty'],
}

// 응답 파싱
const result = JSON.parse(response.text!) as GeneratedQuestion
// result.content → form.setValue('content', result.content)
// result.answer  → form.setValue('answer', result.answer)
// etc.
```

### Pattern 4: API 키 저장 — UserSetting Dexie 확장

**What:** Dexie `userSettings` 테이블에 `geminiApiKey?: string` 필드 추가

```typescript
// db.ts에 UserSetting 인터페이스 확장 (인덱스 변경 없으므로 version 업 불필요)
export interface UserSetting {
  // ... 기존 필드 ...
  geminiApiKey?: string  // 선택 필드 추가 — Dexie는 스키마 변경 없이 필드 추가 가능
}
```

**주의:** DB 버전은 인덱스 변경 시에만 올려야 함. 단순 필드 추가는 버전 업 불필요.

### Pattern 5: AI 생성 UI/UX 패턴

**추천 플로우:**
1. QuestionForm 최상단에 접이식 "AI 생성 도우미" 패널 (ChevronDown 토글, 기존 isOptionalOpen 패턴 재사용)
2. 패널 내부: 프롬프트 Textarea + "AI 생성" 버튼
3. 로딩 중: 버튼 disabled + spinner (기존 isLoading 패턴)
4. 성공: form.setValue()로 필드 자동 채우기 → 사용자가 검토/수정 후 저장
5. 실패: 에러 메시지 인라인 표시

**API 키 미설정 시:** "AI 생성" 버튼 클릭 시 API 키 입력 안내 메시지 + 설정 링크

### Anti-Patterns to Avoid

- **응답 텍스트 파싱:** `response.text`를 regex로 파싱하지 말 것 — `responseJsonSchema` 사용
- **API 키 VITE 환경변수:** `VITE_GEMINI_API_KEY`를 빌드 시 번들에 하드코딩하지 말 것 (사용자가 자신의 키 사용)
- **API 키 미검증 후 호출:** 키 없이 API 호출 시 401 에러 — 사전 검증 필요
- **streaming 미지원 시 `generateContentStream` 사용:** POC에서 streaming은 범위 초과

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| API 인증/헤더 관리 | 커스텀 fetch 래퍼 | `@google/genai` SDK | CORS, 헤더, 에러 처리 내장 |
| JSON 구조화 파싱 | 텍스트 regex 파싱 | `responseJsonSchema` + structured output | 신뢰성, 타입 안전성 |
| 응답 검증 | 커스텀 검증 로직 | `zod` 런타임 파싱 | 이미 설치됨, 방어적 파싱 |

**Key insight:** Gemini의 structured output (`responseJsonSchema`)을 사용하면 응답 파싱 코드가 거의 불필요하다. `JSON.parse(response.text!)` 한 줄로 충분.

---

## Common Pitfalls

### Pitfall 1: SDK vs 네이티브 fetch CORS 오류

**What goes wrong:** `fetch`로 `generativelanguage.googleapis.com`을 직접 호출하면 브라우저 CORS 정책으로 오류 발생
**Why it happens:** Google Gemini API는 서버사이드 호출을 전제로 설계됨. `Access-Control-Allow-Origin` 헤더 부재
**How to avoid:** `@google/genai` SDK를 사용 (`genai-web` 번들이 브라우저 환경 처리)
**Warning signs:** "No 'Access-Control-Allow-Origin' header" 콘솔 오류

### Pitfall 2: 구버전 SDK 사용

**What goes wrong:** `@google/generative-ai` (구버전)은 2025-08-31 지원 종료
**Why it happens:** 검색 결과 또는 구 튜토리얼이 구버전 패키지를 사용
**How to avoid:** `@google/genai`만 사용 (신버전 통합 SDK)
**Warning signs:** `import { GoogleGenerativeAI } from '@google/generative-ai'`

### Pitfall 3: API 키 보안 — 브라우저 노출

**What goes wrong:** VITE 환경변수로 API 키를 번들에 포함하면 번들 파일 검사로 노출
**Why it happens:** `import.meta.env.VITE_*`는 빌드 시 인라인됨
**How to avoid:** 사용자가 자신의 키를 런타임에 입력 → `localStorage`/IndexedDB 저장 패턴 사용
**Warning signs:** `.env` 파일에 `VITE_GEMINI_API_KEY=...`

### Pitfall 4: LaTeX 형식 지정 누락

**What goes wrong:** Gemini가 수식을 `\frac{1}{2}`(LaTeX raw)로 반환하고 `$...$` 래퍼 없이 반환
**Why it happens:** 시스템 프롬프트에 LaTeX 형식 명시 누락
**How to avoid:** 시스템 프롬프트에 "인라인 수식은 `$...$`, 블록 수식은 `$$...$$`" 명시
**Warning signs:** KaTeX 렌더링 시 수식이 텍스트로 표시됨

### Pitfall 5: UserSetting Dexie 버전 업 오류

**What goes wrong:** `geminiApiKey` 추가를 위해 DB 버전을 올리면 마이그레이션 스크립트 필요
**Why it happens:** Dexie 버전 업 시 stores 스키마 재정의 강제
**How to avoid:** 인덱스 변경 없는 필드 추가는 버전 업 불필요 — 기존 `userSettings` 인터페이스에 `geminiApiKey?: string`만 추가
**Warning signs:** `db.version(7).stores(...)` 추가 시 기존 테이블 인덱스 정의 복사 필수

### Pitfall 6: `response.text`가 `undefined`

**What goes wrong:** structured output 실패 시 `response.text`가 `undefined`
**Why it happens:** API 에러, 안전 필터 트리거, 잘못된 스키마
**How to avoid:** `response.text`에 null guard 추가, `promptFeedback` 체크
**Warning signs:** `JSON.parse(undefined)`는 런타임 에러 발생

---

## Code Examples

### Gemini 서비스 기본 구조

```typescript
// apps/web/src/services/gemini.service.ts
// Source: Context7 /googleapis/js-genai + /websites/ai_google_dev_gemini-api

import { GoogleGenAI } from '@google/genai'

export interface GeneratedQuestion {
  content: string       // LaTeX 포함 문제 본문 ($...$ 형식)
  answer: string        // 정답 (객관식: '1'~'5', 단답형: 숫자)
  explanation: string   // LaTeX 포함 해설
  questionType: 'multiple' | 'short'
  difficulty: 1 | 2 | 3 | 4 | 5
}

const MATH_QUESTION_SCHEMA = {
  type: 'object',
  properties: {
    content: {
      type: 'string',
      description: '수학 문제 본문. 인라인 수식은 $...$, 블록 수식은 $$...$$ 형식 사용',
    },
    answer: {
      type: 'string',
      description: '정답. 객관식은 1~5 중 하나의 숫자 문자열, 단답형은 숫자 문자열',
    },
    explanation: {
      type: 'string',
      description: '단계별 풀이 해설. LaTeX 수식 포함 가능',
    },
    questionType: {
      type: 'string',
      enum: ['multiple', 'short'],
    },
    difficulty: {
      type: 'integer',
      minimum: 1,
      maximum: 5,
    },
  },
  required: ['content', 'answer', 'explanation', 'questionType', 'difficulty'],
}

const SYSTEM_PROMPT = `당신은 한국 수학 교사입니다. 수능/내신 수준의 수학 문제를 출제합니다.
규칙:
- 모든 수식은 KaTeX 호환 LaTeX 사용: 인라인은 $...$, 블록은 $$...$$
- 객관식(multiple)은 5지선다로 문제를 작성하고 answer는 정답 번호(1~5)
- 단답형(short)은 answer는 숫자 문자열
- explanation은 단계별 풀이 과정 포함`

export async function generateMathQuestion(
  apiKey: string,
  userPrompt: string,
): Promise<GeneratedQuestion> {
  if (!apiKey.trim()) {
    throw new Error('Gemini API 키가 설정되지 않았습니다')
  }

  const ai = new GoogleGenAI({ apiKey })

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      {
        role: 'user',
        parts: [{ text: userPrompt }],
      },
    ],
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: 'application/json',
      responseJsonSchema: MATH_QUESTION_SCHEMA,
      temperature: 0.7,
      maxOutputTokens: 2048,
    },
  })

  if (!response.text) {
    throw new Error('AI 응답이 비어 있습니다. 프롬프트를 수정하거나 다시 시도하세요.')
  }

  return JSON.parse(response.text) as GeneratedQuestion
}
```

### API 키 Dexie 저장 패턴

```typescript
// db.ts UserSetting 인터페이스 확장 (버전 업 불필요)
export interface UserSetting {
  id: number
  userId: string
  dailyGoal: number
  isDiagnosisCompleted: boolean
  displayName?: string
  avatarEmoji?: string
  isDarkMode?: boolean
  katexFontSize?: number
  geminiApiKey?: string   // Phase 9에서 추가 — 인덱스 없음, 버전 업 불필요
}

// settings.service.ts 함수 추가
export async function getGeminiApiKey(userId: string): Promise<string | undefined> {
  const setting = await db.userSettings.where('userId').equals(userId).first()
  return setting?.geminiApiKey
}

export async function saveGeminiApiKey(userId: string, apiKey: string): Promise<void> {
  await db.userSettings.where('userId').equals(userId).modify({ geminiApiKey: apiKey })
}
```

### AIGeneratePanel 컴포넌트 기본 구조

```typescript
// apps/web/src/components/questions/AIGeneratePanel.tsx
import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { generateMathQuestion, type GeneratedQuestion } from '@/services/gemini.service'

interface AIGeneratePanelProps {
  apiKey: string
  onGenerated: (result: GeneratedQuestion) => void
}

export function AIGeneratePanel({ apiKey, onGenerated }: AIGeneratePanelProps) {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleGenerate() {
    setIsGenerating(true)
    setError(null)
    try {
      const result = await generateMathQuestion(apiKey, prompt)
      onGenerated(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI 생성 중 오류가 발생했습니다')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="border rounded-lg p-4 space-y-3 bg-muted/20">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-primary" />
        <p className="text-sm font-medium">AI 문제 생성</p>
      </div>
      <Textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="예: 미적분 치환적분 문제, 난이도 어려움, 객관식"
        className="min-h-20 text-sm"
      />
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleGenerate}
        disabled={isGenerating || !prompt.trim() || !apiKey}
      >
        <Sparkles className="w-3 h-3 mr-1" />
        {isGenerating ? 'AI 생성 중...' : 'AI로 문제 생성'}
      </Button>
      {!apiKey && (
        <p className="text-xs text-muted-foreground">
          AI 기능을 사용하려면 마이페이지에서 Gemini API 키를 설정하세요.
        </p>
      )}
    </div>
  )
}
```

### QuestionForm에 AI 생성 결과 주입 패턴

```typescript
// QuestionForm.tsx 수정 패턴
// onGenerated 콜백에서 form.setValue 사용
function handleAIGenerated(result: GeneratedQuestion) {
  form.setValue('content', result.content)
  form.setValue('answer', result.answer)
  form.setValue('explanation', result.explanation)
  form.setValue('questionType', result.questionType)
  form.setValue('difficulty', result.difficulty)
  // trigger validation after setting values
  form.trigger(['content', 'answer', 'explanation'])
}
```

### REST API 직접 호출 참고 (SDK 사용 권장)

```bash
# Source: Context7 /websites/ai_google_dev_gemini-api (공식 curl 예제)
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent" \
  -H "x-goog-api-key: $GEMINI_API_KEY" \
  -H 'Content-Type: application/json' \
  -X POST \
  -d '{
    "contents": [{"parts": [{"text": "수열의 극한 문제 출제"}]}],
    "generationConfig": {
      "responseMimeType": "application/json",
      "responseJsonSchema": { ... }
    }
  }'
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `@google/generative-ai` | `@google/genai` (통합 SDK) | 2024 하반기 | 구버전 2025-08-31 지원 종료, 신버전 전환 필수 |
| 텍스트 응답 + regex 파싱 | `responseJsonSchema` structured output | 2024 | 파싱 불필요, 타입 안전, 스키마 강제 |
| 브라우저에서 Firebase 필수 | `@google/genai` 직접 브라우저 사용 | 2024 | POC에서 Firebase 없이도 가능 |
| `gemini-2.0-flash` (deprecated) | `gemini-3-flash-preview` | 2025 | 사용자 요구사항에서 3-flash-preview 명시 |

**Deprecated/outdated:**
- `@google/generative-ai`: 2025-08-31 지원 종료, `@google/genai`로 대체
- `gemini-2.0-flash`: deprecated 예정, `gemini-2.5-flash` 또는 `gemini-3-flash-preview` 사용

---

## Open Questions

1. **`@google/genai` SDK 브라우저 CORS 실제 동작 확인**
   - What we know: SDK 내부에 `genai-web` 브라우저 빌드 존재. `Environment.ENVIRONMENT_BROWSER` 열거형 존재
   - What's unclear: CORS 헤더 자동 처리 여부 vs 추가 설정 필요 여부
   - Recommendation: 설치 후 즉시 브라우저 테스트. 오류 시 Vite dev proxy 추가 고려 (`vite.config.ts server.proxy`)

2. **`gemini-3-flash-preview` 접근 가능 여부**
   - What we know: 공식 docs에 모델 ID `gemini-3-flash-preview` 확인 (Context7 기준)
   - What's unclear: 일반 Google AI Studio API 키로 접근 가능한지, 특별 승인 필요한지
   - Recommendation: 플랜에서 대체 모델(`gemini-2.5-flash`) fallback 처리 포함

3. **`systemInstruction` 필드 vs 첫 번째 `contents` 메시지 방식**
   - What we know: SDK에서 `config.systemInstruction` 지원 확인
   - What's unclear: `gemini-3-flash-preview` 프리뷰 모델이 `systemInstruction`을 완전히 지원하는지
   - Recommendation: `systemInstruction` 사용 (지원 안 되면 첫 user 메시지에 시스템 지시 포함)

4. **Workbox PWA 캐시 크기 — `@google/genai` 번들 크기**
   - What we know: `mathlive` 추가로 이미 3MB로 상향 조정됨
   - What's unclear: `@google/genai` 번들이 추가 크기 증가를 유발할지
   - Recommendation: 빌드 후 번들 크기 확인, 필요 시 lazy import 또는 Workbox 크기 추가 상향

---

## Sources

### Primary (HIGH confidence)

- **Context7 `/googleapis/js-genai`** — generateContent API, 브라우저 환경 지원, `GoogleGenAIOptions`, `GenerateContentParameters`, `responseJsonSchema` 사용법
- **Context7 `/websites/ai_google_dev_gemini-api`** — 공식 Gemini API docs, structured output, REST 엔드포인트, 응답 스키마
- **Context7 `/websites/ai_google_dev_gemini-api` (gemini-3 문서)** — `gemini-3-flash-preview` 모델 ID 확인, REST curl 예제

### Secondary (MEDIUM confidence)

- **WebSearch + WebFetch: CORS 분석** — `generativelanguage.googleapis.com` 직접 fetch CORS 오류 확인, SDK 사용 필요 결론
- **WebFetch: `ai.google.dev/gemini-api/docs/api-key`** — API 키 보안, 브라우저 직접 사용 비권장(프로덕션), POC는 허용
- **WebFetch: `glaforge.dev` Google AI Studio 프록시 분석** — 프록시 패턴 참고

### Tertiary (LOW confidence)

- **WebSearch: CORS workaround** — `x-stainless-xxx` 헤더 제거 우회법 (OpenAI 라이브러리 한정, 우리는 미적용)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — Context7로 공식 SDK API 확인, 모델 ID 공식 docs 확인
- Architecture: HIGH — 기존 프로젝트 패턴 (Dexie, SettingsContext, QuestionForm) 기반 설계
- Pitfalls: MEDIUM-HIGH — CORS 문제는 실제 사례 다수 확인, 일부는 실환경 테스트 필요
- Prompting: MEDIUM — LaTeX 수식 프롬프트 패턴은 일반 AI 프롬프팅 원칙 기반, 실제 결과는 테스트 필요

**Research date:** 2026-02-21
**Valid until:** 2026-03-21 (모델 프리뷰 상태로 빠른 변경 가능, 30일 유효)

---

## Phase Requirements Mapping

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| (신규) | 강사가 AI를 통해 수학 문제(본문+정답+해설)를 자동 생성할 수 있다 | `generateMathQuestion` 서비스 + `responseJsonSchema` 패턴 |
| (신규) | AI 생성 결과가 QuestionForm 필드에 자동으로 채워진다 | `form.setValue()` 주입 패턴 |
| (신규) | Gemini API 키를 마이페이지/설정에서 입력하고 저장할 수 있다 | `UserSetting.geminiApiKey` Dexie 필드 확장 패턴 |
| (신규) | AI 생성 중 로딩 상태와 에러 메시지가 표시된다 | `isGenerating` + `error` 상태 패턴 (기존 프로젝트 관례와 동일) |
</phase_requirements>
