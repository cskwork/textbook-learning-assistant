# Stack Research

**Domain:** 수학 기출문제 학습 웹앱 — v3.0 반전 모드 (게이미피케이션)
**Researched:** 2026-02-23
**Confidence:** HIGH (게임 엔진/오디오/3D), MEDIUM (번들 크기 영향)

> **중요:** 기존 스택(React 19, Vite 7, Tailwind v4, shadcn/ui, Framer Motion, Swiper, KaTeX, Dexie, Zustand, Recharts)은 이미 검증됨. 이 문서는 v3.0 반전 모드에 필요한 신규 라이브러리만 다룬다.

---

## Recommended Stack — 신규 추가 라이브러리

### Core Game Engine

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Phaser 3 | 3.90.0 (`latest`) | 게이미피케이션 퀴즈 엔진 (타임어택, 콤보, 보스전) | React 19 + Vite 7 공식 템플릿 존재. Phaser Studio가 React TypeScript 템플릿 직접 제공. 이벤트버스 + forwardRef 브릿지 패턴으로 React ↔ Phaser 양방향 통신 검증됨. v3.90이 마지막 v3 릴리즈(최종 안정) |
| three | 0.183.1 | 3D 파티클, 레벨업 연출, 배경 효과 | @react-three/fiber의 peer dependency. Three.js 자체는 tree-shaking 가능. 반전 모드 진입 시 lazy load로 초기 번들 영향 없음 |
| @react-three/fiber | 9.5.0 | Three.js를 React JSX로 선언적 사용 | React 19 공식 지원 (`react: ">=19 <19.3"`). v9는 React 19 전용. Three.js 0.156+ 호환 |
| @react-three/drei | 10.7.7 | R3F 유틸리티 모음 (Stars, Sparkles, Float 등) | @react-three/fiber 9.x peer dependency 요구. 파티클/글리터/배경 효과 30줄 이내로 구현 가능. drei 없이는 동등 기능 직접 구현에 수배 코드 필요 |

### 오디오 시스템

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| howler | 2.2.4 | BGM, SFX, 정답/오답 사운드 | use-sound의 underlying 엔진. React 19 peer dependency 없음 (프레임워크 독립). Web Audio API fallback 내장. 오디오 스프라이트 지원 → 단일 파일로 모든 SFX 관리 |
| use-sound | 5.0.0 | React hook 기반 사운드 트리거 | peer dependency `react: ">=16.8"` — React 19 완전 호환. Howler 위에 올라가는 1kb hook. `useSound('sfx.mp3')` 한 줄로 컴포넌트에서 사운드 트리거. 정답 효과음/버튼 SFX에 적합 |

### 반전 모드 상태 관리

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Zustand | 5.0.11 | 반전 모드 토글 + 게이미피케이션 전역 상태 (XP, 뱃지, 스트릭) | **이미 설치됨**. v5 peer dependency는 모두 optional이며 React 19 완전 호환 확인. 신규 추가 불필요, 스토어 슬라이스만 추가 |

### 시각 효과 / 리워드 연출

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| canvas-confetti | 1.9.4 | 정답/레벨업 시 confetti 폭죽 효과 | 외부 의존 없음 (zero-dependency). 2.5kb gzip. Three.js 진입 전 경량 승리 연출. 반전 모드 퀴즈 정답 처리에 최적 |

---

## Phaser 3 ↔ React 19 통합 패턴

Phaser Studio 공식 React TypeScript 템플릿(phaserjs/template-react-ts)이 React 19.0 + Phaser 3.90으로 검증됨. 핵심 패턴:

```
1. PhaserGame.tsx — React ref + forwardRef로 game instance 노출
2. EventBus — React에서 emit → Phaser Scene에서 listen (양방향)
3. 반전 모드 라우트에서 React.lazy() + Suspense로 Phaser 전체를 lazy load
```

```tsx
// 반전 모드 라우트에서만 Phaser 로드 (코드 스플리팅)
const GameScene = React.lazy(() => import('./game/PhaserGame'))

// EventBus로 React ↔ Phaser 통신
EventBus.emit('quiz-answer', { correct: true, combo: 3 })
EventBus.on('game-ready', (scene: Phaser.Scene) => { /* ... */ })
```

---

## Three.js / R3F 통합 패턴

반전 모드 배경 / 레벨업 연출은 R3F로 React 컴포넌트처럼 선언:

```tsx
// 반전 모드에서만 lazy load
const GameBackground = React.lazy(() => import('./3d/GameBackground'))

// drei Stars, Sparkles로 파티클 효과 3D
import { Stars, Sparkles } from '@react-three/drei'
<Canvas>
  <Stars radius={100} depth={50} count={5000} factor={4} />
  <Sparkles count={200} speed={0.5} color="#gold" />
</Canvas>
```

---

## Installation

```bash
# 반전 모드 게임 엔진
pnpm add phaser@3.90.0

# 3D 시각 효과 (React 19 + Three.js)
pnpm add three @react-three/fiber @react-three/drei

# 3D TypeScript 타입
pnpm add -D @types/three

# 오디오
pnpm add howler use-sound
pnpm add -D @types/howler

# 경량 시각 효과
pnpm add canvas-confetti
pnpm add -D @types/canvas-confetti

# Zustand — 이미 설치됨, 슬라이스만 추가
# (별도 설치 불필요)
```

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| 게임 엔진 | Phaser 3.90 (stable) | Phaser 4.0.0-rc.6 | RC 단계. npm tag `beta`로 비안정. 새 프로젝트면 v4 권장이나 기존 앱 통합엔 v3 안정성 우선 |
| 게임 엔진 | Phaser 3 | Babylon.js | 3D 게임 엔진 특화 — 2D 퀴즈/미니게임엔 과도함. 번들 크기 더 큼 |
| 3D | @react-three/fiber + drei | Three.js 직접 사용 | R3F 없이 직접 사용 시 React lifecycle 관리 수동. useEffect 지옥. R3F로 React 선언적 패턴 유지 |
| 3D | @react-three/fiber 9 | @react-three/fiber 8 | v8은 React 18용. React 19는 v9 필수 |
| 오디오 | use-sound + howler | Web Audio API 직접 | Web Audio API는 오디오 스프라이트/크로스브라우저 대응 수동 코드 과다. howler가 이를 추상화 |
| 오디오 | use-sound | react-howler | react-howler는 주간 다운로드 7k vs use-sound 140k. 생태계 크기 차이 명확 |
| confetti | canvas-confetti | react-confetti | react-confetti는 canvas-confetti 대비 DOM window-fill 방식 — 게임 오버레이보다 전체 화면에 적합. canvas-confetti는 커스텀 canvas 지원 |
| 게이미피케이션 상태 | Zustand 커스텀 슬라이스 | @ludiks/react / Trophy API | 외부 서비스 의존 불필요. XP/뱃지/스트릭 로직이 앱 도메인에 종속적. Zustand로 직접 구현이 더 간단 |

---

## What NOT to Add

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Phaser 4 (`beta` tag) | npm `beta` tag = 4.0.0-rc.6. RC 단계로 API 변경 가능. React + Vite 공식 템플릿도 v3 기준 | Phaser 3.90.0 (`latest`) |
| @react-three/postprocessing | 고급 bloom/glow 효과용이나 반전 모드 scope에서 오버엔지니어링. 번들 +60kb | drei의 내장 Sparkles, Stars로 충분 |
| PixiJS | 2D 렌더러로 Phaser와 역할 중복. Phaser가 이미 Pixi 기반 렌더러 내장 | Phaser 3 |
| gsap (GreenSock) | Framer Motion이 이미 설치됨. 동일한 애니메이션 레이어 중복 | Framer Motion (기존) |
| lottie-react | JSON 애니메이션 재생용 — Framer Motion과 Three.js로 대체 가능. 추가 에셋 관리 부담 | Framer Motion + canvas-confetti |
| Matter.js | 물리 엔진 — 보스전 정도 수준에서 불필요. Phaser 내장 Arcade Physics로 충분 | Phaser built-in physics |
| socket.io | 실시간 멀티 리더보드용이나 v3.0 scope 밖. 로컬 Dexie 리더보드로 충분 | Dexie (기존) |

---

## 번들 크기 영향 분석

| 라이브러리 | minified gzip | 로드 시점 | 전략 |
|------------|--------------|-----------|------|
| phaser | ~980kb min / ~350kb gz | 반전 모드 진입 시 | `React.lazy()` + route-level code split |
| three + @react-three/fiber + drei | ~155kb gz (three) + ~30kb (r3f+drei) | 반전 모드 진입 시 | 동일 lazy chunk로 묶음 |
| howler | ~9kb gz | 반전 모드 진입 시 | use-sound가 lazy-load |
| canvas-confetti | ~2.5kb gz | 퀴즈 정답 시 | 즉시 로드 허용 (크기 무시 가능) |
| **총 추가 (초기 로드)** | **~0kb** | 반전 모드 off = 추가 없음 | 코드 스플리팅으로 메인 번들 영향 없음 |
| **총 추가 (반전 모드 on)** | **~520kb gz** | 반전 모드 최초 진입 시 1회 | 게임 진입 로딩 화면으로 UX 처리 |

**핵심 전략:** 반전 모드 관련 모든 라이브러리를 `/game` 라우트 하위로 코드 스플리팅. 일반 학습 모드에서는 bundle에 포함되지 않음.

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| @react-three/fiber 9.x | React 19.0–19.2 | peer dependency `react: ">=19 <19.3"`. React 19.3+ 릴리즈 시 재검토 필요 |
| @react-three/drei 10.x | @react-three/fiber 9.x | drei 10 → r3f 9 필수. drei 9 + r3f 9 혼용 불가 |
| three 0.183.x | @react-three/fiber 9.x | r3f peer `three: ">=0.156"` 만족 |
| phaser 3.90 | React 19 / Vite 7 | 공식 template-react-ts가 React 19.0 + Phaser 3.90으로 검증 |
| use-sound 5.0 | React 19 | peer `react: ">=16.8"` — React 19 완전 호환 |
| howler 2.2.4 | React 독립 | 프레임워크 의존 없음. 모든 환경 호환 |
| zustand 5.0.11 | React 19 | peer dependencies 전부 optional 플래그. React 19 호환 |

---

## 게이미피케이션 시스템 아키텍처 (라이브러리 선택 없이 직접 구현)

XP, 뱃지, 스트릭, 리더보드는 전용 외부 라이브러리 없이 Zustand + Dexie로 직접 구현 권장.

근거:
- `@ludiks/react` — 주간 다운로드 수백 회 수준. 생태계 미성숙
- `Trophy 1.0` — 외부 SaaS API 의존. 오프라인 PWA 앱에 부적합
- 앱 고유 BKT 학습 모델 + 수학 문제 도메인에 종속된 로직 → 범용 라이브러리 맞춤화 비용 > 직접 구현

```
Zustand gamificationSlice {
  xp: number
  level: number
  streak: number
  badges: Badge[]
  leaderboard: LeaderboardEntry[]   // Dexie에 persist
}
```

---

## Sources

- npm registry 실시간 조회 (2026-02-23) — phaser 3.90.0 / three 0.183.1 / @react-three/fiber 9.5.0 / @react-three/drei 10.7.7 / howler 2.2.4 / use-sound 5.0.0 / canvas-confetti 1.9.4 / zustand 5.0.11 버전 확인
- [phaserjs/template-react-ts GitHub](https://github.com/phaserjs/template-react-ts) — React 19.0 + Phaser 3.90 공식 통합 패턴 확인 (HIGH)
- [Phaser v3.90.0 "Tsugumi" 릴리즈](https://phaser.io/news/2025/05/phaser-v390-released) — v3 마지막 릴리즈. v4 RC 진행 중 (HIGH)
- [Phaser v4 RC6 현황](https://phaser.io/news/2025/05/phaser-v4-release-candidate-4) — RC 단계, 신규 프로젝트 통합 비권장 (MEDIUM)
- [@react-three/fiber npm](https://www.npmjs.com/package/@react-three/fiber) — v9 peer `react: ">=19 <19.3"` 확인 (HIGH)
- [@react-three/drei GitHub Discussion #2213](https://github.com/pmndrs/drei/discussions/2213) — React 19 + R3F v9 호환성 커뮤니티 확인 (MEDIUM)
- [use-sound GitHub](https://github.com/joshwcomeau/use-sound) — howler 2.2.4 의존, React 16.8+ peer 확인 (HIGH)
- [react-howler vs use-sound npmtrends](https://npmtrends.com/react-howler-vs-use-sound) — use-sound 140k/주 vs react-howler 7k/주 다운로드 차이 확인 (MEDIUM)
- WebSearch (2026-02-23) — Phaser 번들 크기 980kb min, Three.js 658kb min 확인 (MEDIUM)

---

*Stack research for: v3.0 반전 모드 게이미피케이션 — 신규 추가 라이브러리 only*
*Researched: 2026-02-23*
