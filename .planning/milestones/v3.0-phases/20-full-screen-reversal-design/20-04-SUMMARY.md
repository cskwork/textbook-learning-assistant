---
phase: 20-full-screen-reversal-design
plan: 04
subsystem: ui
tags: [analytics, workbooks, instructor, toggle-button, emoji-sweep, build-verification]

requires:
  - phase: 20-full-screen-reversal-design
    provides: SVG 아이콘 + 공용 UI 컴포넌트 (Plan 01)
provides:
  - FunModeAnalytics RPG 스탯 분석 대시보드
  - QuestCard + FunModeWorkbooks 퀘스트 북 문제집
  - 강사 포털 최소 다크 테마 (길드 마스터)
  - FunModeToggleButton SVG 아이콘 + 네온 글로우 개선
  - Phase 16-19 이모지 전수 제거
  - TypeScript + Vite 빌드 통과
affects: []

tech-stack:
  added: []
  patterns: [fun-mode-analytics-neon-chart, quest-card-workbook, instructor-minimal-dark-theme]

key-files:
  created:
    - apps/web/src/components/analytics/FunModeAnalytics.tsx
    - apps/web/src/components/workbook/QuestCard.tsx
    - apps/web/src/components/workbook/FunModeWorkbooks.tsx
  modified:
    - apps/web/src/routes/student/analytics/index.tsx
    - apps/web/src/routes/student/workbooks/index.tsx
    - apps/web/src/routes/instructor/index.tsx
    - apps/web/src/routes/instructor/groups/index.tsx
    - apps/web/src/routes/instructor/problems/index.tsx
    - apps/web/src/components/layout/FunModeToggleButton.tsx
    - apps/web/src/components/profile/StatHexagon.tsx
    - apps/web/src/components/gamification/LevelUpOverlay.tsx
    - apps/web/src/components/gamification/DailyChallenge.tsx
    - apps/web/src/components/gamification/StreakCounter.tsx
    - apps/web/src/components/gamification/Leaderboard.tsx
    - apps/web/src/components/gamification/WeeklyChallenge.tsx
    - apps/web/src/components/game/GameLoadingSpinner.tsx
    - apps/web/src/components/game/ui/GlassCard.tsx
    - apps/web/src/components/home/MiniLeaderboard.tsx
    - apps/web/src/components/wrong-notes/MonsterCodex.tsx

key-decisions:
  - "강사 포털: 최소 다크 테마만 적용 — 게임 UI 미사용, 라벨만 변경 (길드 마스터/길드/무기고)"
  - "FunModeToggleButton: 이모지 완전 제거 → SwordIcon + StarIcon + Framer Motion 전환"
  - "badge-definitions.ts icon 필드: 데이터 정의 레벨이므로 이모지 유지 (UI 렌더링과 분리)"

patterns-established:
  - "분석 화면 RPG 스탯 스타일 패턴"
  - "퀘스트 북 카드 패턴"

requirements-completed: [SCRN-03, SCRN-05, SCRN-06]

duration: 12min
completed: 2026-02-24
---

# Plan 04: 분석/문제집/강사포털 + 전체 복원 검증 Summary

**분석 대시보드, 문제집, 강사 포털 반전 디자인 완성 + 이모지 전수 제거 + 빌드 검증**

## Performance

- **Duration:** 12 min
- **Tasks:** 2
- **Files modified:** 19

## Accomplishments
- FunModeAnalytics: 능력치 3종 카드 + 육각형 차트 + 위험 지역 + 학습 추이 네온 바 차트
- QuestCard + FunModeWorkbooks: 퀘스트 북 스타일 문제집 카드/목록 + 필터 탭
- 강사 포털 3개 화면 최소 다크 테마 (배경 + 텍스트 색상 + 길드 라벨)
- FunModeToggleButton: 이모지 → SVG + Framer Motion 전환 애니메이션 + 네온 글로우
- Phase 16-19 게이미피케이션 5개 컴포넌트 이모지 전수 교체 (FlameIcon, CrownIcon, etc.)
- GameLoadingSpinner 이모지 제거
- GlassCard onClick 타입 수정 + MonsterCodex/MiniLeaderboard 타입 수정
- TypeScript tsc -b + Vite 빌드 성공 확인

## Task Commits

1. **Task 04-01: 분석/문제집/강사포털 반전 디자인** - `801c9cc` (feat)
2. **Task 04-02: 이모지 전수 제거 + 빌드 검증** - `6ca073f` (fix)

## Deviations from Plan
- badge-definitions.ts icon 필드는 데이터 정의 레벨이므로 이모지 유지 (string 타입 → SVG 컴포넌트 교체 시 대규모 리팩터링 필요)
- 강사 포털: 원래 계획보다 간소화 — CSS 인라인 스타일 + 라벨 변경만 적용 (GlassCard 미사용)

## Issues Encountered
- `tsc -b`가 `tsc --noEmit`보다 엄격하여 추가 타입 오류 4건 발견/수정
  - MiniLeaderboard groupId: string → number
  - GlassCard onClick: () => void → React.MouseEventHandler
  - MonsterCodex: Record<string, unknown> 캐스팅 → 'in' operator 체크

---
*Phase: 20-full-screen-reversal-design*
*Completed: 2026-02-24*
