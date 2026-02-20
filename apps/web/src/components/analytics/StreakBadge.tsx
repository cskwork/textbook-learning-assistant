/**
 * 연속 학습 일수 뱃지 컴포넌트 (PLAN-03)
 *
 * Props: streak: { current: number; max: number }
 * UI:
 *   - Flame 아이콘 + "N일 연속" 텍스트
 *   - current > 0이면 오렌지 강조 (text-orange-500)
 *   - current === 0이면 회색
 *   - "최고 기록: N일" 서브텍스트
 *   - 인라인 뱃지 형태
 */

import { Flame } from 'lucide-react'

interface StreakBadgeProps {
  streak: { current: number; max: number }
}

export default function StreakBadge({ streak }: StreakBadgeProps) {
  const isActive = streak.current > 0

  return (
    <div className="flex flex-col items-end gap-0.5">
      {/* 메인 뱃지 */}
      <div
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${
          isActive
            ? 'bg-orange-50 text-orange-500 border border-orange-200'
            : 'bg-muted text-muted-foreground border border-muted'
        }`}
      >
        <Flame
          className={`h-4 w-4 ${isActive ? 'text-orange-500' : 'text-muted-foreground'}`}
          fill={isActive ? 'currentColor' : 'none'}
        />
        <span>{streak.current}일 연속</span>
      </div>
      {/* 최고 기록 서브텍스트 */}
      <span className="text-xs text-muted-foreground pr-1">
        최고 기록: {streak.max}일
      </span>
    </div>
  )
}
