// apps/web/src/components/quiz/QuizPlayer.tsx
// 퀴즈 세션 핵심 컴포넌트 — 문제 표시, 답 입력, 타이머, 제출, 채점 결과
// useReducer 기반 playing → submitted 상태 머신
// Phase 16: 게이미피케이션 연동 (FunMode 활성화 시 XP 지급 + 콤보 + 피드백 UI)
import { useReducer, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { LatexPreview } from '@/components/questions/LatexPreview'
import { TimerDisplay } from '@/components/quiz/TimerDisplay'
import { MultipleChoiceInput } from '@/components/quiz/MultipleChoiceInput'
import { ShortAnswerInput } from '@/components/quiz/ShortAnswerInput'
import { QuizResult } from '@/components/quiz/QuizResult'
import { FadeIn } from '@/components/motion/FadeIn'
import { useTimer } from '@/hooks/useTimer'
import { submitQuizAttempt } from '@/services/quiz.service'
import { useCombo } from '@/hooks/useCombo'
import { useFunMode } from '@/hooks/useFunMode'
import { useSfx } from '@/hooks/useSfx'
import { awardXP, updateStreak } from '@/lib/gamification/gamification.service'
import { getBaseXP } from '@/lib/gamification/xp-formula'
import { XPFloatingText, ComboCounter } from '@/components/gamification'
import { EventBus } from '@/game/EventBus'
import type { Question } from '@/lib/db'

// ─── 상태 머신 타입 ────────────────────────────────────────────────────────────

type QuizPhase = 'playing' | 'submitted'

interface QuizState {
  phase: QuizPhase
  selectedAnswer: string
  isCorrect: boolean | null
  timeSpent: number
}

type QuizAction =
  | { type: 'SELECT_ANSWER'; answer: string }
  | { type: 'SUBMIT'; isCorrect: boolean; timeSpent: number }
  | { type: 'RETRY' }

function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'SELECT_ANSWER':
      return { ...state, selectedAnswer: action.answer }
    case 'SUBMIT':
      return {
        ...state,
        phase: 'submitted',
        isCorrect: action.isCorrect,
        timeSpent: action.timeSpent,
      }
    case 'RETRY':
      return {
        phase: 'playing',
        selectedAnswer: '',
        isCorrect: null,
        timeSpent: 0,
      }
    default:
      return state
  }
}

// ─── Props ──────────────────────────────────────────────────────────────────

/** 게이미피케이션 결과 타입 — 상위 QuizPage에서 LevelUpOverlay/BadgeUnlockOverlay 트리거용 */
export interface GamificationResult {
  xpAwarded: number
  leveledUp: boolean
  newLevel: number
  unlockedBadges: string[]
}

interface QuizPlayerProps {
  question: Question
  studentId: string
  onComplete?: (isCorrect: boolean) => void  // 채점 완료 콜백 (오답노트 UI에서 활용)
  onNext?: () => void   // 다음 문제 버튼 콜백
  onBack?: () => void   // 문제 목록으로 돌아가기 콜백
  questionIndex?: number    // 현재 문제 번호 (0-based, optional)
  totalQuestions?: number   // 전체 문제 수 (optional)
  /** FunMode 활성화 시 게이미피케이션 결과 콜백 (레벨업/뱃지 오버레이 트리거) */
  onGamificationResult?: (result: GamificationResult) => void
}

// ─── 컴포넌트 ────────────────────────────────────────────────────────────────

export function QuizPlayer({
  question,
  studentId,
  onComplete,
  onNext,
  onBack,
  questionIndex,
  totalQuestions,
  onGamificationResult,
}: QuizPlayerProps) {
  const [state, dispatch] = useReducer(quizReducer, {
    phase: 'playing',
    selectedAnswer: '',
    isCorrect: null,
    timeSpent: 0,
  })

  const timer = useTimer()
  const { isFunMode } = useFunMode()
  const { playSfx } = useSfx()
  const { comboCount, multiplier, onCorrect: comboOnCorrect, onWrong: comboOnWrong, resetCombo: _resetCombo } = useCombo()

  // XP 플로팅 텍스트 상태 — key로 매번 새 애니메이션 트리거
  const [xpFloat, setXpFloat] = useState<{ amount: number; key: number } | null>(null)

  // 마운트 시 타이머 시작, 언마운트 시 정지
  useEffect(() => {
    timer.start()
    return () => timer.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.id])

  async function handleSubmit() {
    // CRITICAL: stop() 호출 후에도 timer.seconds는 동기적으로 읽힘
    timer.stop()
    const timeSpent = timer.seconds

    const { isCorrect } = await submitQuizAttempt({
      question,
      studentId,
      userAnswer: state.selectedAnswer,
      timeSpent,
    })

    // ── FunMode 게이미피케이션 처리 ──────────────────────────────────────────
    if (isFunMode && studentId) {
      if (isCorrect) {
        const comboMult = comboOnCorrect()
        const baseXP = getBaseXP(question.difficulty)
        const result = await awardXP(studentId, baseXP, 'quiz_correct', comboMult)
        await updateStreak(studentId)
        setXpFloat({ amount: result.xpAwarded, key: Date.now() })

        // SFX: 정답음 (fire-and-forget)
        playSfx('correct')

        // VFX: 정답 파티클 이벤트
        const comboStep = comboMult >= 3 ? 5 : comboMult >= 2.5 ? 4 : comboMult >= 2 ? 3 : 2
        EventBus.emit('vfx:correct', { comboStep })

        // SFX: 콤보 2연속 이상 시 추가 콤보음 + VFX
        if (comboMult >= 1.5) {
          playSfx('combo', { comboStep })
          EventBus.emit('vfx:combo', { comboStep })
        }
        // SFX + VFX: 레벨업
        if (result.leveledUp) {
          playSfx('levelUp')
          EventBus.emit('vfx:levelup', { newLevel: result.newLevel })
        }
        // SFX: 뱃지 획득
        if (result.unlockedBadges.length > 0) {
          playSfx('badge')
        }

        onGamificationResult?.({
          xpAwarded: result.xpAwarded,
          leveledUp: result.leveledUp,
          newLevel: result.newLevel,
          unlockedBadges: result.unlockedBadges,
        })
      } else {
        comboOnWrong()
        // SFX: 오답음
        playSfx('wrong')
        // VFX: 오답 플래시 + shake
        EventBus.emit('vfx:wrong')
      }
    }

    dispatch({ type: 'SUBMIT', isCorrect, timeSpent })
    onComplete?.(isCorrect)
  }

  // ── submitted 단계: 채점 결과 표시 ────────────────────────────────────────
  if (state.phase === 'submitted') {
    return (
      <QuizResult
        question={question}
        userAnswer={state.selectedAnswer}
        isCorrect={state.isCorrect!}
        timeSpent={state.timeSpent}
        onRetry={() => {
          dispatch({ type: 'RETRY' })
          timer.reset()
          timer.start()
        }}
        onNext={onNext}
        onBack={onBack}
      />
    )
  }

  // ── playing 단계: 문제 + 답 입력 UI ──────────────────────────────────────
  const showIndicator = questionIndex !== undefined && totalQuestions !== undefined

  return (
    <FadeIn className="space-y-4">
      {/* FunMode 게이미피케이션 UI — 콤보 카운터 (화면 중앙 fixed) */}
      {isFunMode && <ComboCounter comboCount={comboCount} multiplier={multiplier} />}

      {/* FunMode 게이미피케이션 UI — XP 플로팅 텍스트 */}
      {isFunMode && (
        <div className="relative flex justify-center">
          <XPFloatingText
            key={xpFloat?.key}
            amount={xpFloat?.amount ?? 0}
            visible={xpFloat !== null}
            onComplete={() => setXpFloat(null)}
          />
        </div>
      )}

      {/* 문제 번호 인디케이터 + 타이머 */}
      <div className="flex items-center justify-between">
        {showIndicator ? (
          <div className="space-y-1 flex-1 mr-4">
            <p className="text-sm font-medium text-foreground">
              문제 {questionIndex + 1} / {totalQuestions}
            </p>
            {/* 진행 바 */}
            <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${((questionIndex + 1) / totalQuestions) * 100}%` }}
              />
            </div>
          </div>
        ) : (
          <div />
        )}

        {/* 타이머 — 우측 상단 */}
        <div className="bg-muted/50 rounded-full px-3 py-1">
          <TimerDisplay seconds={timer.seconds} formatted={timer.formatted} />
        </div>
      </div>

      {/* 문제 본문 */}
      <Card className="max-w-full">
        {/* 과목/유형 뱃지 */}
        <div className="flex items-center gap-2 px-6 pt-4">
          {question.subject && (
            <Badge variant="secondary" className="text-xs">
              {question.subject}
            </Badge>
          )}
          {question.questionCategory && (
            <Badge variant="outline" className="text-xs">
              {question.questionCategory}
            </Badge>
          )}
        </div>
        <CardContent className="p-6 md:p-8">
          <LatexPreview content={question.content} />
          {question.imageDataUrl && (
            <img
              src={question.imageDataUrl}
              alt="문제 이미지"
              className="mt-3 max-w-full rounded-md border"
            />
          )}
        </CardContent>
      </Card>

      {/* 답 입력 */}
      <div className="space-y-2">
        <p className="text-sm font-medium">
          {question.questionType === 'multiple' ? '번호를 선택하세요' : '답을 입력하세요'}
        </p>
        {question.questionType === 'multiple' ? (
          <MultipleChoiceInput
            selected={state.selectedAnswer}
            onSelect={(answer) => dispatch({ type: 'SELECT_ANSWER', answer })}
            disabled={false}
            choices={question.choices}
          />
        ) : (
          <ShortAnswerInput
            value={state.selectedAnswer}
            onChange={(value) => dispatch({ type: 'SELECT_ANSWER', answer: value })}
            disabled={false}
          />
        )}
      </div>

      {/* 제출 버튼 */}
      <Button
        className="w-full rounded-xl h-12 text-base font-bold"
        disabled={!state.selectedAnswer}
        onClick={handleSubmit}
      >
        제출
      </Button>
    </FadeIn>
  )
}
