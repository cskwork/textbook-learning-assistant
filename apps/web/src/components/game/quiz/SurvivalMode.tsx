// SurvivalMode.tsx
// 서바이벌 모드 — 하트 3개로 끝까지 생존
// Phase 19 게임화 퀴즈 엔진

import { useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { GameQuizShell } from './GameQuizShell'
import { HeartDisplay } from './HeartDisplay'
import { useGameSession, type GameSessionResult } from '@/hooks/useGameSession'
import { useCombo } from '@/hooks/useCombo'
import { useSfx } from '@/hooks/useSfx'
import { awardXP, updateStreak } from '@/lib/gamification/gamification.service'
import { getBaseXP } from '@/lib/gamification/xp-formula'
import { EventBus } from '@/game/EventBus'
import type { Question } from '@/lib/db'

interface SurvivalModeProps {
  /** 문제 목록 (전체) */
  questions: Question[]
  /** 학생 ID */
  studentId: string
  /** 완료 콜백 */
  onComplete: (result: GameSessionResult) => void
  /** 뒤로 가기 콜백 */
  onBack: () => void
}

export default function SurvivalMode({ questions, studentId, onComplete, onBack }: SurvivalModeProps) {
  const {
    state,
    startGame,
    answerCorrect,
    answerWrong,
    nextQuestion,
    recoverHeart,
    currentQuestion,
    isGameOver,
    sessionResult,
  } = useGameSession('survival', questions)

  const { comboCount, onCorrect: comboOnCorrect, onWrong: comboOnWrong } = useCombo()
  const { playSfx } = useSfx()
  const answerProcessingRef = useRef(false)

  // 게임 시작
  useEffect(() => {
    if (state.phase === 'ready') {
      startGame()
    }
  }, [state.phase, startGame])

  // 문제 변경 시 답안 처리 잠금 해제
  useEffect(() => {
    answerProcessingRef.current = false
  }, [state.currentQuestionIndex])

  // 게임 종료 시 onComplete 호출
  useEffect(() => {
    if (isGameOver && sessionResult) {
      onComplete(sessionResult)
    }
  }, [isGameOver, sessionResult, onComplete])

  // 10문제 정답마다 하트 회복
  useEffect(() => {
    if (
      state.correctCount > 0 &&
      state.correctCount % 10 === 0 &&
      state.hearts < 3
    ) {
      recoverHeart()
      playSfx('levelUp')
    }
  }, [state.correctCount, state.hearts, recoverHeart, playSfx])

  // 답안 처리
  const handleAnswer = useCallback(
    async (answer: string) => {
      if (!currentQuestion || answerProcessingRef.current) return
      answerProcessingRef.current = true

      const isCorrect = answer === currentQuestion.answer

      if (isCorrect) {
        const comboMult = comboOnCorrect()
        const baseXP = getBaseXP(currentQuestion.difficulty)

        await awardXP(studentId, baseXP, 'quiz_correct', comboMult)
        await updateStreak(studentId)

        playSfx('correct')
        EventBus.emit('vfx:correct', { comboStep: comboMult >= 2 ? 3 : 2 })

        if (comboMult >= 1.5) {
          playSfx('combo', { comboStep: comboMult >= 3 ? 5 : comboMult >= 2 ? 3 : 2 })
          EventBus.emit('vfx:combo', { comboStep: comboMult >= 3 ? 5 : 3 })
        }

        answerCorrect(100, baseXP)
      } else {
        comboOnWrong()
        playSfx('wrong')
        EventBus.emit('vfx:wrong')
        answerWrong()
      }

      // 0.5초 딜레이 후 다음 문제 (게임오버가 아닌 경우)
      setTimeout(() => {
        if (state.hearts > (isCorrect ? 0 : 1)) {
          nextQuestion()
        }
      }, 500)
    },
    [currentQuestion, studentId, playSfx, comboOnCorrect, comboOnWrong, answerCorrect, answerWrong, nextQuestion, state.hearts],
  )

  // 로딩 상태
  if (!currentQuestion || state.phase === 'ready') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white/60 text-lg">준비 중...</div>
      </div>
    )
  }

  return (
    <motion.div
      animate={state.wrongCount > 0 ? { x: [0, -10, 10, -5, 5, 0] } : {}}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      <GameQuizShell
        question={currentQuestion}
        onAnswer={handleAnswer}
        disabled={answerProcessingRef.current}
        questionLabel={`Q${state.currentQuestionIndex + 1}`}
        headerSlot={
          <div className="flex items-center justify-between w-full">
            {/* 좌측: 하트 */}
            <HeartDisplay hearts={state.hearts} maxHearts={3} />

            {/* 우측: 정답 수 + 콤보 */}
            <div className="flex items-center gap-3">
              {comboCount >= 2 && (
                <motion.span
                  key={comboCount}
                  initial={{ scale: 1.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-amber-400 font-bold text-sm"
                >
                  {comboCount}x 콤보!
                </motion.span>
              )}
              <span className="text-cyan-400 font-bold text-lg tabular-nums">
                {state.correctCount}문제
              </span>
            </div>
          </div>
        }
      />

      {/* 뒤로 가기 */}
      <button
        onClick={onBack}
        className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
      >
        나가기
      </button>
    </motion.div>
  )
}
