/**
 * 학습 히스토리 타임라인 컴포넌트 — ANLZ-03
 *
 * 상단: 이번 주 vs 지난 주 주간 비교 카드
 * 하단: 최근 7일 일별 풀이 타임라인 (미니 바 + 정답률)
 */

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { FadeIn } from '@/components/motion/FadeIn'

/** dailyStats 항목 타입 */
export interface DailyStatData {
  date: string
  count: number
  correct: number
}

/** weeklyComparison 타입 */
export interface WeeklyComparisonData {
  thisWeek: { count: number; correct: number; accuracy: number }
  lastWeek: { count: number; correct: number; accuracy: number }
  changePercent: number
}

interface HistoryTimelineProps {
  dailyStats: DailyStatData[]
  weeklyComparison: WeeklyComparisonData
}

/** 날짜 문자열에서 MM/DD 요일 형식 반환 */
function formatDateLabel(dateStr: string): { date: string; day: string; isToday: boolean } {
  const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']
  const d = new Date(dateStr + 'T00:00:00') // 로컬 타임존 파싱
  const today = new Date()
  const isToday =
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()

  const month = String(d.getMonth() + 1).padStart(2, '0')
  const dayNum = String(d.getDate()).padStart(2, '0')
  const dayLabel = DAY_LABELS[d.getDay()]

  return {
    date: `${month}/${dayNum}`,
    day: dayLabel,
    isToday,
  }
}

export function HistoryTimeline({ dailyStats, weeklyComparison }: HistoryTimelineProps) {
  const { thisWeek, lastWeek, changePercent } = weeklyComparison

  // 최근 7일만 표시
  const recentDays = dailyStats.slice(-7)
  const maxCount = Math.max(...recentDays.map((d) => d.count), 1)
  const hasData = recentDays.some((d) => d.count > 0)

  return (
    <div className="space-y-4">
      {/* 주간 비교 카드 */}
      <FadeIn delay={0}>
        <div className="rounded-xl bg-muted/30 border border-border/50 p-4">
          <div className="flex items-start justify-between gap-4">
            {/* 이번 주 */}
            <div className="flex-1">
              <p className="text-[11px] font-medium text-muted-foreground mb-1">이번 주</p>
              <p className="text-base font-bold text-foreground">{thisWeek.count}문제</p>
              <p className="text-xs text-muted-foreground">정답률 {thisWeek.accuracy}%</p>
            </div>

            {/* 변화량 */}
            <div className="flex flex-col items-center justify-center px-2">
              {changePercent > 0 ? (
                <>
                  <TrendingUp className="h-5 w-5 text-emerald-500 mb-0.5" />
                  <span className="text-xs font-bold text-emerald-500">+{changePercent}%</span>
                  <span className="text-[10px] text-muted-foreground">향상</span>
                </>
              ) : changePercent < 0 ? (
                <>
                  <TrendingDown className="h-5 w-5 text-destructive mb-0.5" />
                  <span className="text-xs font-bold text-destructive">{changePercent}%</span>
                  <span className="text-[10px] text-muted-foreground">감소</span>
                </>
              ) : (
                <>
                  <Minus className="h-5 w-5 text-muted-foreground mb-0.5" />
                  <span className="text-xs font-medium text-muted-foreground">변화 없음</span>
                </>
              )}
            </div>

            {/* 지난 주 */}
            <div className="flex-1 text-right">
              <p className="text-[11px] font-medium text-muted-foreground mb-1">지난 주</p>
              <p className="text-base font-bold text-foreground">{lastWeek.count}문제</p>
              <p className="text-xs text-muted-foreground">정답률 {lastWeek.accuracy}%</p>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* 일별 타임라인 */}
      {!hasData ? (
        <FadeIn delay={0.05}>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <p className="text-sm text-muted-foreground">이번 주 학습 기록이 없습니다</p>
            <p className="text-xs text-muted-foreground/60 mt-1">문제를 풀면 학습 기록이 표시됩니다</p>
          </div>
        </FadeIn>
      ) : (
        <div className="space-y-1.5">
          {recentDays.map((stat, index) => {
            const { date, day, isToday } = formatDateLabel(stat.date)
            const barWidth = maxCount > 0 ? (stat.count / maxCount) * 100 : 0
            const accuracy = stat.count > 0 ? Math.round((stat.correct / stat.count) * 100) : 0

            return (
              <FadeIn key={stat.date} delay={0.05 + index * 0.03}>
                <div
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                    isToday ? 'bg-primary/5' : 'hover:bg-muted/30'
                  }`}
                >
                  {/* 날짜 + 요일 */}
                  <div className="w-[52px] shrink-0">
                    <span className={`text-xs ${isToday ? 'font-bold text-primary' : 'font-medium text-foreground'}`}>
                      {date}
                    </span>
                    <span className={`text-[10px] ml-1 ${isToday ? 'text-primary/70' : 'text-muted-foreground'}`}>
                      {isToday ? '오늘' : day}
                    </span>
                  </div>

                  {/* 풀이 수 미니 바 */}
                  <div className="flex-1 h-4 rounded-full bg-primary/20 overflow-hidden relative">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
                      style={{ width: `${barWidth}%` }}
                    />
                    {stat.count > 0 && (
                      <span className="absolute inset-0 flex items-center pl-2 text-[10px] font-semibold text-primary-foreground mix-blend-overlay">
                        {stat.count}문제
                      </span>
                    )}
                  </div>

                  {/* 정답률 */}
                  <div className="w-[36px] text-right shrink-0">
                    {stat.count > 0 ? (
                      <span className={`text-xs font-bold ${isToday ? 'text-primary' : 'text-foreground'}`}>
                        {accuracy}%
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground/40">-</span>
                    )}
                  </div>
                </div>
              </FadeIn>
            )
          })}
        </div>
      )}
    </div>
  )
}
