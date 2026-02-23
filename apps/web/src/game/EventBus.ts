// Phaser-React 통신 싱글턴 (EventBus 패턴)
// 참고: phaserjs/template-react-ts 공식 패턴을 기반으로 한 경량 구현
// Phase 19에서 Phaser.Events.EventEmitter로 교체 예정

type Listener = (...args: unknown[]) => void

/**
 * 경량 EventEmitter — 외부 의존성 없음.
 * Phaser 씬과 React 컴포넌트 간의 단방향/양방향 이벤트 통신에 사용.
 *
 * 사용 예시:
 *   EventBus.emit('load-progress', 75)
 *   EventBus.on('load-progress', (value) => setProgress(value))
 *   EventBus.off('load-progress', handler)
 */
class SimpleEventEmitter {
  private listeners = new Map<string, Listener[]>()

  on(event: string, listener: Listener) {
    const list = this.listeners.get(event) ?? []
    this.listeners.set(event, [...list, listener])
    return this
  }

  off(event: string, listener: Listener) {
    const list = this.listeners.get(event) ?? []
    this.listeners.set(event, list.filter(l => l !== listener))
    return this
  }

  emit(event: string, ...args: unknown[]) {
    this.listeners.get(event)?.forEach(l => l(...args))
    return this
  }
}

export const EventBus = new SimpleEventEmitter()
