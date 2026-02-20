// apps/web/src/components/quiz/QuizPlayer.tsx
// 퀴즈 세션 핵심 컴포넌트 — 문제 표시, 답 입력, 타이머, 제출, 채점 결과
// useReducer 기반 playing → submitted 상태 머신
import { useReducer, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { LatexPreview } from '@/components/questions/LatexPreview'
import { TimerDisplay } from '@/components/quiz/TimerDisplay'
import { MultipleChoiceInput } from '@/components/quiz/MultipleChoiceInput'
import { ShortAnswerInput } from '@/components/quiz/ShortAnswerInput'
import { QuizResult } from '@/components/quiz/QuizResult'
import { useTimer } from '@/hooks/useTimer'
import { submitQuizAttempt } from '@/services/quiz.service'
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

interface QuizPlayerProps {
  question: Question
  studentId: string
  onComplete?: (isCorrect: boolean) => void  // 채점 완료 콜백 (오답노트 UI에서 활용)
  onNext?: () => void   // 다음 문제 버튼 콜백
  onBack?: () => void   // 문제 목록으로 돌아가기 콜백
}

// ─── 컴포넌트 ────────────────────────────────────────────────────────────────

export function QuizPlayer({ question, studentId, onComplete, onNext, onBack }: QuizPlayerProps) {
  const [state, dispatch] = useReducer(quizReducer, {
    phase: 'playing',
    selectedAnswer: '',
    isCorrect: null,
    timeSpent: 0,
  })

  const timer = useTimer()

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
  return (
    <div className="space-y-4">
      {/* 타이머 */}
      <div className="flex justify-end">
        <TimerDisplay seconds={timer.seconds} formatted={timer.formatted} />
      </div>

      {/* 문제 본문 */}
      <Card>
        <CardContent className="pt-6">
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
        className="w-full"
        disabled={!state.selectedAnswer}
        onClick={handleSubmit}
      >
        제출
      </Button>
    </div>
  )
}
