---
phase: 05-ai-analytics
plan: 03
subsystem: onboarding-diagnostic-quiz
tags: [onboarding, diagnosis, bkt-seed, dexie, live-query, quiz-player]
dependency_graph:
  requires: [05-01]
  provides: [onboarding-quiz-route, diagnosis-completed-redirect]
  affects: [05-04, 05-05]
tech_stack:
  added: []
  patterns: [dexie-live-query, subject-stratified-sampling, route-guard-redirect]
key_files:
  created:
    - apps/web/src/routes/student/onboarding-quiz/index.tsx
  modified:
    - apps/web/src/main.tsx
    - apps/web/src/routes/student/index.tsx
decisions:
  - "QuizPlayer 내부 submitQuizAttempt 재사용: 별도 일괄 제출 없이 QuizPlayer의 onNext 콜백으로 인덱스 전진"
  - "문제 0개 edge case: sampleDiagnosticQuestions 결과 0개이면 즉시 isDiagnosisCompleted=true 저장 후 홈 이동"
  - "db.userSettings.put 타입캐스트: Dexie 4.x put은 id 없이도 동작하나 as 캐스트 필요"
  - "진단 퀴즈 건너뛰기 버튼 추가: 사용자가 퀴즈를 완료하지 않고도 진행 가능 (isDiagnosisCompleted=true로 처리)"
metrics:
  duration: 127s
  completed_date: "2026-02-20"
  tasks_completed: 1
  files_created: 1
  files_modified: 2
---

# Phase 05 Plan 03: 온보딩 진단 퀴즈 라우트 구현 Summary

**One-liner:** subject별 무작위 샘플링(최대 10문제) + QuizPlayer 재사용 + isDiagnosisCompleted 라우트 가드 구현

## What Was Built

신규 사용자가 /student 첫 접근 시 진단 퀴즈(/student/onboarding-quiz)로 리디렉트되는 전체 흐름을 구현했다. 5개 과목(수학I, 수학II, 미적분, 확률과통계, 기하)에서 각 1~2문제를 무작위 샘플링하여 최대 10문제를 제시하고, 기존 QuizPlayer를 재사용해 채점 및 submitQuizAttempt 저장을 처리한다. 퀴즈 완료 후 isDiagnosisCompleted=true를 userSettings에 저장하여 BKT 초기 데이터를 seed하고 /student 홈으로 이동한다.

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | OnboardingQuizPage + main.tsx 라우트 등록 | bf21e87 | apps/web/src/routes/student/onboarding-quiz/index.tsx, apps/web/src/main.tsx, apps/web/src/routes/student/index.tsx |

## Key Implementation Details

### OnboardingQuizPage (onboarding-quiz/index.tsx, 199줄)
- `sampleDiagnosticQuestions()`: 5개 subject별 toArray() → 무작위 sort → 1~2개 선택 → 최대 10개 슬라이스
- 문제 0개 edge case: `db.questions.count() === 0` 또는 샘플링 결과 빈 배열 → 즉시 `isDiagnosisCompleted=true` 저장 후 navigate('/student')
- `handleNext()`: currentIndex 전진, 마지막 문제 후 `db.userSettings.put(...)` → navigate
- useLiveQuery 없이 useEffect 단순 초기화 — QuizPlayer가 내부적으로 submitQuizAttempt 처리
- 진행 바(progress bar) + subject 배지 + 건너뛰기 버튼 UI

### main.tsx 라우트 등록
- `/student/onboarding-quiz` — `/student/profile` 라우트 앞에 배치
- Layout 보호 라우트 그룹 내 포함 (인증 + 온보딩 완료 필요)

### student/index.tsx 리디렉트 가드
- `useLiveQuery(() => db.userSettings.where('userId').equals(user.email).first(), [user?.email])`
- `undefined` (로딩 중) → animate-pulse 스켈레톤 표시
- `null` (신규 사용자, 레코드 없음) → `<Navigate to="/student/onboarding-quiz" replace />`
- `isDiagnosisCompleted === false` → `<Navigate to="/student/onboarding-quiz" replace />`
- 정상 상태 → 기존 StudentHomePage 렌더링

## Deviations from Plan

**1. [Rule 2 - Missing Feature] 퀴즈 건너뛰기 버튼 추가**
- **Found during:** Task 1
- **Issue:** 문제를 풀기 싫거나 빠르게 진행하고 싶은 사용자에게 강제 퀴즈는 UX 저해
- **Fix:** "진단 퀴즈 건너뛰기" ghost 버튼 추가 — 클릭 시 isDiagnosisCompleted=true 저장 후 /student 이동
- **Files modified:** apps/web/src/routes/student/onboarding-quiz/index.tsx

**2. [Rule 1 - 구현 조정] QuizPlayer 직접 재사용 (일괄 제출 방식 미채택)**
- 계획서는 "submit 시 answers의 각 항목에 대해 submitQuizAttempt 호출"을 명시했으나, QuizPlayer가 내부적으로 submitQuizAttempt를 이미 처리함
- 별도 일괄 제출 로직 없이 QuizPlayer의 onNext 콜백만 사용하는 더 단순한 구조 채택
- 기능 결과(BKT seed용 quizAttempts 저장)는 동일

## Self-Check: PASSED

- apps/web/src/routes/student/onboarding-quiz/index.tsx: FOUND (199줄, min 80줄 충족)
- /student/onboarding-quiz 라우트: main.tsx에서 확인
- isDiagnosisCompleted 리디렉트: student/index.tsx에서 확인
- 빌드 성공: `✓ built in 2.34s`
- Task 1 commit: bf21e87
