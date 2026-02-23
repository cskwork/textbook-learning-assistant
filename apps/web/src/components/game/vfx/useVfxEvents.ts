// Phase 18: EventBus VFX 이벤트 구독 → R3F useFrame용 ref 기반 트리거
// React 렌더 사이클 밖에서 Three.js 오브젝트 직접 조작에 사용
import { useRef, useEffect } from 'react'
import { EventBus } from '@/game/EventBus'

export type VfxType = 'correct' | 'wrong' | 'combo' | 'levelup' | 'quiz-complete' | 'streak'

export interface VfxTrigger {
  type: VfxType
  data?: unknown
  timestamp: number
}

/**
 * EventBus VFX 이벤트를 구독하고 ref 기반 트리거로 변환하는 훅.
 *
 * - useFrame 내부에서 trigger.current를 읽어 VFX 반응
 * - 소비 후 trigger.current = null로 리셋
 * - timestamp로 동일 이벤트 타입의 연속 발생 구분
 *
 * @example
 * const trigger = useVfxEvents()
 * useFrame(() => {
 *   if (trigger.current?.type === 'correct') {
 *     // 파티클 폭발 트리거
 *     trigger.current = null // 소비 완료
 *   }
 * })
 */
export function useVfxEvents() {
  const trigger = useRef<VfxTrigger | null>(null)

  useEffect(() => {
    const handlers: Array<[string, (...args: unknown[]) => void]> = []

    const vfxEvents: VfxType[] = ['correct', 'wrong', 'combo', 'levelup', 'quiz-complete', 'streak']

    for (const type of vfxEvents) {
      const handler = (...args: unknown[]) => {
        trigger.current = {
          type,
          data: args[0] ?? undefined,
          timestamp: performance.now(),
        }
      }
      handlers.push([`vfx:${type}`, handler])
      EventBus.on(`vfx:${type}`, handler)
    }

    return () => {
      for (const [event, handler] of handlers) {
        EventBus.off(event, handler)
      }
    }
  }, [])

  return trigger
}
