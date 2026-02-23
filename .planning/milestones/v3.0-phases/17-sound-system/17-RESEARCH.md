# Phase 17: 사운드 시스템 - Research

**Researched:** 2026-02-23
**Domain:** Web Audio / Howler.js / React 사운드 통합
**Confidence:** HIGH

## Summary

Phase 17은 반전 모드(FunMode)에서 BGM 재생과 이벤트별 SFX 재생을 구현한다. 핵심 라이브러리는 Howler.js 2.2.4(이미 vite.config.ts에 `game-howler` chunk로 등록됨)이며, React 컴포넌트 레벨에서는 `use-sound` 5.0.0 훅으로 SFX를 선언적으로 처리한다. BGM은 React 렌더 사이클 외부의 싱글턴 패턴으로 관리하여 페이지 이동 시에도 끊김 없이 유지한다.

iOS Safari의 Web Audio 자동재생 차단은 Howler.js의 내장 `autoUnlock` 메커니즘(첫 touchend 이벤트에서 AudioContext 활성화)을 활용하되, FunMode 진입 시 사용자 인터랙션에서 명시적으로 AudioContext.resume()을 호출하는 이중 안전장치를 적용한다. 사운드 에셋은 Web Audio API 기반 프로그래매틱 합성(OscillatorNode + GainNode)으로 생성하여 번들 크기를 최소화하고 라이센스 문제를 회피한다.

**Primary recommendation:** Howler.js 싱글턴(BGM) + use-sound 훅(SFX) 이원 구조. 볼륨 설정은 Dexie userSettings에 저장. iOS 잠금 해제는 Howler.autoUnlock + 명시적 resume 이중 방어.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- BGM 기본값 OFF — 사용자가 명시적으로 켜야 재생
- BGM 토글 버튼: 헤더 영역 또는 FunMode 컨트롤 바에 배치
- BGM은 로딩/전환 시 끊김 없이 루프 재생 (crossfade 전환)
- 페이지 이동 시에도 BGM 유지 (React 외부 싱글턴 패턴 — Phase 15 결정 준수)
- BGM 트랙: 1개 기본 학습 BGM (밝고 차분한 lo-fi/chiptune 스타일)
- 정답: 짧고 밝은 성공음 (ding/chime, ~0.3초)
- 오답: 부드러운 실패음 (soft buzz, ~0.3초) — 학습 맥락이므로 공포감 없이
- 콤보: 정답음 + 추가 상승 효과음 (콤보 단계별 피치 상승)
- 레벨업: 팡파르/축하 사운드 (~1.5초)
- 뱃지 획득: 짧은 달성 효과음 (~1초)
- 스트릭 보너스: 코인 획득 사운드 (~0.5초)
- UI 클릭/탭: 없음 — SFX는 학습 이벤트에만 집중
- BGM 볼륨 슬라이더 (0-100%, 기본 50%)
- SFX 볼륨 슬라이더 (0-100%, 기본 70%)
- 전체 음소거 토글 (BGM + SFX 한번에)
- 볼륨 설정은 Dexie userSettings 테이블에 저장
- 설정 화면 내 "사운드" 섹션에 배치
- iOS Safari 정책: 사용자 제스처 없이 오디오 재생 불가
- FunMode 진입 시 첫 번째 사용자 인터랙션에서 Howler.js AudioContext 활성화
- 별도 "사운드 활성화" 버튼 없이 자연스러운 잠금 해제
- Web Audio API 기반 프로그래매틱 합성 우선 (번들 크기 최소화, 라이센스 무관)
- 필요 시 freesound.org CC0 에셋 보조 사용
- 모든 SFX는 sprite 패턴으로 하나의 오디오 파일에 묶어 HTTP 요청 최소화
- BGM은 별도 파일 (lazy load, FunMode 진입 시에만 로드)

### Claude's Discretion
- 합성 사운드의 정확한 주파수/파형 설계
- SFX sprite 파일 구성 방식
- Howler.js pool size 및 동시 재생 수
- crossfade 지속 시간
- 오류 시 무음 fallback 처리 방식

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SND-01 | 반전 모드에서 화면별 BGM이 재생되며 사용자가 ON/OFF 토글할 수 있다 | Howler.js 싱글턴 BGM 매니저 + BGM 토글 React 컴포넌트. `html5: true`로 스트리밍 로드, `loop: true`, `volume` 동적 제어 |
| SND-02 | 정답/오답/콤보/레벨업 등 각 이벤트별 효과음이 재생된다 | use-sound 훅 + Howler.js sprite 패턴. QuizPlayer에서 gamification 이벤트 시 SFX 트리거 |
| SND-03 | BGM은 기본 OFF 상태이며 사용자가 직접 켜야 재생된다 (학습 환경 배려) | BGM 매니저 초기 상태 OFF, `autoplay: false`. userSettings에서 bgmEnabled 로드 |
| SND-04 | 사용자가 효과음 볼륨과 BGM 볼륨을 각각 조절할 수 있다 | Dexie userSettings 확장 (bgmVolume, sfxVolume). SoundSettingsPanel UI 컴포넌트 |
| SND-05 | iOS/모바일에서 첫 사용자 제스처 후 사운드가 정상 활성화된다 | Howler.autoUnlock(기본 true) + FunMode 토글 click 핸들러에서 AudioContext.resume() 명시 호출 |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| howler | 2.2.4 | Web Audio API 추상화, BGM/SFX 재생 엔진 | 가장 널리 사용되는 웹 오디오 라이브러리. Web Audio API → HTML5 Audio 자동 fallback. 자동 iOS 잠금 해제 내장. sprite 지원. 이미 vite.config.ts manualChunks에 등록됨 |
| use-sound | 5.0.0 | React 훅 기반 SFX 재생 | Howler.js 기반 React 훅. 선언적 API(`play`, `stop`, `pause`). sprite 지원. `soundEnabled` 전역 뮤트. TypeScript 지원 |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @types/howler | latest | Howler.js TypeScript 타입 | use-sound 설치 시 필요할 수 있음 (README에서 권장) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Howler.js | Tone.js | Tone.js는 음악 합성 전문 — 더 강력하지만 번들 크기 ~400KB+, 이 프로젝트에는 과도 |
| use-sound | 직접 Howler 래퍼 | use-sound이 이미 React 훅 패턴 제공. 커스텀 래퍼 불필요 |
| Web Audio API 직접 사용 | Howler.js | Howler.js가 크로스 브라우저 호환성, iOS 잠금 해제, 에러 핸들링 모두 처리 |

**Installation:**
```bash
pnpm add howler use-sound
pnpm add -D @types/howler
```

## Architecture Patterns

### Recommended Project Structure
```
apps/web/src/
├── lib/
│   └── sound/
│       ├── SoundManager.ts          # BGM 싱글턴 매니저 (React 외부)
│       ├── sfx-synthesizer.ts       # Web Audio API 기반 SFX 합성기
│       ├── sound-sprites.ts         # SFX sprite 정의 (offset, duration)
│       └── sound-settings.ts        # 볼륨/뮤트 설정 Dexie 연동
├── hooks/
│   ├── useSoundSettings.ts          # Dexie reactive 사운드 설정 훅
│   └── useSfx.ts                    # 이벤트별 SFX 재생 훅 (use-sound 래퍼)
├── components/
│   ├── sound/
│   │   ├── SoundSettingsPanel.tsx    # 설정 화면 사운드 섹션
│   │   └── BgmToggleButton.tsx      # 헤더 BGM 토글 버튼
│   └── layout/
│       └── AppShell.tsx             # (기존) BGM 토글 버튼 배치 위치
```

### Pattern 1: BGM 싱글턴 매니저 (React 외부)
**What:** Howler.js 인스턴스를 React 컴포넌트 라이프사이클 외부에서 관리하는 싱글턴 패턴
**When to use:** BGM처럼 페이지 이동/리렌더링에도 끊김 없이 유지해야 하는 오디오
**Rationale:** Phase 15 결정 — "Three.js + Howler.js는 React 외부 싱글턴. 60fps 리렌더링 방지."
**Example:**
```typescript
// Source: Howler.js Context7 docs + Phase 15 아키텍처 결정
import { Howl, Howler } from 'howler'

class SoundManager {
  private static instance: SoundManager
  private bgm: Howl | null = null
  private bgmEnabled = false
  private bgmVolume = 0.5

  static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager()
    }
    return SoundManager.instance
  }

  async loadBGM(src: string): Promise<void> {
    if (this.bgm) {
      this.bgm.unload()
    }
    this.bgm = new Howl({
      src: [src],
      html5: true,  // 스트리밍 로드 (큰 파일)
      loop: true,
      volume: this.bgmVolume,
      autoplay: false,
    })
  }

  toggleBGM(): boolean {
    this.bgmEnabled = !this.bgmEnabled
    if (this.bgmEnabled && this.bgm) {
      this.bgm.play()
    } else if (this.bgm) {
      this.bgm.pause()
    }
    return this.bgmEnabled
  }

  setBGMVolume(vol: number): void {
    this.bgmVolume = vol
    this.bgm?.volume(vol)
  }

  setGlobalMute(muted: boolean): void {
    Howler.mute(muted)
  }
}
```

### Pattern 2: use-sound 훅 기반 SFX (React 컴포넌트 레벨)
**What:** use-sound React 훅으로 이벤트별 SFX를 선언적으로 재생
**When to use:** 정답/오답/콤보/레벨업 등 UI 이벤트에 반응하는 짧은 효과음
**Example:**
```typescript
// Source: use-sound Context7 docs
import useSound from 'use-sound'
import sfxSprite from '@/assets/sounds/sfx-sprite.mp3'

const useSfx = (soundEnabled: boolean, sfxVolume: number) => {
  const [playCorrect] = useSound(sfxSprite, {
    sprite: { correct: [0, 300] },
    volume: sfxVolume,
    soundEnabled,
  })
  const [playWrong] = useSound(sfxSprite, {
    sprite: { wrong: [400, 300] },
    volume: sfxVolume,
    soundEnabled,
  })
  return { playCorrect, playWrong }
}
```

### Pattern 3: Web Audio API 프로그래매틱 합성
**What:** OscillatorNode + GainNode로 SFX를 코드로 생성하여 오디오 파일 없이 효과음 재생
**When to use:** 짧은 UI 효과음 (ding, buzz, chime) — 파일 다운로드 없이 즉시 재생 가능
**Rationale:** CONTEXT.md 결정 — "Web Audio API 기반 프로그래매틱 합성 우선 (번들 크기 최소화, 라이센스 무관)"
**Example:**
```typescript
// 정답 chime 합성 예시
function synthesizeCorrectChime(ctx: AudioContext, volume: number = 0.7): void {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.type = 'sine'
  osc.frequency.setValueAtTime(880, ctx.currentTime)       // A5
  osc.frequency.setValueAtTime(1108.73, ctx.currentTime + 0.1) // C#6
  gain.gain.setValueAtTime(volume, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)

  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.3)
}
```

### Pattern 4: iOS AudioContext 잠금 해제
**What:** iOS Safari에서 사용자 제스처 없이 오디오 재생 불가 — Howler.js autoUnlock + 명시적 resume
**When to use:** iOS 지원이 필수인 모든 웹 오디오 앱
**Example:**
```typescript
// Source: Howler.js Context7 docs — autoUnlock + playError handler
// Howler.autoUnlock은 기본 true — 첫 touchend에서 자동으로 AudioContext 활성화 시도

// 추가 안전장치: FunMode 토글 시 명시적 resume
function handleFunModeToggle(): void {
  const ctx = Howler.ctx // Howler 내부 AudioContext 접근
  if (ctx && ctx.state === 'suspended') {
    ctx.resume()
  }
}

// play error 핸들러: unlock 이벤트 대기 후 재시도
const sound = new Howl({
  src: ['sound.mp3'],
  onplayerror: function() {
    sound.once('unlock', function() {
      sound.play()
    })
  }
})
```

### Anti-Patterns to Avoid
- **React state에서 Howl 인스턴스 관리:** Howl 객체를 useState/useRef로 관리하면 리렌더링마다 메모리 누수 위험. BGM은 반드시 React 외부 싱글턴으로.
- **autoplay: true 사용:** 모바일 브라우저 정책 위반, 학습 환경 방해. BGM 기본값 OFF 필수.
- **SFX마다 개별 HTTP 요청:** 6개+ 효과음을 개별 파일로 로드하면 지연 발생. sprite 패턴으로 단일 파일 사용.
- **AudioContext를 직접 생성:** Howler.js가 내부적으로 관리하는 AudioContext와 충돌 가능. `Howler.ctx`로 접근.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Web Audio 크로스 브라우저 호환 | 직접 AudioContext 래퍼 | Howler.js | iOS/Chrome/Firefox/Safari 간 차이 처리, fallback 로직 등 수백 줄 |
| iOS 오디오 잠금 해제 | 커스텀 unlock 핸들러 | Howler.autoUnlock | touchend/click 이벤트 타이밍, AudioContext 상태 관리 등 엣지 케이스 다수 |
| React 사운드 훅 | 커스텀 useHowler 훅 | use-sound | sprite 지원, soundEnabled 전역 뮤트, TypeScript 타입, 정리(cleanup) 로직 내장 |
| 오디오 sprite 파싱 | 커스텀 sprite 로더 | Howler.js sprite 옵션 | offset/duration 기반 구간 재생 + 루프 지원 내장 |

**Key insight:** 웹 오디오는 브라우저별 차이가 극심하고 모바일 정책이 수시로 변경됨. Howler.js가 이 복잡성을 추상화하므로 직접 구현은 시간 낭비.

## Common Pitfalls

### Pitfall 1: iOS AudioContext 'suspended' 상태 미처리
**What goes wrong:** iOS Safari에서 사운드가 아예 재생되지 않음
**Why it happens:** iOS는 사용자 제스처(tap/click) 없이 AudioContext를 'running' 상태로 전환하지 않음
**How to avoid:**
1. `Howler.autoUnlock = true` (기본값) 유지
2. FunMode 토글 click 핸들러에서 `Howler.ctx?.resume()` 명시 호출
3. `onplayerror` 핸들러에서 `once('unlock', ...)` 대기 후 재시도 패턴 적용
**Warning signs:** 데스크톱에서는 정상이지만 iPhone에서 사운드 무반응

### Pitfall 2: BGM Howl 인스턴스 메모리 누수
**What goes wrong:** 페이지 이동 시 이전 BGM이 해제되지 않아 메모리 누적
**Why it happens:** React 컴포넌트에서 Howl을 생성하면 unmount cleanup에서 제대로 해제되지 않음
**How to avoid:** BGM은 React 외부 싱글턴에서 관리. `loadBGM()` 시 이전 인스턴스 `unload()` 호출.
**Warning signs:** 장시간 사용 시 메모리 사용량 지속 증가

### Pitfall 3: SFX sprite 오프셋 계산 오류
**What goes wrong:** 효과음이 잘리거나 다른 효과음과 겹쳐서 재생
**Why it happens:** sprite 정의에서 offset(ms 단위)과 duration(ms 단위) 계산 실수
**How to avoid:** Web Audio API로 합성된 SFX를 파일로 내보낼 때 각 구간 사이에 최소 100ms 무음 간격(gap) 삽입. sprite 정의와 실제 오디오 파일의 타임라인 일치 검증.
**Warning signs:** 특정 효과음에서 이상한 클릭/팝 노이즈

### Pitfall 4: 볼륨 설정과 Howler 글로벌 볼륨 충돌
**What goes wrong:** `Howler.volume()`이 BGM과 SFX 모두에 영향, 개별 제어 불가
**Why it happens:** `Howler.volume()`은 글로벌 마스터 볼륨. 개별 Howl 인스턴스 `volume()`과 곱연산.
**How to avoid:** 글로벌 볼륨은 건드리지 않고, 각 Howl 인스턴스의 `volume()` 메서드로 BGM/SFX 개별 제어. 전체 음소거는 `Howler.mute(true/false)`.
**Warning signs:** BGM 볼륨 조절 시 SFX 볼륨도 같이 변경됨

### Pitfall 5: use-sound과 합성 SFX 병용 시 충돌
**What goes wrong:** use-sound은 오디오 파일 URL을 필수로 요구하는데, 프로그래매틱 합성 SFX는 파일이 없음
**Why it happens:** use-sound은 내부적으로 Howl에 `src` 파라미터를 전달하므로 파일 기반
**How to avoid:** 두 가지 접근 중 하나 선택:
  - **Option A:** Web Audio API로 합성한 SFX를 빌드 타임에 WAV/MP3로 내보내고, 그 파일을 use-sound에 전달
  - **Option B:** SFX는 use-sound 없이 직접 Howler.js로 재생, 합성 SFX 전용 모듈 분리
  - **추천: Option A** — 빌드 스크립트로 합성 → 파일 생성 → sprite 묶기 → use-sound으로 재생. 이렇게 하면 모든 SFX가 동일한 sprite 패턴으로 통일됨.
  - **대안 (더 실용적): Web Audio API로 런타임 합성** — Howler 없이 AudioContext에서 직접 OscillatorNode로 재생. SFX는 워낙 짧아서(0.3~1.5초) 파일 없이 즉시 합성 가능. 이 경우 use-sound은 사용하지 않고 커스텀 `useSfx` 훅 구현.
**Warning signs:** 빈 파일을 src로 넣고 합성음만 재생하는 이상한 코드

## Code Examples

### SoundManager 싱글턴 (BGM 전용)
```typescript
// Source: Howler.js Context7 + Phase 15 아키텍처 결정
import { Howl, Howler } from 'howler'

type SoundManagerListener = (state: { bgmEnabled: boolean; bgmVolume: number; sfxVolume: number; isMuted: boolean }) => void

class SoundManager {
  private static instance: SoundManager | null = null
  private bgm: Howl | null = null
  private _bgmEnabled = false
  private _bgmVolume = 0.5
  private _sfxVolume = 0.7
  private _isMuted = false
  private listeners: SoundManagerListener[] = []

  static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager()
    }
    return SoundManager.instance
  }

  /** Dexie에서 로드한 설정 적용 */
  applySettings(settings: { bgmVolume?: number; sfxVolume?: number; isMuted?: boolean; bgmEnabled?: boolean }): void {
    if (settings.bgmVolume !== undefined) this._bgmVolume = settings.bgmVolume
    if (settings.sfxVolume !== undefined) this._sfxVolume = settings.sfxVolume
    if (settings.isMuted !== undefined) {
      this._isMuted = settings.isMuted
      Howler.mute(this._isMuted)
    }
    if (settings.bgmEnabled !== undefined) this._bgmEnabled = settings.bgmEnabled
    this.bgm?.volume(this._bgmVolume)
    this.notify()
  }

  /** BGM 로드 (lazy — FunMode 진입 시) */
  loadBGM(src: string): void {
    if (this.bgm) this.bgm.unload()
    this.bgm = new Howl({
      src: [src],
      html5: true,
      loop: true,
      volume: this._bgmVolume,
      autoplay: false,
    })
  }

  /** BGM 토글 */
  toggleBGM(): boolean {
    this._bgmEnabled = !this._bgmEnabled
    if (this._bgmEnabled && this.bgm) {
      // iOS 안전장치
      if (Howler.ctx && Howler.ctx.state === 'suspended') {
        Howler.ctx.resume()
      }
      this.bgm.play()
    } else {
      this.bgm?.pause()
    }
    this.notify()
    return this._bgmEnabled
  }

  /** 전체 음소거 */
  toggleMute(): boolean {
    this._isMuted = !this._isMuted
    Howler.mute(this._isMuted)
    this.notify()
    return this._isMuted
  }

  get bgmEnabled() { return this._bgmEnabled }
  get bgmVolume() { return this._bgmVolume }
  get sfxVolume() { return this._sfxVolume }
  get isMuted() { return this._isMuted }

  subscribe(listener: SoundManagerListener): () => void {
    this.listeners.push(listener)
    return () => { this.listeners = this.listeners.filter(l => l !== listener) }
  }

  private notify(): void {
    const state = {
      bgmEnabled: this._bgmEnabled,
      bgmVolume: this._bgmVolume,
      sfxVolume: this._sfxVolume,
      isMuted: this._isMuted,
    }
    this.listeners.forEach(l => l(state))
  }

  /** 정리 — 앱 종료 시 */
  dispose(): void {
    this.bgm?.unload()
    this.bgm = null
  }
}

export const soundManager = SoundManager.getInstance()
```

### SFX 합성기 (Web Audio API)
```typescript
// 프로그래매틱 SFX 합성 — 파일 없이 코드로 효과음 생성
type SfxType = 'correct' | 'wrong' | 'combo' | 'levelUp' | 'badge' | 'streak'

function playSfx(type: SfxType, volume: number, comboStep?: number): void {
  const ctx = Howler.ctx
  if (!ctx || ctx.state === 'suspended') return // iOS 미잠금 해제 시 무음 fallback

  const gain = ctx.createGain()
  gain.connect(ctx.destination)
  gain.gain.setValueAtTime(volume, ctx.currentTime)

  switch (type) {
    case 'correct': {
      // 밝은 ding — sine wave C6 → E6
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(1046.5, ctx.currentTime)    // C6
      osc.frequency.setValueAtTime(1318.5, ctx.currentTime + 0.1) // E6
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
      osc.connect(gain)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.3)
      break
    }
    case 'wrong': {
      // 부드러운 buzz — triangle wave + 하강
      const osc = ctx.createOscillator()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(300, ctx.currentTime)
      osc.frequency.linearRampToValueAtTime(150, ctx.currentTime + 0.3)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
      osc.connect(gain)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.3)
      break
    }
    case 'combo': {
      // 콤보 단계별 피치 상승
      const basePitch = 880 // A5
      const step = comboStep ?? 2
      const pitch = step <= 2 ? basePitch : step <= 4 ? basePitch * 1.2 : basePitch * 2
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(pitch, ctx.currentTime)
      osc.frequency.setValueAtTime(pitch * 1.5, ctx.currentTime + 0.15)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
      osc.connect(gain)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.4)
      break
    }
    // levelUp, badge, streak 유사 패턴...
  }
}
```

### Dexie userSettings 확장 (볼륨 설정)
```typescript
// 기존 UserSetting 인터페이스에 선택 필드 추가 (인덱스 변경 불필요)
// db.version() 변경 없음 — 인덱스 없는 optional 필드
interface UserSetting {
  // ... 기존 필드 ...
  bgmVolume?: number      // 0~1 (기본 0.5)
  sfxVolume?: number      // 0~1 (기본 0.7)
  isSoundMuted?: boolean  // 전체 음소거 (기본 false)
  bgmEnabled?: boolean    // BGM ON/OFF (기본 false)
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| HTML5 Audio 직접 사용 | Web Audio API + Howler.js 추상화 | 2020+ | 크로스 브라우저 호환, iOS 지원, 동시 재생 |
| 개별 오디오 파일 로드 | sprite 패턴으로 단일 파일 | Howler.js 2.0+ | HTTP 요청 최소화, 로딩 속도 향상 |
| AudioContext 수동 관리 | Howler.autoUnlock 내장 | Howler.js 2.1+ | iOS/Chrome 자동재생 정책 자동 처리 |
| MP3만 사용 | WebM + MP3 fallback | 2022+ | WebM이 더 작은 파일 크기, 대부분 브라우저 지원 |

**Deprecated/outdated:**
- Howler.js v1.x API: `pos()` → `seek()`, `unmute()` → `mute(false)` — v2에서 변경됨
- `Howler.usingWebAudio` 체크 후 분기: 불필요, Howler가 자동 fallback 처리

## Open Questions

1. **SFX 전달 방식: 합성 vs 파일 기반**
   - What we know: Web Audio API 합성은 파일 없이 즉시 재생 가능, 번들 크기 0
   - What's unclear: 합성음의 품질이 실제 게임 느낌에 충분한지 (lo-fi chiptune 스타일이면 오히려 적합할 수 있음)
   - Recommendation: **런타임 합성 우선 시도**. 품질 부족하면 CC0 에셋으로 교체 (Phase 내에서 전환 가능한 설계)
   - Decision: CONTEXT.md에서 "Web Audio API 기반 프로그래매틱 합성 우선" 확정 → 합성 방식으로 진행

2. **BGM 트랙 소싱**
   - What we know: BGM은 lo-fi/chiptune 스타일 1트랙, lazy load
   - What's unclear: 프로그래매틱 합성으로 BGM을 만들기는 현실적으로 어려움 (최소 20-30초 루프)
   - Recommendation: freesound.org CC0 또는 Pixabay Music에서 적절한 lo-fi/chiptune 트랙 1개 소싱. 파일 크기 ~200-500KB (MP3/WebM). Vite public 디렉토리에 배치하여 lazy load.

3. **use-sound vs 커스텀 SFX 훅**
   - What we know: use-sound은 파일 기반 sprite에 적합. 합성 SFX에는 사용 불가.
   - What's unclear: 합성 + 파일 혼합 시나리오의 코드 복잡도
   - Recommendation: **SFX를 런타임 합성으로 가면 use-sound 불필요**. 대신 커스텀 `useSfx` 훅에서 AudioContext 직접 사용. use-sound은 설치하되, 향후 파일 기반 SFX 전환 시 활용. 초기 구현은 합성 전용 `SfxEngine` 클래스 + `useSfx` 훅 조합.

## Sources

### Primary (HIGH confidence)
- `/goldfire/howler.js` (Context7) — API, sprite, volume, fade, iOS unlock, ES6 import, mute
- `/joshwcomeau/use-sound` (Context7) — React hook API, sprite, soundEnabled, ExposedData, Howler 위임
- Howler.js README (GitHub) — autoUnlock, onplayerror, html5 streaming mode

### Secondary (MEDIUM confidence)
- Web Audio API MDN — OscillatorNode, GainNode, AudioContext.resume()
- Vite manualChunks — 기존 vite.config.ts에서 `game-howler` chunk 확인

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Context7에서 Howler.js/use-sound API 전수 확인
- Architecture: HIGH - Phase 15 아키텍처 결정(React 외부 싱글턴) 계승 + Howler.js 공식 패턴
- Pitfalls: HIGH - iOS autoplay 정책, 메모리 누수, sprite 관리 모두 Context7 문서 기반
- SFX 합성: MEDIUM - Web Audio API 합성 패턴은 MDN 기반이나, 실제 "게임 느낌" 품질은 POC 검증 필요

**Research date:** 2026-02-23
**Valid until:** 2026-03-23 (안정적 — Howler.js는 성숙한 라이브러리)
