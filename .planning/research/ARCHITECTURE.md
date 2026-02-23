# Architecture Research

**Domain:** 게이미피케이션 레이어 통합 — React 19 앱에 Phaser/Three.js/Canvas 추가
**Researched:** 2026-02-23
**Confidence:** HIGH (React-Phaser 통합 패턴), MEDIUM (Three.js 배경/오버레이), HIGH (모드 토글 아키텍처)

---

## 핵심 질문

> Phaser/Three.js/Canvas 기능을 기존 React 19 아키텍처에 어떻게 통합하는가?
> 컴포넌트/상태 아키텍처의 최선은 무엇인가?

---

## Standard Architecture

### System Overview — v3.0 반전 모드 레이어

```
┌──────────────────────────────────────────────────────────────────────┐
│                      REACT 앱 (기존 유지)                              │
│  SettingsProvider → AuthProvider → BrowserRouter → Routes            │
│                           ↓                                           │
│                   [FunModeProvider] ← 신규 추가                        │
├──────────────────────────────────────────────────────────────────────┤
│                   AppShell (기존 — 수정 최소화)                        │
│  BottomNav / Sidebar / Header                                         │
│         + [FunModeToggleButton] ← 신규 UI 요소                        │
├─────────────────────┬────────────────────────────────────────────────┤
│  노말 모드 (기존)    │  반전 모드 (신규 — lazy load)                    │
│                      │                                                 │
│  QuizPlayer          │  PhaserQuizEngine (Phaser 씬 임베딩)            │
│  StudentHomePage     │  FunStudentHome (Three.js 배경)                 │
│  AnalyticsPage       │  FunAnalyticsPage (파티클 효과)                  │
│  WrongNotesPage      │  FunWrongNotesPage (Canvas 미니게임)             │
└─────────────────────┴────────────────────────────────────────────────┘
         ↓                              ↓
┌─────────────────────┐    ┌───────────────────────────────────────────┐
│   기존 서비스 레이어  │    │  게임 레이어 (신규 — lazy import)           │
│   Dexie IndexedDB   │    │  Phaser 3 (퀴즈 씬)                        │
│   quiz.service.ts   │    │  Three.js (배경/파티클)                     │
│   streak.service.ts │    │  Howler.js (사운드)                         │
│   analytics.service │    │  gamification.service.ts (XP/뱃지/스트릭)  │
└─────────────────────┘    └───────────────────────────────────────────┘
         ↕                              ↕
┌──────────────────────────────────────────────────────────────────────┐
│            Dexie IndexedDB v8 (신규 테이블 추가)                       │
│  기존 테이블 유지 + gamificationProfiles + xpEvents + badges          │
└──────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Implementation |
|-----------|----------------|----------------|
| **FunModeProvider** | 반전 모드 on/off 전역 상태 관리, localStorage 유지 | React Context + localStorage |
| **FunModeToggleButton** | 커스터마이즈 버튼 UI, 토글 트리거 | AppShell 헤더에 삽입 |
| **PhaserBridge** | Phaser Game 인스턴스 생명주기 관리, React ↔ Phaser 이벤트 버스 | forwardRef + useEffect |
| **ThreeBackground** | Three.js 씬을 CSS fixed 배경으로 렌더링 | canvas z-index -1 |
| **XPBar / LevelBadge** | 현재 XP, 레벨, 뱃지 표시 UI | FunModeProvider에서 상태 구독 |
| **SoundManager** | BGM + 효과음 Howler 인스턴스 관리 | 싱글턴 훅 useSound |
| **gamification.service.ts** | XP 계산, 레벨 산정, 뱃지 언락, 스트릭 연동 | Dexie v8 + 기존 streak.service |

---

## 핵심 통합 패턴

### Pattern 1: FunMode Context — 전역 모드 토글

**What:** 반전 모드 on/off를 전역으로 관리하는 Context Provider. dark mode 패턴과 동일하게 `data-fun-mode` 속성을 `document.documentElement`에 적용.

**When to use:** 모든 라우트/컴포넌트가 현재 모드를 알아야 할 때.

**Trade-offs:** Context는 하위 트리 전체를 리렌더링할 수 있으나, boolean 하나의 변경은 메모이제이션으로 충분히 제어 가능. 상태가 단순하여 Zustand 불필요.

**Example:**
```typescript
// src/contexts/FunModeContext.tsx
interface FunModeContextValue {
  isFunMode: boolean
  toggleFunMode: () => void
  xp: number
  level: number
  streak: number
  addXP: (amount: number, reason: string) => void
}

export function FunModeProvider({ children }: { children: ReactNode }) {
  const [isFunMode, setIsFunMode] = useState(() =>
    localStorage.getItem('app:funMode') === 'true'
  )

  // 모드 전환 시 DOM 속성 적용 → Tailwind CSS 선택자로 스타일 분기
  function toggleFunMode() {
    const next = !isFunMode
    setIsFunMode(next)
    localStorage.setItem('app:funMode', String(next))
    document.documentElement.setAttribute('data-fun-mode', String(next))
    // 모드 전환 시 사운드 재생 (Howler)
    soundManager.play('mode-switch')
  }

  // ...XP/level/streak 상태
}
```

**CSS 적용 방식 (Tailwind v4):**
```css
/* index.css — 반전 모드 테마 오버라이드 */
[data-fun-mode="true"] {
  --background: oklch(0.12 0.04 280);  /* 다크 퍼플 배경 */
  --foreground: oklch(0.98 0.01 280);
  --primary: oklch(0.7 0.28 150);      /* 네온 그린 */
}
```

---

### Pattern 2: Phaser Bridge Component — React에 게임 씬 임베딩

**What:** Phaser Game 인스턴스를 div 컨테이너에 마운트하고, 이벤트 버스로 React ↔ Phaser 양방향 통신. 공식 Phaser React TypeScript 템플릿 패턴 기반.

**When to use:** 타임어택 퀴즈, 보스전, Phaser 씬이 필요한 모든 게임 UI.

**Trade-offs:** Phaser는 자체 게임 루프와 렌더러를 가지며 React DOM과 완전히 분리. React 상태 변경이 Phaser 씬에 직접 영향을 주지 않으므로 EventBus를 통해 통신해야 함.

**Example:**
```typescript
// src/components/game/PhaserBridge.tsx
import { forwardRef, useEffect, useLayoutEffect, useRef } from 'react'
import type { Game } from 'phaser'

interface PhaserBridgeProps {
  onSceneReady?: (scene: Phaser.Scene) => void
  gameConfig: Phaser.Types.Core.GameConfig
}

export interface PhaserBridgeRef {
  game: Game | null
  scene: Phaser.Scene | null
}

export const PhaserBridge = forwardRef<PhaserBridgeRef, PhaserBridgeProps>(
  ({ onSceneReady, gameConfig }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const gameRef = useRef<Game | null>(null)

    useLayoutEffect(() => {
      if (!containerRef.current || gameRef.current) return

      // Phaser 동적 import — 초기 번들에서 제외
      import('phaser').then(({ default: Phaser }) => {
        gameRef.current = new Phaser.Game({
          ...gameConfig,
          parent: containerRef.current!,
        })

        // EventBus로 씬 준비 이벤트 수신
        EventBus.once('current-scene-ready', (scene: Phaser.Scene) => {
          onSceneReady?.(scene)
        })
      })

      return () => {
        gameRef.current?.destroy(true)
        gameRef.current = null
      }
    }, []) // 마운트 시 1회만

    return <div ref={containerRef} className="w-full h-full" />
  }
)

// src/game/EventBus.ts
import Phaser from 'phaser'
export const EventBus = new Phaser.Events.EventEmitter()
```

**React → Phaser 데이터 전달:**
```typescript
// React에서 퀴즈 문제 데이터를 Phaser 씬으로 전달
EventBus.emit('load-question', { question, timeLimit: 30 })

// Phaser 씬에서 정답 이벤트를 React로 전달
EventBus.emit('answer-submitted', { isCorrect: true, comboCount: 3 })
```

---

### Pattern 3: Three.js Background — CSS fixed 레이어

**What:** Three.js canvas를 `position: fixed; z-index: -1`로 배경에 고정. React DOM 위에 투명하게 렌더링되어 클릭 이벤트를 통과시킴.

**When to use:** 파티클 배경, 레벨업 연출, 별자리 효과 등 반전 모드 전역 배경.

**Trade-offs:** React Three Fiber(R3F) 대신 vanilla Three.js를 선택하는 이유: R3F는 ~80KB 추가 번들, 배경용 단순 씬에는 과도함. vanilla useRef + useEffect 패턴으로 충분.

**Example:**
```typescript
// src/components/game/ThreeBackground.tsx
import { useEffect, useRef } from 'react'
import { useFunMode } from '@/contexts/FunModeContext'

export function ThreeBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { isFunMode } = useFunMode()
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const frameRef = useRef<number>(0)

  useEffect(() => {
    if (!isFunMode || !canvasRef.current) return

    // Three.js 동적 import — 반전 모드 진입 시에만 로드
    import('three').then((THREE) => {
      const renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current!,
        alpha: true,  // 투명 배경
        antialias: false,  // 성능 우선
      })
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      rendererRef.current = renderer

      // 씬 설정 (파티클 예시)
      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
      camera.position.z = 5

      // 애니메이션 루프 — React 상태 저장 금지 (리렌더링 유발)
      function animate() {
        frameRef.current = requestAnimationFrame(animate)
        renderer.render(scene, camera)
      }
      animate()
    })

    return () => {
      cancelAnimationFrame(frameRef.current)
      rendererRef.current?.dispose()
      rendererRef.current = null
    }
  }, [isFunMode])

  if (!isFunMode) return null

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: -1 }}
    />
  )
}
```

---

### Pattern 4: Sound Manager — Howler.js 싱글턴

**What:** Howler.js를 React 컴포넌트 외부 싱글턴으로 초기화. `use-sound` 훅 대신 직접 Howl 인스턴스 관리 (BGM 루프 + 여러 효과음 동시 재생 필요).

**When to use:** BGM, 정답/오답 효과음, 콤보 사운드, 레벨업 팡파레.

**Trade-offs:** Howler는 스프라이트 방식으로 여러 효과음을 하나의 파일로 묶어 네트워크 요청 최소화. `use-sound`는 단순 효과음에 적합하지만 BGM 루프 제어가 불편함.

**Example:**
```typescript
// src/lib/soundManager.ts — 싱글턴 (React 외부)
import { Howl, Howler } from 'howler'

class SoundManager {
  private bgm: Howl | null = null
  private sfx: Howl | null = null
  private muted = false

  async init() {
    // 반전 모드 진입 시 1회 초기화
    const [{ Howl, Howler }] = await Promise.all([import('howler')])

    this.bgm = new Howl({
      src: ['/sounds/bgm-game.webm', '/sounds/bgm-game.mp3'],
      loop: true,
      volume: 0.3,
    })

    this.sfx = new Howl({
      src: ['/sounds/sfx.webm', '/sounds/sfx.mp3'],
      sprite: {
        correct: [0, 800],
        wrong: [1000, 600],
        combo: [2000, 1200],
        levelup: [3500, 2000],
        'mode-switch': [6000, 1000],
      },
    })
  }

  play(id: string) {
    if (this.muted) return
    this.sfx?.play(id)
  }

  playBGM() { this.bgm?.play() }
  stopBGM() { this.bgm?.stop() }
  setMute(muted: boolean) {
    this.muted = muted
    Howler.mute(muted)
  }
}

export const soundManager = new SoundManager()

// src/hooks/useSoundManager.ts
export function useSoundManager() {
  const { isFunMode } = useFunMode()

  useEffect(() => {
    if (isFunMode) {
      soundManager.init().then(() => soundManager.playBGM())
    } else {
      soundManager.stopBGM()
    }
  }, [isFunMode])
}
```

---

### Pattern 5: Lazy Loading 전략 — 무거운 게임 라이브러리

**What:** Phaser (~1.3MB), Three.js (~600KB), Howler.js (~30KB)를 반전 모드 진입 시에만 동적 import. 초기 번들에 포함하지 않아 노말 모드 성능 보호.

**When to use:** 반드시 적용. 미적용 시 초기 번들 2MB 이상 증가.

**Example:**
```typescript
// src/components/game/FunQuizMode.tsx — React.lazy 래퍼
import { lazy, Suspense } from 'react'

// 반전 모드 퀴즈 씬 — lazy import
const PhaserQuizEngine = lazy(() =>
  import('@/components/game/PhaserQuizEngine')
)

export function FunQuizMode({ question }: Props) {
  return (
    <Suspense fallback={<GameLoadingSpinner />}>
      <PhaserQuizEngine question={question} />
    </Suspense>
  )
}

// vite.config.ts — manualChunks로 게임 번들 분리
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'game-phaser': ['phaser'],
          'game-three': ['three'],
          'game-howler': ['howler'],
        },
      },
    },
  },
})
```

---

### Pattern 6: 게이미피케이션 서비스 — XP/레벨/뱃지

**What:** 기존 `streak.service.ts` 패턴을 그대로 따르는 새 서비스. Dexie v8에 `gamificationProfiles`, `xpEvents`, `badges` 테이블 추가. XP 계산 로직은 순수 함수.

**When to use:** 정답 시 XP 지급, 레벨업 판정, 뱃지 언락, 리더보드 집계.

**Example:**
```typescript
// src/services/gamification.service.ts
export const XP_REWARDS = {
  correct_normal: 10,
  correct_combo_2x: 20,
  correct_combo_5x: 50,
  perfect_session: 100,
  streak_3day: 30,
} as const

export function calculateLevel(totalXP: number): number {
  // 레벨 = floor(sqrt(totalXP / 100)) + 1
  return Math.floor(Math.sqrt(totalXP / 100)) + 1
}

export async function addXP(
  studentId: string,
  amount: number,
  reason: keyof typeof XP_REWARDS
): Promise<{ newXP: number; levelUp: boolean; newLevel: number }> {
  const profile = await db.gamificationProfiles
    .where('studentId').equals(studentId).first()

  const prevLevel = calculateLevel(profile?.totalXP ?? 0)
  const newXP = (profile?.totalXP ?? 0) + amount
  const newLevel = calculateLevel(newXP)

  await db.gamificationProfiles.put({
    studentId,
    totalXP: newXP,
    level: newLevel,
    updatedAt: Date.now(),
  })

  await db.xpEvents.add({
    studentId,
    amount,
    reason,
    timestamp: Date.now(),
  })

  return { newXP, levelUp: newLevel > prevLevel, newLevel }
}
```

---

## Recommended Project Structure — v3.0 신규 파일

기존 구조 유지 + 아래 디렉터리/파일만 추가:

```
apps/web/src/
│
├── contexts/
│   ├── AuthContext.tsx          # 기존 유지
│   ├── SettingsContext.tsx      # 기존 유지
│   └── FunModeContext.tsx       # 신규 — 반전 모드 전역 상태
│
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx         # 수정 — FunModeToggleButton 삽입
│   │   └── FunModeToggleButton.tsx  # 신규 — 커스터마이즈 버튼
│   │
│   └── game/                    # 신규 디렉터리
│       ├── PhaserBridge.tsx     # Phaser Game 마운트/언마운트 관리
│       ├── ThreeBackground.tsx  # Three.js 배경 캔버스
│       ├── XPBar.tsx            # XP/레벨 표시 UI
│       ├── ComboDisplay.tsx     # 콤보 카운터 오버레이
│       ├── LevelUpModal.tsx     # 레벨업 연출 모달
│       ├── BadgeToast.tsx       # 뱃지 획득 알림
│       └── GameLoadingSpinner.tsx  # lazy load 대기 UI
│
├── game/                        # 신규 — Phaser 씬 전용
│   ├── EventBus.ts              # Phaser.Events.EventEmitter 싱글턴
│   ├── scenes/
│   │   ├── QuizScene.ts         # 타임어택 퀴즈 씬
│   │   ├── BossScene.ts         # 보스전 씬
│   │   └── PreloadScene.ts      # 에셋 사전 로드
│   └── config.ts                # Phaser.Game 기본 설정
│
├── hooks/
│   ├── useTimer.ts              # 기존 유지
│   ├── useFunMode.ts            # 신규 — FunModeContext 훅
│   ├── useSoundManager.ts       # 신규 — Howler BGM/SFX 제어
│   └── useXP.ts                 # 신규 — XP 조회/추가 훅
│
├── services/
│   ├── quiz.service.ts          # 기존 유지 (XP 지급 훅 추가)
│   ├── streak.service.ts        # 기존 유지
│   └── gamification.service.ts  # 신규 — XP/뱃지/레벨/리더보드
│
├── lib/
│   ├── db.ts                    # 수정 — version 8 추가 (gamification 테이블)
│   └── soundManager.ts          # 신규 — Howler 싱글턴
│
└── routes/
    └── student/
        ├── index.tsx            # 수정 — FunMode 분기 렌더링
        ├── quiz/
        │   └── index.tsx        # 수정 — FunMode 시 PhaserQuizEngine 사용
        └── analytics/
            └── index.tsx        # 수정 — FunMode 시 파티클 오버레이
```

---

## Data Flow

### 반전 모드 전환 Flow

```
[커스터마이즈 버튼 클릭]
        ↓
[FunModeProvider.toggleFunMode()]
        ↓ 동시 실행
[localStorage 저장]  [DOM data-fun-mode 속성 변경]  [soundManager 초기화]
        ↓
[CSS 테마 즉시 전환 (CSS 변수 재계산)]
        ↓
[Three.js lazy import → ThreeBackground 마운트]
        ↓
[SoundManager.playBGM()]
```

### 게임 퀴즈 Flow (반전 모드)

```
[학생: 반전 모드에서 문제 선택]
        ↓
[QuizPage → isFunMode 확인]
        ↓ true
[React.lazy → PhaserBridge 로드 (Phaser 동적 import)]
        ↓
[Phaser QuizScene 시작]
        ↓
[EventBus.emit('load-question', question)]
        ↓
[QuizScene: 타임어택 UI 렌더링]
        ↓
[학생 정답 선택]
        ↓
[EventBus.emit('answer-submitted', { isCorrect, combo })]
        ↓ React에서 수신
[quiz.service.submitQuizAttempt() — 기존 로직 그대로]
        ↓
[gamification.service.addXP(XP_REWARDS.correct_combo_2x)]
        ↓
[FunModeContext.xp 업데이트 → XPBar 리렌더링]
        ↓
[soundManager.play('correct')] + [ComboDisplay 업데이트]
```

### XP/레벨업 Flow

```
[addXP() 호출]
        ↓
[Dexie gamificationProfiles 업데이트]
        ↓
[calculateLevel() — 레벨 변화 감지]
        ↓ 레벨업 시
[LevelUpModal 표시 (Framer Motion)]
[Three.js 레벨업 파티클 트리거]
[soundManager.play('levelup')]
        ↓ 뱃지 언락 조건 확인
[checkBadgeUnlock() → BadgeToast 표시]
```

### State Management — 기존 패턴 그대로 확장

```
기존:
  SettingsContext (darkMode, katexFontSize) → localStorage

신규:
  FunModeContext (isFunMode, xp, level, streak) → localStorage + Dexie

게임 상태 (React 상태로 관리하지 않음):
  Phaser Scene 내부 → EventBus로만 React에 전달
  Three.js 씬 → useRef 내부 (리렌더링 없음)
  Howler 인스턴스 → soundManager 싱글턴 (React 외부)
```

---

## Integration Points

### 신규 컴포넌트 ↔ 기존 컴포넌트

| Boundary | Communication | 주의사항 |
|----------|---------------|---------|
| QuizPage ↔ PhaserQuizEngine | EventBus (emit/on) | React props 직접 전달 불가. 씬 준비 후 EventBus로 데이터 전달 |
| PhaserBridge ↔ React | forwardRef + EventBus | 씬 내부 Three.js 렌더러와 Phaser 렌더러가 같은 canvas를 공유하지 말 것 |
| FunModeContext ↔ AppShell | Context Consumer | AppShell은 수정 최소화 — FunModeToggleButton만 삽입 |
| gamification.service ↔ quiz.service | 직접 함수 호출 | quiz.service에서 정답 확정 후 gamification.service.addXP() 호출 |
| soundManager ↔ FunModeContext | import 직접 호출 | soundManager는 Context 의존 없음. Context에서 import 후 호출 |
| ThreeBackground ↔ FunModeContext | useFunMode() | isFunMode === false 시 null 반환 (Three.js 미로드) |

### Dexie 스키마 확장 (version 8)

```typescript
// 기존 version(7) 이후 추가
db.version(8).stores({
  // ... 기존 테이블 모두 유지
  gamificationProfiles: '++id, &studentId',        // XP, 레벨
  xpEvents: '++id, studentId, reason, timestamp',   // XP 이력 (리더보드용)
  badges: '++id, studentId, badgeId, unlockedAt',   // 획득 뱃지
})
```

---

## Build Order (의존성 기반 구현 순서)

```
Phase 1: 모드 토글 시스템 기반 인프라
  ├── FunModeContext (isFunMode, toggle, localStorage 연동)
  ├── FunModeToggleButton (AppShell 삽입)
  ├── CSS 테마 변수 (data-fun-mode 선택자)
  └── Dexie v8 스키마 확장 (gamificationProfiles, xpEvents, badges)

Phase 2: 게이미피케이션 상태 레이어
  ├── gamification.service.ts (XP 계산, 레벨 산정, 뱃지 언락)
  ├── FunModeContext에 XP/level/streak 통합
  ├── XPBar, LevelBadge UI 컴포넌트
  └── useXP 훅

Phase 3: 사운드 시스템
  ├── soundManager.ts (Howler 싱글턴)
  ├── useSoundManager 훅 (FunMode 연동)
  └── 사운드 에셋 준비 (webm + mp3 스프라이트)

Phase 4: Three.js 배경/효과
  ├── ThreeBackground 컴포넌트 (lazy import)
  ├── 파티클 시스템 구현
  └── 레벨업 연출 트리거

Phase 5: Phaser 퀴즈 엔진
  ├── EventBus.ts
  ├── PhaserBridge 컴포넌트 (forwardRef)
  ├── PreloadScene (에셋 로드)
  ├── QuizScene (타임어택 UI)
  └── QuizPage 분기 (isFunMode → PhaserBridge)

Phase 6: 고급 게임 씬
  ├── BossScene (보스전)
  ├── Canvas 미니게임
  └── 리더보드 UI

이 순서의 이유:
- Phase 1 없이는 어떤 반전 기능도 표시 불가
- Phase 2(XP)가 Phase 3-6의 보상 시스템 기반
- Phaser는 가장 복잡하므로 기반 시스템 완성 후 마지막에 구현
- 각 Phase는 독립적으로 테스트 가능 (모드 on/off)
```

---

## Anti-Patterns

### Anti-Pattern 1: Phaser canvas와 Three.js canvas 혼용

**What people do:** 하나의 canvas 요소에 Phaser와 Three.js 렌더러를 번갈아 사용하거나 겹쳐서 초기화.

**Why it's wrong:** 두 렌더러가 WebGL 컨텍스트를 공유하지 못함. canvas 하나당 WebGL 컨텍스트 하나. 두 번 초기화하면 이전 컨텍스트가 소실되고 렌더링이 멈춤.

**Do this instead:** Three.js는 `position: fixed; z-index: -1` canvas (배경), Phaser는 별도 div 컨테이너에 마운트된 canvas (게임 씬). 완전히 별도 요소로 분리.

### Anti-Pattern 2: React 상태에 Three.js/Phaser 애니메이션 값 저장

**What people do:** `useState`로 파티클 위치, 회전값, 씬 상태를 관리하고 `setState`로 업데이트.

**Why it's wrong:** setState는 리렌더링을 유발. 60fps 애니메이션에서 매 프레임 리렌더링은 성능 재앙. React와 WebGL 렌더 루프가 충돌.

**Do this instead:** 모든 애니메이션 값은 `useRef`에 저장하거나 Phaser 씬/Three.js 오브젝트 자체에 보관. React 상태는 게임 결과(점수, 정답 여부)만 수신.

### Anti-Pattern 3: 반전 모드 무관하게 Phaser/Three.js를 미리 로드

**What people do:** `main.tsx` import에 phaser, three를 정적으로 선언.

**Why it's wrong:** 노말 모드 학생이 앱을 열 때도 ~2MB 게임 라이브러리를 다운로드. 초기 로딩 속도 저하.

**Do this instead:** `dynamic import()` 또는 `React.lazy()`로 반전 모드 진입 시에만 로드. Vite `manualChunks`로 별도 번들 청크 분리.

### Anti-Pattern 4: FunModeContext에 Phaser 인스턴스 저장

**What people do:** FunModeContext에 `phaserGame: Phaser.Game | null` 상태를 추가하고 context로 전파.

**Why it's wrong:** Context value 변경 시 모든 구독 컴포넌트 리렌더링. Phaser 인스턴스 참조를 React 상태 사이클에 묶으면 예측 불가능한 재초기화 발생.

**Do this instead:** Phaser 인스턴스는 `PhaserBridge` 컴포넌트의 `useRef`에만 보관. React ↔ Phaser 통신은 EventBus로.

### Anti-Pattern 5: AppShell 전면 재작성

**What people do:** 반전 모드를 위해 AppShell을 통째로 복제하거나 대규모 수정.

**Why it's wrong:** 기존 17,000 LOC와의 통합 위험 증가. BottomNav/Sidebar/PageTransition 버그 재발.

**Do this instead:** AppShell은 최소 수정 (FunModeToggleButton 삽입, `data-fun-mode` 클래스 조건부 추가만). 각 페이지 내부에서 isFunMode로 분기.

---

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 현재 (POC, localStorage) | FunModeContext + Dexie v8로 충분. 리더보드는 로컬 집계. |
| 백엔드 연동 시 | gamification.service를 API 호출로 교체. XP 서버 검증. 리더보드 실시간화. |
| 서버 사운드/에셋 | CDN 배포 (CloudFront). Workbox로 사운드 파일 사전 캐싱. |

---

## Sources

- [Phaser 3 + React TypeScript 공식 템플릿 (GitHub)](https://github.com/phaserjs/template-react-ts) — HIGH confidence, 공식 Phaser Studio
- [Phaser 3 React TypeScript Template 발표 (2024-03)](https://phaser.io/news/2024/03/phaser-3-and-react-typescript-template) — HIGH confidence
- [React Three Fiber 공식 문서](https://r3f.docs.pmnd.rs/getting-started/introduction) — HIGH confidence (R3F 선택하지 않는 이유 확인용)
- [Three.js React 통합 패턴 (Medium, 2025)](https://medium.com/@alfinohatta/integrating-three-js-278774d45973) — MEDIUM confidence
- [useRef canvas 패턴 — Three.js in React (moldstud.com)](https://moldstud.com/articles/p-integrating-threejs-into-existing-react-projects-a-practical-step-by-step-guide) — MEDIUM confidence
- [howler.js 공식 문서](https://howlerjs.com/) — HIGH confidence
- [Rethinking audio feedback with useSound Hook (LogRocket)](https://blog.logrocket.com/rethinking-audio-feedback-usesound-hook/) — HIGH confidence
- [React State Management 2025 (developerway)](https://www.developerway.com/posts/react-state-management-2025) — HIGH confidence
- [Vite manualChunks 코드 스플리팅 (GitHub Discussion)](https://github.com/vitejs/vite/discussions/17730) — HIGH confidence
- [CSS 변수 기반 테마 토글 (CSS-Tricks)](https://css-tricks.com/easy-dark-mode-and-multiple-color-themes-in-react/) — HIGH confidence

---
*Architecture research for: v3.0 반전 모드 — Phaser/Three.js/Canvas React 19 통합*
*Researched: 2026-02-23*
