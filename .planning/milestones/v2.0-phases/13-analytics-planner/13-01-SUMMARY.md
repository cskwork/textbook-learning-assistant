---
phase: 13-analytics-planner
plan: 01
subsystem: analytics
tags: [charts, gradient, recharts, framer-motion, date-filter, redesign]
dependency_graph:
  requires: []
  provides: [DateRangeSelector, AccuracyBarChart-gradient, DailyTrendLineChart-gradient, WeakTypeRadarChart-redesign, SummaryStatsCards-animated]
  affects: [apps/web/src/routes/student/analytics/index.tsx]
tech_stack:
  added: []
  patterns: [linearGradient-recharts, ComposedChart-area, AnimatedCard-wrapper, FadeIn-stagger, chip-filter]
key_files:
  created:
    - apps/web/src/components/analytics/DateRangeSelector.tsx
  modified:
    - apps/web/src/components/analytics/AccuracyBarChart.tsx
    - apps/web/src/components/analytics/DailyTrendLineChart.tsx
    - apps/web/src/components/analytics/WeakTypeRadarChart.tsx
    - apps/web/src/components/analytics/SummaryStatsCards.tsx
    - apps/web/src/routes/student/analytics/index.tsx
decisions:
  - "DailyTrendLineChart: LineChart → ComposedChart 전환 — recharts ComposedChart에서 Line+Area 혼합이 가능, 기존 LineChart에 Area 추가는 지원 불가"
  - "WeakTypeRadarChart: destructive(빨강) → amber warning 계열 — 덜 공격적인 톤으로 취약 유형 표시"
  - "DateRangeSelector: 헤더 오른쪽 StreakBadge 하단에 배치 — flex-col items-end 패턴"
  - "SummaryStatsCards StatCard: AnimatedCard 래퍼 + FadeIn delay stagger 0.05s 간격으로 카드별 진입 애니메이션"
metrics:
  duration: 179
  completed_date: "2026-02-21"
  tasks_completed: 2
  files_changed: 6
---

# Phase 13 Plan 01: 분석 대시보드 차트 기출탭탭 스타일 리디자인 Summary

**한 줄 요약:** recharts linearGradient + ComposedChart Area fill + DateRangeSelector 칩 필터로 분석 대시보드를 기출탭탭 스타일로 전면 리디자인

## 완료된 작업

### Task 1: 차트 컴포넌트 3종 그라데이션 리디자인 (커밋: d9341b2)

**AccuracyBarChart.tsx**
- `<defs>` + `<linearGradient id="accuracyGradient">` 추가 (상→하 세로 그라데이션)
- Bar `fill="url(#accuracyGradient)"` + `radius={[6,6,0,0]}` 상단 둥근 모서리
- `CartesianGrid strokeDasharray="3 3" opacity={0.3}` 점선 그리드
- 빈 상태 메시지에 `FadeIn` 래퍼 적용

**DailyTrendLineChart.tsx**
- `LineChart` → `ComposedChart` 전환 (Line + Area 혼합 지원)
- `countGradient`, `correctGradient` 2개 그라데이션 정의
- `Area` 컴포넌트 추가 (투명 stroke, 그라데이션 fill)
- Line `strokeWidth={2.5}`, dot `{ r: 3, fill: 'white', strokeWidth: 2 }` 스타일

**WeakTypeRadarChart.tsx**
- `fillOpacity` 0.3 → 0.25 조정
- `PolarGrid stroke="hsl(var(--muted-foreground) / 0.2)"` 은은한 그리드
- 취약 유형 존재 시 destructive → amber warning 계열 (덜 공격적인 톤)
- `PolarAngleAxis tick { fontSize: 12, fontWeight: 500 }`

**SummaryStatsCards.tsx**
- `StatCard`를 `AnimatedCard` 래퍼 + `FadeIn` stagger(0.05s) 진입 애니메이션으로 교체
- 아이콘 배경 `rounded-lg` → `rounded-xl` (Phase 11 패턴 통일)
- 카드 내부 패딩 `p-4` → `p-3.5` (모바일 최적화)

### Task 2: DateRangeSelector + 분석 페이지 리디자인 통합 (커밋: daf9353)

**DateRangeSelector.tsx (신규 생성)**
- Props: `{ value: number; onChange: (days: number) => void }`
- 칩 버튼 3개: 7일, 14일, 30일
- 활성 칩: `bg-primary text-primary-foreground shadow-sm`
- 비활성 칩: `bg-muted/50 hover:bg-muted text-muted-foreground`
- `rounded-full px-3 py-1 text-xs font-medium transition-colors` — Phase 11/12 칩 패턴 동일

**analytics/index.tsx 리디자인**
- `const [days, setDays] = useState(14)` 날짜 범위 state 추가
- `getDailyStats(studentId, days)` — 하드코딩 14 → days state로 교체
- `useEffect` 의존성에 `days` 추가
- `DateRangeSelector` 헤더 영역 우측 하단 배치 (StreakBadge 아래)
- 전체 페이지 `FadeIn` 래퍼 적용
- 차트 섹션 `Card` → `AnimatedCard`로 교체
- `animate-fade-up stagger-*` → `FadeIn delay` prop으로 교체
- 차트 제목 동적 업데이트: "학습 추이 ({days}일)"

## 검증 결과

- [x] `pnpm --filter web build` TypeScript 0 에러 + Vite 프로덕션 빌드 성공
- [x] `AccuracyBarChart`에 `linearGradient` 코드 존재
- [x] `DailyTrendLineChart`에 `linearGradient` 코드 존재 (countGradient, correctGradient)
- [x] `DateRangeSelector.tsx` 파일 존재
- [x] `analytics/index.tsx`에 `DateRangeSelector` import 존재
- [x] `analytics/index.tsx`에 `days` state + `getDailyStats(studentId, days)` 연동

## 이탈 사항

### 자동 수정 사항

**1. [Rule 3 - 블로킹 이슈] LineChart → ComposedChart 전환**
- 발견 시점: Task 1 실행 중
- 문제: recharts의 기본 `LineChart`에는 `Area` 컴포넌트를 추가할 수 없음 (LineChart는 Area를 렌더링하지 않음)
- 수정: `LineChart` → `ComposedChart` 전환으로 Line + Area 혼합 레이아웃 구현
- 영향 파일: `DailyTrendLineChart.tsx`
- 기능 동작: 동일하게 유지됨 (데이터 구조 변경 없음)

## Self-Check: PASSED

- [x] `/Users/danny/Documents/PARA/Projects/ai-agents/textbook-learning-assistant/apps/web/src/components/analytics/DateRangeSelector.tsx` FOUND
- [x] `/Users/danny/Documents/PARA/Projects/ai-agents/textbook-learning-assistant/apps/web/src/components/analytics/AccuracyBarChart.tsx` — linearGradient FOUND
- [x] `/Users/danny/Documents/PARA/Projects/ai-agents/textbook-learning-assistant/apps/web/src/components/analytics/DailyTrendLineChart.tsx` — linearGradient FOUND
- [x] 커밋 d9341b2 존재
- [x] 커밋 daf9353 존재
