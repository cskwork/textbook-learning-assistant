# Phase 19: 게임화 퀴즈 엔진 - Research

**Researched:** 2026-02-24
**Domain:** 게임 모드 퀴즈 엔진 (타임어택, 서바이벌, 보스배틀, 미니게임) + 결과 화면
**Confidence:** HIGH

## Summary

Phase 19는 FunMode 활성화 시 4가지 게임 모드(타임어택, 서바이벌, 보스배틀, 미니게임)로 수학 문제를 풀 수 있는 게임화 퀴즈 엔진을 구현한다. 기존 QuizPlayer는 일반 모드 전용으로 유지하고, 별도의 GameQuiz 컴포넌트 계층을 구축한다.

핵심 기술 스택은 이미 프로젝트에 설치된 Phaser 3.90 (미니게임), Framer Motion (React UI 애니메이션), Dexie v8 (gameRecords 테이블)이며, Phase 15-18에서 확립된 PhaserBridge/EventBus/FunModeContext/VFX/Sound 패턴을 그대로 활용한다.

**Primary recommendation:** React 컴포넌트 기반으로 타임어택/서바이벌/보스배틀 3개 모드를 구현하고, Phaser 기반 Canvas 미니게임은 PhaserBridge POC 패턴을 확장하여 별도 구현. 공통 GameSession 상태 머신 + 공통 결과 화면으로 4개 모드를 통합.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- 홈 화면 또는 퀴즈 시작 시 "모드 선택" 카드 UI 표시 (FunMode 활성 시에만)
- 모드 선택: 일반(기존), 타임어택, 서바이벌, 보스배틀, 미니게임
- FunMode OFF 시 기존 QuizPlayer만 사용 (모드 선택 UI 미노출)
- 타임어택: 난이도별 차등 시간 (쉬움 30초, 보통 20초, 어려움 15초/문제), 원형 프로그레스 + 숫자 카운트다운, 연속 10문제 세트
- 서바이벌: 하트 3개 (빨간 하트 SVG), 오답 시 하트 깨지는 애니메이션 + shake, 10문제마다 하트 1개 회복
- 보스배틀: SVG 일러스트 보스 (이모지 금지), HP 100 정답 10 데미지, RPG 턴제 전투 느낌, 보스 처치 시 보스 뱃지
- 미니게임: Phaser 기반 Canvas, "수식 조합" 첫 미니게임, MiniGameRegistry 패턴
- 결과 화면: 공통 컴포넌트, 모드명/정답비율/점수/XP/소요시간, Personal Best "NEW RECORD!" 배너
- 기록은 Dexie gameRecords 테이블에 저장
- "다시 하기" / "모드 선택으로" / "홈으로" 버튼

### Claude's Discretion
- 각 모드의 정확한 XP 보상 공식
- 보스 SVG 디자인 디테일
- 미니게임 물리/게임플레이 세부 밸런스
- 결과 화면 애니메이션 디테일
- 타이머 UI 정확한 색상/크기

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| GAME-01 | 타임어택 모드에서 제한 시간 내 최대한 많은 문제 풀기 | React 컴포넌트 + useTimer 훅 확장, 원형 프로그레스 SVG |
| GAME-02 | 서바이벌 모드에서 3번 틀리면 종료 | React 컴포넌트 + 하트 SVG + Framer Motion 깨짐 효과 |
| GAME-03 | 보스 배틀 모드에서 보스 HP 깎는 방식 | React 컴포넌트 + SVG 보스 + HP 바 + 공격 애니메이션 |
| GAME-04 | 보스 배틀 공격/피격 애니메이션 | Framer Motion variants + SVG transform 애니메이션 |
| GAME-05 | 게임 모드 결과 화면 (점수/XP/신기록) | 공통 GameResult 컴포넌트 + Dexie gameRecords |
| GAME-06 | Canvas 기반 미니게임 (수식 조합 등) | Phaser 3.90 PhaserBridge 패턴 확장, MiniGameRegistry |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React 19 | 19.x | 게임 모드 UI 컴포넌트 | 프로젝트 기존 스택 |
| Phaser | 3.90.0 | Canvas 미니게임 (수식 조합) | Phase 15 POC 검증 완료, dynamic import |
| Framer Motion | 12.x | 애니메이션 (공격/피격/하트 깨짐/결과) | Phase 14+ 프로젝트 도입 완료 |
| Dexie | 4.x (v8 schema) | gameRecords 테이블 | Phase 15 v8 마이그레이션 완료 |
| Tailwind v4 | CSS-first | 스타일링 | 프로젝트 표준 |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Howler.js | 2.2.4 | SFX 재생 (정답/오답/보스공격) | Phase 17 SoundManager 통해 사용 |
| canvas-confetti | 1.9.4 | 결과 화면 축하 효과 | Phase 18 ConfettiEffect 재사용 |
| EventBus | 내부 구현 | Phaser-React 통신 | 미니게임 점수/상태 전달 |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| SVG 보스 캐릭터 | Phaser Sprite | SVG는 React 내 제어 용이, Phaser는 Canvas 내부만 — SVG 선택 (유저 결정) |
| CSS animation 타이머 | SVG 원형 프로그레스 | SVG stroke-dasharray가 원형 프로그레스에 최적 |
| useReducer 상태머신 | XState | useReducer가 이미 QuizPlayer 패턴, 추가 의존성 불필요 |

## Architecture Patterns

### Recommended Project Structure
```
apps/web/src/
├── components/game/quiz/        # 게임 퀴즈 모드 컴포넌트
│   ├── GameModeSelector.tsx     # 모드 선택 카드 UI
│   ├── GameQuizShell.tsx        # 공통 게임 퀴즈 쉘 (HUD + 문제 표시)
│   ├── TimeAttackMode.tsx       # 타임어택 모드
│   ├── SurvivalMode.tsx         # 서바이벌 모드
│   ├── BossBattleMode.tsx       # 보스배틀 모드
│   ├── GameResult.tsx           # 공통 결과 화면
│   ├── CircularTimer.tsx        # 원형 타이머 (SVG)
│   ├── HeartDisplay.tsx         # 하트 표시 + 깨짐 애니메이션
│   ├── BossCharacter.tsx        # 보스 SVG + 공격/피격 애니메이션
│   └── HpBar.tsx                # HP 바 (보스/플레이어)
├── components/game/minigame/    # Phaser 미니게임
│   ├── MiniGameBridge.tsx       # PhaserBridge 확장
│   ├── MiniGameRegistry.ts      # 미니게임 등록/조회
│   └── scenes/                  # Phaser 씬
│       └── FormulaComboScene.ts # 수식 조합 미니게임
├── hooks/
│   ├── useGameSession.ts        # 게임 세션 상태머신 (공통)
│   └── useGameRecords.ts        # Dexie gameRecords CRUD
├── lib/
│   └── gamification/
│       └── game-records.service.ts  # 기록 저장/조회/최고기록 비교
└── lib/db.ts                    # version(9) gameRecords 테이블 추가
```

### Pattern 1: GameSession 상태 머신 (useReducer)
**What:** 모든 게임 모드에서 공유하는 퀴즈 세션 상태 관리
**When to use:** 타임어택/서바이벌/보스배틀 모든 모드
**Example:**
```typescript
type GamePhase = 'ready' | 'playing' | 'paused' | 'finished'
type GameMode = 'timeAttack' | 'survival' | 'bossBattle'

interface GameState {
  phase: GamePhase
  mode: GameMode
  currentQuestionIndex: number
  questions: Question[]
  correctCount: number
  totalScore: number
  xpEarned: number
  timeElapsed: number
  // 모드별 확장
  hearts?: number          // survival
  bossHp?: number          // bossBattle
  playerHp?: number        // bossBattle
  timeRemaining?: number   // timeAttack
}
```

### Pattern 2: SVG 원형 타이머
**What:** stroke-dasharray + stroke-dashoffset로 원형 프로그레스 구현
**When to use:** 타임어택 카운트다운
**Example:**
```typescript
// circumference = 2 * PI * radius
// offset = circumference * (1 - progress)
const circumference = 2 * Math.PI * 45 // radius=45
const offset = circumference * (1 - timeRemaining / totalTime)

<svg viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="45"
    stroke-dasharray={circumference}
    stroke-dashoffset={offset}
    className="transition-all duration-1000 ease-linear"
  />
  <text x="50" y="50" textAnchor="middle" dominantBaseline="central">
    {timeRemaining}
  </text>
</svg>
```

### Pattern 3: PhaserBridge 확장 (미니게임)
**What:** Phase 15 POC PhaserBridge를 미니게임용으로 확장
**When to use:** Canvas 미니게임 (수식 조합 등)
**Example:**
```typescript
// MiniGameRegistry: 씬 키 → 씬 클래스 매핑
const MINI_GAME_REGISTRY = new Map<string, typeof Phaser.Scene>()

export function registerMiniGame(key: string, SceneClass: typeof Phaser.Scene) {
  MINI_GAME_REGISTRY.set(key, SceneClass)
}

// MiniGameBridge: PhaserBridge 확장하여 씬을 동적으로 로드
// EventBus로 React에 점수/완료 이벤트 전달
EventBus.emit('minigame-complete', { score, xp })
```

### Pattern 4: 보스 RPG 턴제 전투 레이아웃
**What:** 플레이어 좌측, 보스 우측 배치 + 턴 기반 공격 애니메이션
**When to use:** 보스배틀 모드
**Example:**
```typescript
// Framer Motion variants로 공격/피격 애니메이션
const attackVariants = {
  idle: { x: 0, scale: 1 },
  attack: { x: 50, scale: 1.1, transition: { duration: 0.3, yoyo: true } },
  hit: { x: -10, opacity: 0.5, transition: { duration: 0.2, repeat: 2 } }
}
```

### Anti-Patterns to Avoid
- **Phaser로 React UI 구현하지 말 것:** 타임어택/서바이벌/보스배틀은 React 컴포넌트로. Phaser는 Canvas 미니게임 전용.
- **QuizPlayer 직접 수정하지 말 것:** 기존 QuizPlayer는 일반 모드 전용. 게임 모드는 별도 컴포넌트.
- **게임 상태를 Context에 넣지 말 것:** useReducer 로컬 상태로 관리. 60fps 리렌더링 방지.
- **보스 SVG에 이모지 사용 금지:** 유저 결정 — SVG 일러스트만 허용.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| 원형 프로그레스 | Canvas 기반 그리기 | SVG stroke-dasharray | 브라우저 네이티브, CSS transition 지원 |
| 애니메이션 시퀀스 | requestAnimationFrame 수동 관리 | Framer Motion variants/AnimatePresence | React 통합, 선언적 |
| 사운드 재생 | Web Audio API 직접 | Phase 17 SoundManager/SfxEngine | 이미 구축됨, iOS 해결됨 |
| 타이머 | setInterval 직접 | 기존 useTimer 훅 확장 | 일시정지/재개, cleanup 처리됨 |
| XP 지급 | 직접 DB 조작 | gamification.service.ts awardXP() | 트랜잭션, 뱃지 체크, 레벨업 통합 |

## Common Pitfalls

### Pitfall 1: WebGL 컨텍스트 한도 (G3)
**What goes wrong:** Phaser 미니게임 + Three.js 배경 동시 실행 시 WebGL 컨텍스트 초과
**Why it happens:** 브라우저 WebGL 컨텍스트 한도 8~16개
**How to avoid:** 미니게임 진입 시 ThreeBackground dispose, 미니게임 종료 시 복구. 또는 미니게임 중 Three.js 배경 비활성화.
**Warning signs:** Canvas 렌더링 실패, 검은 화면

### Pitfall 2: Phaser 씬 메모리 누수 (G2)
**What goes wrong:** 미니게임 반복 플레이 시 메모리 증가
**Why it happens:** 씬 shutdown 시 텍스처/이벤트 미해제
**How to avoid:** game.destroy(true) cleanup + EventBus.off() 정리. PhaserBridge POC 패턴의 useLayoutEffect cleanup 그대로 사용.
**Warning signs:** 브라우저 탭 메모리 지속 증가

### Pitfall 3: React StrictMode 이중 초기화 (G1)
**What goes wrong:** Phaser Game이 2번 생성됨
**Why it happens:** React 18+ StrictMode에서 useEffect 2회 실행
**How to avoid:** useRef 가드 패턴 (Phase 15 PhaserBridge에서 이미 해결)
**Warning signs:** Canvas에 게임이 2개 렌더링

### Pitfall 4: 타이머 정확도
**What goes wrong:** setInterval 기반 타이머가 백그라운드 탭에서 느려짐
**Why it happens:** 브라우저가 백그라운드 탭 타이머 throttle
**How to avoid:** Date.now() 기반 경과 시간 계산, requestAnimationFrame 보조. 기존 useTimer가 이 패턴 사용.
**Warning signs:** 타이머가 실제 시간보다 느리게 감소

### Pitfall 5: Dexie version 충돌
**What goes wrong:** gameRecords 테이블 추가 시 기존 DB 마이그레이션 실패
**Why it happens:** version 번호 중복 또는 기존 version 수정
**How to avoid:** version(9)으로 gameRecords만 추가. 기존 version(1)~(8) 절대 수정 금지. 신규 테이블만 정의 (기존 자동 상속).
**Warning signs:** DB open 실패, UpgradeError

## Code Examples

### Dexie version(9) gameRecords 테이블 추가
```typescript
// db.ts에 추가
export interface GameRecord {
  id?: number
  studentId: string
  mode: 'timeAttack' | 'survival' | 'bossBattle' | 'miniGame'
  score: number
  correctCount: number
  totalQuestions: number
  xpEarned: number
  timeElapsed: number    // 초
  isPersonalBest: boolean
  metadata?: Record<string, unknown>  // 모드별 추가 데이터
  playedAt: number       // timestamp
}

// version(9): gameRecords 테이블 추가
db.version(9).stores({
  gameRecords: '++id, studentId, mode, score, playedAt, [studentId+mode]',
})
```

### 하트 깨짐 애니메이션 (Framer Motion)
```typescript
// HeartDisplay.tsx
import { motion, AnimatePresence } from 'framer-motion'

const heartVariants = {
  alive: { scale: 1, opacity: 1 },
  breaking: {
    scale: [1, 1.2, 0],
    opacity: [1, 1, 0],
    rotate: [0, -15, 15],
    transition: { duration: 0.5 }
  }
}

// 각 하트를 AnimatePresence로 감싸서 exit 애니메이션
<AnimatePresence>
  {Array.from({ length: hearts }).map((_, i) => (
    <motion.div key={i} variants={heartVariants} initial="alive" exit="breaking">
      <HeartSvg />
    </motion.div>
  ))}
</AnimatePresence>
```

### 보스 공격 애니메이션 패턴
```typescript
// BossCharacter.tsx
const bossVariants = {
  idle: { x: 0, y: 0, scale: 1 },
  attacked: {  // 정답 시 보스가 공격받음
    x: [0, 20, -10, 0],
    opacity: [1, 0.3, 1],
    transition: { duration: 0.6 }
  },
  attacking: {  // 오답 시 보스가 공격함
    x: [0, -80, 0],
    scale: [1, 1.2, 1],
    transition: { duration: 0.5 }
  }
}

<motion.div variants={bossVariants} animate={bossState}>
  <BossSvg />
</motion.div>
```

### MiniGameRegistry 패턴
```typescript
// MiniGameRegistry.ts
type MiniGameConfig = {
  key: string
  name: string
  description: string
  sceneFactory: () => Promise<{ default: typeof Phaser.Scene }>
}

const registry: MiniGameConfig[] = []

export function registerMiniGame(config: MiniGameConfig) {
  registry.push(config)
}

export function getMiniGames(): readonly MiniGameConfig[] {
  return registry
}

// 등록 예시
registerMiniGame({
  key: 'formulaCombo',
  name: '수식 조합',
  description: '떨어지는 숫자와 연산자를 조합하여 목표 값을 만드세요',
  sceneFactory: () => import('./scenes/FormulaComboScene'),
})
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Phaser 2 states | Phaser 3 Scene Manager | Phaser 3.0 | Scene 클래스 기반, 다중 씬 동시 실행 가능 |
| eventemitter3 | Phaser.Events.EventEmitter / 내부 SimpleEventEmitter | Phase 15 | 외부 의존성 제거, Phase 19에서 Phaser 내장으로 교체 가능 |
| CSS keyframes | Framer Motion variants | Phase 14 | 선언적 + React 통합 + exit 애니메이션 |

## Open Questions

1. **보스 SVG 디자인 복잡도**
   - What we know: 기하학적/수학적 모티프 (삼각형, 원, 다각형 조합) 사용
   - What's unclear: 단원/챕터별 테마 보스가 몇 종류 필요한지
   - Recommendation: MVP로 범용 보스 1종 구현, 향후 확장 구조만 준비

2. **미니게임 물리 밸런스**
   - What we know: 수식 조합 — 떨어지는 숫자/연산자를 조합하여 목표값 만들기
   - What's unclear: 정확한 떨어지는 속도, 점수 계산, 난이도 곡선
   - Recommendation: 초기 밸런스 설정 후 Phase 20 또는 이후 조정

## Sources

### Primary (HIGH confidence)
- Context7 /phaserjs/phaser — Scene management, Timeline, Particle Emitter, game config
- Context7 /websites/motion_dev — AnimatePresence, variants, SVG animation, exit animations
- Context7 /websites/dexie — Version upgrade, schema change, new table addition

### Secondary (MEDIUM confidence)
- 프로젝트 기존 코드 — PhaserBridge.tsx, EventBus.ts, gamification.service.ts, db.ts
- Phase 15-18 STATE.md decisions — 확립된 패턴과 의존성

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - 모든 라이브러리가 프로젝트에 이미 설치/검증됨
- Architecture: HIGH - Phase 15 PhaserBridge POC + Phase 16 gamification 패턴 기반
- Pitfalls: HIGH - G1/G2/G3 Phase 15에서 이미 검증, Dexie 패턴 Phase 15에서 확립

**Research date:** 2026-02-24
**Valid until:** 2026-03-24 (안정적 스택, 30일 유효)
