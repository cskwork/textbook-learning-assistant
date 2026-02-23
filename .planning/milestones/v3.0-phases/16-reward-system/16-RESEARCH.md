# Phase 16: 보상 시스템 - Research

**Researched:** 2026-02-23
**Domain:** 게이미피케이션 보상 엔진 (XP/레벨/콤보/스트릭/뱃지/리더보드/챌린지) — React 19 + Dexie v8 + Framer Motion
**Confidence:** HIGH (기존 인프라 확인 완료, 패턴 명확)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### XP/레벨 밸런싱
- 기본 XP: 100 XP (큰 숫자로 성취감 제공)
- 난이도별 배수: 쉬움=100, 보통=200, 어려움=300
- 콤보 배수: 완만한 상승 — 2연속=1.5x, 3연속=2x, 4연속=2.5x, 5연속+=3x (max)
- 레벨 곡선: 초반 빠른 레벨업 — Lv1→2: 100XP, 후반으로 갈수록 점진적 증가
- 최대 레벨: 50레벨 (장기적 목표, 매니아 층 대응)

#### 뱃지 체계 설계
- 카테고리: 학습(문제 수 기반), 연속(스트릭/콤보 기반), 성취(레벨/분야별 달성)의 3분류
- 초기 뱃지 개수: Claude 재량 (적절한 수량으로 시작, 추후 확장 가능)
- 달성 난이도: 쉽게 달성 가능한 뱃지 많이 배치 — 첫날 2-3개 획득 가능하도록 (초반 성취감 극대화)
- 뱃지 획득 알림: 풀스크린 축하 연출 (희귀 뱃지는 더 화려하게)

#### 리더보드/챌린지 UX
- 리더보드 정보: 순위 + XP + 레벨 + 스트릭 (종합 현황)
- 순위 표시: TOP 3 하이라이트 + 내 주변 ±2명 (경쟁 동기 적절 부여)
- 데일리 챌린지: 3~5문제, 요일마다 난이도/문제수 변동 (주말 특별 챌린지 포함)
- 주간 챌린지: 누적 목표 달성 형태 ("이번 주 50문제 풀기" 등)

#### 보상 피드백 UI
- XP 바 위치: 헤더 바로 아래 — 현재 레벨 + XP 진행률 항상 표시
- XP 획득 피드백: "+100 XP" 플로팅 텍스트가 떠오르며 사라지고, XP 바가 채워지는 애니메이션
- 콤보 카운터: 화면 중앙에 크게 표시 — "3x 콤보!" 타이포 효과
- 레벨업 연출: 풀스크린 시네마틱 (2-3초) + 새 레벨 정보 표시

### Claude's Discretion
- 초기 뱃지 구체적 개수와 목록 설계
- 스트릭 보너스 XP 정확한 수치
- XP 바 디자인 디테일 (색상, 그라데이션 등)
- 레벨업 시네마틱 구체적 애니메이션 디자인
- 리더보드 빈 상태(학생 1명일 때) 처리
- 데일리 챌린지 문제 선정 알고리즘

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| RWRD-01 | 사용자가 문제를 풀 때마다 XP를 획득하고 실시간으로 XP 바에 반영된다 | GamificationService.awardXP() → Dexie xpEvents/gamificationProfiles 업데이트 → useGamification 훅 reactivity → Framer Motion XP 바 채움 애니메이션 |
| RWRD-02 | 사용자가 누적 XP에 따라 레벨업하며 레벨업 애니메이션과 사운드가 재생된다 | XP 임계값 계산 → 레벨업 감지 → Framer Motion 풀스크린 오버레이 (사운드는 Phase 17) |
| RWRD-03 | 사용자가 연속 정답 시 콤보 카운터가 올라가며 콤보 배수에 따라 XP 보너스를 받는다 | React 상태로 콤보 카운터 관리 (세션 내 메모리) → XP 배수 계산 → "3x 콤보!" Framer Motion 팝업 |
| RWRD-04 | 사용자가 매일 학습하면 스트릭 카운터가 증가하고 스트릭 보너스 XP를 받는다 | GamificationProfile.lastStudyDate 비교 (자정 기준) → streakDays 증가 → 보너스 XP 지급 |
| RWRD-05 | 사용자가 데일리 챌린지(매일 새로운 3~5문제)를 완료하면 특별 보상을 받는다 | 날짜 시드 기반 문제 선정 → DailyChallenge 로컬 상태 → 완료 시 보너스 XP 지급 |
| RWRD-06 | 사용자가 특정 업적 달성 시 뱃지를 획득하고 프로필에 표시할 수 있다 | BADGE_DEFINITIONS 정적 배열 → checkBadges() 트리거 → Dexie badges 테이블 저장 → 풀스크린 알림 |
| RWRD-07 | 사용자가 반 내 XP 리더보드에서 자신의 순위를 확인할 수 있다 | GroupMember 기반 반 필터링 → gamificationProfiles 조회 → XP 순서 정렬 → TOP3 + ±2명 표시 |
| RWRD-08 | 사용자가 주간 챌린지에 참여하여 보너스 보상을 받을 수 있다 | 이번 주 월요일~일요일 xpEvents 집계 → 목표 달성 감지 → 보너스 XP 지급 |
</phase_requirements>

---

## Summary

Phase 16은 Phase 15에서 구축된 인프라(Dexie v8 gamification 테이블 3개, FunModeContext) 위에 보상 로직과 UI를 구현하는 단계다. 핵심 아키텍처 결정은 단순하다: **GamificationService** (순수 비즈니스 로직) + **useGamification 훅** (Dexie reactivity로 UI 업데이트) + **Framer Motion 애니메이션 컴포넌트**. 외부 상태 관리 라이브러리 없이 Dexie의 `useLiveQuery`를 활용하면 자동 reactivity가 제공되어 DB 변경 시 UI가 즉시 업데이트된다.

애니메이션은 이미 설치된 Framer Motion으로 전부 처리한다. XP 바 채움 → 플로팅 텍스트 → 콤보 팝업 → 레벨업 풀스크린 → 뱃지 획득 오버레이 순으로 복잡도가 증가하며, 각각 독립 컴포넌트로 분리하면 테스트·재사용이 용이하다. 콤보 카운터는 세션 메모리(React state)에만 유지하고 DB에는 XP 이벤트만 기록하는 것이 올바른 분리다.

POC 아키텍처(localStorage + Dexie)를 유지하므로 리더보드는 현재 브라우저 내 데이터만 사용한다. 반 내 리더보드는 GroupMember로 반원을 특정하고 gamificationProfiles를 조회해 XP 기준 정렬한다. 데일리/주간 챌린지도 Dexie 쿼리로 완전히 구현 가능하다.

**Primary recommendation:** `GamificationService` → `useGamification` → 애니메이션 컴포넌트 3-레이어 아키텍처로 구현. Dexie `useLiveQuery` 활용으로 전역 상태 없이 reactive UI 확보.

---

## Standard Stack

### Core (이미 설치됨 — 추가 설치 불필요)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Dexie | 4.3.0 | IndexedDB ORM — gamification 데이터 영속화 | Phase 15에서 v8 스키마 이미 준비됨 |
| dexie-react-hooks | 4.2.0 | `useLiveQuery` — DB 변경 시 자동 UI reactivity | 설치 완료, Dexie 공식 React 연동 방법 |
| Framer Motion | 이미 설치 | XP 바, 콤보 팝업, 레벨업 풀스크린, 뱃지 오버레이 | Phase 11에서 도입, 프로젝트 표준 |
| React 19 | 19.x | 컴포넌트/훅 | 프로젝트 기반 |

### Supporting (추가 설치 없음)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| date-fns | 이미 설치 여부 확인 필요 | 날짜 계산 (스트릭 자정 비교, 주간 월요일 계산) | 스트릭/챌린지 날짜 연산 |

**설치 확인:**
```bash
# date-fns 설치 여부 확인
node -e "require('date-fns')" 2>/dev/null && echo "installed" || echo "need install"
```

```bash
# 설치가 필요한 경우 (date-fns만 가능성 있음)
pnpm add date-fns
```

**추가 설치 패키지는 없음이 목표.** Framer Motion + Dexie + dexie-react-hooks로 전부 처리 가능.

---

## Architecture Patterns

### Recommended Project Structure
```
src/
├── lib/
│   ├── db.ts                          # 기존 — v8 스키마 이미 완성
│   └── gamification/
│       ├── gamification.service.ts    # 순수 비즈니스 로직 (XP 계산, 레벨, 스트릭, 뱃지 체크)
│       ├── badge-definitions.ts       # 뱃지 정적 정의 목록
│       ├── challenge.service.ts       # 데일리/주간 챌린지 로직
│       └── xp-formula.ts             # XP/레벨 수식 (순수 함수, 테스트 가능)
├── hooks/
│   ├── useGamification.ts             # useLiveQuery 기반 reactive 훅 (핵심)
│   └── useCombo.ts                    # 세션 내 콤보 카운터 (React state만)
├── components/
│   └── gamification/
│       ├── XPBar.tsx                  # 헤더 아래 XP 진행 바
│       ├── XPFloatingText.tsx         # "+100 XP" 플로팅 애니메이션
│       ├── ComboCounter.tsx           # "3x 콤보!" 팝업
│       ├── LevelUpOverlay.tsx         # 풀스크린 레벨업 시네마틱
│       ├── BadgeUnlockOverlay.tsx     # 풀스크린 뱃지 획득 연출
│       ├── Leaderboard.tsx            # 반 내 리더보드
│       ├── DailyChallenge.tsx         # 데일리 챌린지 카드
│       └── WeeklyChallenge.tsx        # 주간 챌린지 진행 바
└── routes/
    └── student/
        └── profile/                   # 뱃지 프로필 표시 (기존 마이페이지 확장)
```

### Pattern 1: GamificationService — 순수 비즈니스 로직 분리
**What:** UI와 완전 분리된 서비스 레이어. DB 읽기/쓰기만 수행. React에 의존하지 않음.
**When to use:** XP 지급, 스트릭 업데이트, 뱃지 체크 등 모든 상태 변경 시.

```typescript
// src/lib/gamification/gamification.service.ts
import { db } from '../db'
import { calculateLevel, calculateXPForNextLevel } from './xp-formula'
import { BADGE_DEFINITIONS } from './badge-definitions'

export interface AwardXPResult {
  xpAwarded: number
  totalXP: number
  previousLevel: number
  newLevel: number
  leveledUp: boolean
  unlockedBadges: string[]  // badge IDs
}

export async function awardXP(
  studentId: string,
  baseXP: number,
  reason: XPEvent['reason'],
  comboMultiplier: number = 1
): Promise<AwardXPResult> {
  const xpAwarded = Math.round(baseXP * comboMultiplier)

  return await db.transaction('rw', [db.gamificationProfiles, db.xpEvents, db.badges], async () => {
    // 1. 프로필 가져오기 또는 생성
    let profile = await db.gamificationProfiles.where('studentId').equals(studentId).first()
    if (!profile) {
      profile = { studentId, totalXP: 0, level: 1, streakDays: 0, lastStudyDate: 0, updatedAt: Date.now() }
      await db.gamificationProfiles.add(profile)
      profile = await db.gamificationProfiles.where('studentId').equals(studentId).first()
    }

    const previousLevel = profile!.level
    const newTotalXP = profile!.totalXP + xpAwarded
    const newLevel = calculateLevel(newTotalXP)

    // 2. XP 이벤트 기록
    await db.xpEvents.add({
      studentId, amount: xpAwarded, reason, comboMultiplier, timestamp: Date.now()
    })

    // 3. 프로필 업데이트
    await db.gamificationProfiles.where('studentId').equals(studentId).modify({
      totalXP: newTotalXP,
      level: newLevel,
      updatedAt: Date.now()
    })

    // 4. 뱃지 체크
    const unlockedBadges = await checkAndAwardBadges(studentId, newTotalXP, newLevel, profile!.streakDays)

    return {
      xpAwarded,
      totalXP: newTotalXP,
      previousLevel,
      newLevel,
      leveledUp: newLevel > previousLevel,
      unlockedBadges
    }
  })
}
```

### Pattern 2: useLiveQuery 기반 reactive 훅
**What:** Dexie `useLiveQuery`로 DB 변경을 자동 구독. `awardXP()` 호출 후 별도 setState 없이 UI 자동 업데이트.
**When to use:** 컴포넌트에서 gamification 상태를 표시할 때.

```typescript
// src/hooks/useGamification.ts
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../lib/db'
import { calculateXPForNextLevel, calculateXPProgress } from '../lib/gamification/xp-formula'

export function useGamification(studentId: string) {
  const profile = useLiveQuery(
    () => db.gamificationProfiles.where('studentId').equals(studentId).first(),
    [studentId]
  )

  const recentBadges = useLiveQuery(
    () => db.badges.where('studentId').equals(studentId).reverse().limit(5).toArray(),
    [studentId]
  )

  return {
    profile,
    xpForNextLevel: profile ? calculateXPForNextLevel(profile.level) : 0,
    xpProgress: profile ? calculateXPProgress(profile.totalXP, profile.level) : 0,  // 0~1
    recentBadges: recentBadges ?? [],
    isLoading: profile === undefined
  }
}
```

### Pattern 3: XP 수식 — 순수 함수 (테스트 용이)
**What:** 레벨 계산을 순수 함수로 분리. 비즈니스 로직 변경 시 한 파일만 수정.

```typescript
// src/lib/gamification/xp-formula.ts
// 레벨별 누적 XP 임계값 — 초반 빠른 레벨업
// Lv1→2: 100XP, Lv2→3: 200XP, Lv3→4: 350XP, ... 점진적 증가
export function calculateLevel(totalXP: number): number {
  if (totalXP < 0) return 1
  // 간단한 근사식 — 실제 값은 테이블로 관리
  let level = 1
  let threshold = 0
  let increment = 100
  while (level < 50 && totalXP >= threshold + increment) {
    threshold += increment
    level++
    increment = Math.round(increment * 1.15)  // 15% 증가 곡선
  }
  return level
}

export function calculateXPForNextLevel(currentLevel: number): number {
  // 현재 레벨에서 다음 레벨까지 필요한 XP
  let increment = 100
  for (let i = 1; i < currentLevel; i++) increment = Math.round(increment * 1.15)
  return increment
}

export function calculateXPProgress(totalXP: number, currentLevel: number): number {
  // 현재 레벨 내 진행률 (0~1)
  // ... 계산 로직
  return 0  // placeholder
}

// 콤보 배수
export function getComboMultiplier(comboCount: number): number {
  if (comboCount <= 1) return 1
  if (comboCount === 2) return 1.5
  if (comboCount === 3) return 2
  if (comboCount === 4) return 2.5
  return 3  // 5연속 이상 max
}

// 난이도별 기본 XP
export function getBaseXP(difficulty: 1 | 2 | 3 | 4 | 5): number {
  if (difficulty <= 2) return 100   // 쉬움
  if (difficulty <= 3) return 200   // 보통
  return 300                        // 어려움
}
```

### Pattern 4: 세션 내 콤보 — React State (DB 불필요)
**What:** 콤보 카운터는 퀴즈 세션 동안만 유효. DB에 저장하지 않고 React state로만 관리.

```typescript
// src/hooks/useCombo.ts
import { useState, useCallback } from 'react'
import { getComboMultiplier } from '../lib/gamification/xp-formula'

export function useCombo() {
  const [comboCount, setComboCount] = useState(0)

  const onCorrect = useCallback(() => {
    setComboCount(prev => prev + 1)
    return getComboMultiplier(comboCount + 1)
  }, [comboCount])

  const onWrong = useCallback(() => {
    setComboCount(0)
  }, [])

  return { comboCount, multiplier: getComboMultiplier(comboCount), onCorrect, onWrong }
}
```

### Pattern 5: 스트릭 업데이트 로직
**What:** `lastStudyDate`와 오늘 날짜를 비교해 스트릭 증가/리셋/유지 결정.

```typescript
// src/lib/gamification/gamification.service.ts (일부)
export async function updateStreak(studentId: string): Promise<{ streakDays: number; bonusXP: number }> {
  const profile = await db.gamificationProfiles.where('studentId').equals(studentId).first()
  const todayStr = new Date().toDateString()  // "Mon Feb 23 2026"
  const lastStr = profile ? new Date(profile.lastStudyDate).toDateString() : ''

  if (lastStr === todayStr) return { streakDays: profile!.streakDays, bonusXP: 0 }  // 오늘 이미 학습

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toDateString()

  const newStreak = (lastStr === yesterdayStr) ? (profile?.streakDays ?? 0) + 1 : 1
  const bonusXP = calculateStreakBonus(newStreak)

  await db.gamificationProfiles.where('studentId').equals(studentId).modify({
    streakDays: newStreak,
    lastStudyDate: Date.now(),
    updatedAt: Date.now()
  })

  return { streakDays: newStreak, bonusXP }
}

// Claude 재량: 스트릭 보너스 XP 수치 — 권장값
// 3일: +50XP, 7일: +150XP, 14일: +300XP, 30일: +500XP
function calculateStreakBonus(streakDays: number): number {
  if (streakDays >= 30) return 500
  if (streakDays >= 14) return 300
  if (streakDays >= 7) return 150
  if (streakDays >= 3) return 50
  return 0
}
```

### Pattern 6: 뱃지 정의 — 정적 데이터 + 체크 함수
**What:** 뱃지는 코드에 정의된 정적 목록. DB에는 획득 기록만 저장.

```typescript
// src/lib/gamification/badge-definitions.ts
export interface BadgeDefinition {
  id: string
  name: string
  description: string
  category: 'study' | 'streak' | 'achievement'
  rarity: 'common' | 'rare' | 'epic'  // 연출 화려함 결정
  icon: string  // 이모지 또는 SVG 이름
  checkCondition: (ctx: BadgeCheckContext) => boolean
}

export interface BadgeCheckContext {
  totalXP: number
  level: number
  streakDays: number
  totalCorrect: number  // 전체 맞힌 문제 수 (xpEvents에서 집계)
  comboMax?: number     // 세션 최고 콤보
}

// Claude 재량: 초기 뱃지 목록 (권장 18개)
export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // 학습 카테고리 (문제 수 기반) — 쉬운 것부터
  { id: 'first_correct',   name: '첫 정답!',       category: 'study',       rarity: 'common', icon: '⭐', checkCondition: ctx => ctx.totalCorrect >= 1 },
  { id: 'study_10',        name: '10문제 달성',     category: 'study',       rarity: 'common', icon: '📚', checkCondition: ctx => ctx.totalCorrect >= 10 },
  { id: 'study_50',        name: '50문제 달성',     category: 'study',       rarity: 'common', icon: '📖', checkCondition: ctx => ctx.totalCorrect >= 50 },
  { id: 'study_100',       name: '100문제 달성',    category: 'study',       rarity: 'rare',   icon: '🏆', checkCondition: ctx => ctx.totalCorrect >= 100 },
  { id: 'study_500',       name: '500문제 달성',    category: 'study',       rarity: 'epic',   icon: '💎', checkCondition: ctx => ctx.totalCorrect >= 500 },
  // 연속 카테고리 (스트릭/콤보 기반)
  { id: 'streak_3',        name: '3일 연속 학습',   category: 'streak',      rarity: 'common', icon: '🔥', checkCondition: ctx => ctx.streakDays >= 3 },
  { id: 'streak_7',        name: '7일 연속 학습',   category: 'streak',      rarity: 'rare',   icon: '🔥', checkCondition: ctx => ctx.streakDays >= 7 },
  { id: 'streak_30',       name: '30일 연속 학습',  category: 'streak',      rarity: 'epic',   icon: '🌟', checkCondition: ctx => ctx.streakDays >= 30 },
  { id: 'combo_3',         name: '3콤보 달성',      category: 'streak',      rarity: 'common', icon: '⚡', checkCondition: ctx => (ctx.comboMax ?? 0) >= 3 },
  { id: 'combo_5',         name: '5콤보 달성',      category: 'streak',      rarity: 'rare',   icon: '⚡', checkCondition: ctx => (ctx.comboMax ?? 0) >= 5 },
  // 성취 카테고리 (레벨 기반)
  { id: 'level_5',         name: 'Lv.5 달성',      category: 'achievement',  rarity: 'common', icon: '🎯', checkCondition: ctx => ctx.level >= 5 },
  { id: 'level_10',        name: 'Lv.10 달성',     category: 'achievement',  rarity: 'rare',   icon: '🎯', checkCondition: ctx => ctx.level >= 10 },
  { id: 'level_20',        name: 'Lv.20 달성',     category: 'achievement',  rarity: 'epic',   icon: '👑', checkCondition: ctx => ctx.level >= 20 },
  { id: 'level_50',        name: 'Lv.50 달성',     category: 'achievement',  rarity: 'epic',   icon: '🏅', checkCondition: ctx => ctx.level >= 50 },
  // 첫날 2-3개 획득 보장 (first_correct + study_10 기준)
]
```

### Pattern 7: Framer Motion 애니메이션 컴포넌트

```typescript
// XP 플로팅 텍스트 — 위로 떠오르며 사라짐
import { motion, AnimatePresence } from 'framer-motion'

export function XPFloatingText({ amount, visible }: { amount: number; visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 0, y: -60 }}
          exit={{}}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 text-yellow-400 font-bold text-2xl pointer-events-none z-50"
        >
          +{amount} XP
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// XP 바 채움 애니메이션
export function XPBar({ progress }: { progress: number }) {  // progress: 0~1
  return (
    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
        animate={{ width: `${progress * 100}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
    </div>
  )
}

// 레벨업 풀스크린 오버레이 (2-3초)
export function LevelUpOverlay({ newLevel, onDone }: { newLevel: number; onDone: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 10, stiffness: 100 }}
        onAnimationComplete={() => setTimeout(onDone, 2000)}
      >
        <p className="text-yellow-400 text-6xl font-black text-center">LEVEL UP!</p>
        <p className="text-white text-4xl text-center mt-2">Lv. {newLevel}</p>
      </motion.div>
    </motion.div>
  )
}
```

### Pattern 8: 데일리 챌린지 — 날짜 시드 기반 문제 선정

```typescript
// src/lib/gamification/challenge.service.ts
// 날짜 기반 시드로 매일 같은 문제 세트 선택 (요일별 난이도 변동)
export function getDailyChallengeConfig(date: Date): { count: number; difficulty: number } {
  const day = date.getDay()  // 0=일, 6=토
  const isWeekend = day === 0 || day === 6
  return {
    count: isWeekend ? 5 : 3,          // 주말 특별: 5문제
    difficulty: isWeekend ? 3 : (day % 3) + 1  // 요일별 순환 난이도
  }
}

export async function getDailyChallengeQuestions(date: Date) {
  const dateStr = date.toISOString().split('T')[0]  // "2026-02-23"
  const seed = parseInt(dateStr.replace(/-/g, ''), 10)  // 숫자 시드
  const config = getDailyChallengeConfig(date)

  // 시드 기반 문제 선택 (pseudorandom but deterministic)
  const allQuestions = await db.questions.toArray()
  const shuffled = seededShuffle(allQuestions, seed)
  return shuffled.slice(0, config.count)
}
```

### Pattern 9: 리더보드 — 반 내 데이터만

```typescript
// 리더보드: 반 소속 학생들의 gamificationProfiles 조회
export async function getClassLeaderboard(groupId: number, currentStudentId: string) {
  const members = await db.groupMembers.where('groupId').equals(groupId).toArray()
  const studentIds = members.map(m => m.studentId)

  const profiles = await db.gamificationProfiles
    .where('studentId').anyOf(studentIds)
    .toArray()

  const sorted = profiles.sort((a, b) => b.totalXP - a.totalXP)
  const myRank = sorted.findIndex(p => p.studentId === currentStudentId) + 1

  // TOP3 + 내 주변 ±2명
  const top3 = sorted.slice(0, 3)
  const myIndex = myRank - 1
  const surrounding = sorted.slice(Math.max(3, myIndex - 2), myIndex + 3)

  return { sorted, top3, surrounding, myRank, total: sorted.length }
}
```

### Anti-Patterns to Avoid
- **콤보를 DB에 저장:** 콤보는 세션 내 메모리. DB는 XP 이벤트만. (이미 스키마 설계에 comboCount 없음 — 올바름)
- **useLiveQuery 없이 수동 setState:** `awardXP()` 후 별도로 state를 갱신하려 하면 race condition. Dexie reactivity에 맡겨라.
- **XP 계산을 컴포넌트 내부에:** XP 공식 변경 시 수십 군데 수정. `xp-formula.ts` 단일 소스.
- **뱃지를 매 퀴즈마다 전체 DB 스캔:** `checkBadges()`를 xpEvents 집계 후 한 번만 호출. Dexie transaction 내부에서 처리.
- **레벨업 오버레이를 router 레벨에 전역 배치:** 퀴즈 화면 내부에서 로컬로 관리. 전역 Context에 레벨업 이벤트를 emit하면 Context 오염.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| DB 변경 → UI 자동 업데이트 | 수동 event emitter + setState | Dexie `useLiveQuery` | 이미 설치됨. 자동 구독/언구독, StrictMode 안전 |
| 애니메이션 타이밍/easing | CSS transition 수동 관리 | Framer Motion `animate` prop | 이미 설치됨. spring physics, AnimatePresence |
| 날짜 연산 (스트릭 자정 비교) | `new Date()` 직접 조작 | date-fns `isYesterday`, `startOfDay` | edge case 많음 (타임존, DST) |
| 리더보드 정렬 | 직접 정렬 알고리즘 | `Array.sort()` + Dexie query | 단순 XP 정렬은 JS로 충분 |

**Key insight:** Phase 15에서 선택한 Dexie + Framer Motion 스택이 Phase 16의 핵심 요구사항을 이미 100% 커버한다. 추가 라이브러리 없이 구현 가능.

---

## Common Pitfalls

### Pitfall 1: Dexie transaction 외부에서 XP 지급 분산
**What goes wrong:** `awardXP` 중간에 오류 발생 시 XP는 증가했지만 뱃지 기록은 없는 부정합 상태
**Why it happens:** `db.xpEvents.add()`, `db.gamificationProfiles.modify()`, `db.badges.add()`를 개별 await로 호출
**How to avoid:** 반드시 `db.transaction('rw', [...tables], async () => { ... })` 안에서 모든 쓰기 수행
**Warning signs:** 개발 중 새로고침 시 XP와 뱃지 수가 불일치

### Pitfall 2: useLiveQuery dependency 누락
**What goes wrong:** studentId 변경 시 이전 학생 데이터가 계속 표시
**Why it happens:** `useLiveQuery(fn, [])` — 빈 배열로 dependency 설정
**How to avoid:** `useLiveQuery(fn, [studentId])` — 반드시 studentId를 dependency에 포함
**Warning signs:** 로그아웃 후 재로그인 시 이전 유저 데이터 표시

### Pitfall 3: 레벨업 오버레이 무한 재렌더링
**What goes wrong:** `useLiveQuery`로 profile을 구독하면 레벨업 직후 level 변경 → 오버레이 재트리거 → 무한 루프
**Why it happens:** `if (profile.level > prevLevel) showOverlay()` 패턴을 useEffect 안에서 직접 처리
**How to avoid:** `awardXP()` 반환값 `{ leveledUp, newLevel }`을 사용해 단발성 이벤트로 처리. `useRef`로 이전 레벨 추적하지 않기.
**Warning signs:** 레벨업 오버레이가 반복 표시

### Pitfall 4: 스트릭 자정 비교 타임존 오류
**What goes wrong:** UTC 기준으로 비교 시 한국(UTC+9)에서 오전 9시 전에 학습하면 어제 날짜로 처리
**Why it happens:** `new Date().toISOString()`은 UTC 기준
**How to avoid:** `new Date().toLocaleDateString('ko-KR')` 또는 date-fns의 로컬 타임존 함수 사용. `toDateString()`은 로컬 타임존 반환이므로 비교에 안전.
**Warning signs:** 오전 0~9시 학습 시 스트릭이 리셋됨

### Pitfall 5: 데일리 챌린지 완료 중복 지급
**What goes wrong:** 오늘 챌린지 완료 보너스를 여러 번 받을 수 있음
**Why it happens:** 완료 상태를 메모리에만 저장
**How to avoid:** `xpEvents`에서 오늘 날짜의 `reason: 'daily_challenge'` 기록을 조회해 중복 방지. 또는 별도 `dailyChallengeCompletions` 컬럼을 `UserSetting`에 추가.
**Warning signs:** 데일리 챌린지 페이지 재진입 시 보너스 재지급

### Pitfall 6: 리더보드에서 자신의 데이터 누락 (POC 환경)
**What goes wrong:** POC 환경에서는 모든 학생이 같은 브라우저 IndexedDB를 사용. 실제 다른 기기의 학생 데이터가 없음.
**Why it happens:** POC 아키텍처 한계
**How to avoid:** 리더보드 빈 상태 처리 — 자신 1명인 경우 "반원을 초대해보세요!" 메시지. 개발/테스트용 mock 데이터 seed 제공.
**Warning signs:** 리더보드가 항상 1명만 표시

---

## Code Examples

### QuizPlayer에 gamification 연결 — 핵심 통합 패턴

```typescript
// src/routes/student/quiz/index.tsx (기존 QuizPlayer 확장)
import { useCombo } from '@/hooks/useCombo'
import { awardXP, updateStreak } from '@/lib/gamification/gamification.service'
import { getBaseXP } from '@/lib/gamification/xp-formula'

function QuizPageWithGamification() {
  const { studentId } = useAuth()
  const { comboCount, multiplier, onCorrect, onWrong } = useCombo()
  const [xpResult, setXpResult] = useState<AwardXPResult | null>(null)
  const [showLevelUp, setShowLevelUp] = useState(false)

  async function handleAnswerResult(isCorrect: boolean, difficulty: Question['difficulty']) {
    if (!isCorrect) {
      onWrong()
      return
    }

    const comboMultiplier = onCorrect()
    const baseXP = getBaseXP(difficulty)
    const result = await awardXP(studentId, baseXP, 'quiz_correct', comboMultiplier)
    setXpResult(result)

    if (result.leveledUp) setShowLevelUp(true)

    // 스트릭 업데이트 (첫 정답 시 하루 1회)
    await updateStreak(studentId)
  }
  // ...
}
```

### 주간 챌린지 집계

```typescript
// 이번 주 xpEvents 집계
export async function getWeeklyChallengeProgress(studentId: string) {
  const now = new Date()
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7))  // 이번 주 월요일
  monday.setHours(0, 0, 0, 0)

  const weeklyEvents = await db.xpEvents
    .where('studentId').equals(studentId)
    .and(e => e.timestamp >= monday.getTime() && e.reason === 'quiz_correct')
    .toArray()

  const weeklyCorrect = weeklyEvents.length
  const weeklyXP = weeklyEvents.reduce((sum, e) => sum + e.amount, 0)

  // 주간 목표: 50문제 (Claude 재량 — 적절한 기본값)
  const weeklyGoal = 50
  const isCompleted = weeklyCorrect >= weeklyGoal
  const bonusXP = 1000  // 주간 챌린지 완료 보너스

  return { weeklyCorrect, weeklyXP, weeklyGoal, isCompleted, bonusXP }
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Redux/Zustand 전역 상태 관리 | Dexie `useLiveQuery` reactive | Dexie v3+ | 상태 관리 라이브러리 불필요 |
| CSS keyframe 애니메이션 | Framer Motion `AnimatePresence` + spring | 2023+ | 인터럽트 안전, spring physics |
| 별도 gamification 백엔드 | Dexie IndexedDB (POC) | v3.0 결정 | 백엔드 없이 완전 구현 가능 |

**Deprecated/outdated:**
- Redux Toolkit: 이 프로젝트에서는 불필요. Dexie reactivity + React state 조합으로 충분.
- GSAP: 프로젝트 결정으로 제외. Framer Motion만 사용.

---

## Open Questions

1. **date-fns 설치 여부**
   - What we know: 날짜 연산에 필요 (스트릭 자정 비교, 주간 월요일 계산)
   - What's unclear: 현재 프로젝트에 설치되어 있는지 확인 필요
   - Recommendation: `package.json` 확인 후 없으면 `pnpm add date-fns` (2.x 또는 3.x)

2. **데일리 챌린지 완료 상태 영속화 방법**
   - What we know: 중복 지급 방지가 필요
   - What's unclear: 별도 테이블 추가(Dexie version 9 필요) vs xpEvents 조회로 충분한지
   - Recommendation: xpEvents에서 당일 'daily_challenge' reason 조회로 충분. 별도 테이블 불필요.

3. **주간 챌린지 보너스 중복 방지**
   - What we know: 주간 챌린지는 한 주에 한 번만 보상
   - What's unclear: 완료 여부를 어디에 저장하는지
   - Recommendation: xpEvents의 'weekly_challenge' reason으로 이번 주 기록 존재 여부 확인

4. **Dexie `where().anyOf()` 성능 — 리더보드**
   - What we know: 반 학생 수가 수십 명 정도 (소규모)
   - What's unclear: `anyOf(studentIds)` 쿼리가 대규모 studentId 배열에서 느릴 수 있음
   - Recommendation: POC 규모(30명 이하)에서는 문제없음. 충분.

---

## Sources

### Primary (HIGH confidence)
- 프로젝트 소스코드 직접 확인 (`/apps/web/src/lib/db.ts`) — Dexie v8 스키마, GamificationProfile/XPEvent/BadgeRecord 인터페이스 확인
- 프로젝트 소스코드 직접 확인 (`FunModeContext.tsx`) — Phase 15 인프라 패턴 확인
- 프로젝트 소스코드 직접 확인 (`QuizPlayer.tsx`) — `onComplete(isCorrect)` 콜백 인터페이스 확인
- STATE.md — 프로젝트 결정사항 확인 (Dexie, Framer Motion, 번들 전략)

### Secondary (MEDIUM confidence)
- Dexie 공식 문서 패턴 (훈련 데이터 기반) — `useLiveQuery`, `db.transaction`, `where().anyOf()`
- Framer Motion 공식 패턴 — `AnimatePresence`, `motion.div`, spring animations

### Tertiary (LOW confidence)
- 날짜 시드 기반 pseudorandom shuffle — 커뮤니티 패턴, 공식 출처 미확인

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — 기존 코드베이스에서 설치 버전 직접 확인
- Architecture: HIGH — Dexie + Framer Motion 패턴, Phase 15 인프라와 명확한 연결점
- Pitfalls: MEDIUM — Dexie transaction 패턴은 공식, 스트릭 타임존은 경험 기반
- 뱃지 목록/XP 수치: MEDIUM — Claude 재량 영역, 교육 게이미피케이션 연구 기반

**Research date:** 2026-02-23
**Valid until:** 2026-03-23 (Dexie/Framer Motion 안정 버전, 30일 유효)
