---
phase: quick
plan: 3
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/web/src/routes/student/profile/index.tsx
  - apps/web/src/routes/instructor/profile/index.tsx
autonomous: true
requirements: [QUICK-003]
must_haves:
  truths:
    - "마이페이지 래퍼 패딩이 반응형으로 적용된다 (p-4 md:p-6 lg:p-8)"
    - "마이페이지 최대 너비가 max-w-3xl로 적절한 폼 레이아웃을 유지한다"
    - "마이페이지 수직 간격이 다른 페이지와 동일한 space-y-5를 사용한다"
  artifacts:
    - path: "apps/web/src/routes/student/profile/index.tsx"
      provides: "학생 마이페이지 일관된 래퍼 레이아웃"
      contains: "p-4 md:p-6 lg:p-8 max-w-3xl mx-auto space-y-5"
    - path: "apps/web/src/routes/instructor/profile/index.tsx"
      provides: "강사 마이페이지 일관된 래퍼 레이아웃"
      contains: "p-4 md:p-6 lg:p-8 max-w-3xl mx-auto space-y-5"
  key_links: []
---

<objective>
마이페이지(학생/강사) 루트 래퍼 className을 다른 페이지들과 일관되게 수정

Purpose: 마이페이지만 좁고(672px) 비반응형 패딩이라 다른 페이지와 시각적 불일치 발생 — 통일된 레이아웃 경험 제공
Output: 두 파일의 래퍼 className 수정
</objective>

<execution_context>
@
@
</execution_context>

<context>
@.planning/STATE.md

프로젝트 레이아웃 패턴 (다른 페이지):
- 홈, 분석 등: `p-4 md:p-6 lg:p-8 max-w-6xl mx-auto space-y-5`
- 프로필/설정은 폼 기반이므로 max-w-3xl이 적절 (6xl까지 넓힐 필요 없지만 2xl은 너무 좁음)

현재 마이페이지 래퍼:
- `max-w-2xl mx-auto px-4 py-6 space-y-6` (비반응형 패딩, 너무 좁은 너비, 다른 간격)
</context>

<tasks>

<task type="auto">
  <name>Task 1: 학생/강사 마이페이지 래퍼 className 통일</name>
  <files>
    apps/web/src/routes/student/profile/index.tsx
    apps/web/src/routes/instructor/profile/index.tsx
  </files>
  <action>
    두 파일의 루트 래퍼 div className을 동일하게 수정:

    변경 전: `max-w-2xl mx-auto px-4 py-6 space-y-6`
    변경 후: `p-4 md:p-6 lg:p-8 max-w-3xl mx-auto space-y-5`

    수정 위치:
    - student/profile/index.tsx: line 87의 div className
    - instructor/profile/index.tsx: line 91의 div className

    변경 이유:
    1. `px-4 py-6` → `p-4 md:p-6 lg:p-8`: 반응형 패딩 적용 (다른 페이지 패턴)
    2. `max-w-2xl`(672px) → `max-w-3xl`(768px): 폼 콘텐츠에 적절한 너비 (6xl은 과도)
    3. `space-y-6` → `space-y-5`: 다른 페이지와 동일한 수직 간격

    주의: className 외 다른 코드는 절대 수정하지 않는다.
  </action>
  <verify>
    pnpm --filter web build 성공 확인
  </verify>
  <done>
    두 마이페이지 파일의 루트 래퍼가 `p-4 md:p-6 lg:p-8 max-w-3xl mx-auto space-y-5`로 통일됨
  </done>
</task>

</tasks>

<verification>
- pnpm --filter web build 성공
- student/profile/index.tsx에 `p-4 md:p-6 lg:p-8 max-w-3xl mx-auto space-y-5` 존재
- instructor/profile/index.tsx에 `p-4 md:p-6 lg:p-8 max-w-3xl mx-auto space-y-5` 존재
</verification>

<success_criteria>
학생/강사 마이페이지 래퍼가 다른 페이지와 일관된 반응형 패딩(p-4/md:p-6/lg:p-8), 적절한 최대 너비(max-w-3xl), 동일한 수직 간격(space-y-5)을 사용한다.
</success_criteria>

<output>
완료 후 `.planning/quick/3-fitting/3-SUMMARY.md` 생성
</output>
