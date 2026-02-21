// apps/web/src/components/quiz/QuizPlayer.tsx
// 퀴즈 세션 핵심 컴포넌트 — 문제 표시, 답 입력, 타이머, 제출, 채점 결과
// useReducer 기반 playing → submitted 상태 머신
import { useReducer, useEffect } from 'react'
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
  questionIndex?: number    // 현재 문제 번호 (0-based, optional)
  totalQuestions?: number   // 전체 문제 수 (optional)
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
}: QuizPlayerProps) {
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
  const showIndicator = questionIndex !== undefined && totalQuestions !== undefined

  return (
    <FadeIn className="space-y-4">
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
