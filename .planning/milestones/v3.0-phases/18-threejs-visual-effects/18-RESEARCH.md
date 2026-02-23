# Phase 18: Three.js 시각 효과 - Research

**Researched:** 2026-02-23
**Domain:** React Three Fiber 기반 3D 배경 + 파티클 이펙트 + 이벤트 반응 연출
**Confidence:** HIGH

## Summary

Phase 18은 반전 모드(FunMode)에서 Three.js 기반 3D 배경 애니메이션과 학습 이벤트 반응 시각 효과를 구현한다. React Three Fiber(R3F) v9를 React 19과 함께 사용하며, @react-three/drei의 Stars/Sparkles/PerformanceMonitor 등 헬퍼를 활용한다. 파티클 폭발은 R3F useFrame + InstancedMesh 패턴, 컨페티는 canvas-confetti 라이브러리, 오답 shake/flash는 CSS 전용으로 구현한다.

기존 Phase 15 인프라(FunModeGate Suspense, Vite manualChunks 'game-three', EventBus)를 활성화하고, Phase 16의 GamificationResult 콜백 + EventBus 이벤트를 Three.js 씬이 구독하는 구조를 구축한다. 저사양 기기 대응은 useDetectGPU + PerformanceMonitor로 자동 품질 조절하며, WebGL 미지원 시 CSS gradient fallback을 제공한다.

**Primary recommendation:** R3F v9 + drei helpers + canvas-confetti 조합으로 선언적 3D 씬 관리, EventBus 이벤트 구독으로 React 렌더 사이클 밖에서 VFX 트리거.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- 화면별 배경 테마: 홈(우주/별), 퀴즈(네온 격자/사이버펑크), 분석(파도/물결), 프로필(산/자연)
- 배경은 CSS z-index 최하단, React DOM 위에 canvas 렌더링
- 미묘하게 움직이는 ambient 애니메이션 (60fps 목표, 30fps 최소)
- 마우스/터치 위치에 미세 반응 (parallax 느낌)
- 정답: 중앙에서 방사형으로 퍼지는 골드/그린 파티클 폭발 (~1초)
- 오답: 화면 전체 빨간 플래시 (0.2초) + CSS transform shake (0.3초) — Three.js 불필요, CSS로 처리
- 콤보: 정답 파티클 + 콤보 단계별 파티클 양/크기 증가
- 레벨업: 이미 Phase 16에서 LevelUpOverlay 있음 → Three.js 파티클 배경 추가 (ring expand + sparkle)
- 퀴즈 완료: canvas-confetti 라이브러리 사용 (Phase 15에서 이미 의존성 확정)
- WebGL 지원 체크: 미지원 시 2D CSS fallback (간단한 gradient 애니메이션)
- FPS 모니터링: 15fps 이하 지속 시 자동으로 파티클 수 감소 또는 3D 배경 비활성화
- 모바일: 파티클 수 50% 감소, 배경 해상도 절반 (devicePixelRatio 제한)
- R3F 컴포넌트는 React.lazy()로 완전 코드 스플리팅 (Phase 15 manualChunks 'game-three' 활용)
- Phase 15의 SimpleEventEmitter 패턴 활용 (gamification-event bus)
- QuizPlayer → awardXP 결과 → EventBus emit → Three.js 씬이 subscribe
- React 렌더 사이클 밖에서 직접 Three.js 오브젝트 조작 (useFrame 내부)

### Claude's Discretion
- 정확한 파티클 수, 크기, 속도, 색상 값
- Three.js 셰이더 복잡도
- FPS 임계값 튜닝
- 배경 테마별 지오메트리 디테일 수준
- canvas-confetti 설정 값 (파티클 수, 확산 각도 등)

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| VFX-01 | 반전 모드에서 Three.js 3D 배경이 각 화면별로 다른 테마로 렌더링된다 | R3F Canvas + 화면별 씬 컴포넌트(SpaceBg, NeonGridBg, WaveBg, MountainBg) + FunModeGate lazy loading |
| VFX-02 | 정답 시 파티클 폭발 이펙트가 화면에 재생된다 | InstancedMesh 파티클 시스템 + EventBus 'correct-answer' 구독 + useFrame 애니메이션 |
| VFX-03 | 오답 시 화면 흔들림(shake) + 빨간 플래시 이펙트가 재생된다 | CSS-only: @keyframes shake + flash overlay (Three.js 불필요 — CONTEXT.md 결정) |
| VFX-04 | 레벨업 시 풀스크린 시네마틱 애니메이션이 재생된다 | 기존 LevelUpOverlay에 Three.js 파티클 배경 추가 (ring expand + sparkle) |
| VFX-05 | 콤보 달성 시 화면에 불꽃/번개 이펙트가 점점 강해진다 | 정답 파티클 시스템 확장 — comboStep에 따라 파티클 수/크기/색상 스케일링 |
| VFX-06 | 스트릭 유지 시 홈 화면에 스트릭 불꽃 애니메이션이 표시된다 | drei Sparkles 컴포넌트 활용 또는 CSS 불꽃 애니메이션 + streak days 기반 인텐시티 |
| VFX-07 | 퀴즈 완료 시 컨페티(축하 종이 조각) 애니메이션이 재생된다 | canvas-confetti 라이브러리 (별도 canvas, Three.js와 독립) |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| three | 0.183.x | 3D 렌더링 엔진 | WebGL/WebGPU 3D 그래픽스 표준 |
| @react-three/fiber | 9.x | React Three.js 렌더러 | R3F v9 = React 19 전용, 선언적 3D 씬 관리, STATE.md에서 v9.5.0 확정 |
| @react-three/drei | 10.x | R3F 헬퍼 컴포넌트 모음 | Stars, Sparkles, PerformanceMonitor, shaderMaterial 등 즉시 사용 가능 |
| canvas-confetti | 1.9.x | 컨페티 애니메이션 | 경량(8KB), worker 지원, STATE.md에서 v1.9.4 확정, Vite manualChunks 'game-confetti' |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| detect-gpu | (drei 내장) | GPU 티어 감지 | 저사양 기기 감지, useDetectGPU hook |
| r3f-perf | latest | FPS/GPU 모니터링 (dev only) | 개발 중 성능 프로파일링용 devDep |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| R3F InstancedMesh particles | drei Sparkles | Sparkles는 빌트인이지만 커스텀 파티클 폭발에는 유연성 부족 → InstancedMesh 직접 사용 |
| vanilla Three.js | R3F | REQUIREMENTS.md Out of Scope에 R3F 제외 있었으나, CONTEXT.md/STATE.md에서 R3F v9 사용으로 최종 결정됨 |
| three-nebula particle engine | InstancedMesh | 별도 라이브러리 오버헤드, R3F 통합 불편 → 직접 구현이 번들 효율적 |

**Installation:**
```bash
pnpm add three @react-three/fiber @react-three/drei canvas-confetti
pnpm add -D @types/three @types/canvas-confetti r3f-perf
```

## Architecture Patterns

### Recommended Project Structure
```
apps/web/src/
├── components/
│   └── game/
│       ├── FunModeGate.tsx       # [기존] Suspense 래퍼 — ThreeBackground lazy import 활성화
│       ├── ThreeBackground.tsx   # [신규] R3F Canvas + 배경 씬 라우팅 (화면별 테마 전환)
│       ├── backgrounds/          # [신규] 화면별 3D 배경 씬 컴포넌트
│       │   ├── SpaceBg.tsx       # 홈 — 우주/별 테마
│       │   ├── NeonGridBg.tsx    # 퀴즈 — 네온 격자/사이버펑크
│       │   ├── WaveBg.tsx        # 분석 — 파도/물결
│       │   └── MountainBg.tsx    # 프로필 — 산/자연
│       ├── effects/              # [신규] 이벤트 반응 VFX 컴포넌트
│       │   ├── ParticleBurst.tsx # 정답/콤보 파티클 폭발 (InstancedMesh)
│       │   ├── LevelUpVfx.tsx    # 레벨업 ring expand + sparkle (LevelUpOverlay 배경)
│       │   ├── StreakFlame.tsx    # 스트릭 불꽃 (CSS 또는 Sparkles)
│       │   └── ConfettiEffect.tsx # 퀴즈 완료 컨페티 (canvas-confetti 래퍼)
│       └── vfx/                  # [신규] VFX 유틸리티
│           ├── useVfxEvents.ts   # EventBus 구독 → VFX 트리거 훅
│           ├── useGpuTier.ts     # useDetectGPU 래퍼 + 품질 레벨 결정
│           ├── WrongAnswerFx.tsx  # 오답 CSS shake + flash (Three.js 불필요)
│           └── performance.ts    # FPS 모니터링 + 자동 품질 조절 로직
├── game/
│   └── EventBus.ts              # [기존] SimpleEventEmitter 싱글턴
```

### Pattern 1: R3F Canvas 배경 오버레이
**What:** R3F Canvas를 앱 루트에 fixed position + z-index 최하단으로 배치, React DOM이 그 위에 렌더링
**When to use:** 3D 배경이 일반 UI 뒤에서 ambient 애니메이션을 재생할 때
**Example:**
```tsx
// ThreeBackground.tsx
import { Canvas } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'

export default function ThreeBackground({ scene }: { scene: string }) {
  const [dpr, setDpr] = useState(1)

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <Canvas
        dpr={dpr}
        gl={{ antialias: false, alpha: true, powerPreference: 'low-power' }}
        camera={{ position: [0, 0, 5], fov: 60 }}
        frameloop="always"
      >
        <PerformanceMonitor
          onDecline={() => setDpr(0.5)}
          onIncline={() => setDpr(Math.min(window.devicePixelRatio, 1.5))}
          flipflops={3}
          onFallback={() => setDpr(0.5)}
        />
        <SceneRouter scene={scene} />
      </Canvas>
    </div>
  )
}
```

### Pattern 2: EventBus → useFrame VFX 트리거
**What:** React 외부에서 EventBus 이벤트를 구독하고, useFrame 내부에서 Three.js 오브젝트를 직접 조작
**When to use:** 정답/콤보/레벨업 등 학습 이벤트에 즉각 반응하는 VFX
**Example:**
```tsx
// useVfxEvents.ts — EventBus 이벤트를 Three.js ref 상태로 변환
import { useEffect, useRef } from 'react'
import { EventBus } from '@/game/EventBus'

export function useVfxEvents() {
  const trigger = useRef<{ type: string; data: unknown } | null>(null)

  useEffect(() => {
    const onCorrect = (data: unknown) => { trigger.current = { type: 'correct', data } }
    const onCombo = (data: unknown) => { trigger.current = { type: 'combo', data } }
    const onLevelUp = (data: unknown) => { trigger.current = { type: 'levelup', data } }

    EventBus.on('vfx:correct', onCorrect)
    EventBus.on('vfx:combo', onCombo)
    EventBus.on('vfx:levelup', onLevelUp)

    return () => {
      EventBus.off('vfx:correct', onCorrect)
      EventBus.off('vfx:combo', onCombo)
      EventBus.off('vfx:levelup', onLevelUp)
    }
  }, [])

  return trigger
}
```

### Pattern 3: InstancedMesh 파티클 시스템
**What:** InstancedMesh로 수백 개의 파티클을 단일 draw call로 렌더링, useFrame에서 각 인스턴스 매트릭스 업데이트
**When to use:** 정답 파티클 폭발, 콤보 이펙트
**Example:**
```tsx
// ParticleBurst.tsx (핵심 로직)
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const PARTICLE_COUNT = 100
const tempObj = new THREE.Object3D()

function ParticleBurst({ active, comboStep = 1 }) {
  const meshRef = useRef<THREE.InstancedMesh>(null!)
  const particles = useMemo(() =>
    Array.from({ length: PARTICLE_COUNT }, () => ({
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 4,
        Math.random() * 3 + 1,
        (Math.random() - 0.5) * 4
      ),
      life: 0,
    })),
    []
  )

  useFrame((_, delta) => {
    if (!active) return
    particles.forEach((p, i) => {
      p.life += delta
      if (p.life > 1) return // 1초 후 소멸
      tempObj.position.set(
        p.velocity.x * p.life,
        p.velocity.y * p.life - 4.9 * p.life * p.life, // 중력
        p.velocity.z * p.life
      )
      tempObj.scale.setScalar(Math.max(0, 1 - p.life) * 0.1 * comboStep)
      tempObj.updateMatrix()
      meshRef.current.setMatrixAt(i, tempObj.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, PARTICLE_COUNT]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color="#fbbf24" transparent opacity={0.8} />
    </instancedMesh>
  )
}
```

### Pattern 4: canvas-confetti 독립 캔버스
**What:** canvas-confetti는 별도 HTML canvas 위에서 동작, R3F Canvas와 완전 독립
**When to use:** 퀴즈 완료 축하 컨페티
**Example:**
```tsx
// ConfettiEffect.tsx
import { useEffect, useRef } from 'react'
import confetti from 'canvas-confetti'

export function ConfettiEffect({ fire }: { fire: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const confettiRef = useRef<confetti.CreateTypes | null>(null)

  useEffect(() => {
    if (canvasRef.current) {
      confettiRef.current = confetti.create(canvasRef.current, {
        resize: true,
        useWorker: true,
      })
    }
    return () => { confettiRef.current?.reset() }
  }, [])

  useEffect(() => {
    if (fire && confettiRef.current) {
      confettiRef.current({
        particleCount: 150,
        spread: 180,
        origin: { y: 0.6 },
        colors: ['#fbbf24', '#34d399', '#60a5fa', '#f472b6'],
      })
    }
  }, [fire])

  return <canvas ref={canvasRef} className="fixed inset-0 z-50 pointer-events-none" />
}
```

### Anti-Patterns to Avoid
- **setState in useFrame:** React 리렌더링 유발 → ref로 직접 조작 필수
- **new THREE.Vector3() in useFrame:** 매 프레임 GC 부하 → 컴포넌트 외부에 재사용 객체 선언
- **clone() in useFrame:** copy() 사용 (clone은 새 객체 생성)
- **Three.js 정적 import:** 반드시 React.lazy() + Suspense (일반 모드 번들 영향 0)
- **여러 R3F Canvas 동시 마운트:** WebGL 컨텍스트 한도(8~16개) 초과 위험 → 하나의 Canvas에 모든 씬 통합

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| 별 필드 배경 | 수동 포인트 메시 + 셰이더 | drei `<Stars />` 컴포넌트 | 블링킹 셰이더 내장, 성능 최적화 완료, props로 쉽게 조절 |
| FPS 모니터링 | 수동 requestAnimationFrame 타이머 | drei `<PerformanceMonitor />` | incline/decline/fallback 콜백, factor 기반 점진적 품질 조절 |
| GPU 티어 감지 | 수동 WebGL 확장 체크 | drei `useDetectGPU()` | detect-gpu 라이브러리 기반, GPU 벤치마크 데이터베이스 내장 |
| 컨페티 파티클 | Three.js 종이 조각 시뮬레이션 | canvas-confetti | 회전/중력/바람 물리, worker 기반 비동기, 8KB 경량 |
| 셰이더 매터리얼 | raw GLSL + THREE.ShaderMaterial | drei `shaderMaterial()` | uniform 자동 바인딩, hot-reload 지원, JSX props 매핑 |
| 파티클 인스턴싱 | 수동 BufferGeometry + InstancedBufferAttribute | R3F `<instancedMesh>` | 선언적, React 라이프사이클 통합, ref로 업데이트 |

**Key insight:** drei 헬퍼는 Three.js 전문가들(pmndrs)이 최적화한 패턴의 집합체. 커스텀 구현보다 항상 먼저 drei에 해당 컴포넌트가 있는지 확인.

## Common Pitfalls

### Pitfall 1: WebGL 컨텍스트 한도 초과 (G3)
**What goes wrong:** R3F Canvas + Phaser Canvas 동시 마운트 시 브라우저 WebGL 컨텍스트 한도(8~16개) 초과
**Why it happens:** 각 Canvas가 별도 WebGL 컨텍스트 생성
**How to avoid:** Phase 18에서는 R3F Canvas 하나만 사용. Phaser는 Phase 19에서 별도 화면에서만 사용 (동시 마운트 금지). dispose() 패턴 필수.
**Warning signs:** "Too many active WebGL contexts" 콘솔 에러, 검은 화면

### Pitfall 2: useFrame 내 메모리 할당
**What goes wrong:** 매 프레임 new Vector3(), clone() 호출 → GC 스파이크 → 프레임 드롭
**Why it happens:** JavaScript GC가 수천 개의 임시 객체를 수집할 때 메인 스레드 블록
**How to avoid:** 재사용 가능한 객체를 컴포넌트/모듈 레벨에 선언, useMemo로 초기화
**Warning signs:** 주기적인 프레임 드롭 (GC 패턴), DevTools Performance 탭에서 GC 이벤트 빈번

### Pitfall 3: React setState로 60fps 애니메이션 구동
**What goes wrong:** useFrame에서 setState → React 리렌더링 → 60fps 불가능
**Why it happens:** React 스케줄러가 상태 업데이트를 배치 처리하므로 즉시 반영 안 됨
**How to avoid:** useRef로 Three.js 오브젝트 직접 조작. Zustand getState() 패턴.
**Warning signs:** 애니메이션이 끊기거나 지연됨

### Pitfall 4: 모바일 성능 미고려
**What goes wrong:** 데스크톱 기준 파티클 수/해상도 → 모바일에서 10fps 이하
**Why it happens:** 모바일 GPU는 데스크톱의 1/10 성능
**How to avoid:**
  - `dpr` 제한: 모바일 최대 1, 데스크톱 최대 1.5
  - 파티클 수 50% 감소 (isMobile 분기)
  - PerformanceMonitor flipflops=3 → onFallback으로 최저 품질 고정
  - `powerPreference: 'low-power'` GL 옵션
**Warning signs:** FPS < 30 지속, 기기 발열, 배터리 급감

### Pitfall 5: R3F Canvas 리사이즈 불안정
**What goes wrong:** 화면 전환 시 Canvas가 올바른 크기로 리사이즈되지 않음
**Why it happens:** CSS 레이아웃 변경과 R3F 리사이즈 타이밍 불일치
**How to avoid:** `fixed inset-0` 레이아웃 사용 (항상 뷰포트 전체), resize debounce 기본값 활용
**Warning signs:** Canvas가 잘리거나 비율이 깨짐

### Pitfall 6: canvas-confetti + R3F Canvas z-index 충돌
**What goes wrong:** 컨페티가 3D 배경 뒤에 렌더링됨
**Why it happens:** 두 canvas의 z-index 스택 순서 미설정
**How to avoid:** R3F Canvas는 z-index: -10, confetti canvas는 z-index: 50 (React DOM 위)
**Warning signs:** 컨페티가 보이지 않음

## Code Examples

### WebGL 지원 체크 + 2D CSS Fallback
```tsx
// useGpuTier.ts
import { useDetectGPU } from '@react-three/drei'

export type VfxQuality = 'high' | 'medium' | 'low' | 'css-only'

export function useGpuTier(): VfxQuality {
  const gpu = useDetectGPU()

  if (!gpu || gpu.tier === 0 || !isWebGLSupported()) return 'css-only'
  if (gpu.isMobile || gpu.tier === 1) return 'low'
  if (gpu.tier === 2) return 'medium'
  return 'high'
}

function isWebGLSupported(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}
```

### 오답 CSS Shake + Flash (Three.js 불필요)
```tsx
// WrongAnswerFx.tsx — CSS-only, CONTEXT.md 결정에 따라 Three.js 미사용
export function WrongAnswerFx({ active }: { active: boolean }) {
  if (!active) return null
  return (
    <>
      {/* 빨간 플래시 0.2초 */}
      <div className="fixed inset-0 z-40 pointer-events-none animate-wrong-flash" />
      {/* 화면 흔들림은 부모 컨테이너에 className 적용 */}
    </>
  )
}

// CSS (Tailwind @keyframes)
// @keyframes wrong-flash {
//   0%, 100% { background: transparent }
//   50% { background: rgba(239, 68, 68, 0.3) }
// }
// @keyframes wrong-shake {
//   0%, 100% { transform: translateX(0) }
//   20% { transform: translateX(-8px) }
//   40% { transform: translateX(8px) }
//   60% { transform: translateX(-4px) }
//   80% { transform: translateX(4px) }
// }
```

### drei Stars 컴포넌트로 홈 배경
```tsx
// SpaceBg.tsx — 우주/별 테마
import { Stars } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import type { Points as ThreePoints } from 'three'

export function SpaceBg() {
  const starsRef = useRef<ThreePoints>(null!)
  const { pointer } = useThree()

  useFrame((_, delta) => {
    // 느린 회전 (ambient)
    starsRef.current.rotation.y += delta * 0.02
    starsRef.current.rotation.x += delta * 0.01
    // 마우스 parallax
    starsRef.current.rotation.z = pointer.x * 0.05
  })

  return (
    <Stars
      ref={starsRef}
      radius={80}
      depth={60}
      count={3000}
      factor={4}
      saturation={0.2}
      fade
      speed={0.5}
    />
  )
}
```

### FunModeGate lazy import 활성화
```tsx
// FunModeGate.tsx — Phase 18에서 ThreeBackground 주석 해제
import { lazy, Suspense } from 'react'
import { GameLoadingSpinner } from '@/components/game/GameLoadingSpinner'

const ThreeBackground = lazy(() => import('@/components/game/ThreeBackground'))

export function FunModeGate({ children, scene }: { children: ReactNode; scene?: string }) {
  return (
    <Suspense fallback={<GameLoadingSpinner />}>
      {scene && <ThreeBackground scene={scene} />}
      {children}
    </Suspense>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| R3F v8 (React 18) | R3F v9 (React 19 전용) | 2025 Q3 | React 19 use() hook 활용, 성능 개선 |
| drei v9 | drei v10 (R3F v9 호환) | 2025 Q4 | 새로운 헬퍼, 타입 개선 |
| WebGL 1.0 only | WebGL2 기본 + WebGPU 실험적 | 진행 중 | WebGL2가 기본, WebGPU는 R3F gl prop으로 옵트인 |
| 수동 dpr 관리 | PerformanceMonitor + AdaptiveDpr | R3F v8+ | 자동 품질 조절 표준화 |

**Deprecated/outdated:**
- THREE.ColorManagement.legacyMode → R3F v9에서 자동 관리, 별도 설정 불필요
- react-three-fiber/addons → @react-three/drei로 통합

## Open Questions

1. **R3F v9 + Vite 7 HMR 안정성**
   - What we know: R3F v9는 React 19 전용이며 Vite 7 환경에서 동작해야 함
   - What's unclear: HMR 시 Canvas 상태 보존 여부 (개발 경험)
   - Recommendation: 개발 중 Canvas HMR 이슈 발생 시 frameloop='demand' 전환 또는 key prop 리셋

2. **R3F v9 peer dep react >=19 <19.3**
   - What we know: STATE.md에 이미 기록됨 — React 19.3 릴리즈 시 즉시 재검토 필요
   - What's unclear: React 19.3이 언제 릴리즈되는지
   - Recommendation: 현재 React 19.1은 범위 내이므로 문제 없음. 업그레이드 시 peer dep 확인

3. **Phaser + Three.js 동시 WebGL 컨텍스트**
   - What we know: Phase 19에서 Phaser 씬 사용 예정, G3 pitfall로 기록됨
   - What's unclear: 동일 페이지에서 두 Canvas가 동시에 필요한 케이스가 있는지
   - Recommendation: Phase 18에서는 R3F Canvas만 사용. Phase 19 계획 시 WebGL 컨텍스트 budget 재확인

## Sources

### Primary (HIGH confidence)
- Context7 `/pmndrs/react-three-fiber` — Canvas setup, useFrame, PerformanceMonitor, pitfalls, scaling performance
- Context7 `/pmndrs/drei` — Stars, Sparkles, PerformanceMonitor, useDetectGPU, shaderMaterial, Instances
- Context7 `/catdad/canvas-confetti` — API, create(), shapes, worker usage
- Context7 `/utsuboco/r3f-perf` — Perf component, PerfHeadless, usePerf hook

### Secondary (MEDIUM confidence)
- 프로젝트 STATE.md — 라이브러리 버전 확정 정보 (Three.js 0.183.1, R3F 9.5.0, drei 10.7.7, canvas-confetti 1.9.4)
- 프로젝트 vite.config.ts — manualChunks('game-three', 'game-confetti') 확인
- 프로젝트 FunModeGate.tsx — Phase 18 ThreeBackground lazy import 예정 코멘트 확인
- 프로젝트 EventBus.ts — SimpleEventEmitter 패턴 확인

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — Context7에서 R3F/drei/canvas-confetti API 전체 확인, 프로젝트 STATE.md에서 버전 확정
- Architecture: HIGH — 기존 인프라(FunModeGate, EventBus, manualChunks) 코드 직접 확인
- Pitfalls: HIGH — R3F 공식 문서 pitfalls 섹션 + STATE.md G1-G6 정리 기반

**Research date:** 2026-02-23
**Valid until:** 2026-04-23 (R3F/drei는 활발한 개발 중이므로 60일 내 재확인 권장)
