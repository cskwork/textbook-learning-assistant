/**
 * 추천 학습 경로 카드 컴포넌트 — ANLZ-02
 *
 * 취약 유형 상위 3개를 우선순위 카드로 표시.
 * 순위별 강조: 1위(destructive/10 배경), 2위(warning/10 배경), 3위(muted 배경)
 */

import { ArrowRight } from 'lucide-react'
import { FadeIn } from '@/components/motion/FadeIn'

interface WeakCategory {
  category: string
  pL: number
}

interface LearningPathCardProps {
  weakCategories: WeakCategory[]
  onNavigate: (category: string) => void
}

/** 순위별 배경 색상 클래스 */
function getRankBg(rank: number): string {
  switch (rank) {
    case 1:
      return 'bg-destructive/10 border border-destructive/20'
    case 2:
      return 'bg-amber-500/10 border border-amber-500/20'
    case 3:
      return 'bg-muted/60 border border-muted'
    default:
      return 'bg-muted/40'
  }
}

/** 순위별 번호 색상 클래스 */
function getRankTextColor(rank: number): string {
  switch (rank) {
    case 1:
      return 'text-destructive'
    case 2:
      return 'text-amber-500'
    case 3:
      return 'text-muted-foreground'
    default:
      return 'text-muted-foreground'
  }
}

export function LearningPathCard({ weakCategories, onNavigate }: LearningPathCardProps) {
  const top3 = weakCategories.slice(0, 3)

  if (top3.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="text-2xl mb-2">🎉</div>
        <p className="text-sm font-medium text-foreground">모든 유형을 잘 이해하고 있습니다!</p>
        <p className="text-xs text-muted-foreground mt-1">꾸준히 유지하면서 어려운 문제에 도전해보세요</p>
      </div>
    )
  }

  return (
    <div className="space-y-2.5">
      {top3.map((item, index) => {
        const rank = index + 1
        const percent = Math.round(item.pL * 100)

        return (
          <FadeIn key={item.category} delay={index * 0.05}>
            <div className={`rounded-xl p-3 ${getRankBg(rank)}`}>
              <div className="flex items-center gap-3">
                {/* 순위 번호 */}
                <span className={`text-lg font-black leading-none shrink-0 ${getRankTextColor(rank)}`}>
                  {rank}
                </span>

                {/* 유형명 + 숙련도 */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{item.category}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">숙련도 {percent}%</p>
                </div>

                {/* 학습하기 버튼 */}
                <button
                  onClick={() => onNavigate(item.category)}
                  className="flex items-center gap-1 shrink-0 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                  aria-label={`${item.category} 학습하기`}
                >
                  학습하기
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </FadeIn>
        )
      })}
    </div>
  )
}
