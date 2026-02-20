---
phase: 05-ai-analytics
plan: 04
subsystem: analytics-dashboard-page
tags: [analytics, dashboard, streak, daily-goal, ai-recommendations, dexie-react-hooks, recharts]
dependency_graph:
  requires: [05-01, 05-02, 05-03]
  provides: [analytics-page, daily-goal-progress, streak-badge, ai-recommendations, home-real-data, analytics-tab]
  affects: [05-05]
tech_stack:
  added: []
  patterns: [useLiveQuery-trigger-pattern, useEffect-async-service-pattern, named-export-import-pattern]
key_files:
  created:
    - apps/web/src/routes/student/analytics/index.tsx
    - apps/web/src/components/analytics/DailyGoalProgress.tsx
    - apps/web/src/components/analytics/StreakBadge.tsx
    - apps/web/src/components/analytics/AIRecommendations.tsx
  modified:
    - apps/web/src/routes/student/index.tsx
    - apps/web/src/routes/_layout.tsx
    - apps/web/src/main.tsx
decisions:
  - "차트 컴포넌트 import 방식: AccuracyBarChart/DailyTrendLineChart/WeakTypeRadarChart는 named export이므로 { } 구문으로 import"
  - "홈 실데이터: 오늘 풀이는 useLiveQuery(실시간), 정답률/스트릭/학습시간은 useEffect(attemptCount 의존)"
  - "_layout.tsx 탭바: 마이페이지 탭 제거 → 분석 탭(BarChart2)으로 교체, /student/profile 라우트는 main.tsx에 유지"
metrics:
  duration: 226s
  completed_date: "2026-02-20"
  tasks_completed: 2
  files_created: 4
  files_modified: 3
---

# Phase 05 Plan 04: 분석 대시보드 페이지 + 보조 컴포넌트 + 홈 실데이터 연결 Summary

**One-liner:** useLiveQuery + useEffect 이중 패턴으로 05-01 서비스 레이어 + 05-02 차트 컴포넌트를 조합한 AnalyticsPage, 3종 보조 컴포넌트(DailyGoalProgress/StreakBadge/AIRecommendations), 학생 홈 실데이터 연결, 탭바 분석 탭 추가

## What Was Built

Phase 5의 핵심 기능 조합 — 분석 대시보드 페이지(/student/analytics)에서 4종 차트(AccuracyBarChart/DailyTrendLineChart/WeakTypeRadarChart/SummaryStatsCards), 일일 목표 설정(DailyGoalProgress), 연속 학습 뱃지(StreakBadge), AI 추천 문제 목록(AIRecommendations)을 통합했다. 학생 홈 페이지의 placeholder 카드 4종을 실데이터로 교체하고, 탭바에서 '마이페이지' 탭을 '분석' 탭으로 교체했다.

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | 3종 보조 컴포넌트 구현 | e0ebd8d | DailyGoalProgress.tsx, StreakBadge.tsx, AIRecommendations.tsx |
| 2 | 분석 대시보드 페이지 + 홈 실데이터 + 탭바 분석 탭 | a3ce6a3 | analytics/index.tsx, student/index.tsx, _layout.tsx, main.tsx |

## Key Implementation Details

### DailyGoalProgress.tsx (PLAN-02, 110줄)
- Props: `userId: string`, `todayCount: number`
- `useLiveQuery(() => db.userSettings.where('userId').equals(userId).first())` 실시간 구독
- Pencil/Check 아이콘으로 편집 모드 토글, Input type=number (5~50, step=5)
- 저장 시 레코드 유무 분기: modify (있음) vs add (없음)
- 진행률 바: `(todayCount / dailyGoal) * 100`, 최대 100%, 달성 시 "목표 달성!" 메시지

### StreakBadge.tsx (PLAN-03, 36줄)
- Props: `streak: { current: number; max: number }`
- Flame 아이콘 + N일 연속 텍스트, 활성(오렌지) / 비활성(회색) 분기
- "최고 기록: N일" 서브텍스트, 인라인 뱃지 형태

### AIRecommendations.tsx (AIAN-03, AIAN-04, 73줄)
- Props: `questions: Question[]`, `isHeuristic: boolean`
- isHeuristic=true → "정답률 기반 추천" 배지(Star 아이콘), false → "AI(BKT) 추천" 배지(Brain 아이콘)
- 문제 카드: content 앞 40자 + questionCategory Badge + difficulty 별 표시 + 풀기 Link
- 빈 배열: "취약 유형 문제가 없습니다. 더 많은 문제를 풀어보세요!" 안내

### AnalyticsPage (REPT-01~04, AIAN-03, AIAN-04, PLAN-02, PLAN-03, 140줄)
- `useLiveQuery(attemptCount)` → `useEffect` 재실행 트리거 패턴
- `Promise.all(getCategoryAccuracy, getDailyStats, getOverallStats, getWeakCategories, getRecommendedQuestions, getStreak)` 병렬 로드
- getRecommendedQuestions 반환 `number[]` → `db.questions.where('id').anyOf(ids).toArray()` 변환
- 콜드스타트: `count < 30` → isHeuristic=true
- 레이아웃: 헤더+StreakBadge / DailyGoalProgress / SummaryStatsCards / AI 추천 / AccuracyBar / DailyTrend / WeakTypeRadar

### 학생 홈 실데이터 연결 (student/index.tsx)
- 오늘 풀이: `useLiveQuery` (실시간)
- 정답률/스트릭/학습시간: `useEffect` + `getOverallStats/getStreak` 비동기
- 로딩 중 undefined이면 animate-pulse placeholder 유지
- "Phase 3에서 실제 문제 추천 기능이 추가됩니다" 텍스트 제거
- "자세한 분석 보기" 버튼 → `/student/analytics` 링크 추가

### 탭바 업데이트 (_layout.tsx)
- `import { BarChart2 } from 'lucide-react'` 추가
- studentNavItems: `{ path: '/student/profile', label: '마이페이지', icon: User }` 제거
- `{ path: '/student/analytics', label: '분석', icon: BarChart2 }` 추가 (5개 탭 유지)
- /student/profile 라우트는 main.tsx에서 유지 (직접 URL 접근 가능)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] 차트 컴포넌트 import 방식 오류 수정**
- **Found during:** Task 2 빌드 검증
- **Issue:** `AccuracyBarChart`, `DailyTrendLineChart`, `WeakTypeRadarChart`는 named export인데 default import 구문(`import X from ...`) 사용 — TS2613 오류 3건
- **Fix:** `import { AccuracyBarChart } from '@/components/analytics/AccuracyBarChart'` 형태로 수정 (나머지 2개 동일)
- **Files modified:** apps/web/src/routes/student/analytics/index.tsx

## Decisions Made

1. **차트 컴포넌트 import**: 05-02에서 named export로 구현된 컴포넌트들을 named import로 사용 — default export로 변경 시 05-02 파일 수정 필요하므로 import 방식 수정으로 해결
2. **홈 실데이터 로딩 전략**: 오늘 풀이 수는 useLiveQuery(실시간), 나머지 통계는 useEffect(attemptCount 의존) — 무한 리렌더 방지 + 실시간성 균형
3. **탭바 마이페이지 교체**: 05-RESEARCH.md 결정에 따라 /student/profile 라우트는 main.tsx에서 유지하되 탭바에서만 제거 (5개 탭 공간 확보)

## Self-Check: PASSED

- apps/web/src/routes/student/analytics/index.tsx: FOUND (140줄, min 100줄 충족)
- apps/web/src/components/analytics/DailyGoalProgress.tsx: FOUND (110줄, min 40줄 충족)
- apps/web/src/components/analytics/StreakBadge.tsx: FOUND (36줄, min 20줄 충족)
- apps/web/src/components/analytics/AIRecommendations.tsx: FOUND (73줄, min 40줄 충족)
- analytics 라우트 등록: /student/analytics in main.tsx CONFIRMED
- 탭바 BarChart2: in _layout.tsx CONFIRMED
- 빌드 성공: `✓ built in 3.27s`
- Task 1 commit: e0ebd8d
- Task 2 commit: a3ce6a3
