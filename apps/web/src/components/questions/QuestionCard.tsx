// apps/web/src/components/questions/QuestionCard.tsx
// 문제 목록 카드 컴포넌트 — 미리보기 + 메타데이터 뱃지
import { Link } from 'react-router'
import { Card, CardContent } from '@/components/ui/card'
import { LatexPreview } from './LatexPreview'
import type { Question } from '@/lib/db'

interface QuestionCardProps {
  question: Question
  basePath?: string  // 기본값: '/instructor/problems'
}

const DIFFICULTY_LABELS: Record<number, string> = {
  1: '매우쉬움',
  2: '쉬움',
  3: '보통',
  4: '어려움',
  5: '매우어려움',
}

const DIFFICULTY_COLORS: Record<number, string> = {
  1: 'bg-green-100 text-green-700',
  2: 'bg-lime-100 text-lime-700',
  3: 'bg-yellow-100 text-yellow-700',
  4: 'bg-orange-100 text-orange-700',
  5: 'bg-red-100 text-red-700',
}

export function QuestionCard({ question, basePath = '/instructor/problems' }: QuestionCardProps) {
  // 미리보기용 텍스트 — 최대 100자 (LaTeX 수식 포함한 원본 텍스트 축약)
  const preview = question.content.length > 100
    ? question.content.slice(0, 100) + '...'
    : question.content

  const sourceLabel = question.source.year
    ? `${question.source.type} ${question.source.year}년${question.source.number ? ` ${question.source.number}번` : ''}`
    : question.source.type

  return (
    <Link to={`${basePath}/${question.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4 space-y-3">
          {/* 메타데이터 뱃지 행 */}
          <div className="flex flex-wrap gap-1.5">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
              {question.subject}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
              {question.unit}
            </span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${DIFFICULTY_COLORS[question.difficulty]}`}>
              {DIFFICULTY_LABELS[question.difficulty]}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
              {question.questionType === 'multiple' ? '객관식' : '단답형'}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground ml-auto">
              {sourceLabel}
            </span>
          </div>

          {/* 문제 본문 미리보기 */}
          <div className="text-sm line-clamp-3">
            <LatexPreview content={preview} />
          </div>

          {/* 이미지 있음 표시 */}
          {question.imageDataUrl && (
            <p className="text-xs text-muted-foreground">이미지 포함</p>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
