---
phase: 16-reward-system
plan: "01"
subsystem: gamification
tags: [xp, level, combo, streak, badge, challenge, dexie, vitest, tdd, react-hooks]

# Dependency graph
requires:
  - phase: 15-infra-fun-mode
    provides: "Dexie v8 gamificationProfiles/xpEvents/badges 스키마, FunModeContext"

provides:
  - "XP 수식 순수 함수 5개 (calculateLevel, calculateXPForNextLevel, calculateXPProgress, getComboMultiplier, getBaseXP)"
  - "GamificationService — awardXP(Dexie transaction 원자적), updateStreak(로컬 타임존), checkAndAwardBadges"
  - "뱃지 정의 17개 (학습/연속/성취 3카테고리, common~epic)"
  - "ChallengeService — 데일리/주간 챌린지, seededShuffle(LCG)"
  - "useGamification — useLiveQuery 기반 reactive 훅"
  - "useCombo — 세션 내 콤보 카운터 훅"
  - "vitest 테스트 인프라 구축 (31개 테스트 PASS)"

affects:
  - 16-reward-system-02 (UI 컴포넌트: XP 바, 콤보 카운터, 뱃지 패널)
  - 16-reward-system-03 (리더보드, 챌린지 UI)
  - 17-sound-system (XP 지급/레벨업 이벤트에 사운드 연동)
  - 18-visual-effects (레벨업 시네마틱, 뱃지 획득 이펙트)

# Tech tracking
tech-stack:
  added:
    - vitest v4.0.18 (단위 테스트 프레임워크)
    - "@vitest/coverage-v8 v4.0.18 (커버리지)"
  patterns:
    - TDD (RED→GREEN) 패턴 — 테스트 먼저 작성, 구현으로 통과
    - Dexie transaction 원자성 패턴 — awardXP는 반드시 db.transaction('rw', [...]) 내부에서 실행
    - useLiveQuery dependency 패턴 — [studentId] 의존성 배열 필수 (유저 전환 안전성)
    - 순수 함수 분리 패턴 — xp-formula.ts는 DB 의존 없는 순수 함수만
    - LCG 시드 기반 셔플 — 동일 날짜 = 동일 챌린지 문제 보장

key-files:
  created:
    - apps/web/src/lib/gamification/xp-formula.ts
    - apps/web/src/lib/gamification/xp-formula.test.ts
    - apps/web/src/lib/gamification/badge-definitions.ts
    - apps/web/src/lib/gamification/gamification.service.ts
    - apps/web/src/lib/gamification/challenge.service.ts
    - apps/web/src/hooks/useGamification.ts
    - apps/web/src/hooks/useCombo.ts
  modified:
    - apps/web/vite.config.ts (vitest 설정 추가)
    - apps/web/package.json (test 스크립트, vitest devDep 추가)

key-decisions:
  - "XP 레벨 곡선: Lv1→2=100XP, 매 레벨 1.15배 증가, 최대 50레벨 (점진적 상승으로 초반 빠른 레벨업)"
  - "콤보 배수: 2연속=1.5x, 3연속=2x, 4연속=2.5x, 5+연속=3x(최대) — 완만한 상승곡선"
  - "난이도별 기본 XP: 쉬움(1-2)=100, 보통(3)=200, 어려움(4-5)=300"
  - "스트릭 보너스: 3일=50XP, 7일=150XP, 14일=300XP, 30일=500XP — Claude 재량으로 결정"
  - "뱃지 17개: 학습 5개(study) + 연속 5개(streak) + 성취 7개(achievement) — 첫날 2개(first_correct+study_10) 획득 가능"
  - "데일리 챌린지: 평일 3문제(월화=난이도2, 수목=3, 금=4), 주말 5문제(난이도3)"
  - "주간 챌린지 목표: 50문제 — Claude 재량으로 결정"

patterns-established:
  - "xp-formula.ts 순수 함수 패턴: DB 의존 없는 계산 로직은 별도 파일로 분리 → 단위 테스트 용이"
  - "Dexie transaction 원자성: 복수 테이블 업데이트는 반드시 db.transaction('rw', [tables], async () => {}) 내부"
  - "useLiveQuery dependency 배열: [studentId] 포함 필수 — 유저 전환 시 올바른 구독 갱신"
  - "useCombo 클로저 패턴: setState(prev => prev+1) 내부에서 새 값으로 multiplier 계산 (stale closure 방지)"
  - "seededShuffle LCG: getDailyChallengeQuestions에서 동일 날짜 = 동일 문제 보장"

requirements-completed: [RWRD-01, RWRD-02, RWRD-03, RWRD-04, RWRD-05, RWRD-06, RWRD-08]

# Metrics
duration: 5min
completed: 2026-02-23
---

# Phase 16 Plan 01: 보상 시스템 비즈니스 로직 엔진 Summary

**XP 수식 순수 함수 5개 + Dexie transaction 기반 GamificationService + 17개 뱃지 정의 + 챌린지 서비스 + React 훅 2개를 TDD(31 테스트)로 구현**

## Performance

- **Duration:** 5분
- **Started:** 2026-02-23T13:31:39Z
- **Completed:** 2026-02-23T13:36:07Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments

- xp-formula.ts: calculateLevel/calculateXPForNextLevel/calculateXPProgress/getComboMultiplier/getBaseXP 5개 순수 함수를 TDD로 구현 (31개 테스트 PASS)
- GamificationService: awardXP(Dexie transaction 원자적), updateStreak(로컬 타임존, 스트릭 보너스), checkAndAwardBadges 구현
- 17개 뱃지 정의: 학습 5개 + 연속 5개 + 성취 7개, 첫날 2개 획득 가능(first_correct + study_10)
- ChallengeService: 데일리 챌린지(날짜 시드 LCG 셔플), 주간 챌린지(월요일 집계), seededShuffle 순수 함수
- useGamification: useLiveQuery 기반 reactive 훅(studentId dependency 포함), useCombo: 세션 콤보 카운터
- vitest 테스트 인프라 구축 (vite.config.ts + package.json 설정)

## Task Commits

각 태스크는 원자적으로 커밋됨:

1. **Task 1: XP 수식 순수 함수 + 단위 테스트 (TDD RED→GREEN)** - `5e54f9a` (feat)
2. **Task 2: GamificationService + 뱃지 정의 + 챌린지 서비스 + React 훅** - `6f62c58` (feat)

**Plan 메타데이터:** (다음 커밋)

## Files Created/Modified

- `apps/web/src/lib/gamification/xp-formula.ts` — XP/레벨 순수 함수 5개 (calculateLevel, calculateXPForNextLevel, calculateXPProgress, getComboMultiplier, getBaseXP)
- `apps/web/src/lib/gamification/xp-formula.test.ts` — 31개 단위 테스트 (모두 PASS)
- `apps/web/src/lib/gamification/badge-definitions.ts` — BadgeDefinition/BadgeCheckContext 인터페이스 + 17개 BADGE_DEFINITIONS
- `apps/web/src/lib/gamification/gamification.service.ts` — awardXP/updateStreak/checkAndAwardBadges + AwardXPResult 타입
- `apps/web/src/lib/gamification/challenge.service.ts` — getDailyChallengeConfig/Questions/isDailyCompleted/getWeeklyChallengeProgress/seededShuffle
- `apps/web/src/hooks/useGamification.ts` — useLiveQuery 기반 게이미피케이션 상태 reactive 훅
- `apps/web/src/hooks/useCombo.ts` — 세션 내 콤보 카운터 훅 (DB 저장 없음)
- `apps/web/vite.config.ts` — vitest test 설정 추가
- `apps/web/package.json` — test/test:watch 스크립트, vitest devDep 추가

## Decisions Made

- **스트릭 보너스 수치**: 3일=50XP, 7일=150XP, 14일=300XP, 30일=500XP (계획에서 Claude 재량)
- **뱃지 17개 설계**: 3가지 카테고리, 첫날 2-3개 획득 가능, common~epic 희귀도 분류
- **주간 챌린지 목표**: 50문제 (계획에서 "50문제"로 명시되어 있어 그대로 따름)
- **데일리 챌린지 평일 난이도**: 월화=2, 수목=3, 금=4 (주초 쉽게, 주말 강하게 — 자연스러운 주간 흐름)
- **vitest test environment**: `node` 모드 — 순수 함수 테스트에 브라우저 환경 불필요

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] vitest 설치 및 vite.config.ts 설정 추가**
- **Found during:** Task 1 (TDD 테스트 환경 구축)
- **Issue:** package.json에 vitest가 없어 테스트 실행 불가
- **Fix:** `pnpm add -D vitest @vitest/coverage-v8`, vite.config.ts에 `test: { globals: true, environment: 'node' }` 추가, package.json에 test 스크립트 추가
- **Files modified:** apps/web/package.json, apps/web/vite.config.ts, pnpm-lock.yaml
- **Verification:** `npx vitest run` 성공, 31개 테스트 PASS
- **Committed in:** 5e54f9a (Task 1 커밋에 포함)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** vitest 설치는 TDD 실행을 위해 필수 (blocking). 플랜에서 `npx vitest run`을 검증 명령으로 명시했으나 설치가 누락된 상태였음.

## Issues Encountered

없음 — TypeScript 컴파일 에러 0개, 빌드 성공.

## Next Phase Readiness

- Plan 02/03에서 바로 사용 가능한 모든 데이터 레이어 및 비즈니스 로직 완성
- useGamification/useCombo 훅으로 UI 컴포넌트에서 즉시 게이미피케이션 상태 접근 가능
- awardXP를 기존 퀴즈 정답 로직에 연결하면 즉시 XP 적립 동작
- 청크 사이즈 경고(2844KB)는 기존 이슈(STATE.md 등록됨) — Phase 16 범위 밖

---

*Phase: 16-reward-system*
*Completed: 2026-02-23*
