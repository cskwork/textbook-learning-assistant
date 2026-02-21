---
phase: 11-layout-animation
plan: "02"
subsystem: ui
tags: [react, tailwind, navigation, bottom-nav, sidebar, responsive, touch-target]

# Dependency graph
requires:
  - phase: 10-design-system
    provides: "Tailwind v4 CSS 변수 토큰, primary 컬러(oklch), cta-gradient, backdrop-blur 패턴"
provides:
  - "기출탭탭 스타일 BottomNav — 상단 인디케이터 바(w-10) + rounded-xl 아이콘 배경(bg-primary/12)"
  - "기출탭탭 스타일 Sidebar — rounded-xl 통일 + 활성 도트(w-2 h-2) + 로고 확대(w-10 h-10)"
  - "AppShell 모바일 헤더 backdrop-blur-2xl + 터치 타겟 w-10 h-10 + focus mode min-h-[44px]"
  - "전체 네비게이션 레이어 backdrop-blur 패턴 일관화"
affects:
  - 12-student-home
  - 13-analytics
  - 14-instructor-portal

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "backdrop-blur-2xl: 모든 고정 헤더/탭바/사이드바에 통일 적용"
    - "min-h-[48px]: BottomNav NavLink 터치 타겟 최소값"
    - "min-h-[44px] min-w-[44px]: Focus mode 버튼 터치 타겟 최소값"
    - "w-10 h-10: 헤더 우측 아이콘 버튼 기준 크기"
    - "rounded-xl: 아이콘 배경 컨테이너 표준 (기존 rounded-lg → rounded-xl 통일)"

key-files:
  created: []
  modified:
    - apps/web/src/components/layout/BottomNav.tsx
    - apps/web/src/components/layout/Sidebar.tsx
    - apps/web/src/components/layout/AppShell.tsx

key-decisions:
  - "BottomNav 상단 인디케이터 바: w-10(기존 w-8)으로 확장 — 더 명확한 활성 탭 표시"
  - "아이콘 배경 rounded-xl 통일: BottomNav/Sidebar/AppShell/로그아웃/데스크톱 버튼 전부"
  - "backdrop-blur-2xl: BottomNav/Sidebar/헤더 3곳 모두 블러 강화로 시각적 계층 일관화"
  - "터치 타겟: BottomNav min-h-[48px], 헤더 버튼 w-10 h-10, focus mode min-h-[44px]"
  - "AppShell main에 min-h-0 추가: flex 스크롤 영역 올바른 작동 보장"
  - "Sidebar 로고 w-10 h-10(기존 w-9 h-9) + text-base font-extrabold로 브랜드 강조"

patterns-established:
  - "네비게이션 블러 패턴: bg-white/90 dark:bg-card/85 backdrop-blur-2xl"
  - "border-border/20~30: 고정 헤더류 구분선 미묘하게 (기존 /40~50 대비)"
  - "활성 상태 계층: 인디케이터 바(BottomNav) / 도트(Sidebar) / bg-primary/10 배경"

requirements-completed: [LYOT-01, LYOT-02]

# Metrics
duration: 2min
completed: 2026-02-21
---

# Phase 11 Plan 02: 네비게이션 컴포넌트 기출탭탭 스타일 리뉴얼 Summary

**BottomNav 상단 인디케이터 w-10 확장 + Sidebar rounded-xl 통일 + AppShell backdrop-blur-2xl 일관화로 기출탭탭 스타일 네비게이션 완성, 터치 타겟 LYOT-02 기준 충족**

## Performance

- **Duration:** 2min 9s
- **Started:** 2026-02-20T23:57:21Z
- **Completed:** 2026-02-21T00:00:00Z
- **Tasks:** 2 completed
- **Files modified:** 3

## Accomplishments

- BottomNav: 기출탭탭 스타일 상단 인디케이터 바(w-10, rounded-b-full), 아이콘 배경(rounded-xl, bg-primary/12), 활성 font-bold, 비활성 /50 연하게 → min-h-[48px] 터치 타겟 확보
- Sidebar: 로고 w-10 h-10 + text-base font-extrabold 브랜드 강조, 모든 버튼 rounded-xl 통일, 활성 도트 w-2 h-2 확대, NavLink py-3 터치 타겟 개선
- AppShell: 헤더 backdrop-blur-2xl + border-border/20 미묘한 구분선, 아이콘 버튼 w-10 h-10, focus mode 돌아가기 버튼 min-h-[44px] min-w-[44px], main에 min-h-0 스크롤 보장

## Task Commits

각 태스크가 원자적으로 커밋됨:

1. **Task 1: BottomNav + Sidebar 기출탭탭 스타일 네비게이션 리뉴얼** - `a89210d` (feat)
2. **Task 2: AppShell 모바일 헤더 리디자인 + 반응형 spacing 정밀 조정** - `064e304` (feat)

## Files Created/Modified

- `apps/web/src/components/layout/BottomNav.tsx` — 인디케이터 바 w-10, 아이콘 배경 rounded-xl + bg-primary/12, min-h-[48px] 터치 타겟, 비활성 /50 연하게
- `apps/web/src/components/layout/Sidebar.tsx` — 로고 w-10 h-10 + text-base, 모든 rounded-lg → rounded-xl, 도트 w-2 h-2, NavLink py-3
- `apps/web/src/components/layout/AppShell.tsx` — backdrop-blur-2xl 일관화, w-10 h-10 버튼, focus mode min-h-[44px], main min-h-0

## Decisions Made

- BottomNav 상단 인디케이터 바를 w-10(기존 w-8)으로 확장 — 기출탭탭 특유의 두드러진 활성 표시
- 아이콘 배경 rounded-xl로 전면 통일(BottomNav, Sidebar navLink, 데스크톱 버튼, 로그아웃 버튼) — 일관된 기출탭탭 카드 계층
- backdrop-blur-2xl: 3개 고정 요소(헤더, BottomNav, Sidebar) 동일 패턴 적용 — 시각적 계층 일관화
- AppShell main에 min-h-0 추가: flex 컨텍스트에서 내부 overflow-y-auto 자식이 올바르게 스크롤되도록

## Deviations from Plan

없음 — 계획대로 정확히 실행됨.

## Issues Encountered

없음.

## User Setup Required

없음 — 외부 서비스 설정 불필요.

## Next Phase Readiness

- 3개 레이아웃 컴포넌트(BottomNav, Sidebar, AppShell) 기출탭탭 스타일 완성
- Phase 11 계속: 11-03 (온보딩 플로우), 11-04 (페이지 전환 애니메이션), 11-05 (통합 검증) 진행 가능
- 터치 타겟 LYOT-01, LYOT-02 요구사항 충족 확인됨

---
*Phase: 11-layout-animation*
*Completed: 2026-02-21*
