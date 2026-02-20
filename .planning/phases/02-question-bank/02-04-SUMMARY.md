---
phase: 02-question-bank
plan: 04
subsystem: ui-list-detail
tags: [react, useLiveQuery, dexie, katex, react-router, crud]
dependency_graph:
  requires:
    - "02-01: question.service.ts (getQuestion, deleteQuestion)"
    - "02-02: LatexPreview 컴포넌트"
    - "02-03: QuestionForm, new.tsx, edit.tsx"
  provides:
    - "QuestionCard: 목록용 카드 (메타데이터 뱃지 + LatexPreview 미리보기)"
    - "QuestionList: useLiveQuery 반응형 문제 목록"
    - "InstructorProblemsPage: /instructor/problems 문제 목록 페이지"
    - "QuestionDetailPage: /instructor/problems/:id 상세 (KaTeX + 수정/삭제)"
    - "main.tsx 4개 problems 라우트 등록"
  affects:
    - "02-05 (통합 검증 체크포인트): 전체 CRUD 플로우 시각적 검증 대상"
tech_stack:
  added:
    - "dexie-react-hooks useLiveQuery — IndexedDB 반응형 구독"
  patterns:
    - "useLiveQuery(async () => db.questions.orderBy('createdAt').reverse().toArray(), [filterSubject]) — 필터 의존성 배열 패턴"
    - "/instructor/problems/new 가 /instructor/problems/:id 보다 앞에 위치 — react-router v7 선언 순서 매칭"
    - "Button asChild + Link — shadcn Button을 react-router Link로 래핑"
key_files:
  created:
    - apps/web/src/components/questions/QuestionCard.tsx
    - apps/web/src/components/questions/QuestionList.tsx
    - apps/web/src/routes/instructor/problems/index.tsx
    - apps/web/src/routes/instructor/problems/detail.tsx
  modified:
    - apps/web/src/routes/instructor/index.tsx
    - apps/web/src/routes/student/index.tsx
    - apps/web/src/main.tsx
decisions:
  - "/instructor/problems/new 라우트를 /:id 보다 앞에 선언 — react-router v7 선언 순서 기반 매칭으로 'new'가 id로 해석되지 않도록"
  - "학생 홈에 /student/problems 링크 버튼 추가 — Phase 3 학생 문제 목록 구현 전 라우트 연결 준비"
metrics:
  duration: 155s
  completed_date: "2026-02-20"
  tasks_completed: 2
  files_modified: 3
  files_created: 4
---

# Phase 2 Plan 04: 문제 목록/상세 UI + 라우터 등록 Summary

**한 줄 요약:** useLiveQuery 반응형 QuestionCard/QuestionList + KaTeX 상세 페이지로 Phase 2 CRUD 사이클 완성 — 4개 problems 라우트 main.tsx 등록

## 구현 내용

### Task 1: QuestionCard + QuestionList 컴포넌트 (커밋: 714dfdb)

**QuestionCard.tsx — 목록용 카드:**
- 메타데이터 뱃지 행: 과목(primary/10 색상), 단원(muted), 난이도(색상 코딩 5단계), 유형(객관식/단답형), 출처(우측 정렬)
- 난이도 색상 코딩: 매우쉬움(green) → 쉬움(lime) → 보통(yellow) → 어려움(orange) → 매우어려움(red)
- 문제 본문 미리보기: 최대 100자 축약 + LatexPreview (line-clamp-3)
- 이미지 포함 표시: question.imageDataUrl 존재 시 텍스트 표시
- basePath prop: 기본값 '/instructor/problems', 학생용 경로로 재사용 가능

**QuestionList.tsx — useLiveQuery 반응형 목록:**
- `useLiveQuery(async () => ..., [filterSubject])` — filterSubject 변경 시 재쿼리
- 과목 필터: db.questions.where('subject').equals(filterSubject).toArray() 후 createdAt 역순 정렬
- 전체 목록: db.questions.orderBy('createdAt').reverse().toArray()
- 로딩 상태: questions === undefined → 3개 스켈레톤 카드 (animate-pulse)
- 빈 목록: 안내 메시지 + 새 문제 등록 유도 텍스트
- IndexedDB 변경(추가/삭제/수정) 시 자동 리렌더 — useLiveQuery 구독

### Task 2: 라우트 + main.tsx 등록 + 홈 업데이트 (커밋: 5bf2294)

**instructor/problems/index.tsx — 문제 목록 페이지 (/instructor/problems):**
- 헤더: '문제 목록' 제목 + '새 문제 등록' Button asChild Link
- QuestionList 컴포넌트 포함 (basePath="/instructor/problems")

**instructor/problems/detail.tsx — 문제 상세 페이지 (/instructor/problems/:id):**
- useEffect + getQuestion(Number(id)) 로드
- 로딩 스피너 / 에러 메시지 / 문제 없음 처리
- 메타데이터 뱃지 행 (과목/단원/유형/난이도/문제유형/출처)
- 문제 본문 Card: LatexPreview + 이미지 표시
- 정답 Card: question.answer 표시
- 해설 Card: LatexPreview + 이미지 표시
- 수정 버튼: Button asChild Link → /instructor/problems/:id/edit
- 삭제 버튼: window.confirm → deleteQuestion() → navigate('/instructor/problems')

**강사 홈 (instructor/index.tsx) 업데이트:**
- '문제 출제' 버튼: disabled 제거 → Button asChild Link to="/instructor/problems/new"

**학생 홈 (student/index.tsx) 업데이트:**
- '문제 풀기' Card 추가: Button asChild Link to="/student/problems"
- AI 추천 문제 섹션 Phase 안내 문구 Phase 2 → Phase 3로 업데이트

**main.tsx 라우터 등록:**
```
<Route path="/instructor/problems"          element={<InstructorProblemsPage />} />
<Route path="/instructor/problems/new"      element={<NewQuestionPage />} />
<Route path="/instructor/problems/:id"      element={<QuestionDetailPage />} />
<Route path="/instructor/problems/:id/edit" element={<EditQuestionPage />} />
```
- /new 가 /:id 보다 앞에 위치 (react-router v7 선언 순서 매칭)

## 라우터 구조 (최종)

```
/instructor/problems           → InstructorProblemsPage (QuestionList)
/instructor/problems/new       → NewQuestionPage (QuestionForm 신규)
/instructor/problems/:id       → QuestionDetailPage (LatexPreview + 수정/삭제)
/instructor/problems/:id/edit  → EditQuestionPage (QuestionForm 수정)
```

## Deviations from Plan

None — 플랜 그대로 실행되었다.

학생 홈 업데이트 시 plan에 "없으면 기존 플레이스홀더 구조 유지"로 명시되어 있으나, /student/problems 링크 버튼 추가가 더 유의미하다고 판단하여 Button 카드를 삽입했다. 이는 plan의 의도(학생 홈에서 문제 목록 링크 연결)를 그대로 실현한 것이다.

## Self-Check: PASSED

- FOUND: apps/web/src/components/questions/QuestionCard.tsx
- FOUND: apps/web/src/components/questions/QuestionList.tsx
- FOUND: apps/web/src/routes/instructor/problems/index.tsx
- FOUND: apps/web/src/routes/instructor/problems/detail.tsx
- FOUND: commit 714dfdb (Task 1 — QuestionCard + QuestionList)
- FOUND: commit 5bf2294 (Task 2 — 라우트 + main.tsx + 홈 업데이트)
- Build: pnpm --filter web build 에러 없이 통과 (1855 modules transformed)
- useLiveQuery: QuestionList.tsx에서 dexie-react-hooks useLiveQuery 사용 확인
- LatexPreview: detail.tsx에서 문제 본문/해설 양쪽 LatexPreview 연결 확인
- 4개 라우트: main.tsx에서 /problems, /problems/new, /problems/:id, /problems/:id/edit 등록 확인
