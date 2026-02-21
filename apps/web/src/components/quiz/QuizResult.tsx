// apps/web/src/components/quiz/QuizResult.tsx
// 채점 결과 표시 — 정답 체크 spring 애니메이션 + 오답 흔들림 + 점수 카운트업
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, Clock, RotateCcw, ChevronRight, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LatexPreview } from '@/components/questions/LatexPreview'
import { FadeIn } from '@/components/motion/FadeIn'
import type { Question } from '@/lib/db'

interface QuizResultProps {
  question: Question
  userAnswer: string
  isCorrect: boolean
  timeSpent: number
  onRetry?: () => void  // 오답노트 재풀이 시 사용
  onNext?: () => void   // 다음 문제로 이동
  onBack?: () => void   // 문제 목록으로 돌아가기
}

// 오답 흔들림 아이콘 — scale spring + x shake 순차 애니메이션
function ShakeIcon() {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1, x: [0, -10, 10, -10, 10, 0] }}
      transition={{
        scale: { type: 'spring', stiffness: 200, damping: 15 },
        x: { duration: 0.5, delay: 0.3 },
      }}
    >
      <XCircle className="h-16 w-16 text-destructive" />
    </motion.div>
  )
}

// 카운트업 훅 — 0에서 target까지 애니메이션
function useCountUp(target: number, duration = 800) {
  const [count, setCount] = useState(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const startTime = performance.now()
    const startVal = 0

    function tick(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // easeOut cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(startVal + (target - startVal) * eased))

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [target, duration])

  return count
}

export function QuizResult({
  question,
  userAnswer,
  isCorrect,
  timeSpent,
  onRetry,
  onNext,
  onBack,
}: QuizResultProps) {
  const animatedTime = useCountUp(timeSpent, 800)

  return (
    <AnimatePresence>
      <motion.div
        key="quiz-result"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className={[
          'relative space-y-4 rounded-2xl p-1',
          isCorrect ? 'bg-success/5' : 'bg-destructive/5',
        ].join(' ')}
      >
        {/* 정오답 아이콘 + 텍스트 (중앙 대형) */}
        <div className="flex flex-col items-center py-6 gap-3">
          {isCorrect ? (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              <CheckCircle2 className="h-16 w-16 text-success" />
            </motion.div>
          ) : (
            <ShakeIcon />
          )}
          <p className={[
            'text-xl font-bold',
            isCorrect ? 'text-success' : 'text-destructive',
          ].join(' ')}>
            {isCorrect ? '정답입니다!' : '오답입니다'}
          </p>

          {/* 소요 시간 카운트업 */}
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{animatedTime}초</span>
          </div>
        </div>

        {/* 정답 확인 카드 */}
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">정답 확인</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {!isCorrect && (
              <div className="text-sm">
                <span className="text-muted-foreground">내 답: </span>
                <span className="text-destructive font-medium">{userAnswer}</span>
              </div>
            )}
            <div className="text-sm">
              <span className="text-muted-foreground">정답: </span>
              <span className="text-success font-medium">{question.answer}</span>
            </div>
          </CardContent>
        </Card>

        {/* 해설 카드 */}
        {question.explanation && (
          <FadeIn delay={0.3}>
            <Card className="rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">해설</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <LatexPreview content={question.explanation} />
                {question.explanationImageDataUrl && (
                  <img
                    src={question.explanationImageDataUrl}
                    alt="해설 이미지"
                    className="max-w-full rounded-md border"
                  />
                )}
              </CardContent>
            </Card>
          </FadeIn>
        )}

        {/* 버튼 행 */}
        <div className="flex flex-wrap gap-2">
          {onRetry && (
            <Button variant="outline" className="rounded-xl" onClick={onRetry}>
              <RotateCcw className="h-4 w-4 mr-1.5" />
              다시 풀기
            </Button>
          )}
          {onNext && (
            <Button className="rounded-xl flex-1" onClick={onNext}>
              다음 문제
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
          {onBack && (
            <Button variant="ghost" className="rounded-xl" onClick={onBack}>
              <List className="h-4 w-4 mr-1.5" />
              문제 목록
            </Button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
