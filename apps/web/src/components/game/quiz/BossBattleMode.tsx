// BossBattleMode.tsx
// 보스배틀 모드 — RPG 턴제 전투 형식
// Phase 19 게임화 퀴즈 엔진

import { useEffect, useRef, useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import { GameQuizShell } from './GameQuizShell'
import { BossCharacter } from './BossCharacter'
import { HeartDisplay } from './HeartDisplay'
import { useGameSession, type GameSessionResult } from '@/hooks/useGameSession'
import { useCombo } from '@/hooks/useCombo'
import { useSfx } from '@/hooks/useSfx'
import { awardXP, updateStreak } from '@/lib/gamification/gamification.service'
import { getBaseXP } from '@/lib/gamification/xp-formula'
import { EventBus } from '@/game/EventBus'
import type { Question } from '@/lib/db'

type BossAnimState = 'idle' | 'attacked' | 'attacking'

interface BossBattleModeProps {
  /** 문제 목록 */
  questions: Question[]
  /** 학생 ID */
  studentId: string
  /** 완료 콜백 */
  onComplete: (result: GameSessionResult) => void
  /** 뒤로 가기 콜백 */
  onBack: () => void
}

export default function BossBattleMode({ questions, studentId, onComplete, onBack }: BossBattleModeProps) {
  // 10문제 슬라이스 (보스 HP 100 / 데미지 10 = 10문제)
  const slicedQuestions = questions.slice(0, 10)

  const {
    state,
    startGame,
    answerCorrect,
    answerWrong,
    nextQuestion,
    currentQuestion,
    isGameOver,
    sessionResult,
  } = useGameSession('bossBattle', slicedQuestions)

  const { onCorrect: comboOnCorrect, onWrong: comboOnWrong } = useCombo()
  const { playSfx } = useSfx()

  const [bossState, setBossState] = useState<BossAnimState>('idle')
  const [damageText, setDamageText] = useState<string>('')
  const answerProcessingRef = useRef(false)
  const [isAnswerLocked, setIsAnswerLocked] = useState(false)

  // 게임 시작
  useEffect(() => {
    if (state.phase === 'ready') {
      startGame()
    }
  }, [state.phase, startGame])

  // 문제 변경 시 잠금 해제
  useEffect(() => {
    answerProcessingRef.current = false
    setIsAnswerLocked(false)
  }, [state.currentQuestionIndex])

  // 게임 종료 시 onComplete 호출
  useEffect(() => {
    if (isGameOver && sessionResult) {
      // 보스 처치 여부 메타데이터 추가
      const isBossDefeated = state.bossHp <= 0
      const result: GameSessionResult = {
        ...sessionResult,
        metadata: {
          bossDefeated: isBossDefeated,
          bossHpRemaining: state.bossHp,
        },
      }

      // 보스 처치 시 보너스 XP (정답 XP 합계의 50%)
      if (isBossDefeated) {
        const bonusXP = Math.round(sessionResult.xpEarned * 0.5)
        awardXP(studentId, bonusXP, 'boss_defeat_bonus', 1).then(() => {
          result.xpEarned += bonusXP
          EventBus.emit('vfx:levelup', { newLevel: 0 }) // 축하 효과
          playSfx('levelUp')
          onComplete(result)
        })
      } else {
        onComplete(result)
      }
    }
  }, [isGameOver, sessionResult, state.bossHp, studentId, playSfx, onComplete])

  // 답안 처리
  const handleAnswer = useCallback(
    async (answer: string) => {
      if (!currentQuestion || answerProcessingRef.current) return
      answerProcessingRef.current = true
      setIsAnswerLocked(true)

      const isCorrect = answer === currentQuestion.answer

      if (isCorrect) {
        // 플레이어 공격 → 보스 피격
        const comboMult = comboOnCorrect()
        const baseXP = getBaseXP(currentQuestion.difficulty)

        await awardXP(studentId, baseXP, 'quiz_correct', comboMult)
        await updateStreak(studentId)

        playSfx('correct')
        EventBus.emit('vfx:correct', { comboStep: 2 })

        setBossState('attacked')
        setDamageText('-10')
        answerCorrect(100, baseXP)

        // 0.8초 후 보스 idle로 복귀 + 다음 문제
        setTimeout(() => {
          setBossState('idle')
          setDamageText('')
          nextQuestion()
        }, 800)
      } else {
        // 보스 반격 → 플레이어 피격
        comboOnWrong()
        playSfx('wrong')
        EventBus.emit('vfx:wrong')

        setBossState('attacking')
        answerWrong()

        // 0.8초 후 보스 idle로 복귀 + 다음 문제 (게임오버가 아닌 경우)
        setTimeout(() => {
          setBossState('idle')
          if (state.playerHp > 1) {
            nextQuestion()
          }
        }, 800)
      }
    },
    [currentQuestion, studentId, playSfx, comboOnCorrect, comboOnWrong, answerCorrect, answerWrong, nextQuestion, state.playerHp],
  )

  // 로딩 상태
  if (!currentQuestion || state.phase === 'ready') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white/60 text-lg">보스 등장 중...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* RPG 전투 레이아웃: 플레이어(좌) vs 보스(우) */}
      <div className="flex items-center justify-between px-2">
        {/* 플레이어 영역 */}
        <motion.div
          animate={bossState === 'attacking' ? { x: [0, -10, 10, -5, 5, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center gap-2"
        >
          {/* 플레이어 실루엣 */}
          <svg viewBox="0 0 60 60" className="w-12 h-12 text-cyan-400">
            <circle cx="30" cy="18" r="10" fill="currentColor" opacity="0.7" />
            <path d="M15,55 L30,30 L45,55" fill="currentColor" opacity="0.5" />
          </svg>
          <HeartDisplay hearts={state.playerHp} maxHearts={3} />
        </motion.div>

        {/* VS 표시 */}
        <div className="text-white/20 font-bold text-lg">VS</div>

        {/* 보스 영역 */}
        <BossCharacter
          hp={state.bossHp}
          maxHp={100}
          state={bossState}
          damageText={damageText}
        />
      </div>

      {/* 문제 영역 */}
      <GameQuizShell
        question={currentQuestion}
        onAnswer={handleAnswer}
        disabled={isAnswerLocked}
        questionLabel={`Q${state.currentQuestionIndex + 1}/${slicedQuestions.length}`}
      />

      {/* 뒤로 가기 */}
      <button
        onClick={onBack}
        className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
      >
        나가기
      </button>
    </div>
  )
}
