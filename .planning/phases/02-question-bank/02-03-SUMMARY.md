---
phase: 02-question-bank
plan: 03
subsystem: ui-forms
tags: [react-hook-form, zod, shadcn, form, instructor, CRUD]
dependency_graph:
  requires:
    - "02-01: question.service.ts (createQuestion, updateQuestion, getQuestion)"
    - "02-02: LatexEditor, ImageUpload 컴포넌트"
  provides:
    - "QuestionForm: react-hook-form + zod 문제 등록/수정 공유 폼 컴포넌트"
    - "new.tsx: /instructor/problems/new 문제 등록 페이지"
    - "edit.tsx: /instructor/problems/:id/edit 문제 수정 페이지"
  affects:
    - "02-04 (문제 목록/상세): edit 페이지로의 네비게이션 링크"
tech_stack:
  added:
    - "shadcn form 컴포넌트 — react-hook-form Context + FormField/FormItem/FormLabel/FormControl/FormMessage"
    - "shadcn select 컴포넌트 — Select/SelectTrigger/SelectContent/SelectItem"
    - "shadcn badge 컴포넌트 (설치 완료, 추후 Plan 04에서 사용)"
    - "shadcn separator 컴포넌트 (설치 완료, 추후 사용)"
  patterns:
    - "zodResolver 연결 — useForm({ resolver: zodResolver(questionSchema) })"
    - "z.coerce.number().optional().or(z.literal('')) — 숫자 필드 빈 문자열 처리"
    - "form.watch() — 조건부 필드 표시 (sourceType !== '기타' 시 연도/번호 숨김)"
    - "Question → QuestionFormData 변환 — source.year/number undefined → '' 처리"
key_files:
  created:
    - apps/web/src/components/questions/QuestionForm.tsx
    - apps/web/src/routes/instructor/problems/new.tsx
    - apps/web/src/routes/instructor/problems/edit.tsx
    - apps/web/src/components/ui/form.tsx
    - apps/web/src/components/ui/select.tsx
    - apps/web/src/components/ui/badge.tsx
    - apps/web/src/components/ui/separator.tsx
  modified: []
decisions:
  - "z.coerce.number().optional().or(z.literal('')) — HTML input[type=number]의 빈 값이 '' 문자열로 오는 문제 해결"
  - "sourceYear/sourceNumber: Question 저장 시 data.sourceYear ? Number(data.sourceYear) : undefined 변환 적용"
  - "edit.tsx defaultValues: question.source.year ?? '' 방식으로 undefined → '' 변환하여 controlled input 유지"
metrics:
  duration: 158s
  completed_date: "2026-02-20"
  tasks_completed: 2
  files_modified: 0
  files_created: 7
---

# Phase 2 Plan 03: 문제 등록/수정 폼 UI Summary

**한 줄 요약:** react-hook-form + zod + shadcn Form으로 LaTeX/이미지 포함 수학 문제 등록·수정 폼 UI 구현 — QuestionForm 공유 컴포넌트, new/edit 페이지 포함

## 구현 내용

### Task 1: QuestionForm 컴포넌트 (커밋: 6e485d8)

**shadcn 컴포넌트 설치:**
- `form` — react-hook-form Context 기반 FormField/FormItem/FormLabel/FormControl/FormMessage
- `select` — Select/SelectTrigger/SelectContent/SelectItem (과목, 난이도, 문제유형, 출처 선택)
- `badge` — 추후 Plan 04(목록 페이지) 메타데이터 표시용
- `separator` — 추후 UI 구분선용

**questionSchema (zod):**
- `content`: min(5) — '문제 내용은 5자 이상이어야 합니다'
- `answer`: min(1) — '정답을 입력하세요'
- `questionType`: enum(['multiple', 'short'])
- `subject`: enum(['수학I', '수학II', '미적분', '확률과통계', '기하'])
- `unit`: min(1) — '단원을 입력하세요'
- `questionCategory`: min(1) — '유형을 입력하세요'
- `difficulty`: z.coerce.number().int().min(1).max(5)
- `explanation`: min(1) — '해설을 입력하세요'
- `sourceType`: enum(['수능', '모의고사', '교육청', '기타'])
- `sourceYear`: z.coerce.number().int().min(2000).max(2035).optional().or(z.literal(''))
- `sourceNumber`: z.coerce.number().int().min(1).max(50).optional().or(z.literal(''))
- `imageDataUrl`, `explanationImageDataUrl`: optional string

**QuestionForm 컴포넌트 구조:**
- 문제 유형 Select (multiple/short)
- LatexEditor — 문제 본문 (minHeight="min-h-40")
- ImageUpload — 문제 이미지 (선택)
- 정답 Input — questionType 기반 힌트 텍스트 동적 변경
- LatexEditor — 해설 (minHeight="min-h-32")
- ImageUpload — 해설 이미지 (선택)
- 메타데이터 그리드: 과목 Select, 난이도 Select, 단원 Input, 유형 Input
- 출처 정보 박스: 시험종류 Select, 연도/번호 Input (sourceType='기타' 시 숨김)
- 제출 버튼 (isLoading 시 '저장 중...' 표시)

### Task 2: 문제 등록/수정 페이지 (커밋: 9f7c3ff)

**new.tsx — 문제 등록 페이지 (/instructor/problems/new):**
- useAuth().user.email을 createdBy로 전달
- QuestionForm onSubmit → createQuestion() 호출
- 성공 시 navigate('/instructor/problems') 이동
- 에러 시 한국어 메시지 표시

**edit.tsx — 문제 수정 페이지 (/instructor/problems/:id/edit):**
- useParams id → getQuestion(Number(id)) 로드
- isFetching 중 스피너 표시
- 문제 없음 시 에러 메시지 + 목록으로 버튼
- Question → QuestionFormData 변환 (source.year ?? '', source.number ?? '')
- QuestionForm defaultValues 주입
- onSubmit → updateQuestion(Number(id), ...) 호출
- 성공 시 navigate('/instructor/problems/:id') 이동

## Deviations from Plan

None — 플랜 그대로 실행되었다.

shadcn form/select/badge/separator 설치는 Plan에 명시된 의도된 첫 단계이며 편차가 아니다.

## Self-Check: PASSED

- FOUND: apps/web/src/components/questions/QuestionForm.tsx
- FOUND: apps/web/src/routes/instructor/problems/new.tsx
- FOUND: apps/web/src/routes/instructor/problems/edit.tsx
- FOUND: apps/web/src/components/ui/form.tsx
- FOUND: apps/web/src/components/ui/select.tsx
- FOUND: commit 6e485d8 (Task 1 — QuestionForm)
- FOUND: commit 9f7c3ff (Task 2 — new.tsx + edit.tsx)
- Build: pnpm --filter web build 에러 없이 통과 (1766 modules transformed)
- zodResolver 연결: QuestionForm에 zodResolver(questionSchema) 적용 확인
- 한국어 오류 메시지: content/answer/unit/questionCategory/explanation 5개 필드 확인
