/**
 * 유형별 마스터리 맵 컴포넌트 — ANLZ-02
 *
 * 각 유형의 숙련도를 가로 프로그레스 바로 시각화.
 * 레벨별 색상: mastery(emerald), proficient(primary), learning(amber), weak(destructive)
 */

import { AnimatedCard } from '@/components/motion/AnimatedCard'
import { FadeIn } from '@/components/motion/FadeIn'

interface MasteryItem {
  category: string
  pL: number
  total: number
  level: string
}

interface MasteryMapProps {
  data: MasteryItem[]
}

/** 레벨별 프로그레스 바 색상 클래스 */
function getLevelColor(level: string): string {
  switch (level) {
    case 'mastery':
      return 'bg-emerald-500'
    case 'proficient':
      return 'bg-primary'
    case 'learning':
      return 'bg-amber-400'
    case 'weak':
      return 'bg-destructive'
    default:
      return 'bg-muted-foreground'
  }
}

/** 레벨 한국어 라벨 */
function getLevelLabel(level: string): string {
  switch (level) {
    case 'mastery':
      return '숙달'
    case 'proficient':
      return '능숙'
    case 'learning':
      return '학습 중'
    case 'weak':
      return '취약'
    default:
      return level
  }
}

export function MasteryMap({ data }: MasteryMapProps) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <p className="text-sm text-muted-foreground">아직 풀이 데이터가 없습니다</p>
        <p className="text-xs text-muted-foreground/60 mt-1">문제를 풀면 유형별 숙련도가 표시됩니다</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {data.map((item, index) => {
        const percent = Math.round(item.pL * 100)
        const barColor = getLevelColor(item.level)
        const levelLabel = getLevelLabel(item.level)

        return (
          <FadeIn key={item.category} delay={index * 0.03}>
            <AnimatedCard className="px-4 py-3 border-none shadow-none bg-muted/20">
              <div className="flex items-center gap-3">
                {/* 유형명 */}
                <div className="min-w-[80px] max-w-[120px] shrink-0">
                  <span className="text-xs font-medium text-foreground truncate block">{item.category}</span>
                  <span className="text-[10px] text-muted-foreground">{levelLabel}</span>
                </div>

                {/* 프로그레스 바 */}
                <div className="flex-1 relative">
                  <div className="h-2.5 rounded-full bg-muted/50 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ease-out ${barColor}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                {/* 퍼센트 */}
                <div className="min-w-[36px] text-right shrink-0">
                  <span className="text-xs font-bold text-foreground">{percent}%</span>
                </div>
              </div>
            </AnimatedCard>
          </FadeIn>
        )
      })}
    </div>
  )
}
