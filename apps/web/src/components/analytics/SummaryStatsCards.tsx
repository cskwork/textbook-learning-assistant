/**
 * 요약 통계 카드 컴포넌트 (REPT-04)
 *
 * Props:
 *   stats: { total: number; correct: number; accuracy: number; totalTimeSeconds: number }
 *   todayCount: number  (오늘 풀이 수)
 *   streak: { current: number; max: number }
 *
 * 카드 4개:
 *   1. 총 풀이 수 (BookOpenCheck)
 *   2. 전체 정답률 (Target)
 *   3. 학습 시간 (Clock) — 분 단위
 *   4. 오늘 풀이 수 (Flame)
 */

import { BookOpenCheck, Target, Clock, Flame } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

/** 전체 학습 통계 타입 */
export interface OverallStats {
  total: number
  correct: number
  accuracy: number
  totalTimeSeconds: number
}

/** 스트릭 데이터 타입 */
export interface StreakData {
  current: number
  max: number
}

interface SummaryStatsCardsProps {
  stats: OverallStats
  todayCount: number
  streak: StreakData
}

/** 초 → 분 변환 */
function formatMinutes(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  return `${minutes}분`
}

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string
  subLabel?: string
  highlight?: boolean
}

function StatCard({ icon, label, value, subLabel, highlight }: StatCardProps) {
  return (
    <Card className={highlight ? 'border-primary/30 bg-primary/5' : undefined}>
      <CardContent className="pt-4 pb-4 px-4">
        <div className="flex items-center gap-2 text-muted-foreground mb-2">
          {icon}
          <span className="text-xs font-medium">{label}</span>
        </div>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {subLabel && (
          <div className="text-xs text-muted-foreground mt-1">{subLabel}</div>
        )}
      </CardContent>
    </Card>
  )
}

export function SummaryStatsCards({ stats, todayCount, streak }: SummaryStatsCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {/* 카드 1: 총 풀이 수 */}
      <StatCard
        icon={<BookOpenCheck className="h-4 w-4" />}
        label="총 풀이 수"
        value={`${stats.total.toLocaleString()}문제`}
        subLabel={`정답 ${stats.correct.toLocaleString()}문제`}
      />

      {/* 카드 2: 전체 정답률 */}
      <StatCard
        icon={<Target className="h-4 w-4" />}
        label="전체 정답률"
        value={`${stats.accuracy}%`}
        subLabel={stats.total === 0 ? '풀이 데이터 없음' : `${stats.correct}/${stats.total} 정답`}
        highlight={stats.accuracy >= 80}
      />

      {/* 카드 3: 학습 시간 */}
      <StatCard
        icon={<Clock className="h-4 w-4" />}
        label="학습 시간"
        value={formatMinutes(stats.totalTimeSeconds)}
        subLabel="총 누적 학습 시간"
      />

      {/* 카드 4: 오늘 풀이 수 */}
      <StatCard
        icon={<Flame className="h-4 w-4" />}
        label="오늘 풀이"
        value={`${todayCount}문제`}
        subLabel={streak.current > 0 ? `${streak.current}일 연속 학습` : '오늘 첫 학습'}
        highlight={todayCount > 0}
      />
    </div>
  )
}
