---
id: quick-002
type: summary
description: "MathLive WYSIWYG 수식 에디터 통합 — 강사 문제 등록/수정 폼"
completed: "2026-02-20"
duration: "152s"
tasks_completed: 2
files_modified: 4
commits:
  - ba9960e
  - ec05fa4
tags: [mathlive, wysiwyg, latex, editor, instructor]
key-files:
  created:
    - apps/web/src/components/questions/MathFieldInput.tsx
  modified:
    - apps/web/src/components/questions/LatexEditor.tsx
    - apps/web/package.json
    - apps/web/vite.config.ts
decisions:
  - "declare module 'react' { namespace JSX.IntrinsicElements } — React 19 react-jsx 모드에서 커스텀 웹 컴포넌트 타입 선언 방법 (global namespace 대신 module augmentation)"
  - "workbox maximumFileSizeToCacheInBytes 3MB 상향 — mathlive 번들 크기(~820KB) 추가로 PWA 빌드 실패 방지"
  - "math-virtual-keyboard-policy=manual — 모바일 가상 키보드 자동 팝업 방지, 사용자 제어"
  - "requestAnimationFrame으로 삽입 후 textarea focus + cursor 이동 — React state 업데이트 완료 후 DOM 조작 보장"
---

# Quick Task 002: MathLive WYSIWYG 수식 에디터 통합 — 강사 문제 등록 폼

**한 줄 요약:** MathLive `<math-field>` 웹 컴포넌트 기반 WYSIWYG 수식 입력 도우미 패널을 LatexEditor에 토글 방식으로 통합하여 강사가 LaTeX 문법 없이 시각적으로 수식을 작성하고 삽입 가능하게 함

## 완료된 작업

| Task | 이름 | Commit | 핵심 변경 파일 |
|------|------|--------|--------------|
| 1 | mathlive 패키지 설치 + MathFieldInput React 래퍼 생성 | ba9960e | MathFieldInput.tsx, package.json |
| 2 | LatexEditor에 MathLive 수식 입력 패널 통합 | ec05fa4 | LatexEditor.tsx, vite.config.ts |

## 구현 상세

### Task 1: MathFieldInput 컴포넌트

`apps/web/src/components/questions/MathFieldInput.tsx`

- MathLive `<math-field>` 웹 컴포넌트의 React 19 호환 래퍼
- `useRef<MathfieldElement>` + `useEffect`로 `input` 이벤트 기반 양방향 LaTeX 바인딩
- 인라인 삽입(`$...$`) + 블록 삽입(`$$...$$`) 버튼 (shadcn Button variant="outline")
- 수식 비어있을 때 삽입 버튼 `disabled`
- 삽입 후 math-field 값 초기화 (사용자 경험 개선)
- `math-virtual-keyboard-policy="manual"` — 모바일 자동 키보드 팝업 방지

### Task 2: LatexEditor 통합

`apps/web/src/components/questions/LatexEditor.tsx`

레이아웃 구조:
```
[수식 입력 도우미 열기/닫기 토글 버튼 (Calculator 아이콘)]
(토글 시 노출)
┌────────────────────────────────────────────────┐
│ "수식을 시각적으로 입력한 뒤 삽입 버튼을 누르세요" │
│ <math-field> WYSIWYG 에디터                     │
│ [인라인 삽입 $...$] [블록 삽입 $$...$$]          │
└────────────────────────────────────────────────┘
[LaTeX 입력 textarea] | [KaTeX 미리보기]
(기존 그대로 유지)
```

- `useRef<HTMLTextAreaElement>` + `selectionStart`/`selectionEnd`로 커서 위치에 정확히 삽입
- 삽입 후 `requestAnimationFrame`으로 textarea `focus()` + `setSelectionRange()` 이동
- 기존 textarea + KaTeX 미리보기 레이아웃 변경 없음

### 자동 수정 (Rule 3 - 블로킹 이슈)

**workbox 빌드 실패 자동 수정**
- 발생 시점: Task 2 빌드 검증
- 문제: mathlive 추가로 번들(2.18MB)이 workbox 기본 2MB 제한 초과 → PWA 빌드 실패
- 수정: `vite.config.ts` workbox `maximumFileSizeToCacheInBytes: 3 * 1024 * 1024` 추가
- 파일: `apps/web/vite.config.ts`
- Commit: ec05fa4 (Task 2 커밋에 포함)

## 검증 결과

- `pnpm build` (apps/web) 빌드 성공 (타입 에러 없음)
- MathFieldInput.tsx: math-field 웹 컴포넌트 래퍼 + onInsert 콜백 + 삽입 버튼 존재
- LatexEditor.tsx: 수식 도우미 토글 + MathFieldInput 패널 + 기존 textarea/미리보기 유지
- 기존 QuestionForm, LatexPreview 변경 없음 — 학생 뷰 영향 없음

## 결정 사항

1. **React 19 JSX 모듈 augmentation 방식**: `declare global { namespace JSX }` 대신 `declare module 'react' { namespace JSX }` — `react-jsx` 모드에서 커스텀 웹 컴포넌트 타입 인식을 위한 올바른 방법

2. **workbox 캐시 한도 3MB 상향**: mathlive 라이브러리는 WYSIWYG 수식 렌더링을 위해 ~820KB 크기 — PWA 오프라인 캐시 포함을 위해 필수

3. **math-virtual-keyboard-policy="manual"**: 터치 기기에서 math-field 탭 시 MathLive 가상 키보드 자동 팝업 비활성화 — 기존 앱 키보드 UX와 충돌 방지

## Self-Check: PASSED

| 항목 | 결과 |
|------|------|
| MathFieldInput.tsx 존재 | FOUND |
| LatexEditor.tsx 존재 | FOUND |
| 2-SUMMARY.md 존재 | FOUND |
| 커밋 ba9960e 존재 | FOUND |
| 커밋 ec05fa4 존재 | FOUND |
