/**
 * AchievementTracker -- 진행 중인 업적 목록
 *
 * Badge checkCondition 기반 달성 여부 표시.
 * threshold가 없으므로 단순 달성/미달성 + 카테고리별 현재 값 표시.
 */

import { GlassCard, NeonText } from '@/components/game/ui'
import { BADGE_DEFINITIONS } from '@/lib/gamification/badge-definitions'
import type { BadgeRecord, GamificationProfile } from '@/lib/db'

interface AchievementTrackerProps {
  badges: BadgeRecord[]
  profile: GamificationProfile
  className?: string
}

export function AchievementTracker({ badges, profile, className = '' }: AchievementTrackerProps) {
  const earnedIds = new Set(badges.map(b => b.badgeId))

  // 미획득 뱃지 목록
  const pendingAchievements = BADGE_DEFINITIONS
    .filter(def => !earnedIds.has(def.id))
    .map(def => {
      let relevantStat = 0
      if (def.category === 'streak') relevantStat = profile.streakDays
      else if (def.category === 'study') relevantStat = profile.totalXP
      else relevantStat = profile.level
      return { ...def, relevantStat }
    })
    .sort((a, b) => b.relevantStat - a.relevantStat)
    .slice(0, 5)

  if (pendingAchievements.length === 0) {
    return (
      <GlassCard className={`p-6 text-center ${className}`}>
        <NeonText color="gold" glow="medium" className="text-base font-bold">
          모든 업적을 달성했습니다!
        </NeonText>
      </GlassCard>
    )
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {pendingAchievements.map(ach => (
        <GlassCard key={ach.id} className="p-3 flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{
              border: '2px solid var(--fun-glass-border)',
              background: 'var(--fun-bg-card)',
              opacity: 0.5,
            }}
          >
            <span className="text-lg">{ach.icon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate" style={{ color: 'var(--fun-text-primary)' }}>
              {ach.name}
            </p>
            <p className="text-[10px] mt-0.5" style={{ color: 'var(--fun-text-muted)' }}>
              {ach.description}
            </p>
          </div>
          <NeonText color="cyan" glow="low" className="text-xs font-bold shrink-0">
            미달성
          </NeonText>
        </GlassCard>
      ))}
    </div>
  )
}
