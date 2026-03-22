---
phase: 13-analytics-planner
plan: 02
subsystem: analytics
tags: [mastery-map, learning-path, history-timeline, bkt, weekly-comparison, framer-motion]
dependency_graph:
  requires: [13-01]
  provides: [MasteryMap, LearningPathCard, HistoryTimeline, getAllCategoryMastery, getWeeklyComparison]
  affects: [apps/web/src/routes/student/analytics/index.tsx]
tech_stack:
  added: []
  patterns: [progress-bar-level-color, weekly-comparison-card, daily-mini-bar-timeline, bkt-mastery-level]
key_files:
  created:
    - apps/web/src/components/analytics/MasteryMap.tsx
    - apps/web/src/components/analytics/LearningPathCard.tsx
    - apps/web/src/components/analytics/HistoryTimeline.tsx
  modified:
    - apps/web/src/services/analytics.service.ts
    - apps/web/src/routes/student/analytics/index.tsx
decisions:
  - "getAllCategoryMastery: BKT(30회 이상) vs 정답률 휴리스틱(30회 미만) 이중 모드 — 기존 getWeakCategories 패턴 동일하게 유지"
  - "MasteryMap 레이아웃: 유형명(min-w-80)+프로그레스바(flex-1)+퍼센트(min-w-36) 3컬럼 행 패턴"
  - "HistoryTimeline 일별 바: 최대값 대비 비율로 너비 계산(maxCount 기준) — 상대적 시각화"
  - "analytics/index.tsx 레이아웃: 히스토리타임라인(전폭) → 마스터리맵+학습경로(lg:grid-cols-5) → AI추천 → 차트"
  - "react-router vs react-router-dom: 프로젝트는 react-router 직접 임포트 패턴 사용 (Rule 3 자동 수정)"
metrics:
  duration: 215
  completed_date: "2026-02-21"
  tasks_completed: 2
  files_changed: 5
---

# Phase 13 Plan 02: 마스터리 맵 + 학습 경로 + 히스토리 타임라인 Summary

**한 줄 요약:** BKT 기반 유형별 마스터리 프로그레스 맵 + 취약 유형 추천 학습 경로 카드 + 주간 비교/일별 타임라인으로 분석 대시보드 ANLZ-02/03 충족

## 완료된 작업

### Task 1: analytics.service 확장 + MasteryMap + LearningPathCard 컴포넌트 (커밋: 9ec580f)

**analytics.service.ts 확장**
- `getAllCategoryMastery(studentId)`: BKT(30회 이상)/휴리스틱(30회 미만) 이중 모드로 전체 유형 숙련도 배열 반환
  - level 판별: pL >= 0.95 → mastery, >= 0.7 → proficient, >= 0.4 → learning, < 0.4 → weak
  - 반환값: `{ category, pL, total, correct, level }[]` pL 내림차순
- `getWeeklyComparison(studentId)`: 로컬 타임존 월요일 기준 이번 주 vs 지난 주 통계 비교
  - changePercent: 정답률 기준 변화량 계산 (lastWeek 0이면 count 기준 fallback)

**MasteryMap.tsx (신규, 102줄)**
- 가로 프로그레스 바 레이아웃: 유형명(left) + 바(flex-1) + 퍼센트(right)
- 레벨별 색상: mastery(emerald-500) / proficient(primary) / learning(amber-400) / weak(destructive)
- h-2.5 rounded-full + AnimatedCard 각 행 + FadeIn(0.03s stagger)
- 빈 상태: "아직 풀이 데이터가 없습니다" 안내

**LearningPathCard.tsx (신규, 99줄)**
- 취약 유형 상위 3개 우선순위 카드
- 순위별 배경: 1위(destructive/10+border) / 2위(amber/10+border) / 3위(muted/60+border)
- ArrowRight 아이콘 + 학습하기 버튼 → /student/problems?category=... 이동
- FadeIn(0.05s stagger) 진입 + 취약 없으면 격려 메시지

### Task 2: HistoryTimeline 컴포넌트 + 분석 페이지 통합 (커밋: 03af8ca)

**HistoryTimeline.tsx (신규, 167줄)**
- 상단 주간 비교 카드: 이번 주 / 지난 주 풀이 수 + 정답률
  - TrendingUp(emerald) / TrendingDown(destructive) / Minus(muted) 변화량 아이콘
- 하단 일별 타임라인 (최근 7일)
  - 날짜(MM/DD) + 요일('월'~'일') + 풀이 수 미니 바 + 정답률 텍스트
  - maxCount 기준 상대적 너비 계산, bg-primary/20 배경 + bg-primary fill
  - 오늘 행: bg-primary/5 강조 + 'primary' 색상 폰트
  - FadeIn(0.03s stagger) 진입

**analytics/index.tsx 통합**
- `getAllCategoryMastery`, `getWeeklyComparison` Promise.all 추가
- `masteryData`, `weeklyComparison` state 추가
- 레이아웃 순서: 헤더 → 일일목표 → 요약통계 → **히스토리타임라인(전폭)** → **마스터리맵+학습경로(5컬럼)** → AI추천 → 차트2컬럼 → 학습추이
- `useNavigate(react-router)` 추가 — LearningPathCard onNavigate 연동

## 검증 결과

- [x] `pnpm --filter web build` TypeScript 0 에러 + Vite 프로덕션 빌드 성공
- [x] `MasteryMap.tsx` 파일 존재 (102줄, 최소 60줄 이상)
- [x] `LearningPathCard.tsx` 파일 존재 (99줄, 최소 40줄 이상)
- [x] `HistoryTimeline.tsx` 파일 존재 (167줄, 최소 80줄 이상)
- [x] `analytics.service.ts`에 `getAllCategoryMastery`, `getWeeklyComparison` 함수 존재
- [x] `analytics/index.tsx`에 `MasteryMap`, `LearningPathCard`, `HistoryTimeline` import 존재

## 이탈 사항

### 자동 수정 사항

**1. [Rule 3 - 블로킹 이슈] react-router-dom → react-router 임포트 수정**
- 발견 시점: Task 2 빌드 검증 중
- 문제: `useNavigate`를 `react-router-dom`에서 임포트했으나 프로젝트는 `react-router` 직접 임포트 패턴 사용
- 수정: `import { useNavigate } from 'react-router-dom'` → `import { useNavigate } from 'react-router'`
- 영향 파일: `analytics/index.tsx`

## Self-Check: PASSED

- [x] ` FOUND (102줄)
- [x] ` FOUND (99줄)
- [x] ` FOUND (167줄)
- [x] `analytics.service.ts`에 getAllCategoryMastery + getWeeklyComparison 함수 존재 (grep 확인: 2건)
- [x] 커밋 9ec580f 존재
- [x] 커밋 03af8ca 존재
