---
phase: 11-layout-animation
plan: "04"
subsystem: ui
tags: [framer-motion, animation, onboarding, react, AnimatePresence, confetti]

# 의존성 그래프
requires:
  - phase: 11-layout-animation
    plan: "01"
    provides: "Framer Motion 설치 + AnimatePresence 패턴"

provides:
  - "온보딩 스텝 진행 인디케이터 (도트 2개 + 커넥터 라인)"
  - "역할 선택 카드 Framer Motion stagger 애니메이션"
  - "완료 축하 화면: CheckCircle2 spring + 콘페티 8파티클"
  - "1.5초 후 자동 역할 홈 이동"

affects:
  - apps/web/src/routes/onboarding.tsx

# 기술 스택
tech-stack:
  added: []
  patterns:
    - "AnimatePresence mode='wait'로 select→complete 화면 전환 — exit 완료 후 enter 시작"
    - "motion.button stagger: 학생 카드 delay 0.1s, 강사 카드 delay 0.25s"
    - "콘페티 파티클: 컴포넌트 외부 상수 배열 (CONFETTI_PARTICLES) — 렌더마다 재생성 방지"
    - "spring 체크마크: stiffness 300 / damping 20으로 오버슈트 느낌의 등장 연출"
    - "easing 통일: cubic-bezier(0.22, 1, 0.36, 1) easeOutExpo — Phase 11 공통"

key-files:
  created: []
  modified:
    - apps/web/src/routes/onboarding.tsx

key-decisions:
  - "step 상태를 'select' | 'complete' 2단계로 관리 — AnimatePresence key prop으로 화면 전환"
  - "콘페티 파티클 배열을 모듈 최상단 상수로 정의 — useMemo 불필요, 렌더 비용 없음"
  - "setRole 성공 후 즉시 navigate 대신 step='complete' 전환 → setTimeout 1500ms — 축하 애니메이션 충분히 재생"
  - "whileHover/whileTap을 isSubmitting 조건부 적용 — 제출 중 인터랙션 방지"

requirements-completed: [FLOW-03]

# 메트릭
duration: 204s
completed: 2026-02-21
---

# Phase 11 Plan 04: 온보딩 플로우 Framer Motion 리디자인 Summary

**스텝 진행 인디케이터 + Framer Motion 역할 선택 카드 stagger + 완료 축하(체크마크 spring + 콘페티 8파티클) 애니메이션으로 온보딩 전면 리디자인**

## Performance

- **Duration:** 204s (~3.4min)
- **Started:** 2026-02-21T00:02:29Z
- **Completed:** 2026-02-21T00:05:53Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- 온보딩 상단에 2단계 스텝 인디케이터 추가 — 도트 + 커넥터 라인 + "N / 2 단계" 텍스트
- 역할 선택 카드 `<button>` → `motion.button` 교체: initial(opacity 0, y 24, scale 0.95) → animate(1, 0, 1), stagger delay 0.1s/0.25s
- 헤더(로고+제목)도 `motion.div`로 교체: initial(opacity 0, y -16) → animate(1, 0), delay 0s
- `handleRoleSelect`: setRole 성공 후 즉시 navigate 대신 step='complete' + setTimeout 1500ms 후 navigate
- 축하 화면: CheckCircle2 spring scale-in + 콘페티 8 motion.span 파티클 (중앙→바깥 fade-out) + 환영 텍스트 + 점 로딩 애니메이션
- `AnimatePresence mode='wait'`로 select→complete 화면 부드럽게 전환

## Task Commits

각 태스크는 원자적으로 커밋되었다:

1. **Task 1: 온보딩 스텝 진행 표시 + 역할 선택 카드 애니메이션 + 완료 축하 효과** — `bfd5962` (feat)

## Files Created/Modified

- `apps/web/src/routes/onboarding.tsx` — 온보딩 페이지 전면 리디자인 (스텝 인디케이터 + Framer Motion 카드 + 축하 애니메이션)

## Decisions Made

- **step 2단계 상태 관리**: `'select' | 'complete'` — AnimatePresence `key` prop 기반으로 화면 전환, 간단하고 명확한 상태 머신
- **콘페티 모듈 최상단 상수**: `CONFETTI_PARTICLES` 배열을 컴포넌트 외부 상수로 정의 — useMemo 불필요, GC 부담 없음
- **1.5초 setTimeout**: setRole 성공 직후 navigate하지 않고 축하 애니메이션(0.8s 콘페티 + spring)이 충분히 재생될 시간 확보
- **whileHover/whileTap 조건부**: `!isSubmitting` 가드로 제출 중 hover 인터랙션 방지 — 중복 클릭 UX 이슈 예방

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- `useMemo` import가 초기 작성에 포함되었으나 linter가 미사용 경고 발생 → 상수 배열로 교체하여 해소 (Rule 1 auto-fix)

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 11 완료 후 Phase 12(학생 홈 + 문제풀이 UX) 진입 가능
- 온보딩 플로우가 프리미엄 경험으로 업그레이드되어 신규 사용자 첫인상 개선
- 빌드 chunk size 경고(2670kB) 지속 — Phase 12 이후 lazy import 패턴으로 개선 예정

---
*Phase: 11-layout-animation*
*Completed: 2026-02-21*

## Self-Check: PASSED

- FOUND: apps/web/src/routes/onboarding.tsx
- FOUND: .planning/phases/11-layout-animation/11-04-SUMMARY.md
- FOUND commit: bfd5962
- FOUND: AnimatePresence import
- FOUND: step state ('select' | 'complete')
- FOUND: CONFETTI_PARTICLES confetti array
