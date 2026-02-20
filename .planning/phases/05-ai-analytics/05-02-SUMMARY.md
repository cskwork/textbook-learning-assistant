---
phase: 05-ai-analytics
plan: 02
subsystem: analytics-chart-components
tags: [recharts, shadcn-chart, barchart, linechart, radarchart, analytics, react19]
dependency_graph:
  requires: [05-01]
  provides: [accuracy-bar-chart, daily-trend-line-chart, weak-type-radar-chart, summary-stats-cards, shadcn-chart-ui]
  affects: [05-03, 05-04, 05-05]
tech_stack:
  added: [recharts@2.15.4, react-is@19.2.4, shadcn-chart]
  patterns: [shadcn-chart-container, recharts-2x-pattern, react19-react-is-override]
key_files:
  created:
    - apps/web/src/components/ui/chart.tsx
    - apps/web/src/components/analytics/AccuracyBarChart.tsx
    - apps/web/src/components/analytics/DailyTrendLineChart.tsx
    - apps/web/src/components/analytics/WeakTypeRadarChart.tsx
    - apps/web/src/components/analytics/SummaryStatsCards.tsx
  modified:
    - apps/web/package.json
    - package.json
    - pnpm-lock.yaml
decisions:
  - "recharts 버전: shadcn add chart가 3.x 설치 시 2.15.x로 다운그레이드 (shadcn issue #7669 대응)"
  - "pnpm.overrides react-is: $react-is 참조 방식 대신 버전 문자열 ^19.0.0 직접 명시 (모노레포 루트 direct dep 없음)"
  - "WeakTypeRadarChart: 취약 유형 존재 시 Radar 전체 fill을 destructive 색상으로 설정 (개별 도형 색상 지정 미지원)"
  - "AccuracyBarChart: accuracy 오름차순 정렬 (취약 유형 먼저), 최대 10개 표시"
metrics:
  duration: 219s
  completed_date: "2026-02-20"
  tasks_completed: 2
  files_created: 5
  files_modified: 3
---

# Phase 05 Plan 02: recharts + shadcn chart + 4종 분석 차트 컴포넌트 Summary

**One-liner:** recharts 2.15.x + react-is pnpm override로 React 19 호환 fix 후 shadcn ChartContainer 기반 4종 분석 차트 컴포넌트(Bar/Line/Radar/Stats) 구현

## What Was Built

대시보드에서 사용할 4종 차트 컴포넌트 레이어를 구축했다. recharts 3.x 다운그레이드 + react-is override로 React 19 호환성을 확보했으며, shadcn chart 컴포넌트(ChartContainer, ChartTooltip, ChartLegend)를 기반으로 유형별 정답률 BarChart, 일별 학습 추이 LineChart, 취약 유형 RadarChart, 요약 통계 카드 4종을 구현했다.

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | recharts + react-is 설치 + shadcn chart 추가 | c56b30c | apps/web/package.json, package.json, pnpm-lock.yaml, chart.tsx |
| 2 | 4종 분석 차트 컴포넌트 구현 | 4825c15 | AccuracyBarChart.tsx, DailyTrendLineChart.tsx, WeakTypeRadarChart.tsx, SummaryStatsCards.tsx |

## Key Implementation Details

### recharts + React 19 호환성 (Task 1)
- `pnpm add recharts react-is --filter web` → recharts 3.7.0 설치됨 → `pnpm add recharts@2.15.1 --filter web`으로 2.15.1 다운그레이드
- `pnpm dlx shadcn@latest add chart --overwrite` → 2.15.4로 업그레이드됨 (2.x 범위 내)
- root `package.json` pnpm.overrides: `"react-is": "^19.0.0"` (React 19 빈 차트 fix)
- `apps/web/src/components/ui/chart.tsx`: ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartStyle export

### AccuracyBarChart.tsx (REPT-01, 92줄)
- Props: `{ category: string; accuracy: number; total: number }[]`
- accuracy 오름차순 정렬 (취약 유형 먼저 표시) + 최대 10개 슬라이스
- XAxis: category(30도 기울기), YAxis: 0~100%, Bar: accuracy, ChartTooltip: 정답률 + 문제 수
- 빈 데이터: "아직 풀이 데이터가 없습니다" 메시지

### DailyTrendLineChart.tsx (REPT-02, 109줄)
- Props: `{ date: string; count: number; correct: number }[]`
- YYYY-MM-DD → MM/DD 포맷 변환 함수 내장
- Line 2개: count(총 풀이, chart-1 색), correct(정답, chart-2 색)
- ChartLegend 포함 (ChartLegendContent)
- 빈 데이터: "아직 학습 데이터가 없습니다" 메시지

### WeakTypeRadarChart.tsx (REPT-03, 85줄)
- Props: `{ category: string; pL: number }[]`
- pL → Math.round(pL * 100) 퍼센트 변환 (0~100 범위)
- 취약 유형(pL < 0.4) 존재 시 Radar fill을 hsl(var(--destructive)) 빨간 계열로 설정
- 빈 데이터: "유형별 데이터가 충분하지 않습니다 (최소 1문제 필요)" 메시지

### SummaryStatsCards.tsx (REPT-04, 108줄)
- Props: `stats: OverallStats`, `todayCount: number`, `streak: StreakData`
- 카드 4종: 총 풀이(BookOpenCheck), 정답률(Target), 학습시간(Clock), 오늘 풀이(Flame)
- 학습 시간: `Math.floor(seconds / 60)` + '분' 변환
- 정답률 ≥80%, 오늘 풀이 > 0 시 카드 highlight (primary/5 배경)
- grid-cols-2 / md:grid-cols-4 반응형 그리드

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] TypeScript 미사용 변수 오류 2건 수정**
- **Found during:** Task 2 빌드 검증
- **Issue 1:** `AccuracyBarChart.tsx` formatter 콜백에서 `name` 파라미터 미사용 (TS6133)
- **Issue 2:** `WeakTypeRadarChart.tsx`에서 `ResponsiveContainer` import 미사용 (TS6133)
- **Fix 1:** `name` → `_name` 언더스코어 prefix 처리
- **Fix 2:** `ResponsiveContainer` import 제거 (ChartContainer 내부에서 처리)
- **Files modified:** AccuracyBarChart.tsx, WeakTypeRadarChart.tsx

**2. [Rule 1 - Bug] pnpm overrides `$react-is` 참조 방식 실패**
- **Found during:** Task 1 pnpm install
- **Issue:** `"react-is": "$react-is"` — 루트 package.json에 react-is가 직접 의존성으로 없으면 `$` 참조 불가
- **Fix:** `"react-is": "^19.0.0"` 버전 문자열 직접 명시
- **Files modified:** package.json

## Decisions Made

1. **recharts 버전 관리**: `pnpm dlx shadcn@latest add chart`가 recharts를 2.15.x 범위로 설치함을 확인. 3.x 설치 시 2.15.1 다운그레이드 필요하나 이번에는 2.15.4로 설치됨 (shadcn 자동 선택)
2. **pnpm.overrides 방식**: `$react-is` 참조 대신 `"^19.0.0"` 버전 문자열 직접 명시 — 모노레포 루트에 react-is direct dep 없음
3. **RadarChart 취약 유형 색상**: recharts Radar는 개별 데이터 포인트별 fill 지원 미비. 취약 유형 존재 시 전체 Radar를 destructive 색상으로 설정하는 단순 접근 채택

## Self-Check: PASSED

- apps/web/src/components/ui/chart.tsx: FOUND (356줄, min 50줄 충족)
- apps/web/src/components/analytics/AccuracyBarChart.tsx: FOUND (92줄, min 30줄 충족)
- apps/web/src/components/analytics/DailyTrendLineChart.tsx: FOUND (109줄, min 30줄 충족)
- apps/web/src/components/analytics/WeakTypeRadarChart.tsx: FOUND (85줄, min 30줄 충족)
- apps/web/src/components/analytics/SummaryStatsCards.tsx: FOUND (108줄, min 40줄 충족)
- recharts 버전: 2.15.4 (2.x 범위)
- react-is: ^19.2.4 (apps/web), pnpm.overrides: ^19.0.0 (root)
- pnpm.overrides에 react-is 추가: CONFIRMED
- 빌드 성공: `✓ built in 2.30s`
- Task 1 commit: c56b30c
- Task 2 commit: 4825c15
