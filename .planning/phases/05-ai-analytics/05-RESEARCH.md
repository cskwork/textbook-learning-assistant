# Phase 5: AI 분석 + 학습 리포트 — Research

**Researched:** 2026-02-20
**Domain:** BKT (Bayesian Knowledge Tracing) client-side, Recharts/shadcn chart, Dexie schema migration, streak tracking
**Confidence:** HIGH (core stack), MEDIUM (BKT parameter defaults), HIGH (Dexie migration)

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| AIAN-01 | BKT 모델이 학생의 유형별 지식 상태를 추적한다 | BKT 알고리즘 JS 구현 패턴 문서화 — 4개 파라미터(p_init, p_transit, p_slip, p_guess)와 업데이트 수식 확인 |
| AIAN-02 | 학습 이력 기반으로 취약 유형이 자동 판별된다 | quizAttempts 테이블 기반 questionCategory별 집계 → BKT 지식 상태 낮은 유형 = 취약 유형 |
| AIAN-03 | 취약 유형 기반 맞춤 문제가 추천된다 | BKT 결과(P(L) 낮은 유형) → questions 테이블 필터링 → 아직 안 풀었거나 틀린 문제 우선 정렬 |
| AIAN-04 | 초기 사용자(풀이 30회 미만)에게 단원별 정답률 기반 휴리스틱 분석이 제공된다 | quizAttempts count < 30 조건 분기, questionCategory별 isCorrect 집계로 간단 정답률 계산 |
| AIAN-05 | 신규 사용자에게 온보딩 진단 퀴즈가 제공된다 | 5~10문제 샘플링 → 제출 후 결과를 BKT 초기 상태 seed로 사용 / Dexie에 diagnosisCompleted 플래그 필요 |
| REPT-01 | 유형별 정답률 시각화 차트를 볼 수 있다 | recharts BarChart + shadcn ChartContainer, questionCategory별 정답률 집계 |
| REPT-02 | 회차별(일별/주별) 학습 추이 그래프를 볼 수 있다 | recharts LineChart, quizAttempts.attemptedAt 기반 날짜별 groupBy |
| REPT-03 | 취약 유형 클러스터가 시각적으로 표시된다 | recharts RadarChart 또는 커스텀 grid, BKT P(L) ≤ 0.4 기준 취약 판별 |
| REPT-04 | 전체 학습 통계(총 풀이 수, 정답률, 학습 시간)를 볼 수 있다 | quizAttempts + quizSessions 집계, 카드 UI |
| PLAN-02 | 일일 학습 목표(문제 수)를 설정할 수 있다 | localStorage key "dailyGoal:{email}" — 숫자 저장, 오늘 풀이 수 vs 목표 비교 |
| PLAN-03 | 학습 스트릭(연속 학습 일수)이 기록·표시된다 | quizAttempts.attemptedAt 기반 날짜 배열 집계 → 연속 날짜 카운트, localStorage 캐시 가능 |
</phase_requirements>

---

## Summary

Phase 5는 클라이언트 사이드 전용 POC 아키텍처에서 세 가지 독립된 서브도메인을 구현한다: (1) BKT 모델(순수 JS 함수, 외부 라이브러리 없음), (2) recharts + shadcn/ui chart를 이용한 시각화 대시보드, (3) 스트릭/일일 목표 추적(localStorage + Dexie 집계).

BKT는 수식이 단순하여 JavaScript로 직접 구현 가능하다. 핵심 업데이트 수식은 4줄이며, npm 패키지는 존재하지 않는다(Python/R 생태계에만 존재). 파라미터 기본값은 학술 연구 기반으로 추천값이 있으며 POC 수준에서는 고정값 사용이 적절하다.

recharts는 shadcn/ui의 공식 차트 레이어로, `pnpm dlx shadcn@latest add chart`로 ChartContainer + ChartTooltip 컴포넌트를 추가한 뒤 recharts를 함께 설치한다. React 19와 recharts 2.x는 `react-is` override 없이 설치 시 빈 차트 문제가 발생한다. recharts 3.7.0이 현재 최신이지만 shadcn은 아직 v2 기준으로 동작하므로 **recharts 2.15.x + react-is 19.x override** 조합이 안전하다.

Dexie schema는 현재 version(3)까지 정의되어 있으며, Phase 5에서 `userSettings` 테이블(일일 목표 + 온보딩 진단 완료 플래그)을 추가하려면 version(4)가 필요하다. 스트릭 데이터는 quizAttempts에서 동적 계산하므로 별도 테이블 불필요.

**Primary recommendation:** recharts 2.15.x + shadcn chart component + 순수 JS BKT 구현 조합. react-is override를 root package.json pnpm.overrides에 추가해야 React 19에서 차트가 렌더링된다.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| recharts | 2.15.x | 차트 렌더링 (Bar, Line, Radar) | shadcn/ui 공식 차트 백엔드; React+D3 기반 SVG 차트; 56M downloads/month |
| react-is | 19.x | recharts React 19 호환성 fix | recharts 내부에서 react-is 사용 — React 19와 버전 불일치 시 빈 차트 발생 |
| shadcn chart | (pnpm dlx add) | ChartContainer, ChartTooltip, ChartLegend | 이미 사용 중인 shadcn/ui 생태계; CSS 변수 기반 다크모드 자동 지원 |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| dexie (already installed) | ^4.3.0 | version(4) schema 추가 | userSettings 테이블 (일일 목표 + 온보딩 플래그) |
| dexie-react-hooks (already installed) | ^4.2.0 | useLiveQuery | 차트 데이터 실시간 반응성 |
| lucide-react (already installed) | ^0.511.0 | Flame(스트릭), Target(목표), TrendingUp 아이콘 | 이미 설치됨 |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| recharts | chart.js + react-chartjs-2 | Chart.js는 Canvas 기반 — SVG 기반 recharts가 shadcn 테마 통합에 더 적합 |
| recharts | victory | Victory는 더 복잡하고 번들 크기 큼 |
| recharts | visx | Visx는 low-level D3 래퍼 — 학습 비용 높음 |
| 직접 구현 BKT | pyBKT npm wrapper | JS용 BKT npm 패키지 없음 (Python/R만 존재); 4개 파라미터 수식 직접 구현이 가장 현실적 |

### Installation

```bash
# apps/web에서 실행
pnpm add recharts react-is

# shadcn chart 컴포넌트 추가 (apps/web 디렉터리에서)
pnpm dlx shadcn@latest add chart
```

Root `package.json`에 pnpm override 추가 (React 19 호환성):
```json
{
  "pnpm": {
    "onlyBuiltDependencies": ["bcrypt"],
    "overrides": {
      "react-is": "$react-is"
    }
  }
}
```

apps/web/package.json에도 react-is를 dependencies에 추가:
```json
{
  "dependencies": {
    "react-is": "^19.0.0"
  }
}
```

---

## Architecture Patterns

### Recommended Project Structure

```
apps/web/src/
├── lib/
│   ├── db.ts               # version(4) 추가 — userSettings 테이블
│   └── bkt.ts              # BKT 모델 순수 함수 (NEW)
├── services/
│   ├── analytics.service.ts # 집계 쿼리 (NEW)
│   └── streak.service.ts    # 스트릭 계산 (NEW)
├── components/
│   ├── ui/chart.tsx         # shadcn chart (shadcn add로 생성)
│   └── analytics/
│       ├── AccuracyBarChart.tsx      # REPT-01
│       ├── DailyTrendLineChart.tsx   # REPT-02
│       ├── WeakTypeRadarChart.tsx    # REPT-03
│       ├── SummaryStatsCards.tsx     # REPT-04
│       ├── StreakBadge.tsx           # PLAN-03
│       └── DailyGoalProgress.tsx    # PLAN-02
├── routes/student/
│   └── analytics/
│       └── index.tsx         # /student/analytics 대시보드 페이지
└── routes/student/
    └── onboarding-quiz/
        └── index.tsx         # /student/onboarding-quiz (AIAN-05)
```

### Pattern 1: BKT 순수 함수 구현

**What:** 4개 파라미터로 학습 이력을 순회하며 유형별 P(L) (지식 상태 확률) 계산
**When to use:** quizAttempts에서 questionCategory별 시도 기록을 읽어 BKT 실행 시

BKT 수식 (출처: Wikipedia Bayesian knowledge tracing, academic papers):

```typescript
// Source: https://en.wikipedia.org/wiki/Bayesian_knowledge_tracing
// apps/web/src/lib/bkt.ts

export interface BKTParams {
  pInit: number      // P(L_0): 초기 지식 보유 확률 (기본값: 0.1)
  pTransit: number   // P(T): 미습득 → 습득 전이 확률 (기본값: 0.3)
  pSlip: number      // P(S): 알면서 틀릴 확률 (기본값: 0.1)
  pGuess: number     // P(G): 모르면서 맞힐 확률 (기본값: 0.2)
}

export const DEFAULT_BKT_PARAMS: BKTParams = {
  pInit: 0.1,
  pTransit: 0.3,
  pSlip: 0.1,
  pGuess: 0.2,
}

/** 한 번의 시도 후 P(L) 업데이트 */
export function updateBKT(pL: number, isCorrect: boolean, params: BKTParams): number {
  const { pTransit, pSlip, pGuess } = params

  // 사후 확률 (Bayes 업데이트)
  const posterior = isCorrect
    ? (pL * (1 - pSlip)) / (pL * (1 - pSlip) + (1 - pL) * pGuess)
    : (pL * pSlip) / (pL * pSlip + (1 - pL) * (1 - pGuess))

  // 전이 확률 적용 (다음 기회에서의 P(L))
  return posterior + (1 - posterior) * pTransit
}

/** 시도 배열로 최종 P(L) 계산 */
export function computeBKT(
  attempts: { isCorrect: boolean }[],
  params: BKTParams = DEFAULT_BKT_PARAMS,
): number {
  let pL = params.pInit
  for (const attempt of attempts) {
    pL = updateBKT(pL, attempt.isCorrect, params)
  }
  return pL
}

/** 취약 유형 판별 임계값 — P(L) < 0.4 이면 취약 */
export const WEAK_THRESHOLD = 0.4
/** 숙달 판별 임계값 — P(L) >= 0.95 이면 숙달 */
export const MASTERY_THRESHOLD = 0.95
```

**파라미터 기본값 근거** (MEDIUM confidence):
- pInit=0.1: 신규 학생은 대부분의 유형을 모른다고 가정 (conservative)
- pTransit=0.3: 한 번 풀이 기회당 30% 학습 전이 (standard-bkt 예시 pT=0.35 참고)
- pSlip=0.1: 알면서 실수할 확률 10% (≤0.1 권장)
- pGuess=0.2: 모르면서 찍을 확률 20% (≤0.3 권장)

### Pattern 2: analytics.service.ts — 집계 쿼리

**What:** quizAttempts 테이블 기반 통계 계산 함수들
**When to use:** 대시보드 페이지 로드 시

```typescript
// apps/web/src/services/analytics.service.ts

/** 유형별 정답률 집계 — REPT-01, AIAN-02 */
export async function getCategoryAccuracy(studentId: string): Promise<
  { category: string; accuracy: number; total: number }[]
> {
  const attempts = await db.quizAttempts
    .where('studentId').equals(studentId)
    .toArray()

  // questionId → questionCategory 매핑 필요 — questions 테이블 조인
  const questions = await db.questions.toArray()
  const categoryMap = new Map(questions.map(q => [q.id, q.questionCategory]))

  const grouped = new Map<string, { correct: number; total: number }>()
  for (const attempt of attempts) {
    const cat = categoryMap.get(attempt.questionId) ?? '기타'
    const current = grouped.get(cat) ?? { correct: 0, total: 0 }
    grouped.set(cat, {
      correct: current.correct + (attempt.isCorrect ? 1 : 0),
      total: current.total + 1,
    })
  }

  return Array.from(grouped.entries()).map(([category, { correct, total }]) => ({
    category,
    accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
    total,
  }))
}

/** 일별 풀이 수 집계 — REPT-02 */
export async function getDailyStats(studentId: string, days = 14): Promise<
  { date: string; count: number; correct: number }[]
> {
  const since = Date.now() - days * 24 * 60 * 60 * 1000
  const attempts = await db.quizAttempts
    .where('studentId').equals(studentId)
    .filter(a => a.attemptedAt >= since)
    .toArray()

  const dayMap = new Map<string, { count: number; correct: number }>()
  for (const attempt of attempts) {
    const dateKey = new Date(attempt.attemptedAt).toISOString().slice(0, 10) // YYYY-MM-DD
    const current = dayMap.get(dateKey) ?? { count: 0, correct: 0 }
    dayMap.set(dateKey, {
      count: current.count + 1,
      correct: current.correct + (attempt.isCorrect ? 1 : 0),
    })
  }

  // 날짜 채우기 (빈 날짜 = 0)
  const result = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    const dateKey = d.toISOString().slice(0, 10)
    const stats = dayMap.get(dateKey) ?? { count: 0, correct: 0 }
    result.push({ date: dateKey, ...stats })
  }
  return result
}

/** 전체 학습 통계 — REPT-04 */
export async function getOverallStats(studentId: string) {
  const attempts = await db.quizAttempts.where('studentId').equals(studentId).toArray()
  const sessions = await db.quizSessions.where('studentId').equals(studentId).toArray()
  const totalTimeSpent = sessions.reduce((sum, s) => sum + (s.timeSpent ?? 0), 0)

  return {
    total: attempts.length,
    correct: attempts.filter(a => a.isCorrect).length,
    accuracy: attempts.length > 0 ? Math.round((attempts.filter(a => a.isCorrect).length / attempts.length) * 100) : 0,
    totalTimeSeconds: totalTimeSpent,
  }
}
```

### Pattern 3: Dexie version(4) — userSettings 테이블

**What:** 일일 목표 및 온보딩 진단 완료 플래그 저장
**Why:** 일일 목표는 사용자별 영속 설정이므로 localStorage보다 Dexie가 일관성 있음

```typescript
// db.ts에 추가

export interface UserSetting {
  id: number
  userId: string         // user email
  dailyGoal: number      // 일일 목표 문제 수 (기본: 10)
  isDiagnosisCompleted: boolean  // 온보딩 진단 퀴즈 완료 여부
}

// version(4) 추가 — 기존 version(3) 절대 수정하지 말 것
db.version(4).stores({
  questions: '++id, subject, unit, questionCategory, difficulty, createdAt, createdBy',
  quizSessions: '++id, questionId, studentId, startedAt',
  quizAttempts: '++id, questionId, studentId, sessionId, attemptedAt, isCorrect',
  wrongNotes: '++id, questionId, studentId, [questionId+studentId], unit, questionCategory, lastWrongAt',
  workbooks: '++id, studentId, createdAt',
  userSettings: '++id, &userId',   // userId 유니크 인덱스
})
```

### Pattern 4: streak.service.ts — 스트릭 계산

**What:** quizAttempts.attemptedAt 기반 연속 학습 일수 계산
**When to use:** 홈 화면 + 분석 대시보드에서 스트릭 표시

```typescript
// apps/web/src/services/streak.service.ts

/** quizAttempts에서 학습한 날짜 배열 추출 → 연속 일수 계산 */
export async function getStreak(studentId: string): Promise<{
  current: number   // 현재 연속 학습 일수
  max: number       // 최대 연속 학습 일수
}> {
  const attempts = await db.quizAttempts
    .where('studentId').equals(studentId)
    .toArray()

  if (attempts.length === 0) return { current: 0, max: 0 }

  // 학습한 날짜 유니크 집합 (YYYY-MM-DD)
  const dateSet = new Set(
    attempts.map(a => new Date(a.attemptedAt).toISOString().slice(0, 10))
  )
  const sortedDates = [...dateSet].sort()

  // 오늘 또는 어제 마지막 학습 여부 확인 (스트릭 유효성)
  const today = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  const lastDate = sortedDates[sortedDates.length - 1]
  if (lastDate !== today && lastDate !== yesterday) return { current: 0, max: 0 }

  // 연속 일수 역방향 계산
  let current = 1
  let max = 1
  let tempStreak = 1

  for (let i = sortedDates.length - 2; i >= 0; i--) {
    const diff = new Date(sortedDates[i + 1]).getTime() - new Date(sortedDates[i]).getTime()
    if (diff === 86400000) { // 정확히 1일 차이
      tempStreak++
      if (i === sortedDates.length - 2) current = tempStreak
    } else {
      tempStreak = 1
    }
    max = Math.max(max, tempStreak)
  }

  return { current, max }
}
```

### Pattern 5: shadcn ChartContainer + recharts 사용 패턴

```typescript
// 예시: 유형별 정답률 Bar 차트
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

const chartConfig = {
  accuracy: { label: '정답률 (%)', color: 'hsl(var(--chart-1))' },
}

// ChartContainer requires min-h 클래스
<ChartContainer config={chartConfig} className="min-h-[200px] w-full">
  <BarChart data={data}>
    <CartesianGrid vertical={false} />
    <XAxis dataKey="category" />
    <YAxis domain={[0, 100]} />
    <ChartTooltip content={<ChartTooltipContent />} />
    <Bar dataKey="accuracy" fill="var(--color-accuracy)" radius={4} />
  </BarChart>
</ChartContainer>
```

### Pattern 6: 온보딩 진단 퀴즈 (AIAN-05)

**What:** 신규 사용자 최초 로그인 시 5~10문제 퀴즈 → BKT 초기 seed
**Flow:**
1. `userSettings.isDiagnosisCompleted === false` → `/student/onboarding-quiz` 리디렉트
2. questions 테이블에서 각 subject별 1~2문제 샘플링 (최대 10문제)
3. 퀴즈 완료 → `submitQuizAttempt` 호출 (기존 로직 재사용)
4. `isDiagnosisCompleted = true` 저장 → 홈으로 리디렉트

**Edge case:** questions 테이블이 비어 있으면 진단 퀴즈 스킵 + 완료 처리

### Pattern 7: AI 추천 로직 (AIAN-03)

**What:** BKT P(L) 가장 낮은 유형의 문제 중 최근에 맞힌 문제는 제외하고 추천
**Algorithm:**
1. `computeBKT()` 실행 → categoryBKT Map 생성
2. P(L) 오름차순 정렬 → 상위 3개 취약 유형 선택
3. 해당 유형의 questions 중 최근 7일 내 isCorrect=true인 questionId 제외
4. 최대 5개 반환

### Anti-Patterns to Avoid

- **recharts + React 19 — react-is override 누락:** 빈 차트 문제. root package.json pnpm.overrides 필수
- **db.version(3) 직접 수정:** 기존 사용자 IndexedDB 깨짐. 반드시 version(4) 신규 추가
- **BKT 집계를 매 렌더링마다 실행:** quizAttempts 전체를 매번 읽으면 느림. useMemo 또는 서비스 레이어 캐싱 필요
- **ResponsiveContainer 안에 또 다른 ResponsiveContainer 중첩:** shadcn ChartContainer가 이미 responsive wrapper 역할. 중복 사용 금지
- **recharts 3.x + shadcn chart:** shadcn은 아직 recharts 2.x 기준 (issue #7669). recharts 3.x는 CategoricalChartState 제거로 shadcn 내부 호환성 미검증

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| SVG 차트 | 직접 `<svg>` 코딩 | recharts + shadcn chart | axis, tooltip, responsive, 다크모드를 모두 직접 처리해야 함 |
| 날짜 포맷팅 | 복잡한 Date 유틸 | `toISOString().slice(0,10)` | YYYY-MM-DD 문자열 비교가 가장 단순하고 신뢰할 수 있음 |
| BKT 수식 검증 | 직접 수학 증명 | Wikipedia BKT 수식 + CAHLR/pyBKT 코드 참조 | 검증된 수식 그대로 사용 |
| 스트릭 라이브러리 | date-streaks npm | 직접 구현 | 로직이 단순 (10줄), 의존성 추가 불필요 |

**Key insight:** BKT의 실제 구현 난이도는 낮다. 수식 4줄, 파라미터 4개. 복잡하게 보이지만 JavaScript 단순 함수로 충분히 구현 가능하다.

---

## Common Pitfalls

### Pitfall 1: React 19에서 recharts 빈 차트

**What goes wrong:** recharts 컴포넌트가 렌더링되지 않고 빈 공간만 표시. 콘솔 에러 없음.
**Why it happens:** recharts 내부에서 사용하는 `react-is` 패키지 버전이 React 19와 불일치
**How to avoid:**
1. root `package.json`에 `"pnpm": { "overrides": { "react-is": "$react-is" } }` 추가
2. apps/web/package.json에 `"react-is": "^19.0.0"` dependencies 추가
3. `pnpm install` 재실행
**Warning signs:** 차트 컨테이너 크기는 정상, 내부 컨텐츠 없음

### Pitfall 2: Dexie version 덮어쓰기

**What goes wrong:** 기존 사용자의 IndexedDB 스키마 마이그레이션 실패 → 앱 크래시
**Why it happens:** 기존 version(3)을 수정하면 Dexie가 diff 계산 실패
**How to avoid:** 항상 `db.version(4).stores({...})` 새 버전 추가. 기존 버전은 주석으로 "절대 수정 금지" 명시
**Warning signs:** DevTools → Application → IndexedDB에서 버전 확인

### Pitfall 3: BKT 콜드스타트 문제

**What goes wrong:** 신규 사용자는 quizAttempts가 없어 BKT 실행 불가 → 추천 없음
**Why it happens:** P(L) = pInit(0.1) 고정 상태 — 모든 유형이 동일 취약도
**How to avoid:**
1. quizAttempts.count < 30 조건으로 분기 (AIAN-04 휴리스틱 모드)
2. 온보딩 진단 퀴즈(AIAN-05)로 최소 5~10개 시드 데이터 생성
**Warning signs:** getCategoryAccuracy 결과가 빈 배열 또는 전부 0%

### Pitfall 4: questions 테이블 조인 성능

**What goes wrong:** analytics 집계 시 questions 전체 + quizAttempts 전체를 in-memory join → 문제 수 증가 시 느려짐
**Why it happens:** Dexie는 SQL JOIN 없음, in-memory 처리 필수
**How to avoid:** `new Map(questions.map(q => [q.id, q.questionCategory]))` 패턴으로 O(n) 조인. useMemo로 캐싱
**Warning signs:** 분석 대시보드 로딩이 1초 이상 걸림

### Pitfall 5: recharts 3.x + shadcn chart 미호환

**What goes wrong:** `pnpm dlx shadcn@latest add chart` 후 recharts 3.x가 설치되면 ChartContainer 내부 로직과 충돌
**Why it happens:** shadcn chart 컴포넌트가 recharts 2.x API 기준으로 작성됨 (issue #7669 진행 중)
**How to avoid:** 설치 후 `package.json`에서 recharts 버전 확인, 3.x이면 2.15.x로 다운그레이드
```bash
pnpm add recharts@2.15.1 --filter web
```

### Pitfall 6: 스트릭 계산 타임존 문제

**What goes wrong:** UTC 기준 날짜 분리 시 로컬 자정이 다른 날로 분류됨
**Why it happens:** `toISOString()`은 UTC 기준 → 한국(UTC+9)에서 오전 9시 이전 풀이가 전날로 집계
**How to avoid:** 날짜 분리 시 로컬 타임존 사용:
```typescript
const dateKey = new Date(attempt.attemptedAt).toLocaleDateString('ko-KR', {
  year: 'numeric', month: '2-digit', day: '2-digit'
}).replace(/\. /g, '-').replace('.', '')
// 또는 간단하게:
const d = new Date(attempt.attemptedAt)
const dateKey = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
```

---

## Code Examples

### BKT 전체 파이프라인 — 유형별 취약점 판별

```typescript
// Source: BKT 수식 — https://en.wikipedia.org/wiki/Bayesian_knowledge_tracing
import { computeBKT, WEAK_THRESHOLD, DEFAULT_BKT_PARAMS } from '@/lib/bkt'
import { getCategoryAccuracy } from '@/services/analytics.service'

async function getWeakCategories(studentId: string): Promise<string[]> {
  const attempts = await db.quizAttempts.where('studentId').equals(studentId).toArray()
  const questions = await db.questions.toArray()
  const categoryMap = new Map(questions.map(q => [q.id, q.questionCategory]))

  // questionCategory별 시도 기록 그루핑
  const grouped = new Map<string, { isCorrect: boolean }[]>()
  for (const attempt of attempts) {
    const cat = categoryMap.get(attempt.questionId) ?? '기타'
    const list = grouped.get(cat) ?? []
    list.push({ isCorrect: attempt.isCorrect })
    grouped.set(cat, list)
  }

  // BKT 실행
  const bktResults: { category: string; pL: number }[] = []
  for (const [category, categoryAttempts] of grouped) {
    const pL = computeBKT(categoryAttempts, DEFAULT_BKT_PARAMS)
    bktResults.push({ category, pL })
  }

  // P(L) < WEAK_THRESHOLD(0.4)인 유형 = 취약 유형
  return bktResults
    .filter(r => r.pL < WEAK_THRESHOLD)
    .sort((a, b) => a.pL - b.pL)
    .map(r => r.category)
}
```

### recharts + shadcn chart — BarChart 기본 패턴

```typescript
// Source: https://ui.shadcn.com/docs/components/chart
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

const chartConfig = {
  accuracy: { label: '정답률 (%)', color: 'hsl(var(--chart-1))' },
} satisfies ChartConfig

export function AccuracyBarChart({ data }: { data: { category: string; accuracy: number }[] }) {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <BarChart data={data} accessibilityLayer>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="category" tickLine={false} axisLine={false} />
        <YAxis domain={[0, 100]} tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="accuracy" fill="var(--color-accuracy)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}
```

### Dexie version(4) 추가 — userSettings

```typescript
// db.ts에 추가할 부분
// ⚠️ 기존 version(1)~version(3) 절대 수정 금지

export interface UserSetting {
  id: number
  userId: string
  dailyGoal: number
  isDiagnosisCompleted: boolean
}

// version(4): AI 분석 + 학습 설정 테이블 추가
db.version(4).stores({
  questions: '++id, subject, unit, questionCategory, difficulty, createdAt, createdBy',
  quizSessions: '++id, questionId, studentId, startedAt',
  quizAttempts: '++id, questionId, studentId, sessionId, attemptedAt, isCorrect',
  wrongNotes: '++id, questionId, studentId, [questionId+studentId], unit, questionCategory, lastWrongAt',
  workbooks: '++id, studentId, createdAt',
  userSettings: '++id, &userId',
})
```

### 내비게이션에 분석 탭 추가

```typescript
// _layout.tsx studentNavItems 배열에 추가
import { BarChart2 } from 'lucide-react'

const studentNavItems: NavItem[] = [
  { path: '/student', label: '홈', icon: Home },
  { path: '/student/problems', label: '문제풀기', icon: BookOpenCheck },
  { path: '/student/wrong-notes', label: '오답노트', icon: BookOpen },
  { path: '/student/workbooks', label: '문제집', icon: BookMarked },
  { path: '/student/analytics', label: '분석', icon: BarChart2 },  // 추가
  // /student/profile은 5개 탭 제한으로 제거하거나 대시보드 내 링크로 이동
]
// ⚠️ 하단 탭바는 5개까지 적절 (모바일 공간 제한). Profile을 analytics로 교체하거나 6번째 슬롯 확인 필요
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| chart.js + react-chartjs-2 | recharts + shadcn chart | shadcn chart 출시 (2024) | shadcn 생태계 표준화; 테마 자동 연동 |
| Python/Server-side BKT | Client-side JS BKT (POC) | 아키텍처 피벗 (2026-02 결정) | 백엔드 없이 구현 가능; 데이터 확보 후 Python으로 이전 가능 |
| LocalStorage streak | quizAttempts 기반 동적 계산 | Phase 5 설계 | 별도 저장소 불필요; 항상 최신 데이터 반영 |

**Deprecated/outdated:**
- recharts 2.12.x 이하: React 19 호환 없음 (2.15.x부터 가능)
- Dexie version().stores() 기존 버전 수정: Dexie 4.x에서도 여전히 금지 패턴

---

## Open Questions

1. **하단 탭바 6번째 항목 (분석 탭 추가)**
   - What we know: 현재 studentNavItems에 홈, 문제풀기, 오답노트, 문제집, 마이페이지 5개
   - What's unclear: 분석 탭 추가 시 6개 → 모바일 하단탭 공간 부족 가능성
   - Recommendation: '마이페이지' 탭을 '분석' 탭으로 교체하거나, 분석을 홈 대시보드에 통합 (별도 /analytics 라우트 + 홈에서 링크)

2. **온보딩 진단 퀴즈 스킵 처리**
   - What we know: questions 테이블이 비어있으면 퀴즈 불가
   - What's unclear: 언제 isDiagnosisCompleted를 자동 완료 처리할지
   - Recommendation: questions.count() === 0 이면 진단 퀴즈 스킵하고 isDiagnosisCompleted=true 설정

3. **BKT 파라미터 튜닝**
   - What we know: 기본값(pInit=0.1, pTransit=0.3, pSlip=0.1, pGuess=0.2)은 POC에 적절
   - What's unclear: 실제 학생 데이터 없이 파라미터 최적화 불가
   - Recommendation: POC에서는 하드코딩 DEFAULT_BKT_PARAMS 사용. v2에서 EM 알고리즘으로 피팅

4. **recharts 설치 후 버전 확인**
   - What we know: `pnpm dlx shadcn@latest add chart`가 recharts 3.x를 설치할 수 있음
   - What's unclear: shadcn CLI가 구체적으로 어떤 recharts 버전을 설치하는지
   - Recommendation: 설치 후 package.json에서 recharts 버전 확인. 3.x이면 `pnpm add recharts@2.15.1 --filter web`으로 다운그레이드

---

## Sources

### Primary (HIGH confidence)
- shadcn/ui 공식 문서 (https://ui.shadcn.com/docs/components/chart) — ChartContainer, ChartConfig, 설치 방법
- recharts GitHub issue #4558 (https://github.com/recharts/recharts/issues/4558) — React 19 호환 해결책
- recharts 3.0 migration guide (https://github.com/recharts/recharts/wiki/3.0-migration-guide) — 브레이킹 체인지
- Dexie 공식 문서 (https://dexie.org/docs/Dexie/Dexie.version()) — 버전 마이그레이션 패턴
- 기존 codebase db.ts — 현재 schema (version 1~3) 확인

### Secondary (MEDIUM confidence)
- standard-bkt (https://iedms.github.io/standard-bkt/) — BKT 기본 파라미터 예시값
- pyBKT arXiv paper — pT=0.30, pG=0.10, pS=0.03, pL0=0.10 예시
- bstefanski.com blog (https://www.bstefanski.com/blog/recharts-empty-chart-react-19) — react-is fix 구체적 방법

### Tertiary (LOW confidence)
- WebSearch: BKT default parameters — 학술 예시를 POC에 적용하는 것은 검증 필요
- WebSearch: 스트릭 트래킹 패턴 — 다양한 구현 방식 중 하나를 선택

---

## Metadata

**Confidence breakdown:**
- Standard stack (recharts + shadcn chart): HIGH — 공식 문서 확인, shadcn이 recharts를 공식 백엔드로 채택
- React 19 + recharts 호환 fix: HIGH — GitHub issue + 실사용 블로그 교차 확인
- BKT 수식: HIGH — Wikipedia + 학술 논문 일치
- BKT 파라미터 기본값: MEDIUM — 학술 예시 참조, POC에는 충분
- Dexie version migration: HIGH — 공식 문서 확인
- 스트릭 로직: HIGH — 표준 날짜 비교 패턴, 단순하고 검증됨

**Research date:** 2026-02-20
**Valid until:** 2026-03-20 (recharts/shadcn 버전 변경 가능성으로 30일)
