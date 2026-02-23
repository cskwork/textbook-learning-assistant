# Project Research Summary

**Project:** 수학 기출문제 학습 웹앱 — v3.0 "반전 모드" (게이미피케이션)
**Domain:** EdTech / Korean High School Math Exam Practice App — Gamification Layer
**Researched:** 2026-02-23
**Confidence:** MEDIUM-HIGH

## Executive Summary

v3.0 반전 모드는 기존 React 19 + Vite 7 + Tailwind v4 스택 위에 게이미피케이션 레이어를 선택적으로 오버레이하는 방식으로 구현한다. 핵심 전략은 **토글 기반 이중 모드 아키텍처**: 노말 모드는 기존 코드베이스를 전혀 건드리지 않고, 반전 모드 진입 시에만 Phaser 3 / Three.js / Howler.js 등 무거운 라이브러리를 React.lazy() + Vite manualChunks로 동적 로드한다. 이 전략으로 초기 번들에 게임 라이브러리가 포함되지 않아 노말 모드 성능을 완전히 보호하면서, 반전 모드에서 약 520KB gz 수준의 게임 경험을 제공할 수 있다. 기존 스택의 Zustand와 Dexie를 그대로 활용해 XP/레벨/뱃지/스트릭 상태를 관리하므로 외부 게이미피케이션 전용 라이브러리는 불필요하다.

아키텍처의 핵심은 **FunModeContext가 모든 게임 기능의 단일 게이트**라는 점이다. `data-fun-mode` DOM 속성 + CSS 변수로 테마를 즉시 전환하고, 각 페이지는 `isFunMode` 훅 하나로 UI를 분기한다. Phaser 게임 씬은 React DOM과 완전히 분리된 EventBus 패턴으로 통신하며, Three.js 배경은 `z-index: -1` fixed canvas로 React 클릭 이벤트를 방해하지 않는다. Howler.js는 React 외부 싱글턴으로 관리한다. 각 기술 레이어가 명확히 분리되어 있어 개별적으로 교체·폴백이 가능하다.

가장 큰 리스크는 기술적 함정군이다: React StrictMode의 Phaser 이중 초기화, WebGL 컨텍스트 한도 초과(브라우저당 8~16개 제한), iOS Web Audio 자동재생 차단, 저사양 Android 태블릿의 30fps 이하 렌더링. 이 함정들은 Phase 15(기반 인프라 POC) 단계에서 반드시 검증해야 하며, 각각의 폴백 전략(Canvas 렌더러 폴백, CSS 애니메이션 대체, AudioContext.resume() unlock trick, 기기 감지 기반 품질 레벨)이 연구로 확인되었다. 교육적 관점에서는 외재적 보상 과다로 인한 내재 동기 저해(K-12 31개 연구, n=5,000+ 메타분석)를 방지하기 위해 반전 모드는 기본값 OFF, 사운드는 기본값 OFF, 보상은 학습 성취 기반으로만 설계해야 한다.

## Key Findings

### Recommended Stack

기존 스택(React 19, Vite 7, Tailwind v4, shadcn/ui, Framer Motion, Swiper, KaTeX, Dexie, Zustand, Recharts)은 v2.0에서 검증 완료되어 변경 없이 유지한다. v3.0에 추가되는 신규 라이브러리는 모두 반전 모드 전용 레이어로, 노말 모드 번들에는 포함되지 않는다.

**Core technologies (신규 추가):**
- **Phaser 3.90.0**: 타임어택 퀴즈·보스전 게임 씬 — React 19 + Vite 7 공식 템플릿(phaserjs/template-react-ts) 검증, v3 최종 안정 릴리즈. (Phaser 4 RC는 비안정 단계로 제외)
- **Three.js 0.183.1 + @react-three/fiber 9.5.0 + @react-three/drei 10.7.7**: 3D 파티클 배경·레벨업 연출 — R3F v9는 React 19 전용(`react: ">=19 <19.3"`). drei Stars/Sparkles로 파티클 30줄 이내 구현.
- **Howler 2.2.4 + use-sound 5.0.0**: BGM + SFX — 프레임워크 독립, 오디오 스프라이트 지원. use-sound는 140k/주 다운로드로 생태계 검증.
- **canvas-confetti 1.9.4**: 정답·레벨업 confetti 효과 — zero-dependency 2.5kb gz, Three.js 없이 즉시 적용.
- **Zustand 기존 슬라이스 확장**: XP·레벨·뱃지·스트릭 전역 상태 — 이미 설치됨, 별도 게이미피케이션 라이브러리 불필요.

**번들 전략**: 반전 모드 전체(Phaser ~350kb gz + Three.js ~185kb gz + Howler ~9kb gz) = 약 520kb gz 추가. 초기 번들 영향 = 0. React.lazy() + Vite manualChunks('game-phaser', 'game-three', 'game-howler')로 완전 분리.

**피해야 할 라이브러리**: Phaser 4 RC(불안정), @react-three/fiber v8(React 18 전용), gsap(Framer Motion 중복), lottie-react(에셋 관리 부담), Matter.js(Phaser 내장 물리로 충분), socket.io(v3.0 scope 밖).

### Expected Features

게이미피케이션 앱으로서 사용자 기대치와 경쟁사 분석(Duolingo, Kahoot, 수학대왕, Khan Academy)을 종합하면, v3.0에 필요한 기능 우선순위는 명확하다.

**Must have (v3.0 출시 필수 — P1):**
- **반전 모드 토글 + FunModeContext** — 모든 게임 기능의 진입점. 없으면 아무것도 작동 안 함.
- **XP + 레벨 시스템** — 레벨, 뱃지, 리더보드, 챌린지 전부 XP에 의존. 가장 먼저 구현해야 함.
- **일일 스트릭** — Duolingo 데이터 기반, 이탈률 21% 감소. 가장 검증된 리텐션 메커니즘.
- **콤보 카운터** — 연속 정답 보너스 XP. 구현 복잡도 낮음.
- **정답/오답 파티클 피드백** — canvas-confetti로 빠른 구현 가능.
- **타임어택 모드** — 수능 실전 감각 + 게임성. React 타이머로 충분, Phaser 없이 구현 가능.
- **서바이벌 모드** — 하트 3개, 오답 시 소진. 적당한 복잡도.
- **Three.js 3D 배경** — 반전 모드의 시각적 WOW 포인트. 경쟁사(Duolingo, Kahoot, 수학대왕) 중 유일한 차별점.
- **사운드 시스템 (BGM + SFX)** — 청각 피드백 없는 게임 모드는 형용 모순.
- **레벨업 시네마틱** — Framer Motion으로 구현 가능, Three.js 불필요.

**Should have (Phase 3, 검증 후 — P2):**
- 보스 배틀 모드 (높은 구현 복잡도), 뱃지/업적 시스템 (30개 콘텐츠 설계), 반 내 리더보드 (강사 그룹 연동), 주간 챌린지, 오답노트 복수전 모드.

**Defer (v3.x+ — P3):**
- 전교 익명 랭킹, 캐릭터 아바타 커스터마이징, 시즌제 이벤트, 오프라인 게임 기능.

**의도적 제외 (Anti-Features):**
- 전교 공개 리더보드 (하위권 이탈 유발, 개인정보 문제), 뽑기/가챠 (미성년자 도박 메커니즘), 실시간 멀티플레이어 (인프라 복잡도 과도, POC 아키텍처와 불일치), 강제 BGM (학교/도서관 환경 불가), 반전 모드 기본값 ON (저사양 기기 성능 문제, 연구에서 35% 이탈 확인).

### Architecture Approach

기존 17,000 LOC React 앱에 게임 레이어를 통합하는 핵심 원칙은 **기존 코드 최소 수정**이다. AppShell에는 FunModeToggleButton 삽입만 추가하고, 각 페이지 내부에서 `useFunMode()` 훅으로 UI를 분기한다. Phaser 씬과 React DOM은 EventBus를 통해서만 통신하고, Three.js와 Howler.js는 React 외부 싱글턴으로 관리한다. 게임 상태는 절대 React useState에 저장하지 않는다(60fps 애니메이션에서 리렌더링 유발 방지).

**Major components:**
1. **FunModeContext** — 반전 모드 on/off 전역 게이트. localStorage 유지. `data-fun-mode` DOM 속성으로 CSS 테마 즉시 전환.
2. **PhaserBridge** — Phaser Game 인스턴스 마운트·언마운트 관리. forwardRef + useLayoutEffect + EventBus 패턴.
3. **ThreeBackground** — Three.js WebGL canvas를 `position: fixed; z-index: -1`로 배경 고정. 반전 모드 OFF시 null 반환(Three.js 미로드).
4. **SoundManager (싱글턴)** — Howler.js BGM 루프 + SFX 스프라이트. React 외부 관리. 모드 전환 시 자동 BGM 시작/정지.
5. **gamification.service.ts** — XP 계산, 레벨 산정, 뱃지 언락. Dexie v8 신규 테이블(gamificationProfiles, xpEvents, badges).
6. **FunModeToggleButton** — AppShell 헤더 삽입 커스터마이즈 버튼. 기존 다크모드 토글 패턴 재활용.
7. **Dexie v8 스키마 확장** — 기존 v7 테이블 유지 + 게이미피케이션 전용 3개 테이블 추가.

**Build Order (의존성 기반)**: 모드 토글 인프라 → XP/레벨 서비스 → 사운드 → Three.js 배경 → Phaser 퀴즈 엔진 → 고급 게임 씬.

### Critical Pitfalls

기존 앱(v1/v2) 함정과 v3.0 게이미피케이션 신규 함정을 통합하면 최우선 주의 항목은 다음과 같다.

1. **React StrictMode + Phaser 이중 초기화 (G1 — CRITICAL)** — `useRef` 가드로 이중 초기화 방지. Phaser 공식 React TypeScript 템플릿의 PhaserGame.tsx 패턴 그대로 사용. Phase 15 POC에서 가장 먼저 검증.
2. **WebGL 컨텍스트 한도 초과 (G3 — CRITICAL)** — Phaser + Three.js를 동시에 별도 캔버스로 실행 시 브라우저 한도(8~16개)에 근접. Three.js 이펙트는 특별한 순간에만 Full-screen Canvas, 사용 후 즉시 dispose(). Recharts를 SVG 모드로 고정.
3. **iOS Web Audio 자동재생 차단 (G4 — CRITICAL)** — 반전 모드 진입 버튼 click 핸들러에서 `audioContext.resume()` 명시 호출. iPhone 실기기 테스트 필수.
4. **번들 사이즈 폭발 (G5 — CRITICAL)** — Phaser/Three.js 정적 import 절대 금지. 반드시 React.lazy() + manualChunks. Phase 15에서 번들 전략 결정 후 코드 작성.
5. **게이미피케이션 내재 동기 약화 (G6 — CRITICAL)** — XP/뱃지를 학습 성취 기반으로만 지급. 리더보드는 반 내 익명. 반전 모드 기본값 OFF, 사운드 기본값 OFF. 자기결정이론(SDT) 기반 설계 원칙을 구현 전 문서화.
6. **Phaser 씬 메모리 누수 (G2 — CRITICAL)** — 씬 shutdown 핸들러에서 텍스처/오디오 명시 제거. `game.destroy(true)` cleanup 호출. 10회 모드 전환 후 힙 스냅샷으로 검증.
7. **이중 UI 상태 복잡도 (G7 — HIGH)** — 각 컴포넌트 내 `if (gameMode)` 분기 패턴 금지. 페이지 라우터 레벨에서 완전한 컴포넌트 교체 + 공통 데이터 레이어 분리.

## Implications for Roadmap

연구에서 도출된 의존성 체인과 함정 방지 전략을 기반으로 아래 phase 구조를 제안한다.

### Phase 15: 반전 모드 기반 인프라 + 번들 전략
**Rationale:** 모든 게임 기능의 게이트이자 함정이 가장 집중된 단계. FunModeContext 없이는 어떤 반전 기능도 렌더링 불가. 번들 전략과 WebGL 컨텍스트 예산을 첫 코드 작성 전에 확정해야 나중에 전면 리팩토링을 막는다.
**Delivers:** FunModeContext, FunModeToggleButton, CSS 테마 변수(`data-fun-mode` 선택자), Dexie v8 스키마 확장, Vite manualChunks 설정, Phaser 통합 POC (이중 초기화 검증).
**Addresses:** 반전 모드 토글 (P1), 코드 스플리팅 아키텍처.
**Avoids:** G1(Phaser 이중 초기화), G3(WebGL 컨텍스트 한도), G5(번들 사이즈 폭발), G7(이중 UI 복잡도).

### Phase 16: XP/레벨/스트릭/콤보 — 게이미피케이션 상태 레이어
**Rationale:** XP 시스템이 레벨, 뱃지, 리더보드, 챌린지 전체의 기반. 이 단계 없이는 어떤 보상 기능도 독립적으로 구현할 수 없다. canvas-confetti는 추가 의존성 없이 즉시 적용 가능하여 시각적 보상 피드백을 조기에 제공한다.
**Delivers:** gamification.service.ts, useXP 훅, XPBar/LevelBadge UI, 일일 스트릭 로직, 콤보 카운터, canvas-confetti 정답 피드백, 반전 모드 홈 UI 변신.
**Uses:** Zustand 슬라이스 확장, Dexie v8 gamificationProfiles/xpEvents 테이블.
**Avoids:** G6(게이미피케이션 내재 동기 약화 — SDT 기반 보상 설계 원칙 적용).

### Phase 17: 사운드 시스템 (Howler.js)
**Rationale:** 청각 피드백은 게임 몰입감의 결정적 요소. Three.js보다 먼저 구현하는 이유는 사운드가 Three.js와 독립적이며, iOS 차단 함정(G4)을 별도 Phase에서 집중 해결하기 위함. 사운드만으로도 즉각적인 게임 느낌을 제공할 수 있다.
**Delivers:** SoundManager 싱글턴, BGM 3종(기본/타임어택/보스), 핵심 SFX 스프라이트(정답/오답/콤보/레벨업/모드전환), 볼륨 조절 + 기본값 OFF.
**Uses:** Howler 2.2.4, use-sound 5.0.0.
**Avoids:** G4(iOS 자동재생 차단 — 유저 제스처 unlock trick).

### Phase 18: Three.js 3D 배경 + 레벨업 시네마틱
**Rationale:** 반전 모드의 시각적 WOW 포인트. 경쟁사(Duolingo, Kahoot, 수학대왕) 중 3D 시각 효과를 가진 앱이 없다는 점에서 강력한 차별점. WebGL 컨텍스트 예산이 Phase 15에서 확정된 이후에만 구현 가능.
**Delivers:** ThreeBackground 컴포넌트(fixed canvas, z-index -1), 파티클 시스템(기기 감지 기반 품질 레벨), 레벨업 시네마틱(Framer Motion + drei Sparkles).
**Uses:** Three.js 0.183.1, @react-three/fiber 9.5.0, @react-three/drei 10.7.7.
**Avoids:** G3(WebGL 컨텍스트 한도 — Phaser와 별도 canvas, 사용 후 dispose), G8(저사양 기기 폴백 — 기기 감지 품질 레벨).

### Phase 19: 타임어택 모드 + 서바이벌 모드 (Phaser 퀴즈 엔진)
**Rationale:** XP·사운드·시각효과가 모두 준비된 후 게임 모드를 구현해야 완성된 게임 경험을 테스트할 수 있다. Phaser는 이 단계에서 처음 본격 사용되며, EventBus 패턴과 퀴즈 채점 로직의 통합이 핵심 난관이다.
**Delivers:** PhaserBridge 컴포넌트, QuizScene(타임어택), 서바이벌 하트 시스템, EventBus 기반 React ↔ Phaser 통신, 게임오버/승리 화면.
**Uses:** Phaser 3.90.0, EventBus(Phaser.Events.EventEmitter 싱글턴).
**Avoids:** G2(씬 메모리 누수 — shutdown 핸들러 등록), G11(KaTeX + Phaser 렌더링 충돌 — HTML 오버레이와 게임 오브젝트 분리).

### Phase 20: 고급 게임 씬 + 보상 시스템 확장
**Rationale:** Phase 19 완료 후 사용자 피드백과 성능 데이터를 기반으로 진행 여부를 결정한다. 보스 배틀은 구현 복잡도가 가장 높으므로 기반 인프라가 완전히 안정화된 후 추가.
**Delivers:** BossScene(보스 HP 바, Three.js 캐릭터), 뱃지/업적 시스템(30개), 반 내 리더보드, 주간 챌린지, 오답노트 복수전 모드.
**Avoids:** Anti-Feature 목록(전교 공개 랭킹, 가챠, 강제 BGM 적용 확인).

### Phase Ordering Rationale

- **인프라 → 상태 → 오디오 → 시각 → 게임 → 콘텐츠** 순서는 ARCHITECTURE.md의 Build Order와 FEATURES.md의 의존성 체인을 그대로 따른다.
- XP가 모든 보상의 기반이므로 Phase 16이 Phase 17~20보다 반드시 먼저 와야 한다.
- Three.js(Phase 18)가 Phaser(Phase 19)보다 먼저인 이유: WebGL 컨텍스트 예산 검증이 Phaser 풀 통합 전에 필요하다.
- 사운드(Phase 17)가 Three.js(Phase 18)보다 먼저인 이유: iOS 함정이 독립적이며, 사운드는 Three.js 없이도 즉시 게임 느낌을 제공한다.
- Phase 20은 검증 게이트를 거친 후 진행 — Phase 19 완료 시 사용자 피드백과 성능 데이터로 우선순위 재조정.

### Research Flags

**더 깊은 리서치가 필요한 단계:**
- **Phase 15 (기반 인프라):** Phaser + React StrictMode 통합 POC를 반드시 먼저 구현·검증. 패턴이 공식 템플릿에 있지만 기존 17K LOC와의 통합에 미지수가 남는다.
- **Phase 18 (Three.js):** WebGL 컨텍스트 예산이 실제 환경에서 어떻게 동작하는지 실측 필요. Safari OffscreenCanvas 4개 한도가 특히 우려 대상.
- **Phase 19 (Phaser 퀴즈):** KaTeX HTML 오버레이 + Phaser Input 시스템 충돌(G11)이 실제로 발생하는지, 해결책이 예상대로 작동하는지 POC 검증 필요.

**표준 패턴으로 리서치 불필요한 단계:**
- **Phase 16 (XP/스트릭):** Zustand 슬라이스 + Dexie 테이블 추가는 기존 패턴 그대로. SettingsContext/StreakService 패턴 재활용.
- **Phase 17 (사운드):** Howler.js 공식 문서와 싱글턴 패턴이 명확하게 확립. iOS unlock trick도 MDN에 문서화됨.
- **Phase 20 (콘텐츠):** Phase 19 인프라 위에 콘텐츠(뱃지 설계, 챌린지 로직)를 추가하는 작업으로 신규 기술 의존성 없음.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | npm 실시간 버전 조회 + 공식 React TypeScript 템플릿 검증 완료. R3F v9 peer dep 직접 확인. |
| Features | MEDIUM | Duolingo/Kahoot 케이스 스터디는 다수 소스 교차. 교육학 메타분석(K-12 31개 연구)은 HIGH. 35% 이탈 수치는 단일 소스. |
| Architecture | HIGH | Phaser 공식 템플릿 패턴 직접 확인. Three.js fixed canvas 패턴은 커뮤니티 사례 MEDIUM. EventBus 패턴은 HIGH. |
| Pitfalls | MEDIUM-HIGH | GitHub 이슈 교차 검증 + MDN 공식 문서. iOS Audio 차단은 HIGH. WebGL 한도 실측은 MEDIUM(단일 소스). |

**Overall confidence:** MEDIUM-HIGH

### Gaps to Address

- **저사양 Android 태블릿 실측 데이터 부재:** Snapdragon 450급 기기에서 Phaser 30fps 유지 가능성을 사전 확인할 방법이 없음. Phase 19 초기에 실기기 테스트 계획 수립 필요.
- **Safari WebGL 컨텍스트 한도:** 4개(OffscreenCanvas)라는 실측 결과가 단일 소스(WebGL dev mailing list). Phase 15 POC에서 실제 확인 필요.
- **R3F v9 React 19.3+ 호환성:** peer dep이 `react: ">=19 <19.3"`으로 제한됨. React 19.3이 릴리즈되면 즉시 재검토 필요. 현재(2026-02-23) 기준으로는 문제 없음.
- **사운드 에셋 소싱:** Howler 스프라이트용 BGM 3종 + SFX 7종 파일이 필요. 무료 CC0 소스(freesound.org, pixabay) 또는 직접 제작 결정 미완료. Phase 17 전에 결정 필요.
- **보상 설계 원칙 문서화:** G6 함정 방지를 위한 SDT 기반 보상 설계 원칙을 Phase 15 설계 단계에서 팀 내 합의 문서로 확정해야 함. 연구는 완료되었으나 설계 결정은 별도 논의 필요.

## Sources

### Primary (HIGH confidence)
- [phaserjs/template-react-ts GitHub](https://github.com/phaserjs/template-react-ts) — React 19 + Phaser 3.90 공식 통합 패턴 (PhaserBridge, EventBus)
- [Phaser v3.90.0 "Tsugumi" 릴리즈](https://phaser.io/news/2025/05/phaser-v390-released) — v3 최종 안정 릴리즈 확인
- [@react-three/fiber npm](https://www.npmjs.com/package/@react-three/fiber) — v9 peer `react: ">=19 <19.3"` 직접 확인
- [MDN Web Audio API 자동재생 가이드](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay) — iOS 차단 메커니즘 공식 문서
- [howler.js 공식 문서](https://howlerjs.com/) — 오디오 스프라이트 + Web Audio API fallback
- [Vite manualChunks GitHub Discussion](https://github.com/vitejs/vite/discussions/17730) — 게임 번들 분리 전략
- [CSS 변수 기반 테마 토글 — CSS-Tricks](https://css-tricks.com/easy-dark-mode-and-multiple-color-themes-in-react/) — FunModeContext CSS 테마 패턴
- npm registry 실시간 조회 (2026-02-23) — 모든 신규 라이브러리 버전 및 peer deps 확인

### Secondary (MEDIUM confidence)
- [게이미피케이션 내재 동기 메타분석 (2025, K-12)](https://onlinelibrary.wiley.com/doi/10.1002/pits.70056) — 31개 연구, n=5,000+ (외재 동기 g=0.713, 내재 동기 g=0.638)
- [Phaser 메모리 누수 이슈 #5456](https://github.com/photonstorm/phaser/issues/5456) — 씬 cleanup 패턴 검증
- [Three.js WebGL 메모리 누수 이슈 #18759](https://github.com/mrdoob/three.js/issues/18759) — dispose() 패턴 확인
- [react-three-fiber WebGL 컨텍스트 Safari 이슈](https://github.com/pmndrs/react-three-fiber/discussions/2457) — Safari 컨텍스트 한도 실측
- [Duolingo 게이미피케이션 전략](https://www.orizon.co/blog/duolingos-gamification-secrets) — 스트릭 21% 이탈률 감소 데이터
- [게이미피케이션 실패 이유 2026](https://medium.com/design-bootcamp/why-gamification-fails-new-findings-for-2026-fff0d186722f) — 35% 사용자 이탈 데이터
- [게이미피케이션 유령 효과 — Frontiers in Education 2024](https://www.frontiersin.org/journals/education/articles/10.3389/feduc.2024.1474733/full) — 외재 보상 내재 동기 저해

### Tertiary (LOW confidence)
- Phaser 번들 크기 980kb min / Three.js 658kb min — WebSearch 단일 소스, `vite build --report`로 직접 확인 권장
- WebGL 컨텍스트 한도 4개 (Safari OffscreenCanvas) — 단일 커뮤니티 소스(WebGL dev mailing list), 실측 필요

---
*Research completed: 2026-02-23*
*Ready for roadmap: yes*
