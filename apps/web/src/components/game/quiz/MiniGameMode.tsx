// MiniGameMode.tsx
// 미니게임 모드 React 래퍼 — MiniGameBridge 렌더링 + 완료 시 onComplete 전달
// Phase 19 게임화 퀴즈 엔진
// Note: GameResult는 퀴즈 페이지(index.tsx)에서 통합 렌더링

import { useRef, useCallback, useEffect } from 'react'
import { MiniGameBridge } from '@/components/game/minigame/MiniGameBridge'
import { awardXP } from '@/lib/gamification/gamification.service'
import type { GameSessionResult } from '@/hooks/useGameSession'
import { useSfx } from '@/hooks/useSfx'
import { EventBus } from '@/game/EventBus'
import { Howler } from 'howler'

interface MiniGameModeProps {
  /** 학생 ID */
  studentId: string
  /** 완료 콜백 */
  onComplete: (result: GameSessionResult) => void
  /** 뒤로 가기 콜백 */
  onBack: () => void
}

interface MiniGameResult {
  score: number
  xp: number
  success: boolean
}

export default function MiniGameMode({ studentId, onComplete, onBack }: MiniGameModeProps) {
  // 중복 호출 방지 가드
  const completedRef = useRef(false)
  const { playSfx } = useSfx()

  const ensureAudioReady = useCallback(() => {
    const ctx = Howler.ctx as AudioContext | undefined
    if (!ctx || ctx.state !== 'suspended') return
    void ctx.resume()
  }, [])

  // 미니게임 씬 이벤트 → SFX 재생 연결
  useEffect(() => {
    const onTap = () => {
      ensureAudioReady()
      playSfx('tap')
    }
    const onCorrect = () => {
      ensureAudioReady()
      playSfx('correct')
    }
    const onWrong = () => {
      ensureAudioReady()
      playSfx('wrong')
    }
    const onSuccess = () => {
      ensureAudioReady()
      playSfx('levelUp')
    }

    EventBus.on('minigame-item-tap', onTap)
    EventBus.on('minigame-correct', onCorrect)
    EventBus.on('minigame-wrong', onWrong)
    EventBus.on('minigame-success', onSuccess)

    return () => {
      EventBus.off('minigame-item-tap', onTap)
      EventBus.off('minigame-correct', onCorrect)
      EventBus.off('minigame-wrong', onWrong)
      EventBus.off('minigame-success', onSuccess)
    }
  }, [ensureAudioReady, playSfx])

  useEffect(() => {
    ensureAudioReady()
  }, [ensureAudioReady])

  const handleGameComplete = useCallback(async (result: MiniGameResult) => {
    if (completedRef.current) return
    completedRef.current = true

    // XP 지급
    if (result.xp > 0) {
      await awardXP(studentId, result.xp, 'minigame_complete', 1)
    }

    // GameSessionResult 형태로 변환하여 상위로 전달
    const sessionResult: GameSessionResult = {
      mode: 'miniGame',
      correctCount: result.success ? 1 : 0,
      totalQuestions: 1,
      score: result.score,
      xpEarned: result.xp,
      timeElapsed: 30, // 미니게임 고정 30초
      maxCombo: 0,
      metadata: { miniGameKey: 'formulaCombo', success: result.success },
    }

    onComplete(sessionResult)
  }, [studentId, onComplete])

  // 미니게임 플레이
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-bold text-white">수식 조합</h3>
        <p className="text-sm text-gray-400">떨어지는 숫자와 연산자를 조합하여 목표 값을 만드세요</p>
      </div>

      <div className="flex justify-center">
        <MiniGameBridge
          miniGameKey="formulaCombo"
          width={Math.min(400, window.innerWidth - 32)}
          height={500}
          onUserInteraction={ensureAudioReady}
          onComplete={handleGameComplete}
        />
      </div>

      <button
        onClick={onBack}
        className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
      >
        나가기
      </button>
    </div>
  )
}
