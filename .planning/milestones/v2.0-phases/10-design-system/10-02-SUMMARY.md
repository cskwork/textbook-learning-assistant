---
phase: 10-design-system
plan: "02"
subsystem: ui
tags: [shadcn-ui, button, card, input, badge, tailwind-v4, design-system, hover-effects, oklch]

# 의존성 그래프
requires:
  - "10-01 (기출탭탭 색상 토큰 + 시맨틱 변수 --success/warning/info)"
provides:
  - "기출탭탭 스타일 Button (rounded-xl, shadow, hover lift, active press)"
  - "기출탭탭 스타일 Card (rounded-2xl, shadow-md, hover:shadow-lg)"
  - "기출탭탭 스타일 Input (rounded-xl, h-10, primary 포커스 ring)"
  - "교육 앱 Badge variant (success/warning/info)"
  - "카드 그림자 레벨 유틸리티 (.card-shadow-sm/md/lg, 다크모드 포함)"
  - ".btn-press 누름 효과 유틸리티"
affects:
  - 11-layout-animation
  - 12-student-ux
  - 13-analytics
  - 14-instructor

# 기술 스택
tech-stack:
  added: []
  patterns:
    - "hover:-translate-y-0.5 + active:translate-y-0 패턴으로 버튼 리프트 효과 구현"
    - "transition-shadow duration-200으로 카드 elevation 전환"
    - "시맨틱 토큰 참조: bg-success/15 text-success border-success/25 (opacity modifier)"
    - "border-2 + border-border/70 패턴으로 Input 경계선 강화"
    - "oklch 기반 card-shadow 커스텀 유틸리티 (elevation 시스템)"

key-files:
  created: []
  modified:
    - "apps/web/src/components/ui/button.tsx"
    - "apps/web/src/components/ui/badge.tsx"
    - "apps/web/src/components/ui/card.tsx"
    - "apps/web/src/components/ui/input.tsx"
    - "apps/web/src/index.css"

key-decisions:
  - "Button 기본 클래스에 rounded-xl + shadow-sm 통합 — 모든 variant가 일관된 둥근 모서리 가짐"
  - "hover lift는 default/destructive/outline만 적용 — ghost/link는 플랫 유지 (의미적 차이 보존)"
  - "Card rounded-2xl 채택 — Button(rounded-xl)보다 한 단계 크게, 컨테이너 계층 구분"
  - "Input focus-visible을 ring 색상 대신 primary로 명시 — 기출탭탭 브랜드 일관성"
  - "badge.tsx에 border 투명도 /25 사용 — 시맨틱 색상이 배경보다 진하지 않게 조절"

# 메트릭
duration: 2min
completed: 2026-02-21
---

# Phase 10 Plan 02: shadcn/ui 컴포넌트 기출탭탭 스타일 리뉴얼 Summary

**Button(hover lift+shadow)/Card(rounded-2xl+elevation)/Input(primary 포커스)/Badge(success/warning/info) 4개 컴포넌트를 기출탭탭 스타일로 완전 리뉴얼 — 기존 API 호환성 100% 유지**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-20T23:39:19Z
- **Completed:** 2026-02-20T23:41:39Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

### Task 1: Button + Badge 리뉴얼
- button.tsx: 기본 클래스에 `rounded-xl`, `shadow-sm`, `cursor-pointer`, `transition-all duration-200` 적용
- default variant: `shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm` (hover lift 완성)
- destructive/outline variant에도 hover lift 추가
- outline: `border-2` 두께 강화
- 모든 size에 `rounded-xl` 통일 (xs/sm/lg/icon 계열)
- size 조정: default h-10 px-5, sm px-3.5, lg h-11 px-7 text-base
- badge.tsx: `success`, `warning`, `info` variant 추가 (bg-success/15 text-success border-success/25 패턴)
- index.css: `.btn-press` 누름 스케일 효과 유틸리티 추가

### Task 2: Card + Input 리뉴얼
- card.tsx: `rounded-xl → rounded-2xl`, `shadow-sm → shadow-md`, `border-border/60` 반투명 경계선
- Card: `transition-shadow duration-200 hover:shadow-lg` elevation 인터랙션 추가
- CardTitle: `font-semibold → font-bold` 타이포그래피 강화
- input.tsx: `rounded-md → rounded-xl`, `h-9 → h-10` (터치 타겟 44px 근접)
- Input: `border → border-2 border-border/70`, `shadow-xs → shadow-sm`
- Input focus: `focus-visible:border-primary focus-visible:ring-primary/30 focus-visible:ring-[3px]` (primary 색상)
- Input placeholder: `/70` 투명도로 살짝 더 연하게
- index.css: `.card-shadow-sm/md/lg` elevation 유틸리티 + `.dark` 대응값 추가

## Task Commits

각 태스크는 원자적으로 커밋됨:

1. **Task 1: Button + Badge 리뉴얼** - `c546071` (feat)
2. **Task 2: Card + Input 리뉴얼** - `7373aae` (feat)

## Files Created/Modified

- `apps/web/src/components/ui/button.tsx` — 기출탭탭 스타일 buttonVariants (rounded-xl, hover lift, shadow)
- `apps/web/src/components/ui/badge.tsx` — success/warning/info 시맨틱 variant 추가
- `apps/web/src/components/ui/card.tsx` — rounded-2xl, shadow-md, hover:shadow-lg, CardTitle font-bold
- `apps/web/src/components/ui/input.tsx` — rounded-xl, h-10, border-2, primary 포커스 ring
- `apps/web/src/index.css` — .btn-press 유틸리티 + .card-shadow-sm/md/lg elevation 시스템

## Decisions Made

- **hover lift 선택적 적용**: default/destructive/outline에만 `-translate-y-0.5` — ghost/secondary/link는 플랫 유지 (의미적 계층 보존)
- **Card rounded-2xl > Button rounded-xl**: 컨테이너(카드)가 인터랙티브 요소(버튼)보다 둥근 모서리 큼 — UI 계층 시각화
- **Input h-10**: 기존 h-9(36px)에서 h-10(40px)으로 — 모바일/태블릿 터치 타겟 개선
- **badge border 투명도 /25**: 너무 진한 경계선 방지, 시맨틱 색상과 조화

## Deviations from Plan

없음 — 계획대로 정확히 실행됨.

## Issues Encountered

없음.

## User Setup Required

없음.

## Next Phase Readiness

- shadcn/ui 핵심 4개 컴포넌트 모두 기출탭탭 스타일 완성 — Phase 11 레이아웃 작업에서 즉시 활용 가능
- success/warning/info Badge — 퀴즈 결과, 학습 상태 표시에 바로 사용 가능 (Phase 12)
- card-shadow elevation 시스템 — 다크모드 포함, Phase 11-14 전체에서 일관 사용 가능
- 모든 기존 API(props) 호환성 유지 — 기존 컴포넌트 사용 코드 변경 불필요

## Self-Check: PASSED

- FOUND: apps/web/src/components/ui/button.tsx
- FOUND: apps/web/src/components/ui/badge.tsx
- FOUND: apps/web/src/components/ui/card.tsx
- FOUND: apps/web/src/components/ui/input.tsx
- FOUND: apps/web/src/index.css
- FOUND: .planning/phases/10-design-system/10-02-SUMMARY.md
- FOUND commit: c546071 (feat(10-02): Button + Badge 컴포넌트 기출탭탭 스타일 리뉴얼)
- FOUND commit: 7373aae (feat(10-02): Card + Input 컴포넌트 기출탭탭 스타일 리뉴얼)

---
*Phase: 10-design-system*
*Completed: 2026-02-21*
