---
phase: quick-004
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/web/src/routes/student/index.tsx
autonomous: true
requirements: [QUICK-004]
must_haves:
  truths:
    - "학생이 최초 진입 시(attemptCount === 0, questionCount === 0) 환영 메시지와 학습 시작 안내가 보인다"
    - "데이터가 없어도 빈 화면이 아닌 의미 있는 UI가 표시된다"
    - "문제가 있지만 풀이 이력이 없는 경우에도 적절한 안내가 표시된다"
    - "기존 데이터가 있는 사용자에게는 현재 대시보드가 그대로 동작한다"
  artifacts:
    - path: "apps/web/src/routes/student/index.tsx"
      provides: "학생 홈 empty state UI"
      contains: "EmptyStateHome"
  key_links:
    - from: "apps/web/src/routes/student/index.tsx"
      to: "attemptCount, questionCount"
      via: "조건 분기"
      pattern: "attemptCount.*===.*0"
---

<objective>
학생 홈 화면 최초 진입 시 빈 화면(모든 통계 0, AI 추천 없음) 대신 환영 메시지, 학습 시작 안내, 빈 상태(empty state) UI를 표시하여 사용자가 이슈로 느끼지 않도록 개선한다.

Purpose: 신규 학생이 앱에 처음 들어왔을 때 "고장났나?" 느낌 대신 따뜻한 환영과 다음 행동 가이드를 제공
Output: 학생 홈 페이지에 empty state 분기 UI 추가
</objective>

<execution_context>
@
@
</execution_context>

<context>
@apps/web/src/routes/student/index.tsx
@apps/web/src/routes/instructor/index.tsx (참고: 강사 홈 empty state 패턴)
</context>

<tasks>

<task type="auto">
  <name>Task 1: 학생 홈 empty state UI 추가</name>
  <files>apps/web/src/routes/student/index.tsx</files>
  <action>
StudentHomePage 컴포넌트 내부, 기존 대시보드 렌더링 전에 empty state 분기를 추가한다.

**조건 분기 로직:**
- `attemptCount === 0` (한 번도 문제를 풀지 않은 상태)일 때 empty state 화면을 표시
- `attemptCount > 0`이면 기존 대시보드를 그대로 표시 (변경 없음)

**Empty State UI 구성 (attemptCount === 0일 때):**

1. **인사 영역** — 기존 인사 코드 재사용 (greeting + userName). 변경 없음.

2. **환영 히어로 카드** — 기존 통계 카드 4개 + CTA + AI 추천 영역을 대체:
   - 큰 아이콘 (BookOpenCheck 또는 Sparkles, w-16 h-16, bg-primary/10 rounded-3xl)
   - 제목: "학습을 시작해 볼까요?" (text-xl font-bold)
   - 부제: "문제를 풀면 AI가 취약점을 분석하고 맞춤 추천을 해드려요." (text-sm text-muted-foreground)
   - 기출탭탭 교육 앱 느낌의 파란색 계열 그라데이션 배경 (cta-gradient 클래스 재사용)

3. **행동 유도 버튼들:**
   - questionCount > 0일 때:
     - "문제 풀러 가기" 버튼 (primary, Link to /student/problems) — 메인 CTA
     - "랜덤 문제 풀기" 버튼 (ghost/outline, handleRandomQuiz 호출)
   - questionCount === 0일 때:
     - "반 참여하기" 버튼 (primary, Link to /student/join-group) — 강사에게 문제 받기
     - 안내 텍스트: "강사님이 등록한 문제가 있어야 학습을 시작할 수 있어요."

4. **안내 스텝 카드들** — 3개의 작은 카드로 앱 사용법 안내:
   - 스텝 1: "문제 풀기" — BookOpenCheck 아이콘, "다양한 수학 기출문제를 풀어보세요"
   - 스텝 2: "AI 분석" — Sparkles 아이콘, "AI가 취약 유형을 자동 분석해요"
   - 스텝 3: "맞춤 추천" — Target 아이콘, "약점 보완 문제를 추천받으세요"
   - 각 카드: Card 컴포넌트, rounded-2xl, 아이콘 + 제목 + 설명 구조
   - 그리드: grid grid-cols-1 md:grid-cols-3 gap-3

**구현 방식:**
- 기존 return 문의 대시보드 JSX를 그대로 유지
- `attemptCount === 0` 조건을 userSetting null 체크와 onboarding 리디렉트 뒤, 메인 return 앞에 early return으로 추가
- 인사 영역 코드는 중복 렌더링 (empty state에서도 동일한 인사말 표시)
- animate-fade-up, animate-scale-in 등 기존 애니메이션 클래스 동일하게 적용
- 다크모드 호환: bg-white dark:bg-card 패턴 유지

**주의사항:**
- attemptCount는 useLiveQuery로 가져오므로 undefined(로딩 중)일 때는 분기하지 않음 — 기존 스켈레톤이 처리
- questionCount는 이미 존재하는 변수 재사용
- handleRandomQuiz 함수는 기존 것 그대로 사용
- greeting, userName 변수는 기존 것 그대로 사용
  </action>
  <verify>
pnpm --filter web build 2>&1 | tail -5 — 빌드 성공 확인
그리고 수동 확인: 새 학생 계정으로 로그인 시 환영 UI 표시, 기존 학생은 대시보드 정상 표시
  </verify>
  <done>
- attemptCount === 0인 학생이 홈 진입 시 환영 메시지 + 학습 시작 안내 + 3단계 스텝 카드가 표시됨
- questionCount에 따라 적절한 CTA 버튼이 표시됨 (문제 있으면 "풀러 가기", 없으면 "반 참여하기")
- attemptCount > 0인 학생은 기존 대시보드가 변경 없이 동작함
- 빌드 에러 없음
  </done>
</task>

</tasks>

<verification>
- pnpm --filter web build 성공
- 학생 홈 empty state가 데이터 없을 때 정상 렌더링
- 기존 대시보드가 데이터 있을 때 정상 유지
</verification>

<success_criteria>
신규 학생이 홈 화면 진입 시 "빈 화면"이 아닌 환영 메시지와 행동 안내를 보게 되며, 기존 사용자 경험에는 영향이 없다.
</success_criteria>

<output>
After completion, create `.planning/quick/4-ui/4-SUMMARY.md`
</output>
