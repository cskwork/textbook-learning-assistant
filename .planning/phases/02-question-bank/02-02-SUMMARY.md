---
phase: 02-question-bank
plan: 02
subsystem: ui
tags: [katex, latex, react, shadcn, tailwind, typescript]

# Dependency graph
requires:
  - phase: 01-infra-auth
    provides: "shadcn/ui 스택, Tailwind v4 설정, cn() 유틸리티, Button 컴포넌트"
provides:
  - "LatexPreview: KaTeX 기반 LaTeX + 일반 텍스트 혼합 렌더링 컴포넌트"
  - "LatexEditor: textarea 입력 + LatexPreview 실시간 미리보기 split 에디터"
  - "ImageUpload: 2MB 제한 + FileReader base64 변환 + 이미지 미리보기/삭제"
  - "shadcn textarea 컴포넌트 설치"
  - "katex CSS index.css에 import"
affects:
  - "02-03 (문제 등록 폼): LatexEditor, ImageUpload 사용"
  - "02-04 (문제 뷰): LatexPreview 사용"

# Tech tracking
tech-stack:
  added:
    - "katex ^0.16.x — LaTeX → HTML 렌더링"
    - "@types/katex ^0.16.x — KaTeX TypeScript 타입"
    - "shadcn textarea 컴포넌트"
  patterns:
    - "$$...$$ 블록 수식 먼저 처리 → $...$ 인라인 수식 순서 (파싱 오인식 방지)"
    - "throwOnError: false — 잘못된 LaTeX 입력 시 크래시 없이 오류 표시"
    - "dangerouslySetInnerHTML + katex.renderToString() 렌더링 패턴"
    - "FileReader.readAsDataURL() → base64 data URL 변환"

key-files:
  created:
    - "apps/web/src/components/questions/LatexPreview.tsx"
    - "apps/web/src/components/questions/LatexEditor.tsx"
    - "apps/web/src/components/questions/ImageUpload.tsx"
    - "apps/web/src/components/ui/textarea.tsx"
  modified:
    - "apps/web/src/index.css — katex/dist/katex.min.css import 추가"
    - "apps/web/package.json — katex, @types/katex 의존성 추가"

key-decisions:
  - "katex 직접 사용 — react-katex wrapper 대신 (React 19 호환성 불확실)"
  - "$$...$$ → $...$ 파싱 순서 고정 — regex 처리 시 순서 의존성 해결"
  - "throwOnError: false — 에디터 미완성 입력 중 앱 크래시 방지"
  - "shadcn textarea 추가 설치 — Plan 02 실행 시점에 미설치 상태 확인"
  - "KaTeX CSS는 index.css에서 전역 import (컴포넌트 내 import 대신)"

patterns-established:
  - "renderMixedContent() 함수: $$...$$ 먼저, $...$ 나중 처리"
  - "ImageUpload: MAX_SIZE_BYTES 상수 + FileReader onload/onerror 패턴"
  - "LatexEditor: minHeight prop으로 컨텍스트별 높이 조절 가능"

requirements-completed: [QBNK-06, QBNK-07, UIUX-02]

# Metrics
duration: 2min
completed: 2026-02-20
---

# Phase 2 Plan 02: LaTeX 렌더링 컴포넌트 Summary

**KaTeX 기반 LaTeX 수식 렌더링 컴포넌트 3개(LatexPreview, LatexEditor, ImageUpload) + shadcn textarea 설치**

## Performance

- **Duration:** 약 2분
- **Started:** 2026-02-20T06:09:20Z
- **Completed:** 2026-02-20T06:11:11Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- LatexPreview: `$$...$$` 블록 수식 + `$...$` 인라인 수식 + 일반 텍스트 혼합 렌더링, throwOnError: false
- LatexEditor: 좌측 textarea(모노스페이스) + 우측 KaTeX 미리보기 split pane, md 이상 2컬럼
- ImageUpload: 2MB 파일 크기 제한 + FileReader base64 변환 + 이미지 미리보기 + 삭제 버튼
- KaTeX CSS를 index.css에 전역 import, pnpm --filter web build 에러 없음

## Task Commits

각 태스크는 원자적으로 커밋됨:

1. **Task 1: LatexPreview + KaTeX CSS 설정** - `a1ec043` (feat)
2. **Task 2: LatexEditor + ImageUpload 컴포넌트** - `656db97` (feat)

## Files Created/Modified

- `apps/web/src/components/questions/LatexPreview.tsx` — KaTeX 기반 혼합 콘텐츠 렌더링 컴포넌트
- `apps/web/src/components/questions/LatexEditor.tsx` — textarea + LatexPreview split 에디터
- `apps/web/src/components/questions/ImageUpload.tsx` — 이미지 업로드 → base64 변환 컴포넌트
- `apps/web/src/components/ui/textarea.tsx` — shadcn textarea 컴포넌트 (신규 설치)
- `apps/web/src/index.css` — `@import 'katex/dist/katex.min.css'` 추가
- `apps/web/package.json` — katex, @types/katex 의존성 추가

## Decisions Made

- **katex 직접 사용**: react-katex wrapper 라이브러리는 마지막 업데이트가 수년 전이고 React 19 공식 호환 미확인 → katex 직접 사용이 더 안정적
- **$$...$$ → $...$ 파싱 순서**: 블록 수식을 먼저 처리하지 않으면 `$$`를 두 개의 인라인 수식 시작으로 오인식하는 regex 순서 의존성 문제 해결
- **throwOnError: false**: 에디터에서 LaTeX 입력 중 불완전한 수식(예: 닫히지 않은 `$`) 입력 시 앱 전체 크래시 방지
- **KaTeX CSS 전역 import**: index.css에서 한 번만 import하여 폰트 중복 로드 방지

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] shadcn textarea 컴포넌트 신규 설치**
- **Found during:** Task 2 (LatexEditor 구현 전)
- **Issue:** LatexEditor가 `@/components/ui/textarea` import를 사용하는데, UI 컴포넌트 디렉토리에 textarea.tsx 미설치 상태
- **Fix:** `pnpm dlx shadcn@latest add textarea` 실행으로 설치
- **Files modified:** `apps/web/src/components/ui/textarea.tsx` (신규 생성)
- **Verification:** 빌드 에러 없음, import 정상 동작
- **Committed in:** `656db97` (Task 2 커밋에 포함)

---

**Total deviations:** 1 auto-fixed (1 blocking — shadcn textarea 미설치)
**Impact on plan:** LatexEditor 구현에 필수적인 블로킹 이슈. Plan에서 설치 여부 확인 후 설치하도록 명시되어 있었으므로 정상 처리.

## Issues Encountered

- katex는 Plan 01(병렬 Wave 1)에서 설치되어 있을 것으로 가정했으나, Plan 01이 실행되지 않아 직접 설치 필요 — Plan 02를 독립적으로 실행 가능하도록 katex 설치를 Task 1 전에 실행

## User Setup Required

없음 — 외부 서비스 설정 불필요.

## Next Phase Readiness

- LatexPreview, LatexEditor, ImageUpload 3개 컴포넌트가 Plan 03(문제 등록 폼)에서 즉시 사용 가능
- LatexPreview는 Plan 04(문제 뷰)에서도 사용
- KaTeX CSS 전역 import로 모든 페이지에서 수식 렌더링 지원

## Self-Check: PASSED

- FOUND: apps/web/src/components/questions/LatexPreview.tsx
- FOUND: apps/web/src/components/questions/LatexEditor.tsx
- FOUND: apps/web/src/components/questions/ImageUpload.tsx
- FOUND: apps/web/src/components/ui/textarea.tsx
- FOUND: commit a1ec043 (feat(02-02): LatexPreview 컴포넌트 + KaTeX CSS 설정)
- FOUND: commit 656db97 (feat(02-02): LatexEditor + ImageUpload 컴포넌트 구현)

---
*Phase: 02-question-bank*
*Completed: 2026-02-20*
