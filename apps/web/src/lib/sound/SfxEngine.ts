// SfxEngine — Web Audio API 기반 SFX 프로그래매틱 합성 엔진
// 오디오 파일 없이 OscillatorNode로 6종 효과음을 런타임에 합성
// Howler.ctx (AudioContext) 공유 — 직접 AudioContext 생성 금지
// Phase 17 사운드 시스템

import { Howler } from 'howler'
import { soundManager } from './SoundManager'

/** SFX 타입 — 학습 이벤트별 효과음 */
export type SfxType = 'correct' | 'wrong' | 'combo' | 'levelUp' | 'badge' | 'streak'

export interface SfxPlayOptions {
  /** 콤보 단계 (combo SFX 전용) — 2=기본, 3-4=중간, 5+=최고 */
  comboStep?: number
}

/**
 * SFX 합성 엔진 싱글턴 — Web Audio API OscillatorNode로 효과음 생성
 *
 * 지원 SFX 타입:
 * - correct: 밝은 상승 chime (C6→E6, 0.3초)
 * - wrong: 부드러운 하강 buzz (300→150Hz, 0.3초)
 * - combo: 콤보 단계별 피치 상승 효과음 (0.4초)
 * - levelUp: 3음 arpeggio 팡파르 (C5→E5→G5→C6, 1.5초)
 * - badge: 2음 chime (E5→A5, 1초)
 * - streak: 밝은 코인음 (square C6, 0.5초)
 */
export class SfxEngine {
  private static instance: SfxEngine | null = null
  private resumePromise: Promise<void> | null = null

  private constructor() {}

  static getInstance(): SfxEngine {
    if (!SfxEngine.instance) {
      SfxEngine.instance = new SfxEngine()
    }
    return SfxEngine.instance
  }

  /** SFX 재생 — suspended 상태면 resume 후 재생 */
  play(type: SfxType, options?: SfxPlayOptions): void {
    const ctx = Howler.ctx as AudioContext | undefined
    if (!ctx || ctx.state === 'closed') return

    // suspended 상태면 재개 시도 후 1회 재생
    if (ctx.state === 'suspended') {
      if (!this.resumePromise) {
        this.resumePromise = ctx.resume()
          .then(() => undefined)
          .catch(() => undefined)
          .finally(() => {
            this.resumePromise = null
          })
      }

      void this.resumePromise.then(() => {
        if (ctx.state === 'running') {
          this.play(type, options)
        }
      })
      return
    }

    const volume = soundManager.sfxVolume
    if (volume <= 0) return

    switch (type) {
      case 'correct':
        this.playCorrect(ctx, volume)
        break
      case 'wrong':
        this.playWrong(ctx, volume)
        break
      case 'combo':
        this.playCombo(ctx, volume, options?.comboStep ?? 2)
        break
      case 'levelUp':
        this.playLevelUp(ctx, volume)
        break
      case 'badge':
        this.playBadge(ctx, volume)
        break
      case 'streak':
        this.playStreak(ctx, volume)
        break
    }
  }

  /** 정답 — sine wave C6→E6 상승, 0.3초 */
  private playCorrect(ctx: AudioContext, volume: number): void {
    const now = ctx.currentTime
    const duration = 0.3

    // 첫 번째 음 C6
    this.createOscNode(ctx, 'sine', 1046.5, now, duration * 0.5, volume)
    // 두 번째 음 E6 (약간 겹침)
    this.createOscNode(ctx, 'sine', 1318.5, now + duration * 0.15, duration * 0.5, volume)
  }

  /** 오답 — triangle wave 300→150Hz 하강, 0.3초 */
  private playWrong(ctx: AudioContext, volume: number): void {
    const now = ctx.currentTime
    const duration = 0.3

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(300, now)
    osc.frequency.linearRampToValueAtTime(150, now + duration)

    gain.gain.setValueAtTime(volume * 0.4, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + duration)
  }

  /** 콤보 — 콤보 단계별 피치 상승 (정답음 + 추가 상승) */
  private playCombo(ctx: AudioContext, volume: number, comboStep: number): void {
    const now = ctx.currentTime

    // 콤보 단계별 피치 계산
    let freq: number
    if (comboStep >= 5) {
      freq = 880 * 2 // 옥타브 높게
    } else if (comboStep >= 3) {
      freq = 880 * 1.2 // 반음 높게
    } else {
      freq = 880 // 기본
    }

    // 상승 효과음
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, now)
    osc.frequency.linearRampToValueAtTime(freq * 1.5, now + 0.4)

    gain.gain.setValueAtTime(volume * 0.5, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.4)
  }

  /** 레벨업 — 3음 arpeggio C5→E5→G5→C6, 팡파르 느낌 */
  private playLevelUp(ctx: AudioContext, volume: number): void {
    const now = ctx.currentTime
    const notes = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6
    const noteInterval = 0.3
    const noteDuration = 0.4

    notes.forEach((freq, i) => {
      this.createOscNode(ctx, 'sine', freq, now + i * noteInterval, noteDuration, volume * 0.5)
    })
  }

  /** 뱃지 획득 — 2음 chime E5→A5 */
  private playBadge(ctx: AudioContext, volume: number): void {
    const now = ctx.currentTime

    // E5
    this.createOscNode(ctx, 'sine', 659.25, now, 0.5, volume * 0.5)
    // A5
    this.createOscNode(ctx, 'sine', 880, now + 0.5, 0.5, volume * 0.5)
  }

  /** 스트릭 보너스 — 밝은 코인음 (square wave C6) */
  private playStreak(ctx: AudioContext, volume: number): void {
    const now = ctx.currentTime

    this.createOscNode(ctx, 'square', 1046.5, now, 0.15, volume * 0.3)
    this.createOscNode(ctx, 'sine', 1318.5, now + 0.1, 0.2, volume * 0.3)
  }

  /** OscillatorNode 생성 헬퍼 — 중복 코드 방지 */
  private createOscNode(
    ctx: AudioContext,
    type: OscillatorType,
    freq: number,
    startTime: number,
    duration: number,
    volume: number,
  ): void {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = type
    osc.frequency.setValueAtTime(freq, startTime)

    gain.gain.setValueAtTime(volume, startTime)
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(startTime)
    osc.stop(startTime + duration + 0.01)
  }
}

export const sfxEngine = SfxEngine.getInstance()
