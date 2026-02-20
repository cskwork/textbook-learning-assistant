---
phase: 05-ai-analytics
plan: 01
subsystem: ai-analytics-data-layer
tags: [bkt, analytics, streak, dexie, indexeddb]
dependency_graph:
  requires: [04-workbook-generator]
  provides: [bkt-pure-functions, analytics-service, streak-service, dexie-v4]
  affects: [05-02, 05-03, 05-04, 05-05]
tech_stack:
  added: []
  patterns: [bkt-bayesian-knowledge-tracing, dexie-schema-migration, in-memory-join-map-pattern, local-timezone-date-handling]
key_files:
  created:
    - apps/web/src/lib/bkt.ts
    - apps/web/src/services/analytics.service.ts
    - apps/web/src/services/streak.service.ts
  modified:
    - apps/web/src/lib/db.ts
decisions:
  - "BKT 콜드스타트: quizAttempts < 30이면 정답률 기반 휴리스틱(AIAN-04), 이상이면 BKT 모드"
  - "날짜 분리: toISOString() UTC 대신 로컬 타임존(getFullYear/Month/Date) — KST Pitfall 6 대응"
  - "getRecommendedQuestions: questionId 배열 반환 — Question 객체 전체 반환 금지 (데이터 전달 최소화)"
  - "getWeakCategories 휴리스틱 모드: accuracy/100을 pL 대용값으로 사용하여 인터페이스 일관성 유지"
metrics:
  duration: 150s
  completed_date: "2026-02-20"
  tasks_completed: 2
  files_created: 3
  files_modified: 1
---

# Phase 05 Plan 01: BKT 모델 + 집계 서비스 레이어 + Dexie version(4) 기반 구축 Summary

**One-liner:** 외부 라이브러리 없는 순수 JS BKT 구현 + quizAttempts 기반 분석/스트릭 서비스 + Dexie userSettings version(4)

## What Was Built

Phase 5의 모든 AI 분석·차트·추천 기능이 의존하는 핵심 데이터 레이어를 구축했다. BKT(Bayesian Knowledge Tracing) 순수 함수, analytics.service.ts(집계 쿼리), streak.service.ts(연속 학습 계산), Dexie version(4) userSettings 테이블.

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Dexie version(4) + BKT 순수 함수 | 3836308 | apps/web/src/lib/db.ts, apps/web/src/lib/bkt.ts |
| 2 | analytics.service.ts + streak.service.ts | ab39a20 | apps/web/src/services/analytics.service.ts, apps/web/src/services/streak.service.ts |

## Key Implementation Details

### BKT 순수 함수 (bkt.ts)
- `BKTParams` 인터페이스: pInit, pTransit, pSlip, pGuess 4개 파라미터
- `DEFAULT_BKT_PARAMS`: pInit=0.1, pTransit=0.3, pSlip=0.1, pGuess=0.2 (학술 기반 기본값)
- `updateBKT(pL, isCorrect, params)`: Bayes 사후확률 + 전이 확률 적용
- `computeBKT(attempts, params)`: 시도 배열 순회 → 최종 P(L) 반환
- `WEAK_THRESHOLD = 0.4`, `MASTERY_THRESHOLD = 0.95`

### Dexie version(4) (db.ts)
- `UserSetting` 인터페이스: id, userId(유니크), dailyGoal(기본 10), isDiagnosisCompleted
- `userSettings` EntityTable 추가 (`&userId` 유니크 인덱스)
- 기존 version(1)~(3) 절대 수정하지 않음

### analytics.service.ts (5개 함수)
- `getCategoryAccuracy(studentId)`: questionCategory별 정답률 (Map 패턴 인메모리 조인)
- `getDailyStats(studentId, days=14)`: 로컬 타임존 날짜 기준, 빈 날짜도 포함한 배열 반환
- `getOverallStats(studentId)`: 총 풀이 수, 정답 수, 정답률, quizSessions.timeSpent 합계
- `getWeakCategories(studentId)`: BKT/휴리스틱 분기, pL 오름차순 정렬
- `getRecommendedQuestions(studentId, limit=5)`: 취약 유형 상위 3개 → 최근 7일 정답 제외 → questionId 배열

### streak.service.ts
- `getStreak(studentId)`: current, max 연속 학습 일수
- 로컬 타임존 날짜 분리 (KST UTC+9 대응)
- 마지막 학습일이 오늘/어제가 아니면 current=0 (스트릭 끊김 처리)

## Deviations from Plan

None — 계획대로 정확히 실행됨.

## Decisions Made

1. **BKT 콜드스타트 분기**: quizAttempts < 30이면 getCategoryAccuracy 기반 휴리스틱(AIAN-04 요건), 30 이상이면 computeBKT 실행
2. **날짜 분리 방식**: `toISOString().slice(0,10)` UTC 방식 대신 `getFullYear/Month/Date` 로컬 타임존 방식 — KST 새벽 풀이가 전날로 집계되는 Pitfall 6 방지
3. **휴리스틱 pL 대용**: 정답률(accuracy/100)을 pL 대용값으로 사용하여 `{ category, pL }` 인터페이스 일관성 유지
4. **getRecommendedQuestions 반환값**: `number[]` (questionId 배열) — 호출자가 Question 전체 로드 여부를 결정

## Self-Check: PASSED

- apps/web/src/lib/bkt.ts: 존재 확인 (57줄, min 30줄 충족)
- apps/web/src/services/analytics.service.ts: 존재 확인 (186줄, min 80줄 충족)
- apps/web/src/services/streak.service.ts: 존재 확인 (80줄, min 30줄 충족)
- db.ts version(4): 코드 존재 확인
- 빌드 성공: `✓ built in 2.34s`
- Task 1 commit: 3836308
- Task 2 commit: ab39a20
