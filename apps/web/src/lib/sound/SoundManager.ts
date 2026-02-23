// SoundManager — React 외부 BGM 싱글턴 매니저
// 페이지 이동 시에도 BGM이 끊기지 않도록 React 렌더 사이클 외부에서 관리
// Phase 17 사운드 시스템

import { Howl, Howler } from 'howler'

export interface SoundManagerSnapshot {
  bgmEnabled: boolean
  bgmVolume: number
  sfxVolume: number
  isMuted: boolean
}

type Listener = () => void

/**
 * BGM 싱글턴 매니저 — React 외부에서 Howl 인스턴스 관리
 *
 * - loadBGM(src): BGM 에셋 로드 (lazy load, FunMode 진입 시)
 * - toggleBGM(): BGM 재생/정지 토글
 * - setBGMVolume(vol): BGM 볼륨 조절 (0~1)
 * - setSFXVolume(vol): SFX 볼륨 저장 (SfxEngine에서 참조)
 * - toggleMute(): 전체 음소거 토글 (BGM + SFX)
 * - applySettings(settings): Dexie에서 로드한 설정 일괄 적용
 * - subscribe(listener): React useSyncExternalStore용 구독
 * - getSnapshot(): 현재 상태 스냅샷 반환
 */
export class SoundManager {
  private static instance: SoundManager | null = null

  private _bgmEnabled = false
  private _bgmVolume = 0.5
  private _sfxVolume = 0.7
  private _isMuted = false
  private bgm: Howl | null = null
  private listeners = new Set<Listener>()

  private constructor() {}

  static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager()
    }
    return SoundManager.instance
  }

  /** BGM 에셋 로드 — 이전 BGM unload 후 새 Howl 생성 */
  loadBGM(src: string): void {
    // 이전 BGM 정리
    if (this.bgm) {
      this.bgm.unload()
      this.bgm = null
    }

    const sound = new Howl({
      src: [src],
      html5: true,
      loop: true,
      volume: this._bgmVolume,
      autoplay: false,
    })

    // iOS 잠금 해제 실패 시 재시도
    sound.on('playerror', () => {
      sound.once('unlock', () => {
        if (this._bgmEnabled) {
          sound.play()
        }
      })
    })

    // 로드 에러 시 무시 — BGM 파일 없어도 앱은 정상 동작
    sound.on('loaderror', () => {
      console.warn('[SoundManager] BGM 로드 실패:', src)
    })

    this.bgm = sound
  }

  /** BGM 재생/정지 토글 — 반환값: 새로운 bgmEnabled 상태 */
  toggleBGM(): boolean {
    this._bgmEnabled = !this._bgmEnabled

    if (this._bgmEnabled) {
      // iOS AudioContext 활성화 안전장치
      if (Howler.ctx?.state === 'suspended') {
        Howler.ctx.resume()
      }
      this.bgm?.play()
    } else {
      this.bgm?.pause()
    }

    this.notify()
    return this._bgmEnabled
  }

  /** BGM 볼륨 설정 (0~1) */
  setBGMVolume(vol: number): void {
    this._bgmVolume = Math.max(0, Math.min(1, vol))
    this.bgm?.volume(this._bgmVolume)
    this.notify()
  }

  /** SFX 볼륨 저장 — SfxEngine에서 soundManager.sfxVolume으로 접근 */
  setSFXVolume(vol: number): void {
    this._sfxVolume = Math.max(0, Math.min(1, vol))
    this.notify()
  }

  /** 전체 음소거 토글 (BGM + SFX) — 반환값: 새로운 isMuted 상태 */
  toggleMute(): boolean {
    this._isMuted = !this._isMuted
    Howler.mute(this._isMuted)
    this.notify()
    return this._isMuted
  }

  /** Dexie에서 로드한 설정 일괄 적용 */
  applySettings(settings: {
    bgmVolume: number
    sfxVolume: number
    isSoundMuted: boolean
    bgmEnabled: boolean
  }): void {
    this._bgmVolume = settings.bgmVolume
    this._sfxVolume = settings.sfxVolume
    this._isMuted = settings.isSoundMuted
    this._bgmEnabled = settings.bgmEnabled

    // Howler 상태 동기화
    this.bgm?.volume(this._bgmVolume)
    Howler.mute(this._isMuted)

    // BGM 재생 상태 동기화
    if (this.bgm) {
      if (this._bgmEnabled && !this.bgm.playing()) {
        this.bgm.play()
      } else if (!this._bgmEnabled && this.bgm.playing()) {
        this.bgm.pause()
      }
    }

    this.notify()
  }

  /** SFX 볼륨 getter — SfxEngine에서 참조 */
  get sfxVolume(): number {
    return this._isMuted ? 0 : this._sfxVolume
  }

  /** BGM 활성화 상태 getter */
  get bgmEnabled(): boolean {
    return this._bgmEnabled
  }

  /** 음소거 상태 getter */
  get isMuted(): boolean {
    return this._isMuted
  }

  /** React useSyncExternalStore용 구독 */
  subscribe(listener: Listener): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  /** 현재 상태 스냅샷 — useSyncExternalStore getSnapshot */
  getSnapshot(): SoundManagerSnapshot {
    return {
      bgmEnabled: this._bgmEnabled,
      bgmVolume: this._bgmVolume,
      sfxVolume: this._sfxVolume,
      isMuted: this._isMuted,
    }
  }

  /** 리소스 정리 */
  dispose(): void {
    this.bgm?.unload()
    this.bgm = null
    this.listeners.clear()
    SoundManager.instance = null
  }

  /** 구독자 알림 */
  private notify(): void {
    this.listeners.forEach((listener) => listener())
  }
}

export const soundManager = SoundManager.getInstance()
