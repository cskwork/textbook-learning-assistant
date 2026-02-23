# Phase 15: 반전 모드 기반 인프라 + 번들 전략 - Research

**Researched:** 2026-02-23
**Domain:** 모드 토글 인프라 / React Context / Vite 코드 스플리팅 / CSS 테마 시스템 / Dexie 스키마 마이그레이션
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| INFRA-01 | 사용자가 커스터마이즈 버튼을 클릭하여 일반 모드 ↔ 반전 모드를 즉시 전환할 수 있다 | FunModeContext toggle 패턴 + `data-fun-mode` DOM 속성 즉시 반영 |
| INFRA-02 | 반전 모드 전환 시 전체 UI 테마(색상, 폰트, 레이아웃)가 재미있는 게임 스타일로 변신한다 | CSS 변수 `[data-fun-mode="true"]` 선택자 — Tailwind v4 CSS-first 방식과 호환 |
| INFRA-03 | 반전 모드 선택이 사용자별로 저장되어 재접속 시 유지된다 | localStorage 초기화 패턴 (`useState(() => localStorage.getItem(...))`) |
| INFRA-04 | 반전 모드 게임 엔진(Phaser, Three.js, Howler)이 lazy loading되어 일반 모드 초기 로딩에 영향을 주지 않는다 | React.lazy() + Vite manualChunks('game-phaser', 'game-three', 'game-howler') |
| INFRA-05 | 반전 모드 최초 진입 시 재미있는 로딩 화면과 함께 게임 에셋이 로드된다 | Suspense fallback → GameLoadingSpinner + Phaser PreloadScene 진행률 이벤트 |
</phase_requirements>

---

## Summary

Phase 15는 v3.0 전체의 기반이다. FunModeContext가 없으면 어떤 반전 기능도 렌더링되지 않고, 번들 전략이 없으면 일반 모드 성능이 즉시 망가진다. 이 두 가지를 올바르게 확립하는 것이 이 Phase의 유일한 목표다.

핵심 구현은 세 레이어로 나뉜다. 첫째, **FunModeContext** — boolean 전역 상태 + localStorage 영속성 + `document.documentElement`의 `data-fun-mode` 속성 토글. 이 속성 하나가 CSS 변수 오버라이드를 트리거하므로 테마 전환이 즉시(동기적)이다. 둘째, **Vite manualChunks + React.lazy()** — Phaser/Three.js/Howler를 완전 분리 청크로 추출해 일반 모드 초기 번들에서 완전 제거. 셋째, **Dexie version 8 마이그레이션** — 기존 테이블을 건드리지 않고 gamificationProfiles/xpEvents/badges 테이블만 추가.

Phase 15에서는 Phaser 통합 POC를 통해 React StrictMode 이중 초기화(G1), WebGL 컨텍스트 예산(G3) 두 가지 함정을 반드시 실측 검증해야 한다. 이 검증 없이 Phase 16~19로 진행하면 나중에 전면 리팩토링이 불가피하다.

**Primary recommendation:** FunModeContext → CSS 테마 변수 → Vite manualChunks → Dexie v8 → Phaser POC 순으로 구현. 각 단계를 독립적으로 커밋하고 번들 사이즈를 `vite build --report`로 실측 확인.

---

## Standard Stack

### Core (Phase 15에서 사용)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React Context API | React 19 내장 | FunMode 전역 상태 | 외부 의존성 불필요. boolean 하나의 전역 상태는 Context로 충분 |
| Tailwind v4 CSS-first | 기존 설치됨 | `[data-fun-mode]` 선택자 테마 | 프로젝트 기존 방식과 완전 일치 |
| Vite 7 manualChunks | 기존 설치됨 | 게임 라이브러리 번들 분리 | Vite 공식 코드 스플리팅 방법 |
| React.lazy() + Suspense | React 19 내장 | 컴포넌트 레벨 동적 import | 라우트/컴포넌트 레벨 코드 분리 표준 |
| Dexie v8 | 기존 설치됨 | gamification 테이블 추가 | 프로젝트 기존 IndexedDB ORM |
| localStorage | 브라우저 내장 | 반전 모드 선택 영속성 | POC 아키텍처 유지 방침 (INFRA-03) |

### Supporting (Phase 15 POC용 — Phase 19에서 본격 사용)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Phaser | 3.90.0 | React StrictMode 이중 초기화 POC 검증 | Phase 15 POC에서만. 본격 사용은 Phase 19 |
| canvas-confetti | 1.9.4 | 모드 전환 시 즉각 시각 피드백 | 반전 모드 최초 진입 애니메이션 (2.5kb gz, zero-dep) |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| React Context | Zustand slice | Zustand는 FunMode boolean 하나에 과잉. Context가 기존 SettingsContext/AuthContext 패턴과 일치 |
| localStorage | Dexie 테이블 | Dexie는 영속성으로 과잉. localStorage가 boolean 저장에 충분하고 동기적 초기화 가능 |
| Vite manualChunks | Rollup output.manualChunks | 동일함. Vite가 Rollup 기반이므로 같은 API |
| `data-fun-mode` DOM 속성 | CSS class toggle | 속성이 더 명확한 의미론. Tailwind v4 arbitrary variants와 호환 |

**Installation (신규 없음 — 기존 스택만 사용):**
```bash
# Phase 15는 신규 npm 패키지 설치 없음
# Phaser, Three.js, Howler는 이미 결정되었으나 Phase 15에서는 POC용 Phaser만 설치
npm install phaser@3.90.0
```

---

## Architecture Patterns

### Recommended Project Structure

```
apps/web/src/
├── contexts/
│   └── FunModeContext.tsx       # 신규 — 반전 모드 전역 게이트
├── components/
│   └── layout/
│       ├── AppShell.tsx         # 수정 — FunModeToggleButton 삽입만
│       └── FunModeToggleButton.tsx  # 신규 — 커스터마이즈 버튼
│   └── game/                    # 신규 디렉터리
│       └── GameLoadingSpinner.tsx   # Suspense fallback UI
├── game/
│   └── EventBus.ts              # 신규 — Phaser.Events.EventEmitter 싱글턴
├── hooks/
│   └── useFunMode.ts            # 신규 — FunModeContext 훅
├── lib/
│   └── db.ts                    # 수정 — version 8 추가
└── index.css                    # 수정 — [data-fun-mode="true"] CSS 변수 추가
```

### Pattern 1: FunModeContext — 전역 모드 토글

**What:** boolean 전역 상태 + localStorage 영속성 + DOM 속성 동기 적용. 다크모드 토글 패턴과 동일.

**When to use:** 앱 전체 진입점. SettingsProvider 바로 아래에 위치.

**Example:**
```typescript
// Source: STATE.md 확정 결정 + CSS-Tricks 다크모드 패턴
// src/contexts/FunModeContext.tsx
interface FunModeContextValue {
  isFunMode: boolean
  toggleFunMode: () => void
}

export function FunModeProvider({ children }: { children: ReactNode }) {
  const [isFunMode, setIsFunMode] = useState<boolean>(() => {
    return localStorage.getItem('app:funMode') === 'true'
  })

  // 초기 마운트 시 DOM 속성 동기화
  useLayoutEffect(() => {
    document.documentElement.setAttribute('data-fun-mode', String(isFunMode))
  }, [])

  function toggleFunMode() {
    const next = !isFunMode
    setIsFunMode(next)
    localStorage.setItem('app:funMode', String(next))
    document.documentElement.setAttribute('data-fun-mode', String(next))
  }

  return (
    <FunModeContext.Provider value={{ isFunMode, toggleFunMode }}>
      {children}
    </FunModeContext.Provider>
  )
}

export function useFunMode() {
  const ctx = useContext(FunModeContext)
  if (!ctx) throw new Error('useFunMode must be used within FunModeProvider')
  return ctx
}
```

### Pattern 2: CSS 테마 변수 — `[data-fun-mode="true"]` 선택자

**What:** `document.documentElement`의 `data-fun-mode` 속성이 변경되는 순간 CSS 변수가 재계산되어 전체 UI 테마가 즉시 전환된다. JavaScript 렌더링 없이 CSS 엔진이 처리하므로 지연 없음.

**When to use:** INFRA-02 전체 UI 테마 변신 요구사항.

**Example:**
```css
/* Source: ARCHITECTURE.md Pattern 1 + 기존 프로젝트 index.css 패턴 */
/* apps/web/src/index.css — @layer base 내부에 추가 */

[data-fun-mode="true"] {
  /* 배경 — 다크 퍼플/인디고 계열 */
  --background: oklch(0.12 0.04 280);
  --foreground: oklch(0.98 0.01 280);

  /* 주 강조색 — 네온 그린 (게임 UI 느낌) */
  --primary: oklch(0.70 0.28 150);
  --primary-foreground: oklch(0.10 0.02 150);

  /* 카드/패널 */
  --card: oklch(0.16 0.04 280);
  --card-foreground: oklch(0.95 0.01 280);

  /* 보조색 — 일렉트릭 퍼플 */
  --accent: oklch(0.60 0.25 300);

  /* 폰트 — 이미 Pretendard 사용 중, 게임 모드에서 weight 강화 */
  --font-weight-base: 600;
}
```

### Pattern 3: Vite manualChunks — 게임 번들 완전 분리

**What:** Vite build 시 Phaser/Three.js/Howler를 별도 청크로 추출. React.lazy()와 조합하면 일반 모드 초기 번들에 게임 라이브러리가 0바이트 포함된다.

**When to use:** INFRA-04 필수. 미적용 시 초기 번들 ~2MB 폭증.

**Example:**
```typescript
// Source: Vite manualChunks GitHub Discussion + ARCHITECTURE.md Pattern 5
// apps/web/vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/phaser')) return 'game-phaser'
          if (id.includes('node_modules/three')) return 'game-three'
          if (id.includes('node_modules/howler')) return 'game-howler'
        },
      },
    },
    // 경고 임계값 상향 (게임 청크는 크기가 클 수밖에 없음)
    chunkSizeWarningLimit: 1500,
  },
})
```

**React.lazy() 래퍼 패턴:**
```typescript
// src/components/game/FunModeGate.tsx
const PhaserBridge = lazy(() => import('@/components/game/PhaserBridge'))
const ThreeBackground = lazy(() => import('@/components/game/ThreeBackground'))

// Suspense fallback — INFRA-05 로딩 화면
export function FunModeGate({ children }: { children: ReactNode }) {
  const { isFunMode } = useFunMode()
  if (!isFunMode) return <>{children}</>

  return (
    <Suspense fallback={<GameLoadingSpinner />}>
      <ThreeBackground />
      {children}
    </Suspense>
  )
}
```

### Pattern 4: Dexie version 8 마이그레이션

**What:** 기존 version(7) 이후 version(8)을 추가하여 gamification 전용 테이블 3개 삽입. 기존 데이터 무손실.

**When to use:** gamification.service.ts (Phase 16)가 의존하는 스키마를 Phase 15에서 먼저 확립.

**Example:**
```typescript
// Source: ARCHITECTURE.md Dexie 스키마 확장 섹션
// src/lib/db.ts — 기존 코드 하단에 추가
db.version(8).stores({
  // 기존 테이블 정의 그대로 유지 (생략 가능 — Dexie는 이전 버전 테이블 자동 상속)
  gamificationProfiles: '++id, &studentId',
  xpEvents: '++id, studentId, reason, timestamp',
  badges: '++id, studentId, badgeId, unlockedAt',
})
```

### Pattern 5: Phaser POC — React StrictMode 이중 초기화 방지

**What:** `useRef` 가드로 StrictMode의 이중 마운트에서 Phaser가 두 번 초기화되는 것을 방지. 공식 Phaser React TypeScript 템플릿 패턴.

**When to use:** Phase 15 POC에서 G1 함정 검증. Phase 19에서 본격 사용.

**Example:**
```typescript
// Source: phaserjs/template-react-ts 공식 GitHub 템플릿
// src/components/game/PhaserBridge.tsx (POC 버전)
export const PhaserBridge = forwardRef<PhaserBridgeRef, Props>(
  ({ gameConfig }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const gameRef = useRef<Phaser.Game | null>(null)

    useLayoutEffect(() => {
      // useRef 가드 — StrictMode 이중 마운트 방지 (G1)
      if (gameRef.current !== null) return

      import('phaser').then(({ default: Phaser }) => {
        gameRef.current = new Phaser.Game({
          ...gameConfig,
          parent: containerRef.current!,
        })
      })

      return () => {
        // cleanup — G2 메모리 누수 방지
        gameRef.current?.destroy(true)
        gameRef.current = null
      }
    }, []) // 의존성 배열 빈 값 — 마운트 1회만

    return <div ref={containerRef} />
  }
)
```

### Pattern 6: GameLoadingSpinner — INFRA-05 로딩 화면

**What:** React.lazy() Suspense fallback으로 사용되는 재미있는 로딩 UI. Phaser PreloadScene 진행률과 연동.

**When to use:** 반전 모드 최초 진입 시 게임 에셋 로드 중 표시.

**Example:**
```typescript
// src/components/game/GameLoadingSpinner.tsx
export function GameLoadingSpinner() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // EventBus로 Phaser PreloadScene 진행률 수신
    const handler = (value: number) => setProgress(value)
    EventBus.on('load-progress', handler)
    return () => { EventBus.off('load-progress', handler) }
  }, [])

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background z-50">
      <div className="text-4xl mb-4 animate-bounce">🎮</div>
      <p className="text-primary font-bold text-lg mb-2">반전 모드 로딩 중...</p>
      <div className="w-64 h-3 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-muted-foreground text-sm mt-2">{progress}%</p>
    </div>
  )
}
```

### Anti-Patterns to Avoid

- **정적 import로 Phaser/Three.js 사용:** `import Phaser from 'phaser'`를 최상단에 선언하면 일반 모드에서도 번들에 포함됨. 반드시 `import('phaser')` 동적 import만 사용.
- **FunModeContext에 Phaser 인스턴스 저장:** Context value 변경이 전체 하위 트리를 리렌더링함. Phaser 인스턴스는 `useRef`에만 보관.
- **React useState에 애니메이션 값 저장:** 60fps 루프에서 setState 호출은 성능 재앙. 애니메이션 값은 `useRef` 또는 게임 엔진 내부에 보관.
- **AppShell 전면 재작성:** FunModeToggleButton 삽입만으로 충분. 기존 17K LOC를 건드리지 말 것.
- **Phaser와 Three.js가 같은 canvas 공유:** WebGL 컨텍스트는 canvas당 1개. Two.js는 fixed 배경 canvas, Phaser는 별도 div 내 canvas로 완전 분리.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| 번들 청크 분리 | 커스텀 Rollup 플러그인 | Vite manualChunks | 공식 API, tree-shaking과 자동 통합 |
| CSS 테마 전환 | JavaScript로 style 직접 조작 | CSS 변수 + `data-*` 속성 | CSS 엔진이 동기적으로 처리, FOUC 없음 |
| 반전 모드 영속성 | Dexie 별도 테이블 | localStorage | boolean 하나에 IndexedDB 과잉. localStorage가 동기적 초기화 지원 |
| 진행률 표시 | Phaser 씬 내부 HTML 오버레이 | EventBus + React 컴포넌트 | React DOM과 Phaser DOM 분리 원칙 유지 |
| Phaser-React 통신 | window 전역 변수 | EventBus (Phaser.Events.EventEmitter) | 공식 Phaser React 템플릿 패턴 |

**Key insight:** Phase 15의 모든 핵심 문제(번들 분리, 테마 전환, 영속성)는 이미 검증된 표준 패턴으로 해결 가능하다. 커스텀 솔루션이 필요한 영역은 없다.

---

## Common Pitfalls

### Pitfall 1: G1 — React StrictMode + Phaser 이중 초기화 (CRITICAL)

**What goes wrong:** React 18/19 StrictMode는 개발 모드에서 useEffect를 두 번 호출한다. `useLayoutEffect`도 동일. 가드 없이 Phaser.Game을 생성하면 두 개의 게임 인스턴스가 같은 container에 마운트되어 화면이 깨지거나 무한 루프.

**Why it happens:** StrictMode의 의도적 이중 마운트 (버그 감지 목적). Phaser는 이를 인식하지 못함.

**How to avoid:** `useRef` 가드 패턴 — `if (gameRef.current !== null) return`. 공식 `phaserjs/template-react-ts` 템플릿이 이 패턴을 사용.

**Warning signs:** 개발 모드에서 canvas가 두 개 렌더링됨. console에 "Phaser already running" 경고.

### Pitfall 2: G5 — 번들 사이즈 폭발 (CRITICAL)

**What goes wrong:** Phaser를 정적 import하면 ~980KB min (미gz)이 초기 번들에 포함. 기존 2780KB 경고 상황에서 치명적.

**Why it happens:** 개발자가 편의상 `import Phaser from 'phaser'`를 파일 상단에 선언.

**How to avoid:** `manualChunks` 설정 후 `vite build --report`로 청크 분리 확인. 게임 관련 컴포넌트는 반드시 `React.lazy()` 래퍼 통해서만 import.

**Warning signs:** `vite build` 후 단일 청크가 2MB 이상. `--report` 출력에서 phaser가 main chunk에 포함.

### Pitfall 3: G3 — WebGL 컨텍스트 한도 (CRITICAL for POC)

**What goes wrong:** 브라우저는 탭당 WebGL 컨텍스트를 8~16개로 제한 (Safari는 특히 엄격, OffscreenCanvas 4개 한도). Phaser canvas + Three.js canvas + Recharts canvas가 동시 존재하면 한도 초과 가능.

**Why it happens:** 각 라이브러리가 독립적으로 WebGL 컨텍스트를 생성.

**How to avoid:** Phase 15 POC에서 실측 — 개발자 도구 → Performance → GPU 탭 확인. Recharts를 SVG 모드로 강제. Three.js 이펙트는 특별한 순간에만 사용 후 즉시 `renderer.dispose()`.

**Warning signs:** `WebGL: CONTEXT_LOST_WEBGL` 콘솔 오류. Safari에서 canvas가 검은 화면.

### Pitfall 4: FOUC (Flash of Unstyled Content) 방지

**What goes wrong:** localStorage에서 `isFunMode = true`를 읽어 초기화하더라도, FunModeProvider가 마운트되기 전 CSS 변수가 적용되지 않아 일반 모드 스타일이 잠깐 번쩍임.

**Why it happens:** React hydration 전에 DOM이 렌더링됨.

**How to avoid:** `useLayoutEffect`로 초기 마운트 시 즉시 `data-fun-mode` 속성 설정. 또는 `index.html`의 `<script>` 태그에서 localStorage를 읽어 `<html>` 태그에 속성 적용 (다크모드 표준 패턴).

**Warning signs:** 반전 모드 상태로 새로고침 시 화면이 일반 모드로 잠깐 표시 후 전환.

### Pitfall 5: Dexie 버전 충돌

**What goes wrong:** `version(8).stores()`에서 기존 테이블 정의를 생략하면 Dexie가 해당 테이블을 제거한다고 오해할 수 있음. (실제로는 Dexie가 이전 버전 테이블을 자동 유지하지만, 명시적 정의 없이 `.upgrade()` 없이 스키마 변경 시 혼란.)

**Why it happens:** Dexie 마이그레이션 API 오해.

**How to avoid:** `version(8).stores()`에는 신규 테이블만 추가. 기존 테이블은 이전 버전 정의에서 자동 상속됨. 마이그레이션 후 Dexie DevTools로 테이블 목록 확인.

**Warning signs:** 기존 기능(퀴즈 기록, 스트릭)이 반전 모드 전환 후 데이터를 잃음.

---

## Code Examples

Verified patterns from project research and official sources:

### FunModeProvider 전체 구조
```typescript
// Source: ARCHITECTURE.md Pattern 1 + STATE.md 확정 결정
// src/contexts/FunModeContext.tsx
import { createContext, useContext, useLayoutEffect, useState } from 'react'
import type { ReactNode } from 'react'

interface FunModeContextValue {
  isFunMode: boolean
  toggleFunMode: () => void
}

const FunModeContext = createContext<FunModeContextValue | null>(null)

export function FunModeProvider({ children }: { children: ReactNode }) {
  const [isFunMode, setIsFunMode] = useState<boolean>(() => {
    return localStorage.getItem('app:funMode') === 'true'
  })

  // FOUC 방지 — 초기 DOM 속성 동기 적용
  useLayoutEffect(() => {
    document.documentElement.setAttribute('data-fun-mode', String(isFunMode))
  }, [])

  function toggleFunMode() {
    const next = !isFunMode
    setIsFunMode(next)
    localStorage.setItem('app:funMode', String(next))
    document.documentElement.setAttribute('data-fun-mode', String(next))
  }

  return (
    <FunModeContext.Provider value={{ isFunMode, toggleFunMode }}>
      {children}
    </FunModeContext.Provider>
  )
}

export function useFunMode(): FunModeContextValue {
  const ctx = useContext(FunModeContext)
  if (!ctx) throw new Error('useFunMode: FunModeProvider 외부에서 호출됨')
  return ctx
}
```

### Vite manualChunks 설정
```typescript
// Source: Vite manualChunks GitHub Discussion #17730
// apps/web/vite.config.ts — build.rollupOptions.output에 추가
manualChunks(id: string) {
  if (id.includes('node_modules/phaser')) return 'game-phaser'
  if (id.includes('node_modules/three')) return 'game-three'
  if (id.includes('node_modules/howler')) return 'game-howler'
  // canvas-confetti는 2.5kb gz로 main 청크에 포함해도 무방
},
```

### 번들 사이즈 검증 명령
```bash
# Source: Vite 공식 문서
cd apps/web
npx vite build --mode production
# 출력 확인: game-phaser.js, game-three.js, game-howler.js가 별도 파일로 생성되어야 함
# index.js에 phaser/three/howler가 포함되면 설정 오류

# 상세 번들 분석
npx vite-bundle-visualizer
```

### AppShell에 FunModeToggleButton 삽입
```typescript
// Source: ARCHITECTURE.md Anti-Pattern 5 — 최소 수정 원칙
// AppShell.tsx — 기존 다크모드 토글 버튼 옆에만 추가
import { FunModeToggleButton } from '@/components/layout/FunModeToggleButton'

// 헤더 영역에만 추가
<header className="...">
  {/* 기존 요소들 유지 */}
  <DarkModeToggle />
  <FunModeToggleButton />  {/* 신규 추가 — 이것이 전부 */}
</header>
```

### Dexie v8 스키마 확장
```typescript
// Source: ARCHITECTURE.md Integration Points
// src/lib/db.ts — 기존 코드 하단에만 추가
export interface GamificationProfile {
  id?: number
  studentId: string
  totalXP: number
  level: number
  updatedAt: number
}

export interface XPEvent {
  id?: number
  studentId: string
  amount: number
  reason: string
  timestamp: number
}

export interface Badge {
  id?: number
  studentId: string
  badgeId: string
  unlockedAt: number
}

// 기존 db 인스턴스에 version 8 추가
db.version(8).stores({
  gamificationProfiles: '++id, &studentId',
  xpEvents: '++id, studentId, reason, timestamp',
  badges: '++id, studentId, badgeId, unlockedAt',
})
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| CSS class toggle (`document.body.classList`) | `data-*` attribute + CSS 변수 | Tailwind v4 (2025) | v4 arbitrary variants와 더 잘 통합, 의미론적으로 명확 |
| Webpack code splitting | Vite manualChunks | 2022~ | 설정 대폭 간소화, HMR과 자동 통합 |
| React 18 `useEffect` 1회 실행 | React 19 StrictMode 이중 실행 | React 19 (2024) | 개발 중 Phaser 이중 초기화 문제 더 빈번 — useRef 가드 필수 |
| R3F v8 (React 18) | R3F v9 (React 19 전용) | 2025 | peer dep `react: ">=19 <19.3"` — React 19.3 릴리즈 시 재검토 |

**Deprecated/outdated:**
- `import()` 없이 Phaser 정적 import: 2022년 이후 Vite 프로젝트에서 안티패턴으로 확립
- React 18용 R3F v8: Phase 18에서 R3F v9 사용 예정 (이미 확정)

---

## Open Questions

1. **Safari WebGL 컨텍스트 한도 실측값**
   - What we know: 단일 소스 (WebGL dev mailing list)에서 Safari OffscreenCanvas 4개 한도 언급
   - What's unclear: 실제 iOS Safari 17+ / macOS Safari 17+에서 Phaser canvas + Three.js canvas 동시 실행 시 한도에 걸리는지
   - Recommendation: Phase 15 POC에서 실 기기 + 시뮬레이터로 반드시 실측. WebGL context lost 이벤트 리스너 등록 후 테스트

2. **FOUC 완전 방지 방법**
   - What we know: `useLayoutEffect`로 초기화 시 React 마운트 이후 즉시 DOM 속성 적용
   - What's unclear: SSR 없는 Vite SPA에서도 FOUC가 실제로 발생하는지 (React hydration 이슈는 SSR 전용 일 수 있음)
   - Recommendation: `index.html`에 인라인 `<script>`로 localStorage를 읽어 `<html>` 태그에 `data-fun-mode` 속성을 미리 적용하는 다크모드 표준 패턴 적용 여부 결정

3. **FunModeToggleButton 위치 및 UX**
   - What we know: AppShell 헤더에 삽입. "커스터마이즈 버튼"으로 명명
   - What's unclear: 모바일 BottomNav에도 탭으로 추가할지, 헤더 아이콘 버튼으로만 할지
   - Recommendation: Phase 15에서는 헤더 아이콘 버튼으로 최소 구현. Phase 20에서 UX 개선

---

## Sources

### Primary (HIGH confidence)
- [phaserjs/template-react-ts GitHub](https://github.com/phaserjs/template-react-ts) — PhaserBridge forwardRef + useLayoutEffect + useRef 가드 패턴
- [STATE.md](../../STATE.md) — 번들 전략, 라이브러리 버전, 함정 목록 확정 결정사항
- [ARCHITECTURE.md](../../research/ARCHITECTURE.md) — FunModeContext, Vite manualChunks, Dexie v8, 6개 핵심 패턴 전체
- [SUMMARY.md](../../research/SUMMARY.md) — 프로젝트 전체 스택, 아키텍처 의사결정 배경
- [Vite manualChunks GitHub Discussion #17730](https://github.com/vitejs/vite/discussions/17730) — 게임 번들 분리 설정
- [CSS-Tricks 다크모드 CSS 변수 패턴](https://css-tricks.com/easy-dark-mode-and-multiple-color-themes-in-react/) — `data-*` 속성 + CSS 변수 테마 토글

### Secondary (MEDIUM confidence)
- [Phaser 메모리 누수 이슈 #5456](https://github.com/photonstorm/phaser/issues/5456) — `game.destroy(true)` cleanup 검증
- [react-three-fiber WebGL 컨텍스트 Safari 이슈](https://github.com/pmndrs/react-three-fiber/discussions/2457) — Safari 컨텍스트 한도 단일 소스 (실측 필요)

### Tertiary (LOW confidence)
- Phaser 번들 크기 980KB min — `vite build --report`로 직접 확인 권장
- FOUC가 Vite SPA에서도 발생하는지 여부 — 개발 환경 실측 필요

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — 기존 프로젝트 스택 그대로, 신규 npm 패키지 최소 (Phaser만)
- Architecture: HIGH — ARCHITECTURE.md에 코드 수준 패턴이 완비됨
- Pitfalls: HIGH — STATE.md에 Critical Pitfalls로 이미 문서화됨. G3 WebGL 한도만 MEDIUM (실측 필요)

**Research date:** 2026-02-23
**Valid until:** 2026-03-23 (Phaser 3.x, React 19, Vite 7 모두 안정 버전 — 30일 유효)
