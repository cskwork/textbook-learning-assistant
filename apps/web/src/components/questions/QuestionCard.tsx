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
    <Link to={`${basePath}/${question.id}`} className="block">
      <Card className="rounded-2xl border-border/50 shadow-sm hover:shadow-md hover:border-border transition-all duration-300 hover:-translate-y-0.5 bg-white/80 dark:bg-card/60 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-5 space-y-4">
          {/* 메타데이터 뱃지 행 */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
              {question.subject}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-muted text-muted-foreground border border-border/50">
              {question.unit}
            </span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${DIFFICULTY_COLORS[question.difficulty]}`}>
              {DIFFICULTY_LABELS[question.difficulty]}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-muted text-muted-foreground border border-border/50">
              {question.questionType === 'multiple' ? '객관식' : '단답형'}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium text-muted-foreground ml-auto">
              {sourceLabel}
            </span>
          </div>

          {/* 문제 본문 미리보기 */}
          <div className="text-sm leading-relaxed text-foreground/90 line-clamp-3">
            <LatexPreview content={preview} />
          </div>

          {/* 이미지 있음 표시 */}
          {question.imageDataUrl && (
            <div className="flex items-center gap-1.5 mt-2">
              <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground/80 bg-muted/50 px-2 py-1 rounded">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                이미지 포함
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
