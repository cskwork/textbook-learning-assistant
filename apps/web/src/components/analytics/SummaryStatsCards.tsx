/**
 * 요약 통계 카드 컴포넌트 — 개별 컬러 악센트 디자인
 */

import { BookOpenCheck, Target, Clock, Flame } from 'lucide-react'

export interface OverallStats {
  total: number
  correct: number
  accuracy: number
  totalTimeSeconds: number
}

export interface StreakData {
  current: number
  max: number
}

interface SummaryStatsCardsProps {
  stats: OverallStats
  todayCount: number
  streak: StreakData
}

function formatMinutes(seconds: number): string {
  return `${Math.floor(seconds / 60)}분`
}

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string
  subLabel?: string
  accentClass: string
}

function StatCard({ icon, label, value, subLabel, accentClass }: StatCardProps) {
  return (
    <div className={accentClass}>
      <div className="rounded-2xl border-none shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 overflow-hidden relative group bg-white dark:bg-card p-4">
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[var(--stat-bg)]" />
        <div className="relative">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center mb-2.5"
            style={{ background: 'var(--stat-bg-strong)' }}
          >
            <span style={{ color: 'var(--stat-color)' }}>{icon}</span>
          </div>
          <div className="text-xl font-black tracking-tight leading-none mb-0.5" style={{ color: 'var(--stat-color)' }}>
            {value}
          </div>
          <div className="text-[11px] font-medium text-muted-foreground tracking-wide">{label}</div>
          {subLabel && (
            <div className="text-[10px] text-muted-foreground/60 mt-0.5">{subLabel}</div>
          )}
        </div>
      </div>
    </div>
  )
}

export function SummaryStatsCards({ stats, todayCount, streak }: SummaryStatsCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <StatCard
        icon={<BookOpenCheck className="h-4 w-4" />}
        label="총 풀이 수"
        value={`${stats.total.toLocaleString()}문제`}
        subLabel={`정답 ${stats.correct.toLocaleString()}문제`}
        accentClass="stat-accent-blue"
      />

      <StatCard
        icon={<Target className="h-4 w-4" />}
        label="전체 정답률"
        value={`${stats.accuracy}%`}
        subLabel={stats.total === 0 ? '풀이 데이터 없음' : `${stats.correct}/${stats.total} 정답`}
        accentClass="stat-accent-emerald"
      />

      <StatCard
        icon={<Clock className="h-4 w-4" />}
        label="학습 시간"
        value={formatMinutes(stats.totalTimeSeconds)}
        subLabel="총 누적 학습 시간"
        accentClass="stat-accent-amber"
      />

      <StatCard
        icon={<Flame className="h-4 w-4" />}
        label="오늘 풀이"
        value={`${todayCount}문제`}
        subLabel={streak.current > 0 ? `${streak.current}일 연속 학습` : '오늘 첫 학습'}
        accentClass="stat-accent-rose"
      />
    </div>
  )
}
