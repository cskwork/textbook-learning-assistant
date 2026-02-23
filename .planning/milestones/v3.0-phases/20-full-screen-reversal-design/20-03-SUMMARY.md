---
phase: 20-full-screen-reversal-design
plan: 03
subsystem: ui
tags: [monster-codex, character-profile, svg-hexagon, badge-showcase, wrong-notes]

requires:
  - phase: 20-full-screen-reversal-design
    provides: SVG 아이콘 + 공용 UI 컴포넌트 (Plan 01)
provides:
  - MonsterCodex 오답노트 몬스터 도감
  - MonsterCard/MonsterSvg/MonsterDetail 몬스터 카드 시스템
  - CharacterProfile RPG 캐릭터 프로필
  - StatHexagon 육각형 능력치 차트
  - BadgeShowcase 뱃지 진열장
  - AchievementTracker 업적 현황
affects: [20-04]

tech-stack:
  added: []
  patterns: [monster-type-svg-mapping, hexagon-chart-svg, badge-showcase-grid]

key-files:
  created:
    - apps/web/src/components/wrong-notes/MonsterCodex.tsx
    - apps/web/src/components/wrong-notes/MonsterCard.tsx
    - apps/web/src/components/wrong-notes/MonsterSvg.tsx
    - apps/web/src/components/wrong-notes/MonsterDetail.tsx
    - apps/web/src/components/profile/CharacterProfile.tsx
    - apps/web/src/components/profile/StatHexagon.tsx
    - apps/web/src/components/profile/BadgeShowcase.tsx
    - apps/web/src/components/profile/AchievementTracker.tsx
  modified:
    - apps/web/src/routes/student/wrong-notes/index.tsx
    - apps/web/src/routes/student/profile/index.tsx

key-decisions:
  - "MonsterSvg 유형 매핑: 6종 수학 분류 → 기하학적 몬스터 실루엣"
  - "StatHexagon: SVG polarToCart 기반 육각형 + Framer Motion 진입 애니메이션"
  - "AchievementTracker: threshold 없이 달성/미달성 이진 표시 (BadgeDefinition에 threshold 없음)"

patterns-established:
  - "MonsterSvg 유형→실루엣 매핑 패턴"
  - "BadgeShowcase 카테고리별 그리드 패턴"

requirements-completed: [SCRN-04, SCRN-07]

duration: 8min
completed: 2026-02-24
---

# Plan 03: 몬스터 도감 + 캐릭터 프로필 Summary

**오답노트를 포켓몬 도감 스타일 MonsterCodex로, 마이페이지를 RPG CharacterProfile(육각형 스탯 + 뱃지 진열장)로 변환**

## Performance

- **Duration:** 8 min
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments
- MonsterSvg: 6종 수학 유형별 기하학적 몬스터 + 3단계 난이도별 네온 차등
- MonsterCodex: 격자형 도감 + 필터(전체/미처치/처치완료) + MonsterDetail 모달
- StatHexagon: SVG 6축 육각형 차트 + Framer Motion 데이터 진입 애니메이션
- CharacterProfile: 아바타 + 레벨 + 스탯 + 뱃지/업적 탭 전환
- 오답노트/마이페이지 라우트 lazy 분기 완료

## Task Commits

1. **Task 03-01: 오답노트 몬스터 도감** - `562c295` (feat)
2. **Task 03-02: 마이페이지 캐릭터 프로필** - `ce2489c` (feat)

## Deviations from Plan
- AchievementTracker: BadgeDefinition에 threshold 필드가 없어 진행률 바 대신 달성/미달성 이진 표시로 변경

## Issues Encountered
None

---
*Phase: 20-full-screen-reversal-design*
*Completed: 2026-02-24*
