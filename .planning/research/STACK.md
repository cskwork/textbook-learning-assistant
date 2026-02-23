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

## Sources (v3.0)

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

---
---

# v4.0 PDF 2-Way 학습 시스템 — 신규 추가 스택

**Domain:** PDF ↔ 앱 양방향 연동 (업로드/파싱/뷰어/내보내기)
**Researched:** 2026-02-24
**Confidence:** HIGH (PDF 뷰어/생성/AI SDK), MEDIUM (annotation 오버레이 호환성)

> **중요:** v3.0까지의 기존 스택은 위 섹션에 기록됨. 이 섹션은 v4.0 PDF 기능에 필요한 신규 라이브러리만 다룬다.

---

## Recommended Stack — v4.0 신규 추가

### PDF 뷰어 (앱 내 렌더링)

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| react-pdf | 10.4.0 | PDF 렌더링 (PDF.js 기반 React 컴포넌트) | 2026-02-21 릴리즈. PDF.js 5.3.31 탑재. React 16.8+ peer — React 19 만족. 메모리 최적화 및 렌더링 속도 개선 포함. ESM-only → Vite 7과 자연스럽게 호환. 주간 다운로드 100만+. 가장 널리 쓰이는 React PDF 뷰어 |
| react-pdf-highlighter-plus | 1.1.3 | PDF 위 annotation 오버레이 (텍스트 하이라이트 + 영역 선택 + 풀이 메모) | "Built with React 19" 명시. MIT 라이선스. PDF.js 기반으로 react-pdf와 동일 엔진 공유. 텍스트 하이라이트, 자유 메모, 드래그 이동 지원. 브라우저 100% 클라이언트 처리 (서버 불필요). iPad 시험지 오버레이 UX에 최적 |

**주의:** react-pdf-highlighter-plus는 react-pdf와 별도로 자체 PDF.js 인스턴스를 포함한다. 두 라이브러리를 같은 페이지에서 사용할 경우 PDF.js 버전 충돌 가능성 있음. PDF 뷰어 페이지에서는 react-pdf-highlighter-plus 단독 사용 권장 (react-pdf는 비-인터랙티브 미리보기 전용으로 분리).

### PDF 생성/내보내기

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| @react-pdf/renderer | 4.3.2 | 시험지/학습지 PDF 생성 및 다운로드 | React 19.2.x 공식 지원 (v4.1.0+부터, `@react-pdf/reconciler@2.0.0`). JSX로 PDF 레이아웃 선언 — 기존 React 패턴 유지. TTF 폰트 등록 지원 → Pretendard 한글 폰트 임베딩 가능. 브라우저에서 직접 PDF Blob 생성 (서버 불필요). 860k+/주 다운로드 |

**한글 폰트 처리:** `Font.register()` API로 Pretendard TTF 파일을 폰트 패밀리로 등록. Variable 폰트 미지원 — 굵기별 개별 TTF 파일 등록 필요 (Pretendard-Regular.ttf, Pretendard-Bold.ttf 등).

**수식 렌더링 주의:** `@react-pdf/renderer`는 KaTeX HTML 출력을 지원하지 않는다. PDF 내 수식은 두 가지 옵션:
1. 서버에서 수식을 SVG로 렌더링 후 이미지로 임베딩 (권장)
2. 수식을 텍스트로만 표현 (수학 앱에 부적합)

### AI 문제 파싱 (Gemini Vision)

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| @google/genai | 1.x (latest ~1.42.0) | Gemini Vision API 호출 — PDF → 문제 구조화 추출 | **구 `@google/generative-ai`를 대체하는 공식 통합 SDK.** 2025년 5월 GA 달성. `@google/generative-ai`는 2025-11-30 지원 종료 예정 → 반드시 신규 SDK 사용. `npm install @google/genai` |

**Gemini 모델 선택:** `gemini-2.5-flash` 권장
- PDF/문서 처리 multimodal 지원 (최대 1000페이지, 50MB, ~258 토큰/페이지)
- 한국어 + 수식 추출 성능 우수 (Gemini 2.5 시리즈 최적)
- Files API로 PDF 업로드 → 48시간 무료 캐싱 → 재처리 시 대역폭 절약
- 구조화 출력: `responseMimeType: 'application/json'` + `responseSchema`(Zod 스키마)로 문제 배열 직접 추출
- `gemini-2.0-flash`는 2026-03-31 지원 종료 예정 — 신규 개발에 사용 금지

### 파일 업로드 유틸리티

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-dropzone | 14.x (latest) | PDF 파일 드래그&드롭 업로드 UI | 이미 생태계 표준 (React 16.8+ 호환). `accept` prop으로 PDF만 허용. 파일 업로드 UI 구현 시 |

**주의:** react-dropzone은 UI 전용이며 서버 전송 기능이 없다. PDF → Gemini 전달은 브라우저에서 `File` 객체를 직접 `@google/genai` Files API로 전송.

---

## v4.0 통합 아키텍처 패턴

```
PDF 업로드 플로우:
  react-dropzone (드래그&드롭 UI)
    → File 객체
    → @google/genai Files API (PDF 업로드)
    → Gemini 2.5 Flash (vision 파싱)
    → JSON 구조화 응답 (문제 배열)
    → 사용자 검수/수정 UI
    → Dexie IndexedDB (로컬 저장)

PDF 뷰어 플로우:
  react-pdf-highlighter-plus
    → PDF 렌더링 + 오버레이 레이어
    → 풀이 annotation 저장 (Dexie)
    → iPad 시험지 느낌 UX

PDF 내보내기 플로우:
  @react-pdf/renderer
    → 시험지 레이아웃 JSX 컴포넌트
    → Pretendard TTF 임베딩
    → 수식 SVG 이미지 임베딩
    → PDF Blob → 브라우저 다운로드
```

---

## v4.0 Installation

```bash
# PDF 뷰어
pnpm add react-pdf

# PDF 뷰어 + annotation 오버레이 (택일 또는 용도 분리)
pnpm add react-pdf-highlighter-plus

# Vite 정적 에셋 복사 (react-pdf worker용)
pnpm add -D vite-plugin-static-copy

# PDF 생성
pnpm add @react-pdf/renderer

# Gemini AI SDK (신규 공식 통합 SDK)
pnpm add @google/genai

# 파일 업로드 UI
pnpm add react-dropzone
```

**react-pdf Vite 설정 (vite.config.ts):**

```ts
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default {
  plugins: [
    viteStaticCopy({
      targets: [
        { src: 'node_modules/pdfjs-dist/cmaps', dest: '' },
        { src: 'node_modules/pdfjs-dist/standard_fonts', dest: '' },
      ],
    }),
  ],
}
```

**react-pdf worker 설정 (앱 엔트리):**

```ts
import { pdfjs } from 'react-pdf'
// ESM worker (.mjs 확장자 — v10 변경사항)
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()
```

---

## v4.0 Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| PDF 뷰어 | react-pdf 10 | PDF.js 직접 사용 | React 컴포넌트 추상화 없이 수동 canvas 관리 필요. react-pdf가 이미 래핑 제공 |
| PDF 뷰어 | react-pdf 10 | @pdftron/webviewer | 엔터프라이즈 유료 라이선스. 오픈소스 불필요 |
| PDF 뷰어 | react-pdf 10 | pspdfkit | 유료 SaaS. 학생/무료 앱에 부적합 |
| annotation 오버레이 | react-pdf-highlighter-plus 1.1.3 | react-pdf-highlighter (원본) | 원본은 v8.0.0-rc.0에서 멈춤 (1년+ 업데이트 없음). -plus 포크가 React 19 지원 및 더 많은 기능 |
| annotation 오버레이 | react-pdf-highlighter-plus | react-pdf-highlighter-extended | -extended는 9개월 전 업데이트. -plus가 더 최신 (10일 전 업데이트) |
| PDF 생성 | @react-pdf/renderer | jsPDF | jsPDF는 HTML→PDF 변환 방식 — CSS 레이아웃 재현 불완전. 시험지 정밀 포맷에 부적합 |
| PDF 생성 | @react-pdf/renderer | pdfmake | JSON 선언 방식 — JSX보다 React 개발자 경험 나쁨. React 컴포넌트 재사용 불가 |
| PDF 생성 | @react-pdf/renderer | pdf-lib | 기존 PDF 수정용 — 새 문서 생성보다 편집에 특화. 2021년 이후 업데이트 없음 (유지보수 우려) |
| Gemini SDK | @google/genai | @google/generative-ai (구버전) | **2025-11-30 지원 종료 공식 발표.** 신규 기능 없음. 반드시 @google/genai로 마이그레이션 |
| Gemini 모델 | gemini-2.5-flash | gemini-2.0-flash | 2026-03-31 지원 종료 예정. 2.5 시리즈로 즉시 전환 권장 |

---

## v4.0 What NOT to Add

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| @google/generative-ai (구 SDK) | 2025-11-30 공식 지원 종료. 신규 Gemini 2.0+ 기능 없음 | @google/genai (신규 통합 SDK) |
| pdf-lib | 마지막 릴리즈 2021년 11월 (v1.17.1). 유지보수 중단 의심. 포크(@cantoo/pdf-lib) 필요 시에만 고려 | @react-pdf/renderer (생성), 수정 기능 불필요 |
| pdfjs-dist 직접 설치 | react-pdf 10이 pdfjs-dist를 peer dependency로 관리. 버전 충돌 원인 | react-pdf가 번들링하는 버전 사용 |
| Tesseract.js | 브라우저 OCR 엔진 — Gemini Vision이 수식+한국어+레이아웃 모두 처리 가능. Tesseract는 수식 인식 불가 | @google/genai + Gemini 2.5 Flash |
| mammoth.js | DOCX → HTML 변환 라이브러리. v4.0 scope는 PDF 전용 | 해당 없음 (DOCX 지원은 Out of Scope) |
| react-pdf-highlighter (원본 agentcooper) | RC 단계에서 1년+ 방치. React 19 미지원 | react-pdf-highlighter-plus |

---

## v4.0 Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| react-pdf 10.4.0 | React 16.8+ (React 19 포함) | peer `react: ">=16.8"`. ESM-only → Vite 7과 호환 양호. worker 파일 확장자 .mjs로 변경됨 (v10 breaking change) |
| react-pdf-highlighter-plus 1.1.3 | React 19 | "Built with React 19" 명시. MIT 라이선스 |
| @react-pdf/renderer 4.3.2 | React 19.2.x | `@react-pdf/reconciler@2.0.0`이 React 19.2.x 지원 추가 (PR #3224). Variable 폰트 미지원 |
| @google/genai 1.x | Node.js + 브라우저 | API Key 필요. PDF 처리는 Files API 경유. 브라우저 직접 호출 시 API Key 노출 주의 → 프록시 또는 서버 경유 권장 |
| react-dropzone 14.x | React 16.8+ | React 19 호환 |

**보안 주의:** `@google/genai`를 브라우저에서 직접 호출하면 Gemini API Key가 클라이언트에 노출됨. POC 단계에서는 환경변수로 관리하되, 프로덕션 전환 시 Express 5 백엔드 프록시 라우트 경유 필수.

---

## Sources (v4.0)

- [react-pdf GitHub Releases](https://github.com/wojtekmaj/react-pdf/releases) — v10.4.0 (2026-02-21 릴리즈), PDF.js 5.3.31, ESM-only 변경 확인 (HIGH)
- [react-pdf-highlighter-plus Demo](https://react-pdf-highlighter-plus-demo.vercel.app/) — v1.1.3, React 19 명시, 기능 목록 확인 (HIGH)
- [diegomura/react-pdf Releases](https://github.com/diegomura/react-pdf/releases) — v4.3.2 (2026-12월), React 19.2.x 지원 확인 (HIGH)
- [Google AI for Developers — Gemini Libraries](https://ai.google.dev/gemini-api/docs/libraries) — @google/genai GA (2025-05), @google/generative-ai 지원 종료 2025-11-30 확인 (HIGH)
- [Google AI for Developers — Document Processing](https://ai.google.dev/gemini-api/docs/document-processing) — PDF 처리 limits (1000페이지, 50MB, ~258 토큰/페이지), Files API 48시간 캐싱 확인 (HIGH)
- [Gemini Structured Output Docs](https://ai.google.dev/gemini-api/docs/structured-output) — JSON Schema + Zod 스키마 지원, responseMimeType 설정 확인 (HIGH)
- [@google/genai npm](https://www.npmjs.com/package/@google/genai) — v1.42.0 (4일 전 업데이트), Gemini 2.5 Flash 지원 확인 (HIGH)
- [npm-compare: @react-pdf/renderer vs jsPDF vs pdfmake](https://npm-compare.com/@react-pdf/renderer,jspdf,pdfmake,react-pdf) — 다운로드 수 및 GitHub 스타 비교 (MEDIUM)
- [react-pdf-highlighter-extended GitHub](https://github.com/DanielArnould/react-pdf-highlighter-extended) — 9개월 전 업데이트 vs -plus 10일 전 업데이트 비교 (MEDIUM)
- WebSearch 다수 (2026-02-24) — Gemini 2.5 Flash 한국어/수식 OCR 성능, pdf-lib 유지보수 상태 확인 (MEDIUM)

---

*Stack research for: v4.0 PDF 2-Way 학습 시스템 — 신규 추가 라이브러리 only*
*Researched: 2026-02-24*
