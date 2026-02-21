---
phase: 10-design-system
plan: "01"
subsystem: ui
tags: [tailwind-v4, css-variables, design-system, pretendard, dark-mode, oklch, typography]

# 의존성 그래프
requires: []
provides:
  - "Pretendard 폰트 CDN 로딩 (index.html preconnect + stylesheet link)"
  - "기출탭탭 스타일 인디고블루 계열 색상 토큰 (라이트/다크 --primary oklch(0.52 0.19 260))"
  - "success/warning/info 시맨틱 토큰 (라이트+다크)"
  - "교육 앱 최적화 타이포그래피 (h1-h4 font-weight 700, line-height 1.65)"
  - "--spacing-page / --spacing-page-lg 커스텀 spacing"
affects:
  - 10-design-system (후속 plan들)
  - 11-layout-animation
  - 12-student-ux
  - 13-analytics
  - 14-instructor

# 기술 스택
tech-stack:
  added: ["Pretendard Variable (CDN)", "oklch 색상 공간 전면 채택"]
  patterns:
    - "Tailwind v4 CSS-first: @theme + @theme inline + :root/:dark 변수 레이어 분리"
    - "oklch 색상 공간으로 라이트/다크 토큰 대응 (동일 변수명, 다른 값)"
    - "시맨틱 토큰 패턴: --success/warning/info → @theme inline --color-* 매핑"

key-files:
  created: []
  modified:
    - "apps/web/index.html"
    - "apps/web/src/index.css"

key-decisions:
  - "Pretendard Variable (dynamic subset) CDN 방식 채택 — 번들 크기 최소화, 한국어 최적화"
  - "기출탭탭 핵심 primary를 oklch(0.52 0.19 260) 인디고블루로 고정 — 채도 0.19로 기존보다 선명하게"
  - "다크모드 primary를 oklch(0.68 0.16 260)으로 라이트모드 대비 밝기 조정 — WCAG AA 대비비 확보"
  - "시맨틱 토큰(success/warning/info) 추가 — 학습 결과/경고/정보 상태를 토큰으로 표현"
  - "stat-accent 및 cta-gradient 하드코딩 값을 새 토큰 체계에 맞게 일치 — 색상 체계 일관성"

patterns-established:
  - "폰트 우선순위: 'Pretendard Variable', Pretendard, -apple-system, ... — 한국어 교육 앱 표준"
  - "헤딩 font-weight 700 + letter-spacing -0.02em + line-height 1.25 — 교육 앱 가독성 기준"
  - "본문 line-height 1.65 — 수식+한국어 혼합 텍스트 가독성 최적화"

requirements-completed: [DSGN-01, DSGN-02, DSGN-04]

# 메트릭
duration: 3min
completed: 2026-02-21
---

# Phase 10 Plan 01: 디자인 시스템 토큰 Summary

**Pretendard 폰트 CDN 적용 + 기출탭탭 스타일 인디고블루 oklch 색상 토큰 전면 교체 + success/warning/info 시맨틱 토큰 라이트/다크 완비**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-20T23:33:36Z
- **Completed:** 2026-02-20T23:36:41Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- index.html에 Pretendard Variable CDN preconnect + stylesheet 링크 추가, body 폰트 교체
- :root 색상 토큰을 기출탭탭 스타일 인디고블루(oklch(0.52 0.19 260)) 계열로 전면 교체
- .dark 블록을 라이트모드 대응 다크 네이비 계열로 전면 교체 (--primary: oklch(0.68 0.16 260))
- success/warning/info 시맨틱 토큰 추가 및 @theme inline 매핑 완료
- 타이포그래피: h1-h4 font-weight 700, letter-spacing -0.02em, line-height 1.25, 본문 1.65
- stat-accent, cta-gradient 하드코딩 값을 새 토큰 체계에 맞게 조정
- --spacing-page(1.25rem) / --spacing-page-lg(2rem) 커스텀 spacing 추가

## Task Commits

각 태스크는 원자적으로 커밋됨:

1. **Task 1: Pretendard 폰트 CDN 로딩 + 타이포그래피 시스템** - `0cadff0` (feat)
2. **Task 2: 기출탭탭 스타일 색상 토큰 전면 교체 + 다크모드 동시 업데이트** - `bcc7886` (feat)

**Plan metadata:** (docs 커밋 예정)

## Files Created/Modified

- `apps/web/index.html` — Pretendard CDN preconnect + stylesheet link 추가
- `apps/web/src/index.css` — @theme 정리, body/h1-h4 타이포그래피, :root/:dark 색상 토큰 전면 교체, success/warning/info 시맨틱 토큰 추가

## Decisions Made

- **Pretendard Variable CDN 채택**: dynamic subset으로 한국어 최적화 + 번들 크기 최소화
- **primary oklch(0.52 0.19 260)**: 기존 0.55 0.16 260보다 더 선명한 기출탭탭 인디고블루
- **시맨틱 토큰 추가**: success/warning/info를 @theme inline에 매핑하여 Tailwind 유틸리티 클래스로 사용 가능
- **@theme 첫 번째 블록 정리**: shadcn @theme inline이 이미 모든 색상 매핑을 담당하므로 중복 커스텀 색상 변수 제거, breakpoint + spacing만 유지

## Deviations from Plan

None - 계획대로 정확히 실행됨.

## Issues Encountered

없음.

## User Setup Required

없음 — 외부 서비스 설정 불필요. Pretendard는 CDN 링크로 브라우저에서 자동 로딩.

## Next Phase Readiness

- 색상 토큰 및 타이포그래피 기반 완비 — Phase 10 후속 plan(컴포넌트 리뉴얼)이 이 토큰 위에 구축 가능
- Phase 11 레이아웃/애니메이션 작업에서 --color-primary, --color-success 등 유틸리티 클래스 바로 사용 가능
- 다크모드 토큰 완비 — SettingsContext 다크모드 전환 시 즉시 반영

## Self-Check: PASSED

- FOUND: apps/web/index.html
- FOUND: apps/web/src/index.css
- FOUND: .planning/phases/10-design-system/10-01-SUMMARY.md
- FOUND commit: 0cadff0 (feat(10-01): Pretendard 폰트 CDN 로딩 + 타이포그래피 시스템)
- FOUND commit: bcc7886 (feat(10-01): 기출탭탭 스타일 색상 토큰 전면 교체 + 다크모드 동시 업데이트)

---
*Phase: 10-design-system*
*Completed: 2026-02-21*
