/**
 * 빠른 학습 시작 CTA 버튼 영역
 *
 * 3개 버튼:
 *   1. 오답 복습 (rose) → /student/wrong-notes
 *   2. AI 추천 풀기 (violet) → onRandomQuiz 콜백
 *   3. 문제집 이어풀기 (blue) → /student/workbooks
 *
 * AnimatedCard 래퍼로 hover 마이크로 인터랙션 적용
 */

import { RotateCcw, Sparkles, BookOpen } from 'lucide-react'
import { Link } from 'react-router'
import { AnimatedCard } from '@/components/motion/AnimatedCard'

interface QuickActionButtonsProps {
  /** AI 추천 / 랜덤 문제 풀기 핸들러 */
  onRandomQuiz: () => void
  /** 오답노트 문제 수 (0이면 비활성화 표시) */
  wrongNoteCount: number
  /** 진행 중인 문제집 존재 여부 */
  hasWorkbookInProgress: boolean
}

export function QuickActionButtons({
  onRandomQuiz,
  wrongNoteCount,
  hasWorkbookInProgress: _hasWorkbookInProgress,
}: QuickActionButtonsProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {/* 오답 복습 */}
      <Link to="/student/wrong-notes" className="block">
        <AnimatedCard className="p-4 border-none bg-white dark:bg-card flex flex-col items-center gap-2 text-center">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-500/15 flex items-center justify-center">
            <RotateCcw className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          </div>
          <span className="text-xs font-bold text-rose-600 dark:text-rose-400 leading-tight">
            오답 복습
            {wrongNoteCount > 0 && (
              <span className="block text-[10px] font-normal text-muted-foreground mt-0.5">
                {wrongNoteCount}개
              </span>
            )}
          </span>
        </AnimatedCard>
      </Link>

      {/* AI 추천 풀기 */}
      <button type="button" onClick={onRandomQuiz} className="block w-full text-left">
        <AnimatedCard className="p-4 border-none bg-white dark:bg-card flex flex-col items-center gap-2 text-center">
          <div className="w-10 h-10 rounded-2xl bg-violet-50 dark:bg-violet-500/15 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          </div>
          <span className="text-xs font-bold text-violet-600 dark:text-violet-400 leading-tight">
            AI 추천 풀기
          </span>
        </AnimatedCard>
      </button>

      {/* 문제집 이어풀기 */}
      <Link to="/student/workbooks" className="block">
        <AnimatedCard className="p-4 border-none bg-white dark:bg-card flex flex-col items-center gap-2 text-center">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-500/15 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 leading-tight">
            문제집 이어풀기
          </span>
        </AnimatedCard>
      </Link>
    </div>
  )
}
