// apps/web/src/components/quiz/QuizResult.tsx
// 채점 결과 표시 — 정오답 배지 + 정답 표시 + LatexPreview 해설
import { CheckCircle2, XCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LatexPreview } from '@/components/questions/LatexPreview'
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

export function QuizResult({
  question,
  userAnswer,
  isCorrect,
  timeSpent,
  onRetry,
  onNext,
  onBack,
}: QuizResultProps) {
  return (
    <div className="space-y-4">
      {/* 정오답 배지 + 소요 시간 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isCorrect ? (
            <>
              <CheckCircle2 className="h-6 w-6 text-green-500" />
              <span className="text-lg font-semibold text-green-600">정답입니다!</span>
            </>
          ) : (
            <>
              <XCircle className="h-6 w-6 text-red-500" />
              <span className="text-lg font-semibold text-red-600">오답입니다</span>
            </>
          )}
        </div>
        <div className="text-muted-foreground flex items-center gap-1.5 text-sm">
          <Clock className="h-4 w-4" />
          <span>{timeSpent}초</span>
        </div>
      </div>

      {/* 정답 카드 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">정답 확인</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {!isCorrect && (
            <div className="text-sm">
              <span className="text-muted-foreground">내 답: </span>
              <span className="text-red-600 font-medium">{userAnswer}</span>
            </div>
          )}
          <div className="text-sm">
            <span className="text-muted-foreground">정답: </span>
            <span className="text-green-600 font-medium">{question.answer}</span>
          </div>
        </CardContent>
      </Card>

      {/* 해설 카드 */}
      {question.explanation && (
        <Card>
          <CardHeader>
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
      )}

      {/* 버튼 행 */}
      <div className="flex flex-wrap gap-2">
        {onRetry && (
          <Button variant="outline" onClick={onRetry}>
            다시 풀기
          </Button>
        )}
        {onNext && (
          <Button onClick={onNext}>
            다음 문제
          </Button>
        )}
        {onBack && (
          <Button variant="ghost" onClick={onBack}>
            문제 목록
          </Button>
        )}
      </div>
    </div>
  )
}
