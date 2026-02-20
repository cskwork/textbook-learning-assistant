// apps/web/src/components/quiz/TimerDisplay.tsx
// mm:ss 타이머 표시 컴포넌트 — 경과 시간에 따라 색상 경고
import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TimerDisplayProps {
  seconds: number
  formatted: string
  className?: string
}

export function TimerDisplay({ seconds, formatted, className }: TimerDisplayProps) {
  // 경과 시간에 따른 색상 변화 — 시각적 경고
  const colorClass =
    seconds >= 180
      ? 'text-red-500'      // 3분 이상 — 위험
      : seconds >= 60
        ? 'text-amber-500'  // 1분 이상 — 경고
        : 'text-foreground' // 기본

  return (
    <div className={cn('flex items-center gap-1.5', colorClass, className)}>
      <Clock className="h-4 w-4" />
      <span className="font-mono text-sm font-medium">{formatted}</span>
    </div>
  )
}
