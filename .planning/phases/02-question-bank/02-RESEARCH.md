# Phase 2: 문제 뱅크 + 수식 렌더링 — 리서치

**Researched:** 2026-02-20
**Domain:** LaTeX 수식 렌더링 + localStorage/IndexedDB 기반 문제 CRUD + React 폼 관리
**Confidence:** HIGH

---

## Summary

Phase 2의 핵심 기술 도전은 두 가지다: (1) KaTeX로 LaTeX 수식을 실시간 미리보기하는 에디터 UI, (2) 백엔드 없이 IndexedDB(Dexie.js)를 사용하여 문제 데이터를 영구 저장하는 mock 데이터 레이어. CRITICAL ARCHITECTURE DECISION에 따라 기존 apps/api Express 서버 대신 **프론트엔드 전용 localStorage/IndexedDB 레이어**로 구현한다.

KaTeX는 MathJax 대비 훨씬 빠르고 React 친화적이며 한국 고교 수학(수능) 전 영역을 지원한다. 이미지 저장에는 localStorage 대신 **IndexedDB(Dexie.js)**를 사용한다 — localStorage는 5MB 한계로 base64 이미지 몇 장만 저장해도 QuotaExceededError가 발생한다. 폼 관리는 shadcn/ui가 이미 채택한 **react-hook-form + zod** 조합이 표준이다.

인증 레이어도 이번 Phase에서 localStorage mock으로 전환해야 한다. 기존 AuthContext는 Express API를 호출하는데, POC 배포(Vercel) 환경에서는 백엔드가 없으므로 `lib/auth.ts` 를 localStorage 기반 mock으로 교체해야 한다.

**Primary recommendation:** KaTeX(직접) + Dexie.js(IndexedDB) + react-hook-form/zod + 기존 shadcn/ui 스택으로 구현하라. 별도 LaTeX 에디터 라이브러리 없이 textarea + KaTeX preview 패턴을 사용하라.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| QBNK-01 | 관리자/강사가 LaTeX 에디터로 수학 문제를 등록할 수 있다 | textarea + KaTeX 실시간 미리보기 패턴, react-hook-form으로 폼 관리 |
| QBNK-02 | 각 문제에 과목·단원·유형·난이도 메타데이터가 태깅된다 | Dexie.js TypeScript 스키마로 인덱싱, shadcn Select 컴포넌트 |
| QBNK-03 | 관리자/강사가 등록된 문제를 수정·삭제할 수 있다 | Dexie.js CRUD API(put/delete), useLiveQuery 반응형 목록 |
| QBNK-04 | 각 문제에 텍스트+이미지 혼합 상세 해설이 포함된다 | 해설도 LaTeX 텍스트 + 이미지(base64 Dexie 저장) |
| QBNK-05 | 문제에 출처 정보(수능/모의고사/교육청, 연도, 번호)가 기록된다 | Dexie 스키마 source 필드 (type/year/number) |
| QBNK-06 | 수식이 LaTeX로 저장되고 KaTeX로 정확하게 렌더링된다 | katex.renderToString() + dangerouslySetInnerHTML 패턴 |
| QBNK-07 | 그래프/도형은 이미지 파일로 업로드되어 문제에 표시된다 | FileReader API → base64 → Dexie.js 저장, <img> 렌더링 |
| UIUX-02 | 수학 문제/해설의 수식이 모든 화면 크기에서 정확히 렌더링된다 | KaTeX CSS import, displayMode 제어, 반응형 컨테이너 |
</phase_requirements>

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| katex | ^0.16.x | LaTeX → HTML 렌더링 | MathJax보다 10x 빠름, 200+ TeX 함수 지원, 한국 수학 전영역 커버 |
| dexie | ^4.0.x | IndexedDB wrapper (문제 영구 저장) | localStorage 5MB 한계 극복, TypeScript EntityTable, useLiveQuery 반응형 |
| dexie-react-hooks | ^1.1.x | useLiveQuery React 훅 | Dexie와 React 연동 공식 지원 |
| react-hook-form | ^7.x | 폼 상태 관리 | shadcn/ui 공식 권장, 최소 리렌더, 비제어 컴포넌트 |
| zod | ^3.x | 스키마 유효성 검사 | TypeScript-first, react-hook-form zodResolver와 통합 |
| @hookform/resolvers | ^3.x | zod ↔ react-hook-form 브릿지 | zodResolver 제공 |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @types/katex | ^0.16.x | KaTeX TypeScript 타입 정의 | katex 설치 시 항상 같이 설치 |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| katex (직접) | react-katex (v3.1.0) | react-katex는 React 19 공식 지원 미확인, 직접 사용이 더 안정적 |
| Dexie.js | localStorage 직접 | localStorage는 5MB 한계로 base64 이미지 저장 불가 |
| Dexie.js | localforage | localforage는 쿼리/인덱스 지원 없음, Dexie가 관계형 쿼리에 적합 |
| textarea + KaTeX | CodeMirror + latex extension | CodeMirror는 불필요한 복잡도, textarea로 충분한 POC 수준 |
| react-hook-form | 상태 기반 폼 | 이미 shadcn/ui에서 채택된 표준, 변경 이유 없음 |

**Installation:**
```bash
pnpm --filter web add katex dexie dexie-react-hooks react-hook-form zod @hookform/resolvers
pnpm --filter web add -D @types/katex
```

---

## Architecture Patterns

### Recommended Project Structure
```
apps/web/src/
├── lib/
│   ├── db.ts              # Dexie 데이터베이스 인스턴스 + 스키마
│   ├── mock-auth.ts       # localStorage 기반 mock auth (기존 auth.ts 대체)
│   └── api.ts             # 기존 유지 (향후 실제 백엔드 전환 대비)
├── services/
│   └── question.service.ts  # 문제 CRUD 서비스 (Dexie 레이어 래핑)
├── components/
│   └── questions/
│       ├── QuestionForm.tsx      # 문제 등록/수정 폼 (react-hook-form + zod)
│       ├── QuestionList.tsx      # 문제 목록 (useLiveQuery 반응형)
│       ├── QuestionCard.tsx      # 문제 카드 (KaTeX 렌더링 포함)
│       ├── LatexEditor.tsx       # textarea + 미리보기 split 에디터
│       ├── LatexPreview.tsx      # KaTeX 렌더링 컴포넌트
│       └── ImageUpload.tsx       # 이미지 업로드 → base64 변환
└── routes/
    └── instructor/
        ├── problems/
        │   ├── index.tsx          # 문제 목록 페이지
        │   ├── new.tsx            # 문제 등록 페이지
        │   └── [id]/
        │       ├── edit.tsx       # 문제 수정 페이지
        │       └── index.tsx      # 문제 상세 페이지
        └── index.tsx              # 기존 강사 홈 (업데이트)
```

### Pattern 1: Dexie.js 스키마 + TypeScript

**What:** Dexie 4.0 EntityTable 패턴으로 타입 안전 IndexedDB 스키마 정의
**When to use:** 문제 데이터 영구 저장, 인덱스 기반 쿼리, 반응형 목록

```typescript
// Source: https://dexie.org/docs/Typescript
// lib/db.ts
import Dexie, { type EntityTable } from 'dexie'

// 문제 출처 타입
export interface QuestionSource {
  type: '수능' | '모의고사' | '교육청' | '기타'
  year?: number    // 예: 2024
  number?: number  // 예: 30
  month?: number   // 모의고사/교육청용 (예: 6월, 9월)
}

// 문제 메타데이터 타입
export interface Question {
  id: number
  // 내용
  content: string          // LaTeX 포함 문제 본문
  imageDataUrl?: string    // base64 이미지 (그래프/도형)
  answer: string           // 정답 (객관식: '1'~'5', 단답형: 숫자)
  questionType: 'multiple' | 'short'
  // 해설
  explanation: string      // LaTeX 포함 해설 본문
  explanationImageDataUrl?: string
  // 메타데이터
  subject: '수학I' | '수학II' | '미적분' | '확률과통계' | '기하'
  unit: string             // 단원명 (예: '수열', '극한', '적분')
  questionCategory: string // 유형 (예: '등차수열의 일반항', '정적분')
  difficulty: 1 | 2 | 3 | 4 | 5  // 1=매우쉬움, 5=매우어려움
  source: QuestionSource
  // 시스템
  createdAt: number        // Date.now()
  updatedAt: number
  createdBy: string        // user email or id
}

const db = new Dexie('mathQuestionDB') as Dexie & {
  questions: EntityTable<Question, 'id'>
}

db.version(1).stores({
  questions: '++id, subject, unit, questionCategory, difficulty, createdAt, createdBy',
})

export { db }
```

### Pattern 2: KaTeX 렌더링 컴포넌트

**What:** katex.renderToString() + dangerouslySetInnerHTML로 React에서 KaTeX 렌더링
**When to use:** 문제 본문, 해설 표시 시 — LaTeX `$...$` 와 `$$...$$` 구분 렌더링

```typescript
// Source: https://katex.org/docs/api
// components/questions/LatexPreview.tsx
import katex from 'katex'
import 'katex/dist/katex.min.css'

interface LatexPreviewProps {
  content: string
  className?: string
}

/**
 * LaTeX 수식 + 일반 텍스트 혼합 렌더링
 * $$...$$ → 블록 수식 (displayMode: true)
 * $...$ → 인라인 수식 (displayMode: false)
 */
export function LatexPreview({ content, className }: LatexPreviewProps) {
  const rendered = renderMixedContent(content)
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: rendered }}
    />
  )
}

function renderMixedContent(text: string): string {
  // $$...$$ 블록 수식 먼저 처리 (인라인보다 먼저)
  let result = text.replace(/\$\$([\s\S]+?)\$\$/g, (_, math) => {
    try {
      return katex.renderToString(math, {
        displayMode: true,
        throwOnError: false,
        output: 'html',
      })
    } catch {
      return `<span class="text-destructive">${math}</span>`
    }
  })

  // $...$ 인라인 수식 처리
  result = result.replace(/\$([^\n]+?)\$/g, (_, math) => {
    try {
      return katex.renderToString(math, {
        displayMode: false,
        throwOnError: false,
        output: 'html',
      })
    } catch {
      return `<span class="text-destructive">${math}</span>`
    }
  })

  return result
}
```

### Pattern 3: LaTeX 에디터 (textarea + 미리보기)

**What:** 좌측 textarea 입력 + 우측 KaTeX 미리보기 split pane
**When to use:** 문제 등록/수정 폼에서 LaTeX 입력 시

```typescript
// components/questions/LatexEditor.tsx
import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { LatexPreview } from './LatexPreview'

interface LatexEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function LatexEditor({ value, onChange, placeholder }: LatexEditorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <p className="text-xs text-muted-foreground mb-1">LaTeX 입력</p>
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? '$x^2 + y^2 = r^2$'}
          className="font-mono text-sm min-h-32 resize-y"
        />
      </div>
      <div>
        <p className="text-xs text-muted-foreground mb-1">미리보기</p>
        <div className="min-h-32 border rounded-md p-3 bg-muted/30">
          <LatexPreview content={value} />
        </div>
      </div>
    </div>
  )
}
```

### Pattern 4: mock Auth (localStorage 기반)

**What:** 기존 `lib/auth.ts`의 API 호출을 localStorage로 교체
**When to use:** POC 배포 — 백엔드 없는 Vercel 환경

```typescript
// lib/mock-auth.ts
const USERS_KEY = 'mock:users'
const CURRENT_USER_KEY = 'mock:current_user'

export interface User {
  id: number
  email: string
  role: 'student' | 'instructor' | null
  isOnboarded: boolean
}

function getUsers(): User[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) ?? '[]')
  } catch {
    return []
  }
}

export function mockLogin(email: string, password: string): User {
  // password 검증은 POC에서 생략 (hash 비교 복잡도)
  const users = getUsers()
  const user = users.find((u) => u.email === email)
  if (!user) throw new Error('이메일 또는 비밀번호가 올바르지 않습니다')
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
  return user
}

export function mockRegister(email: string, _password: string): User {
  const users = getUsers()
  if (users.find((u) => u.email === email)) {
    throw new Error('이미 사용 중인 이메일입니다')
  }
  const newUser: User = {
    id: Date.now(),
    email,
    role: null,
    isOnboarded: false,
  }
  localStorage.setItem(USERS_KEY, JSON.stringify([...users, newUser]))
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser))
  return newUser
}

export function mockGetMe(): User | null {
  try {
    return JSON.parse(localStorage.getItem(CURRENT_USER_KEY) ?? 'null')
  } catch {
    return null
  }
}

export function mockLogout(): void {
  localStorage.removeItem(CURRENT_USER_KEY)
}

export function mockSetRole(role: 'student' | 'instructor'): User {
  const current = mockGetMe()
  if (!current) throw new Error('로그인이 필요합니다')
  const updated: User = { ...current, role, isOnboarded: true }
  // users 배열도 업데이트
  const users = getUsers().map((u) => (u.id === updated.id ? updated : u))
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updated))
  return updated
}
```

### Pattern 5: useLiveQuery로 반응형 문제 목록

**What:** Dexie useLiveQuery → 문제 추가/수정/삭제 시 자동 리렌더
**When to use:** 문제 목록 페이지

```typescript
// Source: https://dexie.org/docs/dexie-react-hooks/useLiveQuery()
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'

export function useQuestions(filters?: { subject?: string; difficulty?: number }) {
  return useLiveQuery(async () => {
    let query = db.questions.orderBy('createdAt').reverse()
    if (filters?.subject) {
      return db.questions
        .where('subject').equals(filters.subject)
        .reverse()
        .sortBy('createdAt')
    }
    return query.toArray()
  }, [filters?.subject, filters?.difficulty])
}
```

### Pattern 6: 이미지 업로드 → base64 → Dexie 저장

**What:** FileReader API로 이미지를 base64 data URL로 변환 후 Dexie 저장
**When to use:** 문제 내 그래프/도형 이미지 업로드 (QBNK-07)

```typescript
// components/questions/ImageUpload.tsx
import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { ImagePlus, X } from 'lucide-react'

interface ImageUploadProps {
  value?: string  // base64 data URL
  onChange: (dataUrl: string | undefined) => void
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // 크기 제한: 2MB (Dexie에 저장 가능한 적정 크기)
    if (file.size > 2 * 1024 * 1024) {
      alert('이미지 크기는 2MB 이하여야 합니다')
      return
    }

    const reader = new FileReader()
    reader.onload = () => onChange(reader.result as string)
    reader.readAsDataURL(file)
  }

  if (value) {
    return (
      <div className="relative inline-block">
        <img src={value} alt="문제 이미지" className="max-h-48 rounded-md object-contain" />
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="absolute top-1 right-1 w-6 h-6"
          onClick={() => onChange(undefined)}
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
    )
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
      <Button type="button" variant="outline" onClick={() => inputRef.current?.click()}>
        <ImagePlus className="w-4 h-4 mr-2" />
        이미지 업로드
      </Button>
    </>
  )
}
```

### Pattern 7: react-hook-form + zod 문제 폼

**What:** shadcn Form + react-hook-form + zod로 문제 등록 폼 구성
**When to use:** 문제 등록/수정 페이지

```typescript
// Source: https://ui.shadcn.com/docs/components/form
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const questionSchema = z.object({
  content: z.string().min(10, '문제 내용은 10자 이상이어야 합니다'),
  answer: z.string().min(1, '정답을 입력하세요'),
  questionType: z.enum(['multiple', 'short']),
  subject: z.enum(['수학I', '수학II', '미적분', '확률과통계', '기하']),
  unit: z.string().min(1, '단원을 입력하세요'),
  questionCategory: z.string().min(1, '유형을 입력하세요'),
  difficulty: z.number().int().min(1).max(5),
  explanation: z.string().min(1, '해설을 입력하세요'),
  sourceType: z.enum(['수능', '모의고사', '교육청', '기타']),
  sourceYear: z.number().int().min(2000).max(2030).optional(),
  sourceNumber: z.number().int().min(1).max(50).optional(),
})

type QuestionFormData = z.infer<typeof questionSchema>

function QuestionForm({ onSubmit }: { onSubmit: (data: QuestionFormData) => void }) {
  const form = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      questionType: 'multiple',
      subject: '수학I',
      difficulty: 3,
      sourceType: '수능',
    },
  })
  // ... 폼 렌더링
}
```

### Anti-Patterns to Avoid
- **localStorage 직접 이미지 저장:** base64 이미지는 KB~MB 단위. 문제 몇 개만 저장해도 QuotaExceededError. 반드시 Dexie.js(IndexedDB) 사용
- **react-katex 라이브러리 사용:** 마지막 업데이트가 수년 전, React 19 호환 미확인. katex 직접 사용
- **displayMode 구분 없이 렌더링:** 인라인 수식(`$...$`)에 displayMode:true 적용 시 레이아웃 깨짐
- **throwOnError 기본값(true) 사용:** 에디터에서 불완전한 LaTeX 입력 시 앱 크래시. 반드시 `throwOnError: false`
- **KaTeX CSS 누락:** `import 'katex/dist/katex.min.css'` 없으면 수식이 깨진 텍스트로 표시

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| LaTeX 수식 파싱 + HTML 변환 | 커스텀 TeX 파서 | katex.renderToString() | 200+ TeX 함수 처리, 브라우저 호환성 보장 |
| 폼 유효성 검사 | 수동 if 체인 | react-hook-form + zod | TypeScript 타입 자동 추론, 접근성 에러 메시지 |
| IndexedDB 직접 조작 | window.indexedDB API | Dexie.js | 트랜잭션 관리, 버전 마이그레이션, TypeScript 지원 |
| 반응형 쿼리 | useState + useEffect | useLiveQuery | 탭 간 동기화, 자동 리렌더 |
| base64 변환 | canvas.toDataURL() | FileReader.readAsDataURL() | 원본 형식 유지, 간단한 API |

**Key insight:** KaTeX의 수식 파싱은 수천 줄의 엣지 케이스를 처리한다. 직접 구현하면 수능 수학 문제의 복잡한 수식(행렬, 적분, 극한 등)에서 반드시 버그 발생.

---

## Common Pitfalls

### Pitfall 1: localStorage QuotaExceededError
**What goes wrong:** 이미지를 base64로 localStorage에 저장하면 5MB 한계 초과로 에러 발생
**Why it happens:** base64 인코딩은 원본 대비 ~33% 크기 증가. 1MB 이미지 → ~1.3MB 문자열
**How to avoid:** 이미지는 반드시 Dexie.js(IndexedDB)에 저장. 메타데이터·설정만 localStorage 사용
**Warning signs:** `Failed to execute 'setItem' on 'Storage': Setting the value of '...' exceeded the quota`

### Pitfall 2: KaTeX CSS 누락으로 수식 깨짐
**What goes wrong:** 수식이 HTML로 변환되지만 폰트/기호가 깨진 상태로 표시
**Why it happens:** katex.min.css 없으면 KaTeX 전용 폰트와 기호 렌더링 불가
**How to avoid:** `import 'katex/dist/katex.min.css'` — LatexPreview 컴포넌트나 앱 진입점에서 한 번만 import
**Warning signs:** 수식이 작은 박스나 깨진 문자로 표시됨

### Pitfall 3: $...$ 와 $$...$$ 파싱 순서 오류
**What goes wrong:** $$...$$ 를 먼저 처리하지 않으면 $...$ 파서가 $$ 를 두 개의 인라인 수식 시작으로 인식
**Why it happens:** 문자열 기반 regex 처리 시 순서 의존성
**How to avoid:** 반드시 $$...$$ → $...$ 순서로 처리. renderMixedContent 함수 내 regex 순서 고정
**Warning signs:** 블록 수식이 두 개의 인라인 수식 조각으로 분리됨

### Pitfall 4: AuthContext가 실제 API 호출
**What goes wrong:** Vercel 배포 시 apps/api 서버가 없으므로 AuthContext의 getMe(), login() 등이 모두 실패
**Why it happens:** 기존 AuthContext는 fetch('/api/auth/...') 호출 — POC에서는 백엔드 없음
**How to avoid:** lib/auth.ts를 mock-auth.ts로 교체 후 AuthContext import 변경. `VITE_API_URL` env var도 mock 모드에서는 무시
**Warning signs:** 앱 마운트 시 즉시 /login 리디렉트, 콘솔 네트워크 에러

### Pitfall 5: Dexie 스키마 변경 시 버전 불일치
**What goes wrong:** 기존 IndexedDB DB가 있는 브라우저에서 스키마 변경 시 에러 발생
**Why it happens:** IndexedDB는 버전 기반 마이그레이션 필수
**How to avoid:** 스키마 변경 시 `db.version(2).stores(...)` 으로 버전 올리기. 개발 중에는 DevTools에서 IndexedDB 직접 삭제
**Warning signs:** `VersionError: The requested version (1) is less than the existing version (2)`

### Pitfall 6: 이미지 크기 제한 없이 업로드
**What goes wrong:** 수십 MB 이미지 업로드 시 IndexedDB도 느려지고 앱 성능 저하
**Why it happens:** IndexedDB는 용량 제한이 크지만 큰 base64 string 처리는 메인 스레드 블로킹
**How to avoid:** 업로드 전 파일 크기 2MB 제한 체크, 필요 시 canvas로 리사이즈
**Warning signs:** 이미지 업로드 후 앱 반응 느려짐, 저장 시간 수초

---

## Code Examples

### KaTeX 기본 사용 패턴

```typescript
// Source: https://katex.org/docs/api
import katex from 'katex'
import 'katex/dist/katex.min.css'

// 블록 수식 (displayMode: true)
const blockHtml = katex.renderToString('\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}', {
  displayMode: true,
  throwOnError: false,
  output: 'html',
})

// 인라인 수식 (displayMode: false)
const inlineHtml = katex.renderToString('a^2 + b^2 = c^2', {
  displayMode: false,
  throwOnError: false,
  output: 'html',
})
```

### Dexie 문제 CRUD

```typescript
// lib/db.ts 기반
import { db } from '@/lib/db'
import type { Question } from '@/lib/db'

// 생성
async function createQuestion(data: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>) {
  const id = await db.questions.add({
    ...data,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  } as Question)
  return id
}

// 수정
async function updateQuestion(id: number, data: Partial<Question>) {
  await db.questions.update(id, { ...data, updatedAt: Date.now() })
}

// 삭제
async function deleteQuestion(id: number) {
  await db.questions.delete(id)
}

// 조회 (단건)
async function getQuestion(id: number) {
  return db.questions.get(id)
}
```

### shadcn Form 기본 구조

```typescript
// Source: https://ui.shadcn.com/docs/components/form
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from '@/components/ui/form'

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="content"
      render={({ field }) => (
        <FormItem>
          <FormLabel>문제 내용</FormLabel>
          <FormControl>
            <LatexEditor value={field.value} onChange={field.onChange} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </form>
</Form>
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| MathJax (무거운 수식 렌더링) | KaTeX (경량, 빠름) | ~2020년대 | 렌더링 속도 10x 향상 |
| localStorage 직접 사용 | Dexie.js IndexedDB | ~2018년 이후 표준 | 용량 제한 해소, 쿼리 지원 |
| 수동 폼 유효성 검사 | react-hook-form + zod | 2022년 이후 표준 | 타입 안전성, 접근성 자동화 |
| react-katex wrapper | katex 직접 사용 | 2024년 이후 권장 | 라이브러리 유지보수 불확실성 회피 |
| Dexie 3.x | Dexie 4.0 (EntityTable 패턴) | 2024년 | TypeScript 타입 추론 개선 |

**Deprecated/outdated:**
- react-katex (v3.1.0): 마지막 업데이트 수년 전, React 19 미확인 → katex 직접 사용
- MathJax: 번들 크기 너무 큼, KaTeX가 대체
- localforage: 쿼리 지원 없음, Dexie.js가 대체

---

## Open Questions

1. **shadcn Form 컴포넌트 미설치 여부**
   - What we know: package.json에 `shadcn ^3.8.5` devDependency 있음. `shadcn add form` 실행 필요
   - What's unclear: form, select, textarea 등 shadcn 컴포넌트가 이미 설치됐는지 확인 필요
   - Recommendation: Plan 실행 전 `npx shadcn@latest add form select textarea` 확인

2. **Dexie 버전 최신 확인**
   - What we know: Dexie 4.x 문서에서 EntityTable 패턴 확인됨
   - What's unclear: npm 기준 실제 최신 stable 버전 숫자 (4.0.x)
   - Recommendation: `pnpm add dexie@latest` 로 설치 후 버전 확인

3. **AuthContext 전환 범위**
   - What we know: 기존 AuthContext → lib/auth.ts → fetch('/api/auth/...') 구조
   - What's unclear: 기존 Phase 1 코드(lib/auth.ts) 수정 vs 새 mock-auth.ts 생성 후 AuthContext 수정 여부
   - Recommendation: lib/auth.ts 자체를 mock으로 교체 (AuthContext는 변경 최소화). 향후 백엔드 전환 시 auth.ts만 교체

4. **문제 카테고리 데이터 (과목별 단원 목록)**
   - What we know: 수능 수학 과목 5개 확정 (수학I/II, 미적분, 확률과통계, 기하)
   - What's unclear: 각 과목의 단원·유형 목록을 hardcode 해야 하는가, 자유 입력 허용 여부
   - Recommendation: POC에서는 자유 텍스트 입력 (string). 단원 목록은 향후 Phase에서 구조화

5. **라우터 파일 기반 vs 수동 라우트 추가**
   - What we know: main.tsx에 Route 수동 등록 방식 사용 중
   - What's unclear: 문제 상세(동적 :id 라우트)를 react-router v7에서 어떻게 추가할지
   - Recommendation: `<Route path="/instructor/problems/:id" element={<QuestionDetailPage />} />` 패턴으로 추가

---

## Sources

### Primary (HIGH confidence)
- KaTeX 공식 문서 (https://katex.org/docs/api) — renderToString, options 검증
- KaTeX Options (https://katex.org/docs/options.html) — throwOnError, displayMode 기본값 확인
- KaTeX Supported Functions (https://katex.org/docs/supported) — 한국 수학 영역 지원 확인
- Dexie.js Typescript 문서 (https://dexie.org/docs/Typescript) — EntityTable 패턴
- Dexie.js useLiveQuery 문서 (https://dexie.org/docs/dexie-react-hooks/useLiveQuery()) — React 훅 API
- shadcn/ui Form 문서 (https://ui.shadcn.com/docs/components/form) — react-hook-form 통합
- MDN localStorage quota (https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria) — 5MB 한계 확인

### Secondary (MEDIUM confidence)
- WebSearch: "KaTeX React integration 2025" — react-katex 유지보수 상태 확인
- WebSearch: "localStorage size limit 5MB image storage pitfalls" — QuotaExceededError 패턴 확인
- WebSearch: "Dexie.js React 19 TypeScript liveQuery hook 2025" — Dexie 4.0 EntityTable 확인
- WebSearch: "react-hook-form shadcn form zod 2025" — 현재 표준 스택 확인

### Tertiary (LOW confidence)
- WebSearch: "LaTeX textarea split preview React 2025" — textarea + split preview 패턴 커뮤니티 검증
- WebSearch: "auth localStorage mock React SPA POC 2025" — localStorage mock 패턴 (공식 문서 없음)

---

## Metadata

**Confidence breakdown:**
- Standard Stack: HIGH — KaTeX, Dexie.js, react-hook-form/zod 모두 공식 문서 확인
- Architecture: HIGH — 패턴 공식 문서 기반, 기존 Phase 1 코드 구조 분석 완료
- Pitfalls: HIGH — localStorage quota 이슈는 MDN 공식 문서, KaTeX CSS 이슈는 공식 문서 확인

**Research date:** 2026-02-20
**Valid until:** 2026-03-20 (안정적 라이브러리, 30일 유효)

---

## 아키텍처 전환 체크리스트 (Phase 2 진입 전 필수)

Phase 2는 단순히 문제 뱅크를 추가하는 것이 아니라 **앱 전체 데이터 레이어를 API→mock으로 전환**하는 작업을 포함한다:

1. `lib/auth.ts` → localStorage mock으로 교체 (AuthContext 수정 최소화)
2. `AuthContext.tsx` → import 경로 변경 (`./mock-auth`)
3. `lib/db.ts` 생성 (Dexie 스키마 정의)
4. `services/question.service.ts` 생성 (CRUD 래퍼)
5. 강사 라우트 `/instructor/problems/*` 구현
6. 학생 라우트에서 KaTeX 렌더링으로 문제 뷰 제공
