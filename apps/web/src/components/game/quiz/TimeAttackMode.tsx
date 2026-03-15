// TimeAttackMode.tsx
// 타임어택 모드 — 제한 시간 내 10문제 연속 풀기
// Phase 19 게임화 퀴즈 엔진

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { GameQuizShell } from './GameQuizShell'
import { CircularTimer } from './CircularTimer'
import { useGameSession, type GameSessionResult } from '@/hooks/useGameSession'
import { useCombo } from '@/hooks/useCombo'
import { useSfx } from '@/hooks/useSfx'
import { awardXP, updateStreak } from '@/lib/gamification/gamification.service'
import { getBaseXP } from '@/lib/gamification/xp-formula'
import { EventBus } from '@/game/EventBus'
import type { Question } from '@/lib/db'

interface TimeAttackModeProps {
  /** 문제 목록 (10문제 슬라이스됨) */
  questions: Question[]
  /** 학생 ID */
  studentId: string
  /** 완료 콜백 */
  onComplete: (result: GameSessionResult) => void
  /** 뒤로 가기 콜백 */
  onBack: () => void
}

export default function TimeAttackMode({ questions, studentId, onComplete, onBack }: TimeAttackModeProps) {
  // 10문제 슬라이스
  const slicedQuestions = questions.slice(0, 10)

  const {
    state,
    startGame,
    answerCorrect,
    answerWrong,
    nextQuestion,
    timeUp,
    currentQuestion,
    isGameOver,
    sessionResult,
  } = useGameSession('timeAttack', slicedQuestions)

  const { onCorrect: comboOnCorrect, onWrong: comboOnWrong } = useCombo()
  const { playSfx } = useSfx()

  // 타이머 상태
  const [timeRemaining, setTimeRemaining] = useState(state.timePerQuestion)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const answerProcessingRef = useRef(false)
  const [isAnswerLocked, setIsAnswerLocked] = useState(false)

  // 게임 시작
  useEffect(() => {
    if (state.phase === 'ready') {
      startGame()
    }
  }, [state.phase, startGame])

  // 문제 변경 시 타이머 리셋
  useEffect(() => {
    if (state.phase !== 'playing') return
    setTimeRemaining(state.timePerQuestion)
    answerProcessingRef.current = false
    setIsAnswerLocked(false)
  }, [state.currentQuestionIndex, state.phase, state.timePerQuestion])

  // 카운트다운 타이머
  useEffect(() => {
    if (state.phase !== 'playing') {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // 시간 소진
          if (!answerProcessingRef.current) {
            answerProcessingRef.current = true
            setIsAnswerLocked(true)
            playSfx('wrong')
            EventBus.emit('vfx:wrong')
            comboOnWrong()
            timeUp()
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [state.phase, state.currentQuestionIndex, playSfx, comboOnWrong, timeUp])

  // 게임 종료 시 onComplete 호출
  useEffect(() => {
    if (isGameOver && sessionResult) {
      onComplete(sessionResult)
    }
  }, [isGameOver, sessionResult, onComplete])

  // 답안 처리
  const handleAnswer = useCallback(
    async (answer: string) => {
      if (!currentQuestion || answerProcessingRef.current) return
      answerProcessingRef.current = true
      setIsAnswerLocked(true)

      const isCorrect = answer === currentQuestion.answer

      if (isCorrect) {
        const comboMult = comboOnCorrect()
        const baseXP = getBaseXP(currentQuestion.difficulty)
        // 시간 보너스: 남은 시간 비례 추가 XP
        const timeBonus = Math.round(baseXP * (timeRemaining / state.timePerQuestion) * 0.5)
        const totalXP = baseXP + timeBonus
        const score = 100 + Math.round(timeBonus / 2)

        await awardXP(studentId, totalXP, 'quiz_correct', comboMult)
        await updateStreak(studentId)

        playSfx('correct')
        EventBus.emit('vfx:correct', { comboStep: comboMult >= 2 ? 3 : 2 })

        answerCorrect(score, totalXP)
      } else {
        comboOnWrong()
        playSfx('wrong')
        EventBus.emit('vfx:wrong')
        answerWrong()
      }

      // 0.5초 딜레이 후 다음 문제
      setTimeout(() => {
        nextQuestion()
      }, 500)
    },
    [currentQuestion, timeRemaining, state.timePerQuestion, studentId, playSfx, comboOnCorrect, comboOnWrong, answerCorrect, answerWrong, nextQuestion],
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
    <div className="space-y-4">
      <GameQuizShell
        question={currentQuestion}
        onAnswer={handleAnswer}
        disabled={isAnswerLocked}
        questionLabel={`Q${state.currentQuestionIndex + 1}/${slicedQuestions.length}`}
        headerSlot={
          <div className="flex items-center justify-between w-full">
            {/* 좌측: 문제 번호 */}
            <div className="text-white/60 text-sm font-medium">
              타임어택
            </div>

            {/* 중앙: 타이머 */}
            <CircularTimer
              timeRemaining={timeRemaining}
              totalTime={state.timePerQuestion}
              size={64}
            />

            {/* 우측: 점수 */}
            <motion.div
              key={state.totalScore}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="text-cyan-400 font-bold text-lg tabular-nums"
            >
              {state.totalScore}점
            </motion.div>
          </div>
        }
      />

      {/* 뒤로 가기 */}
      <button
        onClick={onBack}
        className="text-sm text-foreground/50 hover:text-foreground/80 transition-colors"
      >
        나가기
      </button>
    </div>
  )
}
