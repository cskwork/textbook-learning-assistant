// apps/web/src/components/questions/QuestionCard.tsx
// 문제 목록 카드 컴포넌트 — AnimatedCard + 난이도 색상 뱃지 + 미리보기
import { Link } from 'react-router'
import { AnimatedCard } from '@/components/motion/AnimatedCard'
import { LatexPreview } from './LatexPreview'
import type { Question } from '@/lib/db'

interface QuestionCardProps {
  question: Question
  basePath?: string  // 기본값: '/instructor/problems' — 강사/학생 양쪽에서 재사용
}

const DIFFICULTY_LABELS: Record<number, string> = {
  1: '매우쉬움',
  2: '쉬움',
  3: '보통',
  4: '어려움',
  5: '매우어려움',
}

// 시맨틱 색상 코딩 — 난이도별 직관적 색상
const DIFFICULTY_COLORS: Record<number, string> = {
  1: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
  2: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
  3: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400',
  4: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400',
  5: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
}

export function QuestionCard({ question, basePath = '/instructor/problems' }: QuestionCardProps) {
  const sourceLabel = question.source.year
    ? `${question.source.type} ${question.source.year}년${question.source.number ? ` ${question.source.number}번` : ''}`
    : question.source.type

  return (
    <Link to={`${basePath}/${question.id}`} className="block">
      <AnimatedCard className="border border-border/50 shadow-sm hover:shadow-md hover:border-border bg-white/80 dark:bg-card/60 backdrop-blur-sm overflow-hidden">
        <div className="p-4 md:p-5 space-y-3">
          {/* 상단 영역: 과목 뱃지 + 문제유형 뱃지 */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
              {question.subject}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-muted/60 text-muted-foreground border border-border/40">
              {question.questionType === 'multiple' ? '객관식' : '단답형'}
            </span>
          </div>

          {/* 본문 영역: 문제 미리보기 */}
          <div className="text-sm leading-relaxed text-foreground/80 line-clamp-2">
            <LatexPreview content={question.content} />
          </div>

          {/* 하단 메타 영역 */}
          <div className="flex items-center justify-between gap-2">
            {/* 좌측: 단원 + 출처 */}
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs text-muted-foreground truncate">
                {question.unit}
              </span>
              <span className="text-xs text-muted-foreground/60 shrink-0">
                {sourceLabel}
              </span>
            </div>

            {/* 우측: 난이도 뱃지 */}
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold shrink-0 ${DIFFICULTY_COLORS[question.difficulty]}`}>
              {DIFFICULTY_LABELS[question.difficulty]}
            </span>
          </div>

          {/* 이미지 있음 표시 */}
          {question.imageDataUrl && (
            <div className="flex items-center gap-1.5">
              <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground/80 bg-muted/50 px-2 py-1 rounded">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                이미지 포함
              </span>
            </div>
          )}
        </div>
      </AnimatedCard>
    </Link>
  )
}
