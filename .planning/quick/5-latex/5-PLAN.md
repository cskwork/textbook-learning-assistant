---
phase: quick-005
plan: 5
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/web/src/components/analytics/AIRecommendations.tsx
  - apps/web/src/components/workbook/WorkbookCreator.tsx
  - apps/web/src/routes/student/index.tsx
autonomous: true
requirements: []
must_haves:
  truths:
    - "AI 추천 문제 목록에서 LaTeX 수식이 렌더링되어 표시됨"
    - "문제집 미리보기에서 LaTeX 수식이 렌더링되어 표시됨"
    - "학생 홈 배너(CTA 카드)가 모바일에서 잘리지 않고 전체 표시됨"
  artifacts:
    - path: "apps/web/src/components/analytics/AIRecommendations.tsx"
      provides: "LatexPreview 사용한 문제 미리보기"
    - path: "apps/web/src/components/workbook/WorkbookCreator.tsx"
      provides: "LatexPreview 사용한 문제집 미리보기"
    - path: "apps/web/src/routes/student/index.tsx"
      provides: "배너 잘림 수정된 레이아웃"
  key_links:
    - from: "AIRecommendations.tsx"
      to: "LatexPreview"
      via: "import + JSX"
      pattern: "LatexPreview.*content"
    - from: "WorkbookCreator.tsx"
      to: "LatexPreview"
      via: "import + JSX"
      pattern: "LatexPreview.*content"
---

<objective>
LaTeX 수식이 raw 텍스트로 표시되는 2곳에 LatexPreview 컴포넌트를 적용하고,
학생 홈 화면 배너(CTA 카드)가 모바일에서 잘려 보이는 레이아웃 문제를 수정한다.

Purpose: 수학 문제 콘텐츠가 모든 UI에서 일관되게 렌더링되도록 보장 + 홈 배너 UX 개선
Output: 3개 파일 수정
</objective>

<execution_context>
@
@
</execution_context>

<context>
@apps/web/src/components/questions/LatexPreview.tsx
@apps/web/src/components/analytics/AIRecommendations.tsx
@apps/web/src/components/workbook/WorkbookCreator.tsx
@apps/web/src/routes/student/index.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: AI 추천 + 문제집 미리보기에 LatexPreview 적용</name>
  <files>
    apps/web/src/components/analytics/AIRecommendations.tsx
    apps/web/src/components/workbook/WorkbookCreator.tsx
  </files>
  <action>
**AIRecommendations.tsx:**
1. `import { LatexPreview } from '@/components/questions/LatexPreview'` 추가
2. line 71-74의 raw text 영역을 교체:
   ```
   // 변경 전:
   <p className="text-sm text-foreground line-clamp-1 mb-1.5">
     {question.content.slice(0, 40)}
     {question.content.length > 40 ? '...' : ''}
   </p>

   // 변경 후:
   <div className="text-sm text-foreground line-clamp-1 mb-1.5">
     <LatexPreview content={question.content.length > 60 ? question.content.slice(0, 60) + '...' : question.content} />
   </div>
   ```
   - `<p>` → `<div>`로 변경 (LatexPreview가 내부에 div를 렌더링하므로 p > div 중첩 방지)
   - 슬라이스 길이를 40 → 60으로 늘림 (LaTeX 마크업이 문자 수를 차지하므로 더 많은 텍스트 필요)

**WorkbookCreator.tsx:**
1. `import { LatexPreview } from '@/components/questions/LatexPreview'` 추가
2. line 311-314의 preview 단계 문제 목록 영역을 교체:
   ```
   // 변경 전:
   <p className="line-clamp-1">
     {index + 1}. {q.content.slice(0, 30)}
     {q.content.length > 30 ? '...' : ''}
   </p>

   // 변경 후:
   <div className="line-clamp-1 flex items-baseline gap-1">
     <span className="shrink-0">{index + 1}.</span>
     <LatexPreview
       content={q.content.length > 50 ? q.content.slice(0, 50) + '...' : q.content}
       className="inline text-sm"
     />
   </div>
   ```
   - 마찬가지로 `<p>` → `<div>` 변경
   - 슬라이스 길이 30 → 50 확대
  </action>
  <verify>
    `pnpm --filter web build` 빌드 성공 확인 (TypeScript 오류 없음)
  </verify>
  <done>
    AIRecommendations와 WorkbookCreator 미리보기에서 LaTeX 수식($...$, $$...$$)이 KaTeX로 렌더링됨
  </done>
</task>

<task type="auto">
  <name>Task 2: 학생 홈 배너 잘림 수정</name>
  <files>
    apps/web/src/routes/student/index.tsx
  </files>
  <action>
학생 홈 페이지의 배너 잘림 문제를 수정한다. 두 가지 잠재적 원인 모두 처리:

1. **Empty state 환영 히어로 카드 (line 142):**
   - `overflow-hidden` 제거 → `overflow-visible`로 변경 (또는 아예 overflow 클래스 제거)
   - 데코 서클은 `overflow-hidden`이 없으면 부모 밖으로 삐져나오므로, 데코 서클들을 감싸는 래퍼 div를 만들어 그 래퍼에만 `overflow-hidden rounded-2xl` 적용
   - 구체적: 히어로 카드 div 구조를 아래처럼 변경:
     ```tsx
     <div className="cta-gradient rounded-2xl text-white relative animate-fade-up stagger-2">
       {/* overflow-hidden 래퍼: 데코 서클만 클리핑 */}
       <div className="absolute inset-0 overflow-hidden rounded-2xl">
         <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-sm" />
         <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5" />
       </div>
       <div className="relative p-6 md:p-8">
         {/* 기존 내부 콘텐츠 (아이콘, 텍스트, 버튼들) 그대로 유지 */}
       </div>
     </div>
     ```
   - 핵심: 컨텐츠 영역에는 overflow-hidden이 적용되지 않아 텍스트/버튼이 잘리지 않음

2. **일반 상태 CTA 카드 (line 377):**
   - 동일한 패턴 적용: `overflow-hidden`을 데코 서클 래퍼에만 한정
   - ```tsx
     <div className="cta-gradient rounded-2xl text-white relative h-full flex flex-col">
       <div className="absolute inset-0 overflow-hidden rounded-2xl">
         <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10 blur-sm" />
         <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/5" />
       </div>
       <div className="relative p-5 md:p-6 flex-1 flex flex-col">
         {/* 기존 내부 콘텐츠 그대로 */}
       </div>
     </div>
     ```

주의: 내부 콘텐츠의 `relative` 클래스는 유지해야 데코 서클 위에 표시됨 (z-order).
  </action>
  <verify>
    `pnpm --filter web build` 빌드 성공 + 브라우저에서 `/student` 페이지 확인 가능
  </verify>
  <done>
    홈 화면 CTA 배너가 모바일/태블릿에서 잘리지 않고 텍스트와 버튼이 완전히 표시됨
  </done>
</task>

</tasks>

<verification>
1. `pnpm --filter web build` — TypeScript + Vite 빌드 통과
2. 브라우저에서 학생 홈(`/student`) 접속 → AI 추천 문제 LaTeX 렌더링 확인
3. 문제집 생성(`/student/workbooks/create`) → 미리보기 단계에서 LaTeX 렌더링 확인
4. 학생 홈 배너가 모바일 뷰포트에서 잘리지 않음 확인
</verification>

<success_criteria>
- LaTeX 수식($x^2$, $$\frac{a}{b}$$ 등)이 AI 추천 목록과 문제집 미리보기에서 KaTeX로 렌더링됨
- 학생 홈 배너 텍스트와 버튼이 어떤 화면 크기에서도 잘리지 않음
- 빌드 오류 없음
</success_criteria>

<output>
완료 후 `.planning/quick/5-latex/5-SUMMARY.md` 생성
</output>
