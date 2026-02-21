---
phase: 11-layout-animation
plan: "01"
subsystem: ui
tags: [framer-motion, animation, react, micro-interaction, skeleton, ripple]

# 의존성 그래프
requires:
  - phase: 10-design-system
    provides: "Tailwind v4 CSS 변수 토큰, 컴포넌트 스타일 시스템 (Card/Button/Input)"

provides:
  - "AnimatePresence 기반 라우트 전환 (fade+slide exit/enter)"
  - "FadeIn 범용 fade-in 래퍼 컴포넌트 (stagger 지원)"
  - "RippleButton 물결 마이크로 인터랙션 버튼"
  - "AnimatedCard hover scale/y 전환 카드"
  - "Skeleton shimmer 로딩 컴포넌트"
  - "index.css ripple-spread + skeleton-shimmer @keyframes"

affects:
  - 12-student-home
  - 13-analytics-dashboard
  - 14-instructor-portal

# 기술 스택
tech-stack:
  added: []
  patterns:
    - "AnimatePresence mode='wait' + prevOutletRef 패턴으로 exit 애니메이션 중 outlet null 방지"
    - "FadeIn inView prop으로 whileInView + viewport.once 스크롤 기반 fade-in 지원"
    - "RippleButton: CSS animation + state 기반 ripple (클릭 좌표 → span absolute 삽입 → 400ms 후 제거)"
    - "AnimatedCard: Framer Motion layoutId 공유 레이아웃 애니메이션 지원"
    - "skeleton-shimmer: linear-gradient 200% background-position 이동 애니메이션"

key-files:
  created:
    - apps/web/src/components/motion/FadeIn.tsx
    - apps/web/src/components/motion/RippleButton.tsx
    - apps/web/src/components/motion/AnimatedCard.tsx
    - apps/web/src/components/ui/skeleton.tsx
  modified:
    - apps/web/src/components/layout/PageTransition.tsx
    - apps/web/src/index.css

key-decisions:
  - "AnimatePresence mode='wait' 선택 — exit 완료 후 enter 시작으로 깔끔한 전환 보장"
  - "prevOutletRef 캐싱 패턴 — useOutlet() null 방지 (라우트 전환 중 이전 outlet 유지)"
  - "RippleButton은 기존 Button 래핑이 아닌 독립 구현 — ripple 위치 계산을 위한 ref 없는 CSS 방식"
  - "skeleton-shimmer는 animate-pulse 대신 linear-gradient 이동 방식 선택 — shimmer 품질 향상"
  - "easing 통일: cubic-bezier(0.22, 1, 0.36, 1) easeOutExpo — 모든 애니메이션 컴포넌트 공통"

patterns-established:
  - "motion 컴포넌트: apps/web/src/components/motion/ 디렉토리에 집중 관리"
  - "FadeIn delay prop으로 stagger 구현 — Framer Motion staggerChildren 대신 명시적 delay"
  - "AnimatedCard layoutId prop 지원 — 목록↔상세 공유 레이아웃 애니메이션 준비"

requirements-completed: [FLOW-01, FLOW-02]

# 메트릭
duration: 2min
completed: 2026-02-21
---

# Phase 11 Plan 01: 레이아웃 애니메이션 기반 Summary

**Framer Motion AnimatePresence 페이지 전환 + RippleButton/AnimatedCard/FadeIn/Skeleton 마이크로 인터랙션 컴포넌트 4종 구축**

## Performance

- **Duration:** 2min
- **Started:** 2026-02-20T23:57:20Z
- **Completed:** 2026-02-20T23:59:42Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- PageTransition을 AnimatePresence mode="wait" 기반으로 업그레이드 — 라우트 전환 시 exit(y:-8, opacity:0) → enter(y:12→0, opacity:0→1) 페이드+슬라이드 재생
- components/motion/ 디렉토리에 마이크로 인터랙션 컴포넌트 3종 신설 (RippleButton, AnimatedCard, FadeIn)
- Skeleton shimmer 컴포넌트 + index.css에 ripple-spread / skeleton-shimmer @keyframes 추가

## Task Commits

각 태스크는 원자적으로 커밋되었다:

1. **Task 1: PageTransition AnimatePresence 업그레이드 + FadeIn 래퍼** — `d1262c7` (feat)
2. **Task 2: RippleButton + AnimatedCard + Skeleton 마이크로 인터랙션 컴포넌트** — `5889c8b` (feat)

## Files Created/Modified

- `apps/web/src/components/layout/PageTransition.tsx` — AnimatePresence mode="wait" + prevOutletRef 패턴으로 페이지 전환 업그레이드
- `apps/web/src/components/motion/FadeIn.tsx` — delay/duration/y/inView props 범용 fade-in 래퍼 (신규)
- `apps/web/src/components/motion/RippleButton.tsx` — 클릭 좌표 기반 물결 효과 버튼 (신규)
- `apps/web/src/components/motion/AnimatedCard.tsx` — whileHover scale/y + whileTap + layoutId 지원 카드 (신규)
- `apps/web/src/components/ui/skeleton.tsx` — skeleton-shimmer 클래스 기반 shimmer 로딩 컴포넌트 (신규)
- `apps/web/src/index.css` — ripple-spread + skeleton-shimmer @keyframes 및 유틸리티 클래스 추가

## Decisions Made

- **AnimatePresence mode="wait"**: exit 완료 후 enter 시작 방식으로 교차 전환 없이 깔끔한 라우트 전환 보장
- **prevOutletRef 캐싱**: `useOutlet()`이 라우트 전환 직후 null을 반환하는 문제를 ref로 이전 outlet 유지하여 exit 애니메이션 중 컨텐츠 소실 방지
- **RippleButton 독립 구현**: 기존 shadcn Button 래핑 대신 native button 기반으로 구현 — `e.nativeEvent.offsetX/Y` 대신 `e.clientX - rect.left`로 정확한 클릭 좌표 계산
- **easing 통일**: `cubic-bezier(0.22, 1, 0.36, 1)` easeOutExpo를 모든 애니메이션 컴포넌트에 공통 적용 — 기출탭탭 스타일 인터랙션 일관성

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- components/motion/ 4종 컴포넌트 즉시 사용 가능 — Phase 12 학생 홈/문제풀이 UX에서 FadeIn, AnimatedCard, RippleButton 활용 가능
- Skeleton 컴포넌트로 로딩 상태 처리 준비 완료
- 빌드 chunk size 경고(2665kB) 지속 — Phase 12 이후 lazy import 패턴으로 개선 예정 (기존 STATE.md 블로커)

---
*Phase: 11-layout-animation*
*Completed: 2026-02-21*

## Self-Check: PASSED

- FOUND: apps/web/src/components/layout/PageTransition.tsx
- FOUND: apps/web/src/components/motion/FadeIn.tsx
- FOUND: apps/web/src/components/motion/RippleButton.tsx
- FOUND: apps/web/src/components/motion/AnimatedCard.tsx
- FOUND: apps/web/src/components/ui/skeleton.tsx
- FOUND: .planning/phases/11-layout-animation/11-01-SUMMARY.md
- COMMIT d1262c7: feat(11-01) PageTransition 업그레이드 확인
- COMMIT 5889c8b: feat(11-01) 마이크로 인터랙션 컴포넌트 확인
