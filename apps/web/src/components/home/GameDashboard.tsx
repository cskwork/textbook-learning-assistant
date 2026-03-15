/**
 * GameDashboard — 반전 모드 홈 화면 상단 게임 스탯 위젯 그리드
 *
 * XP 바 / 레벨 / 스트릭 카운터 / 데일리 챌린지 미니 카드를
 * 네온 + 글래스모피즘 스타일로 표시.
 */

import { XPBar } from '@/components/gamification/XPBar'
import { GlassCard, NeonText } from '@/components/game/ui'
import { FlameIcon, StarIcon } from '@/components/game/icons'
import type { GamificationProfile } from '@/lib/db'

interface GameDashboardProps {
  profile: GamificationProfile
  xpProgress: number
  xpForNextLevel: number
  todayCount: number
  dailyGoal?: number
}

export function GameDashboard({
  profile,
  xpProgress,
  xpForNextLevel,
  todayCount,
  dailyGoal = 10,
}: GameDashboardProps) {
  const currentXPInLevel = profile.totalXP - (xpForNextLevel === Infinity ? 0 : Math.max(0, profile.totalXP - Math.floor(xpProgress * xpForNextLevel)))
  const dailyComplete = todayCount >= dailyGoal

  return (
    <div className="space-y-3">
      {/* XP 바 — 네온 오버라이드 래퍼 */}
      <GlassCard className="p-4">
        <div className="flex items-center gap-3 mb-2">
          <NeonText color="gold" glow="high" as="span" className="text-lg font-black">
            Lv.{profile.level}
          </NeonText>
          <span className="text-sm" style={{ color: 'var(--fun-text-secondary)' }}>
            총 {profile.totalXP.toLocaleString()} XP
          </span>
        </div>
        <XPBar
          progress={xpProgress}
          level={profile.level}
          currentXPInLevel={currentXPInLevel}
          xpForNextLevel={xpForNextLevel}
        />
      </GlassCard>

      {/* 스트릭 + 데일리 챌린지 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* 스트릭 카운터 */}
        <GlassCard className="p-4 flex items-center gap-3">
          <div className="shrink-0">
            <FlameIcon size={32} color="var(--fun-neon-gold)" glow />
          </div>
          <div>
            <NeonText color="gold" glow="medium" className="text-2xl font-black">
              {profile.streakDays}
            </NeonText>
            <p className="text-xs mt-0.5" style={{ color: 'var(--fun-text-secondary)' }}>
              일 연속 학습
            </p>
          </div>
        </GlassCard>

        {/* 데일리 챌린지 미니 */}
        <GlassCard className="p-4 flex items-center gap-3">
          <div className="shrink-0">
            <StarIcon
              size={32}
              color={dailyComplete ? 'var(--fun-neon-gold)' : 'var(--fun-neon-cyan)'}
              glow={dailyComplete}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs" style={{ color: 'var(--fun-text-secondary)' }}>
              오늘의 미션
            </p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <NeonText
                color={dailyComplete ? 'gold' : 'green'}
                glow="medium"
                className="text-xl font-black"
              >
                {todayCount}
              </NeonText>
              <span className="text-sm" style={{ color: 'var(--fun-text-muted)' }}>
                / {dailyGoal}
              </span>
            </div>
            {/* 진행 바 */}
            <div
              className="h-1.5 rounded-full mt-2 overflow-hidden"
              style={{ background: 'var(--fun-bg-card)' }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, (todayCount / dailyGoal) * 100)}%`,
                  background: dailyComplete
                    ? 'var(--fun-neon-gold)'
                    : 'linear-gradient(90deg, var(--fun-neon-cyan), var(--fun-neon-magenta))',
                  boxShadow: dailyComplete ? 'var(--fun-glow-gold)' : 'var(--fun-glow-cyan)',
                }}
              />
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
