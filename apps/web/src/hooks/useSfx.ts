// useSfx.ts — SFX 재생 React 훅 (FunMode 전용)
// FunMode가 OFF이면 효과음 무시, ON일 때만 SfxEngine으로 재생
// Phase 17 사운드 시스템

import { useCallback } from 'react'
import { sfxEngine, type SfxType, type SfxPlayOptions } from '@/lib/sound/SfxEngine'
import { useFunMode } from '@/hooks/useFunMode'

export interface UseSfxReturn {
  /** SFX 재생 — FunMode OFF이면 무시 (fire-and-forget) */
  playSfx: (type: SfxType, options?: SfxPlayOptions) => void
}

/**
 * useSfx — FunMode 전용 SFX 재생 훅
 *
 * 사용법:
 *   const { playSfx } = useSfx()
 *   playSfx('correct')           // 정답 효과음
 *   playSfx('combo', { comboStep: 3 })  // 콤보 효과음
 */
export function useSfx(): UseSfxReturn {
  const { isFunMode } = useFunMode()

  const playSfx = useCallback(
    (type: SfxType, options?: SfxPlayOptions) => {
      if (!isFunMode) return
      sfxEngine.play(type, options)
    },
    [isFunMode],
  )

  return { playSfx }
}
