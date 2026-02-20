---
phase: 03-quiz-engine
plan: 02
subsystem: ui
tags: [react, typescript, useReducer, useTimer, quiz, shadcn-ui, lucide-react]

# Dependency graph
requires:
  - phase: 03-quiz-engine/03-01
    provides: "quiz.service.ts (submitQuizAttempt, gradeAnswer), db.ts v2 스키마 (QuizAttempt, WrongNote)"
  - phase: 02-question-bank
    provides: "LatexPreview 컴포넌트, Question 인터페이스"
provides:
  - "useTimer 훅 — seconds, formatted(mm:ss), start/stop/reset, useEffect cleanup"
  - "TimerDisplay 컴포넌트 — mm:ss + Clock 아이콘, 경과 시간 색상 경고"
  - "MultipleChoiceInput 컴포넌트 — 5지선다 버튼, 선택 강조, disabled 지원"
  - "ShortAnswerInput 컴포넌트 — input[type=text], disabled 지원"
  - "QuizResult 컴포넌트 — 정오답 배지, 소요시간, 정답 카드, LatexPreview 해설, 버튼 행"
  - "QuizPlayer 컴포넌트 — useReducer 상태 머신(playing→submitted), 타이머+채점 연동"
affects: [03-quiz-engine/03-03, 03-quiz-engine/03-04, 03-quiz-engine/03-05]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "useReducer 상태 머신 — playing/submitted 두 phase로 퀴즈 플로우 관리"
    - "useTimer 훅 — setInterval + useEffect cleanup, 언마운트 시 자동 interval 정리"
    - "useEffect(fn, [question.id]) — 문제 변경 시 타이머 재시작 패턴"

key-files:
  created:
    - apps/web/src/hooks/useTimer.ts
    - apps/web/src/components/quiz/TimerDisplay.tsx
    - apps/web/src/components/quiz/MultipleChoiceInput.tsx
    - apps/web/src/components/quiz/ShortAnswerInput.tsx
    - apps/web/src/components/quiz/QuizResult.tsx
    - apps/web/src/components/quiz/QuizPlayer.tsx
  modified: []

key-decisions:
  - "QuizPlayer useEffect cleanup: stop() 반환 값 대신 timer.seconds state 직접 참조로 timeSpent 캡처 (stop 호출 후 state는 동기 읽힘)"
  - "RETRY 시 timer.reset() + timer.start() 순서로 타이머 재시작 — dispatch RETRY와 동시에"
  - "ShortAnswerInput type=text 고정 — type=number는 빈 값 NaN 처리 오류 유발 (Phase 2 경험 재적용)"

patterns-established:
  - "QuizPlayer: playing phase에서 문제+입력 UI, submitted phase에서 QuizResult — 단일 컴포넌트 상태 머신 패턴"
  - "useTimer cleanup: useEffect return 함수에 clearInterval — 라우트 이동 시 메모리 누수 방지"

requirements-completed: [QUIZ-01, QUIZ-02, QUIZ-03, QUIZ-04, QUIZ-05, PLAN-01]

# Metrics
duration: 3min
completed: 2026-02-20
---

# Phase 3 Plan 02: 퀴즈 엔진 UI 컴포넌트 Summary

**useReducer 상태 머신(playing→submitted) + useTimer 훅 기반 퀴즈 플레이어 UI 레이어 — 6개 컴포넌트/훅으로 5지선다·단답형 채점 UX 완성**

## Performance

- **Duration:** 3min
- **Started:** 2026-02-20T12:01:41Z
- **Completed:** 2026-02-20T12:04:49Z
- **Tasks:** 2
- **Files modified:** 6 (all new)

## Accomplishments

- useTimer 훅: 업카운트 타이머(setInterval), start/stop/reset, useEffect cleanup으로 언마운트 시 interval 자동 정리
- 4개 기초 UI 컴포넌트: TimerDisplay(색상 경고), MultipleChoiceInput(5지선다), ShortAnswerInput(type=text), TimerDisplay
- QuizResult: 정오답 배지(CheckCircle2/XCircle), 소요시간, 정답 카드, LatexPreview 해설, 버튼 행(다시풀기/다음문제/목록)
- QuizPlayer: useReducer 상태 머신(playing/submitted), useTimer + submitQuizAttempt 연동, RETRY 시 타이머 재시작

## Task Commits

각 task를 원자적으로 커밋:

1. **Task 1: useTimer 훅 + TimerDisplay + MultipleChoiceInput + ShortAnswerInput** - `2875b6b` (feat)
2. **Task 2: QuizResult + QuizPlayer 컴포넌트** - `37f1648` (feat)

## Files Created/Modified

- `apps/web/src/hooks/useTimer.ts` - 업카운트 타이머 훅, seconds/formatted/start/stop/reset, useEffect cleanup
- `apps/web/src/components/quiz/TimerDisplay.tsx` - Clock 아이콘 + mm:ss, 1분 amber/3분 red 경고색
- `apps/web/src/components/quiz/MultipleChoiceInput.tsx` - 5지선다 버튼 grid, 선택 강조, disabled 지원
- `apps/web/src/components/quiz/ShortAnswerInput.tsx` - shadcn Input[type=text], disabled 지원, 안내 텍스트
- `apps/web/src/components/quiz/QuizResult.tsx` - 정오답 배지, 소요시간, 정답 카드, LatexPreview 해설, 버튼 행
- `apps/web/src/components/quiz/QuizPlayer.tsx` - useReducer 상태 머신, useTimer 연동, submitQuizAttempt 연동

## Decisions Made

- **timer.seconds 직접 참조:** handleSubmit에서 timer.stop() 호출 후 timer.seconds를 직접 읽어 timeSpent 캡처. stop()은 비동기 state 업데이트이지만 현재 렌더 사이클의 seconds 값은 동기적으로 읽힘
- **RETRY 플로우:** dispatch RETRY와 동시에 timer.reset() + timer.start() 호출 — QuizResult의 onRetry 콜백에서 처리
- **ShortAnswerInput onChange:** value만 전달, dispatch는 SELECT_ANSWER 액션으로 통일

## Deviations from Plan

없음 — 계획대로 정확히 실행됨.

## Issues Encountered

없음 — TypeScript 에러 0개, 모든 파일 정상 생성.

## User Setup Required

없음 — 외부 서비스 설정 불필요.

## Next Phase Readiness

- 퀴즈 UI 레이어 완성 — 03-03(학생 문제 목록 + 퀴즈 라우트 등록)에서 QuizPlayer를 라우트에 연결
- QuizPlayer props(question, studentId, onNext, onBack)가 03-03의 페이지 컴포넌트에서 전달됨
- 6개 파일 모두 TypeScript 에러 없이 컴파일됨

## Self-Check: PASSED

All created files confirmed to exist and commits verified:
- FOUND: apps/web/src/hooks/useTimer.ts
- FOUND: apps/web/src/components/quiz/TimerDisplay.tsx
- FOUND: apps/web/src/components/quiz/MultipleChoiceInput.tsx
- FOUND: apps/web/src/components/quiz/ShortAnswerInput.tsx
- FOUND: apps/web/src/components/quiz/QuizResult.tsx
- FOUND: apps/web/src/components/quiz/QuizPlayer.tsx
- FOUND: .planning/phases/03-quiz-engine/03-02-SUMMARY.md
- FOUND commit: 2875b6b (Task 1)
- FOUND commit: 37f1648 (Task 2)
- TypeScript: 0 errors

---
*Phase: 03-quiz-engine*
*Completed: 2026-02-20*
