---
phase: quick-001
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/web/src/lib/seed-data.ts
  - apps/web/src/lib/db.ts
  - apps/web/src/components/questions/QuestionForm.tsx
  - apps/web/src/routes/student/index.tsx
autonomous: true
requirements: [SEED-01, SEED-02, SEED-03]
must_haves:
  truths:
    - "앱 첫 실행(DB 비어있을 때) 시 예제 수학 기출문제 20~30개가 자동으로 시딩된다"
    - "학생이 온보딩 퀴즈에서 시드 문제를 바로 풀 수 있다"
    - "강사 문제 등록 폼에서 필수 입력(문제/정답/해설/과목/난이도/단원/유형)이 상단에 노출되고 선택 입력(이미지/출처)은 접혀있다"
    - "학생 홈에서 등록된 문제가 있으면 바로 풀기 버튼으로 문제 목록 접근 가능하다"
  artifacts:
    - path: "apps/web/src/lib/seed-data.ts"
      provides: "수능/모의고사 스타일 시드 문제 25개 + seedIfEmpty 함수"
    - path: "apps/web/src/lib/db.ts"
      provides: "앱 시작 시 seedIfEmpty 호출"
    - path: "apps/web/src/components/questions/QuestionForm.tsx"
      provides: "필수/선택 입력 분리, 접기/펼치기 UI"
  key_links:
    - from: "apps/web/src/lib/db.ts"
      to: "apps/web/src/lib/seed-data.ts"
      via: "db.on('ready') 또는 db.open() 후 seedIfEmpty 호출"
      pattern: "seedIfEmpty.*db\\.questions"
---

<objective>
예제 수학 기출문제 시드 데이터 추가 + 강사 문제 등록 폼 간소화 + 학생 첫 진입 사용성 개선

Purpose: 앱 설치 직후 빈 화면이 아닌 실제 수학 문제를 바로 풀 수 있는 상태로 만들어 POC 시연과 사용자 경험을 극적으로 개선
Output: 시드 데이터 자동 삽입 + 폼 UX 개선
</objective>

<execution_context>
@/Users/danny/.claude/get-shit-done/workflows/execute-plan.md
@/Users/danny/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@apps/web/src/lib/db.ts
@apps/web/src/services/question.service.ts
@apps/web/src/components/questions/QuestionForm.tsx
@apps/web/src/routes/instructor/problems/new.tsx
@apps/web/src/routes/student/index.tsx
@apps/web/src/routes/student/onboarding-quiz/index.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: 수능/모의고사 스타일 시드 데이터 25문제 + 자동 시딩</name>
  <files>apps/web/src/lib/seed-data.ts, apps/web/src/lib/db.ts</files>
  <action>
1. `apps/web/src/lib/seed-data.ts` 파일 생성:
   - `SEED_QUESTIONS` 배열: 25개 수능/모의고사 스타일 수학 기출문제
   - 과목별 분포: 수학I(5), 수학II(5), 미적분(5), 확률과통계(5), 기하(5)
   - 각 과목 내 다양한 단원/유형 커버 (단원명과 유형명은 실제 교육과정 기반)
   - 난이도 분포: 1~5 골고루 (각 난이도 약 5개)
   - 문제 유형: 객관식 20개 + 단답형 5개
   - 출처: 수능(10) + 모의고사(10) + 교육청(5), sourceYear 2020~2024 범위
   - content에 LaTeX 수식 포함 (`$...$`, `$$...$$` 패턴). 실제 수능 스타일 문장:
     예) "함수 $f(x) = x^3 - 3x^2 + 2$에 대하여 $f'(1)$의 값은?"
   - explanation에도 LaTeX 포함한 풀이 과정
   - answer: 객관식은 '1'~'5' 중 하나, 단답형은 숫자 문자열
   - imageDataUrl, explanationImageDataUrl은 undefined (시드 데이터에 이미지 불필요)
   - createdBy: 'system@seed' (시드 데이터 식별자)

2. `seedIfEmpty` 함수 export:
   ```typescript
   export async function seedIfEmpty(): Promise<void> {
     const count = await db.questions.count()
     if (count > 0) return  // 이미 문제 있으면 시딩 안 함
     const now = Date.now()
     const questions = SEED_QUESTIONS.map((q, i) => ({
       ...q,
       createdAt: now - i * 60000,  // 각 문제 1분 간격 (정렬용)
       updatedAt: now - i * 60000,
     }))
     await db.questions.bulkAdd(questions as any[])
   }
   ```

3. `apps/web/src/lib/db.ts` 수정:
   - 파일 하단, `export { db }` 직전에 `seedIfEmpty` import 및 호출 추가
   - `db.on('ready')` 이벤트 핸들러 사용:
     ```typescript
     import { seedIfEmpty } from './seed-data'
     db.on('ready', () => seedIfEmpty())
     ```
   - 기존 코드(version 선언, 인터페이스 등)는 절대 변경하지 말 것

주의사항:
- seed-data.ts에서 db를 import할 때 순환 참조 방지: seed-data.ts는 db.ts에서 db를 import, db.ts는 seed-data.ts에서 seedIfEmpty를 import. Dexie db.on('ready')는 open 시점에 실행되므로 순환 참조 문제 없음 (런타임에는 이미 모든 모듈 로드 완료).
- SEED_QUESTIONS 배열의 각 항목은 Question 인터페이스에서 id, createdAt, updatedAt을 제외한 모든 필드 포함
- 시드 문제의 수학적 정확성 보장: 정답과 해설이 문제에 대해 올바른 답이어야 함
  </action>
  <verify>
1. `cd /Users/danny/Documents/PARA/Projects/ai-agents/textbook-learning-assistant && pnpm --filter web build` 빌드 성공
2. 브라우저에서 IndexedDB를 삭제(DevTools > Application > IndexedDB > mathQuestionDB 삭제) 후 앱 새로고침 시 문제 목록에 25개 문제 표시 확인
3. seed-data.ts TypeScript 컴파일 오류 없음
  </verify>
  <done>앱 첫 실행 시 (또는 DB 비어있을 때) 과목별 5개씩 총 25개 수학 기출문제가 자동 시딩되어 학생/강사 모두 즉시 문제 확인 가능</done>
</task>

<task type="auto">
  <name>Task 2: 강사 문제 등록 폼 간소화 — 필수/선택 분리 + 접기</name>
  <files>apps/web/src/components/questions/QuestionForm.tsx</files>
  <action>
QuestionForm.tsx를 다음과 같이 리팩터링:

1. **필수 입력 영역 (항상 노출):**
   - 문제 유형 (questionType)
   - 문제 내용 (content) — LatexEditor
   - 정답 (answer)
   - 해설 (explanation) — LatexEditor
   - 과목 (subject)
   - 난이도 (difficulty)
   - 단원 (unit)
   - 유형 (questionCategory)

2. **선택 입력 영역 (접기/펼치기):**
   - `useState`로 `isOptionalOpen` 상태 관리 (기본값: false)
   - 접기 토글 버튼: `<button type="button">` (form submit 방지) + ChevronDown/ChevronUp 아이콘
   - 접힌 상태에서 "선택 입력 (이미지, 출처)" 라벨 표시
   - 펼치면: 문제 이미지, 해설 이미지, 출처 정보(시험 종류/연도/번호) 노출
   - 순수 CSS(Tailwind `hidden`/블록 전환)로 구현 — shadcn Collapsible 컴포넌트 미설치이므로 직접 구현

3. **폼 레이아웃 개선:**
   - 필수 영역 상단에 "필수 입력" 소제목 (text-sm font-medium text-muted-foreground)
   - 선택 영역에 점선 border-dashed 구분선
   - 메타데이터 그리드(과목/난이도/단원/유형)를 문제 내용+정답 바로 아래로 이동 (현재 하단 → 중간 위치)

4. **기존 zod 스키마, defaultValues, handleSubmit 로직은 절대 변경하지 말 것**
   - 폼 필드 자체는 동일, 배치만 변경
   - 접힌 상태에서도 form state는 유지 (DOM에서 hidden일 뿐 unmount 아님)

구현 패턴:
```tsx
const [isOptionalOpen, setIsOptionalOpen] = useState(false)

// 선택 입력 영역
<div className="border-t border-dashed pt-4 mt-4">
  <button
    type="button"
    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full"
    onClick={() => setIsOptionalOpen(!isOptionalOpen)}
  >
    {isOptionalOpen ? <ChevronUp /> : <ChevronDown />}
    선택 입력 (이미지, 출처)
  </button>
  <div className={isOptionalOpen ? 'mt-4 space-y-6' : 'hidden'}>
    {/* 이미지 + 출처 필드들 */}
  </div>
</div>
```

lucide-react에서 ChevronDown, ChevronUp import 추가.
  </action>
  <verify>
1. `cd /Users/danny/Documents/PARA/Projects/ai-agents/textbook-learning-assistant && pnpm --filter web build` 빌드 성공
2. /instructor/problems/new 페이지에서:
   - 필수 필드가 상단에 노출
   - "선택 입력" 토글 클릭 시 이미지/출처 영역 접기/펼치기 동작
   - 접힌 상태에서 폼 제출 시 정상 동작 (선택 필드 값 유지)
3. /instructor/problems/:id/edit 편집 페이지에서도 동일 동작 확인 (QuestionForm 공유)
  </verify>
  <done>강사 문제 등록 폼이 필수 입력 8개 필드는 항상 노출, 선택 입력(이미지 2개 + 출처 3개)은 접기/펼치기로 간소화되어 첫 인상이 덜 부담스러움</done>
</task>

<task type="auto">
  <name>Task 3: 학생 홈 빈 상태 UX — 시드 문제 바로 풀기 유도</name>
  <files>apps/web/src/routes/student/index.tsx</files>
  <action>
학생 홈 페이지(StudentHomePage)에서 "문제 풀기" 카드 섹션을 개선:

1. **현재 문제 수 표시 추가:**
   - useLiveQuery로 `db.questions.count()` 조회
   - "문제 풀기" 카드의 설명 텍스트를 동적으로 변경:
     - 문제 있을 때: "등록된 {count}개의 문제를 풀고 실력을 향상시켜 보세요."
     - 문제 없을 때: "아직 등록된 문제가 없습니다." (이 경우는 시드 데이터가 있으므로 거의 발생 안 함)

2. **빠른 풀기 버튼 추가:**
   - "문제 목록 보기" 버튼 아래에 "랜덤 문제 풀기" 버튼(variant="outline") 추가
   - 클릭 시 db.questions에서 무작위 1개 선택 → `/student/quiz/{id}` 로 이동
   - 구현: `async function handleRandomQuiz()` — db.questions.toArray() 후 Math.random으로 1개 선택, navigate
   - 문제 없으면 버튼 비활성화(disabled)

3. **AI 추천 문제 빈 상태 개선:**
   - 현재 추천 문제 0개일 때 AIRecommendations 컴포넌트가 빈 배열 렌더
   - 추천 문제가 없고 attemptCount(총 풀이 수)가 0인 경우:
     "아직 풀이 기록이 없습니다. 문제를 풀면 AI가 맞춤 문제를 추천해 드려요!" 안내 메시지 표시
   - 이 분기를 AIRecommendations 컴포넌트 대신 StudentHomePage에서 직접 처리 (recommendedQuestions 빈 배열 + attemptCount === 0 조건)

기존 코드 주의사항:
- 온보딩 퀴즈 리디렉트 로직(userSetting === null || !isDiagnosisCompleted → Navigate)은 절대 변경 금지
- useLiveQuery 패턴 유지: todayCount, attemptCount 등 기존 훅 그대로
- navigate import 추가 필요: `import { Link, Navigate, useNavigate } from 'react-router'`
  </action>
  <verify>
1. `cd /Users/danny/Documents/PARA/Projects/ai-agents/textbook-learning-assistant && pnpm --filter web build` 빌드 성공
2. 학생 홈에서 "랜덤 문제 풀기" 버튼 클릭 시 퀴즈 페이지로 이동
3. 학생 홈에서 문제 수가 "등록된 25개의 문제를 풀고..." 형태로 표시
4. 첫 진입(풀이 기록 0건) 시 AI 추천 영역에 안내 메시지 표시
  </verify>
  <done>학생 홈에서 시드 문제 존재 시 즉시 풀기 가능한 동선 제공 + 빈 상태 안내 메시지로 첫 사용자 경험 개선</done>
</task>

</tasks>

<verification>
1. `pnpm --filter web build` 전체 빌드 성공 (TypeScript + Vite)
2. 브라우저 IndexedDB 삭제 후 앱 접근 시 문제 25개 자동 시딩 확인
3. 강사 문제 등록 폼 접기/펼치기 동작 + 폼 제출 정상
4. 학생 홈 랜덤 풀기 + 문제 수 표시 + 빈 상태 안내
</verification>

<success_criteria>
- 앱 첫 실행 시 25개 수학 기출 시드 문제 자동 삽입
- 강사 문제 등록 폼 필수/선택 분리 + 접기
- 학생 홈에서 바로 풀기 동선 제공
- TypeScript 빌드 오류 없음
</success_criteria>

<output>
After completion, create `.planning/quick/001-seed-data-ux-improvements/001-SUMMARY.md`
</output>
