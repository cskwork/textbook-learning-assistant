---
id: quick-002
type: execute
description: "MathLive WYSIWYG 수식 에디터 통합 — 강사 문제 등록/수정 폼"
files_modified:
  - apps/web/package.json
  - apps/web/src/components/questions/MathFieldInput.tsx
  - apps/web/src/components/questions/LatexEditor.tsx
autonomous: true
---

<objective>
강사 문제 등록/수정 폼의 수식 입력 UX를 개선한다. 현재 LaTeX 문법을 직접 타이핑해야 하는 textarea 기반 에디터에 MathLive WYSIWYG 수식 입력 패널을 추가하여, 선생님이 LaTeX 문법을 몰라도 시각적으로 수식을 작성하고 삽입할 수 있게 한다.

Purpose: 강사가 LaTeX 문법 없이도 분수, 적분, 시그마 등 복잡한 수식을 시각적으로 입력 가능하게 하여 문제 등록 진입 장벽을 낮춘다.
Output: MathLive 기반 수식 입력 패널이 통합된 LatexEditor 컴포넌트
</objective>

<execution_context>
@/Users/danny/.claude/get-shit-done/workflows/execute-plan.md
@/Users/danny/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@apps/web/src/components/questions/LatexEditor.tsx
@apps/web/src/components/questions/LatexPreview.tsx
@apps/web/src/components/questions/QuestionForm.tsx
@apps/web/package.json
</context>

<tasks>

<task type="auto">
  <name>Task 1: mathlive 패키지 설치 + MathFieldInput React 래퍼 컴포넌트 생성</name>
  <files>
    apps/web/package.json
    apps/web/src/components/questions/MathFieldInput.tsx
  </files>
  <action>
1. pnpm add mathlive --filter web 으로 mathlive 패키지 설치

2. `apps/web/src/components/questions/MathFieldInput.tsx` 생성 — MathLive `<math-field>` 웹 컴포넌트의 React 래퍼:

```tsx
// MathLive <math-field> 웹 컴포넌트 React 래퍼
// 수식 입력 패널 — LatexEditor 내부에서 사용
import { useRef, useEffect } from 'react'
import type { MathfieldElement } from 'mathlive'
import 'mathlive'  // 웹 컴포넌트 등록 side-effect

interface MathFieldInputProps {
  value: string          // LaTeX 문자열 ($ 없이 순수 LaTeX)
  onChange: (latex: string) => void
  onInsert: (latex: string) => void  // "삽입" 버튼 클릭 시 콜백
  placeholder?: string
}
```

핵심 구현 사항:
- `useRef<MathfieldElement>` 로 math-field DOM 요소 참조
- `useEffect`에서 `input` 이벤트 리스너로 value 양방향 바인딩 (mf.value = latex 문자열)
- math-field의 `mathVirtualKeyboardPolicy="manual"` 설정 — 모바일에서 가상 키보드 자동 팝업 방지, 사용자가 원할 때만 표시
- math-field `style` 속성: `font-size: 1.1rem`, `min-height: 50px`, `border: 1px solid hsl(var(--border))`, `border-radius: 0.375rem`, `padding: 0.5rem` — shadcn 스타일과 조화
- "수식 삽입" 버튼: 현재 math-field의 LaTeX 값을 `$...$`로 감싸서 `onInsert` 콜백 호출, 삽입 후 math-field 값 초기화
- "블록 수식 삽입" 버튼: `$$...$$`로 감싸서 삽입 (displayMode)
- 버튼 스타일: shadcn Button variant="outline" size="sm"
- math-field가 비어있으면 삽입 버튼 disabled

TypeScript 타입 처리:
- MathLive 웹 컴포넌트는 JSX.IntrinsicElements에 타입이 없으므로, 파일 상단에 `declare global { namespace JSX { interface IntrinsicElements { 'math-field': React.DetailedHTMLProps<React.HTMLAttributes<MathfieldElement>, MathfieldElement> & { [key: string]: any } } } }` 선언 추가
- 또는 ref 기반으로만 접근하고 JSX에서는 단순 math-field 태그 사용
  </action>
  <verify>
    - `pnpm build --filter web` 빌드 성공
    - MathFieldInput.tsx 파일에 math-field 웹 컴포넌트 래퍼 + onInsert 콜백 + 삽입 버튼 존재
  </verify>
  <done>
    MathFieldInput 컴포넌트가 MathLive math-field를 래핑하고, LaTeX 양방향 바인딩 + 인라인/블록 수식 삽입 버튼을 제공한다.
  </done>
</task>

<task type="auto">
  <name>Task 2: LatexEditor에 MathLive 수식 입력 패널 통합</name>
  <files>
    apps/web/src/components/questions/LatexEditor.tsx
  </files>
  <action>
기존 LatexEditor.tsx를 수정하여 MathFieldInput 수식 입력 패널을 추가한다. 기존 textarea + KaTeX 미리보기 레이아웃은 유지하면서, textarea 아래에 수식 입력 도우미 패널을 배치한다.

레이아웃 구조 (3단 세로 배치):
```
┌─────────────────────────────────────────────────┐
│ [수식 도우미 토글 버튼: "수식 입력 도우미 열기"]    │
├─────────────────────────────────────────────────┤
│ (토글 시 노출되는 MathLive 패널)                   │
│ ┌─────────────────────────────────────────────┐ │
│ │ <math-field> WYSIWYG 수식 에디터             │ │
│ │ [인라인 삽입 $...$] [블록 삽입 $$...$$]       │ │
│ └─────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────┤
│  LaTeX 입력 textarea   │  KaTeX 미리보기          │
│  (기존 그대로)          │  (기존 그대로)            │
└─────────────────────────────────────────────────┘
```

구현 상세:
1. `useState<boolean>(false)` 로 수식 도우미 패널 열기/닫기 상태 관리
2. 토글 버튼: "수식 입력 도우미" 텍스트 + lucide `Calculator` 아이콘, `text-sm text-muted-foreground hover:text-foreground` 스타일
3. MathFieldInput의 `onInsert` 콜백 구현:
   - textarea의 현재 커서 위치(selectionStart)에 LaTeX 문자열 삽입
   - `useRef<HTMLTextAreaElement>`로 textarea 참조 필요 — 기존 shadcn Textarea에 ref 전달
   - 삽입 후 onChange 호출로 react-hook-form 값 업데이트
   - 삽입 후 textarea에 focus 이동 + 커서를 삽입된 텍스트 뒤로 설정
4. 기존 textarea, KaTeX 미리보기 영역은 변경 없이 유지
5. Textarea 컴포넌트에 ref를 forwardRef로 전달하기 위해, shadcn Textarea가 이미 forwardRef를 지원하는지 확인 후 ref prop 사용. 만약 직접 ref 접근이 안 되면 wrapping div에서 querySelector로 textarea 요소 접근.

도우미 패널 안내 텍스트 추가:
- 패널 상단에 `text-xs text-muted-foreground`: "수식을 시각적으로 입력한 뒤 삽입 버튼을 누르세요"
  </action>
  <verify>
    - `pnpm build --filter web` 빌드 성공
    - `pnpm dev --filter web` 실행 후 /instructor/problems/new 접속
    - "수식 입력 도우미" 토글 클릭 시 MathLive math-field 패널 표시
    - math-field에 수식 입력 후 "인라인 삽입" 클릭 시 textarea에 `$...$` 형태로 삽입
    - "블록 삽입" 클릭 시 `$$...$$` 형태로 삽입
    - 삽입된 수식이 우측 KaTeX 미리보기에 즉시 렌더링
    - 기존 직접 LaTeX 타이핑도 여전히 동작
  </verify>
  <done>
    LatexEditor에 MathLive WYSIWYG 수식 입력 도우미 패널이 토글 방식으로 통합되어, 강사가 LaTeX 문법을 모르더라도 시각적으로 수식을 작성하고 textarea에 삽입할 수 있다. 기존 직접 LaTeX 입력 + KaTeX 미리보기 기능은 그대로 유지된다.
  </done>
</task>

</tasks>

<verification>
1. `pnpm build --filter web` 빌드 성공 (타입 에러 없음)
2. /instructor/problems/new 페이지에서 수식 도우미 패널 열기/닫기 동작
3. MathLive math-field에서 분수($\frac{a}{b}$), 적분($\int_0^1$), 제곱근($\sqrt{x}$) 등 입력 후 삽입 정상 동작
4. 삽입된 LaTeX가 KaTeX 미리보기에서 올바르게 렌더링
5. /instructor/problems/:id/edit 수정 페이지에서도 동일하게 동작 (QuestionForm 공유 컴포넌트이므로 자동 적용)
6. 기존 학생 뷰(QuizPlayer, QuestionCard 등)의 LatexPreview 렌더링에 영향 없음
</verification>

<success_criteria>
- mathlive 패키지 설치 완료
- MathFieldInput 래퍼 컴포넌트 생성
- LatexEditor에 토글 가능한 수식 입력 도우미 패널 추가
- 인라인($...$) 및 블록($$...$$) 수식 삽입 기능 동작
- 기존 LaTeX 직접 입력 + KaTeX 미리보기 기능 유지
- 빌드 성공, 런타임 에러 없음
</success_criteria>

<output>
After completion, create `.planning/quick/2-mathlive-wysiwyg/2-SUMMARY.md`
</output>
