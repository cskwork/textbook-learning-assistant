---
phase: quick-001
plan: 01
subsystem: web-frontend
tags: [seed-data, ux, question-form, student-home, indexeddb]
dependency_graph:
  requires: [dexie, react-router, lucide-react]
  provides: [시드 데이터 자동 시딩, 폼 UX 개선, 학생 홈 빠른 풀기]
  affects: [apps/web/src/lib/db.ts, apps/web/src/lib/seed-data.ts, apps/web/src/components/questions/QuestionForm.tsx, apps/web/src/routes/student/index.tsx]
tech_stack:
  added: []
  patterns: [Dexie db.on('ready') 시딩 패턴, CSS hidden/block 접기 토글, useLiveQuery 실시간 카운트]
key_files:
  created: [apps/web/src/lib/seed-data.ts]
  modified:
    - apps/web/src/lib/db.ts
    - apps/web/src/components/questions/QuestionForm.tsx
    - apps/web/src/routes/student/index.tsx
decisions:
  - "db.on('ready') 핸들러에서 seedIfEmpty 호출 — 앱 시작 시 DB open 완료 후 자동 시딩, 순환 참조 없음"
  - "CSS hidden 전환으로 선택 입력 접기 — shadcn Collapsible 미사용, DOM 유지로 form state 보존"
  - "questionCount useLiveQuery — 시드 포함 전체 문제 수 실시간 반영"
metrics:
  duration: 269s
  completed_date: "2026-02-20"
  tasks_completed: 3
  files_modified: 4
---

# Quick 001: 시드 데이터 + UX 개선 Summary

**한 줄 요약:** DB 첫 실행 시 수능/모의고사 스타일 수학 기출문제 25개 자동 시딩 + 강사 폼 필수/선택 분리 + 학생 홈 바로 풀기 동선 추가

## 목적

POC 시연 및 신규 사용자 경험 개선: 앱 설치 직후 빈 화면 없이 즉시 수학 문제를 풀 수 있는 상태 제공

## 완료된 Tasks

| Task | 이름 | 커밋 | 주요 파일 |
|------|------|------|-----------|
| 1 | 시드 데이터 25문제 + 자동 시딩 | `9bf96de` | seed-data.ts (신규), db.ts |
| 2 | 강사 폼 필수/선택 분리 + 접기 | `9ce5f33` | QuestionForm.tsx |
| 3 | 학생 홈 빈 상태 UX 개선 | `c30324d` | routes/student/index.tsx |

## 구현 세부사항

### Task 1: 시드 데이터

- `SEED_QUESTIONS` 배열: 과목별 5개씩 25문제 (수학I/II/미적분/확률과통계/기하)
- 문제 유형: 객관식 20개 + 단답형 5개
- 난이도: 1~5 균등 분포 (각 5문제)
- 출처: 수능(10) + 모의고사(10) + 교육청(5), 2020~2024년
- LaTeX 수식 포함 (content, explanation 모두)
- `seedIfEmpty()`: `db.questions.count() > 0`이면 스킵, 없으면 `bulkAdd`
- `db.on('ready', () => seedIfEmpty())` — 앱 시작 시 자동 호출

### Task 2: QuestionForm UX

**필수 입력 (항상 노출):**
- 문제 유형, 문제 내용, 정답, 해설, 과목, 난이도, 단원, 유형

**선택 입력 (기본 닫힘, 접기/펼치기):**
- 문제 이미지, 해설 이미지, 출처 정보 (시험종류/연도/번호)
- `useState(isOptionalOpen)` + ChevronDown/ChevronUp 토글 버튼
- `className={isOptionalOpen ? 'mt-4 space-y-6' : 'hidden'}` — DOM 유지

### Task 3: 학생 홈 개선

- `questionCount = useLiveQuery(() => db.questions.count())` — 실시간 문제 수
- 동적 설명: `등록된 {N}개의 문제를 풀고 실력을 향상시켜 보세요.`
- **랜덤 문제 풀기** 버튼: `db.questions.toArray()` → `Math.random()` → `navigate(/student/quiz/:id)`
- AI 추천 빈 상태: `recommendedQuestions.length === 0 && attemptCount === 0` → 안내 메시지

## Deviations from Plan

None — 플랜 그대로 실행됨.

## 검증 결과

- `pnpm --filter web build`: 3회 모두 TypeScript + Vite 빌드 성공
- 파일 4개 생성/수정 완료
- 커밋 3개 생성 완료

## Self-Check: PASSED

- FOUND: apps/web/src/lib/seed-data.ts
- FOUND: apps/web/src/lib/db.ts (수정)
- FOUND: apps/web/src/components/questions/QuestionForm.tsx (수정)
- FOUND: apps/web/src/routes/student/index.tsx (수정)
- FOUND commit: 9bf96de
- FOUND commit: 9ce5f33
- FOUND commit: c30324d
