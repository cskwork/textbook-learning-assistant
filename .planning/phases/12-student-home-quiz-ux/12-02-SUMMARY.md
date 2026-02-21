---
phase: 12-student-home-quiz-ux
plan: "02"
subsystem: quiz-player
tags: [swiper, framer-motion, animation, quiz, redesign, multiple-choice]
dependency_graph:
  requires:
    - phase: 12-student-home-quiz-ux-01
      provides: Swiper 설치 + HomeBannerSwiper 패턴
    - phase: 11-layout-animation
      provides: FadeIn, AnimatedCard 컴포넌트
    - phase: 10-design-system
      provides: Tailwind v4 디자인 토큰 (primary, success, destructive)
  provides:
    - QuizPlayer 기출탭탭 스타일 리디자인 (문제 번호 인디케이터, 과목/유형 배지, FadeIn)
    - MultipleChoiceInput 세로 스택 레이아웃 + 번호 원형 배지 + motion.button
    - ShortAnswerInput FadeIn 래퍼 + PenLine 아이콘 + 텍스트 중앙 정렬
    - QuizResult 채점 애니메이션 (spring 체크, 흔들림, 카운트업)
    - QuizSwiperPage Swiper 기반 다중 문제 전환 (QUIZ-02)
  affects: [apps/web/src/routes/student/workbooks/play.tsx, apps/web/src/routes/student/quiz/index.tsx]
tech-stack:
  added: []
  patterns:
    - "ShakeIcon 함수형 컴포넌트 — framer-motion 배열 animate 타입 오류 우회 패턴"
    - "useCountUp 훅 — requestAnimationFrame + easeOut cubic 카운트업"
    - "QuizSwiperPage: swiperRef + useRef<SwiperType> 패턴 (useSwiper 훅 대신)"
    - "문제 번호 인디케이터: Map<number, boolean> questionId→isCorrect 완료 상태 추적"
key-files:
  created:
    - apps/web/src/components/quiz/QuizSwiperPage.tsx
  modified:
    - apps/web/src/components/quiz/QuizPlayer.tsx
    - apps/web/src/components/quiz/QuizResult.tsx
    - apps/web/src/components/quiz/MultipleChoiceInput.tsx
    - apps/web/src/components/quiz/ShortAnswerInput.tsx
    - apps/web/src/routes/student/quiz/index.tsx
    - apps/web/src/routes/student/workbooks/play.tsx
key-decisions:
  - "ShakeIcon 별도 함수형 컴포넌트로 분리 — framer-motion animate 배열 타입 충돌 우회"
  - "useCountUp: requestAnimationFrame + easeOut cubic — setInterval 대신 부드러운 카운트업"
  - "swiperRef 패턴 선택 — useSwiper 훅은 Swiper 자식 컴포넌트 안에서만 사용 가능, ref 방식이 더 안정적"
  - "QuizSwiperPage 완료 요약: 정답/전체/정답률 통계 3종 + 다시 풀기/목록 버튼"
  - "WorkbookPlayPage: questions.length >= 2 이면 QuizSwiperPage, 1개면 QuizPlayer 단독"
patterns-established:
  - "ShakeIcon 패턴: framer-motion 다단계 animate 타입 충돌 시 별도 컴포넌트로 분리"
  - "Swiper onSwiper callback으로 ref 저장 패턴 (swiperRef.current = swiper)"
  - "채점 결과 Map 추적: Map<questionId, isCorrect> — 상태 불변성 유지"
requirements-completed: [QUIZ-01, QUIZ-02, QUIZ-03]
duration: 5min
completed: "2026-02-21"
---

# Phase 12 Plan 02: 퀴즈 풀이 화면 기출탭탭 리디자인 + Swiper 문제 전환 + 채점 애니메이션 요약

**QuizPlayer/MultipleChoiceInput/ShortAnswerInput/QuizResult 기출탭탭 스타일 전면 리디자인 + framer-motion 채점 애니메이션(spring/shake/countup) + Swiper 기반 QuizSwiperPage 생성으로 QUIZ-01/02/03 충족**

## Performance

- **Duration:** 5min
- **Started:** 2026-02-21T00:32:34Z
- **Completed:** 2026-02-21T00:37:36Z
- **Tasks:** 2
- **Files modified:** 7 (6 수정, 1 생성)

## Accomplishments

- QuizPlayer에 문제 번호 인디케이터(진행 바), 과목/유형 Badge, 타이머 muted 배경, FadeIn 전체 래퍼 적용 (QUIZ-01)
- QuizResult에 정답 체크 spring 애니메이션, 오답 흔들림(x shake), 소요시간 카운트업(useCountUp), 정답/오답 배경 효과 적용 (QUIZ-03)
- MultipleChoiceInput: grid-cols-5 → 세로 스택(space-y-2.5), 번호 원형 배지, motion.button whileTap 터치 피드백
- ShortAnswerInput: rounded-xl h-14 중앙 정렬, PenLine 아이콘, FadeIn 래퍼
- QuizSwiperPage 생성: Swiper 좌우 스와이프 문제 전환, 번호 인디케이터 바, 완료 요약 화면 (QUIZ-02)
- WorkbookPlayPage: QuizSwiperPage 연결 (2개 이상), Skeleton 로딩, FadeIn+AnimatedCard 빈 상태
- QuizPage: Skeleton 로딩, FadeIn, max-w-3xl, 과목/단원 Badge

## Task Commits

각 태스크를 원자적으로 커밋:

1. **Task 1: QuizPlayer+MultipleChoiceInput+ShortAnswerInput+QuizResult 리디자인** - `dc6f616` (feat)
2. **Task 2: QuizSwiperPage 생성 + QuizPage/WorkbookPlayPage 리디자인** - `27cc499` (feat)

## Files Created/Modified

- `apps/web/src/components/quiz/QuizSwiperPage.tsx` - Swiper 기반 다중 문제 풀이 (198줄, QUIZ-02)
- `apps/web/src/components/quiz/QuizPlayer.tsx` - 기출탭탭 리디자인 + 문제 번호 인디케이터 + FadeIn
- `apps/web/src/components/quiz/QuizResult.tsx` - 채점 애니메이션 (spring/shake/countup) + FadeIn 해설
- `apps/web/src/components/quiz/MultipleChoiceInput.tsx` - 세로 스택 + 번호 배지 + motion.button
- `apps/web/src/components/quiz/ShortAnswerInput.tsx` - h-14 중앙 정렬 + FadeIn + PenLine 아이콘
- `apps/web/src/routes/student/quiz/index.tsx` - Skeleton 로딩 + FadeIn + Badge + max-w-3xl
- `apps/web/src/routes/student/workbooks/play.tsx` - QuizSwiperPage 연결 + Skeleton + AnimatedCard

## Decisions Made

- **ShakeIcon 별도 컴포넌트 분리**: framer-motion `animate` 배열 타입이 TypeScript에서 `VariantLabels | TargetAndTransition` 타입과 충돌하여 별도 함수형 컴포넌트로 분리하는 우회 패턴 적용
- **useCountUp 구현**: `setInterval` 대신 `requestAnimationFrame` + easeOut cubic — 더 부드러운 60fps 카운트업
- **swiperRef 패턴**: `useSwiper` 훅은 `Swiper` 컴포넌트의 직접 자식에서만 작동하는 제약으로, `onSwiper` 콜백 + `useRef<SwiperType>` 패턴 선택
- **questions.length >= 2 분기**: WorkbookPlayPage에서 문제 2개 이상이면 QuizSwiperPage, 1개면 단독 QuizPlayer — 단일 문제 UX 보존

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] framer-motion animate 배열 타입 오류 수정**

- **Found during:** Task 1 (QuizResult 빌드)
- **Issue:** `animate={[{ scale: 1 }, { x: [0, -10, 10, -10, 10, 0] }]}` — 배열 타입이 `VariantLabels | TargetAndTransition`에 할당 불가 (TS2352)
- **Fix:** 오답 흔들림 로직을 `ShakeIcon` 별도 함수형 컴포넌트로 분리, `animate={{ scale: 1, x: [...] }}`로 단일 객체 형태 사용
- **Files modified:** apps/web/src/components/quiz/QuizResult.tsx
- **Verification:** `pnpm --filter web build` TypeScript 에러 0개 확인
- **Committed in:** dc6f616 (Task 1)

---

**Total deviations:** 1 auto-fixed (Rule 1 Bug)
**Impact on plan:** 타입 오류 우회 패턴 — 기능적 동작 동일, 범위 이탈 없음.

## Issues Encountered

없음 — 빌드 타입 오류 1건 자동 수정 후 즉시 해결.

## User Setup Required

없음 — 외부 서비스 설정 불필요.

## Next Phase Readiness

- QUIZ-01, QUIZ-02, QUIZ-03 요구사항 모두 충족
- Phase 12 Plan 03 (문제 목록 카드 그리드 + 칩 필터) 이미 완료됨
- Phase 12 완료 후 Phase 13 (분석 대시보드 + 학습 플래너) 진입 가능

## Self-Check: PASSED

확인 항목:
- [x] apps/web/src/components/quiz/QuizSwiperPage.tsx 존재 (198줄)
- [x] apps/web/src/components/quiz/QuizPlayer.tsx 수정됨 (FadeIn, 번호 인디케이터, Badge)
- [x] apps/web/src/components/quiz/QuizResult.tsx 수정됨 (framer-motion spring/shake/countup)
- [x] apps/web/src/components/quiz/MultipleChoiceInput.tsx 수정됨 (세로 스택, 원형 배지)
- [x] apps/web/src/components/quiz/ShortAnswerInput.tsx 수정됨 (FadeIn, h-14 중앙)
- [x] apps/web/src/routes/student/quiz/index.tsx 수정됨 (Skeleton, FadeIn, Badge)
- [x] apps/web/src/routes/student/workbooks/play.tsx 수정됨 (QuizSwiperPage 연결)
- [x] 커밋 dc6f616 존재 (Task 1)
- [x] 커밋 27cc499 존재 (Task 2)
- [x] pnpm --filter web build 성공 (0 TypeScript 에러)

---
*Phase: 12-student-home-quiz-ux*
*Completed: 2026-02-21*
