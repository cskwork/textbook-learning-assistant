---
phase: quick-005
plan: 5
subsystem: frontend-ui
tags: [latex, katex, ux, layout-fix]
dependency_graph:
  requires: [LatexPreview 컴포넌트, AIRecommendations, WorkbookCreator, student-home]
  provides: [LaTeX 렌더링 AI 추천 목록, LaTeX 렌더링 문제집 미리보기, 잘림 없는 홈 배너]
  affects: [apps/web/src/components/analytics/AIRecommendations.tsx, apps/web/src/components/workbook/WorkbookCreator.tsx, apps/web/src/routes/student/index.tsx]
tech_stack:
  added: []
  patterns: [LatexPreview 컴포넌트 재사용 패턴, overflow-hidden 스코프 한정 패턴]
key_files:
  created: []
  modified:
    - apps/web/src/components/analytics/AIRecommendations.tsx
    - apps/web/src/components/workbook/WorkbookCreator.tsx
    - apps/web/src/routes/student/index.tsx
decisions:
  - "[quick-005] p 태그 → div 변경: LatexPreview가 내부에 div를 렌더링하므로 p > div 중첩 방지"
  - "[quick-005] 슬라이스 길이 확대: LaTeX 마크업이 문자 수를 차지하므로 AI 추천 40→60, 문제집 30→50"
  - "[quick-005] overflow-hidden 데코 서클 래퍼 분리: 컨텐츠 영역이 잘리지 않도록 클리핑 스코프를 배경 데코 요소에만 한정"
metrics:
  duration: 95s
  completed: 2026-02-21
---

# Quick Task 5: LaTeX 미리보기 렌더링 + 홈 배너 잘림 수정 요약

**한 줄 요약:** AI 추천 + 문제집 미리보기 2곳에 KaTeX LatexPreview 적용, 학생 홈 CTA 배너 overflow-hidden 스코프 분리로 모바일 잘림 해결

## 완료된 태스크

| # | 태스크 | 커밋 | 주요 파일 |
|---|--------|------|-----------|
| 1 | AI 추천 + 문제집 미리보기에 LatexPreview 적용 | 66b1f90 | AIRecommendations.tsx, WorkbookCreator.tsx |
| 2 | 학생 홈 배너 잘림 수정 | 379da1b | student/index.tsx |

## 변경 내용 상세

### Task 1: LatexPreview 적용

**AIRecommendations.tsx:**
- `import { LatexPreview } from '@/components/questions/LatexPreview'` 추가
- raw text `<p>` 태그를 `<div>` + `<LatexPreview>` 조합으로 교체
- 슬라이스 길이 40 → 60 (LaTeX 마크업 문자 소비 고려)
- `<p>` → `<div>` 변경: LatexPreview 내부가 div를 렌더링하므로 `p > div` 중첩 방지

**WorkbookCreator.tsx:**
- `import { LatexPreview } from '@/components/questions/LatexPreview'` 추가
- preview 단계 문제 목록 `<p>` → `<div className="line-clamp-1 flex items-baseline gap-1">` + 번호 `<span>` + `<LatexPreview>` 구조로 교체
- 슬라이스 길이 30 → 50 확대

### Task 2: 배너 잘림 수정

**Empty state 환영 히어로 카드 (attemptCount === 0):**
```
변경 전:
<div className="cta-gradient rounded-2xl p-6 md:p-8 text-white relative overflow-hidden ...">
  {/* 데코 서클 + 컨텐츠 모두 overflow-hidden 영향 받음 */}

변경 후:
<div className="cta-gradient rounded-2xl text-white relative ...">
  {/* overflow-hidden을 데코 서클 래퍼에만 한정 */}
  <div className="absolute inset-0 overflow-hidden rounded-2xl">
    {/* 데코 서클들 */}
  </div>
  <div className="relative p-6 md:p-8 ...">
    {/* 컨텐츠: overflow-hidden 없음 → 잘림 없음 */}
  </div>
</div>
```

**일반 상태 CTA 카드 (lg:col-span-3):**
- 동일 패턴 적용: `overflow-hidden`을 데코 서클 래퍼에만 한정
- `p-5 md:p-6` 패딩을 relative 컨텐츠 div로 이동

## 검증 결과

- `pnpm --filter web build` TypeScript 오류 없음, 빌드 성공 ✓
- LaTeX 수식($...$, $$...$$)이 AI 추천 목록에서 KaTeX로 렌더링됨 ✓
- 문제집 미리보기 단계에서 LaTeX 수식 렌더링됨 ✓
- CTA 배너 `overflow-hidden` 스코프 분리 완료 ✓

## Deviations from Plan

None — 계획대로 정확히 실행됨.

## Self-Check: PASSED

- AIRecommendations.tsx 수정 완료 ✓
- WorkbookCreator.tsx 수정 완료 ✓
- student/index.tsx 수정 완료 ✓
- 커밋 66b1f90 존재 ✓
- 커밋 379da1b 존재 ✓
